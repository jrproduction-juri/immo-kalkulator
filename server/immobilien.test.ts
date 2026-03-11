import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    plan: "basic",
    planExpiresAt: null,
    trialStartedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("plan.get", () => {
  it("returns the user plan", async () => {
    const ctx = createUserContext({ plan: "pro" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.plan.get();
    expect(result.plan).toBe("pro");
    expect(result.user).toBeDefined();
  });

  it("returns none for user without plan", async () => {
    const ctx = createUserContext({ plan: "none" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.plan.get();
    expect(result.plan).toBe("none");
  });
});

describe("immobilien.list", () => {
  it("returns empty array for user with no plan", async () => {
    const ctx = createUserContext({ plan: "none" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.immobilien.list();
    expect(result).toEqual([]);
  });
});

describe("immobilien.create", () => {
  it("wirft FORBIDDEN wenn Free-Plan-Limit erreicht ist (Mock gibt count=1 zurück)", async () => {
    // Der DB-Mock gibt immer count=1 zurück, daher schlägt Free-Plan (Limit=1) fehl
    const ctx = createUserContext({ plan: "none" });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.immobilien.create({
        name: "Zweites Objekt Free",
        art: "etw",
        eingaben: { kaufpreis: 300000 },
      })
    ).rejects.toThrow("Free-Limit");
  });

  it("erlaubt Pro-Plan-Nutzer ein Objekt zu speichern", async () => {
    const ctx = createUserContext({ plan: "pro" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.immobilien.create({
      name: "Pro Objekt",
      art: "mfh",
      eingaben: { kaufpreis: 500000 },
    });
    expect(result.success).toBe(true);
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: string[] = [];
    const ctx = createUserContext();
    (ctx.res as any).clearCookie = (name: string) => clearedCookies.push(name);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});
