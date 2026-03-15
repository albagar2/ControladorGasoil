const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function verifyProtection() {
    console.log('--- Verifying Backend Protection ---');

    // 1. Test unprotected Gas Prices (should now be protected)
    try {
        console.log('Testing /api/gas-prices/cheapest (No token)...');
        await axios.get(`${API_URL}/gas-prices/cheapest`);
        console.error('❌ FAIL: /api/gas-prices/cheapest is accessible without a token');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ PASS: /api/gas-prices/cheapest rejected with 401');
        } else {
            console.error('❌ FAIL: Unexpected error:', error.message);
        }
    }

    // 2. Test admin routes (No token)
    try {
        console.log('Testing /api/admin/photos/cleanup (No token)...');
        await axios.delete(`${API_URL}/admin/photos/cleanup`);
        console.error('❌ FAIL: /api/admin/photos/cleanup is accessible without a token');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ PASS: /api/admin/photos/cleanup rejected with 401');
        } else {
            console.error('❌ FAIL: Unexpected error:', error.message);
        }
    }

    // 3. Test family admin routes (No token)
    try {
        console.log('Testing /api/families/admin/all (No token)...');
        await axios.get(`${API_URL}/families/admin/all`);
        console.error('❌ FAIL: /api/families/admin/all is accessible without a token');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ PASS: /api/families/admin/all rejected with 401');
        } else {
            console.error('❌ FAIL: Unexpected error:', error.message);
        }
    }

    console.log('\n--- Verification partially complete (Token-based tests require a valid JWT) ---');
}

verifyProtection();
