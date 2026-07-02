import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const backup = await dbService.backupData();
    return NextResponse.json(backup);
  } catch (error) {
    console.error('API Error backup GET:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Backups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbService.restoreData(body);
    return NextResponse.json({ success: true, message: 'Backup erfolgreich wiederhergestellt' });
  } catch (error) {
    console.error('API Error backup POST:', error);
    return NextResponse.json({ error: 'Fehler beim Wiederherstellen des Backups: ' + (error as Error).message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbService.resetAllData();
    return NextResponse.json({ success: true, message: 'System erfolgreich zurückgesetzt' });
  } catch (error) {
    console.error('API Error backup DELETE:', error);
    return NextResponse.json({ error: 'Fehler beim Zurücksetzen des Systems' }, { status: 500 });
  }
}
