import "reflect-metadata";
import { DataSource } from "typeorm";
import { Driver } from "./entities/Driver";
import { Vehicle } from "./entities/Vehicle";
import { Refuel } from "./entities/Refuel";
import { Maintenance } from "./entities/Maintenance";
import { Family } from "./entities/Family";
import { License } from "./entities/License";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "postgres",
    synchronize: true, // Auto-update schema for dev/supabase initial sync
    logging: false,
    entities: [Driver, Vehicle, Refuel, Maintenance, Family, License],
    migrations: [],
    subscribers: [],
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
