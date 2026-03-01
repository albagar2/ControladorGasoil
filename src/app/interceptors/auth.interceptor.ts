import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');
    const router = inject(Router);

    let cloned = req;
    if (token) {
        cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token has expired or is invalid
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('user');
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
