/**
 * Stripe Produkte und Preise für ImmoRenditeTool
 *
 * WICHTIG: Diese IDs sind fest und dürfen nicht dynamisch erstellt werden.
 * Alle IDs stammen direkt aus dem Stripe Dashboard.
 *
 * Preisstruktur:
 * - Basic:    9€/Mo · 79€/Jahr · 149€ einmalig
 * - Pro:     19€/Mo · 149€/Jahr · 299€ einmalig
 * - Investor: 39€/Mo · 299€/Jahr · 499€ einmalig
 */

export type PlanId = "basic" | "pro" | "investor";
export type BillingType = "monthly" | "yearly" | "lifetime";

/**
 * Feste Stripe Produkt- und Price-IDs aus dem Stripe Dashboard.
 * Niemals dynamisch erstellen – nur diese IDs verwenden.
 */
export const STRIPE_PRODUCTS: Record<PlanId, {
  productId: string;
  prices: Record<BillingType, string>;
}> = {
  basic: {
    productId: "prod_U8vwCCaDeWzD23",
    prices: {
      monthly:  "price_1TAe4u1gELN6BLVoZyOdkAhM",
      yearly:   "price_1TAe4t1gELN6BLVoN88V8t27",
      lifetime: "price_1TAe4t1gELN6BLVoBnL6Lxye",
    },
  },
  pro: {
    productId: "prod_U8vwRr2e3YkoIb",
    prices: {
      monthly:  "price_1TAe4r1gELN6BLVokYMcuPMo",
      yearly:   "price_1TAe4q1gELN6BLVo0800caN4",
      lifetime: "price_1TAe4q1gELN6BLVoKnxFzblm",
    },
  },
  investor: {
    productId: "prod_U8vwCmT3Cre8Up",
    prices: {
      monthly:  "price_1TAe4t1gELN6BLVoKFR8EZDi",
      yearly:   "price_1TAe4s1gELN6BLVoy2sPqurf",
      lifetime: "price_1TAe4s1gELN6BLVoB3BE1lda",
    },
  },
};

/**
 * Gibt die Price ID für einen Plan und Abrechnungstyp zurück.
 * Wirft einen Fehler wenn Plan oder BillingType unbekannt.
 */
export function getPriceId(planId: PlanId, billingType: BillingType): string {
  const product = STRIPE_PRODUCTS[planId];
  if (!product) {
    throw new Error(`Unbekannter Plan: ${planId}`);
  }
  const priceId = product.prices[billingType];
  if (!priceId) {
    throw new Error(`Unbekannter Abrechnungstyp: ${billingType} für Plan ${planId}`);
  }
  return priceId;
}

/**
 * Gibt den Plan-Namen aus einer Stripe Price ID zurück.
 * Wird im Webhook verwendet, um den Plan des Nutzers zu aktualisieren.
 */
export function getPlanFromPriceId(priceId: string): { plan: PlanId; billingType: BillingType } | null {
  for (const [planId, product] of Object.entries(STRIPE_PRODUCTS)) {
    for (const [billingType, pid] of Object.entries(product.prices)) {
      if (pid === priceId) {
        return { plan: planId as PlanId, billingType: billingType as BillingType };
      }
    }
  }
  return null;
}
