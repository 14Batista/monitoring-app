import { google } from 'googleapis';
import { Service, LogEntry } from '@/types';

const SCOPES = process.env.GOOGLE_SCOPES?.split(',') || [];
// ['https://www.googleapis.com/auth/spreadsheets'];

// Configuración de autenticación
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

/**
 * Obtiene o crea una hoja para un servicio específico
 */
async function ensureServiceSheet(serviceId: string, serviceName: string) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetName = `logs_${serviceId}`;
    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetName
    );

    if (!sheetExists) {
      // Crear nueva hoja para este servicio
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });

      // Agregar encabezados
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1:E1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Timestamp', 'Service Name', 'Status', 'Response Time (ms)', 'Error Message']],
        },
      });
    }

    return sheetName;
  } catch (error) {
    console.error('Error ensuring service sheet:', error);
    throw error;
  }
}

/**
 * Registra un log en la hoja del servicio correspondiente
 */
export async function logToSheet(log: LogEntry) {
  try {
    // serviceId should normally be defined, but fall back to a placeholder
    const sid = log.serviceId ?? 'unknown';
    const sheetName = await ensureServiceSheet(sid, log.serviceName);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:E`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          [
            log.timestamp,
            log.serviceName,
            log.status,
            log.responseTime || '',
            log.errorMessage || '',
          ],
        ],
      },
    });

    console.log(`Log added to ${sheetName}`);
  } catch (error) {
    console.error('Error logging to sheet:', error);
    throw error;
  }
}

/**
 * Obtiene todos los servicios configurados
 */
export async function getServices(): Promise<Service[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'services!A2:F',
    });

    const rows = response.data.values || [];
    return rows.map((row) => ({
      id: row[0],
      name: row[1],
      url: row[2],
      type: row[3] as 'http' | 'ping',
      enabled: row[4] === 'TRUE',
      createdAt: row[5],
    }));
  } catch (error) {
    console.error('Error getting services:', error);
    return [];
  }
}

/**
 * Agrega un nuevo servicio a monitorear
 */
export async function addService(service: Omit<Service, 'id' | 'createdAt'>) {
  try {
    const id = `srv_${Date.now()}`;
    const createdAt = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'services!A:F',
      valueInputOption: 'RAW',
      requestBody: {
        values: [[id, service.name, service.url, service.type, service.enabled, createdAt]],
      },
    });

    return { id, ...service, createdAt };
  } catch (error) {
    console.error('Error adding service:', error);
    throw error;
  }
}

/**
 * Obtiene los logs de un servicio específico
 */
export async function getServiceLogs(serviceId: string, limit?: number): Promise<LogEntry[]> {
  try {
    const sheetName = `logs_${serviceId}`;
    
    // Verificar si la hoja existe primero
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetName
    );

    // Si la hoja no existe, retornar array vacío sin error
    if (!sheetExists) {
      console.log(`Sheet ${sheetName} does not exist yet (no checks have been run)`);
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:E`,
    });

    const rows = response.data.values || [];
    const rawLogs = rows.map((row) => ({
      timestamp: row[0],
      serviceId,
      serviceName: row[1],
      status: row[2] as string,
      responseTime: row[3] ? parseInt(row[3]) : undefined,
      errorMessage: row[4] || undefined,
    }));

    // Ordenar por timestamp descendente
    rawLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Map into unified LogEntry type
    const normalized = rawLogs.map((log, idx) => ({
      id: `${serviceId}-${log.timestamp}-${idx}`,
      ...log,
      response: log.responseTime != null ? `${log.responseTime}ms` : undefined,
      details: log.errorMessage,
    }));

    return limit ? normalized.slice(0, limit) : normalized;
  } catch (error: any) {
    // Si la hoja no existe o hay otro error, devolver array vacío
    console.log(`No logs found for ${serviceId}:`, error.message);
    return [];
  }
}

/**
 * Obtiene todos los logs de todos los servicios
 */
export async function getAllLogs(limit?: number): Promise<LogEntry[]> {
  try {
    const services = await getServices();
    const allLogs: LogEntry[] = [];

    for (const service of services) {
      const logs = await getServiceLogs(service.id);
      allLogs.push(...logs);
    }

    // Ordenar por timestamp descendente (already normalized)
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return limit ? allLogs.slice(0, limit) : allLogs;
  } catch (error) {
    console.error('Error getting all logs:', error);
    return [];
  }
}

/**
 * Inicializa la hoja de servicios si no existe
 */
export async function initializeServicesSheet() {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === 'services'
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'services',
                },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'services!A1:F1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['ID', 'Name', 'URL', 'Type', 'Enabled', 'Created At']],
        },
      });
    }
  } catch (error) {
    console.error('Error initializing services sheet:', error);
    throw error;
  }
}