# Stripe-Integration – ImmoRenditeTool
## Vollständige Dokumentation: Verbindungen, Ablauf, Datenbankfelder

---

## 1. Übersicht: Was ist verbunden?

```
Nutzer (Browser)
    │
    │  klickt "Jetzt kaufen" auf /pricing
    ▼
Frontend: Pricing.tsx
    │
    │  trpc.plan.checkout.useMutation()
    ▼
Backend: server/routers.ts → plan.checkout
    │
    │  createCheckoutSession()
    ▼
Stripe API (Checkout Session erstellen)
    │
    │  gibt checkout_url zurück
    ▼
Frontend öffnet Stripe-Zahlungsseite (neuer Tab)
    │
    │  Nutzer zahlt
    ▼
Stripe sendet Webhook → POST /api/stripe/webhook
    │
    │  handleStripeWebhook()
    ▼
Datenbank: users-Tabelle wird aktualisiert
    │
    │  plan, planExpiresAt, stripeCustomerId etc.
    ▼
Nutzer hat aktiven Plan
```

---

## 2. Pläne und Preise

| Plan | Monatlich | Jährlich | Einmalig (Lifetime) |
|---|---|---|---|
| **Basic** | 9 €/Mo | 79 €/Jahr | 149 € |
| **Pro** | 19 €/Mo | 149 €/Jahr | 299 € |
| **Investor** | 39 €/Mo | 299 €/Jahr | 499 € |

**Plan-Limits (gespeicherte Analysen):**

| Plan | Max. Analysen speichern |
|---|---|
| none (kostenlos) | 0 – kein Speichern |
| basic | 10 |
| pro | 50 |
| investor | unbegrenzt |

---

## 3. Alle Stripe-Dateien und ihre Aufgabe

| Datei | Aufgabe |
|---|---|
| `server/stripe/products.ts` | Definiert alle Pläne, Preise und Preis-IDs |
| `server/stripe/stripeService.ts` | Erstellt Stripe-Kunden, Preise und Checkout-Sessions |
| `server/stripe/webhook.ts` | Verarbeitet alle eingehenden Stripe-Events |
| `server/routers.ts` | tRPC-Endpunkte: `plan.checkout`, `plan.portal`, `plan.status` |
| `server/_core/index.ts` | Registriert die Webhook-Route (vor express.json!) |
| `client/src/pages/Pricing.tsx` | Pricing-Seite mit Kauf-Buttons |
| `drizzle/schema.ts` | Datenbankfelder für Stripe-Daten |

---

## 4. Datenbankfelder (users-Tabelle)

| Feld | Typ | Bedeutung |
|---|---|---|
| `plan` | enum | Aktiver Plan: `none`, `basic`, `pro`, `investor` |
| `planActivatedAt` | timestamp | Wann der Plan aktiviert wurde |
| `planExpiresAt` | timestamp | Wann der Plan abläuft (bei Lifetime: +100 Jahre) |
| `billingType` | enum | `monthly`, `yearly`, `lifetime` |
| `stripeCustomerId` | varchar | Stripe Customer ID (z.B. `cus_xxx`) |
| `stripeSubscriptionId` | varchar | Stripe Subscription ID (nur bei Abo) |
| `stripePriceId` | varchar | Stripe Price ID des aktiven Plans |
| `stripeCurrentPeriodEnd` | timestamp | Ende der aktuellen Abrechnungsperiode |
| `stripeLastWebhookEventId` | varchar | Letzte verarbeitete Event-ID (Idempotenz) |
| `stripeWebhookProcessedAt` | timestamp | Zeitstempel der letzten Webhook-Verarbeitung |

---

## 5. Schritt-für-Schritt Ablauf: Kauf

### 5.1 Nutzer kauft einen Plan

```
1. Nutzer öffnet /pricing
2. Wählt Plan (Basic/Pro/Investor) + Zahlungsintervall (monatlich/jährlich/einmalig)
3. Klickt "Jetzt kaufen"

4. Frontend ruft auf:
   trpc.plan.checkout.mutate({
     planId: "pro",
     billingType: "monthly",
     origin: window.location.origin
   })

5. Backend (routers.ts → plan.checkout):
   - Holt User aus Datenbank
   - Ruft createCheckoutSession() auf

6. stripeService.ts:
   - Erstellt oder holt Stripe-Kunden (getOrCreateStripeCustomer)
   - Erstellt oder holt Stripe-Preis (getOrCreateStripePrice)
     → Falls Preis noch nicht existiert: wird in Stripe angelegt
   - Erstellt Checkout Session mit:
     • customer: Stripe Customer ID
     • client_reference_id: User-ID aus Datenbank
     • metadata.plan_id: "pro"
     • metadata.billing_type: "monthly"
     • success_url: /dashboard?checkout=success&plan=pro
     • cancel_url: /pricing?checkout=canceled
     • allow_promotion_codes: true
     • locale: "de"

7. Backend gibt checkout_url zurück
8. Frontend öffnet Stripe-Zahlungsseite in neuem Tab
9. Nutzer gibt Zahlungsdaten ein und zahlt
```

### 5.2 Nach erfolgreicher Zahlung: Webhook

```
10. Stripe sendet POST /api/stripe/webhook

11. server/_core/index.ts:
    - Route ist mit express.raw() registriert (MUSS vor express.json() sein!)
    - Roher Request-Body wird an handleStripeWebhook() übergeben

12. webhook.ts – Signaturverifizierung:
    - stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    - Bei Fehler: 400 zurückgeben
    - Test-Events (evt_test_*): sofort { verified: true } zurückgeben

13. Event-Routing (switch):
    ┌─ checkout.session.completed  → Plan aktivieren
    ├─ customer.subscription.updated → Abo-Status aktualisieren
    ├─ customer.subscription.deleted → Plan auf "none" setzen
    ├─ invoice.payment_succeeded   → Abo verlängern (Laufzeit aktualisieren)
    └─ invoice.payment_failed      → Plan auf "none" setzen

14. handleCheckoutCompleted():
    a) User finden:
       - Priorität 1: client_reference_id (User-ID)
       - Priorität 2: customer_details.email (Fallback)
    b) Idempotenz prüfen: Event-ID bereits verarbeitet?
    c) Plan ermitteln:
       - Priorität 1: metadata.plan_id
       - Priorität 2: Preis-ID aus Line Items
       - Priorität 3: Betrag (letzter Fallback)
    d) Datenbank aktualisieren:
       • Lifetime-Kauf: planExpiresAt = jetzt + 100 Jahre
       • Abo: planExpiresAt = current_period_end aus Stripe
    e) Event als verarbeitet markieren (Idempotenz)

15. Webhook antwortet immer mit 200 OK
    (auch bei Fehler, damit Stripe nicht erneut sendet)
```

---

## 6. Ablauf: Abo-Verlängerung (automatisch)

```
Jeden Monat/Jahr:
1. Stripe zieht Geld automatisch ein
2. Stripe sendet invoice.payment_succeeded
3. Webhook aktualisiert planExpiresAt auf neues current_period_end
→ Plan bleibt aktiv, kein Nutzereingriff nötig

Bei fehlgeschlagener Zahlung:
1. Stripe sendet invoice.payment_failed
2. Webhook setzt plan auf "none"
→ Nutzer verliert Zugang
```

---

## 7. Ablauf: Abo kündigen / verwalten

```
1. Nutzer klickt "Abo verwalten" (Dashboard oder Pricing)
2. Frontend ruft auf:
   trpc.plan.portal.mutate({ origin: window.location.origin })

3. Backend (routers.ts → plan.portal):
   - Prüft ob stripeCustomerId vorhanden
   - Ruft createCustomerPortalSession() auf

4. stripeService.ts:
   - Erstellt Stripe Customer Portal Session
   - return_url: /dashboard

5. Frontend öffnet Stripe Customer Portal
   → Nutzer kann dort: kündigen, Zahlungsmethode ändern, Rechnungen einsehen

6. Bei Kündigung:
   - Stripe sendet customer.subscription.deleted
   - Webhook setzt plan auf "none"
```

---

## 8. tRPC-Endpunkte (API)

| Endpunkt | Typ | Beschreibung |
|---|---|---|
| `trpc.plan.status` | Query | Gibt aktuellen Plan, Ablaufdatum, billingType zurück |
| `trpc.plan.checkout` | Mutation | Erstellt Stripe Checkout Session, gibt URL zurück |
| `trpc.plan.portal` | Mutation | Erstellt Stripe Customer Portal Session, gibt URL zurück |
| `trpc.plan.activate` | Mutation | Manuell Plan setzen (Admin/Test-Zwecke) |

---

## 9. Umgebungsvariablen (automatisch gesetzt)

| Variable | Verwendung |
|---|---|
| `STRIPE_SECRET_KEY` | Server-seitige Stripe API-Aufrufe |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend (aktuell nicht direkt genutzt) |
| `STRIPE_WEBHOOK_SECRET` | Signaturverifizierung eingehender Webhooks |

> Diese Variablen sind automatisch in der Manus-Plattform gesetzt.
> Im Live-Betrieb müssen sie in **Settings → Payment** auf die echten Stripe-Keys umgestellt werden.

---

## 10. Stripe Sandbox (Test-Modus)

**Status:** Test-Sandbox erstellt, aber noch nicht beansprucht.

**Wichtig:** Die Sandbox muss unter folgendem Link beansprucht werden:
```
https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVDlySG1Cb3R0bGdLaU9xLDE3NzM4NjI4NTYv100BBD1eAWv
```
**Ablaufdatum:** 10. Mai 2026 – danach verfällt die Test-Sandbox!

**Testkarte für Zahlungen:**
```
Kartennummer: 4242 4242 4242 4242
Ablauf: beliebiges zukünftiges Datum (z.B. 12/28)
CVC: beliebig (z.B. 123)
```

---

## 11. Bekannte Besonderheiten und Hinweise

**Preis-IDs werden dynamisch erstellt:**
Die `priceId`-Felder in `products.ts` sind leer (`""`). Beim ersten Checkout-Aufruf werden Produkte und Preise automatisch in Stripe angelegt und im Speicher gecacht. Bei Server-Neustart werden sie erneut aus Stripe abgerufen.

**Empfehlung:** Preis-IDs einmalig im Stripe Dashboard anlegen und als Konstanten in `products.ts` eintragen – das macht das System robuster.

**Webhook-Reihenfolge in index.ts:**
```typescript
// RICHTIG: raw() VOR json()
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
app.use(express.json());
```
Wenn `express.json()` zuerst kommt, schlägt die Signaturverifizierung fehl!

**Idempotenz:**
Jedes Webhook-Event wird anhand der Event-ID geprüft. Doppelt gesendete Events werden ignoriert.

**Fallback-Logik für externe Payment-Links:**
Falls jemand direkt über einen Stripe Payment-Link kauft (ohne das Tool), kann der Webhook den Plan trotzdem ermitteln – über Preis-ID oder Betrag.
