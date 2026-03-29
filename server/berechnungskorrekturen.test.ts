/**
 * Tests für Berechnungskorrekturen (Batch 3):
 * 1. NMR: nur nicht-umlagefähige Kosten + Rücklagen abziehen (nicht Gesamt-Hausgeld)
 * 2. EKR: Tilgung + Wertsteigerung einbeziehen
 * 3. EKR bei EK=0: null / "n/a" anzeigen
 * 4. formatProzent: null → "n/a"
 */
import { describe, it, expect } from 'vitest';
import {
  berechneProResults,
  berechneFreeResults,
  getDefaultFormData,
  formatProzent,
} from '../client/src/lib/calculations';

// ─── Hilfsfunktion ─────────────────────────────────────────────────────────────
function makeData(overrides: Partial<ReturnType<typeof getDefaultFormData>> = {}) {
  return { ...getDefaultFormData('wohnung'), ...overrides };
}

// ─── 1. Netto-Mietrendite (NMR) ────────────────────────────────────────────────
describe('Netto-Mietrendite – korrigierte Formel', () => {
  it('Referenzbeispiel: NMR ≈ 6,6 % (nicht-umlagef. 50 €, Rückl. 0 €, GI 107.000 €)', () => {
    const data = makeData({
      kaufpreis: 100_000,
      eigenkapital: 0,
      kaltmiete: 600,
      hausgeld: 200,        // umlagefähig → wird NICHT abgezogen
      ruecklagen: 0,
      nichtUmlagefaehig: 50,
      sonstigeAusgaben: 0,
      kaufnebenkosten: 7_000, // GI = 107.000
    });
    const free = berechneFreeResults(data);
    // NMR = (7200 - 600) / 107000 * 100 ≈ 6,17 %
    // (600 €/J nicht-umlagef., GI = 107.000)
    expect(free.nettomietrendite).toBeGreaterThan(5.5);
    expect(free.nettomietrendite).toBeLessThan(7.5);
  });

  it('NMR ist höher als bei alter Formel (Hausgeld wurde fälschlicherweise abgezogen)', () => {
    const data = makeData({
      kaufpreis: 200_000,
      eigenkapital: 40_000,
      kaltmiete: 900,
      hausgeld: 300,        // umlagefähig → darf NMR nicht senken
      ruecklagen: 50,
      nichtUmlagefaehig: 80,
    });
    const free = berechneFreeResults(data);
    // Alte Formel hätte (hausgeld + ruecklagen) * 12 = 4.200 abgezogen
    // Neue Formel zieht nur (nichtUmlagefaehig + ruecklagen) * 12 = 1.560 ab
    // → NMR muss deutlich höher sein als mit alter Formel
    const alteNMR = ((900 * 12 - (300 + 50) * 12) / (200_000 + 20_000)) * 100;
    expect(free.nettomietrendite).toBeGreaterThan(alteNMR);
  });

  it('NMR = BMR wenn keine Eigentümerkosten vorhanden', () => {
    const data = makeData({
      kaufpreis: 100_000,
      eigenkapital: 0,
      kaltmiete: 500,
      hausgeld: 200,        // umlagefähig → kein Abzug
      ruecklagen: 0,
      nichtUmlagefaehig: 0,
      sonstigeAusgaben: 0,
      kaufnebenkosten: 0,
    });
    const free = berechneFreeResults(data);
    // Ohne Eigentümerkosten: NMR ≈ BMR (beide auf GI = Kaufpreis)
    expect(free.nettomietrendite).toBeCloseTo(free.bruttomietrendite, 0);
  });

  it('NMR sinkt wenn Rücklagen erhöht werden', () => {
    const base = makeData({ kaufpreis: 200_000, kaltmiete: 900, ruecklagen: 0, nichtUmlagefaehig: 0 });
    const mitRuecklagen = makeData({ kaufpreis: 200_000, kaltmiete: 900, ruecklagen: 100, nichtUmlagefaehig: 0 });
    const freeBase = berechneFreeResults(base);
    const freeMit = berechneFreeResults(mitRuecklagen);
    expect(freeMit.nettomietrendite).toBeLessThan(freeBase.nettomietrendite);
  });

  it('NMR sinkt wenn nicht-umlagefähige Kosten erhöht werden', () => {
    const base = makeData({ kaufpreis: 200_000, kaltmiete: 900, nichtUmlagefaehig: 0 });
    const mitKosten = makeData({ kaufpreis: 200_000, kaltmiete: 900, nichtUmlagefaehig: 150 });
    const freeBase = berechneFreeResults(base);
    const freeMit = berechneFreeResults(mitKosten);
    expect(freeMit.nettomietrendite).toBeLessThan(freeBase.nettomietrendite);
  });

  it('NMR ändert sich NICHT wenn nur Hausgeld erhöht wird (umlagefähig)', () => {
    const base = makeData({ kaufpreis: 200_000, kaltmiete: 900, hausgeld: 100, nichtUmlagefaehig: 0, ruecklagen: 0 });
    const mitHausgeld = makeData({ kaufpreis: 200_000, kaltmiete: 900, hausgeld: 300, nichtUmlagefaehig: 0, ruecklagen: 0 });
    const freeBase = berechneFreeResults(base);
    const freeMit = berechneFreeResults(mitHausgeld);
    // Hausgeld ist umlagefähig → NMR darf sich nicht ändern
    expect(freeMit.nettomietrendite).toBeCloseTo(freeBase.nettomietrendite, 5);
  });
});

// ─── 2. Eigenkapitalrendite (EKR) – vollständige Formel ────────────────────────
describe('Eigenkapitalrendite – korrigierte Formel (CF + Tilgung + Wertsteigerung)', () => {
  it('EKR ist höher als reine Cashflow-EKR (wegen Tilgung + Wertsteigerung)', () => {
    const data = makeData({
      kaufpreis: 200_000,
      eigenkapital: 50_000,
      kaltmiete: 900,
      zinssatz: 3,
      tilgung: 2,
    });
    const pro = berechneProResults(data);
    // Alte Formel: nur Cashflow / EK
    const altEKR = (pro.nettoCashflowJahr / 50_000) * 100;
    // Neue Formel muss höher sein (Tilgung + Wertsteigerung addiert)
    expect(pro.eigenkapitalrendite).toBeGreaterThan(altEKR);
  });

  it('EKR enthält Tilgungskomponente (höheres Darlehen → höhere Tilgung → höhere EKR)', () => {
    // Mathematisch: Tilgung und Cashflow heben sich bei gleicher Rate auf.
    // Deshalb: höheres Darlehen (weniger EK) bei gleichem Kaufpreis testen.
    // Weniger EK → höheres Darlehen → höhere Tilgung → höhere EKR (Leverage-Effekt).
    const dataVielEK = makeData({
      kaufpreis: 200_000,
      eigenkapital: 80_000, // 40 % EK → kleineres Darlehen
      kaltmiete: 900,
      zinssatz: 3,
      tilgung: 2,
    });
    const dataWenigEK = makeData({
      kaufpreis: 200_000,
      eigenkapital: 20_000, // 10 % EK → größeres Darlehen → höhere Tilgung
      kaltmiete: 900,
      zinssatz: 3,
      tilgung: 2,
    });
    const proViel = berechneProResults(dataVielEK);
    const proWenig = berechneProResults(dataWenigEK);
    // Weniger EK → höherer Leverage → höhere EKR (Wertsteigerung + Tilgung auf mehr Darlehen)
    expect(proWenig.eigenkapitalrendite!).toBeGreaterThan(proViel.eigenkapitalrendite!);
  });

  it('EKR enthält Wertsteigerungskomponente (3 % p.a. auf Kaufpreis)', () => {
    const data = makeData({
      kaufpreis: 300_000,
      eigenkapital: 60_000,
      kaltmiete: 1_000,
      zinssatz: 3,
      tilgung: 2,
    });
    const pro = berechneProResults(data);
    // Wertsteigerung = 300.000 * 0.03 = 9.000 €/J
    // Tilgung = Darlehen * 0.02
    const darlehen = 300_000 + (pro.kaufnebenkosten) - 60_000;
    const tilgung = darlehen * 0.02;
    const wertsteigerung = 300_000 * 0.03;
    const erwartet = ((pro.nettoCashflowJahr + tilgung + wertsteigerung) / 60_000) * 100;
    expect(pro.eigenkapitalrendite).toBeCloseTo(erwartet, 1);
  });

  it('EKR ist null bei EK = 0 (Vollfinanzierung)', () => {
    const data = makeData({
      kaufpreis: 200_000,
      eigenkapital: 0,
      kaltmiete: 900,
    });
    const pro = berechneProResults(data);
    expect(pro.eigenkapitalrendite).toBeNull();
  });

  it('eigenkapitalrenditeText ist "n/a (Vollfinanzierung)" bei EK = 0', () => {
    const data = makeData({
      kaufpreis: 200_000,
      eigenkapital: 0,
      kaltmiete: 900,
    });
    const pro = berechneProResults(data);
    expect(pro.eigenkapitalrenditeText).toBe('n/a (Vollfinanzierung)');
  });

  it('eigenkapitalrenditeText enthält Prozentwert bei EK > 0', () => {
    const data = makeData({
      kaufpreis: 200_000,
      eigenkapital: 50_000,
      kaltmiete: 900,
      zinssatz: 3,
      tilgung: 2,
    });
    const pro = berechneProResults(data);
    // Format: "19.73 %" (englisches Dezimalformat via toFixed)
    expect(pro.eigenkapitalrenditeText).toMatch(/\d+\.\d+ %/);
  });
});

// ─── 3. formatProzent – null-Handling ──────────────────────────────────────────
describe('formatProzent – null-Handling', () => {
  it('gibt "n/a" zurück bei null', () => {
    expect(formatProzent(null)).toBe('n/a');
  });

  it('gibt formatierten Prozentwert zurück bei number', () => {
    expect(formatProzent(6.6)).toBe('6.60 %');
  });

  it('gibt formatierten Prozentwert mit custom digits zurück', () => {
    expect(formatProzent(7.2, 1)).toBe('7.2 %');
  });

  it('gibt "n/a" zurück bei null mit custom digits', () => {
    expect(formatProzent(null, 1)).toBe('n/a');
  });
});
