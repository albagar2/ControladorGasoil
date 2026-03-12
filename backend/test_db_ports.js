const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection(port) {
    const client = new Client({
        host: process.env.DB_HOST,
        port: port,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        console.log(`Testing port ${port}...`);
        await client.connect();
        console.log(`SUCCESS on port ${port}`);
        await client.end();
        return true;
    } catch (err) {
        console.error(`FAILED on port ${port}:`, err.message);
        return false;
    }
}

async function run() {
    await testConnection(5432);
    await testConnection(6543);
}

run();
