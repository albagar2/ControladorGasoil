import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Maintenance, Vehicle, Driver } from '../../core/services/api.service';
import { DataService } from '../../core/services/data.service';

@Component({
    selector: 'app-maintenance-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './maintenance-form.component.html',
    styleUrls: ['./maintenance-form.component.css']
})
export class MaintenanceFormComponent implements OnInit {
    private dataService = inject(DataService);

    @Input() maintenance?: Maintenance;
    @Input() vehicles: Vehicle[] = [];
    @Input() drivers: Driver[] = [];

    @Output() save = new EventEmitter<Maintenance>();
    @Output() cancel = new EventEmitter<void>();

    localMaintenance: Maintenance = {
        fecha: new Date(),
        kilometraje: 0,
        tipo: 'Aceite',
        costePieza: 0,
        costeTaller: 0,
        observaciones: '',
        vehiculoId: 0,
        proveedor: ''
    };

    maintenanceTypes = [
        { id: 'Aceite', label: 'Aceite y Filtros', icon: 'water_drop', color: 'blue' },
        { id: 'Aire', label: 'Filtro de Aire', icon: 'air', color: 'cyan' },
        { id: 'Liquidos', label: 'Líquidos (Frenos/Refrigerante)', icon: 'opacity', color: 'teal' },
        { id: 'Neumaticos', label: 'Neumáticos', icon: 'tire_repair', color: 'orange' },
        { id: 'Bateria', label: 'Batería', icon: 'battery_charging_full', color: 'yellow' },
        { id: 'Distribucion', label: 'Correa de Distribución', icon: 'settings_suggest', color: 'red' },
        { id: 'Accesorios', label: 'Correas y Cadenas', icon: 'link', color: 'brown' },
        { id: 'Polen', label: 'Filtro de Polen', icon: 'filter_vintage', color: 'green' },
        { id: 'Diesel', label: 'Diesel (EGR/Filtros)', icon: 'oil_barrel', color: 'black' },
        { id: 'Escape', label: 'Sistema de Escape', icon: 'cloud_queue', color: 'gray' },
        { id: 'Otros', label: 'Otros / Avería', icon: 'build', color: 'blue-grey' }
    ];

    isEditing = false;
    protected readonly Number = Number;

    ngOnInit() {
        if (this.maintenance) {
            this.isEditing = true;
            this.localMaintenance = { ...this.maintenance };

            if (this.localMaintenance.fecha) {
                this.localMaintenance.fecha = new Date(this.localMaintenance.fecha);
            }

            this.localMaintenance.vehiculoId = this.maintenance.vehiculoId || this.maintenance.vehiculo?.id || 0;
            this.localMaintenance.conductorId = this.maintenance.conductorId || this.maintenance.conductor?.id;
        } else {
            this.isEditing = false;
            this.localMaintenance.fecha = new Date();

            if (this.vehicles.length > 0) {
                this.localMaintenance.vehiculoId = this.vehicles[0].id!;
            }

            const currentUser = this.dataService.currentUser();
            if (currentUser) {
                this.localMaintenance.conductorId = currentUser.id;
            } else if (this.drivers.length > 0) {
                this.localMaintenance.conductorId = this.drivers[0].id;
            }
        }
    }

    selectType(type: string) {
        this.localMaintenance.tipo = type;
    }

    onSubmit() {
        this.save.emit(this.localMaintenance);
    }

    onCancel() {
        this.cancel.emit();
    }
}
