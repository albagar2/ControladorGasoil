const { google } = require('googleapis');
require('dotenv').config();

async function checkFolder() {
    console.log("Checking folder access with CURRENT config...");

    let auth;
    if (process.env.GOOGLE_REFRESH_TOKEN) {
        console.log("Using OAuth Refresh Token...");
        auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    } else {
        console.log("Using Service Account...");
        auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
    }

    const drive = google.drive({ version: 'v3', auth: auth });
    const folderId = process.env.GOOGLE_FOLDER_ID?.replace(/"/g, '').trim();

    console.log(`Checking folder ID: [${folderId}]`);

    try {
        const res = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, capabilities'
        });
        console.log("SUCCESS! Folder found:", res.data);
    } catch (e) {
        console.log("ERROR! Could not access folder:");
        console.log(e.message);
        if (e.response && e.response.data) {
            console.log(JSON.stringify(e.response.data, null, 2));
        }
    }
}

checkFolder();
