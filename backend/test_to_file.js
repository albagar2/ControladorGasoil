const { GasPriceService } = require('./src/services/gas-price.service');
const fs = require('fs');

async function testAndWrite() {
    const logFile = '/tmp/debug_gas.txt';
    let output = `Testing at ${new Date().toISOString()}\n`;
    try {
        const prices = await GasPriceService.getCheapestByProvince('Madrid', 5);
        output += `SUCCESS: Found ${prices.length} stations\n`;
        if (prices.length > 0) {
            output += `First: ${prices[0].rotulo} - ${prices[0].precioGasoilA}\n`;
        }
    } catch (e) {
        output += `ERROR: ${e.message}\n`;
        if (e.response) {
            output += `Status: ${e.response.status}\n`;
        }
    }
    fs.writeFileSync(logFile, output);
    console.log('Done writing to', logFile);
}

testAndWrite();
