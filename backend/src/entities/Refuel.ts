import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Vehicle } from "./Vehicle";

@Entity("refuels")
export class Refuel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha!: Date;

    @Column()
    kilometraje!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    litros!: number;

    @Column("decimal", { precision: 10, scale: 3, name: 'precio_por_litro' })
    precioPorLitro!: number;

    @Column("decimal", { precision: 10, scale: 2, name: 'coste_total' })
    costeTotal!: number;

    @Column()
    proveedor!: string;

    @Column({ name: 'tipo_combustible', nullable: true })
    tipoCombustible!: string;

    @Column({ name: 'vehiculo_id' })
    vehiculoId!: number;

    @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "vehiculo_id" })
    vehiculo!: Vehicle;

    @Column({ name: 'ticket_image_url', nullable: true })
    ticketImageUrl?: string;

    @Column({ name: 'conductor_id', nullable: true })
    conductorId?: number;

    @ManyToOne("Driver", { onDelete: 'SET NULL' })
    @JoinColumn({ name: "conductor_id" })
    conductor?: any;

    @CreateDateColumn({ name: 'created_at' })
    fechaCreacion!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    fechaActualizacion!: Date;
}
