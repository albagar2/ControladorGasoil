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
            console.log(`[GasPriceService] [${new Date().toISOString()}] Fetching from: ${endpoint}`);
            const response = await request({
                url: endpoint,
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 30000
            });
            
            console.log(`[GasPriceService] Response Status: ${response.status}`);
            
            if (!response.data) {
                console.error('[GasPriceService] Empty response body');
                return [];
            }

            const data = (response.data as any).ListaEESSPrecio;

            if (!data) {
                console.warn('[GasPriceService] No "ListaEESSPrecio" found in JSON. Response keys:', Object.keys(response.data));
                return [];
            }

            console.log(`[GasPriceService] Success: Found ${data.length} stations`);

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
        } catch (error: any) {
            console.error('[GasPriceService] CRITICAL ERROR:', error.message);
            if (error.response) {
                console.error('[GasPriceService] Response Status:', error.response.status);
                console.error('[GasPriceService] Response Data Preview:', String(error.response.data).substring(0, 200));
            }
            return [];
        }
    }

    static async getPrices() {
        return this.fetchFromApi(`${this.BASE_URL}/EstacionesTerrestres/`);
    }

    /**
     * Get cheapest gas stations in a specific province and optionally a municipality
     */
    static async getCheapestByProvince(province: string, limit: number = 10, municipality?: string) {
        const normalizedInput = province.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let provinceId = '';

        for (const [name, id] of Object.entries(this.PROVINCE_MAP)) {
            const normalizedMapName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (normalizedMapName === normalizedInput || normalizedMapName.includes(normalizedInput)) {
                provinceId = id;
                break;
            }
        }

        let data: any[] = [];
        if (!provinceId) {
            console.warn(`[GasPriceService] No ID found for: ${province}. Filtering manually.`);
            const all = await this.getPrices();
            data = all.filter((s: any) => s.provincia.toLowerCase().includes(province.toLowerCase()));
        } else {
            data = await this.fetchFromApi(`${this.BASE_URL}/EstacionesTerrestres/FiltroProvincia/${provinceId}`);
        }

        if (municipality) {
            const normMuni = municipality.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            data = data.filter((s: any) => {
                const sMuni = s.municipio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return sMuni.includes(normMuni);
            });
        }

        return data.sort((a: any, b: any) => parseFloat(a.precioGasoilA) - parseFloat(b.precioGasoilA)).slice(0, limit);
    }
}
