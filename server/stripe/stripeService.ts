import Stripe from "stripe";
import { ENV } from "../_core/env";
import { PRODUCTS, PlanId, BillingType } from "./products";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
});

export { stripe };

/**
 * Erstellt oder holt einen Stripe-Kunden für einen Nutzer.
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
 * Erstellt oder holt eine Stripe Price ID für ein Produkt.
 * Erstellt das Produkt und den Preis in Stripe, falls noch nicht vorhanden.
 */
export async function getOrCreateStripePrice(
  planId: PlanId,
  billingType: BillingType
): Promise<string> {
  const product = PRODUCTS[planId];
  const priceConfig = product.prices[billingType];

  // Falls Price ID bereits gecacht, direkt zurückgeben
  if (priceConfig.priceId) {
    return priceConfig.priceId;
  }

  // Suche nach existierendem Produkt in Stripe
  const existingProducts = await stripe.products.search({
    query: `metadata['planId']:'${planId}'`,
  });

  let stripeProductId: string;

  if (existingProducts.data.length > 0) {
    stripeProductId = existingProducts.data[0].id;
  } else {
    // Erstelle neues Produkt
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: { planId },
    });
    stripeProductId = stripeProduct.id;
  }

  // Suche nach existierendem Preis
  const existingPrices = await stripe.prices.search({
    query: `product:'${stripeProductId}' AND metadata['billingType']:'${billingType}'`,
  });

  if (existingPrices.data.length > 0) {
    const existingPriceId = existingPrices.data[0].id;
    priceConfig.priceId = existingPriceId;
    return existingPriceId;
  }

  // Erstelle neuen Preis
  const priceData: Stripe.PriceCreateParams = {
    product: stripeProductId,
    unit_amount: priceConfig.amount,
    currency: "eur",
    metadata: { planId, billingType },
  };

  if (priceConfig.type === "recurring" && priceConfig.interval) {
    priceData.recurring = { interval: priceConfig.interval };
  }

  const stripePrice = await stripe.prices.create(priceData);
  priceConfig.priceId = stripePrice.id;
  return stripePrice.id;
}

/**
 * Erstellt eine Stripe Checkout Session für ein Abonnement oder Einmalkauf.
 */
export async function createCheckoutSession(params: {
  userId: number;
  email: string;
  name?: string;
  stripeCustomerId?: string | null;
  planId: PlanId;
  billingType: BillingType;
  origin: string;
}): Promise<string> {
  const { userId, email, name, stripeCustomerId, planId, billingType, origin } = params;

  const customerId = await getOrCreateStripeCustomer(userId, email, name, stripeCustomerId);
  const priceId = await getOrCreateStripePrice(planId, billingType);

  const product = PRODUCTS[planId];
  const priceConfig = product.prices[billingType];

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      customer_email: email,
      customer_name: name ?? "",
      plan_id: planId,
      billing_type: billingType,
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: priceConfig.type === "recurring" ? "subscription" : "payment",
    success_url: `${origin}/dashboard?checkout=success&plan=${planId}`,
    cancel_url: `${origin}/pricing?checkout=canceled`,
    allow_promotion_codes: true,
    locale: "de",
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error("Stripe Checkout Session URL konnte nicht erstellt werden");
  }

  return session.url;
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
