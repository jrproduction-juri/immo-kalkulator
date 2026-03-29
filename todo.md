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
- [x] Redundante Warmmiete-Überschuss-Anzeige entfernen (identisch mit Netto-Cashflow) — BEHOBEN: aus FreeResults-Interface und Berechnung entfernt
- [x] Preise auf Startseite mit Pricing-Seite synchronisieren — BEHOBEN: Basic ab 9€, Pro ab 19€, Investor ab 39€ mit allen Optionen (monatlich/jährlich/einmalig)
- [x] EFH: Immobilienart "Einfamilienhaus" zu FormData-Typen hinzugefügt (isProArt = true)
- [x] EFH: Neue Felder in FormData (grundstueckFlaeche, grundsteuer, versicherung, verwaltungEFH)
- [x] EFH: InputForm angepasst (EFH-Felder zeigen, Hausgeld/WEG-Rücklagen ausgeblendet)
- [x] EFH: Berechnungen für EFH (Jahreskaltmiete, BMR, Netto-Cashflow, EK-Rendite, Max-Kaufpreis)
- [x] EFH: PDF-Export für EFH-spezifische Kennzahlen angepasst (Betriebskosten statt Nebenkosten)
- [x] EFH: 6 Vitest-Tests für EFH-Berechnungen geschrieben und bestanden
- [x] SEO: Keywords in index.html Meta-Tags (title, description, keywords, canonical)
- [x] SEO: Open Graph Tags für Social Media (og:title, og:description, og:image)
- [x] SEO: Twitter Card Tags
- [x] SEO: Strukturierte Daten JSON-LD (WebApplication + FAQPage mit 8 Fragen)
- [x] SEO: Semantisches HTML auf der Startseite (aria-labelledby, h1/h2/h3 Hierarchie)
- [x] SEO: Keyword-reiche Texte auf der Startseite (Bruttomietrendite, Cashflow, AfA, ETW, EFH, MFH)
- [x] SEO: FAQ-Sektion mit 8 keyword-reichen Fragen (Google Rich Snippets)
- [x] Impressum-Seite erstellt (Juri Telipko / JR Production, Einzelunternehmen, Bergheim, Kleinunternehmer)
- [x] Datenschutzerklärung-Seite erstellt (DSGVO-konform, Stripe, Manus OAuth, Umami Analytics, LDI NRW)
- [x] AGB-Seite erstellt (Stripe-Zahlungsbedingungen, Widerrufsrecht, Haftungsausschluss, Kleinunternehmer)
- [x] Seiten in Router (App.tsx), Home-Footer und Dashboard-Footer eingebunden
- [x] Footer mit Impressum/Datenschutz/AGB auf Pricing-Seite ergänzt
- [x] Stripe: Feature aktiviert und API-Schlüssel automatisch konfiguriert
- [x] Stripe: Checkout-Session für Abonnements (monatlich/jährlich) und Einmalkäufe (Lifetime)
- [x] Stripe: Webhook für Abo-Status-Updates (checkout.session.completed, subscription.updated/deleted, payment_failed)
- [x] Stripe: Datenbank-Schema erweitert (stripeSubscriptionId, stripePriceId, stripeCurrentPeriodEnd, billingType)
- [x] Stripe: Pricing-Seite mit echten Checkout-Buttons verbunden (window.open in neuen Tab)
- [x] Stripe: Kundenportal-Procedure (trpc.plan.portal) für Abo-Verwaltung
- [x] Stripe: 8 Vitest-Tests für Produkt-Konfiguration und Preislogik
- [x] Pricing-Seite: Text korrigiert — "Free: 1 Objekt speichern" macht jetzt klar dass Free-Nutzer 1 Objekt speichern kÖnnen
- [x] Free-Plan: Speichern komplett deaktiviert (Limit 0, kein Objekt speicherbar) — Backend + ProContext
- [x] Free-Plan: Pricing-Seite Banner und Feature-Liste aktualisiert ("Immobilien speichern" = X)
- [x] Free-Plan: Speichern-Button im Kalkulator sperrt mit Lock-Icon und öffnet Upgrade-Modal
- [x] Stripe Payment-Links direkt in Pricing-Seite eingebaut (alle 9 Links für Basic/Pro/Investor je monatlich/jährlich/einmalig)
- [x] Stripe: Test-Links durch Live-Links ersetzt (alle 9 Produkte)
- [x] Webhook: invoice.payment_succeeded (Plan verlängern) und invoice.payment_failed (Plan deaktivieren) korrekt implementiert
- [ ] Dashboard-Statistiken reparieren: Gesamtinvestition, Gesamt-Cashflow und Ø Rendite aus gespeicherten eingaben-Daten berechnen
- [x] Cashflow-Berechnung verbessern: Intelligente Fallback-Logik für Hausgeld/Rücklagen
- [x] UI-Hinweis für automatische Schätzung hinzufügen
- [x] Tests für neue Cashflow-Logik schreiben
- [x] Cashflow-Berechnung korrigieren: Nutze Kaltmiete statt Warmmiete als Einnahmen
- [x] Webhook-Handler: Plan-Ermittlung aus Stripe-Produkt-ID für externe Payment-Links
- [x] Pricing-Seite: Alle externen Payment-Links durch internen tRPC-Checkout ersetzen (User-ID-basiert)
- [x] Netto-Einkommen Feld aus UI und Berechnung entfernen
- [x] Neues Feld "Persönlicher Steuersatz (%)" mit Standardwert 35% und Info-Tooltip hinzufügen
- [x] Cashflow-nach-Steuern-Berechnung nach Immobilien-Steuerlogik implementieren
- [x] Tests für alle Steuerszenarien (35%, 25%, 42%, negativer Gewinn) schreiben
- [x] InfoTooltip-Komponente: Hover (Desktop) + Click/Tap (Mobile), auto-Positionierung, kein Abschneiden
- [x] Alle Info-Icons im Kalkulator auf neue InfoTooltip-Komponente umstellen
- [x] InfoModal-Komponente erstellen (Dialog mit OK-Button, Desktop+Mobile)
- [x] Alle Info-Icons im Kalkulator auf InfoModal umstellen
- [x] InfoModal: zentriert auf Mobile, 90% Breite, kein Abschneiden
- [x] InfoModal: schließt bei Außerhalb-Klick, OK-Button und erneutem i-Klick
- [x] Tests für InfoModal aktualisieren

## Neue Features (Batch 2)
- [x] PLZ-Feld im Kalkulator: Ort erkennen + Ø Kaltmiete/m² ermitteln (KI)
- [x] PLZ: Empfohlene Kaltmiete berechnen und anzeigen (Wohnfläche × Ø Miete/m²)
- [x] PLZ: "Vorschlag übernehmen"-Button befüllt Kaltmiete-Feld
- [x] Risikoanalyse: Durchschnitts-Modell (1=niedrig, 2=mittel, 3=hoch), Gesamtbewertung
- [x] Risikoanalyse: Gesamtbewertung sichtbar im Risiko-Reiter
- [x] Neuer Tab "Investment Bewertung": Ampelsystem (grün/gelb/rot)
- [x] Investment Bewertung: Stärken-Liste + Risiken-Liste + Verbesserungspotenzial
- [x] Exposé-Upload: Drag & Drop (PDF, JPG, PNG) oberhalb der Analyse
- [x] Exposé-Upload: KI analysiert Dokument und extrahiert Immobilien-Daten
- [x] Exposé-Upload: Bestätigungs-Dialog "Folgende Daten wurden erkannt" mit Bearbeitung
- [x] Tests für alle neuen Features schreiben

## Berechnungskorrekturen (Batch 3)
- [x] NMR-Formel: nur nicht-umlagefähige Kosten + Rücklagen abziehen (nicht Gesamt-Hausgeld)
- [x] EKR-Formel: Tilgung + Wertsteigerung einbeziehen (vollständige EKR)
- [x] EKR bei EK=0: "n/a" anzeigen statt 0 %
- [x] PDF-Export: korrigierte NMR und EKR übernehmen
- [x] Exposé-Generator: korrigierte Kennzahlen übernehmen
- [x] UI-Komponenten (ProResults, FreeResults, KennzahlenLegende): Tooltips/Labels anpassen
- [x] Tests für korrigierte Formeln aktualisieren
