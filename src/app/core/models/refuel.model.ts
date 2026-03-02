import type { Vehicle } from './vehicle.model';
import type { Driver } from './driver.model';

export type Refuel = {
    id?: number;
    fecha: Date;
    vehiculoId: number;
    vehiculo?: Vehicle;
    kilometraje: number;
    litros: number;
    precioPorLitro: number;
    costeTotal: number;
    proveedor: string;
    tipoCombustible: string;
    ticket_path?: string;
    ticketImageUrl?: string;
    conductorId?: number;
    conductor?: Driver;
    created_at?: Date;
    updated_at?: Date;
}
