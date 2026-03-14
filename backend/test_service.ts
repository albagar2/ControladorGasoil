import { GasPriceService } from './src/services/gas-price.service';

async function testServiceDirectly() {
    console.log('Testing GasPriceService directly...');
    try {
        const prices = await GasPriceService.getCheapestByProvince('Madrid', 5);
        console.log('SUCCESS! Received', prices.length, 'stations.');
        if (prices.length > 0) {
            console.log('Top station:', prices[0].rotulo, '-', prices[0].precioGasoilA);
        }
    } catch (e: any) {
        console.error('ERROR in GasPriceService:', e.message);
        if (e.response) {
            console.error('API Response status:', e.response.status);
        }
    }
}

testServiceDirectly();
