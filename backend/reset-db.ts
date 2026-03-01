import { AppDataSource } from "./src/data-source";

async function resetDb() {
    try {
        AppDataSource.setOptions({ synchronize: false });
        await AppDataSource.initialize();
        const queryRunner = AppDataSource.createQueryRunner();

        console.log("Dropping tables...");
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
        await queryRunner.query('DROP TABLE IF EXISTS maintenances');
        await queryRunner.query('DROP TABLE IF EXISTS refuels');
        await queryRunner.query('DROP TABLE IF EXISTS vehicles');
        await queryRunner.query('DROP TABLE IF EXISTS drivers');
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log("Tables dropped.");
        await AppDataSource.destroy();
    } catch (error) {
        console.error("Error resetting DB:", error);
    }
}

resetDb();
