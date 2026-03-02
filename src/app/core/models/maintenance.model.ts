import type { Vehicle } from './vehicle.model';
import type { Driver } from './driver.model';

export type Maintenance = {
    id?: number;
    fecha: Date;
    kilometraje: number;
    tipo: string;
    proveedor?: string;
    costePieza: number;
    costeTaller: number;
    observaciones?: string;
    vehiculoId: number;
    conductorId?: number;
    vehiculo?: Vehicle;
    conductor?: Driver;
    ticketImageUrl?: string;
}
