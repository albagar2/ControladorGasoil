import https from 'https';

/**
 * Service to keep the Render instance awake by pinging itself.
 * Render free tier spins down after 15 minutes of inactivity.
 * This pings every 14 minutes.
 */

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

export const startKeepAlive = () => {
    const url = process.env.RENDER_EXTERNAL_URL || 'https://familydrive.onrender.com';
    const statusUrl = `${url}/api/status`;

    console.log(`[Keep-Alive] Starting self-ping service for ${statusUrl}`);

    setInterval(() => {
        https.get(statusUrl, (res) => {
            console.log(`[Keep-Alive] Ping sent to ${statusUrl}. Status Code: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`[Keep-Alive] Ping failed: ${err.message}`);
        });
    }, PING_INTERVAL);
};
