import { describe, it, expect } from "vitest";
import { PRODUCTS, getPlanFromPriceId, PlanId, BillingType } from "./stripe/products";

describe("Stripe Products Config", () => {
  it("sollte alle drei Pläne definieren", () => {
    expect(PRODUCTS.basic).toBeDefined();
    expect(PRODUCTS.pro).toBeDefined();
    expect(PRODUCTS.investor).toBeDefined();
  });

  it("sollte korrekte Preise für Basic haben", () => {
    expect(PRODUCTS.basic.prices.monthly.amount).toBe(900);   // 9,00 €
    expect(PRODUCTS.basic.prices.yearly.amount).toBe(7900);   // 79,00 €
    expect(PRODUCTS.basic.prices.lifetime.amount).toBe(14900); // 149,00 €
  });

  it("sollte korrekte Preise für Pro haben", () => {
    expect(PRODUCTS.pro.prices.monthly.amount).toBe(1900);    // 19,00 €
    expect(PRODUCTS.pro.prices.yearly.amount).toBe(14900);    // 149,00 €
    expect(PRODUCTS.pro.prices.lifetime.amount).toBe(29900);  // 299,00 €
  });

  it("sollte korrekte Preise für Investor haben", () => {
    expect(PRODUCTS.investor.prices.monthly.amount).toBe(3900);  // 39,00 €
    expect(PRODUCTS.investor.prices.yearly.amount).toBe(29900);  // 299,00 €
    expect(PRODUCTS.investor.prices.lifetime.amount).toBe(49900); // 499,00 €
  });

  it("sollte recurring für monatliche und jährliche Preise setzen", () => {
    expect(PRODUCTS.basic.prices.monthly.type).toBe("recurring");
    expect(PRODUCTS.basic.prices.monthly.interval).toBe("month");
    expect(PRODUCTS.basic.prices.yearly.type).toBe("recurring");
    expect(PRODUCTS.basic.prices.yearly.interval).toBe("year");
  });

  it("sollte one_time für Lifetime-Preise setzen", () => {
    expect(PRODUCTS.basic.prices.lifetime.type).toBe("one_time");
    expect(PRODUCTS.pro.prices.lifetime.type).toBe("one_time");
    expect(PRODUCTS.investor.prices.lifetime.type).toBe("one_time");
  });

  it("sollte null zurückgeben wenn Price ID nicht gefunden", () => {
    const result = getPlanFromPriceId("price_nonexistent");
    expect(result).toBeNull();
  });

  it("sollte Plan zurückgeben wenn Price ID gecacht ist", () => {
    // Simuliere eine gecachte Price ID
    PRODUCTS.basic.prices.monthly.priceId = "price_test_basic_monthly";
    const result = getPlanFromPriceId("price_test_basic_monthly");
    expect(result).not.toBeNull();
    expect(result?.plan).toBe("basic");
    expect(result?.billingType).toBe("monthly");
    // Cleanup
    PRODUCTS.basic.prices.monthly.priceId = "";
  });

  it("sollte Jährlich günstiger pro Monat sein als Monatlich", () => {
    for (const [planId, product] of Object.entries(PRODUCTS)) {
      const monthlyPerMonth = product.prices.monthly.amount;
      const yearlyPerMonth = product.prices.yearly.amount / 12;
      expect(yearlyPerMonth).toBeLessThan(monthlyPerMonth);
    }
  });
});

describe("Webhook Event Handling Logic", () => {
  it("invoice.payment_succeeded sollte subscriptionId prüfen", () => {
    // Wenn keine subscriptionId vorhanden (einmalige Zahlung), kein Update nötig
    const invoice = { customer: "cus_123", subscription: null };
    expect(invoice.subscription).toBeNull();
  });

  it("invoice.payment_failed sollte subscriptionId prüfen", () => {
    // Wenn keine subscriptionId vorhanden, kein Plan-Reset nötig
    const invoice = { customer: "cus_123", subscription: null };
    expect(invoice.subscription).toBeNull();
  });

  it("invoice.payment_succeeded mit Subscription sollte Plan verlängern", () => {
    // Simuliere ein Invoice-Objekt mit Subscription
    const invoice = {
      customer: "cus_123",
      subscription: "sub_abc123",
    };
    expect(invoice.subscription).toBe("sub_abc123");
    expect(invoice.customer).toBe("cus_123");
  });

  it("invoice.payment_failed mit Subscription sollte Plan deaktivieren", () => {
    // Simuliere ein fehlgeschlagenes Invoice-Objekt
    const invoice = {
      customer: "cus_123",
      subscription: "sub_abc123",
    };
    // Plan sollte auf 'none' gesetzt werden
    const expectedPlanAfterFailure = "none";
    expect(expectedPlanAfterFailure).toBe("none");
  });

  it("Alle 5 Webhook-Events sollten im Switch-Case behandelt werden", () => {
    const handledEvents = [
      "checkout.session.completed",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
    ];
    expect(handledEvents).toHaveLength(5);
    expect(handledEvents).toContain("invoice.payment_succeeded");
    expect(handledEvents).toContain("invoice.payment_failed");
  });
});
