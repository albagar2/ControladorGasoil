
import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Driver } from '../core/services/api.service';
import { DataService } from '../core/services/data.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/services/toast.service';
import { TableCardComponent } from '../shared/components/table-card/table-card.component';
import { ModalComponent } from '../shared/components/modal/modal.component';

@Component({
    selector: 'app-drivers',
    standalone: true,
    imports: [CommonModule, FormsModule, TableCardComponent, ModalComponent],
    templateUrl: './drivers.component.html',
    styleUrls: ['./drivers.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversComponent {
    public dataService = inject(DataService);
    private apiService = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);

    showModal = false;
    isEditing = false;
    currentDriver: Driver = this.getEmptyDriver();
    isAdmin = false;

    private toastService = inject(ToastService);

    ngOnInit(): void {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            this.isAdmin = currentUser.role === 'admin';
        }
    }

    openAddModal() {
        this.isEditing = false;
        this.currentDriver = this.getEmptyDriver();
        this.showModal = true;
    }

    openEditModal(driver: Driver) {
        this.isEditing = true;
        this.currentDriver = { ...driver };
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    saveDriver() {
        const error = this.validateDriver();
        if (error) {
            this.toastService.warning(error);
            return;
        }

        const obs = (this.isEditing && this.currentDriver.id)
            ? this.apiService.updateDriver(this.currentDriver.id, this.currentDriver)
            : this.apiService.createDriver(this.currentDriver);

        obs.subscribe({
            next: () => {
                this.toastService.success(this.isEditing ? 'Conductor actualizado correctamente' : 'Conductor creado correctamente');
                this.dataService.loadAllData();
                this.closeModal();
            },
            error: (err) => {
                console.error('Error saving driver', err);
                this.toastService.error('Error al guardar el conductor.');
            }
        });
    }

    deleteDriver(id: number | undefined) {
        if (!id) return;
        if (confirm('¿Estás seguro de eliminar este conductor?')) {
            this.apiService.deleteDriver(id).subscribe({
                next: () => {
                    this.toastService.success('Conductor eliminado correctamente');
                    this.dataService.loadAllData();
                },
                error: (err) => {
                    console.error('Error deleting driver', err);
                    this.toastService.error('Error al eliminar el conductor');
                }
            });
        }
    }

    validateDriver(): string | null {
        const d = this.currentDriver;
        if (!d.nombre || d.nombre.trim().length === 0) return 'El nombre es obligatorio.';
        if (!this.isValidDNI(d.dni)) return 'El DNI no es válido (Formato: 12345678X).';
        if (!this.isValidPhone(d.telefono)) return 'El teléfono no es válido (9 dígitos).';
        if (d.puntos < 0 || d.puntos > 15) return 'Los puntos deben estar entre 0 y 15.';
        return null;
    }

    isValidDNI(dni: string): boolean {
        const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
        if (!dniRegex.test(dni)) return false;

        const nieCheck = dni.toUpperCase();
        const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
        const number = parseInt(nieCheck.substring(0, 8), 10);
        const letter = nieCheck.substring(8, 9);
        return letters.charAt(number % 23) === letter;
    }

    isValidPhone(phone: string): boolean {
        return /^[6789]\d{8}$/.test(phone);
    }

    private getEmptyDriver(): Driver {
        return {
            nombre: '', dni: '', telefono: '',
            fechaRenovacionCarnet: new Date(),
            puntos: 12, puntosMaximos: 15
        };
    }
}
