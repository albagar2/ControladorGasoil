const { google } = require('googleapis');
require('dotenv').config();

async function diagnose() {
    console.log("=== Drive Connection Diagnostic ===");

    let auth;
    if (process.env.GOOGLE_REFRESH_TOKEN) {
        console.log("Auth Method: OAuth2 (Refresh Token)");
        auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    } else {
        console.log("Auth Method: Service Account");
        auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
    }

    const drive = google.drive({ version: 'v3', auth: auth });

    try {
        console.log("1. Checking identity...");
        const about = await drive.about.get({ fields: 'user' });
        console.log("Authenticated as:", about.data.user.emailAddress);
    } catch (e) {
        console.log("Identity check FAILED:", e.message);
    }

    const folderId = process.env.GOOGLE_FOLDER_ID?.replace(/"/g, '').trim();
    console.log(`2. Checking access to folder: [${folderId}]`);

    try {
        const res = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, owners, capabilities'
        });
        console.log("SUCCESS! Folder accessible.");
        console.log("Folder Name:", res.data.name);
        console.log("Owners:", res.data.owners.map(o => o.emailAddress).join(", "));
    } catch (e) {
        console.log("Folder access FAILED.");
        console.log("Error Status:", e.code);
        console.log("Error Message:", e.message);
        if (e.response && e.response.data) {
            console.log("Full Error Data:", JSON.stringify(e.response.data, null, 2));
        }
    }
}

diagnose();
