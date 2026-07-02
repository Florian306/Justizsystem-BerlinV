import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { officerName } = body;

    if (!officerName) {
      return NextResponse.json({ error: 'Name des Beamten erforderlich' }, { status: 400 });
    }

    const updated = await dbService.archiveWarrant(id, officerName);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Error warrant archive PUT:', error);
    return NextResponse.json({ error: 'Fehler beim Aufheben des Haftbefehls' }, { status: 500 });
  }
}
