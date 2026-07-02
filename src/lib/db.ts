import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import type { Citizen, Case, Warrant, Document, CaseNote, Suspect, Evidence } from '../types';
import { INITIAL_LAWS } from '../data/laws';

// Prisma Client initialisieren (mit Error-Handling für Fallback)
let prisma: PrismaClient | null = null;
let useDatabase = false;

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl && !databaseUrl.includes('[PASSWORD]') && !databaseUrl.includes('[PROJECT-REF]')) {
  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    useDatabase = true;
    console.log('Prisma Client erfolgreich initialisiert mit PostgreSQL.');
  } catch (err) {
    console.error('Fehler bei der Initialisierung des Prisma Clients:', err);
    prisma = null;
    useDatabase = false;
  }
} else {
  console.log('Keine gültige DATABASE_URL gefunden. Lokaler JSON-Fallback-Modus ist aktiv.');
}

// --- JSON FALLBACK LOGIC ---
const JSON_DB_DIR = path.join(process.cwd(), 'data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db.json');

const INITIAL_MOCK_CITIZENS: Citizen[] = [
  {
    id: 'cit_1',
    firstName: 'Frank',
    lastName: 'White',
    birthDate: '1990-05-14',
    gender: 'Männlich',
    phoneNumber: '555-0192',
    driverLicense: 'GESPERRT',
    weaponLicense: 'KEINER',
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
    driverLicense: 'AKTIV',
    weaponLicense: 'AKTIV',
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
    driverLicense: 'AKTIV',
    weaponLicense: 'KEINER',
    notes: 'Mehrfach wegen Verkehrsdelikten aufgefallen. Betreibt eine Autowerkstatt in der Innenstadt.',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_MOCK_CASES: Case[] = [
  {
    id: 'case_1',
    caseNumber: '12 Js 101/26',
    title: 'Schwerer Raubüberfall auf Sparkassenfiliale',
    description: 'Am Vormittag drangen maskierte Täter in die Sparkassenfiliale ein. Unter Bedrohung von Angestellten mit Schusswaffen wurden 45.000 EUR entwendet. Die Flucht erfolgte mit einem getunten Sportwagen.',
    status: 'ANKLAGE',
    urgency: 'KRITISCH',
    creatorName: 'Officer Davis',
    creatorRole: 'police',
    suspects: [
      {
        id: 'susp_1',
        caseId: 'case_1',
        citizenId: 'cit_1',
        charges: ['stgb_249', 'waffg_52', 'stgb_113'],
        fine: 21000,
        jailTime: 90,
        pleadedGuilty: false
      }
    ],
    evidences: [
      {
        id: 'ev_1',
        caseId: 'case_1',
        title: 'Pistole 9mm',
        description: 'Im Fluchtfahrzeug sichergestellt. Keine Seriennummer. Spurensicherung läuft.',
        imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&q=80&w=400',
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    documents: [
      {
        id: 'doc_1',
        caseId: 'case_1',
        type: 'BESCHLUSS',
        title: 'Durchsuchungsbeschluss (§ 102 StPO)',
        content: 'Auf Antrag der Staatsanwaltschaft wird die Durchsuchung der Wohnung und Nebenräume des Beschuldigten Frank White angeordnet. Begründung: Verdacht auf Verstecken von Raubgut und Tatwaffen.',
        signedBy: 'Richterin Vance',
        signedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    notes: [
      {
        id: 'note_1',
        caseId: 'case_1',
        content: 'Ermittlungsakte angelegt. Erste Beweise gesichert.',
        authorName: 'Officer Davis',
        createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_MOCK_WARRANTS: Warrant[] = [
  {
    id: 'warr_1',
    citizenId: 'cit_1',
    reason: 'Dringender Tatverdacht des bewaffneten Raubes. Fluchtgefahr.',
    creatorName: 'Richterin Vance',
    status: 'AKTIV',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

interface FileDatabase {
  citizens: Citizen[];
  cases: Case[];
  warrants: Warrant[];
}

const readJsonDb = (): FileDatabase => {
  if (!fs.existsSync(JSON_DB_DIR)) {
    fs.mkdirSync(JSON_DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(JSON_DB_PATH)) {
    const initialDb: FileDatabase = {
      citizens: INITIAL_MOCK_CITIZENS,
      cases: INITIAL_MOCK_CASES,
      warrants: INITIAL_MOCK_WARRANTS,
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const content = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Fehler beim Lesen der JSON-Datenbank:', err);
    return { citizens: [], cases: [], warrants: [] };
  }
};

const writeJsonDb = (data: FileDatabase) => {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Fehler beim Schreiben in die JSON-Datenbank:', err);
  }
};

// --- DATABASE SERVICE INTERFACE ---
export const dbService = {
  // --- CITIZENS ---
  getCitizens: async (): Promise<Citizen[]> => {
    if (useDatabase && prisma) {
      const dbCits = await prisma.citizen.findMany({
        orderBy: { lastName: 'asc' }
      });
      return dbCits as any[];
    } else {
      const data = readJsonDb();
      return data.citizens.sort((a, b) => a.lastName.localeCompare(b.lastName));
    }
  },

  getCitizenById: async (id: string): Promise<Citizen | null> => {
    if (useDatabase && prisma) {
      const dbCit = await prisma.citizen.findUnique({
        where: { id },
        include: { warrants: true, suspects: true }
      });
      return dbCit as any;
    } else {
      const data = readJsonDb();
      return data.citizens.find(c => c.id === id) || null;
    }
  },

  createCitizen: async (citizenData: Omit<Citizen, 'id' | 'createdAt'>): Promise<Citizen> => {
    const newId = `cit_${Date.now()}`;
    const newCitizen: Citizen = {
      ...citizenData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    if (useDatabase && prisma) {
      const created = await prisma.citizen.create({
        data: {
          id: newId,
          firstName: citizenData.firstName,
          lastName: citizenData.lastName,
          birthDate: citizenData.birthDate,
          gender: citizenData.gender,
          phoneNumber: citizenData.phoneNumber,
          driverLicense: citizenData.driverLicense,
          weaponLicense: citizenData.weaponLicense,
          notes: citizenData.notes,
        }
      });
      return created as any;
    } else {
      const data = readJsonDb();
      data.citizens.unshift(newCitizen);
      writeJsonDb(data);
      return newCitizen;
    }
  },

  updateCitizen: async (id: string, updateData: Partial<Citizen>): Promise<Citizen> => {
    if (useDatabase && prisma) {
      const updated = await prisma.citizen.update({
        where: { id },
        data: {
          driverLicense: updateData.driverLicense,
          weaponLicense: updateData.weaponLicense,
          notes: updateData.notes,
          phoneNumber: updateData.phoneNumber
        }
      });
      return updated as any;
    } else {
      const data = readJsonDb();
      const index = data.citizens.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Bürger nicht gefunden');

      data.citizens[index] = { ...data.citizens[index], ...updateData };
      writeJsonDb(data);
      return data.citizens[index];
    }
  },

  // --- CASES ---
  getCases: async (): Promise<Case[]> => {
    if (useDatabase && prisma) {
      const dbCases = await prisma.case.findMany({
        include: {
          suspects: true,
          evidences: true,
          documents: true,
          notes: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return dbCases as any[];
    } else {
      const data = readJsonDb();
      return data.cases;
    }
  },

  getCaseById: async (id: string): Promise<Case | null> => {
    if (useDatabase && prisma) {
      const dbCase = await prisma.case.findUnique({
        where: { id },
        include: {
          suspects: true,
          evidences: true,
          documents: true,
          notes: { orderBy: { createdAt: 'desc' } }
        }
      });
      return dbCase as any;
    } else {
      const data = readJsonDb();
      return data.cases.find(c => c.id === id) || null;
    }
  },

  createCase: async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt' | 'evidences' | 'documents' | 'notes'> & { suspects: Omit<Suspect, 'id' | 'caseId'>[] }): Promise<Case> => {
    const caseId = `case_${Date.now()}`;
    const initialNote: CaseNote = {
      id: `note_${Date.now()}`,
      caseId,
      content: `Ermittlungsakte angelegt von ${caseData.creatorName}.`,
      authorName: caseData.creatorName,
      createdAt: new Date().toISOString()
    };

    const parsedSuspects = caseData.suspects.map((s, i) => ({
      ...s,
      id: `susp_${Date.now()}_${i}`,
      caseId
    }));

    const newCase: Case = {
      ...caseData,
      id: caseId,
      suspects: parsedSuspects as any[],
      evidences: [],
      documents: [],
      notes: [initialNote],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (useDatabase && prisma) {
      const created = await prisma.case.create({
        data: {
          id: caseId,
          caseNumber: caseData.caseNumber,
          title: caseData.title,
          description: caseData.description,
          status: caseData.status,
          urgency: caseData.urgency,
          creatorName: caseData.creatorName,
          creatorRole: caseData.creatorRole,
          suspects: {
            create: caseData.suspects.map(s => ({
              citizenId: s.citizenId,
              charges: JSON.stringify(s.charges),
              fine: s.fine,
              jailTime: s.jailTime,
              pleadedGuilty: s.pleadedGuilty
            }))
          },
          notes: {
            create: {
              content: initialNote.content,
              authorName: initialNote.authorName
            }
          }
        },
        include: {
          suspects: true,
          evidences: true,
          documents: true,
          notes: true
        }
      });
      // Parse JSON charges for return type
      const returnCase = {
        ...created,
        suspects: created.suspects.map(s => ({
          ...s,
          charges: JSON.parse(s.charges)
        }))
      };
      return returnCase as any;
    } else {
      const data = readJsonDb();
      data.cases.unshift(newCase);
      writeJsonDb(data);
      return newCase;
    }
  },

  updateCaseStatus: async (caseId: string, status: 'ERMITTLUNG' | 'ANKLAGE' | 'ARCHIV', officerName: string): Promise<Case> => {
    const statusMap = {
      ERMITTLUNG: 'Ermittlung läuft',
      ANKLAGE: 'Anklage erhoben / Gerichtsanhängig',
      ARCHIV: 'In das Archiv überführt'
    };
    const logText = `Fallstatus geändert auf: ${statusMap[status]} (durch ${officerName})`;

    if (useDatabase && prisma) {
      const updated = await prisma.case.update({
        where: { id: caseId },
        data: {
          status,
          notes: {
            create: {
              content: logText,
              authorName: officerName
            }
          }
        },
        include: {
          suspects: true,
          evidences: true,
          documents: true,
          notes: { orderBy: { createdAt: 'desc' } }
        }
      });
      return {
        ...updated,
        suspects: updated.suspects.map(s => ({ ...s, charges: JSON.parse(s.charges) }))
      } as any;
    } else {
      const data = readJsonDb();
      const index = data.cases.findIndex(c => c.id === caseId);
      if (index === -1) throw new Error('Fall nicht gefunden');

      const newNote: CaseNote = {
        id: `note_${Date.now()}`,
        caseId,
        content: logText,
        authorName: officerName,
        createdAt: new Date().toISOString()
      };

      data.cases[index] = {
        ...data.cases[index],
        status,
        notes: [...data.cases[index].notes, newNote],
        updatedAt: new Date().toISOString()
      };
      writeJsonDb(data);
      return data.cases[index];
    }
  },

  addCaseNote: async (caseId: string, content: string, authorName: string): Promise<CaseNote> => {
    const newId = `note_${Date.now()}`;
    const newNote: CaseNote = {
      id: newId,
      caseId,
      content,
      authorName,
      createdAt: new Date().toISOString()
    };

    if (useDatabase && prisma) {
      const created = await prisma.caseNote.create({
        data: {
          id: newId,
          caseId,
          content,
          authorName
        }
      });
      return created as any;
    } else {
      const data = readJsonDb();
      const index = data.cases.findIndex(c => c.id === caseId);
      if (index === -1) throw new Error('Fall nicht gefunden');

      data.cases[index].notes.push(newNote);
      data.cases[index].updatedAt = new Date().toISOString();
      writeJsonDb(data);
      return newNote;
    }
  },

  addEvidence: async (caseId: string, evidenceData: { title: string; description: string; imageUrl?: string }): Promise<Evidence> => {
    const newId = `ev_${Date.now()}`;
    const newEvidence: Evidence = {
      id: newId,
      caseId,
      title: evidenceData.title,
      description: evidenceData.description,
      imageUrl: evidenceData.imageUrl || null,
      createdAt: new Date().toISOString()
    };

    if (useDatabase && prisma) {
      const created = await prisma.evidence.create({
        data: {
          id: newId,
          caseId,
          title: evidenceData.title,
          description: evidenceData.description,
          imageUrl: evidenceData.imageUrl
        }
      });
      return created as any;
    } else {
      const data = readJsonDb();
      const index = data.cases.findIndex(c => c.id === caseId);
      if (index === -1) throw new Error('Fall nicht gefunden');

      data.cases[index].evidences.push(newEvidence);
      data.cases[index].updatedAt = new Date().toISOString();
      writeJsonDb(data);
      return newEvidence;
    }
  },

  addDocument: async (caseId: string, docData: { type: 'BESCHLUSS' | 'URTEIL' | 'PROTOKOLL'; title: string; content: string }): Promise<Document> => {
    const newId = `doc_${Date.now()}`;
    const newDoc: Document = {
      id: newId,
      caseId,
      type: docData.type,
      title: docData.title,
      content: docData.content,
      createdAt: new Date().toISOString()
    };

    if (useDatabase && prisma) {
      const created = await prisma.document.create({
        data: {
          id: newId,
          caseId,
          type: docData.type,
          title: docData.title,
          content: docData.content
        }
      });
      return created as any;
    } else {
      const data = readJsonDb();
      const index = data.cases.findIndex(c => c.id === caseId);
      if (index === -1) throw new Error('Fall nicht gefunden');

      data.cases[index].documents.push(newDoc);
      data.cases[index].updatedAt = new Date().toISOString();
      writeJsonDb(data);
      return newDoc;
    }
  },

  signDocument: async (docId: string, judgeName: string): Promise<Document> => {
    if (useDatabase && prisma) {
      const updated = await prisma.document.update({
        where: { id: docId },
        data: {
          signedBy: judgeName,
          signedAt: new Date()
        }
      });
      return updated as any;
    } else {
      const data = readJsonDb();
      let found = false;
      let updatedDoc: Document | null = null;

      for (let i = 0; i < data.cases.length; i++) {
        const docIndex = data.cases[i].documents.findIndex(d => d.id === docId);
        if (docIndex !== -1) {
          data.cases[i].documents[docIndex].signedBy = judgeName;
          data.cases[i].documents[docIndex].signedAt = new Date().toISOString();
          data.cases[i].updatedAt = new Date().toISOString();
          updatedDoc = data.cases[i].documents[docIndex];
          found = true;
          break;
        }
      }

      if (!found || !updatedDoc) throw new Error('Dokument nicht gefunden');
      writeJsonDb(data);
      return updatedDoc;
    }
  },

  // --- WARRANTS ---
  getWarrants: async (): Promise<Warrant[]> => {
    if (useDatabase && prisma) {
      const dbWarrs = await prisma.warrant.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return dbWarrs as any[];
    } else {
      const data = readJsonDb();
      return data.warrants;
    }
  },

  createWarrant: async (warrantData: Omit<Warrant, 'id' | 'createdAt' | 'status'>): Promise<Warrant> => {
    const newId = `warr_${Date.now()}`;
    const newWarrant: Warrant = {
      ...warrantData,
      id: newId,
      status: 'AKTIV',
      createdAt: new Date().toISOString()
    };

    if (useDatabase && prisma) {
      const created = await prisma.warrant.create({
        data: {
          id: newId,
          citizenId: warrantData.citizenId,
          reason: warrantData.reason,
          creatorName: warrantData.creatorName
        }
      });
      return created as any;
    } else {
      const data = readJsonDb();
      data.warrants.unshift(newWarrant);
      
      // Fahndungseintrag in Citizen notes vermerken
      const citIndex = data.citizens.findIndex(c => c.id === warrantData.citizenId);
      if (citIndex !== -1) {
        const currentNotes = data.citizens[citIndex].notes || '';
        data.citizens[citIndex].notes = `${currentNotes}\n[INFO - FAHNDUNG AUSGESTELLT] ${new Date().toLocaleDateString('de-DE')}: Durch ${warrantData.creatorName} wegen: ${warrantData.reason}`.trim();
      }

      writeJsonDb(data);
      return newWarrant;
    }
  },

  archiveWarrant: async (warrantId: string, officerName: string): Promise<Warrant> => {
    if (useDatabase && prisma) {
      const updated = await prisma.warrant.update({
        where: { id: warrantId },
        data: { status: 'ERLEDIGT' }
      });
      return updated as any;
    } else {
      const data = readJsonDb();
      const index = data.warrants.findIndex(w => w.id === warrantId);
      if (index === -1) throw new Error('Haftbefehl nicht gefunden');

      data.warrants[index].status = 'ERLEDIGT';

      // Notiz im Bürgerprofil hinterlegen
      const citizenId = data.warrants[index].citizenId;
      const citIndex = data.citizens.findIndex(c => c.id === citizenId);
      if (citIndex !== -1) {
        const currentNotes = data.citizens[citIndex].notes || '';
        data.citizens[citIndex].notes = `${currentNotes}\n[INFO - FAHNDUNG GELÖSCHT] ${new Date().toLocaleDateString('de-DE')}: Durch ${officerName}`.trim();
      }

      writeJsonDb(data);
      return data.warrants[index];
    }
  },

  // --- SYSTEM WIDE UTILS ---
  backupData: async () => {
    if (useDatabase && prisma) {
      // Wenn wir im Datenbankmodus sind, lesen wir alles aus und packen es in das Backup-Format
      const cits = await prisma.citizen.findMany();
      const casesRaw = await prisma.case.findMany({
        include: { suspects: true, evidences: true, documents: true, notes: true }
      });
      const casesParsed = casesRaw.map(c => ({
        ...c,
        suspects: c.suspects.map(s => ({ ...s, charges: JSON.parse(s.charges) }))
      }));
      const warrs = await prisma.warrant.findMany();

      return {
        citizens: cits,
        cases: casesParsed,
        warrants: warrs
      };
    } else {
      return readJsonDb();
    }
  },

  restoreData: async (parsedData: FileDatabase) => {
    if (useDatabase && prisma) {
      // Löschen der alten Daten in der PostgreSQL
      await prisma.warrant.deleteMany();
      await prisma.caseNote.deleteMany();
      await prisma.document.deleteMany();
      await prisma.evidence.deleteMany();
      await prisma.suspect.deleteMany();
      await prisma.case.deleteMany();
      await prisma.citizen.deleteMany();

      // Bürger einfügen
      for (const cit of parsedData.citizens) {
        await prisma.citizen.create({
          data: {
            id: cit.id,
            firstName: cit.firstName,
            lastName: cit.lastName,
            birthDate: cit.birthDate,
            gender: cit.gender,
            phoneNumber: cit.phoneNumber,
            driverLicense: cit.driverLicense,
            weaponLicense: cit.weaponLicense,
            notes: cit.notes,
            createdAt: new Date(cit.createdAt)
          }
        });
      }

      // Fälle einfügen
      for (const c of parsedData.cases) {
        await prisma.case.create({
          data: {
            id: c.id,
            caseNumber: c.caseNumber,
            title: c.title,
            description: c.description,
            status: c.status,
            urgency: c.urgency,
            creatorName: c.creatorName,
            creatorRole: c.creatorRole,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt)
          }
        });

        // Verdächtige einfügen
        for (const s of c.suspects) {
          await prisma.suspect.create({
            data: {
              id: s.id || `susp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              caseId: c.id,
              citizenId: s.citizenId,
              charges: JSON.stringify(s.charges),
              fine: s.fine,
              jailTime: s.jailTime,
              pleadedGuilty: s.pleadedGuilty
            }
          });
        }

        // Beweise einfügen
        for (const ev of c.evidences) {
          await prisma.evidence.create({
            data: {
              id: ev.id,
              caseId: c.id,
              title: ev.title,
              description: ev.description,
              imageUrl: ev.imageUrl,
              createdAt: new Date(ev.createdAt)
            }
          });
        }

        // Dokumente einfügen
        for (const doc of c.documents) {
          await prisma.document.create({
            data: {
              id: doc.id,
              caseId: c.id,
              type: doc.type,
              title: doc.title,
              content: doc.content,
              signedBy: doc.signedBy,
              signedAt: doc.signedAt ? new Date(doc.signedAt) : null,
              createdAt: new Date(doc.createdAt)
            }
          });
        }

        // Notizen einfügen
        for (const n of c.notes) {
          await prisma.caseNote.create({
            data: {
              id: n.id,
              caseId: c.id,
              content: n.content,
              authorName: n.authorName,
              createdAt: new Date(n.createdAt)
            }
          });
        }
      }

      // Haftbefehle einfügen
      for (const w of parsedData.warrants) {
        await prisma.warrant.create({
          data: {
            id: w.id,
            citizenId: w.citizenId,
            reason: w.reason,
            creatorName: w.creatorName,
            status: w.status,
            createdAt: new Date(w.createdAt)
          }
        });
      }
    } else {
      writeJsonDb(parsedData);
    }
  },

  resetAllData: async () => {
    if (useDatabase && prisma) {
      await prisma.warrant.deleteMany();
      await prisma.caseNote.deleteMany();
      await prisma.document.deleteMany();
      await prisma.evidence.deleteMany();
      await prisma.suspect.deleteMany();
      await prisma.case.deleteMany();
      await prisma.citizen.deleteMany();
    } else {
      if (fs.existsSync(JSON_DB_PATH)) {
        fs.unlinkSync(JSON_DB_PATH);
      }
      readJsonDb();
    }
  }
};
