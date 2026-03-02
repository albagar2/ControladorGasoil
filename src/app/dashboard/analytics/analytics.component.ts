import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
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

    totalSpent = computed(() => {
        const refuels = this.dataService.refuels();
        const maintenances = this.dataService.maintenances();
        const fuelCost = refuels.reduce((acc, r) => acc + (r.costeTotal || 0), 0);
        const maintCost = maintenances.reduce((acc, m) => acc + (m.costePieza || 0) + (m.costeTaller || 0), 0);
        return fuelCost + maintCost;
    });

    averageEfficiency = computed(() => {
        const refuels = this.dataService.refuels();
        if (refuels.length < 2) return 0;

        // Simplistic calculation: (Sum of Liters / Total KM traveled) * 100
        // Better: Per vehicle average
        const totalLiters = refuels.reduce((acc, r) => acc + r.litros, 0);
        const sorted = [...refuels].sort((a, b) => a.kilometraje - b.kilometraje);
        const totalKm = sorted[sorted.length - 1].kilometraje - sorted[0].kilometraje;

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

    // Chart Data: Share by vehicle
    public pieChartData: ChartData<'pie'> = {
        labels: [],
        datasets: [{ data: [], backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9'] }]
    };

    ngOnInit() {
        this.prepareChartData();
    }

    prepareChartData() {
        // We still use prepareChartData for Pie chart as it's not computed yet (could be refactored too)
        const vehicles = this.dataService.vehicles();
        const refuels = this.dataService.refuels();

        const vehicleLabels: string[] = [];
        const vehicleData: number[] = [];

        vehicles.forEach(v => {
            const spent = refuels
                .filter(r => r.vehiculoId === v.id)
                .reduce((acc, r) => acc + (r.costeTotal || 0), 0);

            if (spent > 0) {
                vehicleLabels.push(v.modelo);
                vehicleData.push(spent);
            }
        });

        this.pieChartData = {
            labels: vehicleLabels,
            datasets: [{
                data: vehicleData,
                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9']
            }]
        };
    }
}
