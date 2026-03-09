import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Driver } from "./Driver";
import { Family } from "./Family";

export type CombustibleType = 'Gasolina' | 'Diesel' | 'Eléctrico' | 'Híbrido' | 'GLP' | 'GNC';
export type DistintivoType = '0' | 'ECO' | 'C' | 'B';
export type CoberturaType = 'Terceros' | 'Terceros ampliado' | 'Todo riesgo' | 'Todo riesgo con franquicia';
export type ItvEstadoType = 'Pasada' | 'Pendiente' | 'Caducada' | 'Favorable' | 'Desfavorable';

@Entity("vehicles")
export class Vehicle {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    matricula!: string;

    @Column()
    modelo!: string;

    @Column({ type: 'enum', enum: ['Gasolina', 'Diesel', 'Eléctrico', 'Híbrido', 'GLP', 'GNC'], default: 'Diesel', nullable: true })
    combustible!: CombustibleType;

    @Column({ type: 'enum', enum: ['0', 'ECO', 'C', 'B'], default: 'C', nullable: true })
    distintivo!: DistintivoType;

    // Seguro (Flattened)
    @Column({ name: 'seguro_compañia', nullable: true })
    seguro_compañia!: string;

    @Column({ name: 'seguro_numero_poliza', nullable: true })
    seguro_numero_poliza!: string;

    @Column({ type: 'date', name: 'seguro_fecha_vencimiento', nullable: true })
    seguro_fecha_vencimiento!: Date;

    @Column({ type: 'enum', enum: ['Terceros', 'Terceros ampliado', 'Todo riesgo', 'Todo riesgo con franquicia'], name: 'seguro_cobertura', nullable: true })
    seguro_cobertura!: CoberturaType;

    // ITV (Flattened)
    @Column({ type: 'enum', enum: ['Pasada', 'Pendiente', 'Caducada', 'Favorable', 'Desfavorable'], default: 'Pendiente', name: 'itv_estado', nullable: true })
    itv_estado!: ItvEstadoType;

    @Column({ type: 'date', name: 'itv_fecha_caducidad', nullable: true })
    itv_fecha_caducidad!: Date;

    @Column({ default: 0, name: 'itv_kilometraje' })
    itv_kilometraje!: number;

    @Column({ name: 'ano_matriculacion' })
    anioMatriculacion!: number;

    @Column({ name: 'kilometraje_actual' })
    kilometrajeActual!: number;

    @Column({ name: 'imagen_url', nullable: true })
    imagenUrl?: string;

    @Column({ name: 'propietario_id' })
    propietarioId!: number;

    @ManyToOne(() => Driver, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "propietario_id" })
    propietario!: Driver;

    @Column({ nullable: true })
    familyId!: number;

    @ManyToOne(() => Family, (family) => family.vehicles, { nullable: true })
    @JoinColumn({ name: 'familyId' })
    family!: Family;

    @CreateDateColumn({ name: 'created_at' })
    fechaCreacion!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    fechaActualizacion!: Date;
}
