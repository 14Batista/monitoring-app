import { NextRequest, NextResponse } from 'next/server';
import { getServices, logToSheet, getServiceLogs } from '@/lib/googleSheets';
import { checkMultipleServices } from '@/lib/ping';
import { sendDownAlert, sendRecoveryAlert } from '@/lib/telegram';

export const maxDuration = 60; // Máximo permitido en Vercel Free

export async function POST(req: NextRequest) {
  try {
    // Verificar autorización (seguridad básica)
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting service checks...');

    // Obtener todos los servicios habilitados
    const allServices = await getServices();
    const enabledServices = allServices.filter((s) => s.enabled);

    if (enabledServices.length === 0) {
      return NextResponse.json({ message: 'No enabled services to check' });
    }

    // Verificar todos los servicios
    const results = await checkMultipleServices(enabledServices);

    // Procesar resultados
    const notifications = [];

    for (const result of results) {
      const timestamp = new Date().toISOString();
      const status = result.success ? 'online' : 'offline';

      // Guardar log en Google Sheets
      await logToSheet({
        timestamp,
        serviceId: result.serviceId,
        serviceName: result.serviceName,
        status,
        responseTime: result.responseTime,
        errorMessage: result.errorMessage,
      });

      // Verificar si necesitamos enviar notificación
      if (!result.success) {
        // Obtener los últimos logs para verificar si ya estaba caído
        const recentLogs = await getServiceLogs(result.serviceId, 2);
        
        // Si el log anterior estaba online, enviar alerta de caída
        if (recentLogs.length <= 1 || recentLogs[1]?.status === 'online') {
          const service = enabledServices.find((s) => s.id === result.serviceId);
          if (service) {
            await sendDownAlert({
              serviceName: result.serviceName,
              status: 'offline',
              url: service.url,
              errorMessage: result.errorMessage,
              timestamp,
            });
            notifications.push({
              type: 'down',
              service: result.serviceName,
            });
          }
        }
      } else {
        // Servicio está online, verificar si se recuperó
        const recentLogs = await getServiceLogs(result.serviceId, 2);
        
        // Si el log anterior estaba offline, enviar alerta de recuperación
        if (recentLogs.length > 1 && recentLogs[1]?.status === 'offline') {
          const service = enabledServices.find((s) => s.id === result.serviceId);
          if (service) {
            await sendRecoveryAlert({
              serviceName: result.serviceName,
              status: 'online',
              url: service.url,
              timestamp,
            });
            notifications.push({
              type: 'recovery',
              service: result.serviceName,
            });
          }
        }
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      totalServices: enabledServices.length,
      onlineServices: results.filter((r) => r.success).length,
      offlineServices: results.filter((r) => !r.success).length,
      notifications: notifications.length,
      details: results.map((r) => ({
        service: r.serviceName,
        status: r.success ? 'online' : 'offline',
        responseTime: r.responseTime,
      })),
    };

    console.log('Service checks completed:', summary);

    return NextResponse.json({
      success: true,
      summary,
      notifications,
    });
  } catch (error: any) {
    console.error('Error checking services:', error);
    return NextResponse.json(
      {
        error: 'Failed to check services',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificación manual
export async function GET(req: NextRequest) {
  try {
    const services = await getServices();
    
    return NextResponse.json({
      message: 'Use POST to trigger service checks',
      enabledServices: services.filter((s) => s.enabled).length,
      totalServices: services.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}