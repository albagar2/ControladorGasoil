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
                this.vehicles.set(result.vehicles);
                this.drivers.set(result.drivers);
                this.refuels.set(result.refuels);
                this.maintenances.set(result.maintenances);
                this.family.set(result.family);
            },
            error: (err) => {
                console.error('Error loading data', err);
                this.errorMessage.set('Error al cargar datos del servidor.');
            }
        });
    }
}
