import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Family } from "./Family";

@Entity("drivers")
export class Driver {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;

    @Column({ unique: true })
    dni!: string;

    @Column({ unique: true, nullable: true })
    email!: string;

    @Column({ nullable: true })
    password!: string;

    @Column({ type: 'enum', enum: ['admin', 'conductor', 'leader'], default: 'conductor' })
    role!: 'admin' | 'conductor' | 'leader';

    @Column()
    telefono!: string;

    @Column({ type: 'date', name: 'fecha_renovacion_carnet' })
    fechaRenovacionCarnet!: Date;

    @Column({ default: 15 })
    puntos!: number;

    @Column({ default: 15, name: 'puntos_maximos' })
    puntosMaximos!: number;

    @Column({ name: 'imagen_url', nullable: true })
    imagenUrl?: string;

    @CreateDateColumn({ name: 'created_at' })
    fechaCreacion!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    fechaActualizacion!: Date;

    @Column({ nullable: true })
    familyId!: number;

    @ManyToOne(() => Family, (family) => family.drivers, { nullable: true })
    @JoinColumn({ name: 'familyId' })
    family!: Family;
}
