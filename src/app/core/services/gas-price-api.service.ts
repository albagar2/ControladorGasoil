import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GasPriceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/gas-prices`;

  getCheapestInProvince(province: string = 'Madrid', limit: number = 20, municipality?: string): Observable<any[]> {
    const params: any = { province, limit };
    if (municipality) params.municipality = municipality;
    
    return this.http.get<any[]>(`${this.apiUrl}/cheapest`, { params });
  }

  getAllPrices(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
