import Stripe from "stripe";
import { ENV } from "../_core/env";
import { STRIPE_PRODUCTS, getPriceId, PlanId, BillingType } from "./products";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

export { stripe };

/**
 * Erstellt oder holt einen Stripe-Kunden für einen Nutzer.
 * Legt nur dann einen neuen Kunden an, wenn noch keiner existiert.
 */
export async function getOrCreateStripeCustomer(
  userId: number,
  email: string,
  name?: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId: userId.toString() },
  });

  return customer.id;
}

/**
 * Erstellt eine Stripe Checkout Session mit fester Price-ID.
 * Keine dynamische Produkt- oder Preis-Erstellung – nur bestehende IDs verwenden.
 */
export async function createCheckoutSession(params: {
  userId: number;
  email: string;
  name?: string;
  stripeCustomerId?: string | null;
  planId: PlanId;
  billingType: BillingType;
  origin: string;
}): Promise<{ url: string }> {
  const { userId, email, name, stripeCustomerId, planId, billingType, origin } = params;

  // Stripe-Kunden holen oder anlegen
  const customerId = await getOrCreateStripeCustomer(userId, email, name, stripeCustomerId);

  // Feste Price-ID aus Konfiguration laden – niemals dynamisch erstellen
  const priceId = getPriceId(planId, billingType);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId.toString(),
    metadata: {
      plan_id: planId,
      billing_type: billingType,
      user_id: userId.toString(),
      customer_email: email,
      customer_name: name ?? "",
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: billingType === "lifetime" ? "payment" : "subscription",
    success_url: `${origin}/checkout/success?plan=${planId}`,
    cancel_url: `${origin}/pricing?checkout=canceled`,
    allow_promotion_codes: true,
    locale: "de",
  });

  if (!session.url) {
    throw new Error("Stripe Checkout Session URL konnte nicht erstellt werden");
  }

  return { url: session.url };
}

/**
 * Kündigt ein Stripe-Abonnement zum Ende der aktuellen Laufzeit.
 * Der Nutzer behält den Zugang bis zum Ablaufdatum.
 */
export async function cancelSubscription(
  stripeCustomerId: string
): Promise<{ cancelAt: Date | null }> {
  // Aktives Abonnement des Kunden suchen
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    throw new Error("Kein aktives Abonnement gefunden.");
  }

  const subscription = subscriptions.data[0];

  // Kündigung zum Ende der Laufzeit setzen (nicht sofort)
  const updated = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
  });

  const cancelAt = updated.cancel_at
    ? new Date(updated.cancel_at * 1000)
    : null;

  return { cancelAt };
}

/**
 * Erstattet den letzten Zahlungsbetrag (Widerruf innerhalb 14 Tage).
 * Kündigt das Abo sofort und setzt den Plan auf none zurück.
 */
export async function refundLastPayment(
  stripeCustomerId: string
): Promise<{ refundId: string; amount: number; currency: string }> {
  // Letzte erfolgreiche Zahlung des Kunden suchen
  const paymentIntents = await stripe.paymentIntents.list({
    customer: stripeCustomerId,
    limit: 5,
  });

  const lastSucceeded = paymentIntents.data.find(
    (pi) => pi.status === "succeeded"
  );

  if (!lastSucceeded) {
    throw new Error("Keine erstattungsfähige Zahlung gefunden.");
  }

  // Erstattung erstellen
  const refund = await stripe.refunds.create({
    payment_intent: lastSucceeded.id,
    reason: "requested_by_customer",
  });

  // Alle aktiven Abonnements sofort kündigen
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 10,
  });

  for (const sub of subscriptions.data) {
    await stripe.subscriptions.cancel(sub.id);
  }

  return {
    refundId: refund.id,
    amount: refund.amount,
    currency: refund.currency,
  };
}

/**
 * Erstellt eine Stripe Customer Portal Session für Abo-Verwaltung.
 */
export async function createCustomerPortalSession(
  stripeCustomerId: string,
  origin: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });

  return session.url;
}
