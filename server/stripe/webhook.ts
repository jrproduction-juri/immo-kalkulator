import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "./stripeService";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getPlanFromPriceId, PlanId } from "./products";

/**
 * Stripe Webhook Handler
 * Route: POST /api/stripe/webhook
 * Muss mit express.raw() registriert werden (vor express.json())
 * 
 * Features:
 * - Idempotenz: Verhindert Doppelverarbeitung durch Event-ID-Tracking
 * - Klare Fehlerbehandlung mit aussagekräftigen Logs
 * - Automatische Plan-Aktivierung nach erfolgreicher Zahlung
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] ❌ Fehlende Stripe-Signatur");
    return res.status(400).json({ error: "Fehlende Stripe-Signatur" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err) {
    console.error("[Webhook] ❌ Signaturverifizierung fehlgeschlagen:", err);
    return res.status(400).json({ error: "Webhook-Signatur ungültig" });
  }

  console.log(`[Webhook] 📨 Event empfangen: ${event.type} | Event-ID: ${event.id}`);

  // Test-Events direkt bestätigen
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] ✅ Test-Event erkannt, Verifikationsantwort wird gesendet");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, event.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, event.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Webhook] ⚠️ Unbehandeltes Event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`[Webhook] ❌ Fehler bei Event ${event.type}:`, err);
    res.status(500).json({ error: "Webhook-Verarbeitung fehlgeschlagen" });
  }
}

/**
 * Prüft ob ein Event bereits verarbeitet wurde (Idempotenz)
 */
async function isEventAlreadyProcessed(
  customerId: string,
  eventId: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (result.length === 0) return false;

  const user = result[0];
  const userFull = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (userFull.length === 0) return false;

  const lastEventId = (userFull[0] as any).stripeLastWebhookEventId;
  return lastEventId === eventId;
}

/**
 * Markiert ein Event als verarbeitet
 */
async function markEventAsProcessed(
  userId: number,
  eventId: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({
      stripeLastWebhookEventId: eventId,
      stripeWebhookProcessedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/**
 * Checkout abgeschlossen: Plan aktivieren
 * Idempotent: Verhindert Doppelaktivierung durch Event-ID-Tracking
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string
) {
  const userId = session.client_reference_id
    ? parseInt(session.client_reference_id)
    : null;

  if (!userId) {
    console.error("[Webhook] ❌ Keine user_id in checkout.session.completed");
    return;
  }

  const customerId = session.customer as string;

  // Prüfe Idempotenz
  if (await isEventAlreadyProcessed(customerId, eventId)) {
    console.log(`[Webhook] ⚠️ Event ${eventId} wurde bereits verarbeitet (Duplikat ignoriert)`);
    return;
  }

  const planId = session.metadata?.plan_id as PlanId | undefined;
  const billingType = session.metadata?.billing_type as string | undefined;

  if (!planId) {
    console.error("[Webhook] ❌ Kein plan_id in checkout.session.completed metadata");
    return;
  }

  console.log(`[Webhook] 💳 Checkout abgeschlossen: User ${userId} | Plan: ${planId} | Billing: ${billingType}`);

  try {
    // Lifetime-Kauf (einmalig)
    if (session.mode === "payment") {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 Jahre = "lifetime"

      const db = await getDb();
      if (!db) {
        console.error("[Webhook] ❌ Datenbankverbindung fehlgeschlagen");
        return;
      }

      await db
        .update(users)
        .set({
          plan: planId,
          stripeCustomerId: customerId,
          billingType: "lifetime",
          planActivatedAt: new Date(),
          planExpiresAt: expiresAt,
        })
        .where(eq(users.id, userId));

      await markEventAsProcessed(userId, eventId);

      console.log(`[Webhook] ✅ Lifetime-Plan ${planId} für User ${userId} aktiviert (gültig bis ${expiresAt.toISOString()})`);
      return;
    }

    // Abonnement
    if (session.mode === "subscription" && session.subscription) {
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
      const priceId = subscription.items.data[0]?.price.id;

      const db = await getDb();
      if (!db) {
        console.error("[Webhook] ❌ Datenbankverbindung fehlgeschlagen");
        return;
      }

      await db
        .update(users)
        .set({
          plan: planId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId ?? null,
          billingType: billingType === "yearly" ? "yearly" : "monthly",
          planActivatedAt: new Date(),
          planExpiresAt: currentPeriodEnd,
          stripeCurrentPeriodEnd: currentPeriodEnd,
        })
        .where(eq(users.id, userId));

      await markEventAsProcessed(userId, eventId);

      console.log(`[Webhook] ✅ Abo-Plan ${planId} für User ${userId} aktiviert (${billingType}, gültig bis ${currentPeriodEnd.toISOString()})`);
    }
  } catch (err) {
    console.error(`[Webhook] ❌ Fehler beim Aktivieren des Plans für User ${userId}:`, err);
    throw err;
  }
}

/**
 * Abonnement aktualisiert (Verlängerung, Upgrade, Downgrade)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;

  console.log(`[Webhook] 🔄 Abo aktualisiert: Customer ${customerId} | Status: ${status}`);

  // Plan aus Price ID ermitteln
  const planInfo = priceId ? getPlanFromPriceId(priceId) : null;

  const updateData: Record<string, any> = {
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId ?? null,
    stripeCurrentPeriodEnd: currentPeriodEnd,
    planExpiresAt: currentPeriodEnd,
  };

  if (planInfo) {
    updateData.plan = planInfo.plan;
    updateData.billingType = planInfo.billingType;
  }

  // Bei inaktivem Abo Plan auf "none" setzen
  if (status === "canceled" || status === "unpaid") {
    updateData.plan = "none";
    updateData.stripeSubscriptionId = null;
    console.log(`[Webhook] ⚠️ Abo ${status} für Customer ${customerId}`);
  }

  try {
    const db = await getDb();
    if (!db) {
      console.error("[Webhook] ❌ Datenbankverbindung fehlgeschlagen");
      return;
    }

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (userResult.length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.stripeCustomerId, customerId));

      console.log(`[Webhook] ✅ Abo aktualisiert für Customer ${customerId}: Plan=${updateData.plan || "unchanged"} | Status=${status}`);
    } else {
      console.warn(`[Webhook] ⚠️ Kunde ${customerId} nicht in Datenbank gefunden`);
    }
  } catch (err) {
    console.error(`[Webhook] ❌ Fehler beim Aktualisieren des Abos für Customer ${customerId}:`, err);
  }
}

/**
 * Abonnement gekündigt
 * Idempotent: Verhindert Doppelverarbeitung durch Event-ID-Tracking
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  eventId: string
) {
  const customerId = subscription.customer as string;

  console.log(`[Webhook] 🗑️ Abo gelöscht: Customer ${customerId}`);

  try {
    const db = await getDb();
    if (!db) {
      console.error("[Webhook] ❌ Datenbankverbindung fehlgeschlagen");
      return;
    }

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (userResult.length > 0) {
      const userId = userResult[0].id;

      // Prüfe Idempotenz
      if (await isEventAlreadyProcessed(customerId, eventId)) {
        console.log(`[Webhook] ⚠️ Event ${eventId} wurde bereits verarbeitet (Duplikat ignoriert)`);
        return;
      }

      await db
        .update(users)
        .set({
          plan: "none",
          stripeSubscriptionId: null,
          stripePriceId: null,
        })
        .where(eq(users.id, userId));

      await markEventAsProcessed(userId, eventId);

      console.log(`[Webhook] ✅ Plan deaktiviert für Customer ${customerId}`);
    } else {
      console.warn(`[Webhook] ⚠️ Kunde ${customerId} nicht in Datenbank gefunden`);
    }
  } catch (err) {
    console.error(`[Webhook] ❌ Fehler beim Löschen des Abos für Customer ${customerId}:`, err);
  }
}

/**
 * Wiederkehrende Zahlung erfolgreich (monatlich/jährlich)
 * Aktualisiert planExpiresAt auf das neue Periodenende
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string | null;

  if (!subscriptionId) {
    // Einmalige Zahlung — wird bereits über checkout.session.completed behandelt
    console.log(`[Webhook] ℹ️ Einmalige Zahlung für Customer ${customerId} (wird über checkout.session.completed behandelt)`);
    return;
  }

  console.log(`[Webhook] 💰 Zahlung erfolgreich: Customer ${customerId} | Subscription ${subscriptionId}`);

  try {
    // Aktuelle Abo-Daten von Stripe holen um das neue Periodenende zu erhalten
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
    const priceId = subscription.items.data[0]?.price.id;
    const planInfo = priceId ? getPlanFromPriceId(priceId) : null;

    const db = await getDb();
    if (!db) {
      console.error("[Webhook] ❌ Datenbankverbindung fehlgeschlagen");
      return;
    }

    const updateData: Record<string, any> = {
      stripeCurrentPeriodEnd: currentPeriodEnd,
      planExpiresAt: currentPeriodEnd,
    };

    // Plan und BillingType aktualisieren falls vorhanden
    if (planInfo) {
      updateData.plan = planInfo.plan;
      updateData.billingType = planInfo.billingType;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.stripeCustomerId, customerId));

    console.log(`[Webhook] ✅ Wiederkehrende Zahlung verarbeitet für Customer ${customerId} — Plan verlängert bis ${currentPeriodEnd.toISOString()}`);
  } catch (err) {
    console.error(`[Webhook] ❌ Fehler bei invoice.payment_succeeded für Customer ${customerId}:`, err);
  }
}

/**
 * Zahlung fehlgeschlagen (monatlich/jährlich)
 * Setzt Plan auf 'none' nach fehlgeschlagener Zahlung
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string | null;

  console.warn(`[Webhook] ⚠️ Zahlung fehlgeschlagen: Customer ${customerId}`);

  if (!subscriptionId) return;

  try {
    const db = await getDb();
    if (!db) {
      console.error("[Webhook] ❌ Datenbankverbindung fehlgeschlagen");
      return;
    }

    // Plan deaktivieren bei fehlgeschlagener Zahlung
    await db
      .update(users)
      .set({
        plan: "none",
        stripeSubscriptionId: null,
        stripePriceId: null,
      })
      .where(eq(users.stripeCustomerId, customerId));

    console.warn(`[Webhook] ✅ Plan für Customer ${customerId} deaktiviert (Zahlung fehlgeschlagen)`);
  } catch (err) {
    console.error(`[Webhook] ❌ Fehler bei invoice.payment_failed für Customer ${customerId}:`, err);
  }
}
