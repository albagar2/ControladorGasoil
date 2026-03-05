import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Driver } from "./Driver";

export enum LicenseType {
    AM = "AM",
    A1 = "A1",
    A2 = "A2",
    A = "A",
    B1 = "B1",
    B = "B",
    C1 = "C1",
    C = "C",
    D1 = "D1",
    D = "D",
    BE = "BE",
    C1E = "C1E",
    CE = "CE",
    D1E = "D1E",
    DE = "DE"
}

@Entity("licenses")
export class License {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "enum",
        enum: LicenseType
    })
    type!: LicenseType;

    @Column({ type: 'date', name: 'expiration_date' })
    expirationDate!: Date;

    @Column()
    driverId!: number;

    @ManyToOne(() => Driver, (driver) => driver.licenses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'driverId' })
    driver!: Driver;
}
