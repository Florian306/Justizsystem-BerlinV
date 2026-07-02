import React, { useState, useEffect } from 'react';
import type { Citizen, Case, Warrant, Law, Suspect, Evidence, SystemStats } from './types';
import {
  getCitizens,
  saveCitizens,
  getCases,
  saveCases,
  getWarrants,
  saveWarrants,
  getLaws,
  exportData,
  importData,
  resetData
} from './utils/storage';

export default function App() {
  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'citizens' | 'laws'>('dashboard');
  const [currentRole, setCurrentRole] = useState<'police' | 'justice' | 'judge' | 'admin'>('police');
  const [currentOfficerName, setCurrentOfficerName] = useState<string>('Officer Davis');
  
  // Data States
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [warrants, setWarrants] = useState<Warrant[]>([]);
  const [laws, setLaws] = useState<Law[]>([]);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lawCategoryFilter, setLawCategoryFilter] = useState<string>('ALL');

  // Selected Detail States
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);

  // Modal States
  const [showCaseModal, setShowCaseModal] = useState<boolean>(false);
  const [showCitizenModal, setShowCitizenModal] = useState<boolean>(false);
  const [showWarrantModal, setShowWarrantModal] = useState<boolean>(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  
  // New Case Form States
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseUrgency, setNewCaseUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [caseSuspects, setCaseSuspects] = useState<Suspect[]>([]);
  const [suspectSearchQuery, setSuspectSearchQuery] = useState('');
  
  // New Citizen Form States
  const [newCitFirst, setNewCitFirst] = useState('');
  const [newCitLast, setNewCitLast] = useState('');
  const [newCitBirth, setNewCitBirth] = useState('');
  const [newCitGender, setNewCitGender] = useState('Männlich');
  const [newCitPhone, setNewCitPhone] = useState('');
  const [newCitNotes, setNewCitNotes] = useState('');

  // New Warrant Form States
  const [newWarrantCitId, setNewWarrantCitId] = useState('');
  const [newWarrantReason, setNewWarrantReason] = useState('');
  const [warrantSearchQuery, setWarrantSearchQuery] = useState('');

  // New Evidence Form States
  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('');
  const [newEvidenceImg, setNewEvidenceImg] = useState('');

  // Toast Notification States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Data Loading on Mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setCitizens(getCitizens());
    setCases(getCases());
    setWarrants(getWarrants());
    setLaws(getLaws());
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auto-set Officer Name based on Role selection
  const handleRoleChange = (role: 'police' | 'justice' | 'judge' | 'admin') => {
    setCurrentRole(role);
    if (role === 'police') setCurrentOfficerName('Officer Davis');
    else if (role === 'justice') setCurrentOfficerName('Staatsanwalt Kraemer');
    else if (role === 'judge') setCurrentOfficerName('Richterin Vance');
    else if (role === 'admin') setCurrentOfficerName('Admin Root');
    showToast(`Rolle gewechselt zu: ${role.toUpperCase()}`, 'info');
  };

  // Helper zum Berechnen von System-Statistiken
  const getStats = (): SystemStats => {
    return {
      activeCases: cases.filter(c => c.status !== 'closed').length,
      activeWarrants: warrants.filter(w => w.status === 'active').length,
      totalCitizens: citizens.length,
      closedCases: cases.filter(c => c.status === 'closed').length
    };
  };

  // --- BUSINESS LOGIC: CASES ---
  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim() || !newCaseDesc.trim()) {
      showToast('Bitte Titel und Beschreibung ausfüllen', 'error');
      return;
    }

    const year = new Date().getFullYear();
    const count = cases.length + 1;
    const caseNumber = `JA-${year}-${count.toString().padStart(4, '0')}`;

    const newCase: Case = {
      id: `case_${Date.now()}`,
      caseNumber,
      title: newCaseTitle,
      description: newCaseDesc,
      status: 'open',
      urgency: newCaseUrgency,
      creatorName: currentOfficerName,
      creatorRole: currentRole,
      suspects: caseSuspects,
      evidences: [],
      notes: [`${new Date().toLocaleDateString('de-DE')} - Ermittlungsakte angelegt von ${currentOfficerName}.`],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedCases = [newCase, ...cases];
    saveCases(updatedCases);
    setCases(updatedCases);
    
    // Form zurücksetzen
    setNewCaseTitle('');
    setNewCaseDesc('');
    setNewCaseUrgency('medium');
    setCaseSuspects([]);
    setShowCaseModal(false);
    
    showToast(`Ermittlungsakte ${caseNumber} erfolgreich erstellt!`);
  };

  const handleAddSuspectToForm = (citizenId: string) => {
    if (caseSuspects.some(s => s.citizenId === citizenId)) {
      showToast('Person ist bereits als Verdächtiger hinzugefügt', 'error');
      return;
    }

    const newSuspect: Suspect = {
      citizenId,
      charges: [],
      fine: 0,
      jailTime: 0,
      pleadedGuilty: false
    };

    setCaseSuspects([...caseSuspects, newSuspect]);
    setSuspectSearchQuery('');
  };

  const handleRemoveSuspectFromForm = (citizenId: string) => {
    setCaseSuspects(caseSuspects.filter(s => s.citizenId !== citizenId));
  };

  const handleToggleChargeInForm = (citizenId: string, lawId: string) => {
    const targetLaw = laws.find(l => l.id === lawId);
    if (!targetLaw) return;

    setCaseSuspects(caseSuspects.map(s => {
      if (s.citizenId !== citizenId) return s;

      const hasCharge = s.charges.includes(lawId);
      const newCharges = hasCharge 
        ? s.charges.filter(id => id !== lawId)
        : [...s.charges, lawId];
      
      // Strafmaß neu kalkulieren
      let newFine = 0;
      let newJail = 0;
      newCharges.forEach(cid => {
        const lawItem = laws.find(l => l.id === cid);
        if (lawItem) {
          newFine += lawItem.fine;
          newJail += lawItem.jail;
        }
      });

      return {
        ...s,
        charges: newCharges,
        fine: newFine,
        jailTime: newJail
      };
    }));
  };

  const handleToggleGuiltyInForm = (citizenId: string) => {
    setCaseSuspects(caseSuspects.map(s => {
      if (s.citizenId !== citizenId) return s;
      return { ...s, pleadedGuilty: !s.pleadedGuilty };
    }));
  };

  const handleAddCaseNote = (caseId: string, noteText: string) => {
    if (!noteText.trim()) return;
    const formattedNote = `${new Date().toLocaleDateString('de-DE')} (${currentOfficerName}): ${noteText}`;
    
    const updated = cases.map(c => {
      if (c.id !== caseId) return c;
      return {
        ...c,
        notes: [...c.notes, formattedNote],
        updatedAt: new Date().toISOString()
      };
    });

    saveCases(updated);
    setCases(updated);
    showToast('Notiz hinzugefügt');
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: 'open' | 'closed' | 'court_pending') => {
    // Justiz/Richter/Admin-Prüfung für Schließen von Akten
    if (newStatus === 'closed' && currentRole === 'police') {
      showToast('Polizisten dürfen keine Akten endgültig schließen. Wende dich an die Justiz.', 'error');
      return;
    }

    const statusMap = {
      open: 'Ermittlung läuft',
      closed: 'Geschlossen/Archiviert',
      court_pending: 'Anklage erhoben / Gerichtsverfahren anhängig'
    };

    const updated = cases.map(c => {
      if (c.id !== caseId) return c;
      const statusNote = `${new Date().toLocaleDateString('de-DE')} - Status geändert auf: ${statusMap[newStatus]} (durch ${currentOfficerName})`;
      return {
        ...c,
        status: newStatus,
        notes: [...c.notes, statusNote],
        updatedAt: new Date().toISOString()
      };
    });

    saveCases(updated);
    setCases(updated);
    showToast(`Fallstatus aktualisiert auf: ${newStatus.toUpperCase()}`);
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !newEvidenceTitle.trim() || !newEvidenceDesc.trim()) {
      showToast('Fehlende Eingaben für Beweismittel', 'error');
      return;
    }

    const newEvidence: Evidence = {
      id: `ev_${Date.now()}`,
      title: newEvidenceTitle,
      description: newEvidenceDesc,
      imageUrl: newEvidenceImg.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    const updated = cases.map(c => {
      if (c.id !== selectedCaseId) return c;
      return {
        ...c,
        evidences: [...c.evidences, newEvidence],
        updatedAt: new Date().toISOString()
      };
    });

    saveCases(updated);
    setCases(updated);
    
    setNewEvidenceTitle('');
    setNewEvidenceDesc('');
    setNewEvidenceImg('');
    setShowEvidenceModal(false);
    showToast('Beweismittel der Akte hinzugefügt');
  };

  // --- BUSINESS LOGIC: CITIZENS ---
  const handleCreateCitizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitFirst.trim() || !newCitLast.trim() || !newCitBirth) {
      showToast('Vorname, Nachname und Geburtsdatum sind Pflichtfelder', 'error');
      return;
    }

    const newCitizen: Citizen = {
      id: `cit_${Date.now()}`,
      firstName: newCitFirst,
      lastName: newCitLast,
      birthDate: newCitBirth,
      gender: newCitGender,
      phoneNumber: newCitPhone.trim() || undefined,
      driverLicense: 'active',
      weaponLicense: 'none',
      notes: newCitNotes,
      createdAt: new Date().toISOString()
    };

    const updated = [newCitizen, ...citizens];
    saveCitizens(updated);
    setCitizens(updated);

    setNewCitFirst('');
    setNewCitLast('');
    setNewCitBirth('');
    setNewCitGender('Männlich');
    setNewCitPhone('');
    setNewCitNotes('');
    setShowCitizenModal(false);
    showToast(`Bürgerprofil für ${newCitizen.firstName} ${newCitizen.lastName} angelegt.`);
  };

  const handleUpdateLicenses = (citizenId: string, type: 'driver' | 'weapon', status: 'active' | 'suspended' | 'none') => {
    const updated = citizens.map(c => {
      if (c.id !== citizenId) return c;
      return {
        ...c,
        driverLicense: type === 'driver' ? status : c.driverLicense,
        weaponLicense: type === 'weapon' ? status : c.weaponLicense
      };
    });
    saveCitizens(updated);
    setCitizens(updated);
    showToast('Lizenzen aktualisiert');
  };

  const handleUpdateCitizenNotes = (citizenId: string, notes: string) => {
    const updated = citizens.map(c => {
      if (c.id !== citizenId) return c;
      return { ...c, notes };
    });
    saveCitizens(updated);
    setCitizens(updated);
    showToast('Justiznotizen gespeichert');
  };

  // --- BUSINESS LOGIC: WARRANTS ---
  const handleCreateWarrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarrantCitId || !newWarrantReason.trim()) {
      showToast('Bitte Person und Begründung angeben', 'error');
      return;
    }

    const newWarrant: Warrant = {
      id: `warr_${Date.now()}`,
      citizenId: newWarrantCitId,
      reason: newWarrantReason,
      creatorName: currentOfficerName,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const updated = [newWarrant, ...warrants];
    saveWarrants(updated);
    setWarrants(updated);

    // Fahndungsnotiz im Bürgerprofil hinterlegen
    const citizen = citizens.find(c => c.id === newWarrantCitId);
    if (citizen) {
      const updatedCitizens = citizens.map(c => {
        if (c.id !== newWarrantCitId) return c;
        const freshNotes = `${c.notes}\n[INFO - FAHNDUNG AUSGESTELLT] ${new Date().toLocaleDateString('de-DE')}: Ausgestellt durch ${currentOfficerName} wegen: ${newWarrantReason}`;
        return { ...c, notes: freshNotes };
      });
      saveCitizens(updatedCitizens);
      setCitizens(updatedCitizens);
    }

    setNewWarrantCitId('');
    setNewWarrantReason('');
    setWarrantSearchQuery('');
    setShowWarrantModal(false);
    showToast('Haftbefehl / Fahndung erfolgreich ausgeschrieben!', 'error');
  };

  const handleArchiveWarrant = (warrantId: string) => {
    const updated = warrants.map(w => {
      if (w.id !== warrantId) return w;
      return { ...w, status: 'archived' as const };
    });
    saveWarrants(updated);
    setWarrants(updated);

    // Notiz im Bürgerprofil eintragen, dass Fahndung gelöscht wurde
    const w = warrants.find(x => x.id === warrantId);
    if (w) {
      const updatedCitizens = citizens.map(c => {
        if (c.id !== w.citizenId) return c;
        const freshNotes = `${c.notes}\n[INFO - FAHNDUNG GELÖSCHT] ${new Date().toLocaleDateString('de-DE')}: Archiviert durch ${currentOfficerName}`;
        return { ...c, notes: freshNotes };
      });
      saveCitizens(updatedCitizens);
      setCitizens(updatedCitizens);
    }

    showToast('Fahndung erfolgreich gelöscht / archiviert.');
  };

  // --- BACKUP UTILS ---
  const handleExport = () => {
    exportData();
    showToast('Daten erfolgreich exportiert!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = event => {
        if (event.target?.result) {
          const result = importData(event.target.result as string);
          if (result.success) {
            loadAllData();
            showToast(result.message);
          } else {
            showToast(result.message, 'error');
          }
        }
      };
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Möchtest du wirklich ALLE Daten löschen und das System auf den Werkszustand zurücksetzen?')) {
      resetData();
      loadAllData();
      setSelectedCaseId(null);
      setSelectedCitizenId(null);
      showToast('System wurde vollständig zurückgesetzt.', 'info');
    }
  };

  // --- RENDER HELPERS ---
  const getCitizenFullName = (citizenId: string) => {
    const c = citizens.find(cit => cit.id === citizenId);
    return c ? `${c.firstName} ${c.lastName}` : 'Unbekannter Bürger';
  };

  const isCitizenWanted = (citizenId: string) => {
    return warrants.some(w => w.citizenId === citizenId && w.status === 'active');
  };

  // Filtered Lists
  const filteredCases = cases.filter(c => {
    const term = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      c.caseNumber.toLowerCase().includes(term) ||
      c.creatorName.toLowerCase().includes(term)
    );
  });

  const filteredCitizens = citizens.filter(c => {
    const term = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      (c.phoneNumber && c.phoneNumber.includes(term))
    );
  });

  const filteredLaws = laws.filter(l => {
    const matchCategory = lawCategoryFilter === 'ALL' || l.category === lawCategoryFilter;
    const matchQuery = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const lawCategories = Array.from(new Set(laws.map(l => l.category)));

  return (
    <div className="app-container">
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? 'var(--color-danger-bg)' : toast.type === 'info' ? 'var(--color-info-bg)' : 'var(--color-success-bg)',
          color: toast.type === 'error' ? 'var(--color-danger)' : toast.type === 'info' ? 'var(--color-info)' : 'var(--color-success)',
          border: `1px solid ${toast.type === 'error' ? 'var(--color-danger)' : toast.type === 'info' ? 'var(--color-info)' : 'var(--color-success)'}`,
          padding: '12px 24px',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-premium)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toast.type === 'error' ? (
            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          ) : (
            <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div className="brand-name">JustizAkten</div>
          </div>

          <nav className="sidebar-menu">
            <li 
              className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setSelectedCaseId(null); setSelectedCitizenId(null); setSearchQuery(''); }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Zentrale
            </li>
            <li 
              className={`menu-item ${activeTab === 'cases' ? 'active' : ''}`}
              onClick={() => { setActiveTab('cases'); setSelectedCaseId(null); setSelectedCitizenId(null); setSearchQuery(''); }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ermittlungsakten
            </li>
            <li 
              className={`menu-item ${activeTab === 'citizens' ? 'active' : ''}`}
              onClick={() => { setActiveTab('citizens'); setSelectedCaseId(null); setSelectedCitizenId(null); setSearchQuery(''); }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Personenkartei
            </li>
            <li 
              className={`menu-item ${activeTab === 'laws' ? 'active' : ''}`}
              onClick={() => { setActiveTab('laws'); setSelectedCaseId(null); setSelectedCitizenId(null); setSearchQuery(''); }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Gesetzeskatalog
            </li>
          </nav>
        </div>

        {/* Sidebar Footer with Role Switcher & Backups */}
        <div className="sidebar-footer">
          <div className="role-selector-container">
            <span className="role-selector-label">Dienstgrad / Abteilung</span>
            <select 
              className="role-select" 
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as any)}
            >
              <option value="police">Polizei (LSPD / Sheriff)</option>
              <option value="justice">Justiz (Staatsanwaltschaft)</option>
              <option value="judge">Richter (Gerichtshof)</option>
              <option value="admin">Systemadministrator</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }} onClick={handleExport}>
              Daten Exportieren
            </button>
            <label className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '8px', cursor: 'pointer', textAlign: 'center' }}>
              Daten Importieren
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            {currentRole === 'admin' && (
              <button className="btn btn-danger" style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }} onClick={handleResetAll}>
                System Reset
              </button>
            )}
          </div>

          <div className="user-profile">
            <div className="user-avatar">
              {currentOfficerName.charAt(0)}
            </div>
            <div className="user-details">
              <span className="user-name">{currentOfficerName}</span>
              <span className="user-role">{currentRole}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="main-content">
        
        {/* --- VIEW: DASHBOARD --- */}
        {activeTab === 'dashboard' && !selectedCaseId && !selectedCitizenId && (
          <>
            <header className="content-header">
              <div className="header-title-section">
                <h1>Zentrales Justizportal</h1>
                <p>Ermittlungsübersicht und Statusberichte der Justizbehörden</p>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={() => setShowCaseModal(true)}>
                  <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Neue Akte
                </button>
                <button className="btn btn-secondary" onClick={() => setShowWarrantModal(true)}>
                  Ausschreibung
                </button>
              </div>
            </header>

            {/* Stats Overview */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon cases">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{getStats().activeCases}</span>
                  <span className="stat-label">Laufende Ermittlungen</span>
                </div>
              </div>
              <div className="stat-card warrants">
                <div className="stat-icon warrants">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{getStats().activeWarrants}</span>
                  <span className="stat-label">Gesuchte Personen</span>
                </div>
              </div>
              <div className="stat-card citizens">
                <div className="stat-icon citizens">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{getStats().totalCitizens}</span>
                  <span className="stat-label">Bürgereinträge</span>
                </div>
              </div>
              <div className="stat-card closed">
                <div className="stat-icon closed">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{getStats().closedCases}</span>
                  <span className="stat-label">Gelöste Akten</span>
                </div>
              </div>
            </section>

            {/* Dashboard Panels */}
            <div className="dashboard-grid">
              
              {/* Left Panel: Recent Cases */}
              <div className="dashboard-panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    Letzte Ermittlungen
                  </h2>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => setActiveTab('cases')}>
                    Alle Akten
                  </button>
                </div>
                
                {cases.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                    Keine Akten im System vorhanden.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Aktenzeichen</th>
                          <th>Titel</th>
                          <th>Priorität</th>
                          <th>Bearbeiter</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.slice(0, 5).map(c => (
                          <tr key={c.id} onClick={() => { setSelectedCaseId(c.id); setActiveTab('cases'); }}>
                            <td style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{c.caseNumber}</td>
                            <td>{c.title}</td>
                            <td>
                              <span className={`badge badge-urgency-${c.urgency}`}>{c.urgency}</span>
                            </td>
                            <td>{c.creatorName}</td>
                            <td>
                              <span className={`badge badge-status-${c.status}`}>
                                {c.status === 'open' ? 'Offen' : c.status === 'closed' ? 'Archiv' : 'Gericht'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Panel: Warrants / Wanted citizens */}
              <div className="dashboard-panel">
                <div className="panel-header">
                  <h2 className="panel-title" style={{ color: 'var(--color-danger)' }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Fahndungs-Ticker
                  </h2>
                </div>

                <div className="activity-feed">
                  {warrants.filter(w => w.status === 'active').length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                      Derzeit liegen keine aktiven Haftbefehle vor.
                    </div>
                  ) : (
                    warrants.filter(w => w.status === 'active').map(w => (
                      <div key={w.id} className="activity-item">
                        <div className="activity-indicator red"></div>
                        <div className="activity-content">
                          <span className="activity-text">
                            Haftbefehl ausgestellt für <strong style={{ color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => { setSelectedCitizenId(w.citizenId); setActiveTab('citizens'); }}>{getCitizenFullName(w.citizenId)}</strong>
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grund: {w.reason}</span>
                          <span className="activity-time">Ausgestellt durch: {w.creatorName} am {new Date(w.createdAt).toLocaleDateString('de-DE')}</span>
                          {currentRole !== 'police' && (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '2px 8px', fontSize: '0.75rem', width: 'fit-content', marginTop: '6px' }}
                              onClick={() => handleArchiveWarrant(w.id)}
                            >
                              Löschen / Archivieren
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- VIEW: CASES --- */}
        {activeTab === 'cases' && (
          <>
            {/* List cases view */}
            {!selectedCaseId && (
              <>
                <header className="content-header">
                  <div className="header-title-section">
                    <h1>Ermittlungsakten</h1>
                    <p>Archivierung und Aktenerstellung der Strafverfahren</p>
                  </div>
                  <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowCaseModal(true)}>
                      <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Akte anlegen
                    </button>
                  </div>
                </header>

                <div className="search-container">
                  <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Suche nach Aktenzeichen, Titel oder Bearbeiter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {filteredCases.length === 0 ? (
                  <div className="empty-state">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <h3>Keine Akten gefunden</h3>
                    <p>Es konnten keine Ermittlungsakten mit dem Suchbegriff "{searchQuery}" gefunden werden.</p>
                  </div>
                ) : (
                  <div className="card-grid">
                    {filteredCases.map(c => (
                      <div key={c.id} className="info-card" onClick={() => setSelectedCaseId(c.id)}>
                        <div>
                          <div className="info-card-header">
                            <div>
                              <span className="info-card-subtitle" style={{ fontWeight: 600, color: 'var(--accent-color)', fontSize: '0.85rem' }}>{c.caseNumber}</span>
                              <h3 className="info-card-title">{c.title}</h3>
                            </div>
                            <span className={`badge badge-urgency-${c.urgency}`}>{c.urgency}</span>
                          </div>
                          <p className="info-card-body">{c.description}</p>
                        </div>
                        <div className="info-card-footer">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bearbeiter: {c.creatorName}</span>
                          <span className={`badge badge-status-${c.status}`}>
                            {c.status === 'open' ? 'Offen' : c.status === 'closed' ? 'Archiv' : 'Gericht'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Case Detail View */}
            {selectedCaseId && (() => {
              const activeCase = cases.find(c => c.id === selectedCaseId);
              if (!activeCase) return null;

              return (
                <>
                  <header className="content-header">
                    <div className="header-title-section">
                      <button className="btn btn-secondary" style={{ marginBottom: '12px', padding: '6px 12px' }} onClick={() => setSelectedCaseId(null)}>
                        ← Zurück zur Liste
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-color)', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>{activeCase.caseNumber}</span>
                        <h1 style={{ margin: 0 }}>{activeCase.title}</h1>
                      </div>
                    </div>
                    <div className="header-actions">
                      <select 
                        className="form-select" 
                        value={activeCase.status} 
                        onChange={(e) => handleUpdateCaseStatus(activeCase.id, e.target.value as any)}
                        style={{ padding: '10px 14px', borderRadius: 'var(--border-radius-md)' }}
                      >
                        <option value="open">Offen / In Ermittlung</option>
                        <option value="court_pending">Anklage erhoben (Gericht)</option>
                        <option value="closed">Geschlossen / Archiviert</option>
                      </select>
                      <button className="btn btn-primary" onClick={() => setShowEvidenceModal(true)}>
                        Beweismittel hinzufügen
                      </button>
                    </div>
                  </header>

                  <div className="detail-layout">
                    {/* Left Column: Metadata & Suspects */}
                    <div className="detail-panel-sidebar">
                      <div className="detail-card">
                        <h3 className="detail-card-title">Falldetails</h3>
                        <div className="detail-info-list">
                          <div className="info-row">
                            <span className="info-label">Dringlichkeit:</span>
                            <span className="info-value"><span className={`badge badge-urgency-${activeCase.urgency}`}>{activeCase.urgency}</span></span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Angelegt am:</span>
                            <span className="info-value">{new Date(activeCase.createdAt).toLocaleDateString('de-DE')}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Zuletzt aktualisiert:</span>
                            <span className="info-value">{new Date(activeCase.updatedAt).toLocaleDateString('de-DE')}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Sachbearbeiter:</span>
                            <span className="info-value">{activeCase.creatorName} ({activeCase.creatorRole.toUpperCase()})</span>
                          </div>
                        </div>
                      </div>

                      {/* Suspects in Case */}
                      <div className="detail-card">
                        <h3 className="detail-card-title">Beschuldigte & Anklagen</h3>
                        {activeCase.suspects.length === 0 ? (
                          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>
                            Keine Beschuldigten eingetragen.
                          </div>
                        ) : (
                          <div className="suspects-list">
                            {activeCase.suspects.map(s => (
                              <div key={s.citizenId} className="suspect-item-card">
                                <div className="suspect-item-header">
                                  <span className="suspect-item-name" style={{ cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => { setSelectedCitizenId(s.citizenId); setActiveTab('citizens'); }}>
                                    {getCitizenFullName(s.citizenId)}
                                    {isCitizenWanted(s.citizenId) && (
                                      <span className="badge badge-urgency-critical" style={{ marginLeft: '8px', fontSize: '0.65rem', padding: '2px 6px' }}>Gesucht</span>
                                    )}
                                  </span>
                                  <span className={`badge ${s.pleadedGuilty ? 'badge-status-closed' : 'badge-status-open'}`} style={{ fontSize: '0.65rem' }}>
                                    {s.pleadedGuilty ? 'Geständig' : 'Unkooperativ'}
                                  </span>
                                </div>

                                <div className="suspect-item-verdict" style={{ marginBottom: '8px' }}>
                                  <span className="verdict-fine">Bußgeld: {s.fine.toLocaleString()} $</span>
                                  <span className="verdict-jail">Haftzeit: {s.jailTime} Min.</span>
                                </div>

                                <div className="suspect-item-charges">
                                  {s.charges.length === 0 ? (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Keine konkreten Straftatbestände verlinkt.</span>
                                  ) : (
                                    s.charges.map(cId => {
                                      const lw = laws.find(l => l.id === cId);
                                      return (
                                        <span key={cId} className="charge-tag" title={lw?.description}>
                                          {lw?.title || 'Unbekannter Paragraph'}
                                        </span>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Case Description, Evidence, Logs */}
                    <div className="detail-panel-main">
                      <div className="detail-card">
                        <h3 className="detail-card-title">Sachverhalt / Ermittlungsbericht</h3>
                        <p style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{activeCase.description}</p>
                      </div>

                      {/* Evidences */}
                      <div className="detail-card">
                        <h3 className="detail-card-title">Sichergestellte Beweismittel</h3>
                        {activeCase.evidences.length === 0 ? (
                          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                            Keine Beweismittel erfasst.
                          </div>
                        ) : (
                          <div className="evidence-grid">
                            {activeCase.evidences.map(ev => (
                              <div key={ev.id} className="evidence-card">
                                {ev.imageUrl ? (
                                  <img className="evidence-img" src={ev.imageUrl} alt={ev.title} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                                ) : (
                                  <div className="evidence-img-placeholder">
                                    <svg style={{ width: 28, height: 28 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                )}
                                <div className="evidence-info">
                                  <div className="evidence-title">{ev.title}</div>
                                  <div className="evidence-desc">{ev.description}</div>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Erfasst: {new Date(ev.createdAt).toLocaleDateString('de-DE')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Logs & Investigation notes */}
                      <div className="detail-card">
                        <h3 className="detail-card-title">Chronologischer Ermittlungsverlauf</h3>
                        <div className="activity-feed" style={{ marginBottom: '20px' }}>
                          {activeCase.notes.map((note, index) => (
                            <div key={index} className="activity-item" style={{ padding: '8px 0' }}>
                              <div className="activity-indicator blue"></div>
                              <div className="activity-content">
                                <span className="activity-text" style={{ fontSize: '0.85rem' }}>{note}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add note form */}
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const input = (e.target as HTMLFormElement).elements.namedItem('noteText') as HTMLInputElement;
                          handleAddCaseNote(activeCase.id, input.value);
                          input.value = '';
                        }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                              type="text" 
                              name="noteText" 
                              placeholder="Neues Protokoll / Ermittlungsschritt hinzufügen..." 
                              className="form-input" 
                              style={{ flexGrow: 1 }}
                              required 
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>Hinzufügen</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        )}

        {/* --- VIEW: CITIZENS --- */}
        {activeTab === 'citizens' && (
          <>
            {/* List Citizens */}
            {!selectedCitizenId && (
              <>
                <header className="content-header">
                  <div className="header-title-section">
                    <h1>Personenkartei</h1>
                    <p>Bürgerdatenbank und Vorstrafenregister</p>
                  </div>
                  <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowCitizenModal(true)}>
                      <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      Bürger anlegen
                    </button>
                  </div>
                </header>

                <div className="search-container">
                  <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Suche nach Name, Vorname oder Telefonnummer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {filteredCitizens.length === 0 ? (
                  <div className="empty-state">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" /></svg>
                    <h3>Keine Personeneinträge</h3>
                    <p>Es konnten keine Profile mit dem Suchbegriff "{searchQuery}" gefunden werden.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-premium)' }}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Geburtsdatum</th>
                          <th>Geschlecht</th>
                          <th>Telefonnummer</th>
                          <th>Fahndungs-Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCitizens.map(c => (
                          <tr key={c.id} onClick={() => setSelectedCitizenId(c.id)}>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{c.lastName}, {c.firstName}</td>
                            <td>{c.birthDate}</td>
                            <td>{c.gender}</td>
                            <td>{c.phoneNumber || 'Nicht hinterlegt'}</td>
                            <td>
                              {isCitizenWanted(c.id) ? (
                                <span className="badge badge-urgency-critical">Gesucht / Haftbefehl</span>
                              ) : (
                                <span className="badge badge-status-closed" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>Keine Fahndung</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Profile View */}
            {selectedCitizenId && (() => {
              const cit = citizens.find(c => c.id === selectedCitizenId);
              if (!cit) return null;

              // Alle Akten filtern, in denen dieser Bürger als Verdächtiger vorkommt
              const personalCases = cases.filter(c => c.suspects.some(s => s.citizenId === cit.id));
              // Aktive Haftbefehle finden
              const activeWarrs = warrants.filter(w => w.citizenId === cit.id && w.status === 'active');

              return (
                <>
                  <header className="content-header">
                    <div className="header-title-section">
                      <button className="btn btn-secondary" style={{ marginBottom: '12px', padding: '6px 12px' }} onClick={() => setSelectedCitizenId(null)}>
                        ← Zurück zur Personenkartei
                      </button>
                      <h1>Bürgerprofil</h1>
                    </div>
                    {activeWarrs.length > 0 && (
                      <div className="badge badge-urgency-critical" style={{ fontSize: '1rem', padding: '8px 16px', display: 'flex', gap: '8px' }}>
                        ⚠️ DRINGENDER HAFTBEFEHL OFFEN
                      </div>
                    )}
                  </header>

                  <div className="detail-layout">
                    {/* Left Column: Avatar & personal details & licenses */}
                    <div className="detail-panel-sidebar">
                      <div className="profile-avatar-container">
                        <div className="large-avatar">
                          {cit.firstName.charAt(0)}{cit.lastName.charAt(0)}
                        </div>
                        <div className="profile-name">{cit.firstName} {cit.lastName}</div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {cit.id}</span>
                      </div>

                      <div className="detail-card">
                        <h3 className="detail-card-title">Persönliche Angaben</h3>
                        <div className="detail-info-list">
                          <div className="info-row">
                            <span className="info-label">Geburtsdatum:</span>
                            <span className="info-value">{cit.birthDate}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Geschlecht:</span>
                            <span className="info-value">{cit.gender}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Telefonnummer:</span>
                            <span className="info-value">{cit.phoneNumber || 'N/A'}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Registriert seit:</span>
                            <span className="info-value">{new Date(cit.createdAt).toLocaleDateString('de-DE')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-card">
                        <h3 className="detail-card-title">Lizenzen & Dokumente</h3>
                        <div className="detail-info-list" style={{ gap: '20px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className="info-label">Fahrerlaubnis:</span>
                              <span className={`license-${cit.driverLicense}`}>
                                {cit.driverLicense === 'active' ? 'Gültig' : cit.driverLicense === 'suspended' ? 'Gesperrt' : 'Keine'}
                              </span>
                            </div>
                            {currentRole !== 'police' && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', flexGrow: 1 }} onClick={() => handleUpdateLicenses(cit.id, 'driver', 'active')}>Erteilen</button>
                                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem', flexGrow: 1 }} onClick={() => handleUpdateLicenses(cit.id, 'driver', 'suspended')}>Sperren</button>
                              </div>
                            )}
                          </div>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span className="info-label">Waffenschein:</span>
                              <span className={`license-${cit.weaponLicense}`}>
                                {cit.weaponLicense === 'active' ? 'Aktiv' : cit.weaponLicense === 'suspended' ? 'Entzogen' : 'Keiner'}
                              </span>
                            </div>
                            {currentRole !== 'police' && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', flexGrow: 1 }} onClick={() => handleUpdateLicenses(cit.id, 'weapon', 'active')}>Erteilen</button>
                                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem', flexGrow: 1 }} onClick={() => handleUpdateLicenses(cit.id, 'weapon', 'suspended')}>Entziehen</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Case history & Justice internal notes */}
                    <div className="detail-panel-main">
                      {/* Active Warrants Alerts */}
                      {activeWarrs.length > 0 && (
                        <div className="detail-card" style={{ borderLeft: '4px solid var(--color-danger)', backgroundColor: 'rgba(255, 23, 68, 0.05)' }}>
                          <h3 className="detail-card-title" style={{ color: 'var(--color-danger)' }}>Aktive Ausschreibungen</h3>
                          {activeWarrs.map(w => (
                            <div key={w.id} style={{ marginBottom: '12px' }}>
                              <p style={{ fontWeight: 600 }}>Ausschreibungsgrund:</p>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{w.reason}</p>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aktiviert von {w.creatorName} am {new Date(w.createdAt).toLocaleDateString('de-DE')}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Case History */}
                      <div className="detail-card">
                        <h3 className="detail-card-title">Ermittlungs- & Vorstrafenakte</h3>
                        {personalCases.length === 0 ? (
                          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px' }}>
                            Keine Straftaten oder Vorfälle in diesem Profil verzeichnet.
                          </div>
                        ) : (
                          <div className="table-container">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th>Fall</th>
                                  <th>Titel</th>
                                  <th>Urteil/Strafmaß</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {personalCases.map(c => {
                                  const suspectInfo = c.suspects.find(s => s.citizenId === cit.id);
                                  return (
                                    <tr key={c.id} onClick={() => { setSelectedCaseId(c.id); setActiveTab('cases'); }}>
                                      <td style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{c.caseNumber}</td>
                                      <td>{c.title}</td>
                                      <td>
                                        {suspectInfo ? (
                                          <span>{suspectInfo.fine.toLocaleString()}$ / {suspectInfo.jailTime} Min. Haft</span>
                                        ) : 'K.A.'}
                                      </td>
                                      <td>
                                        <span className={`badge badge-status-${c.status}`}>
                                          {c.status === 'open' ? 'Offen' : c.status === 'closed' ? 'Archiv' : 'Gericht'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Internal Notes */}
                      <div className="detail-card">
                        <h3 className="detail-card-title">Justizinterne Bemerkungen</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const txt = (e.target as HTMLFormElement).elements.namedItem('citNotes') as HTMLTextAreaElement;
                          handleUpdateCitizenNotes(cit.id, txt.value);
                        }}>
                          <div className="form-group">
                            <textarea 
                              name="citNotes" 
                              defaultValue={cit.notes} 
                              className="form-textarea" 
                              style={{ minHeight: '150px' }} 
                              placeholder="Hinterlege Notizen über Auffälligkeiten, Verbindungen oder Sicherheitswarnungen..." 
                            />
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '10px' }}>Speichern</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        )}

        {/* --- VIEW: LAWS --- */}
        {activeTab === 'laws' && (
          <div className="laws-view-container">
            <header className="content-header">
              <div className="header-title-section">
                <h1>Gesetzeskatalog (Strafgesetzbuch)</h1>
                <p>Übersicht der Paragraphen, Bußgelder und Haftzeiten für Ermittlungen</p>
              </div>
            </header>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
              <div style={{ flexGrow: 1 }} className="search-container">
                <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Gesetz suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                className="form-select"
                value={lawCategoryFilter}
                onChange={(e) => setLawCategoryFilter(e.target.value)}
                style={{ minWidth: '200px' }}
              >
                <option value="ALL">Alle Kategorien</option>
                {lawCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Display Laws by Category */}
            {lawCategories.filter(cat => lawCategoryFilter === 'ALL' || cat === lawCategoryFilter).map(category => {
              const categoryLaws = filteredLaws.filter(l => l.category === category);
              if (categoryLaws.length === 0) return null;

              return (
                <section key={category} className="laws-category-section">
                  <h2 className="category-title">{category}</h2>
                  <div className="laws-grid">
                    {categoryLaws.map(law => (
                      <div key={law.id} className="law-card">
                        <div className="law-card-header">
                          <span className="law-card-title">{law.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {law.id}</span>
                        </div>
                        <div className="law-card-stats">
                          <span className="law-stat-badge law-stat-fine">Fine: {law.fine.toLocaleString()} $</span>
                          {law.jail > 0 && (
                            <span className="law-stat-badge law-stat-jail">Jail: {law.jail} Min.</span>
                          )}
                        </div>
                        <p className="law-card-desc">{law.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

      </main>

      {/* --- MODAL: NEW CASE --- */}
      {showCaseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Ermittlungsakte erstellen</h2>
              <button className="modal-close" onClick={() => setShowCaseModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateCase}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titel der Akte / Vorfall</label>
                  <input 
                    type="text" 
                    placeholder="z.B. Ladendiebstahl 24/7 Supermarkt" 
                    className="form-input"
                    value={newCaseTitle}
                    onChange={(e) => setNewCaseTitle(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priorität / Dringlichkeit</label>
                    <select 
                      className="form-select"
                      value={newCaseUrgency}
                      onChange={(e) => setNewCaseUrgency(e.target.value as any)}
                    >
                      <option value="low">Niedrig</option>
                      <option value="medium">Mittel</option>
                      <option value="high">Hoch</option>
                      <option value="critical">Kritisch / Höchste Stufe</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bearbeitender Beamter</label>
                    <input type="text" className="form-input" value={currentOfficerName} disabled />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sachverhalt / Tatbeschreibung</label>
                  <textarea 
                    placeholder="Detaillierte Beschreibung des Tathergangs, Zeugenaussagen, etc." 
                    className="form-textarea"
                    value={newCaseDesc}
                    onChange={(e) => setNewCaseDesc(e.target.value)}
                    required
                  />
                </div>

                {/* Add suspect section */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Verdächtige Person hinzufügen</label>
                  <div className="search-container" style={{ marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Suche nach Name..." 
                      className="form-input" 
                      value={suspectSearchQuery}
                      onChange={(e) => setSuspectSearchQuery(e.target.value)}
                    />
                  </div>
                  {suspectSearchQuery.trim() !== '' && (
                    <div className="citizen-search-results">
                      {citizens.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(suspectSearchQuery.toLowerCase())).map(c => (
                        <div key={c.id} className="citizen-search-result-item" onClick={() => handleAddSuspectToForm(c.id)}>
                          {c.lastName}, {c.firstName} (Geb: {c.birthDate})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Added suspects listed with Charge configuration */}
                  {caseSuspects.length > 0 && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <span className="form-label">Konfigurierte Beschuldigte:</span>
                      {caseSuspects.map(s => {
                        const citProfile = citizens.find(c => c.id === s.citizenId);
                        return (
                          <div key={s.citizenId} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <strong style={{ color: 'var(--accent-color)' }}>{citProfile ? `${citProfile.firstName} ${citProfile.lastName}` : 'Unbekannt'}</strong>
                              <button type="button" className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleRemoveSuspectFromForm(s.citizenId)}>Entfernen</button>
                            </div>

                            {/* Guilty Switch */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '10px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={s.pleadedGuilty} onChange={() => handleToggleGuiltyInForm(s.citizenId)} />
                              Person zeigt sich geständig (Strafmilderungs-Vormerkung)
                            </label>

                            {/* Law Selection */}
                            <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '6px', display: 'block' }}>Straftatbestände (Gesetze) zuweisen:</span>
                            <div className="law-selection-list">
                              {laws.map(l => (
                                <label key={l.id} className="law-select-item">
                                  <input 
                                    type="checkbox" 
                                    className="law-select-checkbox" 
                                    checked={s.charges.includes(l.id)} 
                                    onChange={() => handleToggleChargeInForm(s.citizenId, l.id)}
                                  />
                                  <div className="law-select-details">
                                    <span className="law-select-title">{l.title} ({l.category})</span>
                                    <span className="law-select-sub">Bußgeld: {l.fine}$ | Haft: {l.jail} Min.</span>
                                  </div>
                                </label>
                              ))}
                            </div>

                            {/* Strafkalkulation Live */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                              <span>Kalkuliertes Bußgeld: <strong>{s.fine.toLocaleString()} $</strong></span>
                              <span>Kalkulierte Haftzeit: <strong>{s.jailTime} Min.</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCaseModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary">Akte speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW CITIZEN --- */}
      {showCitizenModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Bürgerakte anlegen</h2>
              <button className="modal-close" onClick={() => setShowCitizenModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateCitizen}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vorname</label>
                    <input type="text" placeholder="z.B. James" className="form-input" value={newCitFirst} onChange={(e) => setNewCitFirst(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nachname</label>
                    <input type="text" placeholder="z.B. Carter" className="form-input" value={newCitLast} onChange={(e) => setNewCitLast(e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Geburtsdatum</label>
                    <input type="date" className="form-input" value={newCitBirth} onChange={(e) => setNewCitBirth(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Geschlecht</label>
                    <select className="form-select" value={newCitGender} onChange={(e) => setNewCitGender(e.target.value)}>
                      <option value="Männlich">Männlich</option>
                      <option value="Weiblich">Weiblich</option>
                      <option value="Divers">Divers</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Telefonnummer (optional)</label>
                  <input type="text" placeholder="555-..." className="form-input" value={newCitPhone} onChange={(e) => setNewCitPhone(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Justizbemerkung / Erste Notizen</label>
                  <textarea placeholder="z.B. Inhaber der Tankstelle Mitte, keine Auffälligkeiten." className="form-textarea" value={newCitNotes} onChange={(e) => setNewCitNotes(e.target.value)} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCitizenModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary">Bürger speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW WARRANT --- */}
      {showWarrantModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Haftbefehl / Fahndung ausschreiben</h2>
              <button className="modal-close" onClick={() => setShowWarrantModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateWarrant}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Person suchen</label>
                  <input 
                    type="text" 
                    placeholder="Suche nach Name..." 
                    className="form-input" 
                    value={warrantSearchQuery}
                    onChange={(e) => setWarrantSearchQuery(e.target.value)}
                  />
                  {warrantSearchQuery.trim() !== '' && (
                    <div className="citizen-search-results">
                      {citizens.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(warrantSearchQuery.toLowerCase())).map(c => (
                        <div 
                          key={c.id} 
                          className="citizen-search-result-item" 
                          style={{ backgroundColor: newWarrantCitId === c.id ? 'var(--accent-light)' : 'transparent' }}
                          onClick={() => {
                            setNewWarrantCitId(c.id);
                            setWarrantSearchQuery(`${c.firstName} ${c.lastName}`);
                          }}
                        >
                          {c.lastName}, {c.firstName} (Geb: {c.birthDate})
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Dienststelle / Aussteller</label>
                  <input type="text" className="form-input" value={currentOfficerName} disabled />
                </div>

                <div className="form-group">
                  <label className="form-label">Fahndungsgrund / Tatverdacht</label>
                  <textarea 
                    placeholder="Ausführliche Begründung für die Ausschreibung (z.B. Fluchtgefahr, Bankraub, ausstehendes Gerichtsurteil)" 
                    className="form-textarea" 
                    value={newWarrantReason}
                    onChange={(e) => setNewWarrantReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWarrantModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>Ausschreiben</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD EVIDENCE --- */}
      {showEvidenceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Beweismittel hinzufügen</h2>
              <button className="modal-close" onClick={() => setShowEvidenceModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleAddEvidence}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Beweis-Titel / Bezeichnung</label>
                  <input 
                    type="text" 
                    placeholder="z.B. Tatwaffe (SNS Pistol)" 
                    className="form-input" 
                    value={newEvidenceTitle}
                    onChange={(e) => setNewEvidenceTitle(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bild-URL (optional)</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/... (oder ähnlicher Bild-Link)" 
                    className="form-input" 
                    value={newEvidenceImg}
                    onChange={(e) => setNewEvidenceImg(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Beschreibung / Analyse-Bericht</label>
                  <textarea 
                    placeholder="Beschreibung des Beweisstücks und Fundorts (z.B. Gefunden im Kofferraum des Beschuldigten, Fingerabdrücke gesichert)." 
                    className="form-textarea" 
                    value={newEvidenceDesc}
                    onChange={(e) => setNewEvidenceDesc(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEvidenceModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary">Beweis sichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
