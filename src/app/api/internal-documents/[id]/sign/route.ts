import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signerName } = body;

    if (!signerName) {
      return NextResponse.json({ error: 'Name des Zeichnungsberechtigten erforderlich' }, { status: 400 });
    }

    const updated = await dbService.signInternalDocument(id, signerName);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Error internal-document sign PUT:', error);
    return NextResponse.json({ error: 'Fehler beim Signieren des Dokuments' }, { status: 500 });
  }
}
