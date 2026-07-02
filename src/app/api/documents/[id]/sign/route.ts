import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { judgeName } = body;

    if (!judgeName) {
      return NextResponse.json({ error: 'Name des Richters erforderlich' }, { status: 400 });
    }

    const updated = await dbService.signDocument(id, judgeName);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Error document sign PUT:', error);
    return NextResponse.json({ error: 'Fehler beim Signieren des Dokuments' }, { status: 500 });
  }
}
