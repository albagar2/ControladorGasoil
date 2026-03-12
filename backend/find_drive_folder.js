const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

async function findFolder() {
    let output = "=== Searching for 'Tickets Gasoil' folder ===\n";

    try {
        let auth;
        if (process.env.GOOGLE_REFRESH_TOKEN) {
            output += "Auth Method: OAuth2 (Refresh Token)\n";
            auth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );
            auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        } else {
            output += "Auth Method: Service Account\n";
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/drive'],
            });
        }

        const drive = google.drive({ version: 'v3', auth: auth });

        output += "1. Checking identity...\n";
        const about = await drive.about.get({ fields: 'user' });
        output += `Authenticated as: ${about.data.user.emailAddress}\n`;

        const res = await drive.files.list({
            q: "name = 'Tickets Gasoil' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: 'files(id, name, owners)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });

        const files = res.data.files;
        if (files.length === 0) {
            output += "❌ No folder found with name 'Tickets Gasoil'\n";
            output += "Listing last 10 items in root to check visibility...\n";
            const listRes = await drive.files.list({
                pageSize: 10,
                fields: 'files(id, name, mimeType)',
                supportsAllDrives: true,
                includeItemsFromAllDrives: true
            });
            output += "Items found:\n" + listRes.data.files.map(f => `- ${f.name} (${f.id})`).join("\n") + "\n";
        } else {
            output += "✅ Folders found:\n";
            files.forEach(f => {
                output += `- Name: ${f.name}\n`;
                output += `  ID: ${f.id}\n`;
                output += `  Owners: ${f.owners.map(o => o.emailAddress).join(", ")}\n`;
            });
        }
    } catch (e) {
        output += `Search FAILED: ${e.message}\n`;
        if (e.response && e.response.data) {
            output += JSON.stringify(e.response.data, null, 2) + "\n";
        }
    }

    fs.writeFileSync('find_output.txt', output);
    console.log("Done. Results in find_output.txt");
    process.exit(0);
}

findFolder();
