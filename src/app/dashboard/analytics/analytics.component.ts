import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { ExportService } from '../../core/services/export.service';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData, ChartType } from 'chart.js';

Chart.register(...registerables);

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule, NgChartsModule],
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
    public dataService = inject(DataService);
    private exportService = inject(ExportService);

    @ViewChild('lineChart') lineChart?: BaseChartDirective;
    @ViewChild('pieChart') pieChart?: BaseChartDirective;

    // Time period filtering
    filterMode = signal<'month' | 'year'>('month');
    selectedPeriod = signal<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM or YYYY

    setFilterMode(mode: 'month' | 'year') {
        this.filterMode.set(mode);
        const currentDate = new Date();
        if (mode === 'month') {
            this.selectedPeriod.set(currentDate.toISOString().substring(0, 7));
        } else {
            this.selectedPeriod.set(currentDate.getFullYear().toString());
        }
    }

    exportData() {
        let year: number, month: number | null = null;
        if (this.filterMode() === 'month') {
            [year, month] = this.selectedPeriod().split('-').map(Number);
        } else {
            year = Number(this.selectedPeriod());
        }

        const filteredRefuels = this.dataService.refuels().filter(r => {
            const d = new Date(r.fecha);
            return this.filterMode() === 'month'
                ? d.getFullYear() === year && (d.getMonth() + 1) === month
                : d.getFullYear() === year;
        });

        const filteredMaintenances = this.dataService.maintenances().filter(m => {
            const d = new Date(m.fecha);
            return this.filterMode() === 'month'
                ? d.getFullYear() === year && (d.getMonth() + 1) === month
                : d.getFullYear() === year;
        });

        const lineChartImage = this.lineChart?.chart?.toBase64Image();
        const pieChartImage = this.pieChart?.chart?.toBase64Image();

        this.exportService.generateCostReport(
            this.dataService.vehicles(),
            filteredRefuels,
            filteredMaintenances,
            `Informe de Gastos - ${this.currentPeriodName}`,
            [
                { image: lineChartImage, title: 'Histórico de Gastos' },
                { image: pieChartImage, title: `Desglose de Gastos - ${this.currentPeriodName}` }
            ].filter(img => !!img.image) as { image: string, title: string }[]
        );
    }

    totalSpent = computed(() => {
        let year: number, month: number | null = null;
        if (this.filterMode() === 'month') {
            [year, month] = this.selectedPeriod().split('-').map(Number);
        } else {
            year = Number(this.selectedPeriod());
        }

        const refuels = this.dataService.refuels().filter(r => {
            const d = new Date(r.fecha);
            return this.filterMode() === 'month'
                ? d.getFullYear() === year && (d.getMonth() + 1) === month
                : d.getFullYear() === year;
        });
        const maintenances = this.dataService.maintenances().filter(m => {
            const d = new Date(m.fecha);
            return this.filterMode() === 'month'
                ? d.getFullYear() === year && (d.getMonth() + 1) === month
                : d.getFullYear() === year;
        });

        const fuelCost = refuels.reduce((acc, r) => acc + (Number(r.costeTotal) || 0), 0);
        const maintCost = maintenances.reduce((acc, m) => acc + (Number(m.costePieza) || 0) + (Number(m.costeTaller) || 0), 0);
        return fuelCost + maintCost;
    });

    averageEfficiency = computed(() => {
        let year: number, month: number | null = null;
        if (this.filterMode() === 'month') {
            [year, month] = this.selectedPeriod().split('-').map(Number);
        } else {
            year = Number(this.selectedPeriod());
        }

        const allRefuels = this.dataService.refuels();
        const refuels = allRefuels.filter(r => {
            const d = new Date(r.fecha);
            return this.filterMode() === 'month'
                ? d.getFullYear() === year && (d.getMonth() + 1) === month
                : d.getFullYear() === year;
        });

        if (refuels.length < 1) return 0;

        const totalLiters = refuels.reduce((acc, r) => acc + Number(r.litros), 0);

        const sortedAll = [...allRefuels].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        const firstOfPeriod = refuels.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];
        const lastOfPeriod = refuels.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

        const index = sortedAll.findIndex(r => r.id === firstOfPeriod.id);
        const startKm = index > 0 ? sortedAll[index - 1].kilometraje : firstOfPeriod.kilometraje;
        const endKm = lastOfPeriod.kilometraje;
        const totalKm = endKm - startKm;

        return totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;
    });

    // Chart Data: Expenditure by Time
    public lineChartData = computed<ChartData<'line'>>(() => {
        const refuels = this.dataService.refuels();
        const maintenances = this.dataService.maintenances();
        const periodData: Record<string, number> = {};

        // Group everything by 'YYYY-MM' or 'YYYY' to ensure chronological sorting
        refuels.forEach(r => {
            const date = new Date(r.fecha);
            const key = this.filterMode() === 'month'
                ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
                : `${date.getFullYear()}`;
            periodData[key] = (periodData[key] || 0) + (Number(r.costeTotal) || 0);
        });

        maintenances.forEach(m => {
            const date = new Date(m.fecha);
            const key = this.filterMode() === 'month'
                ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
                : `${date.getFullYear()}`;
            periodData[key] = (periodData[key] || 0) + (Number(m.costePieza) || 0) + (Number(m.costeTaller) || 0);
        });

        const sortedKeys = Object.keys(periodData).sort();

        const labels = sortedKeys.map(key => {
            if (this.filterMode() === 'month') {
                const [year, month] = key.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            } else {
                return key; // Just the year
            }
        });

        return {
            labels,
            datasets: [
                {
                    data: sortedKeys.map(key => periodData[key]),
                    label: 'Gastos Totales (€)',
                    fill: true,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.4
                }
            ]
        };
    });

    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true }
        }
    };

    // Chart Data: Share by vehicle
    public pieChartData = computed<ChartData<'pie'>>(() => {
        let year: number, month: number | null = null;
        if (this.filterMode() === 'month') {
            [year, month] = this.selectedPeriod().split('-').map(Number);
        } else {
            year = Number(this.selectedPeriod());
        }

        const vehicles = this.dataService.vehicles();
        const refuels = this.dataService.refuels().filter(r => {
            const d = new Date(r.fecha);
            return this.filterMode() === 'month'
                ? d.getFullYear() === year && (d.getMonth() + 1) === month
                : d.getFullYear() === year;
        });

        const vehicleLabels: string[] = [];
        const vehicleData: number[] = [];

        vehicles.forEach(v => {
            const spent = refuels
                .filter(r => r.vehiculoId === v.id)
                .reduce((acc, r) => acc + (Number(r.costeTotal) || 0), 0);

            if (spent > 0) {
                vehicleLabels.push(v.modelo);
                vehicleData.push(spent);
            }
        });

        return {
            labels: vehicleLabels,
            datasets: [{
                data: vehicleData,
                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9']
            }]
        };
    });

    ngOnInit() {
        // No manual trigger needed, using computed
    }

    get currentPeriodName(): string {
        if (this.filterMode() === 'month') {
            const [year, month] = this.selectedPeriod().split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        } else {
            return `Año ${this.selectedPeriod()}`;
        }
    }

    periodRecordsCount = computed(() => {
        let year: number, month: number | null = null;
        if (this.filterMode() === 'month') {
            [year, month] = this.selectedPeriod().split('-').map(Number);
        } else {
            year = Number(this.selectedPeriod());
        }

        const refuels = this.dataService.refuels().filter(r => {
            const d = new Date(r.fecha);
            return this.filterMode() === 'month'
                ? d.getFullYear() === year && (d.getMonth() + 1) === month
                : d.getFullYear() === year;
        });
        const maintenances = this.dataService.maintenances().filter(m => {
            const d = new Date(m.fecha);
            return this.filterMode() === 'month'
                ? d.getFullYear() === year && (d.getMonth() + 1) === month
                : d.getFullYear() === year;
        });
        return refuels.length + maintenances.length;
    });

    prevPeriod() {
        if (this.filterMode() === 'month') {
            const [year, month] = this.selectedPeriod().split('-').map(Number);
            const date = new Date(year, month - 2, 1);
            const newYear = date.getFullYear();
            const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
            this.selectedPeriod.set(`${newYear}-${newMonth}`);
        } else {
            const year = Number(this.selectedPeriod());
            this.selectedPeriod.set((year - 1).toString());
        }
    }

    nextPeriod() {
        if (this.filterMode() === 'month') {
            const [year, month] = this.selectedPeriod().split('-').map(Number);
            const date = new Date(year, month, 1);
            const newYear = date.getFullYear();
            const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
            this.selectedPeriod.set(`${newYear}-${newMonth}`);
        } else {
            const year = Number(this.selectedPeriod());
            this.selectedPeriod.set((year + 1).toString());
        }
    }
}
