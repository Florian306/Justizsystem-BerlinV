import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, authorName } = body;

    if (!content || !authorName) {
      return NextResponse.json({ error: 'Inhalt und Autor erforderlich' }, { status: 400 });
    }

    const created = await dbService.addCaseNote(id, content, authorName);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('API Error case notes POST:', error);
    return NextResponse.json({ error: 'Fehler beim Hinzufügen der Notiz' }, { status: 500 });
  }
}
