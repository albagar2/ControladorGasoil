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

        // --- Paleta de Colores Premium ---
        const colors = {
            primary: [15, 23, 42] as [number, number, number], // Slate 900
            accent: [67, 56, 202] as [number, number, number],  // Indigo 700
            text: [51, 65, 85] as [number, number, number],    // Slate 600
            lightGray: [248, 250, 252] as [number, number, number], // Slate 50
            border: [226, 232, 240] as [number, number, number]     // Slate 200
        };

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const tableData = [...data];
        if (totalsRow.length > 0) {
            tableData.push(totalsRow);
        }

        // --- Función para dibujar el Header Premium ---
        const drawHeader = (pdfDoc: jsPDF, pageTitle: string) => {
            // Fondo oscuro para el header
            pdfDoc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            pdfDoc.rect(0, 0, pageWidth, 40, 'F');

            // Icono Circular Decorativo
            pdfDoc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            pdfDoc.circle(20, 20, 8, 'F');
            pdfDoc.setTextColor(255, 255, 255);
            pdfDoc.setFontSize(12);
            pdfDoc.setFont('helvetica', 'bold');
            pdfDoc.text('G', 18, 21.5);

            // Título principal
            pdfDoc.setFontSize(22);
            pdfDoc.setTextColor(255, 255, 255);
            pdfDoc.setFont('helvetica', 'bold');
            pdfDoc.text(pageTitle, 35, 22);

            // Barra de acento inferior
            pdfDoc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            pdfDoc.rect(0, 40, pageWidth, 2, 'F');

            // Fecha de generación
            pdfDoc.setFontSize(9);
            pdfDoc.setFont('helvetica', 'normal');
            pdfDoc.setTextColor(148, 163, 184); // Slate 400
            const pd = new Date();
            const pDate = `${pd.getDate().toString().padStart(2, '0')}/${(pd.getMonth() + 1).toString().padStart(2, '0')}/${pd.getFullYear()}`;
            pdfDoc.text(`EMITIDO: ${pDate}`, pageWidth - 14, 22, { align: 'right' });
        };

        // --- Configuración de autoTable con Estilo Refinado ---
        autoTable(doc, {
            startY: 50,
            head: [columns],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: colors.primary,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10,
                cellPadding: 4,
                halign: 'left'
            },
            bodyStyles: {
                textColor: colors.text,
                fontSize: 9,
                cellPadding: 4
            },
            alternateRowStyles: {
                fillColor: colors.lightGray
            },
            margin: { top: 45, bottom: 25 },
            didParseCell: (hookData) => {
                // Alineación de costes
                if (hookData.column.index === 4) {
                    hookData.cell.styles.halign = 'right';
                }
                // Estilo fila de totales
                if (totalsRow.length > 0 && hookData.row.index === tableData.length - 1 && hookData.section === 'body') {
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fillColor = colors.primary;
                    hookData.cell.styles.textColor = [255, 255, 255];
                    hookData.cell.styles.fontSize = 10;
                }
            },
            willDrawPage: (hookData) => {
                drawHeader(doc, title);
            },
            didDrawPage: (hookData) => {
                // Footer Moderno
                const pageNumber = doc.getCurrentPageInfo().pageNumber;
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // Slate 400
                doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
                doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

                const footerText = `CONTROL AUTOMOTOR FAMILIAR — Dashboard de Gestión`;
                doc.text(footerText, 14, pageHeight - 10);
                doc.text(`Página ${pageNumber}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
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
                    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                    doc.rect(0, 0, pageWidth, 30, 'F');
                    doc.setFontSize(20);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text(title + ' (Gráficos)', 14, 20);
                }

                // Título Gráfico con Estilo
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42); // primary
                doc.setFont('helvetica', 'bold');
                doc.text(img.title.toUpperCase(), 14, currentY);

                // Línea separadora acentuada
                doc.setDrawColor(67, 56, 202); // accent
                doc.setLineWidth(1);
                doc.line(14, currentY + 3, 40, currentY + 3);

                doc.setDrawColor(226, 232, 240); // text light
                doc.setLineWidth(0.5);
                doc.line(40, currentY + 3, pageWidth - 14, currentY + 3);

                try {
                    const imgProps = doc.getImageProperties(img.image);
                    const maxImgWidth = 160;
                    const imgWidth = Math.min(maxImgWidth, pageWidth - 28);
                    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                    // Asegurar que cabe con el alto calculado
                    if (currentY + 10 + imgHeight > pageHeight - 20) {
                        doc.addPage();
                        doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                        doc.rect(0, 0, pageWidth, 30, 'F');

                        currentY = 40;
                        doc.setFontSize(14);
                        doc.setTextColor(31, 41, 55);
                        doc.setFont('helvetica', 'bold');
                        doc.text(img.title + ' (cont.)', 14, currentY);
                        doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
                    }

                    const xPos = (pageWidth - imgWidth) / 2;

                    // Dibujar un borde ligero alrededor del gráfico
                    doc.setDrawColor(226, 232, 240);
                    doc.rect(xPos - 2, currentY + 8, imgWidth + 4, imgHeight + 4, 'S');

                    doc.addImage(img.image, 'PNG', xPos, currentY + 10, imgWidth, imgHeight);
                    currentY += imgHeight + 35;
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
        const columns = ['Fecha', 'Tipo', 'Resumen', 'Odómetro', 'Coste (€)'];

        const combinedData = [
            ...refuels.map(r => ({
                fecha: new Date(r.fecha),
                tipo: 'Repostaje',
                vehiculo: `${r.vehiculo?.modelo || ''} ${r.vehiculo?.matricula || ''}`.trim() || 'Desconocido',
                litros: Number(r.litros) || 0,
                kilometraje: Number(r.kilometraje) || 0,
                detalle: `${r.litros}L a ${Number(r.precioPorLitro).toFixed(3)}€/L`,
                coste: Number(r.costeTotal) || 0
            })),
            ...maintenance.map(m => ({
                fecha: new Date(m.fecha),
                tipo: 'Mantenimiento',
                vehiculo: `${m.vehiculo?.modelo || ''} ${m.vehiculo?.matricula || ''}`.trim() || 'Desconocido',
                litros: 0,
                kilometraje: Number(m.kilometraje) || 0,
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
                { content: `Vehículo: ${vehiculoName.toUpperCase()}`, colSpan: 5, styles: { fillColor: [229, 231, 235], textColor: [17, 24, 39], fontStyle: 'bold' } }
            ]);

            let vehicleTotal = 0;
            let vehicleLiters = 0;
            const validKms = items.map(i => i.kilometraje).filter(k => k && !isNaN(k) && k > 0);
            const kmRecorridos = validKms.length > 1 ? Math.max(...validKms) - Math.min(...validKms) : 0;

            items.forEach(item => {
                vehicleTotal += item.coste;
                vehicleLiters += item.litros;
                const dStr = `${item.fecha.getDate().toString().padStart(2, '0')}/${(item.fecha.getMonth() + 1).toString().padStart(2, '0')}/${item.fecha.getFullYear()}`;

                reportData.push([
                    dStr,
                    item.tipo,
                    item.detalle,
                    item.kilometraje > 0 ? `${item.kilometraje} km` : '-',
                    `${item.coste.toFixed(2)}€`
                ]);
            });

            grandTotal += vehicleTotal;

            // Add vehicle total row
            reportData.push([
                { content: `Totales de ${vehiculoName.toUpperCase()}:`, colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
                { content: vehicleLiters > 0 ? `${vehicleLiters.toFixed(2)}L repostados` : '', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: kmRecorridos > 0 ? `${kmRecorridos} km recorridos` : '', styles: { fontStyle: 'bold', fontSize: 9 } },
                { content: `${vehicleTotal.toFixed(2)}€`, styles: { fontStyle: 'bold', textColor: [220, 38, 38] } }
            ]);
        });

        // Add an empty spacer row
        if (Object.keys(groupedData).length > 0) {
            reportData.push([{ content: '', colSpan: 5, styles: { fillColor: [255, 255, 255] } }]);
        }

        // Create Executive Summary Object
        const totalRefuelCost = refuels.reduce((acc, r) => acc + (Number(r.costeTotal) || 0), 0);
        const totalMntCost = maintenance.reduce((acc, m) => acc + (Number(m.costePieza) || 0) + (Number(m.costeTaller) || 0), 0);
        const totalLiters = refuels.reduce((acc, r) => acc + (Number(r.litros) || 0), 0);

        // We'll prepend the executive summary to the reportData
        const summaryData = [
            [{ content: 'RESUMEN EJECUTIVO DEL INFORME', colSpan: 5, styles: { halign: 'center', fontStyle: 'bold', fillColor: [67, 56, 202], textColor: [255, 255, 255] } }],
            [
                { content: 'Total Repostajes', styles: { fontStyle: 'bold' } },
                { content: 'Total Mantenimientos', styles: { fontStyle: 'bold' } },
                { content: 'Litros Totales', styles: { fontStyle: 'bold' } },
                { content: 'Gasto Total', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } }
            ],
            [
                `${totalRefuelCost.toFixed(2)}€`,
                `${totalMntCost.toFixed(2)}€`,
                `${totalLiters.toFixed(2)} L`,
                { content: `${(totalRefuelCost + totalMntCost).toFixed(2)}€`, colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', textColor: [67, 56, 202] } }
            ],
            [{ content: '', colSpan: 5, styles: { cellPadding: 2 } }] // Spacer
        ];

        let finalReportTitle = reportTitle || 'Informe de Gastos - Garaje Familiar';
        if (!reportTitle && combinedData.length > 0) {
            const oldestDate = combinedData[combinedData.length - 1].fecha;
            const mesStr = oldestDate.toLocaleString('es-ES', { month: 'long' });
            finalReportTitle = `Informe de Gastos - ${mesStr.toUpperCase()} ${oldestDate.getFullYear()}`;
        }

        this.exportToPdf('reporte_gastos_gasoil.pdf', finalReportTitle, columns, [...summaryData, ...reportData], [], images);
    }
}

