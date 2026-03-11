import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  countImmobilienByUser,
  createImmobilie,
  deleteImmobilie,
  getImmobilieById,
  getImmobilienByUser,
  updateImmobilie,
  updateUserPlan,
} from "./db";
import { createCheckoutSession, createCustomerPortalSession, getOrCreateStripeCustomer } from "./stripe/stripeService";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const PLAN_LIMITS = {
  none: 1,   // Free: 1 Objekt speichern
  basic: 10,
  pro: 50,
  investor: 999999,
};

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  plan: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      // Kein Trial mehr – plan ist direkt der aktive Plan
      const immobilienCount = await countImmobilienByUser(user.id);
      return {
        plan: user.plan,
        isExpired: false,
        planExpiresAt: user.planExpiresAt ?? null,
        immobilienCount,
        user,
      };
    }),

    upgrade: protectedProcedure
      .input(z.object({
        plan: z.enum(["basic", "pro", "investor"]),
        billingType: z.enum(["once", "monthly", "yearly"]).default("once"),
      }))
      .mutation(async ({ ctx, input }) => {
        let planExpiresAt: Date | null = null;
        if (input.billingType === "monthly") {
          planExpiresAt = new Date();
          planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);
        } else if (input.billingType === "yearly") {
          planExpiresAt = new Date();
          planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);
        }
        await updateUserPlan(ctx.user.id, input.plan, { planExpiresAt });
        return { success: true, plan: input.plan };
      }),

    // Trial entfernt – keine kostenlose Testversion mehr

    checkout: protectedProcedure
      .input(z.object({
        planId: z.enum(["basic", "pro", "investor"]),
        billingType: z.enum(["monthly", "yearly", "lifetime"]),
        origin: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        const checkoutUrl = await createCheckoutSession({
          userId: user.id,
          email: user.email ?? "",
          name: user.name ?? undefined,
          stripeCustomerId: user.stripeCustomerId ?? null,
          planId: input.planId,
          billingType: input.billingType,
          origin: input.origin,
        });

        // Stripe Customer ID sofort speichern (falls neu erstellt)
        const db = await getDb();
        if (db && !user.stripeCustomerId) {
          const customerId = await getOrCreateStripeCustomer(user.id, user.email ?? "", user.name ?? undefined, null);
          await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
        }

        return { checkoutUrl };
      }),

    portal: protectedProcedure
      .input(z.object({ origin: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user.stripeCustomerId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Kein aktives Abonnement gefunden." });
        }
        const portalUrl = await createCustomerPortalSession(user.stripeCustomerId, input.origin);
        return { portalUrl };
      }),
  }),

  immobilien: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.plan === "none") return [];
      return getImmobilienByUser(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const item = await getImmobilieById(input.id, ctx.user.id);
        if (!item) throw new TRPCError({ code: "NOT_FOUND" });
        return item;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        art: z.enum(["etw", "mfh", "efh", "gewerbe", "neubau"]).default("etw"),
        standort: z.string().optional(),
        eingaben: z.record(z.string(), z.unknown()),
        ergebnisse: z.record(z.string(), z.unknown()).optional(),
        szenarien: z.record(z.string(), z.unknown()).optional(),
        notizen: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const plan = ctx.user.plan;
        const count = await countImmobilienByUser(ctx.user.id);
        const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? 1;
        if (count >= limit) {
          const msg = plan === "none"
            ? "Free-Limit erreicht (1 Objekt). Upgrade für mehr Speicherplätze."
            : `Limit erreicht (${limit} Objekte). Upgrade auf Investor für unbegrenzte Speicherung.`;
          throw new TRPCError({ code: "FORBIDDEN", message: msg });
        }
        await createImmobilie({
          userId: ctx.user.id,
          name: input.name,
          art: input.art,
          standort: input.standort ?? null,
          eingaben: input.eingaben,
          ergebnisse: input.ergebnisse ?? null,
          szenarien: input.szenarien ?? null,
          notizen: input.notizen ?? null,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        art: z.enum(["etw", "mfh", "efh", "gewerbe", "neubau"]).optional(),
        standort: z.string().optional(),
        eingaben: z.record(z.string(), z.unknown()).optional(),
        ergebnisse: z.record(z.string(), z.unknown()).optional(),
        szenarien: z.record(z.string(), z.unknown()).optional(),
        notizen: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const existing = await getImmobilieById(id, ctx.user.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        await updateImmobilie(id, ctx.user.id, data as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getImmobilieById(input.id, ctx.user.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        await deleteImmobilie(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
