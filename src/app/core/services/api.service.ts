import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Family } from '../models/family.model';
import { Vehicle } from '../models/vehicle.model';
import { Driver } from '../models/driver.model';
import { Refuel } from '../models/refuel.model';
import { Maintenance } from '../models/maintenance.model';

export type { Family, Vehicle, Driver, Refuel, Maintenance };

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private toFormData(obj: any): FormData {
        if (obj instanceof FormData) return obj;
        const formData = new FormData();
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (value !== null && value !== undefined) {
                formData.append(key, value instanceof Date ? value.toISOString() : value);
            }
        });
        return formData;
    }

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

    createRefuel(refuelData: any): Observable<Refuel> {
        return this.http.post<Refuel>(`${this.apiUrl}/refuels`, this.toFormData(refuelData));
    }

    updateRefuel(id: string | number, refuel: any): Observable<Refuel> {
        return this.http.put<Refuel>(`${this.apiUrl}/refuels/${id}`, this.toFormData(refuel));
    }

    deleteRefuel(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/refuels/${id}`);
    }

    // Maintenance
    getMaintenances(): Observable<Maintenance[]> {
        return this.http.get<Maintenance[]>(`${this.apiUrl}/maintenances`);
    }

    createMaintenance(maintenance: any): Observable<Maintenance> {
        return this.http.post<Maintenance>(`${this.apiUrl}/maintenances`, this.toFormData(maintenance));
    }

    updateMaintenance(id: string | number, maintenance: any): Observable<Maintenance> {
        return this.http.put<Maintenance>(`${this.apiUrl}/maintenances/${id}`, this.toFormData(maintenance));
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

    // Admin Drive
    cleanupDrivePhotos(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/photos/cleanup`);
    }

    migrateDrivePhotos(): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/photos/migrate`, {});
    }

    // Email
    sendMaintenanceAlert(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/email/maintenance-alert`, data);
    }

    sendMonthlyReport(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/email/report`, data);
    }
}
