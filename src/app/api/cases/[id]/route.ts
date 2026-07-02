import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const caseData = await dbService.getCaseById(id);
    if (!caseData) {
      return NextResponse.json({ error: 'Ermittlungsakte nicht gefunden' }, { status: 404 });
    }
    return NextResponse.json(caseData);
  } catch (error) {
    console.error('API Error case detail GET:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Ermittlungsakte' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, officerName } = body;

    if (!status || !officerName) {
      return NextResponse.json({ error: 'Status und Name des Beamten erforderlich' }, { status: 400 });
    }

    const updated = await dbService.updateCaseStatus(id, status, officerName);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Error case detail PUT:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Fallstatus' }, { status: 500 });
  }
}
