const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function listVehicles() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected.');
        const res = await client.query('SELECT id, matricula, modelo FROM vehicles;');
        console.log('VEHICLES_LIST_START');
        console.log(JSON.stringify(res.rows, null, 2));
        console.log('VEHICLES_LIST_END');
        await client.end();
    } catch (err) {
        console.error('Failed to list vehicles:', err);
    }
}

listVehicles();
