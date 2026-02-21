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
