const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

async function run() {
    try {
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        const drive = google.drive({ version: 'v3', auth });
        const about = await drive.about.get({ fields: 'user' });
        fs.writeFileSync('whoami.txt', about.data.user.emailAddress);
    } catch (e) {
        fs.writeFileSync('whoami.txt', 'ERROR: ' + e.message);
    }
    process.exit(0);
}
run();
