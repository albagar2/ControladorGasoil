import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/vehicles`;

    getVehicles(): Observable<Vehicle[]> {
        return this.http.get<Vehicle[]>(this.apiUrl);
    }

    getVehicleById(id: string | number): Observable<Vehicle> {
        return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
    }

    createVehicle(vehicle: Vehicle): Observable<Vehicle> {
        return this.http.post<Vehicle>(this.apiUrl, vehicle);
    }

    updateVehicle(id: string | number, vehicle: Vehicle): Observable<Vehicle> {
        return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, vehicle);
    }

    deleteVehicle(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
