
import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefuelService } from '../core/services/refuel.service';
import { DataService } from '../core/services/data.service';
import { Refuel } from '../core/models/refuel.model';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { ToastService } from '../core/services/toast.service';
import { ReceiptModalComponent } from '../shared/components/receipt-modal/receipt-modal.component';
import { TableCardComponent } from '../shared/components/table-card/table-card.component';
import { ModalComponent } from '../shared/components/modal/modal.component';

@Component({
    selector: 'app-refuels',
    standalone: true,
    imports: [CommonModule, FormsModule, ReceiptModalComponent, TableCardComponent, ModalComponent],
    templateUrl: './refuels.component.html',
    styleUrls: ['./refuels.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefuelsComponent {
    public dataService = inject(DataService);
    private refuelService = inject(RefuelService);
    private cdr = inject(ChangeDetectorRef);

    showModal = false;
    isEditing = false;
    currentRefuel: Refuel = this.getEmptyRefuel();
    ticketFile: File | null = null;

    // Monthly navigation
    selectedMonth: string = new Date().toISOString().substring(0, 7); // YYYY-MM

    showReceiptModal = false;
    selectedReceiptUrl = '';

    private toastService = inject(ToastService);

    openAddModal() {
        this.isEditing = false;
        this.currentRefuel = this.getEmptyRefuel();
        this.currentRefuel.fecha = new Date();
        this.ticketFile = null;
        this.showModal = true;
    }

    openEditModal(refuel: Refuel) {
        this.isEditing = true;
        this.currentRefuel = { ...refuel };
        this.ticketFile = null;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    onFileSelected(event: any) {
        this.ticketFile = event.target.files[0];
    }

    saveRefuel() {
        if (this.currentRefuel.litros && this.currentRefuel.precioPorLitro) {
            this.currentRefuel.costeTotal = this.currentRefuel.litros * this.currentRefuel.precioPorLitro;
        }

        const error = this.validateRefuel();
        if (error) {
            this.toastService.warning(error);
            return;
        }

        if (this.isEditing && this.currentRefuel.id) {
            const data = { ...this.currentRefuel };
            if (this.ticketFile) {
                (data as any).ticket = this.ticketFile;
            }

            this.refuelService.updateRefuel(this.currentRefuel.id, data).subscribe({
                next: () => {
                    this.toastService.success('Repostaje actualizado correctamente');
                    this.dataService.loadAllData();
                    this.closeModal();
                },
                error: (err) => {
                    console.error('Error updating refuel', err);
                    this.toastService.error('Error al actualizar el repostaje.');
                }
            });
        } else {
            // Include ticket file in the data
            const data = { ...this.currentRefuel };
            if (this.ticketFile) {
                (data as any).ticket = this.ticketFile;
            }

            this.refuelService.createRefuel(data).subscribe({
                next: (res: any) => {
                    if (res.maintenanceAlert) {
                        this.toastService.warning('¡Repostaje registrado! Se recomienda mantenimiento pronto.');
                    } else {
                        this.toastService.success('Repostaje creado correctamente');
                    }
                    this.dataService.loadAllData();
                    this.closeModal();
                },
                error: (err) => {
                    console.error('Error creating refuel', err);
                    this.toastService.error('Error al guardar el repostaje.');
                }
            });
        }
    }

    deleteRefuel(id: number | undefined) {
        if (!id) return;
        if (confirm('¿Estás seguro de eliminar este repostaje?')) {
            this.refuelService.deleteRefuel(id).subscribe({
                next: () => {
                    this.toastService.success('Repostaje eliminado correctamente');
                    this.dataService.loadAllData();
                },
                error: (err) => {
                    console.error('Error deleting refuel', err);
                    this.toastService.error('Error al eliminar el repostaje');
                }
            });
        }
    }

    validateRefuel(): string | null {
        const r = this.currentRefuel;
        if (!r.vehiculoId) return 'Debes seleccionar un vehículo.';
        if (r.kilometraje < 0) return 'Los kilómetros no pueden ser negativos.';
        if (r.litros <= 0) return 'Los litros deben ser mayor a 0.';
        if (r.precioPorLitro <= 0) return 'El precio por litro debe ser mayor a 0.';
        return null;
    }

    private getEmptyRefuel(): Refuel {
        return {
            fecha: new Date(), vehiculoId: 0, kilometraje: 0,
            litros: 0, precioPorLitro: 0, costeTotal: 0,
            proveedor: '', tipoCombustible: ''
        };
    }

    viewTicket(ticketPath: string) {
        this.selectedReceiptUrl = `${environment.apiUrl.replace('/api', '')}/${ticketPath}`;
        this.showReceiptModal = true;
    }

    get filteredRefuels(): Refuel[] {
        return this.dataService.refuels().filter(r => {
            const date = new Date(r.fecha);
            return date.toISOString().startsWith(this.selectedMonth);
        });
    }

    get monthlyTotalLitros(): number {
        return this.filteredRefuels.reduce((acc, r) => acc + (Number(r.litros) || 0), 0);
    }

    get monthlyTotalCoste(): number {
        return this.filteredRefuels.reduce((acc, r) => acc + (Number(r.costeTotal) || 0), 0);
    }

    get monthName(): string {
        const [year, month] = this.selectedMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    prevMonth() {
        const [year, month] = this.selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 2, 1);
        this.selectedMonth = date.toISOString().substring(0, 7);
    }

    nextMonth() {
        const [year, month] = this.selectedMonth.split('-').map(Number);
        const date = new Date(year, month, 1);
        this.selectedMonth = date.toISOString().substring(0, 7);
    }
}
