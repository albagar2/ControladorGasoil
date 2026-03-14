import { request } from 'gaxios';

export interface GasStation {
    ideESS: string;
    rotulo: string;
    direccion: string;
    municipio: string;
    provincia: string;
    precioGasoilA: string;
    precioGasolina95E5: string;
    horario: string;
}

export class GasPriceService {
    private static API_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/ServiciosRESTCarburante/ListadoGasolineras/';

    static async getPrices() {
        try {
            const response = await request({
                url: this.API_URL,
                method: 'GET'
            });
            const data = (response.data as any).ListaEESSPrecio;

            if (!data) {
                console.warn('[GasPriceService] No data received from API');
                return [];
            }

            // Map and filter (e.g. only those with Gasoil A price)
            return data.map((item: any) => ({
                id: item.IDEESS,
                rotulo: item.Rotulo,
                direccion: item.Dirección,
                municipio: item.Municipio,
                provincia: item.Provincia,
                precioGasoilA: item['Precio Gasoleo A']?.replace(',', '.') || null,
                precioGasolina95E5: item['Precio Gasolina 95 E5']?.replace(',', '.') || null,
                horario: item.Horario
            })).filter((item: any) => item.precioGasoilA !== null);
        } catch (error) {
            console.error('[GasPriceService] Error fetching gas prices:', error);
            return [];
        }
    }

    /**
     * Get cheapest gas stations in a specific province
     */
    static async getCheapestByProvince(province: string, limit: number = 10) {
        const all = await this.getPrices();
        console.log(`[GasPriceService] Filtering for province: ${province}. Total stations: ${all.length}`);
        
        const filtered = all.filter((s: any) => {
            if (!s.provincia) return false;
            // Normalize strings for comparison (lowercase and remove accents)
            const normalizedProvince = province.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const stationProvince = s.provincia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return stationProvince.includes(normalizedProvince);
        });
        
        console.log(`[GasPriceService] Found ${filtered.length} stations in ${province}`);
        
        return filtered.sort((a: any, b: any) => parseFloat(a.precioGasoilA) - parseFloat(b.precioGasoilA)).slice(0, limit);
    }
}
