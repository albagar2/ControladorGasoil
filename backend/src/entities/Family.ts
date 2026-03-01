import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Driver } from "./Driver";
import { Vehicle } from "./Vehicle";

@Entity("families")
export class Family {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;

    @Column({ unique: true })
    codigo!: string; // Unique code to join the family

    @OneToMany(() => Driver, (driver) => driver.family)
    drivers!: Driver[];

    @OneToMany(() => Vehicle, (vehicle) => vehicle.family)
    vehicles!: Vehicle[];

    @CreateDateColumn({ name: 'created_at' })
    fechaCreacion!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    fechaActualizacion!: Date;
}
