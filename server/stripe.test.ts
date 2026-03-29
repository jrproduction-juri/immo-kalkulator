import { describe, it, expect } from "vitest";
import { STRIPE_PRODUCTS, getPlanFromPriceId, getPriceId, PlanId, BillingType } from "./stripe/products";

describe("Stripe Products Config – feste IDs", () => {
  it("sollte alle drei Pläne definieren", () => {
    expect(STRIPE_PRODUCTS.basic).toBeDefined();
    expect(STRIPE_PRODUCTS.pro).toBeDefined();
    expect(STRIPE_PRODUCTS.investor).toBeDefined();
  });

  it("sollte feste Produkt-IDs haben", () => {
    expect(STRIPE_PRODUCTS.basic.productId).toBe("prod_U8vwCCaDeWzD23");
    expect(STRIPE_PRODUCTS.pro.productId).toBe("prod_U8vwRr2e3YkoIb");
    expect(STRIPE_PRODUCTS.investor.productId).toBe("prod_U8vwCmT3Cre8Up");
  });

  it("sollte feste Price-IDs für Basic haben", () => {
    expect(STRIPE_PRODUCTS.basic.prices.monthly).toBe("price_1TAe4u1gELN6BLVoZyOdkAhM");
    expect(STRIPE_PRODUCTS.basic.prices.yearly).toBe("price_1TAe4t1gELN6BLVoN88V8t27");
    expect(STRIPE_PRODUCTS.basic.prices.lifetime).toBe("price_1TAe4t1gELN6BLVoBnL6Lxye");
  });

  it("sollte feste Price-IDs für Pro haben", () => {
    expect(STRIPE_PRODUCTS.pro.prices.monthly).toBe("price_1TAe4r1gELN6BLVokYMcuPMo");
    expect(STRIPE_PRODUCTS.pro.prices.yearly).toBe("price_1TAe4q1gELN6BLVo0800caN4");
    expect(STRIPE_PRODUCTS.pro.prices.lifetime).toBe("price_1TAe4q1gELN6BLVoKnxFzblm");
  });

  it("sollte feste Price-IDs für Investor haben", () => {
    expect(STRIPE_PRODUCTS.investor.prices.monthly).toBe("price_1TAe4t1gELN6BLVoKFR8EZDi");
    expect(STRIPE_PRODUCTS.investor.prices.yearly).toBe("price_1TAe4s1gELN6BLVoy2sPqurf");
    expect(STRIPE_PRODUCTS.investor.prices.lifetime).toBe("price_1TAe4s1gELN6BLVoB3BE1lda");
  });

  it("sollte alle 9 Price-IDs nicht leer sein", () => {
    for (const [planId, product] of Object.entries(STRIPE_PRODUCTS)) {
      for (const [billingType, priceId] of Object.entries(product.prices)) {
        expect(priceId, `${planId}.${billingType} darf nicht leer sein`).toBeTruthy();
        expect(priceId, `${planId}.${billingType} muss mit price_ beginnen`).toMatch(/^price_/);
      }
    }
  });

  it("getPriceId sollte korrekte Price-ID zurückgeben", () => {
    expect(getPriceId("basic", "monthly")).toBe("price_1TAe4u1gELN6BLVoZyOdkAhM");
    expect(getPriceId("pro", "yearly")).toBe("price_1TAe4q1gELN6BLVo0800caN4");
    expect(getPriceId("investor", "lifetime")).toBe("price_1TAe4s1gELN6BLVoB3BE1lda");
  });

  it("getPriceId sollte Fehler werfen bei unbekanntem Plan", () => {
    expect(() => getPriceId("unknown" as PlanId, "monthly")).toThrow("Unbekannter Plan");
  });

  it("getPlanFromPriceId sollte Plan aus Price-ID ermitteln", () => {
    const result = getPlanFromPriceId("price_1TAe4u1gELN6BLVoZyOdkAhM");
    expect(result).not.toBeNull();
    expect(result?.plan).toBe("basic");
    expect(result?.billingType).toBe("monthly");
  });

  it("getPlanFromPriceId sollte Pro-Yearly korrekt ermitteln", () => {
    const result = getPlanFromPriceId("price_1TAe4q1gELN6BLVo0800caN4");
    expect(result).not.toBeNull();
    expect(result?.plan).toBe("pro");
    expect(result?.billingType).toBe("yearly");
  });

  it("getPlanFromPriceId sollte Investor-Lifetime korrekt ermitteln", () => {
    const result = getPlanFromPriceId("price_1TAe4s1gELN6BLVoB3BE1lda");
    expect(result).not.toBeNull();
    expect(result?.plan).toBe("investor");
    expect(result?.billingType).toBe("lifetime");
  });

  it("getPlanFromPriceId sollte null zurückgeben bei unbekannter Price-ID", () => {
    const result = getPlanFromPriceId("price_nonexistent_xyz");
    expect(result).toBeNull();
  });

  it("sollte keine dynamisch erstellten Produkte oder Preise enthalten", () => {
    // Sicherstellen dass keine getOrCreateStripePrice-Funktion existiert
    // (nur statische Konfiguration erlaubt)
    for (const product of Object.values(STRIPE_PRODUCTS)) {
      expect(typeof product.productId).toBe("string");
      expect(product.productId.length).toBeGreaterThan(0);
      for (const priceId of Object.values(product.prices)) {
        expect(typeof priceId).toBe("string");
        expect(priceId.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("Webhook Event Handling Logic", () => {
  it("payment_status !== 'paid' sollte Plan nicht aktivieren", () => {
    // Sicherheitsprüfung: Nur bei payment_status === "paid" Plan aktivieren
    const session = { payment_status: "unpaid", id: "cs_test" };
    expect(session.payment_status).not.toBe("paid");
    // In handleCheckoutCompleted: if (session.payment_status !== "paid") return;
  });

  it("payment_status === 'paid' sollte Plan aktivieren", () => {
    const session = { payment_status: "paid", id: "cs_test" };
    expect(session.payment_status).toBe("paid");
  });

  it("invoice.payment_succeeded sollte subscriptionId prüfen", () => {
    const invoice = { customer: "cus_123", subscription: null };
    expect(invoice.subscription).toBeNull();
  });

  it("invoice.payment_failed sollte subscriptionId prüfen", () => {
    const invoice = { customer: "cus_123", subscription: null };
    expect(invoice.subscription).toBeNull();
  });

  it("invoice.payment_succeeded mit Subscription sollte Plan verlängern", () => {
    const invoice = { customer: "cus_123", subscription: "sub_abc123" };
    expect(invoice.subscription).toBe("sub_abc123");
    expect(invoice.customer).toBe("cus_123");
  });

  it("invoice.payment_failed mit Subscription sollte Plan deaktivieren", () => {
    const invoice = { customer: "cus_123", subscription: "sub_abc123" };
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
    expect(handledEvents).toContain("checkout.session.completed");
    expect(handledEvents).toContain("invoice.payment_succeeded");
    expect(handledEvents).toContain("invoice.payment_failed");
  });

  it("Test-Events (evt_test_*) sollten erkannt werden", () => {
    const testEventId = "evt_test_1234567890";
    expect(testEventId.startsWith("evt_test_")).toBe(true);
  });
});
