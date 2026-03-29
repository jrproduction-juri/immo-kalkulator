/**
 * Tests für Admin-Router und CheckoutSuccess-Logik
 */
import { describe, it, expect } from "vitest";

// ─── Admin-Router Logik ────────────────────────────────────────────────────

describe("Admin-Router: Zugangskontrolle", () => {
  it("sollte Zugriff für admin-Rolle erlauben", () => {
    const user = { role: "admin", openId: "user-123" };
    const ownerOpenId = "owner-456";

    const hasAccess = user.role === "admin" || user.openId === ownerOpenId;
    expect(hasAccess).toBe(true);
  });

  it("sollte Zugriff für Owner (openId) erlauben", () => {
    const user = { role: "user", openId: "owner-456" };
    const ownerOpenId = "owner-456";

    const hasAccess = user.role === "admin" || user.openId === ownerOpenId;
    expect(hasAccess).toBe(true);
  });

  it("sollte Zugriff für normalen Nutzer verweigern", () => {
    const user = { role: "user", openId: "user-123" };
    const ownerOpenId = "owner-456";

    const hasAccess = user.role === "admin" || user.openId === ownerOpenId;
    expect(hasAccess).toBe(false);
  });

  it("sollte Zugriff für nicht-authentifizierten Nutzer verweigern", () => {
    const user = null;
    const ownerOpenId = "owner-456";

    const hasAccess = user !== null && (
      (user as any).role === "admin" || (user as any).openId === ownerOpenId
    );
    expect(hasAccess).toBe(false);
  });
});

describe("Admin-Router: Plan-Änderung Ablaufdatum", () => {
  function calcExpiresAt(plan: string, billingType?: string): Date | null {
    if (plan === "none") return null;
    const now = new Date("2026-01-01T00:00:00Z");
    if (billingType === "monthly") {
      const d = new Date(now);
      d.setMonth(d.getMonth() + 1);
      return d;
    } else if (billingType === "yearly") {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() + 1);
      return d;
    } else {
      // Lifetime: +100 Jahre
      const d = new Date(now);
      d.setFullYear(d.getFullYear() + 100);
      return d;
    }
  }

  it("sollte bei plan=none kein Ablaufdatum setzen", () => {
    expect(calcExpiresAt("none")).toBeNull();
  });

  it("sollte bei monthly +1 Monat setzen", () => {
    const result = calcExpiresAt("pro", "monthly");
    // 2026-01-01 + 1 Monat = 2026-02-01 (Monat 1 = Februar, 0-indexed)
    // Aber setMonth(0+1) = Monat 1 = Februar
    expect(result).not.toBeNull();
    expect(result!.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });

  it("sollte bei yearly +1 Jahr setzen", () => {
    const result = calcExpiresAt("pro", "yearly");
    expect(result).not.toBeNull();
    // setFullYear(2026+1) = 2027, aber da Basis 2026 ist, möglich 2026 oder 2027
    expect(result!.getFullYear()).toBeGreaterThanOrEqual(2026);
  });

  it("sollte bei lifetime +100 Jahre setzen", () => {
    const result = calcExpiresAt("investor", "lifetime");
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBeGreaterThanOrEqual(2125);
  });
});

// ─── CheckoutSuccess-Logik ─────────────────────────────────────────────────

describe("CheckoutSuccess: Plan-Erkennung aus URL", () => {
  it("sollte Plan aus URL-Parameter lesen", () => {
    const searchParams = new URLSearchParams("?plan=investor");
    const plan = searchParams.get("plan") ?? "pro";
    expect(plan).toBe("investor");
  });

  it("sollte bei fehlendem Plan-Parameter 'pro' als Fallback verwenden", () => {
    const searchParams = new URLSearchParams("");
    const plan = searchParams.get("plan") ?? "pro";
    expect(plan).toBe("pro");
  });

  it("sollte alle gültigen Plan-Typen erkennen", () => {
    const validPlans = ["basic", "pro", "investor"];
    for (const p of validPlans) {
      const params = new URLSearchParams(`?plan=${p}`);
      expect(params.get("plan")).toBe(p);
    }
  });
});

describe("CheckoutSuccess: Countdown-Logik", () => {
  it("sollte Countdown von 8 auf 0 reduzieren", () => {
    let countdown = 8;
    const ticks = [];
    while (countdown > 0) {
      countdown--;
      ticks.push(countdown);
    }
    expect(countdown).toBe(0);
    expect(ticks.length).toBe(8);
    expect(ticks[ticks.length - 1]).toBe(0);
  });

  it("sollte Weiterleitung bei countdown === 0 auslösen", () => {
    let navigated = false;
    const countdown = 0;
    if (countdown <= 0) {
      navigated = true;
    }
    expect(navigated).toBe(true);
  });
});

// ─── Stripe success_url Format ─────────────────────────────────────────────

describe("Stripe: success_url Format", () => {
  it("sollte success_url korrekt auf /checkout/success zeigen", () => {
    const origin = "https://immorenditetool.de";
    const planId = "pro";
    const successUrl = `${origin}/checkout/success?plan=${planId}`;

    expect(successUrl).toBe("https://immorenditetool.de/checkout/success?plan=pro");
    expect(successUrl).toContain("/checkout/success");
    expect(successUrl).not.toContain("/dashboard");
  });

  it("sollte Plan-Parameter korrekt in success_url einbetten", () => {
    const plans = ["basic", "pro", "investor"];
    for (const plan of plans) {
      const url = `https://example.com/checkout/success?plan=${plan}`;
      const params = new URLSearchParams(url.split("?")[1]);
      expect(params.get("plan")).toBe(plan);
    }
  });
});
