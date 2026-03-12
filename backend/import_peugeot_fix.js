const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const rawData = [
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '08/07/2024', km: 208000, prox: '', realizado: 'COJINETE', precio: '114,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'SANCHEZ', fecha: '18/11/2024', km: 208000, prox: '', realizado: 'ESTERILLAS', precio: '12,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '06/03/2025', km: 208000, prox: '', realizado: 'LUZ CORTA', precio: '7,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'SANTEN', fecha: '14/02/2025', km: 208000, prox: '', realizado: 'BATERIA', precio: '65,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'ARIAS BENAMEJI', fecha: '01/04/2025', km: 208000, prox: '', realizado: 'CHAPA Y PIN', precio: '200,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'ANGEL SAÑAS', fecha: '25/09/2025', km: 208000, prox: '', realizado: 'RIBUCIÓN + RODAMIENTO, FILTRO COMBUSTIBLE, VALVULA C…', precio: '684,88 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '13/05/2025', km: 208000, prox: '', realizado: 'CAMBIO ACEITE Y FILTRO', precio: '142,00 €' },
    { asistencia: 'REVISIÓN', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '14/05/2024', km: 205260, prox: '225260', realizado: 'CAMBIO DE ACEITE Y FILTRO', precio: '85,00 €' },
    { asistencia: 'REVISIÓN', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '13/05/2024', km: 221354, prox: '236354', realizado: 'CAMBIO DE ACEITE Y FILTRO comp', precio: '142,00 €' },
    { asistencia: 'Seguro', vehiculo: 'PEUGOT', taller: 'GENERALI', fecha: '10/03/2023', km: null, prox: '', realizado: 'Seguro Vehículo', precio: '605,78 €' },
    { asistencia: 'ITV', vehiculo: 'PEUGOT', taller: 'LUCENA', fecha: '06/11/2024', km: null, prox: '', realizado: 'Inspección Técnica', precio: '34,96' },
    { asistencia: 'ITV', vehiculo: 'PEUGOT', taller: 'LUCENA', fecha: '03/12/2025', km: null, prox: '', realizado: 'Inspección Técnica', precio: '34,96' }
];

const vehicleMapping = {
    'PEUGOT': '4182HZR'
};

function parseDate(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(' €', '').replace('.', '').replace(',', '.'));
}

async function run() {
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

        const vehicleRes = await client.query('SELECT id, matricula FROM vehicles WHERE matricula = $1', ['4182HZR']);
        if (vehicleRes.rows.length === 0) {
            console.error('Peugeot (4182HZR) not found in DB');
            process.exit(1);
        }
        const vehiculoId = vehicleRes.rows[0].id;
        console.log('Using Vehicle ID:', vehiculoId, 'for 4182HZR');

        for (const item of rawData) {
            const fecha = parseDate(item.fecha);
            const precio = parsePrice(item.precio);
            const observaciones = [item.realizado, item.prox ? `Próximo: ${item.prox}` : ''].filter(Boolean).join(' | ');

            const query = `
        INSERT INTO maintenances (fecha, kilometraje, tipo, proveedor, coste_pieza, coste_taller, observaciones, vehiculo_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
            const values = [
                fecha || new Date().toISOString().split('T')[0],
                item.km || 0,
                item.asistencia || 'Mantenimiento General',
                item.taller,
                0, // coste_pieza
                precio, // coste_taller
                observaciones,
                vehiculoId
            ];

            await client.query(query, values);
            console.log(`Inserted: ${item.asistencia || 'Mantenimiento'} on ${item.fecha}`);
        }

        console.log('Peugeot records inserted successfully');
        await client.end();
    } catch (err) {
        console.error('Import failed:', err);
    }
}

run();
