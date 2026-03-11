const http = require('http');
const fs = require('fs');

const req = http.request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/admin/photos/match_local_tickets',
    method: 'POST'
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        fs.writeFileSync('trigger_result.json', data);
        console.log("Finished HTTP request successfully");
    });
});

req.on('error', (e) => {
    fs.writeFileSync('trigger_result.json', JSON.stringify({ error: e.message }));
    console.log("Error in HTTP request: " + e.message);
});

req.end();
