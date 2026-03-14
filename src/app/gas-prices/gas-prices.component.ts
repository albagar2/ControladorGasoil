import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GasPriceService } from '../core/services/gas-price-api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gas-prices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gas-prices.component.html',
  styleUrls: ['./gas-prices.component.css']
})
export class GasPricesComponent implements OnInit {
  private gasService = inject(GasPriceService);

  gasStations = signal<any[]>([]);
  loading = signal(false);
  province = signal('Madrid');
  provinces = [
    'A Coruña', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 
    'Cádiz', 'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 
    'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares', 'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 
    'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 
    'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
  ].sort();

  ngOnInit() {
    this.loadPrices();
  }

  loadPrices() {
    this.loading.set(true);
    this.gasStations.set([]);
    this.gasService.getCheapestInProvince(this.province()).subscribe({
      next: (data) => {
        console.log(`[GasPricesComponent] Received ${data.length} stations for ${this.province()}`);
        this.gasStations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading gas prices', err);
        this.loading.set(false);
      }
    });
  }
}
