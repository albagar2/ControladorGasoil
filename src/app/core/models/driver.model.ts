import type { Family } from './family.model';

export type Driver = {
    id?: number;
    nombre: string;
    dni: string;
    email?: string;
    telefono: string;
    fechaRenovacionCarnet: Date;
    puntos: number;
    puntosMaximos: number;
    imagenUrl?: string;
    role?: 'admin' | 'conductor' | 'leader';
    familyId?: number;
    family?: Family;
    created_at?: Date;
    updated_at?: Date;
}
