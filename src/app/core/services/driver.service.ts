import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Driver } from '../models/driver.model';

@Injectable({
    providedIn: 'root'
})
export class DriverService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/drivers`;

    getDrivers(): Observable<Driver[]> {
        return this.http.get<Driver[]>(this.apiUrl);
    }

    getDriverById(id: string | number): Observable<Driver> {
        return this.http.get<Driver>(`${this.apiUrl}/${id}`);
    }

    createDriver(driver: Driver): Observable<Driver> {
        return this.http.post<Driver>(this.apiUrl, driver);
    }

    updateDriver(id: string | number, driver: Driver): Observable<Driver> {
        return this.http.put<Driver>(`${this.apiUrl}/${id}`, driver);
    }

    deleteDriver(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    updateProfile(data: any): Observable<any> {
        return this.http.patch<any>(`${environment.apiUrl}/profile`, data);
    }

    deleteProfile(): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/profile`);
    }
}
