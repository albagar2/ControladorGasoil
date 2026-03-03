const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function inspectTable() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '6543'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('--- Table Inspection: vehicles ---');

        // Check columns
        const colRes = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'vehicles'
            ORDER BY ordinal_position;
        `);
        console.log('Columns:');
        console.table(colRes.rows);

        // Check data
        const dataRes = await client.query('SELECT * FROM "vehicles" LIMIT 5');
        console.log('Data (first 5 rows):');
        console.table(dataRes.rows);

        await client.end();
    } catch (err) {
        console.error('Inspection failed:', err);
    }
}

inspectTable();
