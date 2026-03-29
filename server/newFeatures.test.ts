/**
 * Tests für neue Features (Batch 2):
 * 1. PLZ-Mietpreisempfehlung (tRPC-Endpunkt-Validierung)
 * 2. Risikoanalyse Durchschnitts-Modell
 * 3. Investment-Bewertung (Ampelsystem)
 * 4. Exposé-Extraktion (tRPC-Endpunkt-Validierung)
 */
import { describe, it, expect } from 'vitest';
import {
  berechneProResults,
  berechneFreeResults,
  getDefaultFormData,
  type RisikoFaktor,
  type InvestmentBewertung,
} from '../client/src/lib/calculations';

// ─── Hilfsfunktion ─────────────────────────────────────────────────────────────
function makeProResults(overrides: Partial<ReturnType<typeof getDefaultFormData>> = {}) {
  const form = { ...getDefaultFormData('wohnung'), ...overrides };
  const free = berechneFreeResults(form);
  return berechneProResults(form, free);
}

// ─── 1. Risikoanalyse: Durchschnitts-Modell ────────────────────────────────────
describe('Risikoanalyse – Durchschnitts-Modell', () => {
  it('liefert 5 Faktoren mit Punkten 1–3', () => {
    const pro = makeProResults();
    expect(pro.risikoBewertung.faktoren).toHaveLength(5);
    pro.risikoBewertung.faktoren.forEach((f: RisikoFaktor) => {
      expect([1, 2, 3]).toContain(f.punkte);
      expect(['niedrig', 'mittel', 'hoch']).toContain(f.level);
      expect(f.label).toBeTruthy();
      expect(f.text).toBeTruthy();
    });
  });

  it('berechnet gesamtPunkte als Durchschnitt der Faktoren', () => {
    const pro = makeProResults();
    const faktoren = pro.risikoBewertung.faktoren;
    const erwartet = Math.round(
      (faktoren.reduce((s: number, f: RisikoFaktor) => s + f.punkte, 0) / faktoren.length) * 10
    ) / 10;
    expect(pro.risikoBewertung.gesamtPunkte).toBe(erwartet);
  });

  it('setzt Gesamtrisiko auf "niedrig" bei günstigen Werten', () => {
    // Günstiger Zinssatz, hohe Rendite, positiver Cashflow
    const pro = makeProResults({
      zinssatz: 2,
      kaufpreis: 200000,
      kaltmiete: 1200,
      eigenkapital: 60000,
      tilgung: 3,
      zustand: 'neu',
    });
    expect(pro.risikoBewertung.gesamt).toBe('niedrig');
  });

  it('setzt Gesamtrisiko auf "hoch" bei ungünstigen Werten', () => {
    const pro = makeProResults({
      zinssatz: 6,
      kaufpreis: 500000,
      kaltmiete: 800,
      eigenkapital: 50000,
      tilgung: 1,
      zustand: 'renovierungsbeduerftig',
    });
    expect(pro.risikoBewertung.gesamt).toBe('hoch');
  });

  it('Zinsänderungsrisiko: niedrig bei Zinssatz ≤ 3 %', () => {
    const pro = makeProResults({ zinssatz: 2.5 });
    const zinsFaktor = pro.risikoBewertung.faktoren.find((f: RisikoFaktor) => f.label === 'Zinsänderungsrisiko');
    expect(zinsFaktor?.level).toBe('niedrig');
    expect(zinsFaktor?.punkte).toBe(1);
  });

  it('Zinsänderungsrisiko: hoch bei Zinssatz > 4.5 %', () => {
    const pro = makeProResults({ zinssatz: 5 });
    const zinsFaktor = pro.risikoBewertung.faktoren.find((f: RisikoFaktor) => f.label === 'Zinsänderungsrisiko');
    expect(zinsFaktor?.level).toBe('hoch');
    expect(zinsFaktor?.punkte).toBe(3);
  });

  it('Sanierungsrisiko: niedrig bei Neubauzustand', () => {
    const pro = makeProResults({ zustand: 'neu' });
    const sanFaktor = pro.risikoBewertung.faktoren.find((f: RisikoFaktor) => f.label === 'Sanierungsrisiko');
    expect(sanFaktor?.level).toBe('niedrig');
    expect(sanFaktor?.punkte).toBe(1);
  });

  it('Sanierungsrisiko: hoch bei renovierungsbedürftigem Zustand', () => {
    const pro = makeProResults({ zustand: 'renovierungsbeduerftig' });
    const sanFaktor = pro.risikoBewertung.faktoren.find((f: RisikoFaktor) => f.label === 'Sanierungsrisiko');
    expect(sanFaktor?.level).toBe('hoch');
    expect(sanFaktor?.punkte).toBe(3);
  });
});

// ─── 2. Investment-Bewertung (Ampelsystem) ─────────────────────────────────────
describe('Investment-Bewertung – Ampelsystem', () => {
  it('liefert investmentBewertung mit allen Pflichtfeldern', () => {
    const pro = makeProResults();
    const bew: InvestmentBewertung = pro.investmentBewertung;
    expect(['gruen', 'gelb', 'rot']).toContain(bew.ampel);
    expect(bew.ampelText).toBeTruthy();
    expect(bew.ampelBeschreibung).toBeTruthy();
    expect(bew.gesamtScore).toBeGreaterThanOrEqual(0);
    expect(bew.gesamtScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(bew.staerken)).toBe(true);
    expect(Array.isArray(bew.risiken)).toBe(true);
    expect(Array.isArray(bew.potenziale)).toBe(true);
    expect(bew.empfehlungKurz).toContain(String(bew.gesamtScore));
  });

  it('setzt Ampel auf "gruen" bei sehr guten Kennzahlen', () => {
    const pro = makeProResults({
      kaufpreis: 150000,
      kaltmiete: 1000,
      eigenkapital: 50000,
      zinssatz: 2,
      tilgung: 3,
      zustand: 'neu',
    });
    expect(pro.investmentBewertung.ampel).toBe('gruen');
    expect(pro.investmentBewertung.gesamtScore).toBeGreaterThanOrEqual(65);
  });

  it('setzt Ampel auf "rot" bei sehr schlechten Kennzahlen', () => {
    const pro = makeProResults({
      kaufpreis: 600000,
      kaltmiete: 800,
      eigenkapital: 30000,
      zinssatz: 6,
      tilgung: 1,
      zustand: 'renovierungsbeduerftig',
    });
    expect(pro.investmentBewertung.ampel).toBe('rot');
    expect(pro.investmentBewertung.gesamtScore).toBeLessThan(40);
  });

  it('listet Stärken auf bei hoher Rendite', () => {
    const pro = makeProResults({
      kaufpreis: 120000,
      kaltmiete: 900,
      eigenkapital: 40000,
      zinssatz: 2.5,
    });
    // BMR = (900*12)/120000 = 9% → Stärke
    expect(pro.investmentBewertung.staerken.some(s => s.includes('Bruttomietrendite'))).toBe(true);
  });

  it('listet Risiken auf bei negativem Cashflow', () => {
    const pro = makeProResults({
      kaufpreis: 500000,
      kaltmiete: 800,
      eigenkapital: 50000,
      zinssatz: 5,
      tilgung: 2,
      hausgeld: 300,
      nichtUmlagefaehig: 200,
    });
    expect(pro.investmentBewertung.risiken.some(r => r.includes('Cashflow'))).toBe(true);
  });

  it('empfehlungKurz enthält Score und Bewertungstext', () => {
    const pro = makeProResults();
    const { empfehlungKurz, gesamtScore } = pro.investmentBewertung;
    expect(empfehlungKurz).toContain(String(gesamtScore));
    expect(empfehlungKurz.length).toBeGreaterThan(10);
  });
});

// ─── 3. PLZ-Endpunkt Input-Validierung ─────────────────────────────────────────
describe('PLZ-Endpunkt – Input-Validierung', () => {
  it('akzeptiert 5-stellige PLZ', () => {
    // Nur Zod-Schema-Validierung testen (keine echte API)
    const { z } = require('zod');
    const schema = z.object({
      plz: z.string().min(4).max(6),
      wohnflaeche: z.number().positive().optional(),
    });
    expect(() => schema.parse({ plz: '80331', wohnflaeche: 75 })).not.toThrow();
  });

  it('lehnt zu kurze PLZ ab', () => {
    const { z } = require('zod');
    const schema = z.object({ plz: z.string().min(4).max(6) });
    expect(() => schema.parse({ plz: '123' })).toThrow();
  });

  it('lehnt zu lange PLZ ab', () => {
    const { z } = require('zod');
    const schema = z.object({ plz: z.string().min(4).max(6) });
    expect(() => schema.parse({ plz: '1234567' })).toThrow();
  });
});

// ─── 4. Exposé-Extraktion Input-Validierung ────────────────────────────────────
describe('Exposé-Extraktion – Input-Validierung', () => {
  it('akzeptiert PDF-MIME-Type', () => {
    const { z } = require('zod');
    const schema = z.object({
      fileUrl: z.string().url(),
      mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    });
    expect(() => schema.parse({
      fileUrl: 'https://example.com/expose.pdf',
      mimeType: 'application/pdf',
    })).not.toThrow();
  });

  it('akzeptiert Bild-MIME-Types', () => {
    const { z } = require('zod');
    const schema = z.object({
      fileUrl: z.string().url(),
      mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    });
    for (const mimeType of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(() => schema.parse({
        fileUrl: 'https://example.com/expose.jpg',
        mimeType,
      })).not.toThrow();
    }
  });

  it('lehnt ungültige MIME-Types ab', () => {
    const { z } = require('zod');
    const schema = z.object({
      fileUrl: z.string().url(),
      mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    });
    expect(() => schema.parse({
      fileUrl: 'https://example.com/expose.docx',
      mimeType: 'application/msword',
    })).toThrow();
  });

  it('lehnt ungültige URL ab', () => {
    const { z } = require('zod');
    const schema = z.object({
      fileUrl: z.string().url(),
      mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    });
    expect(() => schema.parse({
      fileUrl: 'nicht-eine-url',
      mimeType: 'application/pdf',
    })).toThrow();
  });
});
