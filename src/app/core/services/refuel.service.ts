import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Refuel } from '../models/refuel.model';

@Injectable({
    providedIn: 'root'
})
export class RefuelService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/refuels`;

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

    getRefuels(): Observable<Refuel[]> {
        return this.http.get<Refuel[]>(this.apiUrl);
    }

    createRefuel(refuelData: any): Observable<Refuel> {
        return this.http.post<Refuel>(this.apiUrl, this.toFormData(refuelData));
    }

    updateRefuel(id: string | number, refuel: any): Observable<Refuel> {
        return this.http.put<Refuel>(`${this.apiUrl}/${id}`, this.toFormData(refuel));
    }

    deleteRefuel(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
