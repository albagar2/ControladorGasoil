import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
    private dataService = inject(DataService);

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
    public lineChartData: ChartData<'line'> = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                data: [65, 59, 80, 81, 56, 55, 40],
                label: 'Gastos Combustible (€)',
                fill: true,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4
            }
        ]
    };

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
        const vehicles = this.dataService.vehicles();
        const refuels = this.dataService.refuels();

        // Pie Chart: Expenditure per vehicle
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
