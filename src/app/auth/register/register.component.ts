import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
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

    showSuccessModal = false;
    createdFamilyCode = '';

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

    onRoleChange() {
        if (this.driver.role === 'leader') {
            this.familyOption = 'create';
            this.driver.familyCodigo = '';
        } else {
            this.familyOption = 'none';
            this.driver.familyNombre = '';
        }
    }

    copyFamilyCode() {
        navigator.clipboard.writeText(this.createdFamilyCode);
        // We can use a toast here if available, or just change the button text
    }

    closeSuccessModal() {
        this.showSuccessModal = false;
        this.router.navigate(['/login']);
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
        
        // Final sanity check for roles and family data
        if (registrationData.role === 'leader') {
            if (!registrationData.familyNombre) {
                this.errorMessage = 'Debes indicar un nombre para tu familia.';
                this.isLoading = false;
                return;
            }
            delete registrationData.familyCodigo;
        } else {
            // Conductor logic
            if (this.familyOption === 'join') {
                if (!registrationData.familyCodigo) {
                    this.errorMessage = 'Debes introducir un código de familia.';
                    this.isLoading = false;
                    return;
                }
                delete registrationData.familyNombre;
            } else {
                // Sin familia
                delete registrationData.familyNombre;
                delete registrationData.familyCodigo;
            }
        }

        this.authService.register(registrationData).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.familyCode) {
                    this.createdFamilyCode = res.familyCode;
                    this.showSuccessModal = true;
                } else {
                    this.router.navigate(['/login']);
                }
            },
            error: (err) => {
                this.errorMessage = 'Error en el registro: ' + (err.error?.message || err.message);
                console.error(err);
                this.isLoading = false;
            }
        });
    }
}
