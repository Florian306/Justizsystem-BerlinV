import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const warrants = await dbService.getWarrants();
    return NextResponse.json(warrants);
  } catch (error) {
    console.error('API Error warrants GET:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Haftbefehle' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { citizenId, reason, creatorName } = body;

    if (!citizenId || !reason || !creatorName) {
      return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
    }

    const created = await dbService.createWarrant({
      citizenId,
      reason,
      creatorName
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('API Error warrants POST:', error);
    return NextResponse.json({ error: 'Fehler beim Ausstellen des Haftbefehls' }, { status: 500 });
  }
}
