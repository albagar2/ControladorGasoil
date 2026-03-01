
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "control_gasoil_familiar",
});

console.log("Attempting to connect to database...");
console.log(`Host: ${(AppDataSource.options as any).host}`);
console.log(`Port: ${(AppDataSource.options as any).port}`);
console.log(`User: ${(AppDataSource.options as any).username}`);
console.log(`Database: ${(AppDataSource.options as any).database}`);

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
        process.exit(1);
    });
