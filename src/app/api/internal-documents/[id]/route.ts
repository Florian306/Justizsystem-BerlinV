import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await dbService.deleteInternalDocument(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Dokument nicht gefunden' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Dokument erfolgreich gelöscht' });
  } catch (error) {
    console.error('API Error internal-document DELETE:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen des Dokuments' }, { status: 500 });
  }
}
