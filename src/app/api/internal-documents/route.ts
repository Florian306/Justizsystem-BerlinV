import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const docs = await dbService.getInternalDocuments();
    return NextResponse.json(docs);
  } catch (error) {
    console.error('API Error internal-documents GET:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der internen Dokumente' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, content, creatorName, creatorRole } = body;

    if (!type || !title || !content || !creatorName || !creatorRole) {
      return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
    }

    const created = await dbService.createInternalDocument({
      type,
      title,
      content,
      creatorName,
      creatorRole
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('API Error internal-documents POST:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des internen Dokuments' }, { status: 500 });
  }
}
