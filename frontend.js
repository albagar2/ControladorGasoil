const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'dist/controlGasoilFamiliar/browser');

// Serve static files
app.use(express.static(DIST_PATH));

// Handle SPA routing
app.get('*', (req, res) => {
    const assetExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.json', '.webmanifest'];
    const ext = path.extname(req.url);

    // If it's a request for a missing asset, don't serve index.html (causes MIME errors)
    if (assetExtensions.includes(ext.toLowerCase())) {
        console.log(`[${new Date().toISOString()}] Asset not found: ${req.url}`);
        return res.status(404).send('Asset not found');
    }

    console.log(`[${new Date().toISOString()}] SPA Routing: ${req.url}`);
    res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving files from: ${DIST_PATH}`);
});
