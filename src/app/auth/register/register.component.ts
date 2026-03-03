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
        fechaRenovacionCarnet: ''
    };
    confirmPassword = '';
    errorMessage = '';

    isLoading = false;
    showPassword = false;
    showConfirmPassword = false;

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        if (localStorage.getItem('token')) {
            this.router.navigate(['/dashboard']);
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

        if (this.driver.password !== this.confirmPassword) {
            this.errorMessage = 'Las contraseñas no coinciden.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.register(this.driver).subscribe({
            next: (res) => {
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
