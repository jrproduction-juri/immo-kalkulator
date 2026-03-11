/**
 * Stripe Produkte und Preise für ImmoRenditeTool
 * 
 * Preisstruktur:
 * - Basic:    9€/Mo · 79€/Jahr · 149€ einmalig
 * - Pro:     19€/Mo · 149€/Jahr · 299€ einmalig
 * - Investor: 39€/Mo · 299€/Jahr · 499€ einmalig
 */

export type PlanId = "basic" | "pro" | "investor";
export type BillingType = "monthly" | "yearly" | "lifetime";

export interface PriceConfig {
  priceId: string; // Stripe Price ID (wird beim ersten Checkout erstellt)
  amount: number;  // in Cent
  interval?: "month" | "year";
  type: "recurring" | "one_time";
  billingType: BillingType;
}

export interface ProductConfig {
  planId: PlanId;
  name: string;
  description: string;
  prices: {
    monthly: PriceConfig;
    yearly: PriceConfig;
    lifetime: PriceConfig;
  };
}

// Stripe Price IDs werden zur Laufzeit über die Stripe API erstellt
// und dann im Speicher gecacht. Alternativ können sie im Stripe Dashboard
// manuell erstellt und hier als Konstanten eingetragen werden.
export const PRODUCTS: Record<PlanId, ProductConfig> = {
  basic: {
    planId: "basic",
    name: "ImmoRenditeTool Basic",
    description: "Grundlegende Immobilienanalyse für Einsteiger",
    prices: {
      monthly: {
        priceId: "", // wird dynamisch erstellt
        amount: 900, // 9,00 €
        interval: "month",
        type: "recurring",
        billingType: "monthly",
      },
      yearly: {
        priceId: "",
        amount: 7900, // 79,00 €
        interval: "year",
        type: "recurring",
        billingType: "yearly",
      },
      lifetime: {
        priceId: "",
        amount: 14900, // 149,00 €
        type: "one_time",
        billingType: "lifetime",
      },
    },
  },
  pro: {
    planId: "pro",
    name: "ImmoRenditeTool Pro",
    description: "Professionelle Analyse mit PDF-Reports und Steueroptimierung",
    prices: {
      monthly: {
        priceId: "",
        amount: 1900, // 19,00 €
        interval: "month",
        type: "recurring",
        billingType: "monthly",
      },
      yearly: {
        priceId: "",
        amount: 14900, // 149,00 €
        interval: "year",
        type: "recurring",
        billingType: "yearly",
      },
      lifetime: {
        priceId: "",
        amount: 29900, // 299,00 €
        type: "one_time",
        billingType: "lifetime",
      },
    },
  },
  investor: {
    planId: "investor",
    name: "ImmoRenditeTool Investor",
    description: "Vollständige Portfolio-Verwaltung für professionelle Investoren",
    prices: {
      monthly: {
        priceId: "",
        amount: 3900, // 39,00 €
        interval: "month",
        type: "recurring",
        billingType: "monthly",
      },
      yearly: {
        priceId: "",
        amount: 29900, // 299,00 €
        interval: "year",
        type: "recurring",
        billingType: "yearly",
      },
      lifetime: {
        priceId: "",
        amount: 49900, // 499,00 €
        type: "one_time",
        billingType: "lifetime",
      },
    },
  },
};

/**
 * Gibt den Plan-Namen aus einer Stripe Price ID zurück.
 * Wird im Webhook verwendet, um den Plan des Nutzers zu aktualisieren.
 */
export function getPlanFromPriceId(priceId: string): { plan: PlanId; billingType: BillingType } | null {
  for (const [planId, product] of Object.entries(PRODUCTS)) {
    for (const [billingType, price] of Object.entries(product.prices)) {
      if (price.priceId === priceId) {
        return { plan: planId as PlanId, billingType: billingType as BillingType };
      }
    }
  }
  return null;
}
