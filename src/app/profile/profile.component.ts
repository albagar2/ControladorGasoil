import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DriverService } from '../core/services/driver.service';
import { DataService } from '../core/services/data.service';
import { Driver } from '../core/models/driver.model';
import { ToastService } from '../core/services/toast.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    public dataService = inject(DataService);
    public themeService = inject(ThemeService);
    private driverService = inject(DriverService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    user = signal<Driver>({
        nombre: '',
        dni: '',
        telefono: '',
        puntos: 0,
        puntosMaximos: 15,
        fechaRenovacionCarnet: new Date()
    });

    password = signal('');
    confirmPassword = signal('');
    isEditing = signal(false);
    showDeleteModal = signal(false);

    licenseTypes = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D', 'BE', 'C1E', 'CE', 'D1E', 'DE'];

    ngOnInit(): void {
        this.syncWithService();
    }

    toggleTheme(): void {
        this.themeService.toggleDarkMode();
    }

    private syncWithService(): void {
        const current = this.dataService.currentUser();
        if (current) {
            this.user.set({
                ...current,
                puntosMaximos: 15,
                licenses: current.licenses || []
            });
        } else {
            // If no user in service, try to load it
            const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
            if (!userStr) {
                this.router.navigate(['/login']);
            }
        }
    }

    addLicense() {
        const currentUser = this.user();
        if ((currentUser.licenses?.length || 0) < 15) {
            const updatedLicenses = [...(currentUser.licenses || []), { type: 'B' as any, expirationDate: '' }];
            this.user.set({ ...currentUser, licenses: updatedLicenses });
        }
    }

    removeLicense(index: number) {
        const currentUser = this.user();
        if ((currentUser.licenses?.length || 0) > 1) {
            const updatedLicenses = [...(currentUser.licenses || [])];
            updatedLicenses.splice(index, 1);
            this.user.set({ ...currentUser, licenses: updatedLicenses });
        }
    }

    toggleEdit(): void {
        this.isEditing.set(true);
    }

    cancelEdit(): void {
        this.isEditing.set(false);
        this.password.set('');
        this.confirmPassword.set('');
        this.syncWithService();
    }

    saveProfile(): void {
        const userData = this.user();
        if (!userData.nombre.trim()) {
            this.toastService.warning('El nombre es obligatorio.');
            return;
        }

        // Check if all licenses have type and date
        if (userData.licenses) {
            for (const license of userData.licenses) {
                if (!license.type || !license.expirationDate) {
                    this.toastService.warning('Por favor, completa todos los datos de los carnets.');
                    return;
                }
            }
        }

        if (this.password() && this.password() !== this.confirmPassword()) {
            this.toastService.warning('Las contraseñas no coinciden.');
            return;
        }

        this.dataService.loading.set(true);
        const updateData: any = {
            nombre: userData.nombre,
            telefono: userData.telefono,
            email: userData.email,
            puntos: userData.puntos,
            licenses: userData.licenses
        };

        // Calculate the soonest expiration date to maintain compatibility with legacy field
        if (userData.licenses && userData.licenses.length > 0) {
            const dates = userData.licenses
                .map((l: any) => new Date(l.expirationDate).getTime())
                .filter((t: number) => !isNaN(t));

            if (dates.length > 0) {
                updateData.fechaRenovacionCarnet = new Date(Math.min(...dates));
            }
        }

        if (this.password()) {
            updateData.password = this.password();
        }

        this.driverService.updateProfile(updateData).subscribe({
            next: (updated: any) => {
                const newSession = { ...this.dataService.currentUser(), ...updated };
                this.dataService.currentUser.set(newSession);
                localStorage.setItem('currentUser', JSON.stringify(newSession));

                this.isEditing.set(false);
                this.password.set('');
                this.confirmPassword.set('');
                this.dataService.loading.set(false);

                this.toastService.success('Perfil actualizado correctamente.');
            },
            error: (err) => {
                console.error('Error updating profile', err);
                this.toastService.error(err.error?.message || 'Error al actualizar el perfil.');
                this.dataService.loading.set(false);
            }
        });
    }

    deleteAccount(): void {
        this.showDeleteModal.set(true);
    }

    confirmDelete(): void {
        this.dataService.loading.set(true);
        this.driverService.deleteProfile().subscribe({
            next: () => {
                this.toastService.info('Cuenta eliminada.');
                localStorage.clear();
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error('Error deleting account', err);
                this.toastService.error('Error al eliminar la cuenta.');
                this.dataService.loading.set(false);
                this.showDeleteModal.set(false);
            }
        });
    }
}
