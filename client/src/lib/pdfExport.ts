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
  doc.text('ImmoRenditeTool', margin, 16);
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
  doc.text('Erstellt mit ImmoRenditeTool · Alle Angaben ohne Gewähr · Keine Anlageberatung', pageW / 2, 285, { align: 'center' });

  doc.save(`ImmoRenditeTool_Basis_${new Date().toISOString().slice(0, 10)}.pdf`);
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
  doc.text('ImmoRenditeTool', margin, 17);
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
      `ImmoRenditeTool Pro · Alle Angaben ohne Gewähr · Keine Anlageberatung · Seite ${i}/${totalPages}`,
      pageW / 2,
      285,
      { align: 'center' }
    );
  }

  doc.save(`ImmoRenditeTool_Pro_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Exposé-PDF: Professionelles Investitions-Exposé als eigenständiges PDF
 */
export async function exportExposePDF(formData: FormData, results: ProResults): Promise<void> {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  const zustandLabel: Record<string, string> = {
    neu: 'Neubau / Erstbezug',
    renoviert: 'Renoviert / Gepflegt',
    renovierungsbeduerftig: 'Renovierungsbedürftig',
  };

  const highlights = formData.highlights
    ? formData.highlights.split(',').map((h: string) => h.trim()).filter(Boolean)
    : ['Gute Lage', 'Solide Bausubstanz', 'Investitionspotenzial'];

  // ── Deckblatt-Header ──────────────────────────────────────────────────────
  // Dunkler Hintergrund
  doc.setFillColor(10, 37, 64);
  doc.rect(0, 0, pageW, 70, 'F');

  // Akzentlinie
  doc.setFillColor(21, 101, 192);
  doc.rect(0, 70, pageW, 3, 'F');

  // Titel
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('INVESTITIONS-EXPOSÉ', margin, 20);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`Immobilie ${formData.wohnflaeche} m²`, margin, 35);

  if (formData.standort) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 210, 255);
    doc.text(formData.standort, margin, 46);
  }

  // Kaufpreis rechts oben
  doc.setTextColor(180, 210, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Kaufpreis', pageW - margin, 22, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(formatEuro(formData.kaufpreis), pageW - margin, 33, { align: 'right' });

  // Datum
  doc.setTextColor(180, 210, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Stand: ${new Date().toLocaleDateString('de-DE')}`, pageW - margin, 44, { align: 'right' });

  y = 85;

  // ── Eckdaten-Kacheln ─────────────────────────────────────────────────────
  const kacheln = [
    { label: 'Wohnfläche', value: `${formData.wohnflaeche} m²` },
    { label: 'Kaltmiete', value: `${formatEuro(formData.kaltmiete)}/Mo.` },
    { label: 'Bruttomietrendite', value: formatProzent(results.bruttomietrendite) },
    { label: 'Nettomietrendite', value: formatProzent(results.nettomietrendite) },
  ];

  const kachelW = (contentW - 9) / 4;
  kacheln.forEach((k, i) => {
    const kx = margin + i * (kachelW + 3);
    doc.setFillColor(240, 247, 255);
    doc.setDrawColor(200, 220, 245);
    doc.roundedRect(kx, y, kachelW, 18, 2, 2, 'FD');
    doc.setTextColor(100, 130, 180);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(k.label, kx + kachelW / 2, y + 6, { align: 'center' });
    doc.setTextColor(10, 37, 64);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(k.value, kx + kachelW / 2, y + 13, { align: 'center' });
  });

  y += 26;

  // ── Objektbeschreibung ────────────────────────────────────────────────────
  doc.setTextColor(10, 37, 64);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Objektbeschreibung', margin, y);
  y += 6;

  doc.setDrawColor(21, 101, 192);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 40, y);
  doc.setLineWidth(0.2);
  y += 5;

  const beschreibung = `Diese ${formData.wohnflaeche} m² große Immobilie` +
    (formData.standort ? ` in ${formData.standort}` : '') +
    ` aus dem Baujahr ${formData.baujahr} befindet sich in ${(zustandLabel[formData.zustand] || formData.zustand).toLowerCase()} Zustand. ` +
    `Mit einer monatlichen Kaltmiete von ${formatEuro(formData.kaltmiete)} erzielt das Objekt eine Bruttomietrendite von ${formatProzent(results.bruttomietrendite)}.` +
    (results.nettoCashflowMonat >= 0
      ? ` Der monatliche Netto-Cashflow beträgt ${formatEuro(results.nettoCashflowMonat)} und macht das Objekt zu einem attraktiven Kapitalanlage-Investment.`
      : ` Das Objekt bietet langfristiges Wertsteigerungspotenzial bei einer Gesamtinvestition von ${formatEuro(results.gesamtinvestition)}.`);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 70, 90);
  const beschLines = doc.splitTextToSize(beschreibung, contentW);
  doc.text(beschLines, margin, y);
  y += beschLines.length * 5 + 5;

  // ── Highlights ────────────────────────────────────────────────────────────
  if (highlights.length > 0) {
    doc.setTextColor(10, 37, 64);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Highlights', margin, y);
    y += 6;

    doc.setDrawColor(21, 101, 192);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 25, y);
    doc.setLineWidth(0.2);
    y += 5;

    highlights.forEach((h: string) => {
      doc.setFillColor(21, 101, 192);
      doc.circle(margin + 2, y - 1.5, 1.5, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 60, 100);
      doc.text(h, margin + 7, y);
      y += 6;
    });
    y += 2;
  }

  // ── Investitionsdaten (2-spaltig) ─────────────────────────────────────────
  if (y + 50 > 270) { doc.addPage(); y = 20; }

  doc.setTextColor(10, 37, 64);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Investitionsdaten', margin, y);
  y += 6;

  doc.setDrawColor(21, 101, 192);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 40, y);
  doc.setLineWidth(0.2);
  y += 5;

  const investData: [string, string][] = [
    ['Kaufpreis', formatEuro(formData.kaufpreis)],
    ['Kaufnebenkosten (~10,6%)', formatEuro(results.kaufnebenkosten)],
    ['Eigenkapital', formatEuro(formData.eigenkapital)],
    ['Darlehenssumme', formatEuro(results.darlehenssumme)],
    ['Monatliche Kreditrate', formatEuro(results.monatlicheRate)],
    ['Cashflow / Monat', formatEuro(results.nettoCashflowMonat)],
    ['AfA / Jahr', formatEuro(results.afaJaehrlich)],
    ['Steuerersparnis / Jahr', formatEuro(results.steuerersparnis)],
    ['Preis / m²', `${results.preisProQm.toFixed(0)} €`],
    ['Vervielfältiger', `${results.vervielfaeltiger.toFixed(1)}x`],
  ];

  const half = Math.ceil(investData.length / 2);
  const col1x = margin;
  const col2x = margin + contentW / 2 + 5;
  const colWidth = contentW / 2 - 8;
  const startInvY = y;

  investData.slice(0, half).forEach(([label, value], idx) => {
    const ry = startInvY + idx * 6;
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 255 : 255);
    doc.rect(col1x, ry - 3.5, colWidth, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 90, 110);
    doc.text(label + ':', col1x + 1, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(10, 37, 64);
    doc.text(value, col1x + colWidth, ry, { align: 'right' });
  });

  investData.slice(half).forEach(([label, value], idx) => {
    const ry = startInvY + idx * 6;
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 255 : 255);
    doc.rect(col2x, ry - 3.5, colWidth, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 90, 110);
    doc.text(label + ':', col2x + 1, ry);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(10, 37, 64);
    doc.text(value, col2x + colWidth, ry, { align: 'right' });
  });

  y = startInvY + half * 6 + 8;

  // ── Cashflow-Balken (manuell gezeichnet) ──────────────────────────────────
  if (y + 50 > 270) { doc.addPage(); y = 20; }

  doc.setTextColor(10, 37, 64);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Cashflow-Analyse', margin, y);
  y += 6;

  doc.setDrawColor(21, 101, 192);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 40, y);
  doc.setLineWidth(0.2);
  y += 5;

  const barItems = [
    { label: 'Kaltmiete', value: formData.kaltmiete, color: [5, 150, 105] as [number, number, number] },
    { label: 'Kreditrate', value: results.monatlicheRate, color: [21, 101, 192] as [number, number, number] },
    { label: 'Nebenkosten', value: formData.hausgeld + formData.ruecklagen, color: [124, 58, 237] as [number, number, number] },
    { label: 'Cashflow', value: Math.abs(results.nettoCashflowMonat), color: (results.nettoCashflowMonat >= 0 ? [5, 150, 105] : [220, 38, 38]) as [number, number, number] },
  ];

  const maxBarVal = Math.max(...barItems.map(b => b.value));
  const barMaxW = contentW - 50;
  const barH = 7;
  const barGap = 10;

  barItems.forEach(item => {
    const barW = maxBarVal > 0 ? (item.value / maxBarVal) * barMaxW : 0;
    doc.setFillColor(...item.color);
    doc.roundedRect(margin + 40, y, barW, barH, 1, 1, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 70, 90);
    doc.text(item.label, margin, y + barH - 1);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 37, 64);
    doc.text(formatEuro(item.value), margin + 40 + barW + 2, y + barH - 1);
    y += barGap;
  });

  y += 5;

  // ── Rendite-Überblick ─────────────────────────────────────────────────────
  if (y + 40 > 270) { doc.addPage(); y = 20; }

  doc.setTextColor(10, 37, 64);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Rendite-Überblick', margin, y);
  y += 6;

  doc.setDrawColor(21, 101, 192);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 35, y);
  doc.setLineWidth(0.2);
  y += 5;

  const renditeItems = [
    { label: 'Bruttomietrendite', value: results.bruttomietrendite, color: [21, 101, 192] as [number, number, number] },
    { label: 'Nettomietrendite', value: results.nettomietrendite, color: [5, 150, 105] as [number, number, number] },
    { label: 'Eigenkapitalrendite', value: Math.max(0, results.eigenkapitalrendite), color: [124, 58, 237] as [number, number, number] },
  ];

  const maxRendite = Math.max(...renditeItems.map(r => r.value), 1);
  const renditeMaxW = contentW - 60;

  renditeItems.forEach(item => {
    const bw = (item.value / maxRendite) * renditeMaxW;
    doc.setFillColor(...item.color);
    doc.roundedRect(margin + 55, y, bw, barH, 1, 1, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 70, 90);
    doc.text(item.label, margin, y + barH - 1);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 37, 64);
    doc.text(`${item.value.toFixed(2)}%`, margin + 55 + bw + 2, y + barH - 1);
    y += barGap;
  });

  y += 5;

  // ── Empfehlung ────────────────────────────────────────────────────────────
  if (y + 25 > 270) { doc.addPage(); y = 20; }

  const empColors: Record<string, [number, number, number]> = {
    sinnvoll: [5, 150, 105],
    pruefen: [217, 119, 6],
    kritisch: [220, 38, 38],
  };
  const empLabel: Record<string, string> = {
    sinnvoll: '✓ Kauf sinnvoll',
    pruefen: '⚠ Prüfen empfohlen',
    kritisch: '✗ Kritisch bewerten',
  };
  const ec = empColors[results.empfehlung] || [100, 100, 100];
  doc.setFillColor(...ec);
  doc.roundedRect(margin, y, contentW, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(empLabel[results.empfehlung] || results.empfehlung, margin + 5, y + 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const empLines = doc.splitTextToSize(results.empfehlungText, contentW - 10);
  doc.text(empLines[0] || '', margin + 5, y + 15);
  y += 28;

  // ── Footer ────────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Fußzeile
    doc.setFillColor(10, 37, 64);
    doc.rect(0, 285, pageW, 12, 'F');
    doc.setTextColor(180, 200, 230);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `ImmoRenditeTool Exposé · Alle Angaben ohne Gewähr · Keine Anlageberatung · Seite ${i}/${totalPages}`,
      pageW / 2,
      291,
      { align: 'center' }
    );
  }

  const standort = formData.standort ? `_${formData.standort.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
  doc.save(`ImmoRenditeTool_Expose${standort}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
