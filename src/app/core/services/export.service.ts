import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
    providedIn: 'root'
})
export class ExportService {

    exportToCsv(filename: string, data: any[]) {
        if (!data || !data.length) return;

        const separator = ',';
        const keys = Object.keys(data[0]);

        const csvContent = [
            keys.join(separator),
            ...data.map(row =>
                keys.map(key => {
                    let cell = row[key] === null || row[key] === undefined ? '' : row[key];
                    cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
                    cell = cell.replace(/"/g, '""');
                    if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
                    return cell;
                }).join(separator)
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    exportToPdf(filename: string, title: string, columns: string[], data: any[]) {
        const doc = new jsPDF();

        // Estilos del Título
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(title, 14, 22);

        // Información adicional
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 30);

        // Generar Tabla
        autoTable(doc, {
            startY: 35,
            head: [columns],
            body: data,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { top: 35 }
        });

        doc.save(filename);
    }

    generateCostReport(vehicles: any[], refuels: any[], maintenance: any[]) {
        const columns = ['Tipo', 'Vehículo/Nombre', 'Detalle', 'Coste (€)'];
        const reportData = [
            ...refuels.map(r => ['Repostaje', r.vehiculo?.modelo || 'N/A', `${r.litros}L`, `${r.costeTotal}€`]),
            ...maintenance.map(m => ['Mantenimiento', m.vehiculo?.modelo || 'N/A', m.descripcion, `${(m.costePieza || 0) + (m.costeTaller || 0)}€`])
        ];

        this.exportToPdf('reporte_gastos_gasoil.pdf', 'Informe de Gastos - Garaje Familiar', columns, reportData);
    }
}

