import { describe, it, expect } from 'vitest';
import { berechneFreeResults } from '../client/src/lib/calculations';
import type { FormData } from '../client/src/lib/calculations';

describe('Cashflow-Berechnung mit Warmmiete', () => {
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

  it('sollte Cashflow mit Warmmiete berechnen wenn vorhanden', () => {
    const results = berechneFreeResults(baseData);
    
    // Mit Warmmiete (1100 EUR) sollte der Cashflow berechnet werden
    // nicht mit Kaltmiete (900 EUR)
    // Der Cashflow sollte negativ sein, da Kosten > Warmmiete
    expect(results.nettoCashflowMonat).toBeLessThan(0);
  });

  it('sollte Fallback auf Kaltmiete verwenden wenn Warmmiete nicht eingegeben', () => {
    const dataOhneWarmmiete: FormData = {
      ...baseData,
      warmmiete: 0,
    };

    const results = berechneFreeResults(dataOhneWarmmiete);
    
    // Mit Kaltmiete (900 EUR) sollte der Cashflow berechnet werden
    // Der Cashflow sollte noch negativer sein als mit Warmmiete
    expect(results.nettoCashflowMonat).toBeLessThan(0);
  });

  it('sollte Warmmiete-Cashflow besser sein als Kaltmiete-Cashflow', () => {
    const resultsWithWarmmiete = berechneFreeResults(baseData);
    
    const dataOhneWarmmiete: FormData = {
      ...baseData,
      warmmiete: 0,
    };
    const resultsWithoutWarmmiete = berechneFreeResults(dataOhneWarmmiete);
    
    // Warmmiete-Cashflow sollte BESSER (hoher) sein als Kaltmiete-Cashflow
    // weil Warmmiete (1100) > Kaltmiete (900)
    expect(resultsWithWarmmiete.nettoCashflowMonat).toBeGreaterThan(
      resultsWithoutWarmmiete.nettoCashflowMonat
    );
  });

  it('sollte positiven Cashflow mit hoher Warmmiete zeigen', () => {
    const dataHoheWarmmiete: FormData = {
      ...baseData,
      warmmiete: 2000,
    };

    const results = berechneFreeResults(dataHoheWarmmiete);
    
    // Mit hoher Warmmiete (2000 EUR) sollte der Cashflow positiv sein
    expect(results.nettoCashflowMonat).toBeGreaterThan(0);
  });

  it('sollte Jahres-Cashflow = Monats-Cashflow * 12 sein', () => {
    const results = berechneFreeResults(baseData);
    
    // Jahres-Cashflow sollte Monats-Cashflow * 12 sein
    const expectedJaehrlich = results.nettoCashflowMonat * 12;
    expect(results.nettoCashflowJahr).toBeCloseTo(expectedJaehrlich, 0);
  });
});
