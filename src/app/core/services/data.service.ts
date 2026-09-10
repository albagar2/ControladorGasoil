import { Injectable, signal, computed, inject } from '@angular/core';
import { VehicleService } from './vehicle.service';
import { DriverService } from './driver.service';
import { RefuelService } from './refuel.service';
import { MaintenanceApiService } from './maintenance-api.service';
import { FamilyService } from './family.service';
import { MaintenanceService } from './maintenance.service';
import { Vehicle } from '../models/vehicle.model';
import { Driver } from '../models/driver.model';
import { Refuel } from '../models/refuel.model';
import { Maintenance } from '../models/maintenance.model';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private vehicleService = inject(VehicleService);
    private driverService = inject(DriverService);
    private refuelService = inject(RefuelService);
    private maintenanceApiService = inject(MaintenanceApiService);
    private familyService = inject(FamilyService);
    private maintenanceService = inject(MaintenanceService);

    // State Signals
    vehicles = signal<Vehicle[]>([]);
    drivers = signal<Driver[]>([]);
    refuels = signal<Refuel[]>([]);
    maintenances = signal<Maintenance[]>([]);
    family = signal<any>(null);
    loading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);
    currentUser = signal<Driver | null>(null);
    dismissedAlertIds = signal<string[]>(JSON.parse(localStorage.getItem('dismissedAlerts') || '[]'));

    // Computed Signals
    totalVehicles = computed(() => this.vehicles().length);
    totalDrivers = computed(() => this.drivers().length);

    totalCost = computed(() => {
        return this.refuels().reduce((acc, curr) => acc + Number(curr.costeTotal || 0), 0);
    });

    avgPrice = computed(() => {
        const total = this.refuels().reduce((acc, curr) => acc + Number(curr.precioPorLitro || 0), 0);
        return this.refuels().length > 0 ? (total / this.refuels().length) : 1.40;
    });

    upcomingMaintenance = computed(() => {
        const alerts = this.maintenanceService.getUpcomingMaintenance(this.vehicles(), this.maintenances());
        return alerts.filter(a => !this.dismissedAlertIds().includes(a.id));
    });

    dismissAlert(alertId: string) {
        const current = this.dismissedAlertIds();
        if (!current.includes(alertId)) {
            const newValue = [...current, alertId];
            this.dismissedAlertIds.set(newValue);
            localStorage.setItem('dismissedAlerts', JSON.stringify(newValue));
        }
    }

    loadAllData() {
        this.loading.set(true);
        this.errorMessage.set(null);

        // Load current user from localStorage
        const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
        if (userStr) {
            try {
                this.currentUser.set(JSON.parse(userStr));
            } catch (e) {
                console.error('Error parsing user from localStorage', e);
            }
        } else {
            this.currentUser.set(null);
        }

        forkJoin({
            vehicles: this.vehicleService.getVehicles().pipe(catchError(() => of([]))),
            drivers: this.driverService.getDrivers().pipe(catchError(() => of([]))),
            refuels: this.refuelService.getRefuels().pipe(catchError(() => of([]))),
            maintenances: this.maintenanceApiService.getMaintenances().pipe(catchError(() => of([]))),
            family: this.familyService.getMyFamily().pipe(catchError(err => {
                if (err.status === 404) return of(null);
                console.error('Error loading family', err);
                return of(null);
            }))
        }).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (result: any) => {
                const vehiclesList = (result.vehicles && result.vehicles.length > 0) ? result.vehicles : this.getDemoVehicles();
                const driversList = (result.drivers && result.drivers.length > 0) ? result.drivers : this.getDemoDrivers();
                const refuelsList = (result.refuels && result.refuels.length > 0) ? result.refuels : this.getDemoRefuels(vehiclesList);
                const maintsList = (result.maintenances && result.maintenances.length > 0) ? result.maintenances : this.getDemoMaintenances(vehiclesList);

                this.vehicles.set(vehiclesList);
                this.drivers.set(driversList);
                this.refuels.set(refuelsList);
                this.maintenances.set(maintsList);
                this.family.set(result.family);
            },
            error: (err) => {
                console.error('Error loading data', err);
                const vehiclesList = this.getDemoVehicles();
                const driversList = this.getDemoDrivers();
                this.vehicles.set(vehiclesList);
                this.drivers.set(driversList);
                this.refuels.set(this.getDemoRefuels(vehiclesList));
                this.maintenances.set(this.getDemoMaintenances(vehiclesList));
            }
        });
    }

    private getDemoVehicles(): Vehicle[] {
        return [
            {
                id: 1,
                matricula: '1234 ABC',
                modelo: 'Toyota Corolla Híbrido',
                combustible: 'Híbrido',
                distintivo: 'ECO',
                seguro_compania: 'Mapfre',
                seguro_numero_poliza: 'POL-884920',
                seguro_fecha_vencimiento: new Date('2026-11-30'),
                seguro_cobertura: 'Todo Riesgo',
                seguro_precio: 450,
                itv_estado: 'Favorable',
                itv_fecha_caducidad: new Date('2026-10-15'),
                itv_kilometraje: 45000,
                anioMatriculacion: 2021,
                propietarioId: 1,
                kilometrajeActual: 52400
            },
            {
                id: 2,
                matricula: '5678 XYZ',
                modelo: 'Volkswagen Golf 2.0 TDI',
                combustible: 'Diésel',
                distintivo: 'C',
                seguro_compania: 'Mutua Madrileña',
                seguro_numero_poliza: 'MM-994102',
                seguro_fecha_vencimiento: new Date('2027-04-15'),
                seguro_cobertura: 'Terceros Ampliado',
                seguro_precio: 380,
                itv_estado: 'Favorable',
                itv_fecha_caducidad: new Date('2027-05-04'),
                itv_kilometraje: 110000,
                anioMatriculacion: 2019,
                propietarioId: 1,
                kilometrajeActual: 118200
            }
        ];
    }

    private getDemoDrivers(): Driver[] {
        return [
            {
                id: 1,
                nombre: 'Usuario Demostración',
                dni: '12345678Z',
                email: 'demo@garajefamiliar.com',
                telefono: '600123456',
                fechaRenovacionCarnet: new Date('2029-08-20'),
                puntos: 15,
                puntosMaximos: 15,
                role: 'admin'
            },
            {
                id: 2,
                nombre: 'Elena Martín',
                dni: '87654321X',
                email: 'elena@garajefamiliar.com',
                telefono: '611987654',
                fechaRenovacionCarnet: new Date('2028-03-10'),
                puntos: 14,
                puntosMaximos: 15,
                role: 'conductor'
            }
        ];
    }

    private getDemoRefuels(vehicles: Vehicle[]): Refuel[] {
        const v1 = vehicles[0] || undefined;
        const v2 = vehicles[1] || undefined;
        return [
            {
                id: 1,
                fecha: new Date('2026-09-01'),
                vehiculoId: 1,
                vehiculo: v1,
                kilometraje: 52000,
                litros: 42,
                precioPorLitro: 1.48,
                costeTotal: 62.16,
                proveedor: 'Repsol Auto',
                tipoCombustible: 'Gasolina 95'
            },
            {
                id: 2,
                fecha: new Date('2026-08-20'),
                vehiculoId: 2,
                vehiculo: v2,
                kilometraje: 117800,
                litros: 50,
                precioPorLitro: 1.39,
                costeTotal: 69.50,
                proveedor: 'Cepsa Express',
                tipoCombustible: 'Diésel e+'
            },
            {
                id: 3,
                fecha: new Date('2026-08-05'),
                vehiculoId: 1,
                vehiculo: v1,
                kilometraje: 51400,
                litros: 38,
                precioPorLitro: 1.45,
                costeTotal: 55.10,
                proveedor: 'BP Ultimate',
                tipoCombustible: 'Gasolina 95'
            }
        ];
    }

    private getDemoMaintenances(vehicles: Vehicle[]): Maintenance[] {
        const v1 = vehicles[0] || undefined;
        const v2 = vehicles[1] || undefined;
        return [
            {
                id: 1,
                fecha: new Date('2026-08-01'),
                kilometraje: 50000,
                tipo: 'Aceite y Filtros',
                proveedor: 'Taller Oficial Toyota',
                costePieza: 65,
                costeTaller: 55,
                observaciones: 'Sustitución de aceite sintético 0W20 y filtro de polen.',
                vehiculoId: 1,
                vehiculo: v1
            },
            {
                id: 2,
                fecha: new Date('2026-06-15'),
                kilometraje: 115000,
                tipo: 'Frenos',
                proveedor: 'Norauto',
                costePieza: 110,
                costeTaller: 70,
                observaciones: 'Cambio de pastillas de freno delanteras.',
                vehiculoId: 2,
                vehiculo: v2
            }
        ];
    }
}
