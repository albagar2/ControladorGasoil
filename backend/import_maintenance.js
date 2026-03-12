const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const rawData = [
    { asistencia: 'RUEDAS DER', vehiculo: 'HUNDAY', taller: 'PACO CRUZ', fecha: '03/03/2022', km: 181883, prox: '', realizado: 'ECODRIVER', precio: '110,00 €' },
    { asistencia: 'ALINEAR RUE', vehiculo: 'HUNDAY', taller: 'NEUMATICOS LUCENA', fecha: '03/03/2022', km: 181883, prox: '', realizado: '', precio: '0,00 €' },
    { asistencia: 'MANGUITO F', vehiculo: 'HUNDAY', taller: 'PACO CRUZ', fecha: '08/03/2022', km: 181900, prox: '', realizado: '', precio: '40,00 €' },
    { asistencia: 'ALINEAR RUE', vehiculo: 'HUNDAY', taller: 'MIGUELICO', fecha: '06/02/2023', km: 195555, prox: '', realizado: '', precio: '35,00 €' },
    { asistencia: 'MANGUITO F', vehiculo: 'HUNDAY', taller: 'PACO CRUZ', fecha: '28/03/2023', km: 195555, prox: '', realizado: '', precio: '25,00 €' },
    { asistencia: 'SINEBLOCK T', vehiculo: 'HUNDAY', taller: 'PACO CRUZ', fecha: '12/05/2023', km: 200087, prox: '', realizado: 'PASTILLAS FRENOS Y MANGUITO R', precio: '120,00 €' },
    { asistencia: '', vehiculo: 'SCENI', taller: 'PACO CRUZ', fecha: '12/05/2023', km: 114473, prox: '', realizado: '4 PASTILLAS FRENO', precio: '115,00 €' },
    { asistencia: '', vehiculo: 'HUNDAY', taller: 'PACO CRUZ', fecha: '19/02/2024', km: 200087, prox: '', realizado: 'BATERIA Y VARIOS', precio: '189,00 €' },
    { asistencia: '', vehiculo: 'HUNDAY', taller: 'NEUMATICOS LUCENA', fecha: '26/04/2024', km: 210129, prox: '', realizado: 'RUEDAS', precio: '120,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '08/07/2024', km: 208000, prox: '', realizado: 'COJINETE', precio: '114,00 €' },
    { asistencia: '', vehiculo: 'SCENI', taller: 'PACO CRUZ', fecha: '09/07/2024', km: 133500, prox: '', realizado: 'RUEDAS DELANTERAS', precio: '210,00 €' },
    { asistencia: '', vehiculo: 'SCENI', taller: 'PACO CRUZ', fecha: '12/11/2024', km: 133500, prox: '', realizado: '3ª LUZ FRENO', precio: '75,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'SANCHEZ', fecha: '18/11/2024', km: 208000, prox: '', realizado: 'ESTERILLAS', precio: '12,00 €' },
    { asistencia: '', vehiculo: 'HUNDAY', taller: 'SANCHEZ', fecha: '18/11/2024', km: 210129, prox: '', realizado: 'ESCOBILLAS LIMPIA PARABRISAS', precio: '10,00 €' },
    { asistencia: '', vehiculo: 'SCENI', taller: 'ARCHIDONA', fecha: '06/03/2025', km: 145000, prox: '', realizado: 'SENSOR PRESION DIFERENCIAL', precio: '255,00 €' },
    { asistencia: '', vehiculo: 'HUNDAY', taller: 'PACO CRUZ', fecha: '15/03/2025', km: 210129, prox: '', realizado: 'LUCES', precio: '25,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '06/03/2025', km: 208000, prox: '', realizado: 'LUZ CORTA', precio: '7,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'SANTEN', fecha: '14/02/2025', km: 208000, prox: '', realizado: 'BATERIA', precio: '65,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'ARIAS BENAMEJI', fecha: '01/04/2025', km: 208000, prox: '', realizado: 'CHAPA Y PIN', precio: '200,00 €' },
    { asistencia: '', vehiculo: 'SCENI', taller: 'PACO CRUZ', fecha: '02/05/2025', km: 145000, prox: '', realizado: 'RUEDAS DELANTERAS', precio: '110,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'ANGEL SAÑAS', fecha: '25/09/2025', km: 208000, prox: '', realizado: 'RIBUCIÓN + RODAMIENTO, FILTRO COMBUSTIBLE, VALVULA C…', precio: '684,88 €' },
    { asistencia: '', vehiculo: 'HUNDAY', taller: 'PACO CRUZ', fecha: '15/12/2025', km: 210129, prox: '', realizado: 'RUEDAS TRASERAS SCENIC', precio: '230,00 €' },
    { asistencia: '', vehiculo: 'HUNDAY', taller: 'ANGEL SAÑAS', fecha: '06/11/2025', km: 221696, prox: '341696', realizado: 'CORREA DISTRIBUCIÓN + RADIADOR', precio: '711,43 €' },
    { asistencia: '', vehiculo: 'HUNDAY', taller: 'NEUMATICOS LUCENA', fecha: '15/05/2025', km: 219928, prox: '223928', realizado: 'ALINEACIÓN RUEDAS', precio: '50,00 €' },
    { asistencia: '', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '13/05/2025', km: 208000, prox: '', realizado: 'CAMBIO ACEITE Y FILTRO', precio: '142,00 €' },
    // Nuevos registros añadidos
    { asistencia: 'REVISIÓN', vehiculo: 'SCENI', taller: 'PACO CRUZ', fecha: '17/12/2021', km: 81000, prox: '111000', realizado: 'CAMBIO DE ACEITE Y FILTRO', precio: '87,00 €' },
    { asistencia: 'ANTINIEBLA', vehiculo: 'SCENI', taller: 'PACO CRUZ', fecha: '22/03/2022', km: null, prox: '', realizado: '', precio: '48,00 €' },
    { asistencia: 'REVISIÓN', vehiculo: 'SCENI', taller: 'PACO CRUZ', fecha: '27/12/2022', km: 106200, prox: '136200', realizado: 'CAMBIO DE ACEITE Y FILTRO', precio: '90,00 €' },
    { asistencia: 'REVISIÓN', vehiculo: 'hunday', taller: 'PACO CRUZ', fecha: '20/01/2023', km: null, prox: '', realizado: 'CAMBIO DE ACEITE Y FILTRO', precio: '72,00 €' },
    { asistencia: '', vehiculo: 'SCENI', taller: 'PACO CRUZ', fecha: '16/02/2024', km: null, prox: '', realizado: 'CAMBIO DE ACEITE Y FILTRO', precio: '189,00 €' },
    { asistencia: 'REVISIÓN', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '14/05/2024', km: 205260, prox: '225260', realizado: 'CAMBIO DE ACEITE Y FILTRO', precio: '85,00 €' },
    { asistencia: 'REVISIÓN', vehiculo: 'PEUGOT', taller: 'PACO CRUZ', fecha: '13/05/2024', km: 221354, prox: '236354', realizado: 'CAMBIO DE ACEITE Y FILTRO comp', precio: '142,00 €' },
    // Seguros Antiguos
    { asistencia: 'Seguro', vehiculo: 'SCENI', taller: 'GENERALI', fecha: '05/10/2021', km: null, prox: '', realizado: 'Seguro Vehículo', precio: '297,68 €' },
    { asistencia: 'Seguro', vehiculo: 'HUNDAY', taller: 'REALESE AUT', fecha: '21/09/2021', km: null, prox: '', realizado: 'Seguro Vehículo', precio: '202,95 €' },
    { asistencia: 'Seguro', vehiculo: 'SCENI', taller: 'GENERALI', fecha: '05/10/2022', km: null, prox: '', realizado: 'Seguro Vehículo', precio: '308,71 €' },
    { asistencia: 'Seguro', vehiculo: 'PEUGOT', taller: 'GENERALI', fecha: '10/03/2023', km: null, prox: '', realizado: 'Seguro Vehículo', precio: '605,78 €' },
    { asistencia: 'Seguro', vehiculo: 'SCENI', taller: 'GENERALI', fecha: '05/10/2023', km: null, prox: '', realizado: 'Seguro Vehículo', precio: '319,02 €' },
    // ITV Antiguas
    { asistencia: 'ITV', vehiculo: 'SCENI', taller: 'ANTEQUERA', fecha: '04/10/2020', km: null, prox: '', realizado: 'Inspección Técnica', precio: '0,00 €' },
    { asistencia: 'ITV', vehiculo: 'SCENI', taller: 'ANTEQUERA', fecha: '04/11/2022', km: null, prox: '', realizado: 'Inspección Técnica', precio: '34,96' },
    { asistencia: 'ITV', vehiculo: 'HUNDAY', taller: 'ANTEQUERA', fecha: '09/05/2023', km: null, prox: '', realizado: 'Inspección Técnica', precio: '44,18' },
    { asistencia: 'ITV', vehiculo: 'HUNDAY', taller: 'ANTEQUERA', fecha: '24/04/2024', km: null, prox: '', realizado: 'Inspección Técnica', precio: '44,18' },
    { asistencia: 'ITV', vehiculo: 'SCENI', taller: 'LUCENA', fecha: '08/11/2024', km: null, prox: '', realizado: 'Inspección Técnica', precio: '34,96' },
    { asistencia: 'ITV', vehiculo: 'PEUGOT', taller: 'LUCENA', fecha: '06/11/2024', km: null, prox: '', realizado: 'Inspección Técnica', precio: '34,96' },
    { asistencia: 'ITV', vehiculo: 'HUNDAY', taller: 'LUCENA', fecha: '07/05/2025', km: null, prox: '', realizado: 'Inspección Técnica', precio: '44,18' },
    { asistencia: 'ITV', vehiculo: 'PEUGOT', taller: 'LUCENA', fecha: '03/12/2025', km: null, prox: '', realizado: 'Inspección Técnica', precio: '34,96' }
];

const vehicleMapping = {
    'HUNDAY': '7312DGS',
    'SCENI': '0238JTB',
    'PEUGOT': '4182HZL'
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

        // Get vehicle IDs
        const vehicleRes = await client.query('SELECT id, matricula FROM vehicles');
        const vehicleIdsGrouped = {};
        vehicleRes.rows.forEach(v => { vehicleIdsGrouped[v.matricula] = v.id; });

        console.log('Vehicle IDs:', vehicleIdsGrouped);

        for (const item of rawData) {
            const vehicleKey = item.vehiculo ? item.vehiculo.toUpperCase() : '';
            const matricula = vehicleMapping[vehicleKey];
            const vehiculoId = vehicleIdsGrouped[matricula];

            if (!vehiculoId) {
                console.warn(`Vehicle not found for ${item.vehiculo} (${matricula})`);
                continue;
            }

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
            console.log(`Inserted: ${item.asistencia} for ${item.vehiculo} on ${item.fecha}`);
        }

        console.log('All records inserted successfully');
        await client.end();
    } catch (err) {
        console.error('Import failed:', err);
    }
}

run();
