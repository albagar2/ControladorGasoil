import { Injectable } from '@angular/core';
import { Maintenance, Vehicle } from './api.service';

export interface MaintenanceAlert {
    type: string;
    vehicle: string;
    date?: Date;
    daysLeft?: number;
    message: string;
    urgent: boolean;
}

interface MaintenanceRule {
    id: string;
    label: string;
    intervalKm?: number;
    intervalMonths?: number;
}

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {

    private readonly RULES: MaintenanceRule[] = [
        { id: 'Aceite', label: 'Cambio de Aceite y Filtros', intervalKm: 15000, intervalMonths: 12 },
        { id: 'Aire', label: 'Filtro de Aire', intervalKm: 30000 },
        { id: 'Liquidos', label: 'Líquido de Frenos', intervalKm: 40000, intervalMonths: 24 },
        { id: 'Liquidos', label: 'Líquido Refrigerante', intervalKm: 60000, intervalMonths: 48 },
        { id: 'Bateria', label: 'Batería', intervalMonths: 48 },
        { id: 'Distribucion', label: 'Correa de Distribución', intervalKm: 120000 },
        { id: 'Accesorios', label: 'Correa de Accesorios', intervalKm: 120000 },
        { id: 'Polen', label: 'Filtro de Polen', intervalKm: 15000, intervalMonths: 12 },
        { id: 'Diesel', label: 'Filtros Diesel / EGR', intervalKm: 100000 },
        { id: 'Escape', label: 'Sistema de Escape', intervalKm: 140000 }
    ];

    constructor() { }

    getUpcomingMaintenance(vehicles: Vehicle[], maintenances: Maintenance[]): MaintenanceAlert[] {
        const upcomingMaintenance: MaintenanceAlert[] = [];
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        vehicles.forEach(vehicle => {
            // 1. Process Fixed Rules (Oil, Air, etc.)
            this.RULES.forEach(rule => {
                const vehicleMaintenances = maintenances
                    .filter(m => m.vehiculoId === vehicle.id && m.tipo === rule.id)
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

                const lastMaint = vehicleMaintenances[0];
                let isDue = false;
                let reason = '';
                let urgent = false;

                if (!lastMaint) {
                    // If never done and car has significant KM, suggest it
                    if (rule.intervalKm && vehicle.kilometrajeActual > rule.intervalKm * 0.8) {
                        isDue = true;
                        reason = `Nunca registrado (Km actual: ${vehicle.kilometrajeActual})`;
                    }
                } else {
                    // Check KM
                    if (rule.intervalKm) {
                        const kmSinceLast = vehicle.kilometrajeActual - lastMaint.kilometraje;
                        if (kmSinceLast >= rule.intervalKm - 1000) {
                            isDue = true;
                            reason = `${kmSinceLast} km desde el último`;
                            urgent = kmSinceLast >= rule.intervalKm;
                        }
                    }

                    // Check Time
                    if (rule.intervalMonths && !isDue) {
                        const monthsSinceLast = this.monthDiff(new Date(lastMaint.fecha), today);
                        if (monthsSinceLast >= rule.intervalMonths - 1) {
                            isDue = true;
                            reason = `${monthsSinceLast} meses desde el último`;
                            urgent = monthsSinceLast >= rule.intervalMonths;
                        }
                    }
                }

                if (isDue) {
                    upcomingMaintenance.push({
                        type: rule.label,
                        vehicle: `${vehicle.modelo} (${vehicle.matricula})`,
                        message: reason,
                        urgent: urgent
                    });
                }
            });

            // 2. Check ITV
            if (vehicle.itv_fecha_caducidad) {
                const itvDate = new Date(vehicle.itv_fecha_caducidad);
                if (itvDate <= thirtyDaysFromNow && itvDate >= today) {
                    const daysLeft = Math.ceil((itvDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    upcomingMaintenance.push({
                        type: 'ITV',
                        vehicle: `${vehicle.modelo} (${vehicle.matricula})`,
                        date: itvDate,
                        daysLeft: daysLeft,
                        message: `ITV vence en ${daysLeft} días`,
                        urgent: daysLeft < 7
                    });
                } else if (itvDate < today) {
                    upcomingMaintenance.push({
                        type: 'ITV',
                        vehicle: `${vehicle.modelo} (${vehicle.matricula})`,
                        date: itvDate,
                        daysLeft: 0,
                        message: `ITV Caducada (${itvDate.toLocaleDateString()})`,
                        urgent: true
                    });
                }
            }

            // 3. Check Insurance
            if (vehicle.seguro_fecha_vencimiento) {
                const insuranceDate = new Date(vehicle.seguro_fecha_vencimiento);
                if (insuranceDate <= thirtyDaysFromNow && insuranceDate >= today) {
                    const daysLeft = Math.ceil((insuranceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    upcomingMaintenance.push({
                        type: 'Seguro',
                        vehicle: `${vehicle.modelo} (${vehicle.matricula})`,
                        date: insuranceDate,
                        daysLeft: daysLeft,
                        message: `Seguro vence en ${daysLeft} días`,
                        urgent: daysLeft < 7
                    });
                }
            }

            // 4. Tires special reminder (Monthly)
            upcomingMaintenance.push({
                type: 'Neumáticos',
                vehicle: `${vehicle.modelo} (${vehicle.matricula})`,
                message: 'Control mensual de presión y dibujo recomendado',
                urgent: false
            });
        });

        return upcomingMaintenance;
    }

    private monthDiff(d1: Date, d2: Date) {
        let months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }
}
