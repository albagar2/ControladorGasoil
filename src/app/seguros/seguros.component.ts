import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../core/services/data.service';
import { TableCardComponent } from '../shared/components/table-card/table-card.component';

@Component({
  selector: 'app-seguros',
  standalone: true,
  imports: [CommonModule, TableCardComponent],
  templateUrl: './seguros.component.html',
  styleUrls: ['./seguros.component.css']
})
export class SegurosComponent {
  public dataService = inject(DataService);

  // Filter vehicles that have insurance info or just show all
  vehicles = computed(() => this.dataService.vehicles());

  formatPhone(phone: string | undefined): string {
    if (!phone) return '-';
    return phone;
  }

  isExpiringSoon(date: Date | string | undefined): boolean {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }

  isExpired(date: Date | string | undefined): boolean {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    return expiryDate < today;
  }
}
