import * as XLSX from 'xlsx';
import type { FormData, FreeResults, ProResults } from './calculations';

function formatEuro(val: number): string {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function formatProzent(val: number): string {
  return `${val.toFixed(2)} %`;
}

export function exportExcel(formData: FormData, freeResults: FreeResults, proResults?: ProResults | null) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Eingaben ────────────────────────────────────────────────────
  const eingabenData = [
    ['ImmoRenditeTool – Eingaben', ''],
    ['', ''],
    ['OBJEKT', ''],
    ['Immobilienart', formData.art ?? 'etw'],
    ['Kaufpreis', formatEuro(formData.kaufpreis)],
    ['Wohnfläche', `${formData.wohnflaeche} m²`],
    ['Kaltmiete', formatEuro(formData.kaltmiete) + ' / Monat'],
    ['Baujahr', formData.baujahr],
    ['Zustand', formData.zustand],
    ['Hausgeld', formatEuro(formData.hausgeld) + ' / Monat'],
    ['Rücklagen', formatEuro(formData.ruecklagen) + ' / Monat'],
    ['Sonstige Ausgaben', formatEuro(formData.sonstigeAusgaben) + ' / Monat'],
    ['', ''],
    ['FINANZIERUNG', ''],
    ['Eigenkapital', formatEuro(formData.eigenkapital)],
    ['Zinssatz', formatProzent(formData.zinssatz)],
    ['Tilgung', formatProzent(formData.tilgung)],
    ['', ''],
    ['PERSÖNLICH', ''],
    ['Persönlicher Steuersatz', formatProzent(formData.persönlicherSteuersatz)],
    ['Standort', formData.standort || '–'],
    ['Eigennutzung', `${formData.eigennutzungMonate ?? 0} Monate`],
  ];

  const wsEingaben = XLSX.utils.aoa_to_sheet(eingabenData);
  wsEingaben['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsEingaben, 'Eingaben');

  // ── Sheet 2: Free-Ergebnisse ─────────────────────────────────────────────
  const freeData = [
    ['KENNZAHLEN (FREE)', ''],
    ['', ''],
    ['Bruttomietrendite', formatProzent(freeResults.bruttomietrendite)],
    ['Nettomietrendite', formatProzent(freeResults.nettomietrendite)],
    ['Netto-Cashflow / Monat', formatEuro(freeResults.nettoCashflowMonat)],
    ['Netto-Cashflow / Jahr', formatEuro(freeResults.nettoCashflowJahr)],
    ['Gesamtinvestition', formatEuro(freeResults.gesamtinvestition)],
    ['Darlehenssumme', formatEuro(freeResults.darlehenssumme)],
    ['Monatliche Rate', formatEuro(freeResults.monatlicheRate)],
    ['Monatliche Kosten gesamt', formatEuro(freeResults.monatlicheKosten)],
    ['', ''],
    ['EMPFEHLUNG', freeResults.empfehlungText],
    ['Bewertung', freeResults.empfehlung],
  ];

  const wsFree = XLSX.utils.aoa_to_sheet(freeData);
  wsFree['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsFree, 'Ergebnisse');

  // ── Sheet 3: Pro-Kennzahlen (falls vorhanden) ────────────────────────────
  if (proResults) {
    const proData = [
      ['KENNZAHLEN (PRO)', ''],
      ['', ''],
      ['Eigenkapitalrendite', formatProzent(proResults.eigenkapitalrendite)],
      ['Cashflow nach Steuer / Monat', formatEuro(proResults.cashflowNachSteuer)],
      ['Preis / m²', formatEuro(proResults.preisProQm)],
      ['Vervielfältiger', `${proResults.vervielfaeltiger.toFixed(1)}x`],
      ['AfA (jährlich)', formatEuro(proResults.afaJaehrlich)],
      ['Steuerersparnis / Jahr', formatEuro(proResults.steuerersparnis)],
      ['Steuerfreier Verkauf möglich', proResults.steuerfreierVerkaufMoeglich ? 'Ja' : 'Nein'],
      ['', ''],
      ['RISIKO', ''],
      ['Gesamtrisiko', proResults.risikoBewertung.gesamt],
      ['Zinsänderungsrisiko', proResults.risikoBewertung.zinsaenderung],
      ['Mietausfallrisiko', proResults.risikoBewertung.mietausfall],
      ['Sanierungsrisiko', proResults.risikoBewertung.sanierungsrisiko],
      ['Lagerisiko', proResults.risikoBewertung.lage],
    ];

    const wsPro = XLSX.utils.aoa_to_sheet(proData);
    wsPro['!cols'] = [{ wch: 35 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsPro, 'Pro-Analyse');

    // ── Sheet 4: 10-Jahres-Projektion ──────────────────────────────────────
    const projektionHeader = ['Jahr', 'Immobilienwert', 'Restschuld', 'Eigenkapital', 'Kum. Cashflow'];
    const projektionRows = proResults.projektion10J.map(p => [
      `Jahr ${p.jahr}`,
      formatEuro(p.immobilienwert),
      formatEuro(p.restschuld),
      formatEuro(p.eigenkapital),
      formatEuro(p.kumulierterCashflow),
    ]);

    const wsProjektion = XLSX.utils.aoa_to_sheet([projektionHeader, ...projektionRows]);
    wsProjektion['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsProjektion, '10-Jahres-Projektion');
  }

  // Datei herunterladen
  const standort = formData.standort ? `_${formData.standort.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
  const filename = `ImmoRenditeTool${standort}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
