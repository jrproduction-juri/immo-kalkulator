/**
 * Tests für Einfamilienhaus (EFH) Berechnungen
 */
import { describe, it, expect } from 'vitest';
import {
  berechneFreeResults,
  getDefaultFormData,
  isProArt,
  FormData,
} from '../client/src/lib/calculations';

describe('EFH – Grundkonfiguration', () => {
  it('isProArt gibt true für efh zurück', () => {
    expect(isProArt('efh')).toBe(true);
  });

  it('getDefaultFormData liefert sinnvolle EFH-Defaults', () => {
    const d = getDefaultFormData('efh');
    expect(d.art).toBe('efh');
    expect(d.kaufpreis).toBe(450000);
    expect(d.wohnflaeche).toBe(140);
    expect(d.kaltmiete).toBe(1400);
    expect(d.hausgeld).toBe(0);       // EFH hat kein Hausgeld
    expect(d.grundstueckFlaeche).toBe(500);
    expect(d.grundsteuer).toBe(80);
    expect(d.versicherung).toBe(60);
  });
});

describe('EFH – Cashflow-Berechnung', () => {
  const baseEFH: FormData = {
    art: 'efh',
    kaufpreis: 400000,
    wohnflaeche: 130,
    baujahr: 1990,
    zustand: 'renoviert',
    kaltmiete: 1500,
    hausgeld: 0,
    ruecklagen: 150,
    nichtUmlagefaehig: 0,
    sonstigeAusgaben: 0,
    eigenkapital: 80000,
    zinssatz: 3.5,
    tilgung: 2.0,
    nettoEinkommen: 4000,
    steuerklasse: '1',
    szenarioVermietung: true,
    szenarioEigennutzung: false,
    szenarioVerkauf24Monate: false,
    szenarioFlipSanieren: false,
    grundstueckFlaeche: 600,
    grundsteuer: 80,
    versicherung: 60,
    verwaltungEFH: 0,
  };

  it('Netto-Cashflow berücksichtigt Grundsteuer und Versicherung', () => {
    const results = berechneFreeResults(baseEFH);
    // Kosten = Kreditrate + Rücklage + Grundsteuer + Versicherung
    // Kreditrate = (400000 - 80000) * (3.5 + 2.0) / 100 / 12 = 320000 * 0.055 / 12 ≈ 1466.67
    // Gesamtkosten = 1466.67 + 150 + 80 + 60 = 1756.67
    // Cashflow = 1500 - 1756.67 ≈ -257
    expect(results.nettoCashflowMonat).toBeLessThan(0); // negativer Cashflow erwartet
    expect(results.nettoCashflowMonat).toBeGreaterThan(-2000); // aber nicht extrem negativ
  });

  it('Hausgeld wird bei EFH nicht in die Kosten eingerechnet', () => {
    const efhMitHausgeld: FormData = { ...baseEFH, hausgeld: 500 };
    const ohneHausgeld = berechneFreeResults(baseEFH);
    const mitHausgeld = berechneFreeResults(efhMitHausgeld);
    // Hausgeld sollte bei EFH ignoriert werden → gleicher Cashflow
    expect(ohneHausgeld.nettoCashflowMonat).toBeCloseTo(mitHausgeld.nettoCashflowMonat, 0);
  });

  it('Bruttomietrendite wird korrekt berechnet', () => {
    const results = berechneFreeResults(baseEFH);
    // BMR = (1500 * 12 / 400000) * 100 = 4.5 %
    expect(results.bruttomietrendite).toBeCloseTo(4.5, 1);
  });
});

describe('EFH – Zielrendite-Analyse', () => {
  it('Maximaler Kaufpreis für Zielrendite wird korrekt berechnet', async () => {
    const { berechneProResults } = await import('../client/src/lib/calculations');
    const efhData: FormData = {
      art: 'efh',
      kaufpreis: 400000,
      wohnflaeche: 130,
      baujahr: 1990,
      zustand: 'renoviert',
      kaltmiete: 1500,
      hausgeld: 0,
      ruecklagen: 150,
      nichtUmlagefaehig: 0,
      sonstigeAusgaben: 0,
      eigenkapital: 80000,
      zinssatz: 3.5,
      tilgung: 2.0,
      nettoEinkommen: 4000,
      steuerklasse: '1',
      szenarioVermietung: true,
      szenarioEigennutzung: false,
      szenarioVerkauf24Monate: false,
      szenarioFlipSanieren: false,
      grundstueckFlaeche: 600,
      grundsteuer: 80,
      versicherung: 60,
      verwaltungEFH: 0,
      zielRendite: 6,
    };
    const proResults = berechneProResults(efhData);
    // Max. Kaufpreis = (1500 * 12) / (6 / 100) = 18000 / 0.06 = 300000
    expect(proResults.zielrenditeAnalyse.maxKaufpreisZielrendite).toBeCloseTo(300000, -2);
    // Abweichung = 400000 - 300000 = 100000 (zu teuer)
    expect(proResults.zielrenditeAnalyse.preisabweichung).toBeCloseTo(100000, -2);
  });
});
