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
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] Fehlende Stripe-Signatur");
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
    console.error("[Webhook] Signaturverifizierung fehlgeschlagen:", err);
    return res.status(400).json({ error: "Webhook-Signatur ungültig" });
  }

  console.log(`[Webhook] Event: ${event.type} | ID: ${event.id}`);

  // Test-Events direkt bestätigen
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test-Event erkannt, Verifikationsantwort wird gesendet");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
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
        console.log(`[Webhook] Unbehandeltes Event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`[Webhook] Fehler bei Event ${event.type}:`, err);
    res.status(500).json({ error: "Webhook-Verarbeitung fehlgeschlagen" });
  }
}

/**
 * Checkout abgeschlossen: Plan aktivieren
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id
    ? parseInt(session.client_reference_id)
    : null;

  if (!userId) {
    console.error("[Webhook] Keine user_id in checkout.session.completed");
    return;
  }

  const planId = session.metadata?.plan_id as PlanId | undefined;
  const billingType = session.metadata?.billing_type as string | undefined;

  if (!planId) {
    console.error("[Webhook] Kein plan_id in checkout.session.completed metadata");
    return;
  }

  const customerId = session.customer as string;

  // Lifetime-Kauf (einmalig)
  if (session.mode === "payment") {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 100); // 100 Jahre = "lifetime"

    const db1 = await getDb();
    if (!db1) return;
    await db1
      .update(users)
      .set({
        plan: planId,
        stripeCustomerId: customerId,
        billingType: "lifetime",
        planActivatedAt: new Date(),
        planExpiresAt: expiresAt,
      })
      .where(eq(users.id, userId));

    console.log(`[Webhook] Lifetime-Plan ${planId} für User ${userId} aktiviert`);
    return;
  }

  // Abonnement
  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
    const priceId = subscription.items.data[0]?.price.id;

    const db2 = await getDb();
    if (!db2) return;
    await db2
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

    console.log(`[Webhook] Abo-Plan ${planId} für User ${userId} aktiviert bis ${currentPeriodEnd}`);
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
  }

  const db3 = await getDb();
  if (!db3) return;
  const userResult = await db3
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (userResult.length > 0) {
    await db3
      .update(users)
      .set(updateData)
      .where(eq(users.stripeCustomerId, customerId));

    console.log(`[Webhook] Abo aktualisiert für Customer ${customerId}: Status=${status}`);
  }
}

/**
 * Abonnement gekündigt
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const db4 = await getDb();
  if (!db4) return;
  await db4
      .update(users)
      .set({
        plan: "none",
        stripeSubscriptionId: null,
        stripePriceId: null,
      })
      .where(eq(users.stripeCustomerId, customerId));

  console.log(`[Webhook] Abo gelöscht für Customer ${customerId}`);
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
    return;
  }

  try {
    // Aktuelle Abo-Daten von Stripe holen um das neue Periodenende zu erhalten
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
    const priceId = subscription.items.data[0]?.price.id;
    const planInfo = priceId ? getPlanFromPriceId(priceId) : null;

    const db = await getDb();
    if (!db) return;

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

    console.log(`[Webhook] Wiederkehrende Zahlung erfolgreich für Customer ${customerId} — Plan verlängert bis ${currentPeriodEnd.toISOString()}`);
  } catch (err) {
    console.error(`[Webhook] Fehler bei invoice.payment_succeeded für Customer ${customerId}:`, err);
  }
}

/**
 * Zahlung fehlgeschlagen (monatlich/jährlich)
 * Setzt Plan auf 'none' nach fehlgeschlagener Zahlung
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string | null;

  console.warn(`[Webhook] Zahlung fehlgeschlagen für Customer ${customerId}`);

  if (!subscriptionId) return;

  try {
    const db = await getDb();
    if (!db) return;

    // Plan deaktivieren bei fehlgeschlagener Zahlung
    await db
      .update(users)
      .set({
        plan: "none",
        stripeSubscriptionId: null,
        stripePriceId: null,
      })
      .where(eq(users.stripeCustomerId, customerId));

    console.warn(`[Webhook] Plan für Customer ${customerId} deaktiviert (Zahlung fehlgeschlagen)`);
  } catch (err) {
    console.error(`[Webhook] Fehler bei invoice.payment_failed für Customer ${customerId}:`, err);
  }
}
