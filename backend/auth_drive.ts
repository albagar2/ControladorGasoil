import { google } from 'googleapis';
import * as http from 'http';
import * as url from 'url';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'];

async function authorize() {
    console.log("=======================================");
    console.log("Iniciando Autenticación de Google Drive");
    console.log("=======================================\n");

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId === '...' || clientSecret === '...') {
        console.error("❌ ERROR: Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en tu archivo .env");
        console.log("Por favor, entra en Google Cloud Console > Credenciales > Crear Credenciales > ID de cliente de OAuth.");
        console.log("Elige tipo 'Web application' o 'App de escritorio' y añade 'http://localhost:3000/oauth2callback' como URI de redireccionamiento autorizada si te lo pide.");
        process.exit(1);
    }

    const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost:3000/oauth2callback'
    );

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Forces acquiring a refresh token
    });

    console.log('1. Abre este enlace en tu navegador web para dar permiso a la aplicación:');
    console.log('\n', authUrl, '\n');
    console.log('2. Inicia sesión con tu cuenta de Google normal (la misma dueña de la carpeta de Drive).');
    console.log('3. Esperando respuesta...\n');

    const server = http.createServer(async (req, res) => {
        try {
            if (req.url && req.url.indexOf('/oauth2callback') > -1) {
                const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                const code = qs.get('code');

                if (code) {
                    res.end('Autenticacion Completada! Ya puedes cerrar esta pestana y volver a la consola negra.');
                    server.close();

                    console.log('Obteniendo token de acceso...');
                    const { tokens } = await oAuth2Client.getToken(code);
                    oAuth2Client.setCredentials(tokens);

                    console.log('\n✅ ¡ÉXITO! Se ha obtenido el Refresh Token.');

                    // Update .env file
                    const envPath = path.join(__dirname, '.env');
                    let envContent = fs.readFileSync(envPath, 'utf8');

                    if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
                        envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/g, `GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
                    } else {
                        envContent += `\nGOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`;
                    }

                    fs.writeFileSync(envPath, envContent);
                    console.log('✅ El archivo .env ha sido actualizado automáticamente con el nuevo token.');
                    console.log('\nYa puedes volver a ejecutar "npx ts-node match_tickets.ts"');
                } else {
                    res.end('No se recibio ningun codigo de autorizacion.');
                    server.close();
                }
            }
        } catch (e: any) {
            console.error('Error durante la validación del código:', e.message);
            res.end('Hubo un error. Mira la consola para mas detalles.');
            server.close();
        }
    }).listen(3000, () => {
        // Server listening
    });
}

authorize();
