/**
 * ImmoRenditeTool – Berechnungslogik v2
 * Dynamische Felder je Immobilienart: Wohnung, MFH, Neubau, Gewerbe
 */

// ─── Typen ─────────────────────────────────────────────────────────────────────

export type ImmobilienArt = 'wohnung' | 'mfh' | 'neubau' | 'gewerbe' | 'efh';

export interface FormData {
  // ── Allgemein ──────────────────────────────────────────────────────────────
  art: ImmobilienArt;
  kaufpreis: number;
  wohnflaeche: number;
  baujahr: number;
  zustand: 'neu' | 'renoviert' | 'renovierungsbeduerftig';
  standort?: string;
  highlights?: string;

  // ── Miete / Einnahmen ──────────────────────────────────────────────────────
  kaltmiete: number;            // Wohnung, Neubau: monatliche Kaltmiete
  warmmiete?: number;           // optional: für "Von der Warmmiete bleiben X € übrig"

  // ── Kosten ────────────────────────────────────────────────────────────────
  hausgeld: number;             // monatliches Hausgeld (umlagefähig)
  ruecklagen: number;           // monatliche Instandhaltungsrücklage
  nichtUmlagefaehig: number;    // nicht umlagefähige Kosten pro Monat
  sonstigeAusgaben: number;     // sonstige monatliche Ausgaben

  // ── Finanzierung ──────────────────────────────────────────────────────────
  eigenkapital: number;
  zinssatz: number;             // % p.a.
  tilgung: number;              // % p.a.
  kreditrate?: number;          // optional: direkte Eingabe statt Berechnung

  // ── Persönlich (für Steuerberechnung) ────────────────────────────────────
  /** Persönlicher Grenzsteuersatz in % (Standard: 35) */
  persönlicherSteuersatz: number;

  // ── MFH-spezifisch ────────────────────────────────────────────────────────
  anzahlEinheiten?: number;
  durchschnittsMieteProEinheit?: number;
  leerstandsquote?: number;     // % (z.B. 5 für 5%)

  // ── Neubau-spezifisch ────────────────────────────────────────────────────
  afaSatz?: number;             // % (Standard 3 für Neubau, 2 für Altbau)
  erstvermietung?: boolean;
  kaufnebenkosten?: number;     // optional: manuelle Eingabe
  ruecklagenReduziert?: boolean; // Neubau: geringere Rücklage nötig

  // ── Gewerbe-spezifisch ────────────────────────────────────────────────
  mietvertragslaufzeit?: number; // Jahre
  indexmiete?: boolean;
  tripleNet?: boolean;          // Mieter trägt alle Nebenkosten
  leerstandsquoteGewerbe?: number; // %

  // ── EFH-spezifisch ───────────────────────────────────────────
  grundstueckFlaeche?: number;  // Grundstücksgröße in m²
  grundsteuer?: number;         // monatliche Grundsteuer in €
  versicherung?: number;        // monatliche Gebäudeversicherung in €
  verwaltungEFH?: number;       // monatliche Verwaltungskosten (optional)

  // ── Szenarien ────────────────────────────────────────────────────────────
  szenarioVermietung: boolean;
  szenarioEigennutzung: boolean;
  szenarioVerkauf24Monate: boolean; // steuerfrei nach 24 Monaten Eigennutzung
  szenarioFlipSanieren: boolean;

  // ── Eigennutzung Steuerfreiheit ────────────────────────────────────────────────
  eigennutzungMonate?: number;

  // ── Zielrendite (Pro) ────────────────────────────────────────────────
  /** Ziel-Bruttomietrendite in % (Standard: 6). Nur für Pro-Version. */
  zielRendite?: number;
}

export interface FreeResults {
  // Grundkennzahlen
  kaufnebenkosten: number;
  gesamtinvestition: number;
  darlehenssumme: number;
  monatlicheRate: number;
  // Rendite
  bruttomietrendite: number;
  nettomietrendite: number;
  // Cashflow (neue Formel: Kaltmiete – nicht umlagefähige Kosten – Kreditrate)
  monatlicheEinnahmen: number;
  monatlicheKosten: number;
  nettoCashflowMonat: number;
  nettoCashflowJahr: number;
  // Cashflow-Schätzung (wenn Rücklagen/nicht umlagefähig nicht eingegeben)
  usesEstimate: boolean;
  estimatedEigentuemerkosten: number;
  // Empfehlung
  empfehlung: 'sinnvoll' | 'kritisch' | 'pruefen';
  empfehlungText: string;
  // Basis-Szenarien
  szenarioVermietung?: SzenarioResult;
  szenarioEigennutzung?: SzenarioResult;
}

export interface ZielrenditeAnalyse {
  /** Jahreskaltmiete = Kaltmiete × 12 */
  jahreskaltmiete: number;
  /** Aktuelle Bruttomietrendite = (Jahreskaltmiete / Kaufpreis) × 100 */
  bruttomietrendite: number;
  /** Ziel-Bruttomietrendite in % */
  zielRendite: number;
  /** Maximaler Kaufpreis für Zielrendite = Jahreskaltmiete / (Zielrendite / 100) */
  maxKaufpreisZielrendite: number;
  /** Preisabweichung = Aktueller Kaufpreis – Maximaler Kaufpreis */
  preisabweichung: number;
  /** Bewertung der Abweichung */
  bewertung: 'ueber' | 'unter' | 'gleich';
  /** Automatisch generierter Bewertungstext */
  bewertungstext: string;
}

export interface ProResults extends FreeResults {
  // Eigennutzung Steuerfreiheit
  steuerfreierVerkaufMoeglich: boolean;
  // Erweiterte Kennzahlen
  eigenkapitalrendite: number;
  preisProQm: number;
  vervielfaeltiger: number;
  // MFH: Gesamtmiete nach Leerstand
  mfhGesamtmiete?: number;
  mfhLeerstandsVerlust?: number;
  // Gewerbe: effektive Miete
  gewerbeEffektiveMiete?: number;
  // Steuer
  afaJaehrlich: number;
  steuerersparnis: number;
  cashflowNachSteuer: number;
  // Erweiterte Szenarien
  szenarioFlipSanieren?: SzenarioResult;
  szenarioVerkauf24Monate?: SzenarioResult;
  szenarioBuyHold10J?: SzenarioResult;
  // 10-Jahres-Projektion
  projektion10J: JahresProjektion[];
  // Risiko
  risikoBewertung: RisikoBewertung;
  // Zielrendite-Analyse (Pro)
  zielrenditeAnalyse: ZielrenditeAnalyse;
}

export interface SzenarioResult {
  name: string;
  beschreibung: string;
  cashflowMonat?: number;
  rendite?: number;
  gewinnNachSteuer?: number;
  dauer?: string;
  bewertung: 'positiv' | 'neutral' | 'negativ';
  details: string;
}

export interface JahresProjektion {
  jahr: number;
  immobilienwert: number;
  restschuld: number;
  eigenkapital: number;
  kumulierterCashflow: number;
  gesamtrendite: number;
}

export interface RisikoBewertung {
  gesamt: 'niedrig' | 'mittel' | 'hoch';
  zinsaenderung: string;
  mietausfall: string;
  sanierungsrisiko: string;
  lage: string;
}

// ─── Hilfsfunktionen ───────────────────────────────────────────────────────────

export function berechneKaufnebenkosten(kaufpreis: number): number {
  // Grunderwerbsteuer ~5%, Notar ~1.5%, Makler ~3.57%, Grundbuch ~0.5%
  return kaufpreis * 0.1057;
}

export function berechneMonatlicheRate(
  darlehenssumme: number,
  zinssatz: number,
  tilgung: number
): number {
  const jahresRate = (zinssatz + tilgung) / 100;
  return (darlehenssumme * jahresRate) / 12;
}

export function berechneAfA(kaufpreis: number, baujahr: number, afaSatzOverride?: number): number {
  const gebaeudewert = kaufpreis * 0.8;
  let afaSatz: number;
  if (afaSatzOverride !== undefined && afaSatzOverride > 0) {
    afaSatz = afaSatzOverride / 100;
  } else {
    afaSatz = baujahr >= 2023 ? 0.03 : 0.02;
  }
  return gebaeudewert * afaSatz;
}

export function berechneSteuerersparnis(
  afaJaehrlich: number,
  zinsenJaehrlich: number,
  bewirtschaftungJaehrlich: number,
  steuersatz: number
): number {
  const grenzsteuersatz = steuersatz / 100;
  const abzugsfaehig = afaJaehrlich + zinsenJaehrlich + bewirtschaftungJaehrlich;
  return abzugsfaehig * grenzsteuersatz;
}

/** Berechnet die effektive monatliche Kaltmiete je nach Immobilienart */
function berechneEffektiveKaltmiete(data: FormData): number {
  switch (data.art) {
    case 'mfh': {
      const einheiten = data.anzahlEinheiten ?? 1;
      const mieteProEinheit = data.durchschnittsMieteProEinheit ?? data.kaltmiete;
      const leerstand = (data.leerstandsquote ?? 0) / 100;
      return einheiten * mieteProEinheit * (1 - leerstand);
    }
    case 'gewerbe': {
      const leerstand = (data.leerstandsquoteGewerbe ?? 0) / 100;
      // Triple-Net: Mieter trägt alle NK → Kaltmiete = Nettomiete
      return data.kaltmiete * (1 - leerstand);
    }
    case 'efh':
      // EFH: direkte Kaltmiete (kein Hausgeld, keine WEG-Rücklagen)
      return data.kaltmiete;
    default:
      return data.kaltmiete;
  }
}

/** Berechnet monatliche Kosten je nach Immobilienart
 *  Neue Formel: nicht umlagefähige Kosten + Kreditrate (+ Rüklage wenn nicht Triple-Net)
 */
/**
 * Intelligente Cashflow-Berechnung mit Fallback-Logik
 * 
 * Logik:
 * 1. Wenn Rücklage UND nicht umlagefähige Kosten eingetragen: nutze diese direkt
 * 2. Wenn nicht: schätze aus Hausgeld (50% Eigentümerkosten)
 * 
 * Returns: { kosten, usesEstimate, estimatedEigentuemerkosten }
 */
function berechneMonatlicheKostenMitFallback(
  data: FormData,
  monatlicheRate: number
): { kosten: number; usesEstimate: boolean; estimatedEigentuemerkosten: number } {
  // Triple-Net: Mieter trägt alle Nebenkosten → keine Bewirtschaftungskosten für Vermieter
  const isTripleNet = data.art === 'gewerbe' && data.tripleNet;

  if (isTripleNet) {
    return {
      kosten: monatlicheRate + data.nichtUmlagefaehig + data.sonstigeAusgaben,
      usesEstimate: false,
      estimatedEigentuemerkosten: 0,
    };
  }

  // EFH: Grundsteuer + Versicherung + Verwaltung statt Hausgeld
  if (data.art === 'efh') {
    const grundsteuer = data.grundsteuer ?? 0;
    const versicherung = data.versicherung ?? 0;
    const verwaltung = data.verwaltungEFH ?? 0;
    return {
      kosten: monatlicheRate + data.ruecklagen + grundsteuer + versicherung + verwaltung + data.nichtUmlagefaehig + data.sonstigeAusgaben,
      usesEstimate: false,
      estimatedEigentuemerkosten: 0,
    };
  }

  // Intelligente Fallback-Logik für Wohnungen/MFH/Neubau
  const hasExactRuecklagen = data.ruecklagen && data.ruecklagen > 0;
  const hasExactNichtUmlagefaehig = data.nichtUmlagefaehig && data.nichtUmlagefaehig > 0;

  // Fall 1: Beide Werte vorhanden → nutze diese direkt
  if (hasExactRuecklagen && hasExactNichtUmlagefaehig) {
    return {
      kosten: monatlicheRate + data.nichtUmlagefaehig + data.ruecklagen + data.sonstigeAusgaben,
      usesEstimate: false,
      estimatedEigentuemerkosten: 0,
    };
  }

  // Fall 2: Mindestens einer fehlt → schätze aus Hausgeld (50%)
  const estimatedEigentuemerkosten = (data.hausgeld ?? 0) * 0.5;
  const finalRuecklagen = hasExactRuecklagen ? data.ruecklagen : estimatedEigentuemerkosten;
  const finalNichtUmlagefaehig = hasExactNichtUmlagefaehig ? data.nichtUmlagefaehig : 0;

  return {
    kosten: monatlicheRate + finalNichtUmlagefaehig + finalRuecklagen + data.sonstigeAusgaben,
    usesEstimate: !hasExactRuecklagen || !hasExactNichtUmlagefaehig,
    estimatedEigentuemerkosten: !hasExactRuecklagen || !hasExactNichtUmlagefaehig ? estimatedEigentuemerkosten : 0,
  };
}

// Alte Funktion für Rückwärtskompatibilität
function berechneMonatlicheKosten(
  data: FormData,
  monatlicheRate: number
): number {
  return berechneMonatlicheKostenMitFallback(data, monatlicheRate).kosten;
}

// ─── Freie Berechnungen ────────────────────────────────────────────────────────

export function berechneFreeResults(data: FormData): FreeResults {
  // Kaufnebenkosten (Neubau: ggf. manuell eingegeben)
  const kaufnebenkosten = data.kaufnebenkosten ?? berechneKaufnebenkosten(data.kaufpreis);
  const gesamtinvestition = data.kaufpreis + kaufnebenkosten;
  const darlehenssumme = Math.max(0, gesamtinvestition - data.eigenkapital);

  // Kreditrate: direkte Eingabe oder Berechnung
  const monatlicheRate = data.kreditrate && data.kreditrate > 0
    ? data.kreditrate
    : berechneMonatlicheRate(darlehenssumme, data.zinssatz, data.tilgung);

  // Effektive Kaltmiete (berücksichtigt MFH-Einheiten, Leerstand, etc.)
  const effektiveKaltmiete = berechneEffektiveKaltmiete(data);

  // Rendite
  const jaehrlicheKaltmiete = effektiveKaltmiete * 12;
  const bruttomietrendite = data.kaufpreis > 0 ? (jaehrlicheKaltmiete / data.kaufpreis) * 100 : 0;
  const bewirtschaftungskosten = (data.hausgeld + data.ruecklagen) * 12;
  const nettomietrendite = gesamtinvestition > 0
    ? ((jaehrlicheKaltmiete - bewirtschaftungskosten) / gesamtinvestition) * 100
    : 0;

  // Cashflow: Kaltmiete - Kreditrate - Hausgeld - Ruecklagen - nicht umlagefaehige Kosten
  // Die Kaltmiete ist die tatsaechliche Einnahme vom Mieter (ohne Nebenkosten)
  const monatlicheEinnahmen = effektiveKaltmiete;
  const kostenResult = berechneMonatlicheKostenMitFallback(data, monatlicheRate);
  const monatlicheKosten = kostenResult.kosten;
  const usesEstimate = kostenResult.usesEstimate;
  const estimatedEigentuemerkosten = kostenResult.estimatedEigentuemerkosten;
  const nettoCashflowMonat = monatlicheEinnahmen - monatlicheKosten;
  const nettoCashflowJahr = nettoCashflowMonat * 12;

  // Empfehlung
  let empfehlung: 'sinnvoll' | 'kritisch' | 'pruefen';
  let empfehlungText: string;

  if (bruttomietrendite >= 5 && nettoCashflowMonat >= 0) {
    empfehlung = 'sinnvoll';
    empfehlungText = `Mit ${bruttomietrendite.toFixed(1)} % Bruttomietrendite und positivem Cashflow ist dieses Investment wirtschaftlich attraktiv.`;
  } else if (bruttomietrendite >= 3.5 || nettoCashflowMonat >= -200) {
    empfehlung = 'pruefen';
    empfehlungText = `Die Rendite von ${bruttomietrendite.toFixed(1)} % liegt im mittleren Bereich. Eine detaillierte Prüfung der Lage und Wertsteigerungspotenziale wird empfohlen.`;
  } else {
    empfehlung = 'kritisch';
    empfehlungText = `Mit ${bruttomietrendite.toFixed(1)} % Bruttomietrendite und einem Cashflow von ${nettoCashflowMonat.toFixed(0)} €/Monat ist das Investment wirtschaftlich kritisch zu bewerten.`;
  }

  // Basis-Szenarien
  const szenarioVermietung: SzenarioResult = {
    name: 'Buy & Hold',
    beschreibung: 'Langfristige Vermietung',
    cashflowMonat: nettoCashflowMonat,
    rendite: nettomietrendite,
    bewertung: nettoCashflowMonat >= 0 ? 'positiv' : nettoCashflowMonat >= -200 ? 'neutral' : 'negativ',
    details: `Monatlicher Cashflow: ${nettoCashflowMonat.toFixed(0)} € | Nettomietrendite: ${nettomietrendite.toFixed(2)} %`,
    dauer: 'Langfristig (10+ Jahre)',
  };

  const szenarioEigennutzung: SzenarioResult = {
    name: 'Eigennutzung',
    beschreibung: 'Selbst einziehen statt mieten',
    cashflowMonat: -(monatlicheRate + data.nichtUmlagefaehig + data.sonstigeAusgaben),
    bewertung: monatlicheRate < effektiveKaltmiete * 1.2 ? 'positiv' : 'neutral',
    details: `Monatliche Belastung: ${(monatlicheRate + data.nichtUmlagefaehig).toFixed(0)} € | Vergleichsmiete: ${effektiveKaltmiete.toFixed(0)} €`,
    dauer: 'Unbegrenzt',
  };

  return {
    kaufnebenkosten,
    gesamtinvestition,
    darlehenssumme,
    monatlicheRate,
    bruttomietrendite,
    nettomietrendite,
    monatlicheEinnahmen,
    monatlicheKosten,
    nettoCashflowMonat,
    nettoCashflowJahr,
    usesEstimate,
    estimatedEigentuemerkosten,
    empfehlung,
    empfehlungText,
    szenarioVermietung: data.szenarioVermietung ? szenarioVermietung : undefined,
    szenarioEigennutzung: data.szenarioEigennutzung ? szenarioEigennutzung : undefined,
  };
}

// ─── Pro-Berechnungen ──────────────────────────────────────────────────────────

export function berechneProResults(data: FormData): ProResults {
  const freeResults = berechneFreeResults(data);
  const { kaufnebenkosten, gesamtinvestition, darlehenssumme, monatlicheRate } = freeResults;

  // Erweiterte Kennzahlen
  const eigenkapitalrendite = data.eigenkapital > 0
    ? (freeResults.nettoCashflowJahr / data.eigenkapital) * 100
    : 0;
  const preisProQm = data.wohnflaeche > 0 ? data.kaufpreis / data.wohnflaeche : 0;
  const vervielfaeltiger = freeResults.monatlicheEinnahmen > 0
    ? data.kaufpreis / (freeResults.monatlicheEinnahmen * 12)
    : 0;

  // MFH: Leerstandsverlust
  let mfhGesamtmiete: number | undefined;
  let mfhLeerstandsVerlust: number | undefined;
  if (data.art === 'mfh') {
    const einheiten = data.anzahlEinheiten ?? 1;
    const mieteProEinheit = data.durchschnittsMieteProEinheit ?? data.kaltmiete;
    mfhGesamtmiete = einheiten * mieteProEinheit;
    const leerstand = (data.leerstandsquote ?? 0) / 100;
    mfhLeerstandsVerlust = mfhGesamtmiete * leerstand;
  }

  // Gewerbe: effektive Miete nach Leerstand
  let gewerbeEffektiveMiete: number | undefined;
  if (data.art === 'gewerbe') {
    const leerstand = (data.leerstandsquoteGewerbe ?? 0) / 100;
    gewerbeEffektiveMiete = data.kaltmiete * (1 - leerstand);
  }

  // Steuer
  const zinsenJaehrlich = darlehenssumme * (data.zinssatz / 100);
  const afaJaehrlich = berechneAfA(data.kaufpreis, data.baujahr, data.afaSatz);
  const bewirtschaftungJaehrlich = (data.hausgeld + data.ruecklagen + data.nichtUmlagefaehig + data.sonstigeAusgaben) * 12;
  const steuersatz = data.persönlicherSteuersatz ?? 35;

  // Steuerlicher Gewinn = Kaltmiete - nicht umlagefähige Kosten - Zinsen - AfA - sonstige
  const kaltmieteJaehrlich = freeResults.monatlicheEinnahmen * 12;
  const nichtUmlagefaehigJaehrlich = data.nichtUmlagefaehig * 12;
  const sonstigeJaehrlich = data.sonstigeAusgaben * 12;
  const steuerlicheGewinn = kaltmieteJaehrlich - nichtUmlagefaehigJaehrlich - zinsenJaehrlich - afaJaehrlich - sonstigeJaehrlich;

  // Steuerlast (kann negativ sein = Steuervorteil)
  const steuerlast = steuerlicheGewinn * (steuersatz / 100);

  // Steuerersparnis (positiv wenn Steuervorteil, negativ wenn Steuerlast)
  const steuerersparnis = -steuerlast;

  // Cashflow nach Steuern = Cashflow vor Steuern - Steuerlast pro Monat
  const cashflowNachSteuer = freeResults.nettoCashflowMonat - (steuerlast / 12);

  // Szenario: Fix & Flip
  const sanierungskosten = data.zustand === 'renovierungsbeduerftig'
    ? data.wohnflaeche * 800
    : data.wohnflaeche * 300;
  const wertsteigerungNachSanierung = sanierungskosten * 1.8;
  const verkaufsgewinn = wertsteigerungNachSanierung - sanierungskosten - kaufnebenkosten * 0.5;
  const szenarioFlipSanieren: SzenarioResult = {
    name: 'Fix & Flip',
    beschreibung: 'Kaufen, sanieren & verkaufen',
    gewinnNachSteuer: verkaufsgewinn * 0.7,
    rendite: gesamtinvestition > 0 ? (verkaufsgewinn / gesamtinvestition) * 100 : 0,
    bewertung: verkaufsgewinn > 0 ? 'positiv' : 'negativ',
    details: `Sanierungskosten: ${sanierungskosten.toLocaleString('de-DE')} € | Wertsteigerung: ${wertsteigerungNachSanierung.toLocaleString('de-DE')} € | Gewinn: ${verkaufsgewinn.toLocaleString('de-DE')} €`,
    dauer: '12–24 Monate',
  };

  // Szenario: Verkauf nach 24 Monaten Eigennutzung (steuerfrei bei ETW)
  const wertsteigerung2J = data.kaufpreis * 0.06; // ~3 % p.a.
  const steuerfreierGewinn = wertsteigerung2J - kaufnebenkosten;
  const istEtw = data.art === 'wohnung' || data.art === 'neubau';
  const szenarioVerkauf24Monate: SzenarioResult = {
    name: '24 Monate Eigennutzung → steuerfrei',
    beschreibung: istEtw
      ? 'Selbst nutzen & nach 24 Monaten steuerfrei verkaufen (§ 23 EStG)'
      : 'Nur bei Eigentumswohnungen möglich (§ 23 EStG)',
    gewinnNachSteuer: istEtw ? steuerfreierGewinn : 0,
    rendite: istEtw && data.eigenkapital > 0 ? (steuerfreierGewinn / data.eigenkapital) * 100 : 0,
    bewertung: istEtw && steuerfreierGewinn > 0 ? 'positiv' : 'neutral',
    details: istEtw
      ? `Erwartete Wertsteigerung (3 % p.a.): ${wertsteigerung2J.toLocaleString('de-DE')} € | Steuerfreier Gewinn: ${steuerfreierGewinn.toLocaleString('de-DE')} €`
      : 'Steuerfreier Verkauf nach § 23 EStG gilt nur für selbst genutzte Eigentumswohnungen.',
    dauer: '2 Jahre',
  };

  // Szenario: Buy & Hold 10 Jahre
  const szenarioBuyHold10J: SzenarioResult = {
    name: 'Buy & Hold 10 Jahre',
    beschreibung: 'Kaufen, vermieten & 10 Jahre halten',
    cashflowMonat: cashflowNachSteuer,
    rendite: freeResults.nettomietrendite + 3,
    gewinnNachSteuer: (cashflowNachSteuer * 12 * 10) + data.kaufpreis * 0.3,
    bewertung: cashflowNachSteuer >= -8.33 ? 'positiv' : 'neutral',
    details: `Kumulierter Cashflow (nach Steuern): ${((cashflowNachSteuer * 12 * 10)).toLocaleString('de-DE')} EUR | Steuerersparnis/Jahr: ${steuerersparnis.toLocaleString('de-DE')} EUR | Wertsteigerung (3 % p.a.): ${(data.kaufpreis * 0.3).toLocaleString('de-DE')} EUR`,
    dauer: '10 Jahre',
  };

  // 10-Jahres-Projektion
  const projektion10J: JahresProjektion[] = [];
  let restschuld = darlehenssumme;
  let kumulierterCashflow = 0;
  const jahresTilgung = darlehenssumme * (data.tilgung / 100);
  const cashflowNachSteuerJaehrlich = cashflowNachSteuer * 12;
  for (let j = 1; j <= 10; j++) {
    const immobilienwert = data.kaufpreis * Math.pow(1.03, j);
    restschuld = Math.max(0, restschuld - jahresTilgung);
    kumulierterCashflow += cashflowNachSteuerJaehrlich;
    const eigenkapitalAktuell = immobilienwert - restschuld;
    const gesamtrendite = data.eigenkapital > 0
      ? ((eigenkapitalAktuell - data.eigenkapital + kumulierterCashflow) / data.eigenkapital) * 100
      : 0;

    projektion10J.push({
      jahr: j,
      immobilienwert: Math.round(immobilienwert),
      restschuld: Math.round(restschuld),
      eigenkapital: Math.round(eigenkapitalAktuell),
      kumulierterCashflow: Math.round(kumulierterCashflow),
      gesamtrendite: Math.round(gesamtrendite * 10) / 10,
    });
  }

  // Risikobewertung
  const risikoBewertung: RisikoBewertung = {
    gesamt: freeResults.bruttomietrendite >= 5 && freeResults.nettoCashflowMonat >= 0 ? 'niedrig' :
      freeResults.bruttomietrendite >= 3.5 ? 'mittel' : 'hoch',
    zinsaenderung: data.zinssatz <= 3
      ? 'Niedrig: Aktuell günstiger Zinssatz, Anschlussfinanzierung beobachten'
      : 'Mittel: Zinssatz bereits erhöht, Zinsbindung sichern',
    mietausfall: data.kaltmiete / (data.kaufpreis / 1000) >= 8
      ? 'Niedrig: Gutes Preis-Miete-Verhältnis, hohe Nachfrage wahrscheinlich'
      : 'Mittel: Mietausfallrisiko durch Rücklagen absichern',
    sanierungsrisiko: data.zustand === 'neu' ? 'Niedrig: Neubauzustand' :
      data.zustand === 'renoviert' ? 'Mittel: Regelmäßige Instandhaltung einplanen' :
        'Hoch: Erheblicher Sanierungsbedarf, Kosten detailliert kalkulieren',
    lage: 'Mittel: Lageanalyse anhand lokaler Marktdaten empfohlen',
  };

  // Eigennutzung Steuerfreiheit: mind. 24 Monate = steuerfrei
  const steuerfreierVerkaufMoeglich = (data.eigennutzungMonate ?? 0) >= 24 && istEtw;

  // ── Zielrendite-Analyse ────────────────────────────────────────────────
  const zielRendite = data.zielRendite ?? 6;
  const jahreskaltmiete = data.kaltmiete * 12;
  const bmr = data.kaufpreis > 0 ? (jahreskaltmiete / data.kaufpreis) * 100 : 0;
  const maxKaufpreisZielrendite = zielRendite > 0 ? jahreskaltmiete / (zielRendite / 100) : 0;
  const preisabweichung = data.kaufpreis - maxKaufpreisZielrendite;
  // Toleranz: ±2 % des Kaufpreises gilt als "ungefähr gleich"
  const toleranz = data.kaufpreis * 0.02;
  const bewertung: ZielrenditeAnalyse['bewertung'] =
    Math.abs(preisabweichung) <= toleranz ? 'gleich' :
    preisabweichung > 0 ? 'ueber' : 'unter';
  const bewertungstext =
    bewertung === 'gleich'
      ? 'Der aktuelle Kaufpreis entspricht in etwa dem Preisniveau für die gewünschte Zielrendite.'
      : bewertung === 'ueber'
      ? 'Auf Basis der eingegebenen Daten liegt der aktuelle Kaufpreis über dem Preisniveau, das für die gewünschte Zielrendite erforderlich wäre.'
      : 'Der aktuelle Kaufpreis liegt unter dem Preisniveau, das für die gewünschte Zielrendite erforderlich wäre.';

  const zielrenditeAnalyse: ZielrenditeAnalyse = {
    jahreskaltmiete,
    bruttomietrendite: bmr,
    zielRendite,
    maxKaufpreisZielrendite,
    preisabweichung,
    bewertung,
    bewertungstext,
  };

  return {
    ...freeResults,
    steuerfreierVerkaufMoeglich,
    eigenkapitalrendite,
    preisProQm,
    vervielfaeltiger,
    mfhGesamtmiete,
    mfhLeerstandsVerlust,
    gewerbeEffektiveMiete,
    afaJaehrlich,
    steuerersparnis,
    cashflowNachSteuer,
    szenarioFlipSanieren: data.szenarioFlipSanieren ? szenarioFlipSanieren : undefined,
    szenarioVerkauf24Monate: data.szenarioVerkauf24Monate ? szenarioVerkauf24Monate : undefined,
    szenarioBuyHold10J: data.szenarioVermietung ? szenarioBuyHold10J : undefined,
    projektion10J,
    risikoBewertung,
    zielrenditeAnalyse,
  };
}

// ─── Standard-Formular-Werte je Immobilienart ─────────────────────────────────

export function getDefaultFormData(art: ImmobilienArt = 'wohnung'): FormData {
  const base: FormData = {
    art,
    kaufpreis: 300000,
    wohnflaeche: 75,
    baujahr: 2000,
    zustand: 'renoviert',
    kaltmiete: 900,
    warmmiete: 1100,
    hausgeld: 200,
    ruecklagen: 50,
    nichtUmlagefaehig: 100,
    sonstigeAusgaben: 0,
    eigenkapital: 60000,
    zinssatz: 3.5,
    tilgung: 2.0,
    persönlicherSteuersatz: 35,
    szenarioVermietung: true,
    szenarioEigennutzung: false,
    szenarioVerkauf24Monate: false,
    szenarioFlipSanieren: false,
  };

  switch (art) {
    case 'mfh':
      return {
        ...base,
        kaufpreis: 800000,
        wohnflaeche: 400,
        anzahlEinheiten: 6,
        durchschnittsMieteProEinheit: 700,
        kaltmiete: 700,
        leerstandsquote: 5,
        hausgeld: 0,
        ruecklagen: 400,
        nichtUmlagefaehig: 300,
      };
    case 'neubau':
      return {
        ...base,
        kaufpreis: 450000,
        wohnflaeche: 90,
        baujahr: new Date().getFullYear(),
        zustand: 'neu',
        kaltmiete: 1200,
        warmmiete: 1400,
        afaSatz: 3,
        erstvermietung: true,
        ruecklagen: 20,
        ruecklagenReduziert: true,
        nichtUmlagefaehig: 80,
      };
    case 'gewerbe':
      return {
        ...base,
        kaufpreis: 600000,
        wohnflaeche: 200,
        kaltmiete: 2500,
        warmmiete: undefined,
        mietvertragslaufzeit: 10,
        indexmiete: true,
        tripleNet: false,
        leerstandsquoteGewerbe: 10,
        hausgeld: 0,
        ruecklagen: 200,
        nichtUmlagefaehig: 150,
      };
    case 'efh':
      return {
        ...base,
        kaufpreis: 450000,
        wohnflaeche: 140,
        baujahr: 1990,
        zustand: 'renoviert',
        kaltmiete: 1400,
        warmmiete: undefined,
        hausgeld: 0,          // EFH hat kein Hausgeld
        ruecklagen: 150,      // höhere Rücklagen beim EFH
        nichtUmlagefaehig: 0,
        grundstueckFlaeche: 500,
        grundsteuer: 80,      // ca. 960 €/Jahr = 80 €/Mo
        versicherung: 60,     // ca. 720 €/Jahr = 60 €/Mo
        verwaltungEFH: 0,
      };
    default:
      return base;
  }
}

// ─── Formatierungshilfen ───────────────────────────────────────────────────────

export function formatEuro(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatProzent(value: number, digits = 2): string {
  return `${value.toFixed(digits)} %`;
}

export function formatZahl(value: number): string {
  return new Intl.NumberFormat('de-DE').format(Math.round(value));
}

/** Gibt zurück ob eine Immobilienart Pro-only ist */
export function isProArt(art: ImmobilienArt): boolean {
  return art === 'mfh' || art === 'neubau' || art === 'gewerbe' || art === 'efh';
}
