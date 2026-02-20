/**
 * PDF-Export Logik für Free und Pro Version
 * Verwendet jsPDF für clientseitigen Export
 */

import { FormData, FreeResults, ProResults, formatEuro, formatProzent } from './calculations';

// Dynamischer Import von jsPDF
async function getJsPDF() {
  // jsPDF v4 exports default
  const mod = await import('jspdf');
  return mod.jsPDF || (mod as any).default?.jsPDF || (mod as any).default;
}

export async function exportFreePDF(formData: FormData, results: FreeResults): Promise<void> {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 20;

  // Header
  doc.setFillColor(10, 37, 64);
  doc.rect(0, 0, pageW, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Immobilien Investment Kalkulator', margin, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Basis-Analyse (Free Version)', margin, 24);
  doc.text(new Date().toLocaleDateString('de-DE'), pageW - margin, 24, { align: 'right' });

  y = 50;

  // Objekt-Info
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Objekt-Übersicht', margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  const objData = [
    ['Kaufpreis', formatEuro(formData.kaufpreis)],
    ['Wohnfläche', `${formData.wohnflaeche} m²`],
    ['Kaltmiete', `${formatEuro(formData.kaltmiete)} / Monat`],
    ['Baujahr', String(formData.baujahr)],
    ['Zustand', formData.zustand === 'neu' ? 'Neubau' : formData.zustand === 'renoviert' ? 'Renoviert' : 'Renovierungsbedürftig'],
    ['Eigenkapital', formatEuro(formData.eigenkapital)],
    ['Zinssatz', `${formData.zinssatz}% p.a.`],
    ['Tilgung', `${formData.tilgung}% p.a.`],
  ];

  objData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 55, y);
    y += 6;
  });

  y += 5;
  doc.setDrawColor(200, 210, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Kennzahlen
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Kernkennzahlen', margin, y);
  y += 8;

  const kennzahlen = [
    ['Bruttomietrendite', formatProzent(results.bruttomietrendite)],
    ['Nettomietrendite', formatProzent(results.nettomietrendite)],
    ['Netto-Cashflow / Monat', formatEuro(results.nettoCashflowMonat)],
    ['Netto-Cashflow / Jahr', formatEuro(results.nettoCashflowJahr)],
    ['Kaufnebenkosten', formatEuro(results.kaufnebenkosten)],
    ['Gesamtinvestition', formatEuro(results.gesamtinvestition)],
    ['Darlehenssumme', formatEuro(results.darlehenssumme)],
    ['Monatliche Kreditrate', formatEuro(results.monatlicheRate)],
  ];

  kennzahlen.forEach(([label, value]) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    const color = value.includes('-') ? [220, 38, 38] : [5, 150, 105];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(value, margin + 70, y);
    doc.setTextColor(60, 60, 60);
    y += 6;
  });

  y += 5;
  doc.setDrawColor(200, 210, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Empfehlung
  const empfehlungColors: Record<string, [number, number, number]> = {
    sinnvoll: [5, 150, 105],
    pruefen: [217, 119, 6],
    kritisch: [220, 38, 38],
  };
  const empfehlungLabel: Record<string, string> = {
    sinnvoll: '✓ Kauf sinnvoll',
    pruefen: '⚠ Prüfen empfohlen',
    kritisch: '✗ Kritisch bewerten',
  };

  const ec = empfehlungColors[results.empfehlung];
  doc.setFillColor(ec[0], ec[1], ec[2]);
  doc.roundedRect(margin, y, contentW, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(empfehlungLabel[results.empfehlung], margin + 5, y + 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(results.empfehlungText, contentW - 10);
  doc.text(lines[0] || '', margin + 5, y + 15);
  y += 28;

  // Pro-Hinweis
  doc.setFillColor(240, 247, 255);
  doc.roundedRect(margin, y, contentW, 25, 3, 3, 'F');
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Pro-Version freischalten für vollständige Analyse', margin + 5, y + 9);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 100, 140);
  doc.text('Steueroptimierung · 10-Jahres-Projektion · PDF-Export · Email-Generator · Exposé', margin + 5, y + 17);

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.text('Erstellt mit ImmoKalkulator · Alle Angaben ohne Gewähr · Keine Anlageberatung', pageW / 2, 285, { align: 'center' });

  doc.save(`ImmoKalkulator_Basis_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function exportProPDF(formData: FormData, results: ProResults): Promise<void> {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 20;

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 270) addPage();
  };

  // ── Seite 1: Header + Übersicht ──────────────────────────────────────────────
  doc.setFillColor(10, 37, 64);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Immobilien Investment Kalkulator', margin, 17);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Pro-Analyse – Vollständiger Report', margin, 26);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('de-DE'), pageW - margin, 26, { align: 'right' });
  if (formData.standort) {
    doc.text(`Objekt: ${formData.standort}`, margin, 34);
  }

  y = 52;

  // Empfehlung
  const empfehlungColors: Record<string, [number, number, number]> = {
    sinnvoll: [5, 150, 105],
    pruefen: [217, 119, 6],
    kritisch: [220, 38, 38],
  };
  const empfehlungLabel: Record<string, string> = {
    sinnvoll: '✓ Kauf sinnvoll',
    pruefen: '⚠ Prüfen empfohlen',
    kritisch: '✗ Kritisch bewerten',
  };
  const ec = empfehlungColors[results.empfehlung];
  doc.setFillColor(ec[0], ec[1], ec[2]);
  doc.roundedRect(margin, y, contentW, 18, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(empfehlungLabel[results.empfehlung], margin + 5, y + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const empLines = doc.splitTextToSize(results.empfehlungText, contentW - 10);
  doc.text(empLines[0] || '', margin + 5, y + 14);
  y += 26;

  // Kernkennzahlen (2 Spalten)
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Kernkennzahlen', margin, y);
  y += 7;

  const col1 = margin;
  const col2 = margin + contentW / 2 + 5;
  const colW = contentW / 2 - 5;

  const kennzahlenLinks = [
    ['Bruttomietrendite', formatProzent(results.bruttomietrendite)],
    ['Nettomietrendite', formatProzent(results.nettomietrendite)],
    ['Eigenkapitalrendite', formatProzent(results.eigenkapitalrendite)],
    ['Cashflow/Monat (brutto)', formatEuro(results.nettoCashflowMonat)],
    ['Cashflow/Monat (nach Steuer)', formatEuro(results.cashflowNachSteuer)],
  ];
  const kennzahlenRechts = [
    ['Kaufpreis', formatEuro(formData.kaufpreis)],
    ['Kaufnebenkosten', formatEuro(results.kaufnebenkosten)],
    ['Gesamtinvestition', formatEuro(results.gesamtinvestition)],
    ['Darlehenssumme', formatEuro(results.darlehenssumme)],
    ['Monatliche Rate', formatEuro(results.monatlicheRate)],
  ];

  const startY = y;
  kennzahlenLinks.forEach(([label, value]) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(label + ':', col1, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(10, 37, 64);
    doc.text(value, col1 + colW, y, { align: 'right' });
    y += 5.5;
  });

  y = startY;
  kennzahlenRechts.forEach(([label, value]) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(label + ':', col2, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(10, 37, 64);
    doc.text(value, col2 + colW, y, { align: 'right' });
    y += 5.5;
  });

  y = startY + kennzahlenLinks.length * 5.5 + 5;

  // ── Steuer ────────────────────────────────────────────────────────────────────
  checkPageBreak(40);
  doc.setDrawColor(200, 210, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setTextColor(10, 37, 64);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Steueroptimierung', margin, y);
  y += 7;

  const steuerData = [
    ['AfA (jährlich)', formatEuro(results.afaJaehrlich)],
    ['Steuerersparnis / Jahr', formatEuro(results.steuerersparnis)],
    ['Steuerersparnis / Monat', formatEuro(results.steuerersparnis / 12)],
    ['Preis / m²', `${results.preisProQm.toFixed(0)} €`],
    ['Vervielfältiger', `${results.vervielfaeltiger.toFixed(1)}x`],
  ];

  steuerData.forEach(([label, value]) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(10, 37, 64);
    doc.text(value, margin + 80, y);
    y += 5.5;
  });

  // ── Seite 2: Szenarien ────────────────────────────────────────────────────────
  addPage();
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Szenarien-Analyse', margin, y);
  y += 10;

  const szenarien = [
    results.szenarioVermietung,
    results.szenarioFlipSanieren,
    results.szenarioEigennutzung2J,
    results.szenarioSanierungEigennutzung,
    results.szenarioBuyHold10J,
  ].filter(Boolean);

  szenarien.forEach(szenario => {
    if (!szenario) return;
    checkPageBreak(35);

    const bgColor: [number, number, number] = szenario.bewertung === 'positiv' ? [240, 253, 244] : szenario.bewertung === 'neutral' ? [255, 251, 235] : [254, 242, 242];
    const borderColor: [number, number, number] = szenario.bewertung === 'positiv' ? [5, 150, 105] : szenario.bewertung === 'neutral' ? [217, 119, 6] : [220, 38, 38];

    doc.setFillColor(...bgColor);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, y, contentW, 30, 2, 2, 'FD');

    doc.setTextColor(...borderColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(szenario.name, margin + 4, y + 8);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(szenario.beschreibung, margin + 4, y + 15);

    const detailLines = doc.splitTextToSize(szenario.details, contentW - 8);
    doc.text(detailLines[0] || '', margin + 4, y + 22);

    y += 36;
  });

  // ── Seite 3: 10-Jahres-Projektion ─────────────────────────────────────────────
  addPage();
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('10-Jahres-Projektion', margin, y);
  y += 10;

  // Tabellen-Header
  doc.setFillColor(10, 37, 64);
  doc.rect(margin, y, contentW, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const cols = [margin + 2, margin + 22, margin + 58, margin + 94, margin + 130, margin + 155];
  ['Jahr', 'Imm.-Wert', 'Restschuld', 'Eigenkapital', 'Kum. CF', 'Rendite'].forEach((h, i) => {
    doc.text(h, cols[i], y + 5.5);
  });
  y += 8;

  results.projektion10J.forEach((row, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 255 : 255);
    doc.rect(margin, y, contentW, 7, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Jahr ${row.jahr}`, cols[0], y + 5);
    doc.text(formatEuro(row.immobilienwert, true), cols[1], y + 5);
    doc.text(formatEuro(row.restschuld, true), cols[2], y + 5);
    doc.text(formatEuro(row.eigenkapital, true), cols[3], y + 5);
    doc.text(formatEuro(row.kumulierterCashflow, true), cols[4], y + 5);
    doc.setTextColor(row.gesamtrendite >= 0 ? 5 : 220, row.gesamtrendite >= 0 ? 150 : 38, row.gesamtrendite >= 0 ? 105 : 38);
    doc.text(`${row.gesamtrendite}%`, cols[5], y + 5);
    y += 7;
  });

  y += 8;

  // Risiko
  checkPageBreak(60);
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Risiko-Analyse', margin, y);
  y += 8;

  const risikoItems = [
    ['Zinsänderungsrisiko', results.risikoBewertung.zinsaenderung],
    ['Mietausfallrisiko', results.risikoBewertung.mietausfall],
    ['Sanierungsrisiko', results.risikoBewertung.sanierungsrisiko],
    ['Lageentwicklung', results.risikoBewertung.lage],
  ];

  risikoItems.forEach(([label, text]) => {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(label + ':', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(text, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 3;
  });

  // Footer auf allen Seiten
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text(
      `ImmoKalkulator Pro · Alle Angaben ohne Gewähr · Keine Anlageberatung · Seite ${i}/${totalPages}`,
      pageW / 2,
      285,
      { align: 'center' }
    );
  }

  doc.save(`ImmoKalkulator_Pro_${new Date().toISOString().slice(0, 10)}.pdf`);
}
