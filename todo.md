# ImmoKalkulator SaaS – TODO

## Backend & Datenbank
- [x] Datenbankschema: users erweitern (plan, planExpiry, trialStart)
- [x] Datenbankschema: immobilien Tabelle (userId, name, art, eingaben, ergebnisse, datum)
- [x] tRPC-Router: immobilien (create, list, get, update, delete)
- [x] tRPC-Router: plan (getPlan, upgradePlan, startTrial)
- [x] DB-Push ausführen

## Auth & Login
- [x] Login mit Manus OAuth
- [x] Ohne Login keine Berechnung möglich (protected routes)
- [x] Nach Login Weiterleitung ins Dashboard
- [x] Logo-Klick → zurück zum Dashboard

## Preismodell (Basic / Pro / Investor)
- [x] Pricing-Seite mit 3 Plänen
- [x] Basic: 49 € Einmalzahlung
- [x] Pro: 99 € einmalig / 19 €/Monat / 149 €/Jahr + 14 Tage Trial
- [x] Investor: 149 € einmalig
- [x] Upgrade-Modal mit Redirect zur Pricing-Seite
- [x] Plan-basierte Feature-Gating

## Dashboard
- [x] User-Dashboard Seite
- [x] Übersicht aller gespeicherten Immobilien
- [x] Bearbeiten / Löschen von Immobilien
- [x] Portfolio-Gesamtübersicht mit Summen
- [x] Cashflow-Diagramm im Dashboard

## Kalkulator-Erweiterungen
- [x] Immobilienart-Dropdown (ETW, MFH, EFH, Gewerbe, Neubau)
- [x] Eigennutzung 24 Monate → Spekulationssteuer = 0 € Logik
- [x] "Steuerfreier Verkauf möglich" Badge mit Info-Button
- [x] Analyse speichern (Basic+) mit Name-Dialog
- [x] Excel-Export (Investor-Plan) mit 4 Sheets

## UX-Verbesserungen
- [x] Navbar: Auth-Status, Dashboard-Link, Logout
- [x] Breadcrumb im Kalkulator
- [x] Speichern-Button im Kalkulator
- [ ] Mobile-Optimierung (weitere Verbesserungen möglich)

## Tests
- [x] Vitest: immobilien CRUD (plan.get, immobilien.list, immobilien.create)
- [x] Vitest: auth.logout

## Bugfixes
- [x] Exposé-PDF-Export reparieren (PDF-Ausgabe funktioniert nicht)

## Neue Features (Feb 2026)
- [x] 14-Tage-Trial entfernt (Backend, ProContext, Pricing-Seite)
- [x] Free-Version: max. 1 Objekt speichern (Backend-Limit)
- [x] Free-Version: eingeschränkte Kennzahlen (NMR, Finanzierung gesperrt mit Blur)
- [x] Free-Version: kein PDF-Export, kein Excel-Export (gesperrt mit Lock-Icon)
- [x] Free-Version: Szenarien gesperrt mit Upsell-Banner
- [x] Pricing-Seite: Free-Karte hinzugefügt (jetzt 4 Pläne)
- [x] Kennzahlen-Legende: ausklappbarer Bereich mit 10 Kennzahlen (Formel, Erklärung, Beispiel)
- [x] Info-Buttons (i) an MetricCards: BMR, CF, NMR, NK, GI, EKR, P/m², VV, AfA, SE

## Profil-Dropdown (Feb 2026)
- [x] Klick auf Namen oben rechts öffnet Dropdown mit Plan-Info, Ablaufdatum, Upgrade-Link, Logout

## Pricing-Update (Feb 2026)
- [x] Preisstruktur korrigiert: Monatlich < Jährlich < Einmalig (Lifetime)

## Rebranding (Feb 2026)
- [x] App-Namen von "ImmoKalkulator" auf "ImmoRenditeTool" umbenannt (Navbar, Pricing, Landing, Browser-Tab, PDF, Excel, Exposé)

## Logo-Integration (Feb 2026)
- [x] ImmoRenditeTool-Logo als Favicon (ICO + PNG) und in Navbar (Navbar, Home, Pricing, Dashboard) eingebaut

## Logo-Größe & Footer (Feb 2026)
- [x] Logo in Navbar größer gemacht (h-11 w-auto, alle Seiten)
- [x] Logo im Footer aller Seiten ergänzt (Home, Pricing, Dashboard)

## Großes Redesign (März 2026)
- [ ] Berechnungslogik: dynamische Felder je Immobilienart (Wohnung/MFH/Neubau/Gewerbe)
- [ ] Cashflow-Formel: Kaltmiete – nicht umlagefähige Kosten – Kreditrate
- [ ] Warmmiete-Hinweis: "Von der Warmmiete bleiben wirklich X € übrig"
- [ ] Free: nur Wohnung (Buy-and-Hold), Pro: alle Immobilienarten + Szenarien
- [ ] Formular: dynamische Felder je Immobilienart mit Info-Buttons
- [ ] MFH: Anzahl Einheiten, Ø Kaltmiete/Einheit, Leerstandsquote
- [ ] Neubau: AfA-Satz, Erstvermietungsstatus, Kaufnebenkosten, reduzierte Rücklage
- [ ] Gewerbe: Mietvertragslaufzeit, Indexmiete, Triple-Net, Leerstandsquote
- [ ] Pro-Szenarien: Eigennutzung, Buy-and-Hold, Verkauf nach 24 Monaten (steuerfrei ETW)
- [ ] Upgrade-Popup: modernes X zum Schließen
- [ ] Logo oben links klickbar → zurück zur Startseite
- [ ] Live-Berechnung: Ergebnisse sofort nach Eingabe aktualisieren
- [ ] Responsives Layout: Mobile + Desktop

## Bugs (März 2026)
- [x] AfA wird in 10-Jahres-Projektion nicht abgezogen (vor/nach Steuer gleich) — BEHOBEN: cashflowNachSteuerJaehrlich verwendet
- [x] Steuerersparnis/Jahr zeigt immer 0€ statt korrekte Berechnung — BEHOBEN: berechneGrenzsteuersatz konvertiert jetzt monatliches zu jährlichem Einkommen
- [x] Speicherfehler: Free-Nutzer konnten keine Immobilien speichern — BEHOBEN: handleSave prüfte isBasic statt alle Pläne zuzulassen
- [x] Speicherfehler: Auch Investor-Plan kann nicht speichern — BEHOBEN: Frontend verwendete 'wohnung' statt 'etw' als art-Wert (Mapping-Funktion mapArtToBackend hinzugefügt)
- [x] Spezifische Fehlermeldungen beim Speichern: Limit-Fehler, Auth-Fehler, Validierungsfehler, Netzwerkfehler — BEHOBEN: parseImmobilienSaveError() Utility + 9 Vitest-Tests
- [x] Ziel-Bruttomietrendite-Eingabe (Pro-only, Standard 6%, sofortige Neuberechnung)
- [x] Neue Berechnungen: Jahreskaltmiete, BMR, Max-Kaufpreis für Zielrendite, Preisabweichung
- [x] Pro-PDF: Seite 1 Executive Summary mit automatischem Bewertungstext
- [x] Pro-PDF: Seite 2 Kennzahlenübersicht (Kaufpreis, Nebenkosten, Rendite, Cashflow)
- [x] Pro-PDF: Seite 3 Wirtschaftlichkeitsanalyse mit Disclaimer
- [x] PDF-Design: Blau/weißes Investment-Report-Layout, professionelle Typografie
- [x] Cashflow-Bug: Netto-Cashflow wird mit Kaltmiete statt Warmmiete berechnet (sollte Warmmiete - Kosten sein) — BEHOBEN: monatlicheEinnahmen verwendet jetzt Warmmiete wenn vorhanden
