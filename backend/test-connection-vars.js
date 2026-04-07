const { Client } = require('pg');

const config = {
    host: 'aws-1-eu-west-3.pooler.supabase.com',
    port: 5432,
    user: 'postgres.zwcrzybyuqcilmgzsphr',
    password: 'usoAplicacionWeb',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

async function test() {
    const client = new Client(config);
    try {
        console.log('Testing connection with provided variables...');
        await client.connect();
        console.log('✅ Connection successful!');
        const res = await client.query('SELECT NOW()');
        console.log('Server time:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.message.includes('password authentication failed')) {
            console.error('Hint: Check the password.');
        }
    }
}

test();
