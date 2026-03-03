import { Injectable } from '@angular/core';

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

    generateCostReport(vehicles: any[], refuels: any[], maintenance: any[]) {
        const reportData = [
            ...vehicles.map(v => ({ type: 'Vehículo', name: v.name, detail: v.plate, cost: 0 })),
            ...refuels.map(r => ({ type: 'Repostaje', name: r.vehicleName, detail: `${r.liters}L`, cost: r.totalCost })),
            ...maintenance.map(m => ({ type: 'Mantenimiento', name: m.vehicleName, detail: m.description, cost: m.cost }))
        ];
        this.exportToCsv('reporte_gastos.csv', reportData);
    }
}

