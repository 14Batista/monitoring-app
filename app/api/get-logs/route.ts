import { NextRequest, NextResponse } from 'next/server';
import { getAllLogs, getServiceLogs } from '@/lib/googleSheets';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const serviceId = searchParams.get('serviceId');
    const status = searchParams.get('status') as 'online' | 'offline' | null;
    const limit = searchParams.get('limit');

    let logs = serviceId 
      ? await getServiceLogs(serviceId, limit ? parseInt(limit) : undefined)
      : await getAllLogs(limit ? parseInt(limit) : undefined);

    // Filtrar por estado si se especifica. soportamos el valor legacy
    // "online"/"offline" pero muchas entradas nuevas contienen códigos
    // HTTP como "200 OK".
    if (status) {
      if (status === 'online') {
        logs = logs.filter(
          (log) => log.status.startsWith('2') || log.status === 'online'
        );
      } else if (status === 'offline') {
        logs = logs.filter(
          (log) => !(log.status.startsWith('2') || log.status === 'online')
        );
      }
    }

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    console.error('Error getting logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to get logs',
        message: error.message,
      },
      { status: 500 }
    );
  }
}