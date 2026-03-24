import { describe, it, expect } from 'vitest';
import { berechneFreeResults } from '../client/src/lib/calculations';
import type { FormData } from '../client/src/lib/calculations';

describe('Cashflow-Berechnung mit Kaltmiete', () => {
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
    nettoEinkommen: 3500,
    steuerklasse: '1',
    szenarioVermietung: true,
    szenarioEigennutzung: false,
    szenarioVerkauf24Monate: false,
    szenarioFlipSanieren: false,
  };

  it('sollte Cashflow mit Kaltmiete berechnen', () => {
    const results = berechneFreeResults(baseData);
    
    // Mit Kaltmiete (900 EUR) sollte der Cashflow berechnet werden
    // Warmmiete wird ignoriert
    // Der Cashflow sollte negativ sein, da Kosten > Kaltmiete
    expect(results.nettoCashflowMonat).toBeLessThan(0);
  });

  it('sollte immer Kaltmiete verwenden unabhängig von Warmmiete', () => {
    const dataOhneWarmmiete: FormData = {
      ...baseData,
      warmmiete: 0,
    };

    const resultsWithWarmmiete = berechneFreeResults(baseData);
    const resultsWithoutWarmmiete = berechneFreeResults(dataOhneWarmmiete);
    
    // Beide sollten den gleichen Cashflow haben, da Warmmiete ignoriert wird
    expect(resultsWithWarmmiete.nettoCashflowMonat).toBeCloseTo(
      resultsWithoutWarmmiete.nettoCashflowMonat,
      2
    );
  });

  it('sollte Cashflow mit hoher Kaltmiete besser sein als mit niedriger Kaltmiete', () => {
    const resultsNiedrig = berechneFreeResults(baseData);
    
    const dataHoch: FormData = {
      ...baseData,
      kaltmiete: 1200, // höhere Kaltmiete
    };
    const resultsHoch = berechneFreeResults(dataHoch);
    
    // Mit höherer Kaltmiete sollte der Cashflow besser sein
    expect(resultsHoch.nettoCashflowMonat).toBeGreaterThan(
      resultsNiedrig.nettoCashflowMonat
    );
  });

  it('sollte positiven Cashflow mit hoher Kaltmiete zeigen', () => {
    const dataHoheKaltmiete: FormData = {
      ...baseData,
      kaltmiete: 2000, // hohe Kaltmiete statt Warmmiete
    };

    const results = berechneFreeResults(dataHoheKaltmiete);
    
    // Mit hoher Kaltmiete (2000 EUR) sollte der Cashflow positiv sein
    expect(results.nettoCashflowMonat).toBeGreaterThan(0);
  });

  it('sollte Jahres-Cashflow = Monats-Cashflow * 12 sein', () => {
    const results = berechneFreeResults(baseData);
    
    // Jahres-Cashflow sollte Monats-Cashflow * 12 sein
    const expectedJaehrlich = results.nettoCashflowMonat * 12;
    expect(results.nettoCashflowJahr).toBeCloseTo(expectedJaehrlich, 0);
  });
});
