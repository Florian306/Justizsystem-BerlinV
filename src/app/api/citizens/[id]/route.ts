import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const citizen = await dbService.getCitizenById(id);
    if (!citizen) {
      return NextResponse.json({ error: 'Bürger nicht gefunden' }, { status: 404 });
    }
    return NextResponse.json(citizen);
  } catch (error) {
    console.error('API Error citizen detail GET:', error);
    return NextResponse.json({ error: 'Fehler beim Laden des Bürgerprofils' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await dbService.updateCitizen(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Error citizen detail PUT:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Bürgerprofils' }, { status: 500 });
  }
}
