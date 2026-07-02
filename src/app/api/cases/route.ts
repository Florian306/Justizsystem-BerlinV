import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const cases = await dbService.getCases();
    return NextResponse.json(cases);
  } catch (error) {
    console.error('API Error cases GET:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Ermittlungsakten' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseNumber, title, description, status, urgency, creatorName, creatorRole, suspects } = body;

    if (!caseNumber || !title || !description || !creatorName) {
      return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
    }

    const created = await dbService.createCase({
      caseNumber,
      title,
      description,
      status: status || 'ERMITTLUNG',
      urgency: urgency || 'MITTEL',
      creatorName,
      creatorRole: creatorRole || 'police',
      suspects: suspects || []
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('API Error cases POST:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Ermittlungsakte' }, { status: 500 });
  }
}
