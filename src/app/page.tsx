'use client';

import React, { useState, useEffect } from 'react';
import type { Citizen, Case, Warrant, Law, Suspect, Evidence, Document, CaseNote, SystemStats } from '@/types';
import { INITIAL_LAWS } from '@/data/laws';

export default function Home() {
  // Appearance
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cases' | 'citizens' | 'laws'>('dashboard');
  const [currentRole, setCurrentRole] = useState<'police' | 'justice' | 'judge' | 'admin'>('police');
  const [currentOfficerName, setCurrentOfficerName] = useState<string>('Officer Davis');
  
  // Data States
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [warrants, setWarrants] = useState<Warrant[]>([]);
  const [laws] = useState<Law[]>(INITIAL_LAWS);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lawCategoryFilter, setLawCategoryFilter] = useState<string>('ALL');

  // Selected Detail States
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);
  const [activeDocToPrint, setActiveDocToPrint] = useState<Document | null>(null);

  // Modal States
  const [showCaseModal, setShowCaseModal] = useState<boolean>(false);
  const [showCitizenModal, setShowCitizenModal] = useState<boolean>(false);
  const [showWarrantModal, setShowWarrantModal] = useState<boolean>(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  
  // New Case Form States
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseUrgency, setNewCaseUrgency] = useState<'NIEDRIG' | 'MITTEL' | 'HOCH' | 'KRITISCH'>('MITTEL');
  const [caseSuspects, setCaseSuspects] = useState<Omit<Suspect, 'id' | 'caseId'>[]>([]);
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

  // New Document Form States
  const [newDocType, setNewDocType] = useState<'BESCHLUSS' | 'URTEIL' | 'PROTOKOLL'>('BESCHLUSS');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  // Toast Notification States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Data Loading & Auto-Refresh
  useEffect(() => {
    loadData();
    // Auto-Refresh alle 30 Sekunden für Live-Sync (Echtzeiteffekt wie Google Drive)
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [citsRes, casesRes, warrantsRes] = await Promise.all([
        fetch('/api/citizens'),
        fetch('/api/cases'),
        fetch('/api/warrants')
      ]);

      if (citsRes.ok && casesRes.ok && warrantsRes.ok) {
        setCitizens(await citsRes.json());
        setCases(await casesRes.json());
        setWarrants(await warrantsRes.json());
      }
    } catch (err) {
      console.error('Fehler beim Laden der API-Daten:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Role management
  const handleRoleChange = (role: 'police' | 'justice' | 'judge' | 'admin') => {
    setCurrentRole(role);
    if (role === 'police') setCurrentOfficerName('Officer Davis');
    else if (role === 'justice') setCurrentOfficerName('Staatsanwalt Kraemer');
    else if (role === 'judge') setCurrentOfficerName('Richterin Vance');
    else if (role === 'admin') setCurrentOfficerName('Admin Root');
    showToast(`Dienstgrad gewechselt zu: ${role.toUpperCase()}`, 'info');
  };

  const getStats = (): SystemStats => {
    return {
      activeCases: cases.filter(c => c.status !== 'ARCHIV').length,
      activeWarrants: warrants.filter(w => w.status === 'AKTIV').length,
      totalCitizens: citizens.length,
      closedCases: cases.filter(c => c.status === 'ARCHIV').length
    };
  };

  // --- API OPERATIONS ---

  // Cases
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim() || !newCaseDesc.trim()) {
      showToast('Bitte Titel und Sachverhalt ausfüllen', 'error');
      return;
    }

    const year = new Date().getFullYear();
    const count = cases.length + 1;
    const caseNumber = `${count} Js ${Math.floor(Math.random() * 800 + 100)}/${year.toString().slice(-2)}`;

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseNumber,
          title: newCaseTitle,
          description: newCaseDesc,
          status: 'ERMITTLUNG',
          urgency: newCaseUrgency,
          creatorName: currentOfficerName,
          creatorRole: currentRole,
          suspects: caseSuspects
        })
      });

      if (res.ok) {
        showToast(`Ermittlungsakte ${caseNumber} erfolgreich erstellt!`);
        setShowCaseModal(false);
        setNewCaseTitle('');
        setNewCaseDesc('');
        setNewCaseUrgency('MITTEL');
        setCaseSuspects([]);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Fehler beim Erstellen der Akte', 'error');
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  const handleUpdateCaseStatus = async (caseId: string, newStatus: 'ERMITTLUNG' | 'ANKLAGE' | 'ARCHIV') => {
    if (newStatus === 'ARCHIV' && currentRole === 'police') {
      showToast('Polizisten dürfen keine Akten archivieren. Wende dich an die Justiz.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, officerName: currentOfficerName })
      });

      if (res.ok) {
        showToast(`Fallstatus geändert auf: ${newStatus}`);
        loadData();
      } else {
        showToast('Fehler beim Aktualisieren des Status', 'error');
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  const handleAddCaseNote = async (e: React.FormEvent, caseId: string) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('noteText') as HTMLInputElement;
    const content = input.value.trim();
    if (!content) return;

    try {
      const res = await fetch(`/api/cases/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorName: currentOfficerName })
      });

      if (res.ok) {
        showToast('Notiz hinzugefügt');
        input.value = '';
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !newEvidenceTitle.trim() || !newEvidenceDesc.trim()) {
      showToast('Titel und Beschreibung erforderlich', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/evidences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvidenceTitle,
          description: newEvidenceDesc,
          imageUrl: newEvidenceImg.trim() || undefined
        })
      });

      if (res.ok) {
        showToast('Beweismittel gesichert');
        setShowEvidenceModal(false);
        setNewEvidenceTitle('');
        setNewEvidenceDesc('');
        setNewEvidenceImg('');
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !newDocTitle.trim() || !newDocContent.trim()) {
      showToast('Titel und Inhalt erforderlich', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newDocType,
          title: newDocTitle,
          content: newDocContent
        })
      });

      if (res.ok) {
        showToast('Dokument hinzugefügt');
        setShowDocModal(false);
        setNewDocTitle('');
        setNewDocContent('');
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  const handleSignDocument = async (docId: string) => {
    if (currentRole !== 'judge') {
      showToast('Nur Richter dürfen Justizdokumente unterzeichnen!', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/documents/${docId}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judgeName: currentOfficerName })
      });

      if (res.ok) {
        showToast('Dokument richterlich unterzeichnet & gesiegelt!', 'success');
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  // Citizens
  const handleCreateCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitFirst.trim() || !newCitLast.trim() || !newCitBirth) {
      showToast('Bitte alle Pflichtfelder ausfüllen', 'error');
      return;
    }

    try {
      const res = await fetch('/api/citizens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newCitFirst,
          lastName: newCitLast,
          birthDate: newCitBirth,
          gender: newCitGender,
          phoneNumber: newCitPhone.trim() || null,
          notes: newCitNotes
        })
      });

      if (res.ok) {
        showToast('Bürgerakte erfolgreich angelegt');
        setShowCitizenModal(false);
        setNewCitFirst('');
        setNewCitLast('');
        setNewCitBirth('');
        setNewCitGender('Männlich');
        setNewCitPhone('');
        setNewCitNotes('');
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  const handleUpdateLicenses = async (citizenId: string, type: 'driver' | 'weapon', status: string) => {
    if (currentRole === 'police') {
      showToast('Polizei darf Lizenzen nicht direkt entziehen/erteilen. Nur Staatsanwaltschaft/Richter.', 'error');
      return;
    }

    try {
      const updateObj = type === 'driver' ? { driverLicense: status } : { weaponLicense: status };
      const res = await fetch(`/api/citizens/${citizenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateObj)
      });

      if (res.ok) {
        showToast('Lizenzen aktualisiert');
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  const handleUpdateCitizenNotes = async (e: React.FormEvent, citizenId: string) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const txt = form.elements.namedItem('citNotes') as HTMLTextAreaElement;

    try {
      const res = await fetch(`/api/citizens/${citizenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: txt.value })
      });

      if (res.ok) {
        showToast('Justizinterne Bemerkungen gespeichert');
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  // Warrants
  const handleCreateWarrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarrantCitId || !newWarrantReason.trim()) {
      showToast('Bitte Person und Begründung eingeben', 'error');
      return;
    }

    try {
      const res = await fetch('/api/warrants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId: newWarrantCitId,
          reason: newWarrantReason,
          creatorName: currentOfficerName
        })
      });

      if (res.ok) {
        showToast('Fahndung/Haftbefehl erfolgreich ausgeschrieben', 'error');
        setShowWarrantModal(false);
        setNewWarrantCitId('');
        setNewWarrantReason('');
        setWarrantSearchQuery('');
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  const handleArchiveWarrant = async (warrantId: string) => {
    try {
      const res = await fetch(`/api/warrants/${warrantId}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerName: currentOfficerName })
      });

      if (res.ok) {
        showToast('Fahndung aufgehoben/archiviert');
        loadData();
      }
    } catch (err) {
      showToast('Netzwerkfehler', 'error');
    }
  };

  // Backups
  const handleExport = async () => {
    try {
      const res = await fetch('/api/system/backup');
      if (res.ok) {
        const backupObject = await res.json();
        const dataStr = JSON.stringify(backupObject, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `justizportal_archiv_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Backup-Datei heruntergeladen');
      }
    } catch (err) {
      showToast('Fehler beim Exportieren', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async event => {
        if (event.target?.result) {
          try {
            const res = await fetch('/api/system/backup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: event.target.result as string
            });

            if (res.ok) {
              showToast('Backup erfolgreich eingespielt');
              loadData();
            } else {
              showToast('Ungültiges Backup-Format', 'error');
            }
          } catch (err) {
            showToast('Fehler beim Einlesen', 'error');
          }
        }
      };
    }
  };

  const handleResetAll = async () => {
    if (window.confirm('WARNUNG: Möchtest du wirklich das gesamte Ermittlungsarchiv und alle Bürgerdaten löschen?')) {
      try {
        const res = await fetch('/api/system/backup', { method: 'DELETE' });
        if (res.ok) {
          showToast('System wurde vollständig zurückgesetzt.', 'info');
          setSelectedCaseId(null);
          setSelectedCitizenId(null);
          loadData();
        }
      } catch (err) {
        showToast('Fehler beim Zurücksetzen', 'error');
      }
    }
  };

  // --- NEW CASE FORM HELPERS ---
  const handleAddSuspectToForm = (citizenId: string) => {
    if (caseSuspects.some(s => s.citizenId === citizenId)) {
      showToast('Person ist bereits hinzugefügt', 'error');
      return;
    }
    const newSuspect = {
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

  // --- HTML RENDERING ASSISTANCE ---
  const getCitizenFullName = (citizenId: string) => {
    const c = citizens.find(cit => cit.id === citizenId);
    return c ? `${c.firstName} ${c.lastName}` : 'Unbekannter Bürger';
  };

  const isCitizenWanted = (citizenId: string) => {
    return warrants.some(w => w.citizenId === citizenId && w.status === 'AKTIV');
  };

  // PDF Druck Trigger
  const triggerPrintDoc = (doc: Document) => {
    setActiveDocToPrint(doc);
    setTimeout(() => {
      window.print();
      setActiveDocToPrint(null);
    }, 500);
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
    <div className={`app-layout ${isDarkMode ? 'dark-theme' : ''}`}>
      
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
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.type === 'error' ? '⚠️' : '✓'} {toast.message}
        </div>
      )}

      {/* --- HIDDEN DIN-A4 PDF PRINT AREA --- */}
      {activeDocToPrint && (() => {
        const caseObj = cases.find(c => c.id === activeDocToPrint.caseId);
        return (
          <div style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 99999, backgroundColor: '#fff', color: '#000' }} className="only-print">
            <div className="justiz-document-paper">
              <div className="justiz-stamp signed">
                {activeDocToPrint.signedBy ? `Ausgefertigt\nRichterlich` : 'Entwurf'}
              </div>
              <div className="justiz-header">
                <div className="justiz-crest">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div className="justiz-court-name">Landgericht Berlin / Staatsanwaltschaft</div>
                <div className="justiz-court-sub">Ermittlungs- & Urkundsarchiv</div>
              </div>
              <div className="justiz-file-number">Az.: {caseObj?.caseNumber || 'N/A'}</div>
              <div className="justiz-doc-title">{activeDocToPrint.title}</div>
              
              {activeDocToPrint.type === 'URTEIL' && (
                <div className="justiz-verdict-intro">IM NAMEN DES VOLKES</div>
              )}

              <div className="justiz-body-text">{activeDocToPrint.content}</div>

              {activeDocToPrint.signedBy && (
                <div className="justiz-signature-block">
                  <div className="justiz-signature-line">
                    <p style={{ fontFamily: 'var(--font-main)', fontStyle: 'italic', marginBottom: '8px' }}>{activeDocToPrint.signedBy}</p>
                    <p style={{ fontWeight: 'bold' }}>Richter / Richterin</p>
                    <p style={{ fontSize: '0.75rem', color: '#666' }}>Unterzeichnet am: {new Date(activeDocToPrint.signedAt || '').toLocaleDateString('de-DE')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* --- NORMAL APP NAVIGATION & VIEWPORT --- */}
      <aside className="sidebar no-print">
        <div>
          <div className="sidebar-header">
            <div className="brand-title">
              <svg style={{ width: 22, height: 22 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Bundes-Justiz
            </div>
            <div className="brand-sub">Ermittlungsarchiv v2.0</div>
          </div>

          <nav className="menu-list">
            <li className={`menu-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSelectedCaseId(null); setSelectedCitizenId(null); setSearchQuery(''); }}>
              Zentrale (Dashboard)
            </li>
            <li className={`menu-link ${activeTab === 'cases' ? 'active' : ''}`} onClick={() => { setActiveTab('cases'); setSelectedCaseId(null); setSelectedCitizenId(null); setSearchQuery(''); }}>
              Js-Ermittlungsakten
            </li>
            <li className={`menu-link ${activeTab === 'citizens' ? 'active' : ''}`} onClick={() => { setActiveTab('citizens'); setSelectedCaseId(null); setSelectedCitizenId(null); setSearchQuery(''); }}>
              Personenkartei
            </li>
            <li className={`menu-link ${activeTab === 'laws' ? 'active' : ''}`} onClick={() => { setActiveTab('laws'); setSelectedCaseId(null); setSelectedCitizenId(null); setSearchQuery(''); }}>
              Gesetzeskatalog (StGB)
            </li>
          </nav>
        </div>

        {/* Sidebar Footer (Role selector & backups) */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Dienststellung</label>
            <select className="form-select" value={currentRole} onChange={(e) => handleRoleChange(e.target.value as any)}>
              <option value="police">Kriminalpolizei (LKA)</option>
              <option value="justice">Staatsanwaltschaft (StA)</option>
              <option value="judge">Richterrat (Gericht)</option>
              <option value="admin">System-Administrator</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '8px' }} onClick={handleExport}>
              Archiv Exportieren (JSON)
            </button>
            <label className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '8px', cursor: 'pointer', textAlign: 'center' }}>
              Archiv Importieren
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            {currentRole === 'admin' && (
              <button className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '8px' }} onClick={handleResetAll}>
                Datenbank löschen
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: '#fff', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem', justifyContent: 'center' }}>
              {currentOfficerName.charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: 0 }}>{currentOfficerName}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase' }}>{currentRole}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-wrapper no-print">
        
        {/* Top Navbar */}
        <header className="top-nav">
          <div className="nav-role-badge">
            Dienst-Modus: {currentRole === 'police' ? 'Ermittler' : currentRole === 'justice' ? 'Staatsanwalt' : currentRole === 'judge' ? 'Richter' : 'Admin'}
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? '☀️ Helles Thema' : '🌙 Dunkles Thema'}
            </button>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={loadData}>
              🔄 Synchronisieren
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="main-content">

          {/* --- VIEW: DASHBOARD --- */}
          {activeTab === 'dashboard' && !selectedCaseId && !selectedCitizenId && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Zentrale Justizstelle</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Deutsches Behördenportal zur Fallbearbeitung und Anklageerstellung</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => setShowCaseModal(true)}>
                    Akte anlegen
                  </button>
                  <button className="btn btn-danger" style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }} onClick={() => setShowWarrantModal(true)}>
                    Fahndung ausschreiben
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="panel-card" style={{ padding: '20px', marginBottom: 0, borderLeft: '4px solid var(--accent-color)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Offene Ermittlungen</p>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: '4px' }}>{getStats().activeCases}</h2>
                </div>
                <div className="panel-card" style={{ padding: '20px', marginBottom: 0, borderLeft: '4px solid var(--color-danger)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Offene Haftbefehle</p>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: '4px', color: 'var(--color-danger)' }}>{getStats().activeWarrants}</h2>
                </div>
                <div className="panel-card" style={{ padding: '20px', marginBottom: 0, borderLeft: '4px solid var(--color-info)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Bürgerdatenbank</p>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: '4px' }}>{getStats().totalCitizens}</h2>
                </div>
                <div className="panel-card" style={{ padding: '20px', marginBottom: 0, borderLeft: '4px solid var(--color-success)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gelöste Archiv-Akten</p>
                  <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: '4px', color: 'var(--color-success)' }}>{getStats().closedCases}</h2>
                </div>
              </div>

              {/* Dashboard Layout (Recent Cases & Warrants Ticker) */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* Recent Cases */}
                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <h3 className="panel-card-title">Letzte Ermittlungen</h3>
                  {cases.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Keine Akten vorhanden.</div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Az.</th>
                            <th>Titel</th>
                            <th>Dringlichkeit</th>
                            <th>Bearbeiter</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cases.slice(0, 5).map(c => (
                            <tr key={c.id} onClick={() => { setSelectedCaseId(c.id); setActiveTab('cases'); }}>
                              <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{c.caseNumber}</td>
                              <td>{c.title}</td>
                              <td><span className={`badge badge-urgency-${c.urgency}`}>{c.urgency}</span></td>
                              <td>{c.creatorName}</td>
                              <td><span className={`badge badge-status-${c.status}`}>{c.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Fahndungen ticker */}
                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <h3 className="panel-card-title" style={{ color: 'var(--color-danger)' }}>Aktive Fahndungen</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '350px', overflowY: 'auto' }}>
                    {warrants.filter(w => w.status === 'AKTIV').length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Keine aktiven Ausschreibungen.</div>
                    ) : (
                      warrants.filter(w => w.status === 'AKTIV').map(w => (
                        <div key={w.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                          <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                            <span style={{ cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => { setSelectedCitizenId(w.citizenId); setActiveTab('citizens'); }}>
                              {getCitizenFullName(w.citizenId)}
                            </span>
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 6px' }}>{w.reason}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(w.createdAt).toLocaleDateString('de-DE')}</span>
                            {currentRole !== 'police' && (
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                                onClick={() => handleArchiveWarrant(w.id)}
                              >
                                Aufheben
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
              {/* Cases List */}
              {!selectedCaseId && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Ermittlungsarchiv (Js-Akten)</h1>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Suche und Bearbeitung behördlicher Ermittlungsverfahren</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCaseModal(true)}>
                      Akte anlegen
                    </button>
                  </div>

                  <div className="search-container" style={{ position: 'relative', marginBottom: '24px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '40px' }} 
                      placeholder="Suche nach Aktenzeichen, Titel oder Bearbeiter..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                  </div>

                  {filteredCases.length === 0 ? (
                    <div className="panel-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                      Keine Akten gefunden.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {filteredCases.map(c => (
                        <div key={c.id} className="panel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s', marginBottom: 0 }} onClick={() => setSelectedCaseId(c.id)}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>{c.caseNumber}</span>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0 0' }}>{c.title}</h4>
                              </div>
                              <span className={`badge badge-urgency-${c.urgency}`}>{c.urgency}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px' }}>
                              {c.description}
                            </p>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ersteller: {c.creatorName}</span>
                            <span className={`badge badge-status-${c.status}`}>{c.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Case details */}
              {selectedCaseId && (() => {
                const c = cases.find(x => x.id === selectedCaseId);
                if (!c) return null;

                return (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedCaseId(null)}>
                        ← Zurück zur Liste
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-color)' }}>{c.caseNumber}</span>
                          <span className={`badge badge-urgency-${c.urgency}`}>{c.urgency}</span>
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginTop: '4px' }}>{c.title}</h1>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <select 
                          className="form-select" 
                          style={{ width: '200px' }} 
                          value={c.status} 
                          onChange={(e) => handleUpdateCaseStatus(c.id, e.target.value as any)}
                        >
                          <option value="ERMITTLUNG">ERMITTLUNG</option>
                          <option value="ANKLAGE">ANKLAGE ERHOBEN</option>
                          <option value="ARCHIV">ARCHIVIEREN</option>
                        </select>
                        <button className="btn btn-primary" onClick={() => setShowDocModal(true)}>
                          Neues Dokument (Beschluss/Urteil)
                        </button>
                      </div>
                    </div>

                    {/* Case Content Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                      
                      {/* Left Sidebar: Suspects, Metadata */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Verfahrensdaten</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Erstellt am:</span>
                              <span style={{ fontWeight: 600 }}>{new Date(c.createdAt).toLocaleDateString('de-DE')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Letztes Update:</span>
                              <span style={{ fontWeight: 600 }}>{new Date(c.updatedAt).toLocaleDateString('de-DE')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Dienststelle:</span>
                              <span style={{ fontWeight: 600 }}>{c.creatorName} ({c.creatorRole.toUpperCase()})</span>
                            </div>
                          </div>
                        </div>

                        {/* Suspects in case */}
                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Beschuldigte & Vorwürfe</h4>
                          {c.suspects.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Keine Verdächtigen eingetragen.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {c.suspects.map(s => (
                                <div key={s.citizenId} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span 
                                      style={{ fontWeight: 700, color: 'var(--accent-color)', cursor: 'pointer' }}
                                      onClick={() => { setSelectedCitizenId(s.citizenId); setActiveTab('citizens'); }}
                                    >
                                      {getCitizenFullName(s.citizenId)}
                                    </span>
                                    {isCitizenWanted(s.citizenId) && (
                                      <span className="badge badge-urgency-KRITISCH" style={{ fontSize: '0.6rem' }}>GESUCHT</span>
                                    )}
                                  </div>
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                    Bußgeld: <strong>{s.fine.toLocaleString()} EUR</strong> | Haft: <strong>{s.jailTime} Min.</strong>
                                  </p>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {s.charges.map(chId => (
                                      <span key={chId} className="badge" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                                        {laws.find(l => l.id === chId)?.title || chId}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Main Panel: Documents, Sachverhalt, Evidence, Notes */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Sachverhalt */}
                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Sachverhalt / Anzeige</h4>
                          <p style={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}>{c.description}</p>
                        </div>

                        {/* Dokumente (Google Docs Ersatz) */}
                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Dokumente (Urteile / Beschlüsse)</h4>
                          {c.documents.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Keine richterlichen Beschlüsse oder Urteilsschriften erfasst.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              {c.documents.map(doc => (
                                <div key={doc.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '20px', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
                                  
                                  {/* Stempel */}
                                  <div className={`justiz-stamp ${doc.signedBy ? 'signed' : ''}`} style={{ fontSize: '0.8rem', top: '15px', right: '15px' }}>
                                    {doc.signedBy ? 'Rechtskräftig' : 'Entwurf'}
                                  </div>

                                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>{doc.type}</span>
                                  <h5 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 10px' }}>{doc.title}</h5>
                                  <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', marginBottom: '16px' }}>{doc.content}</p>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      {doc.signedBy ? `Gezeichnet von Richter/in ${doc.signedBy} am ${new Date(doc.signedAt || '').toLocaleDateString('de-DE')}` : 'Wartet auf richterliche Unterschrift'}
                                    </span>
                                    
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      {!doc.signedBy && currentRole === 'judge' && (
                                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleSignDocument(doc.id)}>
                                          Richterlich Signieren
                                        </button>
                                      )}
                                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => triggerPrintDoc(doc)}>
                                        🖨️ PDF drucken
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Evidence */}
                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h4 className="panel-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Asservatenkammer & Beweismittel</h4>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setShowEvidenceModal(true)}>Beweis hinzufügen</button>
                          </div>
                          
                          {c.evidences.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Keine Asservaten eingetragen.</div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                              {c.evidences.map(ev => (
                                <div key={ev.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
                                  {ev.imageUrl ? (
                                    <img src={ev.imageUrl} alt={ev.title} style={{ width: '100%', height: '110px', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                                  ) : (
                                    <div style={{ width: '100%', height: '110px', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>📷 Kein Foto</div>
                                  )}
                                  <div style={{ padding: '10px' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: 0 }}>{ev.title}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 6px' }}>{ev.description}</p>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(ev.createdAt).toLocaleDateString('de-DE')}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Chronologischer Verlauf */}
                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Aktivitäten & Protokoll</h4>
                          <div className="activity-feed" style={{ marginBottom: '20px' }}>
                            {c.notes.map(note => (
                              <div key={note.id} className="activity-item">
                                <div className="activity-indicator blue"></div>
                                <div className="activity-content">
                                  <span className="activity-text" style={{ fontSize: '0.88rem' }}>
                                    <strong>{note.authorName}:</strong> {note.content}
                                  </span>
                                  <span className="activity-time">{new Date(note.createdAt).toLocaleString('de-DE')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <form onSubmit={(e) => handleAddCaseNote(e, c.id)}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input type="text" name="noteText" placeholder="Neuen Ermittlungsschritt / Notiz protokollieren..." className="form-input" required />
                              <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>Hinzufügen</button>
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
              {/* Citizens List */}
              {!selectedCitizenId && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Personenkartei</h1>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Zentrales Personenregister und Vorstrafenverzeichnis</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCitizenModal(true)}>
                      Bürger registrieren
                    </button>
                  </div>

                  <div className="search-container" style={{ position: 'relative', marginBottom: '24px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '40px' }} 
                      placeholder="Suche nach Vorname, Nachname oder Telefonnummer..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                  </div>

                  {filteredCitizens.length === 0 ? (
                    <div className="panel-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                      Keine Bürgereinträge gefunden.
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Nachname, Vorname</th>
                            <th>Geburtsdatum</th>
                            <th>Geschlecht</th>
                            <th>Telefon</th>
                            <th>Fahndungs-Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCitizens.map(cit => (
                            <tr key={cit.id} onClick={() => setSelectedCitizenId(cit.id)}>
                              <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cit.lastName}, {cit.firstName}</td>
                              <td>{cit.birthDate}</td>
                              <td>{cit.gender}</td>
                              <td>{cit.phoneNumber || 'Nicht erfasst'}</td>
                              <td>
                                {isCitizenWanted(cit.id) ? (
                                  <span className="badge badge-urgency-KRITISCH">AKTIVER HAFTBEFEHL</span>
                                ) : (
                                  <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }}>Keine Ausschreibung</span>
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

              {/* Citizen Details */}
              {selectedCitizenId && (() => {
                const cit = citizens.find(x => x.id === selectedCitizenId);
                if (!cit) return null;

                const personalCases = cases.filter(c => c.suspects.some(s => s.citizenId === cit.id));
                const activeWarrs = warrants.filter(w => w.citizenId === cit.id && w.status === 'AKTIV');

                return (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setSelectedCitizenId(null)}>
                        ← Zurück zur Kartei
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                      <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Bürgerakte</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>ID: {cit.id}</p>
                      </div>
                      {activeWarrs.length > 0 && (
                        <span className="badge badge-urgency-KRITISCH" style={{ fontSize: '1rem', padding: '8px 16px' }}>
                          ⚠️ Gesuchte Person
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                      
                      {/* Left: Avatar, Details & Lizenzen */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 0 }}>
                          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--accent-light)', border: '2px solid var(--accent-color)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '14px' }}>
                            {cit.firstName.charAt(0)}{cit.lastName.charAt(0)}
                          </div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{cit.firstName} {cit.lastName}</h3>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Geboren: {cit.birthDate} ({cit.gender})</span>
                        </div>

                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Persönliche Angaben</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Telefon:</span>
                              <span style={{ fontWeight: 600 }}>{cit.phoneNumber || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Erfasst am:</span>
                              <span style={{ fontWeight: 600 }}>{new Date(cit.createdAt).toLocaleDateString('de-DE')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Erlaubnisse / Lizenzen</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.9rem' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Fahrerlaubnis:</span>
                                <span style={{ fontWeight: 700, color: cit.driverLicense === 'AKTIV' ? 'var(--color-success)' : 'var(--color-danger)' }}>{cit.driverLicense}</span>
                              </div>
                              {currentRole !== 'police' && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem', flexGrow: 1 }} onClick={() => handleUpdateLicenses(cit.id, 'driver', 'AKTIV')}>Erteilen</button>
                                  <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '0.75rem', flexGrow: 1 }} onClick={() => handleUpdateLicenses(cit.id, 'driver', 'GESPERRT')}>Entziehen</button>
                                </div>
                              )}
                            </div>
                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Waffenschein:</span>
                                <span style={{ fontWeight: 700, color: cit.weaponLicense === 'AKTIV' ? 'var(--color-success)' : 'var(--color-danger)' }}>{cit.weaponLicense}</span>
                              </div>
                              {currentRole !== 'police' && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem', flexGrow: 1 }} onClick={() => handleUpdateLicenses(cit.id, 'weapon', 'AKTIV')}>Erteilen</button>
                                  <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '0.75rem', flexGrow: 1 }} onClick={() => handleUpdateLicenses(cit.id, 'weapon', 'ENTZOGEN')}>Entziehen</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Notes, Case History */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Warrants Alert */}
                        {activeWarrs.length > 0 && (
                          <div className="panel-card" style={{ borderLeft: '4px solid var(--color-danger)', backgroundColor: 'var(--color-danger-bg)', marginBottom: 0 }}>
                            <h4 style={{ color: 'var(--color-danger)', fontWeight: 700, marginBottom: '10px' }}>⚠️ Dringender Haftbefehl liegt vor</h4>
                            {activeWarrs.map(w => (
                              <div key={w.id} style={{ fontSize: '0.9rem' }}>
                                <p style={{ fontWeight: 'bold' }}>Grund der Ausschreibung:</p>
                                <p style={{ marginTop: '2px' }}>{w.reason}</p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ausgestellt von {w.creatorName} am {new Date(w.createdAt).toLocaleDateString('de-DE')}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Vorstrafenverzeichnis */}
                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Vorstrafenregister & Akten</h4>
                          {personalCases.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Keine Vorstrafeneinträge verzeichnet.</div>
                          ) : (
                            <div className="table-container">
                              <table className="data-table">
                                <thead>
                                  <tr>
                                    <th>Az.</th>
                                    <th>Titel</th>
                                    <th>Urteil / Strafe</th>
                                    <th>Verfahrensstand</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {personalCases.map(c => {
                                    const susp = c.suspects.find(s => s.citizenId === cit.id);
                                    return (
                                      <tr key={c.id} onClick={() => { setSelectedCaseId(c.id); setActiveTab('cases'); }}>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{c.caseNumber}</td>
                                        <td>{c.title}</td>
                                        <td>
                                          {susp ? `${susp.fine.toLocaleString()} EUR / ${susp.jailTime} Min. Haft` : 'K.A.'}
                                        </td>
                                        <td><span className={`badge badge-status-${c.status}`}>{c.status}</span></td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Justiznotizen */}
                        <div className="panel-card" style={{ marginBottom: 0 }}>
                          <h4 className="panel-card-title">Justizinterne Aktennotizen</h4>
                          <form onSubmit={(e) => handleUpdateCitizenNotes(e, cit.id)}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                              <textarea 
                                name="citNotes" 
                                className="form-textarea" 
                                defaultValue={cit.notes || ''} 
                                placeholder="Hinterlege hier auffällige Tathintergründe, Mittäterverbindungen oder Fluchthinweise..." 
                                style={{ minHeight: '140px' }}
                              />
                              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '10px' }}>
                                Notizen speichern
                              </button>
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
            <div>
              <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Strafgesetzbuch (Gesetzeskatalog)</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Übersicht der Paragraphen, Regelsätze und Bußgelder für Ermittlungsverfahren</p>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
                <div style={{ flexGrow: 1, position: 'relative' }} className="search-container">
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '40px' }} 
                    placeholder="Paragraph oder Titel suchen..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                </div>

                <select 
                  className="form-select" 
                  style={{ width: '220px' }} 
                  value={lawCategoryFilter} 
                  onChange={(e) => setLawCategoryFilter(e.target.value)}
                >
                  <option value="ALL">Alle Gesetzbücher</option>
                  {lawCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Categorized Laws */}
              {lawCategories.filter(cat => lawCategoryFilter === 'ALL' || cat === lawCategoryFilter).map(category => {
                const categoryLaws = filteredLaws.filter(l => l.category === category);
                if (categoryLaws.length === 0) return null;

                return (
                  <div key={category} style={{ marginBottom: '36px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-light)', paddingBottom: '6px', marginBottom: '16px' }}>
                      {category}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                      {categoryLaws.map(law => (
                        <div key={law.id} className="panel-card" style={{ padding: '20px', marginBottom: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.95rem' }}>{law.title}</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                            <span className="badge" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>{law.fine.toLocaleString()} EUR</span>
                            {law.jail > 0 && (
                              <span className="badge" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>{law.jail} Min. Haft</span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{law.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* --- MODAL: CREATE CASE --- */}
      {showCaseModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Ermittlungsakte eröffnen</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setShowCaseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCase}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Titel des Ermittlungsverfahrens</label>
                  <input type="text" placeholder="z.B. Ermittlung wegen bewaffnetem Einbruchs am Hauptplatz" className="form-input" value={newCaseTitle} onChange={(e) => setNewCaseTitle(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Dringlichkeit</label>
                    <select className="form-select" value={newCaseUrgency} onChange={(e) => setNewCaseUrgency(e.target.value as any)}>
                      <option value="NIEDRIG">Niedrig</option>
                      <option value="MITTEL">Mittel</option>
                      <option value="HOCH">Hoch</option>
                      <option value="KRITISCH">Kritisch</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zuständiger Bearbeiter</label>
                    <input type="text" className="form-input" value={currentOfficerName} disabled />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sachverhalt / Ermittlungsbericht</label>
                  <textarea placeholder="Ausführlicher Bericht des Tathergangs, Belastende Indizien..." className="form-textarea" value={newCaseDesc} onChange={(e) => setNewCaseDesc(e.target.value)} required />
                </div>

                {/* Add suspect */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '10px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Verdächtige Person hinzufügen</label>
                  <input 
                    type="text" 
                    placeholder="Suche nach Name..." 
                    className="form-input" 
                    value={suspectSearchQuery}
                    onChange={(e) => setSuspectSearchQuery(e.target.value)}
                  />
                  {suspectSearchQuery.trim() !== '' && (
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '4px', maxHeight: '100px', overflowY: 'auto', marginTop: '4px', backgroundColor: 'var(--bg-secondary)' }}>
                      {citizens.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(suspectSearchQuery.toLowerCase())).map(c => (
                        <div key={c.id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--bg-primary)' }} onClick={() => handleAddSuspectToForm(c.id)}>
                          {c.lastName}, {c.firstName} (Geb: {c.birthDate})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Configured suspects listed */}
                  {caseSuspects.length > 0 && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <span className="form-label">Eingetragene Beschuldigte:</span>
                      {caseSuspects.map(s => {
                        const citProfile = citizens.find(c => c.id === s.citizenId);
                        return (
                          <div key={s.citizenId} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <strong style={{ color: 'var(--accent-color)' }}>{citProfile ? `${citProfile.firstName} ${citProfile.lastName}` : 'Unbekannt'}</strong>
                              <button type="button" className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => handleRemoveSuspectFromForm(s.citizenId)}>Entfernen</button>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', marginBottom: '10px' }}>
                              <input type="checkbox" checked={s.pleadedGuilty} onChange={() => handleToggleGuiltyInForm(s.citizenId)} />
                              Beschuldigte/r zeigt sich geständig
                            </label>

                            <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Straftatbestände (StGB) vorwerfen:</span>
                            <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                              {laws.map(l => (
                                <label key={l.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', padding: '4px', cursor: 'pointer' }}>
                                  <input type="checkbox" checked={s.charges.includes(l.id)} onChange={() => handleToggleChargeInForm(s.citizenId, l.id)} />
                                  <div>
                                    <p style={{ fontWeight: 'bold' }}>{l.title}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.fine} EUR | {l.jail} Min. Haft</p>
                                  </div>
                                </label>
                              ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              <span>Geldstrafe: {s.fine.toLocaleString()} EUR</span>
                              <span>Haftzeit: {s.jailTime} Min.</span>
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

      {/* --- MODAL: CREATE CITIZEN --- */}
      {showCitizenModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Bürgerakte anlegen</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setShowCitizenModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCitizen}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Vorname</label>
                    <input type="text" placeholder="z.B. James" className="form-input" value={newCitFirst} onChange={(e) => setNewCitFirst(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nachname</label>
                    <input type="text" placeholder="z.B. Carter" className="form-input" value={newCitLast} onChange={(e) => setNewCitLast(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  <input type="text" placeholder="z.B. 555-4389" className="form-input" value={newCitPhone} onChange={(e) => setNewCitPhone(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Justiznotiz / Hintergrundbemerkung</label>
                  <textarea placeholder="Erste Notizen über Person..." className="form-textarea" value={newCitNotes} onChange={(e) => setNewCitNotes(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCitizenModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary">Registrieren</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE WARRANT --- */}
      {showWarrantModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-danger)' }}>Haftbefehl / Fahndung ausschreiben</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setShowWarrantModal(false)}>✕</button>
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
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '4px', maxHeight: '100px', overflowY: 'auto', marginTop: '4px', backgroundColor: 'var(--bg-secondary)' }}>
                      {citizens.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(warrantSearchQuery.toLowerCase())).map(c => (
                        <div key={c.id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--bg-primary)', backgroundColor: newWarrantCitId === c.id ? 'var(--accent-light)' : 'transparent' }} onClick={() => { setNewWarrantCitId(c.id); setWarrantSearchQuery(`${c.firstName} ${c.lastName}`); }}>
                          {c.lastName}, {c.firstName} (Geb: {c.birthDate})
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Ausschreibende Dienststelle / Beamter</label>
                  <input type="text" className="form-input" value={currentOfficerName} disabled />
                </div>

                <div className="form-group">
                  <label className="form-label">Fahndungsbegründung / Strafvorwurf</label>
                  <textarea placeholder="Bitte begründe den dringenden Haftbefehl ausführlich..." className="form-textarea" value={newWarrantReason} onChange={(e) => setNewWarrantReason(e.target.value)} required />
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
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Beweismittel sicherstellen</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setShowEvidenceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddEvidence}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Bezeichnung / Gegenstand</label>
                  <input type="text" placeholder="z.B. Projektilhülse 9mm" className="form-input" value={newEvidenceTitle} onChange={(e) => setNewEvidenceTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Foto-Link (URL, optional)</label>
                  <input type="url" placeholder="https://..." className="form-input" value={newEvidenceImg} onChange={(e) => setNewEvidenceImg(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label">Fundortbericht / Zustandsbeschreibung</label>
                  <textarea placeholder="Sichergestellt am Tatort, linke Ecke. Fingerabdrücke genommen..." className="form-textarea" value={newEvidenceDesc} onChange={(e) => setNewEvidenceDesc(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEvidenceModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary">Beweis einbuchen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE DOCUMENT --- */}
      {showDocModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Richterlichen Beschluss / Urkundenschrift entwerfen</h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setShowDocModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddDocument}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Dokumenten-Typ</label>
                    <select className="form-select" value={newDocType} onChange={(e) => setNewDocType(e.target.value as any)}>
                      <option value="BESCHLUSS">BESCHLUSS</option>
                      <option value="URTEIL">URTEILSSCHRIFT</option>
                      <option value="PROTOKOLL">PROTOKOLL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Titel / Betreff</label>
                    <input type="text" placeholder="z.B. Durchsuchungsbeschluss gem. § 102 StPO" className="form-input" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dokumententext (formelles Amtsdeutsch)</label>
                  <textarea 
                    placeholder="z.B.: In dem Ermittlungsverfahren gegen... wird angeordnet... Begründung:..." 
                    className="form-textarea" 
                    value={newDocContent} 
                    onChange={(e) => setNewDocContent(e.target.value)} 
                    style={{ minHeight: '220px' }}
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Abbrechen</button>
                <button type="submit" className="btn btn-primary">Entwurf speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
