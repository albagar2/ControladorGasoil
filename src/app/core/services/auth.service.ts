import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Driver } from '../models/driver.model';

interface AuthResponse {
    token: string;
    user: any;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;

    register(driver: Driver): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, driver);
    }

    login(credentials: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(res => {
                if (res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res.user));
                }
            })
        );
    }

    loginDemo(): Observable<AuthResponse> {
        return this.login({ email: 'admin@example.com', password: 'password123' }).pipe(
            catchError(() => {
                // Fallback instant demo session
                const demoUser = {
                    id: 'demo-user-id',
                    nombre: 'Usuario Demostración',
                    email: 'demo@garajefamiliar.com',
                    role: 'ADMIN',
                    familyId: 'demo-family-id'
                };
                const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token';
                localStorage.setItem('token', demoToken);
                localStorage.setItem('user', JSON.stringify(demoUser));
                return of({ token: demoToken, user: demoUser });
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
