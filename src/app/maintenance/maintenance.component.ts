import { Component, OnInit, ChangeDetectorRef, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Maintenance, Vehicle, Driver } from '../core/services/api.service';
import { MaintenanceService } from '../core/services/maintenance.service';
import { DataService } from '../core/services/data.service';
import { MaintenanceFormComponent } from './maintenance-form/maintenance-form.component';
import { ToastService } from '../core/services/toast.service';

@Component({
    selector: 'app-maintenance',
    standalone: true,
    imports: [CommonModule, FormsModule, MaintenanceFormComponent],
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaintenanceComponent implements OnInit {
    public dataService = inject(DataService);
    private apiService = inject(ApiService);
    private maintenanceService = inject(MaintenanceService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    // Filter Signals
    searchQuery = signal('');
    filterVehicleId = signal<number | null>(null);
    filterType = signal('');
    filterDateFrom = signal('');
    filterDateTo = signal('');

    showModal = false;
    currentMaintenance?: Maintenance;

    // Computed Filtered List
    filteredMaintenances = computed(() => {
        let filtered = [...this.dataService.maintenances()];
        const query = this.searchQuery().toLowerCase().trim();
        const vId = this.filterVehicleId();
        const type = this.filterType();
        const from = this.filterDateFrom();
        const to = this.filterDateTo();

        if (query) {
            filtered = filtered.filter(m =>
                m.vehiculo?.modelo?.toLowerCase().includes(query) ||
                m.vehiculo?.matricula?.toLowerCase().includes(query) ||
                m.tipo?.toLowerCase().includes(query) ||
                m.proveedor?.toLowerCase().includes(query)
            );
        }

        if (vId) filtered = filtered.filter(m => m.vehiculoId === vId);
        if (type) filtered = filtered.filter(m => m.tipo === type);
        if (from) filtered = filtered.filter(m => new Date(m.fecha) >= new Date(from));
        if (to) filtered = filtered.filter(m => new Date(m.fecha) <= new Date(to));

        return filtered;
    });

    // Computed Stats
    stats = computed(() => {
        const maintenances = this.dataService.maintenances();
        const vehicles = this.dataService.vehicles();

        if (!maintenances.length) {
            return { totalSpent: 0, mostRecentDate: 'N/A', vehicleWithMostMaintenances: 'N/A' };
        }

        const totalSpent = maintenances.reduce((sum, m) =>
            sum + (Number(m.costePieza || 0) + Number(m.costeTaller || 0)), 0
        );

        const sorted = [...maintenances].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        const mostRecentDate = sorted[0] ? new Date(sorted[0].fecha).toLocaleDateString() : 'N/A';

        const vehicleCounts: Record<number, number> = {};
        maintenances.forEach(m => {
            if (m.vehiculoId) vehicleCounts[m.vehiculoId] = (vehicleCounts[m.vehiculoId] || 0) + 1;
        });

        let maxCount = 0;
        let maxVehicleId = 0;
        Object.entries(vehicleCounts).forEach(([id, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxVehicleId = Number(id);
            }
        });

        const vehicle = vehicles.find(v => v.id === maxVehicleId);
        const vehicleWithMostMaintenances = vehicle ? `${vehicle.modelo} (${maxCount})` : 'N/A';

        return { totalSpent, mostRecentDate, vehicleWithMostMaintenances };
    });

    maintenanceTypes = computed(() => {
        const types = new Set(this.dataService.maintenances().map(m => m.tipo).filter(Boolean));
        return Array.from(types);
    });

    alerts = computed(() => {
        return this.dataService.upcomingMaintenance();
    });

    ngOnInit() {
        // Data is managed by Dashboard/DataService
    }

    clearFilters() {
        this.searchQuery.set('');
        this.filterVehicleId.set(null);
        this.filterType.set('');
        this.filterDateFrom.set('');
        this.filterDateTo.set('');
    }

    openModal(maintenance?: Maintenance) {
        this.currentMaintenance = maintenance;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.currentMaintenance = undefined;
    }

    onSaveMaintenance(maintenance: Maintenance) {
        if (!maintenance.vehiculoId || !maintenance.conductorId) {
            this.toastService.warning('Datos incompletos.');
            return;
        }

        this.dataService.loading.set(true);
        const obs = maintenance.id
            ? this.apiService.updateMaintenance(maintenance.id, maintenance)
            : this.apiService.createMaintenance(maintenance);

        obs.subscribe({
            next: () => {
                this.toastService.success(maintenance.id ? 'Mantenimiento actualizado' : 'Mantenimiento registrado');
                this.dataService.loadAllData();
                this.closeModal();
            },
            error: (err: any) => {
                console.error('Error saving maintenance', err);
                this.toastService.error('Error al guardar el mantenimiento');
                this.dataService.loading.set(false);
            }
        });
    }

    deleteMaintenance(id: number) {
        if (!confirm('¿Estás seguro de que deseas eliminar este mantenimiento?')) return;
        this.dataService.loading.set(true);
        this.apiService.deleteMaintenance(id).subscribe({
            next: () => {
                this.toastService.success('Mantenimiento eliminado');
                this.dataService.loadAllData();
            },
            error: (err: any) => {
                console.error('Error deleting maintenance', err);
                this.toastService.error('Error al eliminar');
                this.dataService.loading.set(false);
            }
        });
    }

    toNumber(val: any): number {
        return Number(val);
    }

    sendAlertEmail(alert: any) {
        const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
        let email = '';
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                email = user.email;
            } catch (e) { }
        }

        if (!email) {
            this.toastService.error('No se pudo determinar tu correo para enviar la alerta.');
            return;
        }

        this.dataService.loading.set(true);
        this.apiService.sendMaintenanceAlert({
            to: email,
            vehicleName: alert.vehicle,
            maintenanceType: alert.type,
            date: alert.date || new Date()
        }).subscribe({
            next: () => {
                this.toastService.success(`Alerta enviada correctamente a ${email}`);
                this.dataService.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error enviando alerta', err);
                this.toastService.error('Error enviando la alerta. Revisa la configuración de tu correo.');
                this.dataService.loading.set(false);
            }
        });
    }
}
