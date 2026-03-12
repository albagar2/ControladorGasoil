const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkData() {
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

        const countRes = await client.query('SELECT COUNT(*) FROM maintenances');
        console.log('Total maintenance records:', countRes.rows[0].count);

        const recentRes = await client.query('SELECT m.id, m.fecha, m.tipo, v.matricula FROM maintenances m JOIN vehicles v ON m.vehiculo_id = v.id ORDER BY m.fecha DESC LIMIT 5');
        console.log('Most recent records:');
        console.table(recentRes.rows);

        await client.end();
    } catch (err) {
        console.error('Check failed:', err);
    }
}

checkData();
