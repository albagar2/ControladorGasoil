import { Injectable } from '@angular/core';
import { Vehicle, Refuel, Maintenance } from './api.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    constructor() { }

    generateCostReport(vehicles: Vehicle[], refuels: Refuel[], maintenances: Maintenance[]) {
        const doc = new jsPDF();
        const dateStr = new Date().toLocaleDateString();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text('Informe de Gastos - Control Gasoil', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${dateStr}`, 14, 30);
        doc.text('Control Gasoil Familiar - Gestión de Flota Premium', 14, 35);

        let currentY = 45;

        vehicles.forEach((vehicle, index) => {
            const vehicleRefuels = refuels.filter(r => r.vehiculoId === vehicle.id);
            const vehicleMaintenances = maintenances.filter(m => m.vehiculoId === vehicle.id);

            if (index > 0 && currentY > 200) {
                doc.addPage();
                currentY = 20;
            }

            // Vehicle Subheader
            doc.setFontSize(16);
            doc.setTextColor(63, 81, 181); // Primary Blue
            doc.text(`${vehicle.modelo} (${vehicle.matricula})`, 14, currentY);
            currentY += 10;

            const tableData: any[][] = [];
            const months = new Set<string>();

            vehicleRefuels.forEach(r => {
                const date = new Date(r.fecha);
                months.add(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
            });

            vehicleMaintenances.forEach(m => {
                const date = new Date(m.fecha);
                months.add(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
            });

            const sortedMonths = Array.from(months).sort().reverse();
            let vehicleTotal = 0;

            sortedMonths.forEach(month => {
                const monthlyRefuels = vehicleRefuels.filter(r => {
                    const d = new Date(r.fecha);
                    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}` === month;
                });

                const monthlyMaintenances = vehicleMaintenances.filter(m => {
                    const d = new Date(m.fecha);
                    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}` === month;
                });

                const refuelCost = monthlyRefuels.reduce((acc, curr) => acc + Number(curr.costeTotal || 0), 0);
                const maintenanceCost = monthlyMaintenances.reduce((acc, curr) => acc + (Number(curr.costePieza || 0) + Number(curr.costeTaller || 0)), 0);
                const total = refuelCost + maintenanceCost;
                vehicleTotal += total;

                tableData.push([
                    month,
                    `${refuelCost.toFixed(2)} €`,
                    `${maintenanceCost.toFixed(2)} €`,
                    `${total.toFixed(2)} €`
                ]);
            });

            if (tableData.length === 0) {
                tableData.push(['Sin actividad', '0.00 €', '0.00 €', '0.00 €']);
            }

            autoTable(doc, {
                startY: currentY,
                head: [['Mes', 'Gasto Repostaje', 'Gasto Mantenimiento', 'Total Mensual']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [63, 81, 181] },
                margin: { left: 14 },
                didDrawPage: (data: any) => {
                    currentY = data.cursor ? data.cursor.y : currentY;
                }
            });

            // Summary for vehicle
            currentY += 10;
            doc.setFontSize(11);
            doc.setTextColor(40);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Acumulado Vehículo: ${vehicleTotal.toFixed(2)} €`, 140, currentY);
            doc.setFont('helvetica', 'normal');
            currentY += 15;
        });

        // Footer for all pages
        const pageCount = doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        doc.save(`informe_gastos_${new Date().toISOString().split('T')[0]}.pdf`);
    }
}
