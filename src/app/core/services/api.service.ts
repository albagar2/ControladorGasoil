import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Family {
    id: number;
    nombre: string;
    codigo: string;
}

export interface Vehicle {
    id?: number;
    matricula: string;
    modelo: string;
    combustible: string;
    distintivo: string;
    seguro_compañia: string;
    seguro_numero_poliza: string;
    seguro_fecha_vencimiento: Date;
    seguro_cobertura: string;
    itv_estado: string;
    itv_fecha_caducidad: Date;
    itv_kilometraje: number;
    anioMatriculacion: number;
    propietarioId: number;
    propietario?: Driver;
    familyId?: number;
    family?: Family;
    kilometrajeActual: number;
    imagenUrl?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface Driver {
    id?: number;
    nombre: string;
    dni: string;
    email?: string;
    telefono: string;
    fechaRenovacionCarnet: Date;
    puntos: number;
    puntosMaximos: number;
    imagenUrl?: string;
    role?: 'admin' | 'conductor' | 'leader';
    familyId?: number;
    family?: Family;
    created_at?: Date;
    updated_at?: Date;
}

export interface Refuel {
    id?: number;
    fecha: Date;
    vehiculoId: number;
    vehiculo?: Vehicle;
    kilometraje: number;
    litros: number;
    precioPorLitro: number;
    costeTotal: number;
    proveedor: string;
    tipoCombustible: string;
    ticket_path?: string;
    ticketImageUrl?: string;
    conductorId?: number;
    conductor?: Driver;
    created_at?: Date;
    updated_at?: Date;
}


export interface Maintenance {
    id?: number;
    fecha: Date;
    kilometraje: number;
    tipo: string;
    proveedor?: string;
    costePieza: number;
    costeTaller: number;
    observaciones?: string;
    vehiculoId: number;
    conductorId?: number;
    vehiculo?: Vehicle;
    conductor?: Driver;
    ticketImageUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Auth
    register(driver: Driver): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, driver);
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, credentials);
    }

    // Vehicles
    getVehicles(): Observable<Vehicle[]> {
        return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicles`);
    }

    getVehicleById(id: string | number): Observable<Vehicle> {
        return this.http.get<Vehicle>(`${this.apiUrl}/vehicles/${id}`);
    }

    createVehicle(vehicle: Vehicle): Observable<Vehicle> {
        return this.http.post<Vehicle>(`${this.apiUrl}/vehicles`, vehicle);
    }

    updateVehicle(id: string | number, vehicle: Vehicle): Observable<Vehicle> {
        return this.http.put<Vehicle>(`${this.apiUrl}/vehicles/${id}`, vehicle);
    }

    deleteVehicle(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/vehicles/${id}`);
    }

    // Drivers
    getDrivers(): Observable<Driver[]> {
        return this.http.get<Driver[]>(`${this.apiUrl}/drivers`);
    }

    createDriver(driver: Driver): Observable<Driver> {
        return this.http.post<Driver>(`${this.apiUrl}/drivers`, driver);
    }

    updateDriver(id: string | number, driver: Driver): Observable<Driver> {
        return this.http.put<Driver>(`${this.apiUrl}/drivers/${id}`, driver);
    }

    deleteDriver(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/drivers/${id}`);
    }

    getDriverById(id: string | number): Observable<Driver> {
        return this.http.get<Driver>(`${this.apiUrl}/drivers/${id}`);
    }

    // Profile
    updateProfile(data: any): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/profile`, data);
    }

    deleteProfile(): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/profile`);
    }

    // Refuels
    getRefuels(): Observable<Refuel[]> {
        return this.http.get<Refuel[]>(`${this.apiUrl}/refuels`);
    }

    createRefuel(refuelData: FormData): Observable<Refuel> {
        return this.http.post<Refuel>(`${this.apiUrl}/refuels`, refuelData);
    }

    updateRefuel(id: string | number, refuel: Refuel): Observable<Refuel> {
        return this.http.put<Refuel>(`${this.apiUrl}/refuels/${id}`, refuel);
    }

    deleteRefuel(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/refuels/${id}`);
    }

    // Maintenance
    getMaintenances(): Observable<Maintenance[]> {
        return this.http.get<Maintenance[]>(`${this.apiUrl}/maintenances`);
    }

    createMaintenance(maintenance: Maintenance): Observable<Maintenance> {
        return this.http.post<Maintenance>(`${this.apiUrl}/maintenances`, maintenance);
    }

    updateMaintenance(id: string | number, maintenance: Maintenance): Observable<Maintenance> {
        return this.http.put<Maintenance>(`${this.apiUrl}/maintenances/${id}`, maintenance);
    }

    deleteMaintenance(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/maintenances/${id}`);
    }

    // Family
    createFamily(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/family`, { nombre: name });
    }

    joinFamily(code: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/family/join`, { codigo: code });
    }

    getMyFamily(): Observable<any> {
        return this.http.get(`${this.apiUrl}/family/my-family`);
    }

    // Admin Family
    getAllFamilies(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/families`);
    }

    createFamilyAdmin(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/families/admin`, { nombre: name });
    }

    deleteFamily(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/families/${id}`);
    }

    // Email
    sendMaintenanceAlert(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/email/maintenance-alert`, data);
    }

    sendMonthlyReport(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/email/report`, data);
    }
}
