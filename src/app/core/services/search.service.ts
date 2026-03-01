import { Injectable, signal, computed, inject } from '@angular/core';
import { DataService } from './data.service';
import { Router } from '@angular/router';

export interface SearchResult {
    type: 'vehicle' | 'driver' | 'refuel' | 'maintenance' | 'action';
    title: string;
    subtitle?: string;
    route?: string;
    action?: () => void;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private dataService = inject(DataService);
    private router = inject(Router);

    isOpen = signal(false);
    query = signal('');

    results = computed<SearchResult[]>(() => {
        const q = this.query().toLowerCase().trim();
        if (!q) return this.getDefaultActions();

        const res: SearchResult[] = [];

        // 1. Actions
        this.getDefaultActions().filter(a => a.title.toLowerCase().includes(q)).forEach(a => res.push(a));

        // 2. Vehicles
        this.dataService.vehicles().filter(v =>
            v.modelo.toLowerCase().includes(q) || v.matricula.toLowerCase().includes(q)
        ).forEach(v => res.push({
            type: 'vehicle',
            title: v.modelo,
            subtitle: v.matricula,
            route: '/dashboard/vehicles',
            icon: 'directions_car'
        }));

        // 3. Drivers
        this.dataService.drivers().filter(d =>
            d.nombre.toLowerCase().includes(q) || d.dni.toLowerCase().includes(q)
        ).forEach(d => res.push({
            type: 'driver',
            title: d.nombre,
            subtitle: d.dni,
            route: '/dashboard/drivers',
            icon: 'person'
        }));

        return res.slice(0, 10);
    });

    toggle() {
        this.isOpen.update(v => !v);
        if (this.isOpen()) this.query.set('');
    }

    close() {
        this.isOpen.set(false);
    }

    private getDefaultActions(): SearchResult[] {
        return [
            { type: 'action', title: 'Ver Resumen (Dashboard)', route: '/dashboard', icon: 'dashboard' },
            { type: 'action', title: 'Gestionar Vehículos', route: '/dashboard/vehicles', icon: 'directions_car' },
            { type: 'action', title: 'Ver Conductores', route: '/dashboard/drivers', icon: 'person' },
            { type: 'action', title: 'Registrar Nuevo Repostaje', route: '/dashboard/refuels', icon: 'local_gas_station' },
            { type: 'action', title: 'Gestionar Mantenimiento', route: '/dashboard/maintenance', icon: 'build' },
            { type: 'action', title: 'Mi Familia y Grupos', route: '/dashboard/family', icon: 'groups' },
            { type: 'action', title: 'Configurar Mi Perfil', route: '/dashboard/profile', icon: 'account_circle' }
        ];
    }

    selectResult(result: SearchResult) {
        if (result.route) {
            this.router.navigate([result.route]);
        } else if (result.action) {
            result.action();
        }
        this.close();
    }
}
