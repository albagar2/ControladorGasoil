import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EmailService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/email`;

    sendMaintenanceAlert(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/maintenance-alert`, data);
    }

    sendMonthlyReport(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/report`, data);
    }
}
