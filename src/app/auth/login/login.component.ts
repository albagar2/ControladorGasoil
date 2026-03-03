import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { inject } from '@angular/core';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    credentials = {
        email: '',
        password: ''
    };
    isLoading = false;
    showPassword = false;

    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    constructor() { }

    ngOnInit() {
        if (localStorage.getItem('token')) {
            this.router.navigate(['/dashboard']);
        }
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    login() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.authService.login(this.credentials).subscribe({
            next: (res) => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('currentUser', JSON.stringify(res.user));
                this.toastService.success('¡Sesión iniciada correctamente!');
                this.router.navigate(['/dashboard']);
                this.isLoading = false;
            },
            error: (err) => {
                this.toastService.error('Credenciales incorrectas o error de conexión.');
                console.error(err);
                this.isLoading = false;
            }
        });
    }
}
