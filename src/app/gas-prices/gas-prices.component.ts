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
    'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Alicante', 'Castellón', 'Murcia', 'Cádiz', 'Vizcaya', 'A Coruña', 
    'Asturias', 'Zaragoza', 'Málaga', 'Pontevedra', 'Granada', 'Tarragona', 'Córdoba', 'Girona', 'Guipúzcoa', 'Almería'
  ].sort();

  ngOnInit() {
    this.loadPrices();
  }

  loadPrices() {
    this.loading.set(true);
    this.gasStations.set([]); // Clear previous results while loading
    this.gasService.getCheapestInProvince(this.province()).subscribe({
      next: (data) => {
        // Double check results if any
        console.log(`Loaded ${data.length} stations for ${this.province()}`);
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
