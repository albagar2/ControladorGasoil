import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkTables() {
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
        console.log('Connected to Supabase.');
        const res = await client.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname = 'public';
        `);
        console.log('Tables found:', res.rows.map(r => r.tablename));
        await client.end();
    } catch (err) {
        console.error('Check failed:', err);
    }
}

checkTables();
