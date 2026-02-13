import axios from 'axios';

export interface PingResult {
  success: boolean;
  responseTime?: number;
  errorMessage?: string;
}

/**
 * Verifica si un servicio HTTP está disponible
 */
export async function checkHttpService(url: string): Promise<PingResult> {
  const startTime = Date.now();

  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 segundos timeout
      validateStatus: (status) => status < 500, // Considerar 2xx, 3xx, 4xx como exitosos
    });

    const responseTime = Date.now() - startTime;

    return {
      success: response.status < 400,
      responseTime,
      errorMessage: response.status >= 400 ? `HTTP ${response.status}` : undefined,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    let errorMessage = 'Unknown error';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Domain not found';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = 'Connection timeout';
    } else if (error.response) {
      errorMessage = `HTTP ${error.response.status}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      responseTime,
      errorMessage,
    };
  }
}

/**
 * Verifica múltiples servicios en paralelo
 */
export async function checkMultipleServices(
  services: Array<{ id: string; name: string; url: string; type: string }>
) {
  const results = await Promise.all(
    services.map(async (service) => {
      const result = await checkHttpService(service.url);
      return {
        serviceId: service.id,
        serviceName: service.name,
        ...result,
      };
    })
  );

  return results;
}

/**
 * Valida si una URL es válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}