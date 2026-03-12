const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function listDrivers() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: 6543,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        const res = await client.query('SELECT id, nombre, dni, email, role, "familyId" FROM drivers ORDER BY id');
        console.table(res.rows);

        await client.end();
    } catch (err) {
        console.error('List failed:', err);
    }
}

listDrivers();
