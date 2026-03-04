const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'dist/controlGasoilFamiliar/browser');

// Serve static files
app.use(express.static(DIST_PATH));

// Handle SPA routing: redirect all requests to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving files from: ${DIST_PATH}`);
});
