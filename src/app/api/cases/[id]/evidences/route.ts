import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, imageUrl } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Titel und Beschreibung erforderlich' }, { status: 400 });
    }

    const created = await dbService.addEvidence(id, { title, description, imageUrl });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('API Error case evidences POST:', error);
    return NextResponse.json({ error: 'Fehler beim Hinzufügen des Beweismittels' }, { status: 500 });
  }
}
