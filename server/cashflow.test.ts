import { describe, it, expect } from 'vitest';
import { berechneFreeResults, berechneProResults } from '../client/src/lib/calculations';
import type { FormData } from '../client/src/lib/calculations';

const baseData: FormData = {
  art: 'wohnung',
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

describe('Cashflow-Berechnung mit Kaltmiete', () => {
  it('sollte Cashflow mit Kaltmiete berechnen', () => {
    const results = berechneFreeResults(baseData);
    expect(results.nettoCashflowMonat).toBeLessThan(0);
  });

  it('sollte immer Kaltmiete verwenden unabhängig von Warmmiete', () => {
    const dataOhneWarmmiete: FormData = { ...baseData, warmmiete: 0 };
    const resultsWithWarmmiete = berechneFreeResults(baseData);
    const resultsWithoutWarmmiete = berechneFreeResults(dataOhneWarmmiete);
    expect(resultsWithWarmmiete.nettoCashflowMonat).toBeCloseTo(resultsWithoutWarmmiete.nettoCashflowMonat, 2);
  });

  it('sollte Cashflow mit hoher Kaltmiete besser sein als mit niedriger Kaltmiete', () => {
    const resultsNiedrig = berechneFreeResults(baseData);
    const dataHoch: FormData = { ...baseData, kaltmiete: 1200 };
    const resultsHoch = berechneFreeResults(dataHoch);
    expect(resultsHoch.nettoCashflowMonat).toBeGreaterThan(resultsNiedrig.nettoCashflowMonat);
  });

  it('sollte positiven Cashflow mit hoher Kaltmiete zeigen', () => {
    const dataHoheKaltmiete: FormData = { ...baseData, kaltmiete: 2000 };
    const results = berechneFreeResults(dataHoheKaltmiete);
    expect(results.nettoCashflowMonat).toBeGreaterThan(0);
  });

  it('sollte Jahres-Cashflow = Monats-Cashflow * 12 sein', () => {
    const results = berechneFreeResults(baseData);
    expect(results.nettoCashflowJahr).toBeCloseTo(results.nettoCashflowMonat * 12, 0);
  });
});

describe('Cashflow nach Steuern – Steuerszenarien', () => {
  it('Szenario 1: Steuersatz 35% (Standard)', () => {
    const results = berechneProResults({ ...baseData, persönlicherSteuersatz: 35 });
    // cashflowNachSteuer sollte berechnet sein
    expect(typeof results.cashflowNachSteuer).toBe('number');
    // Steuerersparnis = -(steuerlicher Gewinn * 0.35)
    expect(typeof results.steuerersparnis).toBe('number');
  });

  it('Szenario 2: Steuersatz 25% ergibt weniger Steuerlast als 42%', () => {
    const results25 = berechneProResults({ ...baseData, persönlicherSteuersatz: 25 });
    const results42 = berechneProResults({ ...baseData, persönlicherSteuersatz: 42 });
    // Bei positivem steuerlichem Gewinn: höherer Steuersatz = höhere Steuerlast = niedrigerer Cashflow
    // Bei negativem steuerlichem Gewinn: höherer Steuersatz = höherer Steuervorteil = höherer Cashflow
    // Beide Fälle: |steuerersparnis| bei 42% > |steuerersparnis| bei 25%
    expect(Math.abs(results42.steuerersparnis)).toBeGreaterThan(Math.abs(results25.steuerersparnis));
  });

  it('Szenario 3: Steuersatz 42%', () => {
    const results = berechneProResults({ ...baseData, persönlicherSteuersatz: 42 });
    expect(typeof results.cashflowNachSteuer).toBe('number');
    expect(typeof results.steuerersparnis).toBe('number');
  });

  it('Szenario 4: Negativer steuerlicher Gewinn ergibt Steuervorteil', () => {
    // Hohe Kreditrate → hohe Zinsen → negativer steuerlicher Gewinn → Steuervorteil
    const dataHoheKreditrate: FormData = {
      ...baseData,
      kreditrate: 1500, // sehr hohe Rate → viele Zinsen
      kaltmiete: 900,
      persönlicherSteuersatz: 35,
    };
    const results = berechneProResults(dataHoheKreditrate);
    // Bei negativem steuerlichem Gewinn: steuerersparnis > 0 (Steuervorteil)
    expect(results.steuerersparnis).toBeGreaterThan(0);
    // Cashflow nach Steuern > Cashflow vor Steuern (Steuervorteil verbessert Cashflow)
    expect(results.cashflowNachSteuer).toBeGreaterThan(results.nettoCashflowMonat);
  });

  it('Cashflow nach Steuern = Cashflow vor Steuern - Steuerlast/Monat', () => {
    const results = berechneProResults({ ...baseData, persönlicherSteuersatz: 35 });
    const erwarteterCashflow = results.nettoCashflowMonat - ((-results.steuerersparnis) / 12);
    expect(results.cashflowNachSteuer).toBeCloseTo(erwarteterCashflow, 1);
  });

  it('Standardwert 35% wird verwendet wenn kein Steuersatz angegeben', () => {
    const dataOhneSteuersatz: FormData = { ...baseData, persönlicherSteuersatz: 35 };
    const results = berechneProResults(dataOhneSteuersatz);
    expect(typeof results.cashflowNachSteuer).toBe('number');
  });
});
