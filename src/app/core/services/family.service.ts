import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FamilyService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    createFamily(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/family`, { nombre: name });
    }

    joinFamily(code: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/family/join`, { codigo: code });
    }

    getMyFamily(): Observable<any> {
        return this.http.get(`${this.apiUrl}/family/my-family`);
    }

    // Admin
    getAllFamilies(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/families`);
    }

    createFamilyAdmin(name: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/families/admin`, { nombre: name });
    }

    deleteFamily(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/families/${id}`);
    }
}
