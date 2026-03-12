import { Component, OnInit, ChangeDetectorRef, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintenanceApiService } from '../core/services/maintenance-api.service';
import { EmailService } from '../core/services/email.service';
import { MaintenanceService } from '../core/services/maintenance.service';
import { DataService } from '../core/services/data.service';
import { Maintenance } from '../core/models/maintenance.model';
import { Vehicle } from '../core/models/vehicle.model';
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
    private maintenanceApiService = inject(MaintenanceApiService);
    private emailService = inject(EmailService);
    private maintenanceService = inject(MaintenanceService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    // Filter Signals
    searchQuery = signal('');
    filterVehicleId = signal<number | null>(null);
    filterType = signal('');
    filterDateFrom = signal('');
    filterDateTo = signal('');

    // Monthly navigation (empty string means "All History")
    selectedMonth = signal<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM

    showModal = false;
    currentMaintenance?: Maintenance;
    showNotifications = signal(true);

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

        // Apply Monthly Filter (Primary organization, only if not viewing "All")
        if (this.selectedMonth()) {
            const [year, month] = this.selectedMonth().split('-').map(Number);
            filtered = filtered.filter(m => {
                const date = new Date(m.fecha);
                return date.getFullYear() === year && (date.getMonth() + 1) === month;
            });
        }

        return filtered;
    });

    // Grouping logic
    collapsedVehicles = signal<Record<number, boolean>>({});

    groupedMaintenances = computed(() => {
        const maintenances = this.filteredMaintenances();
        const vehicles = this.dataService.vehicles();

        const groups: { vehicle: Vehicle, items: Maintenance[], totalSpent: number }[] = [];

        // Group by vehicle
        vehicles.forEach(v => {
            const items = maintenances.filter(m => m.vehiculoId === v.id);
            if (items.length > 0) {
                const totalSpent = items.reduce((acc, m) => acc + (Number(m.costePieza || 0) + Number(m.costeTaller || 0)), 0);
                groups.push({
                    vehicle: v,
                    items: items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
                    totalSpent
                });
            }
        });

        // Also handle items with no vehicle (shouldn't happen but good for safety)
        const orphanItems = maintenances.filter(m => !m.vehiculoId);
        if (orphanItems.length > 0) {
            const totalSpent = orphanItems.reduce((acc, m) => acc + (Number(m.costePieza || 0) + Number(m.costeTaller || 0)), 0);
            groups.push({
                vehicle: { modelo: 'Sin Vehículo', matricula: 'N/A' } as any,
                items: orphanItems,
                totalSpent
            });
        }

        return groups;
    });

    toggleNotifications() {
        this.showNotifications.set(!this.showNotifications());
    }

    toggleVehicle(vehicleId: number) {
        if (!vehicleId) return;
        const current = this.collapsedVehicles();
        this.collapsedVehicles.set({
            ...current,
            [vehicleId]: !current[vehicleId]
        });
    }

    isCollapsed(vehicleId: number): boolean {
        return !!this.collapsedVehicles()[vehicleId];
    }

    // Computed Stats
    stats = computed(() => {
        const maintenances = this.filteredMaintenances();
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

    onSaveMaintenance(maintenance: any) {
        const isFormData = maintenance instanceof FormData;

        // Basic validation
        if (isFormData) {
            if (!maintenance.get('vehiculoId') || !maintenance.get('conductorId')) {
                this.toastService.warning('Datos incompletos.');
                return;
            }
        } else if (!maintenance.vehiculoId || !maintenance.conductorId) {
            this.toastService.warning('Datos incompletos.');
            return;
        }

        const id = isFormData ? maintenance.get('id') : maintenance.id;

        this.dataService.loading.set(true);
        const obs = id
            ? this.maintenanceApiService.updateMaintenance(id, maintenance)
            : this.maintenanceApiService.createMaintenance(maintenance);

        obs.subscribe({
            next: () => {
                this.toastService.success(id ? 'Mantenimiento actualizado' : 'Mantenimiento registrado');
                this.dataService.loadAllData();
                this.closeModal();
            },
            error: (err: any) => {
                console.error('Error saving maintenance', err);
                this.toastService.error('Error al guardar el mantenimiento. Revisa los datos.');
                this.dataService.loading.set(false);
            }
        });
    }

    deleteMaintenance(id: number) {
        if (!confirm('¿Estás seguro de que deseas eliminar este mantenimiento?')) return;
        this.dataService.loading.set(true);
        this.maintenanceApiService.deleteMaintenance(id).subscribe({
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
        this.emailService.sendMaintenanceAlert({
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

    get monthName(): string {
        if (!this.selectedMonth()) return 'Todo el Historial';
        const [year, month] = this.selectedMonth().split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    prevMonth() {
        const [year, month] = this.selectedMonth().split('-').map(Number);
        const date = new Date(year, month - 2, 1);
        const newYear = date.getFullYear();
        const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        this.selectedMonth.set(`${newYear}-${newMonth}`);
    }

    nextMonth() {
        const [year, month] = this.selectedMonth().split('-').map(Number);
        const date = new Date(year, month, 1);
        const newYear = date.getFullYear();
        const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        this.selectedMonth.set(`${newYear}-${newMonth}`);
    }
}
