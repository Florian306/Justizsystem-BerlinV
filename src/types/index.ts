export interface Law {
  id: string;
  title: string;
  category: string;
  fine: number;
  jail: number; // in Monaten oder Minuten
  description: string;
}

export interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phoneNumber?: string;
  driverLicense: 'active' | 'suspended' | 'none';
  weaponLicense: 'active' | 'suspended' | 'none';
  notes: string;
  createdAt: string;
}

export interface Suspect {
  citizenId: string;
  charges: string[]; // Array von Law IDs
  fine: number;
  jailTime: number;
  pleadedGuilty: boolean;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Warrant {
  id: string;
  citizenId: string;
  reason: string;
  creatorName: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Case {
  id: string;
  caseNumber: string; // E.g., "JA-2026-0001"
  title: string;
  description: string;
  status: 'open' | 'closed' | 'court_pending';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  creatorName: string;
  creatorRole: 'police' | 'justice' | 'judge' | 'admin';
  suspects: Suspect[];
  evidences: Evidence[];
  notes: string[]; // Ermittlungsberichte / Notizen
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  activeCases: number;
  activeWarrants: number;
  totalCitizens: number;
  closedCases: number;
}
