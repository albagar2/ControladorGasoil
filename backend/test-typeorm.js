require('reflect-metadata');
const { AppDataSource } = require('./src/data-source');

async function testConnection() {
    console.log('Environment:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: process.env.DB_SSL
    });

    try {
        console.log('Initializing AppDataSource...');
        await AppDataSource.initialize();
        console.log('✅ Connection successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed!');
        console.error('Error details:', error);
        process.exit(1);
    }
}

testConnection();
