import { AppDataSource } from '../data-source';
import { Vehicle } from '../entities/Vehicle';
import { Maintenance } from '../entities/Maintenance';
import { emailService } from './email.service';
import { LessThanOrEqual } from 'typeorm';

interface MaintenanceRule {
    id: string;
    label: string;
    intervalKm?: number;
    intervalMonths?: number;
}

class AlertService {
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

    async checkAndSendAlerts(vehicleId: number) {
        const vehicleRepository = AppDataSource.getRepository(Vehicle);
        const maintenanceRepository = AppDataSource.getRepository(Maintenance);

        const vehicle = await vehicleRepository.findOne({
            where: { id: vehicleId },
            relations: ['propietario']
        });

        if (!vehicle || !vehicle.propietario?.email) return;

        const maintenances = await maintenanceRepository.find({
            where: { vehiculoId: vehicleId }
        });

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        // 1. Check Maintenance Rules
        for (const rule of this.RULES) {
            const vehicleMaintenances = maintenances
                .filter(m => m.tipo === rule.id)
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

            const lastMaint = vehicleMaintenances[0];
            let isDue = false;
            let reason = '';

            if (!lastMaint) {
                if (rule.intervalKm && vehicle.kilometrajeActual > rule.intervalKm * 0.8) {
                    isDue = true;
                    reason = `Nunca registrado (Km actual: ${vehicle.kilometrajeActual})`;
                }
            } else {
                if (rule.intervalKm) {
                    const kmSinceLast = vehicle.kilometrajeActual - lastMaint.kilometraje;
                    if (kmSinceLast >= rule.intervalKm - 1000) {
                        isDue = true;
                        reason = `${kmSinceLast} km desde el último`;
                    }
                }

                if (rule.intervalMonths && !isDue) {
                    const monthsSinceLast = this.monthDiff(new Date(lastMaint.fecha), today);
                    if (monthsSinceLast >= rule.intervalMonths - 1) {
                        isDue = true;
                        reason = `${monthsSinceLast} meses desde el último`;
                    }
                }
            }

            if (isDue) {
                await emailService.sendAutomatedAlert(vehicle.propietario.email, {
                    title: `Mantenimiento: ${rule.label} - ${vehicle.matricula}`,
                    message: `Tu vehículo ${vehicle.modelo} (${vehicle.matricula}) requiere ${rule.label.toLowerCase()}.`,
                    detailLabel: 'Razón',
                    detailValue: reason
                });
            }
        }

        // 2. Check ITV
        if (vehicle.itvFechaCaducidad) {
            const itvDate = new Date(vehicle.itvFechaCaducidad);
            if (itvDate <= thirtyDaysFromNow) {
                await emailService.sendAutomatedAlert(vehicle.propietario.email, {
                    title: `ITV Próxima a Caducar: ${vehicle.matricula}`,
                    message: `La ITV de tu vehículo ${vehicle.modelo} (${vehicle.matricula}) caduca pronto o ya ha caducado.`,
                    detailLabel: 'Fecha de Caducidad',
                    detailValue: itvDate.toLocaleDateString()
                });
            }
        }

        // 3. Check Insurance
        if (vehicle.seguroFechaVencimiento) {
            const insuranceDate = new Date(vehicle.seguroFechaVencimiento);
            if (insuranceDate <= thirtyDaysFromNow) {
                await emailService.sendAutomatedAlert(vehicle.propietario.email, {
                    title: `Seguro Próximo a Vencer: ${vehicle.matricula}`,
                    message: `El seguro de tu vehículo ${vehicle.modelo} (${vehicle.matricula}) vence pronto o ya ha vencido.`,
                    detailLabel: 'Fecha de Vencimiento',
                    detailValue: insuranceDate.toLocaleDateString()
                });
            }
        }
    }

    private monthDiff(d1: Date, d2: Date) {
        let months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }
}

export const alertService = new AlertService();
