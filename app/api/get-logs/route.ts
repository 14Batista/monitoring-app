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

    // Filtrar por estado si se especifica
    if (status) {
      logs = logs.filter((log) => log.status === status);
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