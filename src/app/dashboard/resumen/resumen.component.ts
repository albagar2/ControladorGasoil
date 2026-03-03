import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { ExportService } from '../../core/services/export.service';

@Component({
    selector: 'app-resumen',
    standalone: true,
    imports: [CommonModule, RouterModule, NgChartsModule],
    templateUrl: './resumen.component.html',
    styleUrls: ['./resumen.component.css']
})
export class ResumenComponent {
    public dataService = inject(DataService);
    private exportService = inject(ExportService);

    exportData() {
        this.exportService.generateCostReport(
            this.dataService.vehicles(),
            this.dataService.refuels(),
            this.dataService.maintenances()
        );
    }

    // 1. Chart: Monthly Evolution (Line)
    public lineChartData = computed<ChartData<'line'>>(() => {
        const refuels = this.dataService.refuels();
        const monthlyData: Record<string, number> = {};

        // Group by YYYY-MM
        refuels.forEach(r => {
            const date = new Date(r.fecha);
            const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthlyData[key] = (monthlyData[key] || 0) + Number(r.costeTotal || 0);
        });

        const labels = Object.keys(monthlyData).sort();
        return {
            labels,
            datasets: [
                {
                    data: labels.map(l => monthlyData[l]),
                    label: 'Gasto en Combustible',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1',
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#fff',
                    fill: 'origin',
                    tension: 0.4
                }
            ]
        };
    });

    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    // 2. Chart: Distribution (Doughnut)
    public doughnutChartData = computed<ChartData<'doughnut'>>(() => {
        const refuels = this.dataService.refuels();
        const maintenances = this.dataService.maintenances();

        const fuelTotal = refuels.reduce((acc, curr) => acc + Number(curr.costeTotal || 0), 0);
        const maintTotal = maintenances.reduce((acc, curr) => acc + (Number(curr.costePieza || 0) + Number(curr.costeTaller || 0)), 0);

        return {
            labels: ['Combustible', 'Mantenimiento'],
            datasets: [
                {
                    data: [fuelTotal, maintTotal],
                    backgroundColor: ['#6366f1', '#f43f5e'],
                    hoverBackgroundColor: ['#4f46e5', '#e11d48'],
                    borderWidth: 0
                }
            ]
        };
    });

    public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
        },
        cutout: '70%',
    };
}
