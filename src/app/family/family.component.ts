import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Driver } from '../core/services/api.service';
import { DataService } from '../core/services/data.service';
import { ToastService } from '../core/services/toast.service';

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
    private apiService = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);

    isAdmin = false;
    isLeader = false;
    private toastService = inject(ToastService);

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

        this.apiService.getAllFamilies().subscribe({
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
        this.apiService.getDrivers().subscribe(drivers => this.allDrivers = drivers);
        this.apiService.getVehicles().subscribe(vehicles => this.allVehicles = vehicles);
    }

    createFamily() {
        if (!this.createName.trim()) return;
        this.dataService.loading.set(true);
        this.apiService.createFamily(this.createName).subscribe({
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
        this.apiService.joinFamily(this.joinCode).subscribe({
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
        this.apiService.createFamilyAdmin(this.adminNewFamilyName).subscribe({
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
        this.apiService.deleteFamily(id).subscribe({
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

    selectFamilyForEdit(family: any) {
        this.selectedFamily = family;
    }

    assignDriver() {
        if (!this.selectedFamily || !this.selectedDriverId) return;
        const driver = this.allDrivers.find(d => d.id == this.selectedDriverId);
        if (!driver) return;

        const updatedDriver = { ...driver, familyId: this.selectedFamily.id, family: undefined };
        if (updatedDriver.id) {
            this.apiService.updateDriver(updatedDriver.id, updatedDriver).subscribe({
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
        this.apiService.updateDriver(driver.id, updatedDriver).subscribe({
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
            this.apiService.updateVehicle(updatedVehicle.id, updatedVehicle).subscribe({
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
        this.apiService.updateVehicle(vehicle.id, updatedVehicle).subscribe({
            next: () => {
                this.selectedFamily.vehicles = this.selectedFamily.vehicles.filter((v: any) => v.id !== vehicle.id);
                this.cdr.detectChanges();
            },
            error: () => alert('Error desvinculando vehículo')
        });
    }
}
