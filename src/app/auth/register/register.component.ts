import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    driver: any = {
        nombre: '',
        dni: '',
        telefono: '',
        email: '',
        password: '',
        role: 'conductor',
        puntos: 15,
        licenses: [
            { type: 'B', expirationDate: '' }
        ],
        familyNombre: '',
        familyCodigo: ''
    };
    familyOption: 'none' | 'create' | 'join' = 'none';
    confirmPassword = '';
    errorMessage = '';

    licenseTypes = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D', 'BE', 'C1E', 'CE', 'D1E', 'DE'];

    isLoading = false;
    showPassword = false;
    showConfirmPassword = false;

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        if (localStorage.getItem('token')) {
            this.router.navigate(['/dashboard']);
        }
    }

    addLicense() {
        if (this.driver.licenses.length < 15) {
            this.driver.licenses.push({ type: 'B', expirationDate: '' });
        }
    }

    removeLicense(index: number) {
        if (this.driver.licenses.length > 1) {
            this.driver.licenses.splice(index, 1);
        }
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    register() {
        if (this.isLoading) return;

        // Check if all licenses have type and date
        for (const license of this.driver.licenses) {
            if (!license.type || !license.expirationDate) {
                this.errorMessage = 'Por favor, completa todos los datos de los carnets.';
                return;
            }
        }

        if (this.driver.password !== this.confirmPassword) {
            this.errorMessage = 'Las contraseñas no coinciden.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        // Calculate the soonest expiration date to maintain compatibility with legacy field
        const dates = this.driver.licenses
            .map((l: any) => new Date(l.expirationDate).getTime())
            .filter((t: number) => !isNaN(t));

        const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date();
        this.driver.fechaRenovacionCarnet = minDate;

        const registrationData = { ...this.driver };
        if (this.familyOption === 'create') {
            delete registrationData.familyCodigo;
        } else if (this.familyOption === 'join') {
            delete registrationData.familyNombre;
        } else {
            delete registrationData.familyNombre;
            delete registrationData.familyCodigo;
        }

        this.authService.register(registrationData).subscribe({
            next: (res: any) => {
                if (res.familyCode) {
                    alert(`¡Cuenta creada! Código de tu nueva familia: ${res.familyCode}`);
                }
                this.router.navigate(['/login']);
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = 'Error en el registro: ' + (err.error?.message || err.message);
                console.error(err);
                this.isLoading = false;
            }
        });
    }
}
