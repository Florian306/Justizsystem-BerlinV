import type { Law } from '../types';

export const INITIAL_LAWS: Law[] = [
  // Gewaltstraftaten
  {
    id: 'stgb_223',
    title: '§ 223 StGB - Körperverletzung',
    category: 'Gewaltstraftaten',
    fine: 2500,
    jail: 15,
    description: 'Wer eine andere Person körperlich misshandelt oder an der Gesundheit schädigt.'
  },
  {
    id: 'stgb_224',
    title: '§ 224 StGB - Gefährliche Körperverletzung',
    category: 'Gewaltstraftaten',
    fine: 7500,
    jail: 30,
    description: 'Körperverletzung mittels einer Waffe, eines gefährlichen Werkzeugs oder gemeinschaftlich.'
  },
  {
    id: 'stgb_239',
    title: '§ 239 StGB - Freiheitsberaubung',
    category: 'Gewaltstraftaten',
    fine: 5000,
    jail: 25,
    description: 'Wer einen Menschen einsperrt oder auf andere Weise der Freiheit beraubt.'
  },
  {
    id: 'stgb_240',
    title: '§ 240 StGB - Nötigung',
    category: 'Gewaltstraftaten',
    fine: 2000,
    jail: 10,
    description: 'Wer einen Menschen rechtswidrig mit Gewalt oder durch Drohung zu einer Handlung nötigt.'
  },
  {
    id: 'stgb_212',
    title: '§ 212 StGB - Totschlag',
    category: 'Gewaltstraftaten',
    fine: 30000,
    jail: 90,
    description: 'Wer einen Menschen vorsätzlich tötet, ohne Mörder zu sein.'
  },
  {
    id: 'stgb_211',
    title: '§ 211 StGB - Mord',
    category: 'Gewaltstraftaten',
    fine: 50000,
    jail: 120,
    description: 'Vorsätzliche Tötung aus Mordlust, zur Befriedigung des Geschlechtstriebs, aus Habgier oder Heimtücke.'
  },

  // Eigentumsstraftaten
  {
    id: 'stgb_242',
    title: '§ 242 StGB - Diebstahl',
    category: 'Eigentums- & Vermögensdelikte',
    fine: 1500,
    jail: 10,
    description: 'Wegnahme einer fremden beweglichen Sache in rechtswidriger Zueignungsabsicht.'
  },
  {
    id: 'stgb_243',
    title: '§ 243 StGB - Besonders schwerer Fall des Diebstahls',
    category: 'Eigentums- & Vermögensdelikte',
    fine: 4500,
    jail: 20,
    description: 'Einbruchsdiebstahl, Diebstahl von Waffen oder aus umschlossenen Räumen.'
  },
  {
    id: 'stgb_249',
    title: '§ 249 StGB - Raub',
    category: 'Eigentums- & Vermögensdelikte',
    fine: 8000,
    jail: 35,
    description: 'Diebstahl unter Anwendung oder Androhung von gegenwärtiger Gefahr für Leib oder Leben.'
  },
  {
    id: 'stgb_263',
    title: '§ 263 StGB - Betrug',
    category: 'Eigentums- & Vermögensdelikte',
    fine: 3000,
    jail: 15,
    description: 'Verschaffung eines rechtswidrigen Vermögensvorteils durch Täuschung.'
  },
  {
    id: 'stgb_303',
    title: '§ 303 StGB - Sachbeschädigung',
    category: 'Eigentums- & Vermögensdelikte',
    fine: 1000,
    jail: 5,
    description: 'Wer rechtswidrig eine fremde Sache beschädigt oder zerstört.'
  },

  // Verkehrsdelikte
  {
    id: 'stgb_315c',
    title: '§ 315c StGB - Gefährdung des Straßenverkehrs',
    category: 'Verkehrsdelikte',
    fine: 3000,
    jail: 15,
    description: 'Grobe und rücksichtslose Missachtung der Verkehrsregeln, Gefährdung von Leib und Leben.'
  },
  {
    id: 'stgb_316',
    title: '§ 316 StGB - Trunkenheit im Verkehr',
    category: 'Verkehrsdelikte',
    fine: 2000,
    jail: 10,
    description: 'Führen eines Fahrzeugs im Zustand der Fahruntüchtigkeit durch Alkohol oder Rauschmittel.'
  },
  {
    id: 'stgb_142',
    title: '§ 142 StGB - Unerlaubtes Entfernen vom Unfallort',
    category: 'Verkehrsdelikte',
    fine: 2500,
    jail: 15,
    description: 'Sich als Unfallbeteiligter vom Unfallort entfernen, ohne Feststellungen zu ermöglichen.'
  },
  {
    id: 'stvo_21',
    title: '§ 21 VG - Fahren ohne Fahrerlaubnis',
    category: 'Verkehrsdelikte',
    fine: 1500,
    jail: 0,
    description: 'Führen eines Kraftfahrzeugs ohne die erforderliche Fahrerlaubnis.'
  },

  // Betäubungsmittelgesetz (BtMG)
  {
    id: 'btmg_29_besitz',
    title: '§ 29 BtMG - Illegaler Drogenbesitz',
    category: 'Betäubungsmitteldelikte',
    fine: 2000,
    jail: 10,
    description: 'Unerlaubter Besitz von Betäubungsmitteln.'
  },
  {
    id: 'btmg_29_handel',
    title: '§ 29 BtMG - Unerlaubtes Handeltreiben',
    category: 'Betäubungsmitteldelikte',
    fine: 15000,
    jail: 50,
    description: 'Anbau, Herstellung, Handeltreiben, Ein- oder Ausfuhr von illegalen Betäubungsmitteln.'
  },

  // Waffenrecht & Sonstige Straftaten
  {
    id: 'waffg_52',
    title: '§ 52 WaffG - Unerlaubter Waffenbesitz',
    category: 'Waffendelikte',
    fine: 10000,
    jail: 40,
    description: 'Besitz oder Führen verbotener Waffen oder von Schusswaffen ohne Erlaubnis.'
  },
  {
    id: 'stgb_113',
    title: '§ 113 StGB - Widerstand gegen Vollstreckungsbeamte',
    category: 'Sonstige Delikte',
    fine: 3000,
    jail: 15,
    description: 'Wer Beamten, die zur Vollstreckung von Gesetzen berufen sind, Widerstand leistet.'
  },
  {
    id: 'stgb_115',
    title: '§ 115 StGB - Beamtenbeleidigung & Angriff',
    category: 'Sonstige Delikte',
    fine: 1500,
    jail: 5,
    description: 'Tätlicher Angriff oder ehrverletzende Beleidigung eines Amtsträgers während der Dienstausübung.'
  },
  {
    id: 'stgb_185',
    title: '§ 185 StGB - Beleidigung',
    category: 'Sonstige Delikte',
    fine: 800,
    jail: 0,
    description: 'Kundgebung der Missachtung oder Nichtachtung einer anderen Person.'
  }
];
