const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'control_gasoil_familiar'
});

console.log('Attempting to connect to MySQL...');
console.log('Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL successfully!');
    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
        } else {
            console.log('Tables in database:', results.map(r => Object.values(r)[0]));
        }
        connection.end();
    });
});
