import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Vehicle } from "./Vehicle";
import { Driver } from "./Driver";

@Entity("maintenances")
export class Maintenance {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'date' })
    fecha!: Date;

    @Column()
    kilometraje!: number;

    @Column()
    tipo!: string; // e.g. 'Aceite', 'Filtros', 'Ruedas'

    @Column({ nullable: true })
    proveedor?: string;

    @Column("decimal", { precision: 10, scale: 2, name: 'coste_pieza' })
    costePieza!: number;

    @Column("decimal", { precision: 10, scale: 2, name: 'coste_taller' })
    costeTaller!: number;

    @Column({ type: 'text', nullable: true })
    observaciones?: string;

    @Column({ name: 'vehiculo_id' })
    vehiculoId!: number;

    @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "vehiculo_id" })
    vehiculo!: Vehicle;

    @Column({ name: 'ticket_image_url', nullable: true })
    ticketImageUrl?: string;

    @Column({ name: 'conductor_id', nullable: true })
    conductorId?: number;

    @ManyToOne(() => Driver, { onDelete: 'SET NULL' })
    @JoinColumn({ name: "conductor_id" })
    conductor?: Driver;

    @CreateDateColumn({ name: 'created_at' })
    fechaCreacion!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    fechaActualizacion!: Date;
}
