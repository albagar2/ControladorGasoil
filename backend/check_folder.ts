import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

async function checkFolder() {
    console.log("Checking folder access...");
    const authClient = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth: authClient });
    const folderId = process.env.GOOGLE_FOLDER_ID?.replace(/"/g, ''); // strip quotes just in case

    try {
        const res = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, capabilities'
        });
        console.log("SUCCESS! Folder found:", res.data);
    } catch (e: any) {
        console.log("ERROR! Could not access folder:");
        console.log(e.message);
    }
}

checkFolder();
