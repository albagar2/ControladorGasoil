import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Maintenance } from '../models/maintenance.model';

@Injectable({
    providedIn: 'root'
})
export class MaintenanceApiService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/maintenances`;

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

    getMaintenances(): Observable<Maintenance[]> {
        return this.http.get<Maintenance[]>(this.apiUrl);
    }

    createMaintenance(maintenance: any): Observable<Maintenance> {
        return this.http.post<Maintenance>(this.apiUrl, this.toFormData(maintenance));
    }

    updateMaintenance(id: string | number, maintenance: any): Observable<Maintenance> {
        return this.http.put<Maintenance>(`${this.apiUrl}/${id}`, this.toFormData(maintenance));
    }

    deleteMaintenance(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
