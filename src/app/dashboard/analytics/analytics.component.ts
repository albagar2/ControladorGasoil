import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { ExportService } from '../../core/services/export.service';
import { NgChartsModule } from 'ng2-charts';
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

    // Monthly navigation
    selectedMonth = signal<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM

    exportData() {
        this.exportService.generateCostReport(
            this.dataService.vehicles(),
            this.dataService.refuels(),
            this.dataService.maintenances()
        );
    }

    totalSpent = computed(() => {
        const month = this.selectedMonth();
        const refuels = this.dataService.refuels().filter(r => new Date(r.fecha).toISOString().startsWith(month));
        const maintenances = this.dataService.maintenances().filter(m => new Date(m.fecha).toISOString().startsWith(month));

        const fuelCost = refuels.reduce((acc, r) => acc + (Number(r.costeTotal) || 0), 0);
        const maintCost = maintenances.reduce((acc, m) => acc + (Number(m.costePieza) || 0) + (Number(m.costeTaller) || 0), 0);
        return fuelCost + maintCost;
    });

    averageEfficiency = computed(() => {
        const month = this.selectedMonth();
        const allRefuels = this.dataService.refuels();
        // Efficiency needs historical context to calculate KM difference, 
        // but we'll scope the "usage" (liters) and "traveled" to current context if possible
        // For simplicity as requested, we'll filter refuels of the month
        const refuels = allRefuels.filter(r => new Date(r.fecha).toISOString().startsWith(month));

        if (refuels.length < 1) return 0;

        const totalLiters = refuels.reduce((acc, r) => acc + Number(r.litros), 0);

        // Find the refuel immediately before this month to get starting KM
        const sortedAll = [...allRefuels].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        const firstOfMonth = refuels.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];
        const lastOfMonth = refuels.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

        const index = sortedAll.findIndex(r => r.id === firstOfMonth.id);
        const startKm = index > 0 ? sortedAll[index - 1].kilometraje : firstOfMonth.kilometraje;
        const endKm = lastOfMonth.kilometraje;
        const totalKm = endKm - startKm;

        return totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;
    });

    // Chart Data: Expenditure by Month
    public lineChartData = computed<ChartData<'line'>>(() => {
        const refuels = this.dataService.refuels();
        const maintenances = this.dataService.maintenances();
        const monthlyData: Record<string, number> = {};

        // Group everything by month
        refuels.forEach(r => {
            const date = new Date(r.fecha);
            const key = date.toLocaleString('default', { month: 'short' });
            monthlyData[key] = (monthlyData[key] || 0) + (r.costeTotal || 0);
        });

        maintenances.forEach(m => {
            const date = new Date(m.fecha);
            const key = date.toLocaleString('default', { month: 'short' });
            monthlyData[key] = (monthlyData[key] || 0) + (m.costePieza || 0) + (m.costeTaller || 0);
        });

        const labels = Object.keys(monthlyData);
        return {
            labels,
            datasets: [
                {
                    data: labels.map(l => monthlyData[l]),
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

    // Chart Data: Share by vehicle (Computed & Monthly)
    public pieChartData = computed<ChartData<'pie'>>(() => {
        const month = this.selectedMonth();
        const vehicles = this.dataService.vehicles();
        const refuels = this.dataService.refuels().filter(r => new Date(r.fecha).toISOString().startsWith(month));

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

    get monthName(): string {
        const [year, month] = this.selectedMonth().split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    monthlyRecordsCount = computed(() => {
        const month = this.selectedMonth();
        const refuels = this.dataService.refuels().filter(r => new Date(r.fecha).toISOString().startsWith(month));
        const maintenances = this.dataService.maintenances().filter(m => new Date(m.fecha).toISOString().startsWith(month));
        return refuels.length + maintenances.length;
    });

    prevMonth() {
        const [year, month] = this.selectedMonth().split('-').map(Number);
        const date = new Date(year, month - 2, 1);
        this.selectedMonth.set(date.toISOString().substring(0, 7));
    }

    nextMonth() {
        const [year, month] = this.selectedMonth().split('-').map(Number);
        const date = new Date(year, month, 1);
        this.selectedMonth.set(date.toISOString().substring(0, 7));
    }
}
