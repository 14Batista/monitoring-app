import { NextRequest, NextResponse } from 'next/server';
import { getServices, addService, initializeServicesSheet } from '@/lib/googleSheets';
import { isValidUrl } from '@/lib/ping';

// GET: Obtener todos los servicios
export async function GET() {
  try {
    const services = await getServices();
    
    return NextResponse.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error: any) {
    console.error('Error getting services:', error);
    return NextResponse.json(
      {
        error: 'Failed to get services',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: Agregar nuevo servicio
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, url, type = 'http', enabled = true } = body;

    // Validaciones
    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    if (type !== 'http' && type !== 'ping') {
      return NextResponse.json(
        { error: 'Type must be either "http" or "ping"' },
        { status: 400 }
      );
    }

    // Agregar servicio
    const newService = await addService({
      name,
      url,
      type,
      enabled,
    });

    return NextResponse.json({
      success: true,
      service: newService,
    });
  } catch (error: any) {
    console.error('Error adding service:', error);
    return NextResponse.json(
      {
        error: 'Failed to add service',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT: Inicializar la hoja de servicios (solo para setup inicial)
export async function PUT() {
  try {
    await initializeServicesSheet();
    
    return NextResponse.json({
      success: true,
      message: 'Services sheet initialized',
    });
  } catch (error: any) {
    console.error('Error initializing services sheet:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize services sheet',
        message: error.message,
      },
      { status: 500 }
    );
  }
}