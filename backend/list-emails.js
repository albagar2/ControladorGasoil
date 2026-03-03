const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function listEmails() {
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
        const res = await client.query('SELECT email FROM "drivers"');
        console.log('--- Registered Emails ---');
        res.rows.forEach(r => console.log(`- ${r.email}`));
        await client.end();
    } catch (err) {
        console.error('List failed:', err);
    }
}

listEmails();
