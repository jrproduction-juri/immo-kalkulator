/**
 * Immobilien-Investment-Kalkulator: Berechnungslogik
 * Basierend auf Master Prompt V2
 */

export interface FormData {
  // Objekt
  kaufpreis: number;
  wohnflaeche: number;
  hausgeld: number;
  ruecklagen: number;
  baujahr: number;
  zustand: 'neu' | 'renoviert' | 'renovierungsbeduerftig';
  kaltmiete: number;
  // Finanzierung
  eigenkapital: number;
  zinssatz: number;
  tilgung: number;
  // Persönlich
  nettoEinkommen: number;
  steuerklasse: string;
  sonstigeAusgaben: number;
  // Szenarien
  szenarioVermietung: boolean;
  szenarioFlipSanieren: boolean;
  szenarioEigennutzung2J: boolean;
  szenarioSanierungEigennutzung: boolean;
  // Standort (für Exposé)
  standort?: string;
  highlights?: string;
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
  // Cashflow
  monatlicheEinnahmen: number;
  monatlicheKosten: number;
  nettoCashflowMonat: number;
  nettoCashflowJahr: number;
  // Empfehlung
  empfehlung: 'sinnvoll' | 'kritisch' | 'pruefen';
  empfehlungText: string;
  // Basis-Szenarien
  szenarioVermietung?: SzenarioResult;
  szenarioEigennutzung?: SzenarioResult;
}

export interface ProResults extends FreeResults {
  // Erweiterte Kennzahlen
  eigenkapitalrendite: number;
  preisProQm: number;
  vervielfaeltiger: number;
  // Steuer
  afaJaehrlich: number;
  steuerersparnis: number;
  cashflowNachSteuer: number;
  // Erweiterte Szenarien
  szenarioFlipSanieren?: SzenarioResult;
  szenarioEigennutzung2J?: SzenarioResult;
  szenarioSanierungEigennutzung?: SzenarioResult;
  szenarioBuyHold10J?: SzenarioResult;
  // 10-Jahres-Projektion
  projektion10J: JahresProjektion[];
  // Risiko
  risikoBewertung: RisikoBewertung;
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

export function berechneAfA(kaufpreis: number, baujahr: number): number {
  const alter = new Date().getFullYear() - baujahr;
  // Gebäudeanteil ca. 80% des Kaufpreises
  const gebaeudewert = kaufpreis * 0.8;
  // Neue Gebäude (nach 2023): 3%, ältere: 2%
  const afaSatz = baujahr >= 2023 ? 0.03 : 0.02;
  return gebaeudewert * afaSatz;
}

export function berechneSteuerersparnis(
  afaJaehrlich: number,
  zinsenJaehrlich: number,
  hausgeldJaehrlich: number,
  nettoEinkommen: number,
  steuerklasse: string
): number {
  const grenzsteuersatz = berechneGrenzsteuersatz(nettoEinkommen, steuerklasse);
  const abzugsfaehig = afaJaehrlich + zinsenJaehrlich + hausgeldJaehrlich;
  return abzugsfaehig * grenzsteuersatz;
}

function berechneGrenzsteuersatz(nettoEinkommen: number, steuerklasse: string): number {
  // Vereinfachte Grenzsteuersatz-Berechnung
  const bruttoFaktor = steuerklasse === '1' || steuerklasse === '4' ? 1.35 : 
                       steuerklasse === '3' ? 1.2 : 1.4;
  const bruttoEinkommen = nettoEinkommen * bruttoFaktor;
  
  if (bruttoEinkommen <= 11604) return 0;
  if (bruttoEinkommen <= 17005) return 0.14;
  if (bruttoEinkommen <= 66760) return 0.24;
  if (bruttoEinkommen <= 277825) return 0.42;
  return 0.45;
}

// ─── Freie Berechnungen ────────────────────────────────────────────────────────

export function berechneFreeResults(data: FormData): FreeResults {
  const kaufnebenkosten = berechneKaufnebenkosten(data.kaufpreis);
  const gesamtinvestition = data.kaufpreis + kaufnebenkosten;
  const darlehenssumme = Math.max(0, gesamtinvestition - data.eigenkapital);
  const monatlicheRate = berechneMonatlicheRate(darlehenssumme, data.zinssatz, data.tilgung);

  // Rendite
  const jaehrlicheKaltmiete = data.kaltmiete * 12;
  const bruttomietrendite = (jaehrlicheKaltmiete / data.kaufpreis) * 100;
  const bewirtschaftungskosten = (data.hausgeld + data.ruecklagen) * 12;
  const nettomietrendite = ((jaehrlicheKaltmiete - bewirtschaftungskosten) / gesamtinvestition) * 100;

  // Cashflow
  const monatlicheEinnahmen = data.kaltmiete;
  const monatlicheKosten = monatlicheRate + data.hausgeld + data.ruecklagen + data.sonstigeAusgaben;
  const nettoCashflowMonat = monatlicheEinnahmen - monatlicheKosten;
  const nettoCashflowJahr = nettoCashflowMonat * 12;

  // Empfehlung
  let empfehlung: 'sinnvoll' | 'kritisch' | 'pruefen';
  let empfehlungText: string;

  if (bruttomietrendite >= 5 && nettoCashflowMonat >= 0) {
    empfehlung = 'sinnvoll';
    empfehlungText = `Mit ${bruttomietrendite.toFixed(1)}% Bruttomietrendite und positivem Cashflow ist dieses Investment wirtschaftlich attraktiv.`;
  } else if (bruttomietrendite >= 3.5 || nettoCashflowMonat >= -200) {
    empfehlung = 'pruefen';
    empfehlungText = `Die Rendite von ${bruttomietrendite.toFixed(1)}% liegt im mittleren Bereich. Eine detaillierte Prüfung der Lage und Wertsteigerungspotenziale wird empfohlen.`;
  } else {
    empfehlung = 'kritisch';
    empfehlungText = `Mit ${bruttomietrendite.toFixed(1)}% Bruttomietrendite und negativem Cashflow von ${nettoCashflowMonat.toFixed(0)} €/Monat ist das Investment wirtschaftlich kritisch zu bewerten.`;
  }

  // Basis-Szenarien
  const szenarioVermietung: SzenarioResult = {
    name: 'Kaufen & Vermieten',
    beschreibung: 'Langfristige Vermietung als Buy & Hold',
    cashflowMonat: nettoCashflowMonat,
    rendite: nettomietrendite,
    bewertung: nettoCashflowMonat >= 0 ? 'positiv' : nettoCashflowMonat >= -200 ? 'neutral' : 'negativ',
    details: `Monatlicher Cashflow: ${nettoCashflowMonat.toFixed(0)} € | Nettomietrendite: ${nettomietrendite.toFixed(2)}%`,
    dauer: 'Langfristig (10+ Jahre)',
  };

  const szenarioEigennutzung: SzenarioResult = {
    name: 'Eigennutzung',
    beschreibung: 'Selbst einziehen statt mieten',
    cashflowMonat: -(monatlicheRate + data.sonstigeAusgaben),
    bewertung: monatlicheRate < data.kaltmiete * 1.2 ? 'positiv' : 'neutral',
    details: `Monatliche Belastung: ${(monatlicheRate + data.sonstigeAusgaben).toFixed(0)} € | Vergleichsmiete: ${data.kaltmiete.toFixed(0)} €`,
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
    empfehlung,
    empfehlungText,
    szenarioVermietung: data.szenarioVermietung ? szenarioVermietung : undefined,
    szenarioEigennutzung,
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
  const vervielfaeltiger = data.kaltmiete > 0 ? data.kaufpreis / (data.kaltmiete * 12) : 0;

  // Steuer
  const zinsenJaehrlich = darlehenssumme * (data.zinssatz / 100);
  const afaJaehrlich = berechneAfA(data.kaufpreis, data.baujahr);
  const steuerersparnis = berechneSteuerersparnis(
    afaJaehrlich,
    zinsenJaehrlich,
    (data.hausgeld + data.ruecklagen) * 12,
    data.nettoEinkommen,
    data.steuerklasse
  );
  const cashflowNachSteuer = freeResults.nettoCashflowMonat + steuerersparnis / 12;

  // Szenario: Fix & Flip (Sanieren & Verkaufen)
  const sanierungskosten = data.zustand === 'renovierungsbeduerftig' 
    ? data.wohnflaeche * 800 
    : data.wohnflaeche * 300;
  const wertsteigerungNachSanierung = sanierungskosten * 1.8;
  const verkaufsgewinn = wertsteigerungNachSanierung - sanierungskosten - kaufnebenkosten * 0.5;
  const szenarioFlipSanieren: SzenarioResult = {
    name: 'Fix & Flip',
    beschreibung: 'Kaufen, sanieren & verkaufen',
    gewinnNachSteuer: verkaufsgewinn * 0.7, // nach Spekulationssteuer
    rendite: (verkaufsgewinn / gesamtinvestition) * 100,
    bewertung: verkaufsgewinn > 0 ? 'positiv' : 'negativ',
    details: `Sanierungskosten: ${sanierungskosten.toLocaleString('de-DE')} € | Wertsteigerung: ${wertsteigerungNachSanierung.toLocaleString('de-DE')} € | Gewinn: ${verkaufsgewinn.toLocaleString('de-DE')} €`,
    dauer: '12-24 Monate',
  };

  // Szenario: 2 Jahre Eigennutzung → steuerfrei verkaufen
  const wertsteigerung2J = data.kaufpreis * 0.06; // 3% p.a.
  const steuerfreierGewinn = wertsteigerung2J - kaufnebenkosten;
  const szenarioEigennutzung2J: SzenarioResult = {
    name: '2 Jahre Eigennutzung',
    beschreibung: 'Selbst nutzen & steuerfrei verkaufen',
    gewinnNachSteuer: steuerfreierGewinn,
    rendite: (steuerfreierGewinn / data.eigenkapital) * 100,
    bewertung: steuerfreierGewinn > 0 ? 'positiv' : 'neutral',
    details: `Erwartete Wertsteigerung: ${wertsteigerung2J.toLocaleString('de-DE')} € | Steuerfreier Gewinn: ${steuerfreierGewinn.toLocaleString('de-DE')} €`,
    dauer: '2 Jahre',
  };

  // Szenario: Sanieren + 2 Jahre Eigennutzung
  const szenarioSanierungEigennutzung: SzenarioResult = {
    name: 'Sanieren + Eigennutzung',
    beschreibung: 'Sanieren, 2 Jahre selbst nutzen & steuerfrei verkaufen',
    gewinnNachSteuer: (wertsteigerungNachSanierung + wertsteigerung2J - sanierungskosten - kaufnebenkosten),
    rendite: ((wertsteigerungNachSanierung + wertsteigerung2J - sanierungskosten) / gesamtinvestition) * 100,
    bewertung: 'positiv',
    details: `Sanierung: ${sanierungskosten.toLocaleString('de-DE')} € | Gesamtwertsteigerung: ${(wertsteigerungNachSanierung + wertsteigerung2J).toLocaleString('de-DE')} €`,
    dauer: '2-3 Jahre',
  };

  // Szenario: Buy & Hold 10 Jahre
  const szenarioBuyHold10J: SzenarioResult = {
    name: 'Buy & Hold 10 Jahre',
    beschreibung: 'Kaufen, vermieten & 10 Jahre halten',
    cashflowMonat: cashflowNachSteuer,
    rendite: freeResults.nettomietrendite + 3, // + Wertsteigerung
    gewinnNachSteuer: freeResults.nettoCashflowJahr * 10 + data.kaufpreis * 0.3,
    bewertung: freeResults.nettoCashflowMonat >= -100 ? 'positiv' : 'neutral',
    details: `Kumulierter Cashflow: ${(freeResults.nettoCashflowJahr * 10).toLocaleString('de-DE')} € | Wertsteigerung (3% p.a.): ${(data.kaufpreis * 0.3).toLocaleString('de-DE')} €`,
    dauer: '10 Jahre',
  };

  // 10-Jahres-Projektion
  const projektion10J: JahresProjektion[] = [];
  let restschuld = darlehenssumme;
  let kumulierterCashflow = 0;
  const jahresTilgung = darlehenssumme * (data.tilgung / 100);
  const jahresZins = darlehenssumme * (data.zinssatz / 100);

  for (let j = 1; j <= 10; j++) {
    const immobilienwert = data.kaufpreis * Math.pow(1.03, j);
    restschuld = Math.max(0, restschuld - jahresTilgung);
    kumulierterCashflow += freeResults.nettoCashflowJahr + steuerersparnis;
    const eigenkapitalAktuell = immobilienwert - restschuld;
    const gesamtrendite = ((eigenkapitalAktuell - data.eigenkapital + kumulierterCashflow) / data.eigenkapital) * 100;

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

  return {
    ...freeResults,
    eigenkapitalrendite,
    preisProQm,
    vervielfaeltiger,
    afaJaehrlich,
    steuerersparnis,
    cashflowNachSteuer,
    szenarioFlipSanieren: data.szenarioFlipSanieren ? szenarioFlipSanieren : undefined,
    szenarioEigennutzung2J: data.szenarioEigennutzung2J ? szenarioEigennutzung2J : undefined,
    szenarioSanierungEigennutzung: data.szenarioSanierungEigennutzung ? szenarioSanierungEigennutzung : undefined,
    szenarioBuyHold10J: data.szenarioVermietung ? szenarioBuyHold10J : undefined,
    projektion10J,
    risikoBewertung,
  };
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
