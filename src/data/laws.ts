import type { Law } from '../types';

export const INITIAL_LAWS: Law[] = [
  // Gewaltverbrechen
  {
    id: 'stgb_101',
    title: 'Körperverletzung',
    category: 'Gewaltverbrechen',
    fine: 2500,
    jail: 15,
    description: 'Körperliche Misshandlung oder Gesundheitsschädigung einer anderen Person.'
  },
  {
    id: 'stgb_102',
    title: 'Schwere Körperverletzung',
    category: 'Gewaltverbrechen',
    fine: 7500,
    jail: 30,
    description: 'Körperverletzung mit bleibenden Schäden oder unter Verwendung gefährlicher Werkzeuge.'
  },
  {
    id: 'stgb_103',
    title: 'Totschlag',
    category: 'Gewaltverbrechen',
    fine: 25000,
    jail: 90,
    description: 'Vorsätzliche Tötung eines Menschen ohne Mördermerkmale.'
  },
  {
    id: 'stgb_104',
    title: 'Mord',
    category: 'Gewaltverbrechen',
    fine: 50000,
    jail: 120,
    description: 'Tötung eines Menschen aus Heimtücke, Habgier oder anderen niederen Beweggründen.'
  },
  {
    id: 'stgb_105',
    title: 'Geiselnahme',
    category: 'Gewaltverbrechen',
    fine: 15000,
    jail: 60,
    description: 'Entführung oder Gefangennahme einer Person zur Erpressung.'
  },

  // Eigentumsdelikte
  {
    id: 'stgb_201',
    title: 'Diebstahl',
    category: 'Eigentumsdelikte',
    fine: 1500,
    jail: 10,
    description: 'Wegnahme einer fremden beweglichen Sache in rechtswidriger Zueignungsabsicht.'
  },
  {
    id: 'stgb_202',
    title: 'Schwerer Diebstahl (Einbruch)',
    category: 'Eigentumsdelikte',
    fine: 4500,
    jail: 20,
    description: 'Diebstahl unter Überwindung von Hindernissen (Einbrechen, Einsteigen).'
  },
  {
    id: 'stgb_203',
    title: 'Raub',
    category: 'Eigentumsdelikte',
    fine: 6000,
    jail: 25,
    description: 'Diebstahl unter Anwendung oder Androhung von Gewalt gegen Personen.'
  },
  {
    id: 'stgb_204',
    title: 'Fahrzeugdiebstahl',
    category: 'Eigentumsdelikte',
    fine: 2000,
    jail: 15,
    description: 'Unbefugte Inbetriebnahme oder Entwendung eines Kraftfahrzeugs.'
  },

  // Verkehrsdelikte
  {
    id: 'stgb_301',
    title: 'Geschwindigkeitsüberschreitung',
    category: 'Verkehrsdelikte',
    fine: 500,
    jail: 0,
    description: 'Führen eines Fahrzeugs über der zulässigen Höchstgeschwindigkeit.'
  },
  {
    id: 'stgb_302',
    title: 'Fahren ohne Führerschein',
    category: 'Verkehrsdelikte',
    fine: 1500,
    jail: 0,
    description: 'Führen eines Kraftfahrzeugs ohne gültige Fahrerlaubnis.'
  },
  {
    id: 'stgb_303',
    title: 'Fahrerflucht',
    category: 'Verkehrsdelikte',
    fine: 3500,
    jail: 15,
    description: 'Unerlaubtes Entfernen vom Unfallort als Unfallbeteiligter.'
  },
  {
    id: 'stgb_304',
    title: 'Fahren unter Alkoholeinfluss',
    category: 'Verkehrsdelikte',
    fine: 2000,
    jail: 10,
    description: 'Führen eines Fahrzeugs bei Fahruntüchtigkeit durch Alkohol oder Drogen.'
  },

  // Drogendelikte
  {
    id: 'stgb_401',
    title: 'Besitz von Betäubungsmitteln (Eigenbedarf)',
    category: 'Drogendelikte',
    fine: 1000,
    jail: 0,
    description: 'Besitz illegaler Drogen in geringer Menge zum Eigenkonsum.'
  },
  {
    id: 'stgb_402',
    title: 'Drogenbesitz in Großmenge',
    category: 'Drogendelikte',
    fine: 5000,
    jail: 20,
    description: 'Besitz illegaler Drogen jenseits der Eigenbedarfsmenge.'
  },
  {
    id: 'stgb_403',
    title: 'Drogenhandel',
    category: 'Drogendelikte',
    fine: 12000,
    jail: 45,
    description: 'Gewerbsmäßiger Verkauf oder Schmuggel illegaler Betäubungsmittel.'
  },

  // Waffen- & sonstige Delikte
  {
    id: 'stgb_501',
    title: 'Unerlaubter Waffenbesitz',
    category: 'Waffendelikte',
    fine: 8000,
    jail: 30,
    description: 'Besitz einer Schusswaffe ohne gültigen Waffenschein.'
  },
  {
    id: 'stgb_502',
    title: 'Waffengebrauch in der Öffentlichkeit',
    category: 'Waffendelikte',
    fine: 12000,
    jail: 40,
    description: 'Abfeuern einer Waffe in der Öffentlichkeit ohne Notwehr-Grund.'
  },
  {
    id: 'stgb_503',
    title: 'Beamtenbeleidigung',
    category: 'Sonstige Delikte',
    fine: 1000,
    jail: 5,
    description: 'Beleidigung oder Ehrverletzung eines Beamten im Dienst.'
  },
  {
    id: 'stgb_504',
    title: 'Widerstand gegen die Staatsgewalt',
    category: 'Sonstige Delikte',
    fine: 3000,
    jail: 15,
    description: 'Aktiver körperlicher Widerstand gegen rechtmäßige Diensthandlungen von Beamten.'
  }
];
