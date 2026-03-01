import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('currentUser') || localStorage.getItem('user');

        if (token && user) {
            return true;
        }

        // Store the attempted URL for redirection after login
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}
