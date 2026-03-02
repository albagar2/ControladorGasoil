import type { Driver } from './driver.model';
import type { Family } from './family.model';

export type Vehicle = {
    id?: number;
    matricula: string;
    modelo: string;
    combustible: string;
    distintivo: string;
    seguro_compañia: string;
    seguro_numero_poliza: string;
    seguro_fecha_vencimiento: Date;
    seguro_cobertura: string;
    itv_estado: string;
    itv_fecha_caducidad: Date;
    itv_kilometraje: number;
    anioMatriculacion: number;
    propietarioId: number;
    propietario?: Driver;
    familyId?: number;
    family?: Family;
    kilometrajeActual: number;
    imagenUrl?: string;
    created_at?: Date;
    updated_at?: Date;
}
