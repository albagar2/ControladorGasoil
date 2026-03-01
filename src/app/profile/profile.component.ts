import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Driver } from '../core/services/api.service';
import { DataService } from '../core/services/data.service';
import { ToastService } from '../core/services/toast.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    public dataService = inject(DataService);
    private apiService = inject(ApiService);
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
    isDarkMode = signal(false);

    ngOnInit(): void {
        this.syncWithService();
        this.checkTheme();
    }

    private checkTheme(): void {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.isDarkMode.set(true);
            document.documentElement.classList.add('dark');
        } else {
            this.isDarkMode.set(false);
            document.documentElement.classList.remove('dark');
        }
    }

    toggleTheme(): void {
        this.isDarkMode.update(v => !v);
        if (this.isDarkMode()) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    private syncWithService(): void {
        const current = this.dataService.currentUser();
        if (current) {
            this.user.set({ ...current, puntosMaximos: 15 });
        } else {
            // If no user in service, try to load it (DataService.loadAllData handles this, but we can be safe)
            const userStr = localStorage.getItem('currentUser') || localStorage.getItem('user');
            if (!userStr) {
                this.router.navigate(['/login']);
            }
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
            fechaRenovacionCarnet: userData.fechaRenovacionCarnet
        };

        if (this.password()) {
            updateData.password = this.password();
        }

        this.apiService.updateProfile(updateData).subscribe({
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
        this.apiService.deleteProfile().subscribe({
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
