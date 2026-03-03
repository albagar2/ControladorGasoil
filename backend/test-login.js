const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function testLoginDirectly() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '6543'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    const testEmail = 'admin@example.com';
    const testPlainPassword = 'admin'; // Contraseña que probamos en la captura

    try {
        await client.connect();
        console.log(`Checking email: ${testEmail}`);

        const res = await client.query('SELECT * FROM "drivers" WHERE email = $1', [testEmail]);

        if (res.rows.length === 0) {
            console.log('Error: User not found in DB');
        } else {
            const user = res.rows[0];
            console.log('User found:', { id: user.id, email: user.email, has_password: !!user.password });

            if (user.password) {
                const isMatch = await bcrypt.compare(testPlainPassword, user.password);
                console.log(`Password match result for "${testPlainPassword}":`, isMatch);

                // Si falla, intentamos con '123456' que es el otro default común
                const isMatch2 = await bcrypt.compare('123456', user.password);
                console.log(`Password match result for "123456":`, isMatch2);
            }
        }
        await client.end();
    } catch (err) {
        console.error('Fatal error:', err);
    }
}

testLoginDirectly();
