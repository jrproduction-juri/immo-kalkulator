/**
 * KennzahlenLegende – erklärt alle wichtigen Immobilien-Kennzahlen
 * Kann als ausklappbarer Bereich oder als Tooltip-Quelle genutzt werden.
 */

import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

export interface KennzahlInfo {
  kuerzel: string;
  name: string;
  formel?: string;
  erklaerung: string;
  beispiel?: string;
  bewertung?: string;
}

export const KENNZAHLEN: KennzahlInfo[] = [
  {
    kuerzel: 'BMR',
    name: 'Bruttomietrendite',
    formel: '(Jahreskaltmiete / Kaufpreis inkl. NK) × 100',
    erklaerung: 'Zeigt, wie viel Prozent des eingesetzten Kapitals du jährlich als Kaltmiete zurückbekommst – ohne Abzug von Kosten und Steuern. Schneller erster Vergleichswert.',
    beispiel: 'Kaufpreis 300.000 € + 30.000 € NK, Miete 1.000 €/Mo. → BMR = 3,6 %',
    bewertung: 'Gut: ≥ 5 % · Akzeptabel: 3,5–5 % · Kritisch: < 3,5 %',
  },
  {
    kuerzel: 'NMR',
    name: 'Nettomietrendite',
    formel: '(Jahreskaltmiete − Bewirtschaftungskosten) / Gesamtinvestition × 100',
    erklaerung: 'Realistischere Rendite nach Abzug von Hausgeld, Rücklagen und Verwaltungskosten. Gibt an, was nach laufenden Kosten tatsächlich übrig bleibt.',
    beispiel: 'BMR 4 %, nach Abzug Hausgeld & Rücklagen → NMR ≈ 2,8 %',
    bewertung: 'Gut: ≥ 3 % · Akzeptabel: 2–3 % · Kritisch: < 2 %',
  },
  {
    kuerzel: 'CF',
    name: 'Netto-Cashflow',
    formel: 'Kaltmiete − Kreditrate − Hausgeld − Rücklagen − sonstige Kosten',
    erklaerung: 'Der monatliche Überschuss (oder Fehlbetrag) nach allen laufenden Ausgaben. Positiver Cashflow bedeutet: die Immobilie trägt sich selbst.',
    beispiel: 'Miete 900 €, Rate 750 €, HG 120 €, Rückl. 50 € → CF = −20 €/Mo.',
    bewertung: 'Positiv: Immobilie selbsttragend · Leicht negativ: Wertsteigerungswette · Stark negativ: Risiko',
  },
  {
    kuerzel: 'EKR',
    name: 'Eigenkapitalrendite',
    formel: '(Jahres-CF + Tilgung) / eingesetztes Eigenkapital × 100',
    erklaerung: 'Zeigt, wie effizient dein eingesetztes Eigenkapital arbeitet – unter Berücksichtigung des Leverage-Effekts durch Fremdfinanzierung.',
    beispiel: 'EK 60.000 €, CF + Tilgung 3.600 €/J. → EKR = 6 %',
    bewertung: 'Gut: ≥ 6 % · Akzeptabel: 3–6 % · Kritisch: < 3 %',
  },
  {
    kuerzel: 'AfA',
    name: 'Absetzung für Abnutzung (AfA)',
    formel: 'Gebäudeanteil × AfA-Satz (2 % für Altbau, 3 % für Neubau)',
    erklaerung: 'Steuerlicher Abschreibungsbetrag für den Gebäudeanteil. Reduziert dein zu versteuerndes Einkommen und damit die Steuerlast.',
    beispiel: 'Kaufpreis 300.000 €, Gebäudeanteil 80 % → AfA = 4.800 €/J. (2 %)',
    bewertung: 'Je höher der Grenzsteuersatz, desto wertvoller die AfA',
  },
  {
    kuerzel: 'SE',
    name: 'Steuerersparnis',
    formel: 'AfA × persönlicher Grenzsteuersatz',
    erklaerung: 'Jährliche Steuerersparnis durch AfA und negative Einkünfte aus Vermietung. Verbessert den effektiven Cashflow nach Steuer.',
    beispiel: 'AfA 4.800 €, Steuersatz 42 % → Steuerersparnis = 2.016 €/J.',
    bewertung: 'Höherer Steuersatz = mehr Vorteil durch Abschreibung',
  },
  {
    kuerzel: 'VV',
    name: 'Vervielfältiger (Kaufpreisfaktor)',
    formel: 'Kaufpreis / Jahreskaltmiete',
    erklaerung: 'Gibt an, wie viele Jahreskaltmieten du für die Immobilie bezahlst. Je niedriger, desto günstiger das Objekt im Verhältnis zur Miete.',
    beispiel: 'Kaufpreis 300.000 €, Jahresmiete 12.000 € → VV = 25x',
    bewertung: 'Gut: ≤ 20x · Akzeptabel: 20–25x · Teuer: > 25x',
  },
  {
    kuerzel: 'P/m²',
    name: 'Preis pro Quadratmeter',
    formel: 'Kaufpreis / Wohnfläche in m²',
    erklaerung: 'Vergleichswert für die Lage und Qualität des Objekts. Hilft beim Vergleich mit dem lokalen Marktpreis.',
    beispiel: 'Kaufpreis 300.000 €, 75 m² → 4.000 €/m²',
    bewertung: 'Vergleich mit Marktdaten der Region notwendig',
  },
  {
    kuerzel: 'NK',
    name: 'Kaufnebenkosten',
    formel: 'Grunderwerbsteuer (3,5–6,5 %) + Notar (1,5 %) + Grundbuch (0,5 %) + ggf. Makler (3,57 %)',
    erklaerung: 'Einmalige Kosten beim Kauf, die zusätzlich zum Kaufpreis anfallen. Typisch: 7–12 % des Kaufpreises je nach Bundesland.',
    beispiel: 'Kaufpreis 300.000 €, NK 10 % → 30.000 € Nebenkosten',
    bewertung: 'Immer in die Gesamtinvestition einrechnen',
  },
  {
    kuerzel: 'GI',
    name: 'Gesamtinvestition',
    formel: 'Kaufpreis + Kaufnebenkosten',
    erklaerung: 'Das tatsächlich einzusetzende Gesamtkapital für den Kauf. Basis für alle Renditeberechnungen.',
    beispiel: 'Kaufpreis 300.000 € + NK 30.000 € → GI = 330.000 €',
    bewertung: 'Eigenkapital sollte mindestens die NK decken',
  },
];

/** Inline Info-Button mit Tooltip für einzelne Kennzahl */
export function KennzahlInfoButton({ kuerzel }: { kuerzel: string }) {
  const info = KENNZAHLEN.find(k => k.kuerzel === kuerzel);
  if (!info) return null;

  const tooltipText = [
    info.name,
    info.formel ? `Formel: ${info.formel}` : '',
    info.erklaerung,
    info.beispiel ? `Beispiel: ${info.beispiel}` : '',
    info.bewertung ? `Bewertung: ${info.bewertung}` : '',
  ].filter(Boolean).join(' | ');

  return <InfoTooltip text={tooltipText} preferSide="top" />;
}

/** Ausklappbare Legende mit allen Kennzahlen */
export function KennzahlenLegende() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-foreground">Kennzahlen-Legende</span>
          <span className="text-xs text-muted-foreground">— Was bedeuten die Werte?</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
        }
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          {KENNZAHLEN.map((k) => (
            <div key={k.kuerzel} className="px-4 py-3 hover:bg-secondary/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-bold">{k.kuerzel}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{k.name}</p>
                  {k.formel && (
                    <p className="text-xs text-muted-foreground font-mono bg-secondary/50 px-1.5 py-0.5 rounded mt-0.5 mb-1 inline-block">
                      {k.formel}
                    </p>
                  )}
                  <p className="text-xs text-foreground/70 leading-relaxed">{k.erklaerung}</p>
                  {k.beispiel && (
                    <p className="text-xs text-muted-foreground italic mt-1">{k.beispiel}</p>
                  )}
                  {k.bewertung && (
                    <p className="text-xs text-blue-600 font-medium mt-1">{k.bewertung}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
