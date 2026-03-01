import "reflect-metadata";
import { DataSource } from "typeorm";
import { Driver } from "./entities/Driver";
import { Vehicle } from "./entities/Vehicle";
import { Refuel } from "./entities/Refuel";
import { Maintenance } from "./entities/Maintenance";
import { Family } from "./entities/Family";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "control_gasoil_familiar",
    synchronize: true, // Auto-update schema for dev
    logging: false,
    entities: [Driver, Vehicle, Refuel, Maintenance, Family],
    migrations: [],
    subscribers: [],
});
