export interface Law {
  id: string;
  title: string;
  category: string;
  fine: number;
  jail: number; // in Minuten
  description: string;
}

export interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phoneNumber?: string | null;
  driverLicense: 'AKTIV' | 'GESPERRT' | 'KEINE';
  weaponLicense: 'AKTIV' | 'ENTZOGEN' | 'KEINER';
  notes?: string | null;
  createdAt: string;
}

export interface Suspect {
  id: string;
  caseId: string;
  citizenId: string;
  charges: string[]; // Array von Law IDs
  fine: number;
  jailTime: number; // in Minuten
  pleadedGuilty: boolean;
}

export interface Evidence {
  id: string;
  caseId: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  caseId: string;
  type: 'BESCHLUSS' | 'URTEIL' | 'PROTOKOLL';
  title: string;
  content: string; // Volltext
  signedBy?: string | null;
  signedAt?: string | null;
  createdAt: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Warrant {
  id: string;
  citizenId: string;
  reason: string;
  creatorName: string;
  status: 'AKTIV' | 'ERLEDIGT';
  createdAt: string;
}

export interface Case {
  id: string;
  caseNumber: string; // z.B. "12 Js 432/26"
  title: string;
  description: string;
  status: 'ERMITTLUNG' | 'ANKLAGE' | 'ARCHIV';
  urgency: 'NIEDRIG' | 'MITTEL' | 'HOCH' | 'KRITISCH';
  creatorName: string;
  creatorRole: 'police' | 'justice' | 'judge' | 'admin';
  suspects: Suspect[];
  evidences: Evidence[];
  documents: Document[];
  notes: CaseNote[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  activeCases: number;
  activeWarrants: number;
  totalCitizens: number;
  closedCases: number;
}
