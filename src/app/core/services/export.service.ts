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

    exportToPdf(filename: string, title: string, columns: string[], data: any[], totalsRow: string[] = [], images?: { image: string, title: string }[]) {
        const doc = new jsPDF();
        const primaryColor = [79, 70, 229] as [number, number, number];
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const tableData = [...data];
        if (totalsRow.length > 0) {
            tableData.push(totalsRow);
        }

        // --- Configuración de autoTable ---
        autoTable(doc, {
            startY: 45, // Empezar debajo del header principal
            head: [columns],
            body: tableData,
            theme: 'plain',
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                textColor: [55, 65, 81],
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251]
            },
            margin: { top: 45, bottom: 20 },
            didParseCell: (hookData) => {
                // Alineación de la columna de costes a la derecha
                if (hookData.column.index === 4) {
                    hookData.cell.styles.halign = 'right';
                }
                // Si esta es la fila de totales (última fila y es body)
                if (totalsRow.length > 0 && hookData.row.index === tableData.length - 1 && hookData.section === 'body') {
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fillColor = [243, 244, 246]; // bg-gray-100
                    hookData.cell.styles.textColor = [17, 24, 39]; // bg-gray-900
                }
            },
            willDrawPage: (data) => {
                // Cabecera Geométrica por Página
                doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.rect(0, 0, pageWidth, 30, 'F');

                // Texto del Título principal
                doc.setFontSize(20);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text(title, 14, 20);

                // Texto de fecha
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const pd = new Date();
                const pDate = `${pd.getDate().toString().padStart(2, '0')}/${(pd.getMonth() + 1).toString().padStart(2, '0')}/${pd.getFullYear()}`;
                doc.text(`Generado: ${pDate}`, pageWidth - 14, 20, { align: 'right' });
            },
            didDrawPage: (data) => {
                // Footer con Num. Página
                const str = `Control Automotor Familiar  •  Página ${doc.getCurrentPageInfo().pageNumber}`;
                doc.setFontSize(9);
                doc.setTextColor(156, 163, 175); // gray-400
                doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });

        // --- Gráficos ---
        if (images && images.length > 0) {
            let currentY = Math.min((doc as any).lastAutoTable.finalY + 15, pageHeight - 30);

            images.forEach((img, index) => {
                // Altura mínima requerida para título + gráfico aproximado: ~120px
                if (currentY + 120 > pageHeight - 20) {
                    doc.addPage();
                    currentY = 40;

                    // Redibujamos cabecera en nueva página vacía de gráficos
                    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                    doc.rect(0, 0, pageWidth, 30, 'F');
                    doc.setFontSize(20);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text(title + ' (Gráficos)', 14, 20);
                }

                // Título Gráfico
                doc.setFontSize(14);
                doc.setTextColor(31, 41, 55); // gray 800
                doc.setFont('helvetica', 'bold');
                doc.text(img.title, 14, currentY);

                // Línea separadora
                doc.setDrawColor(229, 231, 235); // gray 200
                doc.setLineWidth(0.5);
                doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);

                try {
                    const imgProps = doc.getImageProperties(img.image);
                    const maxImgWidth = 160;
                    const imgWidth = Math.min(maxImgWidth, pageWidth - 28);
                    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                    // Asegurar que cabe con el alto calculado
                    if (currentY + 10 + imgHeight > pageHeight - 20) {
                        doc.addPage();
                        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                        doc.rect(0, 0, pageWidth, 30, 'F');

                        currentY = 40;
                        doc.setFontSize(14);
                        doc.setTextColor(31, 41, 55);
                        doc.setFont('helvetica', 'bold');
                        doc.text(img.title + ' (cont.)', 14, currentY);
                        doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
                    }

                    const xPos = (pageWidth - imgWidth) / 2;

                    doc.addImage(img.image, 'PNG', xPos, currentY + 10, imgWidth, imgHeight);
                    currentY += imgHeight + 25;
                } catch (e) {
                    console.error('Error al añadir imagen al PDF', e);
                    currentY += 15;
                }
            });

            // Dibujar el footer en cualquier página de imágenes extra
            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                if (i > (doc as any).lastAutoTable.pageCount && i > 1) {
                    const str = `Control Automotor Familiar  •  Página ${i}`;
                    doc.setFontSize(9);
                    doc.setTextColor(156, 163, 175);
                    doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
                }
            }
        }

        doc.save(filename);
    }

    generateCostReport(vehicles: any[], refuels: any[], maintenance: any[], reportTitle?: string, images?: { image: string, title: string }[]) {
        const columns = ['Mes/Año', 'Tipo', 'Vehículo', 'Detalle', 'Coste (€)'];

        const combinedData = [
            ...refuels.map(r => ({
                fecha: new Date(r.fecha),
                tipo: 'Repostaje',
                vehiculo: r.vehiculo?.modelo || r.vehiculo?.matricula || 'N/A',
                litros: Number(r.litros) || 0,
                detalle: `${r.litros}L (${Number(r.precioPorLitro).toFixed(3)}€/L)`,
                coste: Number(r.costeTotal) || 0
            })),
            ...maintenance.map(m => ({
                fecha: new Date(m.fecha),
                tipo: 'Mantenimiento',
                vehiculo: m.vehiculo?.modelo || m.vehiculo?.matricula || 'N/A',
                litros: 0,
                detalle: `${m.tipo}${m.observaciones ? ' - ' + m.observaciones : ''}`,
                coste: (Number(m.costePieza) || 0) + (Number(m.costeTaller) || 0)
            }))
        ];

        // Sort by date inside groups (newer first)
        combinedData.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

        // Group by vehicle
        const groupedData: { [key: string]: typeof combinedData } = {};
        combinedData.forEach(item => {
            if (!groupedData[item.vehiculo]) {
                groupedData[item.vehiculo] = [];
            }
            groupedData[item.vehiculo].push(item);
        });

        const reportData: any[] = [];
        let grandTotal = 0;

        Object.keys(groupedData).forEach(vehiculoName => {
            const items = groupedData[vehiculoName];

            // Add a header row for the vehicle using autoTable object syntax
            reportData.push([
                { content: `Vehículo: ${vehiculoName}`, colSpan: 5, styles: { fillColor: [229, 231, 235], textColor: [17, 24, 39], fontStyle: 'bold' } }
            ]);

            let vehicleTotal = 0;
            let vehicleLiters = 0;

            items.forEach(item => {
                vehicleTotal += item.coste;
                vehicleLiters += item.litros;
                const dStr = `${item.fecha.getDate().toString().padStart(2, '0')}/${(item.fecha.getMonth() + 1).toString().padStart(2, '0')}/${item.fecha.getFullYear()}`;

                reportData.push([
                    dStr,
                    item.tipo,
                    item.vehiculo,
                    item.detalle,
                    `${item.coste.toFixed(2)}€`
                ]);
            });

            grandTotal += vehicleTotal;

            // Add vehicle total row
            reportData.push([
                { content: '', colSpan: 2 },
                { content: `Total ${vehiculoName}:`, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: vehicleLiters > 0 ? `${vehicleLiters.toFixed(2)}L` : '', styles: { fontStyle: 'bold' } },
                { content: `${vehicleTotal.toFixed(2)}€`, styles: { fontStyle: 'bold', textColor: [220, 38, 38] } }
            ]);
        });

        // Add an empty spacer row
        if (Object.keys(groupedData).length > 0) {
            reportData.push([{ content: '', colSpan: 5, styles: { fillColor: [255, 255, 255] } }]);
        }

        const totalsRow = [
            '', '', '', 'Gasto Total del Periodo:', `${grandTotal.toFixed(2)}€`
        ];

        let finalReportTitle = reportTitle || 'Informe de Gastos - Garaje Familiar';
        if (!reportTitle && combinedData.length > 0) {
            const oldestDate = combinedData[combinedData.length - 1].fecha;
            const mesStr = oldestDate.toLocaleString('es-ES', { month: 'long' });
            finalReportTitle = `Informe de Gastos - ${mesStr} ${oldestDate.getFullYear()}`;
        }

        this.exportToPdf('reporte_gastos_gasoil.pdf', finalReportTitle, columns, reportData, totalsRow, images);
    }
}

