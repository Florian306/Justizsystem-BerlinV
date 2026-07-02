import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const citizens = await dbService.getCitizens();
    return NextResponse.json(citizens);
  } catch (error) {
    console.error('API Error citizens GET:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Bürgerkartei' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, gender, phoneNumber, notes, driverLicense, weaponLicense } = body;
    
    if (!firstName || !lastName || !birthDate) {
      return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
    }

    const created = await dbService.createCitizen({
      firstName,
      lastName,
      birthDate,
      gender: gender || 'Männlich',
      phoneNumber: phoneNumber || null,
      notes: notes || '',
      driverLicense: driverLicense || 'AKTIV',
      weaponLicense: weaponLicense || 'KEINER'
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('API Error citizens POST:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Bürgerprofils' }, { status: 500 });
  }
}
