import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService, Vehicle, Driver, Refuel, Maintenance } from './api.service';
import { MaintenanceService, MaintenanceAlert } from './maintenance.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private apiService = inject(ApiService);
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
        return this.maintenanceService.getUpcomingMaintenance(this.vehicles(), this.maintenances());
    });

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
            vehicles: this.apiService.getVehicles().pipe(catchError(() => of([]))),
            drivers: this.apiService.getDrivers().pipe(catchError(() => of([]))),
            refuels: this.apiService.getRefuels().pipe(catchError(() => of([]))),
            maintenances: this.apiService.getMaintenances().pipe(catchError(() => of([]))),
            family: this.apiService.getMyFamily().pipe(catchError(err => {
                if (err.status === 404) return of(null);
                console.error('Error loading family', err);
                return of(null);
            }))
        }).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (result) => {
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
