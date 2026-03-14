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
    private static readonly BASE_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';
    
    private static readonly PROVINCE_MAP: Record<string, string> = {
        'Albacete': '02', 'Alicante': '03', 'Almería': '04', 'Ávila': '05', 'Badajoz': '06', 'Islas Baleares': '07', 
        'Barcelona': '08', 'Burgos': '09', 'Cáceres': '10', 'Cádiz': '11', 'Castellón': '12', 'Ciudad Real': '13', 
        'Córdoba': '14', 'A Coruña': '15', 'Cuenca': '16', 'Girona': '17', 'Granada': '18', 'Guadalajara': '19', 
        'Guipúzcoa': '20', 'Huelva': '21', 'Huesca': '22', 'Jaén': '23', 'León': '24', 'Lleida': '25', 'La Rioja': '26', 
        'Lugo': '27', 'Madrid': '28', 'Málaga': '29', 'Murcia': '30', 'Navarra': '31', 'Ourense': '32', 'Asturias': '33', 
        'Palencia': '34', 'Las Palmas': '35', 'Pontevedra': '36', 'Salamanca': '37', 'Santa Cruz de Tenerife': '38', 
        'Cantabria': '39', 'Segovia': '40', 'Sevilla': '41', 'Soria': '42', 'Tarragona': '43', 'Teruel': '44', 
        'Toledo': '45', 'Valencia': '46', 'Valladolid': '47', 'Vizcaya': '48', 'Zamora': '49', 'Zaragoza': '50', 
        'Ceuta': '51', 'Melilla': '52'
    };

    private static async fetchFromApi(endpoint: string) {
        try {
            console.log(`[GasPriceService] Fetching from: ${endpoint}`);
            const response = await request({
                url: endpoint,
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                timeout: 30000
            });
            const data = (response.data as any).ListaEESSPrecio;

            if (!data) {
                console.warn('[GasPriceService] No data received from API');
                return [];
            }

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
            console.error('[GasPriceService] Error:', error);
            return [];
        }
    }

    static async getPrices() {
        return this.fetchFromApi(`${this.BASE_URL}/EstacionesTerrestres/`);
    }

    /**
     * Get cheapest gas stations in a specific province
     */
    static async getCheapestByProvince(province: string, limit: number = 10) {
        const normalizedInput = province.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let provinceId = '';

        for (const [name, id] of Object.entries(this.PROVINCE_MAP)) {
            const normalizedMapName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (normalizedMapName === normalizedInput || normalizedMapName.includes(normalizedInput)) {
                provinceId = id;
                break;
            }
        }

        if (!provinceId) {
            console.warn(`[GasPriceService] No ID found for: ${province}. Filtering manually.`);
            const all = await this.getPrices();
            return all.filter((s: any) => s.provincia.toLowerCase().includes(province.toLowerCase()))
                      .sort((a: any, b: any) => parseFloat(a.precioGasoilA) - parseFloat(b.precioGasoilA))
                      .slice(0, limit);
        }

        const data = await this.fetchFromApi(`${this.BASE_URL}/EstacionesTerrestres/FiltroProvincia/${provinceId}`);
        return data.sort((a: any, b: any) => parseFloat(a.precioGasoilA) - parseFloat(b.precioGasoilA)).slice(0, limit);
    }
}
