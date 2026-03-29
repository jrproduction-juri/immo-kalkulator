# ImmoRenditeTool – Vollständige Rechenwege

Dokumentation aller Berechnungen so wie sie aktuell im Code (`client/src/lib/calculations.ts`) implementiert sind.
Zweck: Überprüfung auf Korrektheit und Abweichungen von gängigen Branchenstandards.

---

## 1. Kaufnebenkosten

```
Kaufnebenkosten = Kaufpreis × 10,57 %
```

**Aufschlüsselung (pauschal zusammengefasst):**

| Kostenart              | Anteil (ca.) |
|------------------------|-------------|
| Grunderwerbsteuer      | 5,00 %      |
| Notar                  | 1,50 %      |
| Makler                 | 3,57 %      |
| Grundbuch              | 0,50 %      |
| **Gesamt**             | **10,57 %** |

> **Hinweis:** Der Satz ist ein bundesweiter Pauschalwert. Die Grunderwerbsteuer variiert je Bundesland (3,5 % bis 6,5 %). Maklerkosten fallen nicht immer an. Der Wert kann daher je nach Region und Transaktion abweichen.

---

## 2. Gesamtinvestition & Darlehen

```
Gesamtinvestition = Kaufpreis + Kaufnebenkosten

Darlehenssumme = max(0, Gesamtinvestition − Eigenkapital)
```

> **Hinweis:** Das Eigenkapital wird von der Gesamtinvestition (inkl. Nebenkosten) abgezogen, nicht nur vom Kaufpreis. Das ist korrekt und entspricht der Praxis.

---

## 3. Monatliche Kreditrate

```
Jahresrate = (Zinssatz % + Tilgung %) / 100

Monatliche Rate = (Darlehenssumme × Jahresrate) / 12
```

**Beispiel:** Darlehen 200.000 €, Zinssatz 3,5 %, Tilgung 2 %
```
Jahresrate = (3,5 + 2) / 100 = 0,055
Monatliche Rate = (200.000 × 0,055) / 12 = 916,67 €
```

> **Hinweis:** Dies ist die vereinfachte Annuitätenformel (Konstantrate). Die exakte Annuitätenformel würde leicht abweichen, da sie den Zinseszinseffekt berücksichtigt. Bei typischen Laufzeiten ist die Abweichung gering (< 1 %).
>
> Alternativ kann die Kreditrate auch manuell direkt eingegeben werden – dann wird die Berechnung übersprungen.

---

## 4. Effektive Kaltmiete (je Immobilienart)

Die effektive Kaltmiete berücksichtigt Leerstand und Einheiten:

| Immobilienart | Formel |
|---------------|--------|
| Wohnung / Neubau / EFH | `Kaltmiete` (direkt) |
| MFH | `Anzahl Einheiten × Ø Miete/Einheit × (1 − Leerstandsquote / 100)` |
| Gewerbe | `Kaltmiete × (1 − Leerstandsquote / 100)` |
| Gewerbe Triple-Net | `Kaltmiete × (1 − Leerstandsquote / 100)` (Mieter trägt alle NK) |

---

## 5. Brutto-Mietrendite

```
Jahreskaltmiete = Effektive Kaltmiete × 12

Brutto-Mietrendite (%) = (Jahreskaltmiete / Kaufpreis) × 100
```

**Beispiel:** Kaltmiete 900 €/Mo, Kaufpreis 200.000 €
```
Jahreskaltmiete = 900 × 12 = 10.800 €
Brutto-Mietrendite = (10.800 / 200.000) × 100 = 5,4 %
```

> **⚠️ Möglicher Fehler:** Die Brutto-Mietrendite wird auf den **Kaufpreis** bezogen, nicht auf die Gesamtinvestition (Kaufpreis + Nebenkosten). Der Branchenstandard ist uneinheitlich – manche Quellen verwenden den Kaufpreis, andere die Gesamtinvestition. Bei 10,57 % Nebenkosten ergibt sich ein Unterschied von ca. 0,5–0,8 Prozentpunkten.
>
> **Standard-Definition (gängig):** Brutto-Mietrendite = Jahreskaltmiete / Kaufpreis × 100 ✓ (so implementiert)
>
> **Alternative Definition:** Brutto-Mietrendite = Jahreskaltmiete / Gesamtinvestition × 100 (konservativer)

---

## 6. Netto-Mietrendite

```
Bewirtschaftungskosten/Jahr = (Hausgeld + Rücklagen) × 12

Netto-Mietrendite (%) = ((Jahreskaltmiete − Bewirtschaftungskosten) / Gesamtinvestition) × 100
```

**Beispiel:** Kaltmiete 900 €/Mo, Hausgeld 200 €/Mo, Rücklagen 50 €/Mo, Gesamtinvestition 220.000 €
```
Bewirtschaftungskosten = (200 + 50) × 12 = 3.000 €
Netto-Mietrendite = ((10.800 − 3.000) / 220.000) × 100 = 3,55 %
```

> **⚠️ Möglicher Fehler:** In der Netto-Mietrendite werden nur **Hausgeld + Rücklagen** abgezogen – nicht die nicht-umlagefähigen Kosten, nicht die Kreditrate, nicht die Verwaltung. Das ist eine vereinfachte Berechnung.
>
> **Gängige vollständigere Definition:**
> Netto-Mietrendite = (Jahreskaltmiete − alle nicht-umlagefähigen Kosten − Verwaltung − Instandhaltung) / Gesamtinvestition × 100
>
> Die aktuelle Formel unterschätzt die tatsächlichen Kosten und überschätzt daher die Netto-Rendite.

---

## 7. Monatliche Kosten (für Cashflow)

Die Kosten werden je nach Datenlage unterschiedlich berechnet:

### Fall 1: Rücklagen UND nicht-umlagefähige Kosten sind eingetragen
```
Monatliche Kosten = Kreditrate + nicht-umlagefähige Kosten + Rücklagen + sonstige Ausgaben
```

### Fall 2: Mindestens einer der Werte fehlt (Schätzung)
```
Geschätzte Eigentümerkosten = Hausgeld × 50 %

Monatliche Kosten = Kreditrate + (nicht-umlagefähige Kosten oder 0) + (Rücklagen oder Schätzung) + sonstige Ausgaben
```

### EFH (Einfamilienhaus)
```
Monatliche Kosten = Kreditrate + Rücklagen + Grundsteuer + Gebäudeversicherung + Verwaltung + nicht-umlagefähige Kosten + sonstige Ausgaben
```

### Gewerbe Triple-Net
```
Monatliche Kosten = Kreditrate + nicht-umlagefähige Kosten + sonstige Ausgaben
(Mieter trägt alle Bewirtschaftungskosten)
```

> **Hinweis:** Das Hausgeld selbst fließt **nicht** in die Cashflow-Kosten ein – es wird nur als Schätzgrundlage verwendet. Das Hausgeld enthält umlagefähige Kosten (die der Mieter zahlt) und nicht-umlagefähige (die der Eigentümer trägt). Die 50%-Schätzung ist ein vereinfachter Näherungswert.

---

## 8. Netto-Cashflow

```
Monatliche Einnahmen = Effektive Kaltmiete

Netto-Cashflow/Monat = Monatliche Einnahmen − Monatliche Kosten

Netto-Cashflow/Jahr = Netto-Cashflow/Monat × 12
```

**Vollständig ausgeschrieben (Normalfall mit exakten Werten):**
```
Netto-Cashflow/Monat = Kaltmiete − Kreditrate − nicht-umlagefähige Kosten − Rücklagen − sonstige Ausgaben
```

> **⚠️ Wichtiger Hinweis:** Das Hausgeld fließt **nicht direkt** in den Cashflow ein. Nur der Eigentümeranteil (nicht-umlagefähige Kosten + Rücklagen) wird abgezogen. Das ist korrekt, da der Mieter den umlagefähigen Teil des Hausgeldes über die Nebenkostenabrechnung zahlt.
>
> **Eigennutzungs-Szenario:** Hier wird der Cashflow als `−(Kreditrate + nicht-umlagefähige Kosten + sonstige Ausgaben)` berechnet – ohne Mieteinnahmen.

---

## 9. Eigenkapitalrendite (Pro)

```
Eigenkapitalrendite (%) = (Netto-Cashflow/Jahr / Eigenkapital) × 100
```

**Beispiel:** Cashflow 100 €/Mo, Eigenkapital 50.000 €
```
Eigenkapitalrendite = (1.200 / 50.000) × 100 = 2,4 %
```

> **⚠️ Möglicher Fehler:** Die Eigenkapitalrendite berücksichtigt nur den laufenden Cashflow, **nicht** die Tilgung (Vermögensaufbau durch Schuldenabbau) und **nicht** die Wertsteigerung. In der Praxis wird die EKR oft als Gesamtrendite berechnet:
>
> EKR (vollständig) = (Cashflow/Jahr + Tilgung/Jahr + Wertsteigerung/Jahr) / Eigenkapital × 100
>
> Die aktuelle Berechnung unterschätzt die tatsächliche Eigenkapitalrendite erheblich.

---

## 10. Preis pro Quadratmeter

```
Preis/m² = Kaufpreis / Wohnfläche (m²)
```

---

## 11. Vervielfältiger (Kaufpreisfaktor)

```
Vervielfältiger = Kaufpreis / (Effektive Kaltmiete × 12)
```

**Beispiel:** Kaufpreis 200.000 €, Kaltmiete 900 €/Mo
```
Vervielfältiger = 200.000 / (900 × 12) = 200.000 / 10.800 = 18,5x
```

> **Interpretation:** Gibt an, wie viele Jahreskaltmieten dem Kaufpreis entsprechen. Unter 20x gilt als günstig, über 30x als teuer.

---

## 12. AfA (Absetzung für Abnutzung)

```
Gebäudewert = Kaufpreis × 80 %
(Annahme: 20 % Grundstücksanteil, nicht abschreibbar)

AfA-Satz:
  - Baujahr ≥ 2023 (Neubau): 3 % p.a.
  - Baujahr < 2023 (Altbau): 2 % p.a.
  - Manuell eingetragen: direkt verwenden

AfA/Jahr = Gebäudewert × AfA-Satz
```

**Beispiel:** Kaufpreis 300.000 €, Baujahr 2010
```
Gebäudewert = 300.000 × 0,8 = 240.000 €
AfA/Jahr = 240.000 × 0,02 = 4.800 €
```

> **Hinweis:** Der Grundstücksanteil von 20 % ist ein pauschaler Schätzwert. In Großstädten kann der Grundstücksanteil 30–50 % betragen, was die AfA-Basis und damit die Steuerersparnis reduziert.

---

## 13. Steuerliche Berechnung

### Steuerlicher Gewinn (Einkünfte aus Vermietung & Verpachtung)

```
Zinsen/Jahr = Darlehenssumme × (Zinssatz / 100)

Steuerlicher Gewinn = Kaltmiete/Jahr
                    − nicht-umlagefähige Kosten/Jahr
                    − Zinsen/Jahr
                    − AfA/Jahr
                    − sonstige Ausgaben/Jahr
```

> **⚠️ Möglicher Fehler:** In der Formel fehlen **Hausgeld** und **Rücklagen** als absetzbare Kosten. Tatsächlich sind folgende Kosten steuerlich absetzbar:
> - Zinsen ✓ (enthalten)
> - AfA ✓ (enthalten)
> - Nicht-umlagefähige Kosten ✓ (enthalten)
> - Verwaltungskosten ✓ (sonstige Ausgaben – teilweise enthalten)
> - **Instandhaltungsrücklagen** ✗ (fehlen in der Formel!)
> - **Hausgeld (Eigentümeranteil)** ✗ (fehlt in der Formel!)
>
> Das führt zu einem zu hohen steuerlichen Gewinn und damit zu einer zu hohen Steuerlast in der Berechnung.

### Steuerlast

```
Steuerlast/Jahr = Steuerlicher Gewinn × (Persönlicher Steuersatz / 100)
```

### Steuerersparnis / Steuerlast

```
Steuerersparnis = −Steuerlast
(positiv = Steuervorteil durch Verlust aus V&V; negativ = Steuernachzahlung)
```

### Cashflow nach Steuern

```
Cashflow nach Steuern/Monat = Netto-Cashflow/Monat − (Steuerlast/Jahr / 12)
```

---

## 14. Zielrendite-Analyse (Pro)

```
Jahreskaltmiete = Kaltmiete × 12
(Hinweis: hier wird die eingegebene Kaltmiete direkt verwendet, nicht die effektive Kaltmiete)

Maximaler Kaufpreis für Zielrendite = Jahreskaltmiete / (Zielrendite / 100)

Preisabweichung = Aktueller Kaufpreis − Maximaler Kaufpreis

Toleranz = Kaufpreis × 2 %

Bewertung:
  |Preisabweichung| ≤ Toleranz → "gleich"
  Preisabweichung > 0          → "über Zielrendite" (zu teuer)
  Preisabweichung < 0          → "unter Zielrendite" (günstig)
```

---

## 15. 10-Jahres-Projektion (Pro)

Jährliche Iteration über 10 Jahre:

```
Immobilienwert (Jahr j) = Kaufpreis × 1,03^j
(Annahme: 3 % Wertsteigerung p.a.)

Jahrestilgung = Darlehenssumme × (Tilgung / 100)

Restschuld (Jahr j) = max(0, Restschuld(j−1) − Jahrestilgung)

Kumulierter Cashflow (Jahr j) = Kumulierter Cashflow(j−1) + Cashflow nach Steuern/Jahr

Eigenkapital (Jahr j) = Immobilienwert(j) − Restschuld(j)

Gesamtrendite (%) = (Eigenkapital(j) − Eigenkapital(Start) + Kumulierter Cashflow(j)) / Eigenkapital(Start) × 100
```

> **Hinweis:** Die Jahrestilgung wird als konstanter Betrag berechnet (Darlehenssumme × Tilgungssatz). In der Realität steigt die Tilgung bei Annuitätendarlehen jährlich an (da die Zinslast sinkt). Die Vereinfachung führt zu einer leicht zu hohen Restschuld in späteren Jahren.

---

## 16. Risikoanalyse – Durchschnitts-Modell

Fünf Faktoren werden je mit 1 (niedrig), 2 (mittel) oder 3 (hoch) bewertet:

| Faktor | Niedrig (1) | Mittel (2) | Hoch (3) |
|--------|-------------|------------|----------|
| Zinsänderungsrisiko | Zinssatz ≤ 3 % | 3 % < Zinssatz ≤ 4,5 % | Zinssatz > 4,5 % |
| Mietausfallrisiko | BMR ≥ 5 % | 3,5 % ≤ BMR < 5 % | BMR < 3,5 % |
| Sanierungsrisiko | Zustand = neu | Zustand = renoviert | Zustand = renovierungsbedürftig |
| Lageentwicklung | – | immer mittel (2) | – |
| Cashflow-Risiko | CF ≥ +100 €/Mo | −100 € ≤ CF < +100 €/Mo | CF < −100 €/Mo |

```
Gesamtpunkte = Summe aller Faktoren / Anzahl Faktoren (Durchschnitt)

Gesamtrisiko:
  ≤ 1,5 → niedrig
  ≤ 2,3 → mittel
  > 2,3 → hoch
```

> **Hinweis:** Der Faktor "Lageentwicklung" ist immer auf "mittel" (2) gesetzt, da keine Lageinformationen im Tool hinterlegt sind. Das ist ein bekannter Vereinfachungswert.

---

## 17. Investment-Bewertung (Ampelsystem, Pro)

Score-Berechnung (0–100):

```
Startwert: 50 Punkte

+ min(20, (Brutto-Mietrendite − 4) × 5)     → Rendite-Bonus
+ min(15, Netto-Cashflow/Monat / 20)         → Cashflow-Bonus
+ min(10, (Eigenkapitalrendite − 5) × 2)     → EKR-Bonus
− max(0, (Vervielfältiger − 20) × 1,5)       → Vervielfältiger-Malus
− max(0, (Zinssatz − 3) × 3)                 → Zins-Malus

Score = max(0, min(100, gerundeter Wert))
```

**Ampel-Schwellen:**

| Score | Ampel | Bedeutung |
|-------|-------|-----------|
| ≥ 65 | 🟢 Grün | Gutes Investment |
| 40–64 | 🟡 Gelb | Prüfen |
| < 40 | 🔴 Rot | Kritisch |

---

## 18. Szenarien (Pro)

### Fix & Flip
```
Sanierungskosten:
  Zustand = renovierungsbedürftig: Wohnfläche × 800 €/m²
  Sonst:                           Wohnfläche × 300 €/m²

Wertsteigerung nach Sanierung = Sanierungskosten × 1,8

Verkaufsgewinn = Wertsteigerung − Sanierungskosten − (Kaufnebenkosten × 50 %)

Gewinn nach Steuer = Verkaufsgewinn × 70 %
(Annahme: 30 % Steuerlast auf Spekulationsgewinn)

Rendite (%) = (Verkaufsgewinn / Gesamtinvestition) × 100
```

> **⚠️ Hinweis:** Die Sanierungskosten (300–800 €/m²) sind grobe Pauschalwerte. Tatsächliche Kosten können stark abweichen. Der Faktor 1,8 für die Wertsteigerung (= 80 % Wertzuwachs auf die Sanierungskosten) ist eine optimistische Annahme.

### Verkauf nach 24 Monaten Eigennutzung
```
Wertsteigerung 2 Jahre = Kaufpreis × 6 %
(Annahme: 3 % p.a. × 2 Jahre)

Steuerfreier Gewinn = Wertsteigerung − Kaufnebenkosten

Gilt nur für: Wohnung (ETW) und Neubau (§ 23 EStG)
```

### Buy & Hold 10 Jahre
```
Cashflow nach Steuern/Monat (s. Abschnitt 13)

Gewinn nach 10 Jahren = (Cashflow nach Steuern × 12 × 10) + (Kaufpreis × 30 %)
(Annahme: 30 % Wertsteigerung über 10 Jahre = 3 % p.a.)

Rendite = Netto-Mietrendite + 3 %
(vereinfacht: Mietrendite + Wertsteigerungsannahme)
```

---

## 19. Zusammenfassung: Identifizierte Abweichungen vom Branchenstandard

| Nr. | Kennzahl | Aktuell im Tool | Branchenstandard / Empfehlung |
|-----|----------|-----------------|-------------------------------|
| 1 | Brutto-Mietrendite | Bezug auf Kaufpreis | Oft auf Gesamtinvestition bezogen – Unterschied ~0,5–0,8 PP |
| 2 | Netto-Mietrendite | Nur Hausgeld + Rücklagen abgezogen | Alle Eigentümerkosten sollten abgezogen werden (inkl. Verwaltung, Versicherung) |
| 3 | Eigenkapitalrendite | Nur laufender Cashflow | Tilgung + Wertsteigerung fehlen → EKR wird unterschätzt |
| 4 | Steuerlicher Gewinn | Rücklagen und Hausgeld fehlen als Abzug | Instandhaltungsrücklagen und Eigentümeranteil Hausgeld sind absetzbar |
| 5 | Kreditrate | Vereinfachte Annuitätenformel | Exakte Annuitätenformel weicht leicht ab (< 1 %) |
| 6 | 10-J-Projektion Tilgung | Konstante Jahrestilgung | Bei Annuitätendarlehen steigt die Tilgung jährlich |
| 7 | AfA-Grundstücksanteil | Pauschal 20 % | In Großstädten oft 30–50 % |
| 8 | Fix & Flip Sanierungskosten | 300–800 €/m² pauschal | Stark vereinfacht; echte Kalkulation nötig |

---

*Erstellt aus dem Quellcode `client/src/lib/calculations.ts` des ImmoRenditeTools.*
