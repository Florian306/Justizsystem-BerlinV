import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, title, content } = body;

    if (!type || !title || !content) {
      return NextResponse.json({ error: 'Typ, Titel und Inhalt erforderlich' }, { status: 400 });
    }

    const created = await dbService.addDocument(id, { type, title, content });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('API Error case documents POST:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Dokuments' }, { status: 500 });
  }
}
