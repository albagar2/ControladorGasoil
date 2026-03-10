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

    exportToPdf(filename: string, title: string, columns: string[], data: any[], images?: { image: string, title: string }[]) {
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

        // Añadir Gráficos después de la tabla
        if (images && images.length > 0) {
            let currentY = (doc as any).lastAutoTable.finalY + 20;

            images.forEach((img, index) => {
                // Comprobar si cabe en la página o crear nueva
                if (currentY > 240) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFontSize(14);
                doc.setTextColor(40);
                doc.text(img.title, 14, currentY);

                try {
                    // Ajustar tamaño del gráfico (más pequeño y centrado)
                    const imgWidth = 150;
                    const imgHeight = 75;
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const xPos = (pageWidth - imgWidth) / 2;

                    doc.addImage(img.image, 'PNG', xPos, currentY + 8, imgWidth, imgHeight);
                    currentY += imgHeight + 30;
                } catch (e) {
                    console.error('Error al añadir imagen al PDF', e);
                    currentY += 15;
                }
            });
        }

        doc.save(filename);
    }

    generateCostReport(vehicles: any[], refuels: any[], maintenance: any[], reportTitle?: string, images?: { image: string, title: string }[]) {
        const columns = ['Mes/Año', 'Tipo', 'Vehículo', 'Detalle', 'Coste (€)'];

        // Combinar datos con fecha para poder ordenar
        const combinedData = [
            ...refuels.map(r => ({
                fecha: new Date(r.fecha),
                tipo: 'Repostaje',
                vehiculo: r.vehiculo?.modelo || r.vehiculo?.matricula || 'N/A',
                detalle: `${r.litros}L (${Number(r.precioPorLitro).toFixed(3)}€/L)`,
                coste: Number(r.costeTotal) || 0
            })),
            ...maintenance.map(m => ({
                fecha: new Date(m.fecha),
                tipo: 'Mantenimiento',
                vehiculo: m.vehiculo?.modelo || m.vehiculo?.matricula || 'N/A',
                detalle: `${m.tipo}${m.observaciones ? ' - ' + m.observaciones : ''}`,
                coste: (Number(m.costePieza) || 0) + (Number(m.costeTaller) || 0)
            }))
        ];

        // Ordenar por Año/Mes (Descendente - más reciente arriba) y por Vehículo (Ascendente)
        combinedData.sort((a, b) => {
            const timeA = a.fecha.getTime();
            const timeB = b.fecha.getTime();
            if (timeA !== timeB) return timeB - timeA;
            return a.vehiculo.localeCompare(b.vehiculo);
        });

        const reportData = combinedData.map(item => [
            item.fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            item.tipo,
            item.vehiculo,
            item.detalle,
            `${item.coste.toFixed(2)}€`
        ]);

        const finalReportTitle = reportTitle || (combinedData.length > 0
            ? `Informe de Gastos - ${combinedData[0].fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
            : 'Informe de Gastos - Garaje Familiar');

        this.exportToPdf('reporte_gastos_gasoil.pdf', finalReportTitle, columns, reportData, images);
    }
}

