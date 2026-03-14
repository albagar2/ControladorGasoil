
import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../core/services/vehicle.service';
import { DataService } from '../core/services/data.service';
import { Vehicle } from '../core/models/vehicle.model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../core/services/toast.service';
import { TableCardComponent } from '../shared/components/table-card/table-card.component';
import { ModalComponent } from '../shared/components/modal/modal.component';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, TableCardComponent, ModalComponent],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesComponent {
  public dataService = inject(DataService);
  private vehicleService = inject(VehicleService);
  private cdr = inject(ChangeDetectorRef);

  showModal = false;
  isEditing = false;
  currentVehicle: Vehicle = this.getEmptyVehicle();

  private toastService = inject(ToastService);

  openAddModal() {
    this.isEditing = false;
    this.currentVehicle = this.getEmptyVehicle();
    this.showModal = true;
  }

  openEditModal(vehicle: Vehicle) {
    this.isEditing = true;
    this.currentVehicle = { ...vehicle };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveVehicle() {
    const error = this.validateVehicle();
    if (error) {
      this.toastService.warning(error);
      return;
    }

    const obs = (this.isEditing && this.currentVehicle.id)
      ? this.vehicleService.updateVehicle(this.currentVehicle.id, this.currentVehicle)
      : this.vehicleService.createVehicle(this.currentVehicle);

    obs.subscribe({
      next: () => {
        this.toastService.success(this.isEditing ? 'Vehículo actualizado correctamente' : 'Vehículo creado correctamente');
        this.dataService.loadAllData();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving vehicle', err);
        this.toastService.error('Error al guardar el vehículo. Verifica los datos.');
      }
    });
  }

  deleteVehicle(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.vehicleService.deleteVehicle(id).subscribe({
        next: () => {
          this.toastService.success('Vehículo eliminado correctamente');
          this.dataService.loadAllData();
        },
        error: (err) => {
          console.error('Error deleting vehicle', err);
          this.toastService.error('Error al eliminar el vehículo');
        }
      });
    }
  }

  validateVehicle(): string | null {
    const v = this.currentVehicle;
    const currentYear = new Date().getFullYear();
    if (!v.matricula || !/^[0-9]{4}\s*[A-Z]{3}$/.test(v.matricula.trim().toUpperCase())) {
      return 'La matrícula no es válida (Ej: 1234 ABC).';
    }
    if (v.anioMatriculacion < 1900 || v.anioMatriculacion > currentYear + 1) {
      return `El año debe ser válido (1900 - ${currentYear + 1}).`;
    }
    if (v.kilometrajeActual === undefined || v.kilometrajeActual === null || v.kilometrajeActual < 0) {
      return 'El kilometraje actual es obligatorio y no puede ser negativo.';
    }
    if (!v.propietarioId) return 'Debes seleccionar un propietario.';
    return null;
  }

  private getEmptyVehicle(): Vehicle {
    return {
      matricula: '', modelo: '', combustible: '', distintivo: '',
      seguro_compania: '', seguro_numero_poliza: '',
      seguro_fecha_vencimiento: new Date(), seguro_cobertura: '',
      itv_estado: '', itv_fecha_caducidad: new Date(),
      itv_kilometraje: 0, anioMatriculacion: new Date().getFullYear(),
      propietarioId: 0, kilometrajeActual: 0
    };
  }
}
