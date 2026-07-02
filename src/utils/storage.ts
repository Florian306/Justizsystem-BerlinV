import type { Citizen, Case, Warrant, Law } from '../types';
import { INITIAL_LAWS } from '../data/laws';

const STORAGE_KEYS = {
  CITIZENS: 'justiz_citizens',
  CASES: 'justiz_cases',
  WARRANTS: 'justiz_warrants',
  LAWS: 'justiz_laws',
};

// Initial Mock-Daten für eine professionelle Präsentation
const MOCK_CITIZENS: Citizen[] = [
  {
    id: 'cit_1',
    firstName: 'Frank',
    lastName: 'White',
    birthDate: '1990-05-14',
    gender: 'Männlich',
    phoneNumber: '555-0192',
    driverLicense: 'suspended',
    weaponLicense: 'none',
    notes: 'Bekanntes Mitglied der Hafen-Bande. Zeigt sich unkooperativ bei Kontrollen. Fährt oft getunte Sportwagen.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cit_2',
    firstName: 'Jessica',
    lastName: 'Miller',
    birthDate: '1995-11-22',
    gender: 'Weiblich',
    phoneNumber: '555-0481',
    driverLicense: 'active',
    weaponLicense: 'active',
    notes: 'Besitzt eine eingetragene Jagdwaffe. Keine nennenswerten Einträge oder Vorstrafen. Bisher stets kooperativ.',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cit_3',
    firstName: 'Marcus',
    lastName: 'Vance',
    birthDate: '1988-02-03',
    gender: 'Männlich',
    phoneNumber: '555-0922',
    driverLicense: 'active',
    weaponLicense: 'none',
    notes: 'Mehrfach wegen Verkehrsdelikten aufgefallen. Betreibt eine Autowerkstatt in der Innenstadt.',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_CASES: Case[] = [
  {
    id: 'case_1',
    caseNumber: 'JA-2026-0001',
    title: 'Bewaffneter Raubüberfall Fleeca Bank',
    description: 'Am Vormittag des 15.06. drangen zwei maskierte Täter in die Fleeca Bank an der Hauptstraße ein. Unter Androhung von Waffengewalt erpressten sie 45.000$. Bei der Flucht wurde ein Streifenwagen gerammt.',
    status: 'court_pending',
    urgency: 'critical',
    creatorName: 'Officer Miller',
    creatorRole: 'police',
    suspects: [
      {
        citizenId: 'cit_1', // Frank White
        charges: ['stgb_203', 'stgb_501', 'stgb_504'], // Raub, Waffenbesitz, Widerstand
        fine: 17000,
        jailTime: 70,
        pleadedGuilty: false
      }
    ],
    evidences: [
      {
        id: 'ev_1',
        title: 'Sichergestellte Waffe (Pistole .50)',
        description: 'Im Fluchtfahrzeug auf dem Beifahrersitz aufgefunden. Keine Seriennummer vorhanden. Projektile stimmen mit den Schüssen in der Bank überein.',
        imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=400',
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ev_2',
        title: 'Videoaufnahme Überwachungskamera',
        description: 'Zeigt eindeutig den Beschuldigten Frank White anhand seiner Statur und Tattoos am linken Arm beim Betreten der Bank.',
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    notes: [
      '15.06.2026 - Erste Ermittlungen eingeleitet. Täter flüchteten in einem schwarzen Sultan.',
      '16.06.2026 - Frank White wurde im Rahmen einer Verkehrskontrolle vorläufig festgenommen.',
      '18.06.2026 - Beweismittel gesichert und Anklageschrift vorbereitet.'
    ],
    createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'case_2',
    caseNumber: 'JA-2026-0002',
    title: 'Geschwindigkeitsüberschreitung Innenstadt',
    description: 'Der Beschuldigte Marcus Vance wurde mit 145 km/h in einer 50er Zone geblitzt. Bei der Kontrolle war er einsichtig.',
    status: 'closed',
    urgency: 'low',
    creatorName: 'Officer Davis',
    creatorRole: 'police',
    suspects: [
      {
        citizenId: 'cit_3', // Marcus Vance
        charges: ['stgb_301'],
        fine: 500,
        jailTime: 0,
        pleadedGuilty: true
      }
    ],
    evidences: [
      {
        id: 'ev_3',
        title: 'Radar-Messprotokoll',
        description: 'Lasermessung vom 22.06. um 23:14 Uhr. Messdistanz 84 Meter.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    notes: [
      'Bußgeldbescheid wurde direkt vor Ort ausgestellt. Täter hat die Strafe akzeptiert.'
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_WARRANTS: Warrant[] = [
  {
    id: 'warr_1',
    citizenId: 'cit_1', // Frank White
    reason: 'Dringender Tatverdacht des schweren Raubes und illegalen Waffenbesitzes. Fluchtgefahr, da er nicht an seiner Meldeadresse angetroffen wurde.',
    creatorName: 'Richterin Vance',
    status: 'active',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Helper zum Initialisieren des Speichers
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.LAWS)) {
    localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(INITIAL_LAWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CITIZENS)) {
    localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(MOCK_CITIZENS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CASES)) {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(MOCK_CASES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WARRANTS)) {
    localStorage.setItem(STORAGE_KEYS.WARRANTS, JSON.stringify(MOCK_WARRANTS));
  }
};

// CRUD Operationen
export const getCitizens = (): Citizen[] => {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.CITIZENS);
  return data ? JSON.parse(data) : [];
};

export const saveCitizens = (citizens: Citizen[]) => {
  localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(citizens));
};

export const getCases = (): Case[] => {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.CASES);
  return data ? JSON.parse(data) : [];
};

export const saveCases = (cases: Case[]) => {
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
};

export const getWarrants = (): Warrant[] => {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.WARRANTS);
  return data ? JSON.parse(data) : [];
};

export const saveWarrants = (warrants: Warrant[]) => {
  localStorage.setItem(STORAGE_KEYS.WARRANTS, JSON.stringify(warrants));
};

export const getLaws = (): Law[] => {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEYS.LAWS);
  return data ? JSON.parse(data) : [];
};

export const saveLaws = (laws: Law[]) => {
  localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(laws));
};

// Import/Export Funktionalität
export const exportData = () => {
  const exportObject = {
    citizens: getCitizens(),
    cases: getCases(),
    warrants: getWarrants(),
    laws: getLaws(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };

  const dataStr = JSON.stringify(exportObject, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `justizakten_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (jsonData: string): { success: boolean; message: string } => {
  try {
    const parsed = JSON.parse(jsonData);
    
    // Einfache Validierung
    if (!parsed.citizens || !parsed.cases || !parsed.warrants || !parsed.laws) {
      return { success: false, message: 'Ungültiges Dateiformat. Wichtige Tabellen fehlen.' };
    }

    localStorage.setItem(STORAGE_KEYS.CITIZENS, JSON.stringify(parsed.citizens));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(parsed.cases));
    localStorage.setItem(STORAGE_KEYS.WARRANTS, JSON.stringify(parsed.warrants));
    localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(parsed.laws));

    return { success: true, message: 'Daten erfolgreich importiert und wiederhergestellt!' };
  } catch (error) {
    return { success: false, message: 'Fehler beim Parsen der JSON-Datei: ' + (error as Error).message };
  }
};

export const resetData = () => {
  localStorage.removeItem(STORAGE_KEYS.CITIZENS);
  localStorage.removeItem(STORAGE_KEYS.CASES);
  localStorage.removeItem(STORAGE_KEYS.WARRANTS);
  localStorage.removeItem(STORAGE_KEYS.LAWS);
  initializeStorage();
};
