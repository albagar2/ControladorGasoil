import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./welcome/welcome.component').then(m => m.WelcomeComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'resumen', pathMatch: 'full' },
            {
                path: 'resumen',
                loadComponent: () => import('./dashboard/resumen/resumen.component').then(m => m.ResumenComponent)
            },
            {
                path: 'vehiculos',
                loadComponent: () => import('./vehicles/vehicles.component').then(m => m.VehiclesComponent)
            },
            {
                path: 'conductores',
                loadComponent: () => import('./drivers/drivers.component').then(m => m.DriversComponent)
            },
            {
                path: 'repostaje',
                loadComponent: () => import('./refuels/refuels.component').then(m => m.RefuelsComponent)
            },
            {
                path: 'familia',
                loadComponent: () => import('./family/family.component').then(m => m.FamilyComponent)
            },
            {
                path: 'mantenimiento',
                loadComponent: () => import('./maintenance/maintenance.component').then(m => m.MaintenanceComponent)
            },
            {
                path: 'perfil',
                loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'analiticas',
                loadComponent: () => import('./dashboard/analytics/analytics.component').then(m => m.AnalyticsComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
