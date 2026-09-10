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

const dbHost = process.env.DB_HOST || "aws-1-eu-west-3.pooler.supabase.com";
const isLocalhost = dbHost === "localhost" || dbHost === "127.0.0.1";
const enableSsl = process.env.DB_SSL === 'true' || process.env.VERCEL === '1' || (!isLocalhost && process.env.DB_SSL !== 'false');

export const AppDataSource = new DataSource({
    type: "postgres",
    host: dbHost,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "postgres.zwcrzybyuqcilmgzsphr",
    password: process.env.DB_PASSWORD || "usoAplicacionWeb",
    database: process.env.DB_NAME || "postgres",
    synchronize: false,
    logging: false,
    entities: [Driver, Vehicle, Refuel, Maintenance, Family, License],
    migrations: [],
    subscribers: [],
    ssl: enableSsl ? { rejectUnauthorized: false } : false,
    extra: {
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
    }
});
