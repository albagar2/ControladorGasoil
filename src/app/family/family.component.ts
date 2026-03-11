import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../core/services/family.service';
import { DriverService } from '../core/services/driver.service';
import { VehicleService } from '../core/services/vehicle.service';
import { DataService } from '../core/services/data.service';
import { Driver } from '../core/models/driver.model';
import { ToastService } from '../core/services/toast.service';
import { ApiService } from '../core/services/api.service';

@Component({
    selector: 'app-family',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './family.component.html',
    styleUrls: ['./family.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FamilyComponent implements OnInit {
    public dataService = inject(DataService);
    private familyService = inject(FamilyService);
    private driverService = inject(DriverService);
    private vehicleService = inject(VehicleService);
    private cdr = inject(ChangeDetectorRef);

    isAdmin = false;
    isLeader = false;
    isCleaningUp = false;
    private toastService = inject(ToastService);
    private apiService = inject(ApiService);

    // Forms
    createName = '';
    joinCode = '';

    // Admin Section State
    allFamilies: any[] = [];
    allDrivers: Driver[] = [];
    allVehicles: any[] = [];
    selectedFamily: any = null;
    selectedDriverId: number | null = null;
    selectedVehicleId: number | null = null;
    adminNewFamilyName = '';

    ngOnInit() {
        this.checkAdmin();
        if (this.isAdmin) {
            this.loadAdminData();
        }
    }

    checkAdmin() {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.isAdmin = user.role === 'admin';
            this.isLeader = user.role === 'leader';
        }
    }

    loadAdminData() {
        if (!this.isAdmin) return;
        this.dataService.loading.set(true);

        this.familyService.getAllFamilies().subscribe({
            next: (families: any[]) => {
                this.allFamilies = families;
                this.dataService.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('[ADMIN] Error:', err);
                this.toastService.error('Error cargando familias');
                this.dataService.loading.set(false);
                this.cdr.detectChanges();
            }
        });

        // Load drivers and vehicles for assignment
        this.driverService.getDrivers().subscribe(drivers => this.allDrivers = drivers);
        this.vehicleService.getVehicles().subscribe(vehicles => this.allVehicles = vehicles);
    }

    createFamily() {
        if (!this.createName.trim()) return;
        this.dataService.loading.set(true);
        this.familyService.createFamily(this.createName).subscribe({
            next: () => {
                this.toastService.success('¡Familia creada con éxito!');
                this.dataService.loadAllData();
                this.createName = '';
            },
            error: () => {
                this.toastService.error('Error al crear la familia.');
                this.dataService.loading.set(false);
            }
        });
    }

    joinFamily() {
        if (!this.joinCode.trim()) return;
        this.dataService.loading.set(true);
        this.familyService.joinFamily(this.joinCode).subscribe({
            next: () => {
                this.toastService.success('¡Te has unido a la familia!');
                this.dataService.loadAllData();
                this.joinCode = '';
            },
            error: () => {
                this.toastService.error('Código inválido o error al unirse.');
                this.dataService.loading.set(false);
            }
        });
    }

    copyCode() {
        const code = this.dataService.family()?.codigo;
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                this.toastService.info('Código copiado al portapapeles');
            });
        }
    }

    createFamilyAdmin() {
        if (!this.adminNewFamilyName.trim()) return;
        this.familyService.createFamilyAdmin(this.adminNewFamilyName).subscribe({
            next: (fam) => {
                this.toastService.success('Familia creada (Modo Admin)');
                this.allFamilies.push(fam);
                this.adminNewFamilyName = '';
                this.cdr.detectChanges();
            },
            error: () => {
                this.toastService.error('Error creando familia');
                this.cdr.detectChanges();
            }
        });
    }

    deleteFamily(id: number) {
        if (!confirm('¿Eliminar esta familia? Se desasignarán todos sus miembros y vehículos.')) return;
        this.familyService.deleteFamily(id).subscribe({
            next: () => {
                this.allFamilies = this.allFamilies.filter(f => f.id !== id);
                this.selectedFamily = null;
                this.toastService.success('Familia eliminada');
                this.cdr.detectChanges();
            },
            error: () => {
                this.toastService.error('Error eliminando familia');
                this.cdr.detectChanges();
            }
        });
    }

    cleanupDrivePhotos() {
        if (!confirm('¿Estás seguro de que quieres eliminar las fotos y recibos con más de un año de antigüedad en Google Drive? Esta acción no se puede deshacer.')) {
            return;
        }

        this.isCleaningUp = true;
        this.dataService.loading.set(true);
        this.apiService.cleanupDrivePhotos().subscribe({
            next: (res: any) => {
                this.toastService.success(`Limpieza completada: ${res.deletedCount || 0} fotos eliminadas.`);
                this.isCleaningUp = false;
                this.dataService.loading.set(false);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error cleaning up photos:', err);
                this.toastService.error('Error al limpiar las fotos antiguas de Drive. Revisa tu consola para más detalles.');
                this.isCleaningUp = false;
                this.dataService.loading.set(false);
                this.cdr.detectChanges();
            }
        });
    }

    selectFamilyForEdit(family: any) {
        this.selectedFamily = family;
    }

    assignDriver() {
        if (!this.selectedFamily || !this.selectedDriverId) return;
        const driver = this.allDrivers.find(d => d.id == this.selectedDriverId);
        if (!driver) return;

        const updatedDriver = { ...driver, familyId: this.selectedFamily.id, family: undefined };
        if (updatedDriver.id) {
            this.driverService.updateDriver(updatedDriver.id, updatedDriver).subscribe({
                next: (res) => {
                    if (!this.selectedFamily.drivers) this.selectedFamily.drivers = [];
                    this.selectedFamily.drivers.push(res);
                    this.selectedDriverId = null;
                    this.cdr.detectChanges();
                },
                error: () => this.toastService.error('Error asignando conductor')
            });
        }
    }

    removeDriver(driver: Driver) {
        if (!confirm(`¿Desvincular a ${driver.nombre} de esta familia?`)) return;
        if (!driver.id) return;
        const updatedDriver = { ...driver, familyId: null as any };
        this.driverService.updateDriver(driver.id, updatedDriver).subscribe({
            next: () => {
                this.selectedFamily.drivers = this.selectedFamily.drivers.filter((d: Driver) => d.id !== driver.id);
                this.cdr.detectChanges();
            },
            error: () => alert('Error desvinculando conductor')
        });
    }

    assignVehicle() {
        if (!this.selectedFamily || !this.selectedVehicleId) return;
        const vehicle = this.allVehicles.find(v => v.id == this.selectedVehicleId);
        if (!vehicle) return;

        const updatedVehicle = { ...vehicle, familyId: this.selectedFamily.id, family: undefined };
        if (updatedVehicle.id) {
            this.vehicleService.updateVehicle(updatedVehicle.id, updatedVehicle).subscribe({
                next: (res) => {
                    if (!this.selectedFamily.vehicles) this.selectedFamily.vehicles = [];
                    this.selectedFamily.vehicles.push(res);
                    this.selectedVehicleId = null;
                    this.cdr.detectChanges();
                },
                error: () => this.toastService.error('Error asignando vehículo')
            });
        }
    }

    removeVehicle(vehicle: any) {
        if (!confirm(`¿Desvincular ${vehicle.matricula}?`)) return;
        if (!vehicle.id) return;
        const updatedVehicle = { ...vehicle, familyId: null as any };
        this.vehicleService.updateVehicle(vehicle.id, updatedVehicle).subscribe({
            next: () => {
                this.selectedFamily.vehicles = this.selectedFamily.vehicles.filter((v: any) => v.id !== vehicle.id);
                this.cdr.detectChanges();
            },
            error: () => alert('Error desvinculando vehículo')
        });
    }
}
