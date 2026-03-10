import { AppDataSource } from '../data-source';
import { Vehicle } from '../entities/Vehicle';
import { Maintenance } from '../entities/Maintenance';
import { emailService } from './email.service';
import { LessThanOrEqual } from 'typeorm';
import { Refuel } from '../entities/Refuel';
import { Driver } from '../entities/Driver';

interface MaintenanceRule {
    id: string;
    label: string;
    intervalKm?: number;
    intervalMonths?: number;
}

class AlertService {
    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
        console.log(`[AlertService] Checking alerts for vehicle ${vehicleId}...`);
        const vehicleRepository = AppDataSource.getRepository(Vehicle);
        const maintenanceRepository = AppDataSource.getRepository(Maintenance);

        const vehicle = await vehicleRepository.findOne({
            where: { id: vehicleId },
            relations: ['propietario']
        });

        if (!vehicle) {
            console.log(`[AlertService] Vehicle ${vehicleId} not found.`);
            return;
        }

        if (!vehicle.propietario?.email) {
            console.warn(`[AlertService] Vehicle ${vehicle.matricula} has no owner email. Skipping alerts.`);
            return;
        }

        const maintenances = await maintenanceRepository.find({
            where: { vehiculoId: vehicleId }
        });

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        // 1. Check Maintenance Rules
        for (const rule of this.RULES) {
            console.log(`[AlertService] Checking rule: ${rule.label} for ${vehicle.matricula}`);
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
                console.log(`[AlertService] Alert triggered: ${rule.label} for ${vehicle.matricula}. Reason: ${reason}`);
                try {
                    await emailService.sendAutomatedAlert(vehicle.propietario.email, {
                        title: `Mantenimiento: ${rule.label} - ${vehicle.matricula}`,
                        message: `Tu vehículo ${vehicle.modelo} (${vehicle.matricula}) requiere ${rule.label.toLowerCase()}.`,
                        detailLabel: 'Razón',
                        detailValue: reason
                    });
                    console.log(`[AlertService] Email notification sent to ${vehicle.propietario.email}`);
                    // Rate limit protection for Resend (2 req/sec max)
                    await this.sleep(1000);
                } catch (err) {
                    console.error(`[AlertService] Failed to send email to ${vehicle.propietario.email}:`, err);
                }
            }
        }

        // 2. Check ITV
        if (vehicle.itv_fecha_caducidad) {
            const itvDate = new Date(vehicle.itv_fecha_caducidad);
            if (itvDate <= thirtyDaysFromNow) {
                console.log(`[AlertService] ITV Alert triggered for ${vehicle.matricula}. Expiry: ${itvDate.toLocaleDateString()}`);
                try {
                    await emailService.sendAutomatedAlert(vehicle.propietario.email, {
                        title: `ITV Próxima a Caducar: ${vehicle.matricula}`,
                        message: `La ITV de tu vehículo ${vehicle.modelo} (${vehicle.matricula}) caduca pronto o ya ha caducado.`,
                        detailLabel: 'Fecha de Caducidad',
                        detailValue: itvDate.toLocaleDateString()
                    });
                    await this.sleep(1000);
                } catch (err) {
                    console.error(`[AlertService] Failed to send ITV email:`, err);
                }
            }
        }

        // Check Insurance
        if (vehicle.seguro_fecha_vencimiento) {
            const insuranceDate = new Date(vehicle.seguro_fecha_vencimiento);
            if (insuranceDate <= thirtyDaysFromNow) {
                console.log(`[AlertService] Insurance Alert triggered for ${vehicle.matricula}. Expiry: ${insuranceDate.toLocaleDateString()}`);
                try {
                    await emailService.sendAutomatedAlert(vehicle.propietario.email, {
                        title: `Seguro Próximo a Vencer: ${vehicle.matricula}`,
                        message: `El seguro de tu vehículo ${vehicle.modelo} (${vehicle.matricula}) vence pronto o ya ha vencido.`,
                        detailLabel: 'Fecha de Vencimiento',
                        detailValue: insuranceDate.toLocaleDateString()
                    });
                    await this.sleep(1000);
                } catch (err) {
                    console.error(`[AlertService] Failed to send Insurance email:`, err);
                }
            }
        }

        // 4. Always notify ADMIN for any triggered alert if not the same person
        const adminEmail = process.env.SMTP_USER;
        if (adminEmail && vehicle.propietario?.email !== adminEmail) {
            console.log(`[AlertService] Sending shadow copy to Admin: ${adminEmail}`);
            try {
                await emailService.sendAutomatedAlert(adminEmail, {
                    title: `COPIA ADMIN: Alerta Vehículo ${vehicle.matricula}`,
                    message: `Se ha generado una alerta automática para el coche de ${vehicle.propietario?.nombre || 'usuario'}.`,
                    detailLabel: 'Vehículo',
                    detailValue: `${vehicle.modelo} (${vehicle.matricula})`
                });
                await this.sleep(600);
            } catch (e) {
                console.error('[AlertService] Failed to send admin copy', e);
            }
        }
    }

    async sendMonthlyAdminSummary() {
        console.log('[AlertService] Generating Monthly Admin Summary...');
        const adminEmail = process.env.SMTP_USER;
        if (!adminEmail) return;

        const vehicleRepository = AppDataSource.getRepository(Vehicle);
        const refuelRepository = AppDataSource.getRepository(Refuel);
        const maintenanceRepository = AppDataSource.getRepository(Maintenance);

        // Get last month's date range
        const now = new Date();
        const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const refuels = await refuelRepository.createQueryBuilder("r")
            .where("r.fecha >= :start AND r.fecha < :end", { start: firstOfLastMonth, end: firstOfCurrentMonth })
            .getMany();

        const maintenances = await maintenanceRepository.createQueryBuilder("m")
            .where("m.fecha >= :start AND m.fecha < :end", { start: firstOfLastMonth, end: firstOfCurrentMonth })
            .getMany();

        const totalFuel = refuels.reduce((acc, r) => acc + (Number(r.costeTotal) || 0), 0);
        const totalMaint = maintenances.reduce((acc, m) => acc + (Number(m.costePieza) || 0) + (Number(m.costeTaller) || 0), 0);

        const monthName = firstOfLastMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        await emailService.sendAutomatedAlert(adminEmail, {
            title: `Resumen de Gastos: ${monthName}`,
            message: `Aquí tienes el resumen automático de gastos de toda tu flota para el mes pasado.`,
            detailLabel: 'Total Invertido (Combustible + Mantenimiento)',
            detailValue: `${(totalFuel + totalMaint).toFixed(2)} €`
        });

        console.log('[AlertService] Monthly summary sent to admin.');
    }

    async checkDriverAlerts(driverId: number) {
        console.log(`[AlertService] Checking alerts for driver ${driverId}...`);
        const driverRepository = AppDataSource.getRepository(Driver);
        const driver = await driverRepository.findOneBy({ id: driverId });

        if (!driver || !driver.email) return;

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        if (driver.fechaRenovacionCarnet) {
            const licenseDate = new Date(driver.fechaRenovacionCarnet);
            if (licenseDate <= thirtyDaysFromNow) {
                console.log(`[AlertService] License Alert triggered for ${driver.nombre}. Expiry: ${licenseDate.toLocaleDateString()}`);
                try {
                    await emailService.sendAutomatedAlert(driver.email, {
                        title: `Carnet de Conducir Próximo a Caducar`,
                        message: `Hola ${driver.nombre}, tu carnet de conducir caduca pronto o ya ha caducado.`,
                        detailLabel: 'Fecha de Renovación',
                        detailValue: licenseDate.toLocaleDateString('es-ES')
                    });

                    // Shadow copy to admin if not the same
                    const adminEmail = process.env.SMTP_USER;
                    if (adminEmail && driver.email !== adminEmail) {
                        await emailService.sendAutomatedAlert(adminEmail, {
                            title: `COPIA ADMIN: Caducidad Carnet - ${driver.nombre}`,
                            message: `El carnet de conducir de ${driver.nombre} caduca el ${licenseDate.toLocaleDateString('es-ES')}.`,
                            detailLabel: 'Conductor',
                            detailValue: driver.nombre
                        });
                    }
                } catch (err) {
                    console.error(`[AlertService] Failed to send License email:`, err);
                }
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
