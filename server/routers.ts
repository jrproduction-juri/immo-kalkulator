import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
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
  none: 0,   // Free: kein Speichern erlaubt
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

  // ─── PLZ-Mietpreisempfehlung ─────────────────────────────────────────────
  plz: router({
    getMietempfehlung: publicProcedure
      .input(z.object({
        plz: z.string().min(4).max(6),
        wohnflaeche: z.number().positive().optional(),
      }))
      .query(async ({ input }) => {
        const { plz, wohnflaeche = 70 } = input;
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `Du bist ein Immobilien-Experte für den deutschen Markt. 
Antworte NUR mit einem validen JSON-Objekt, ohne Markdown, ohne Codeblöcke.
Format: {"ort": "Stadtname", "bundesland": "Bundesland", "mietpreisProQm": 10.5, "quelle": "Marktdaten 2024", "preisspanne": {"min": 8.0, "max": 13.0}}`,
              },
              {
                role: "user",
                content: `Gib mir den durchschnittlichen Nettokaltmietpreis pro m² für die deutsche Postleitzahl ${plz}. Nutze aktuelle Marktdaten (2023/2024). Antworte nur mit dem JSON-Objekt.`,
              },
            ],
          });

          const rawContent = response.choices?.[0]?.message?.content ?? "";
          const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
          // JSON extrahieren (auch wenn Markdown-Codeblock vorhanden)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("Kein JSON in Antwort");
          const data = JSON.parse(jsonMatch[0]);

          const mietpreisProQm = Number(data.mietpreisProQm);
          if (!mietpreisProQm || mietpreisProQm <= 0) throw new Error("Ungültiger Mietpreis");

          const empfohleneKaltmiete = Math.round(mietpreisProQm * wohnflaeche);

          return {
            plz,
            ort: data.ort ?? "Unbekannt",
            bundesland: data.bundesland ?? "",
            mietpreisProQm: Math.round(mietpreisProQm * 100) / 100,
            empfohleneKaltmiete,
            preisspanne: data.preisspanne ?? null,
            quelle: data.quelle ?? "KI-Marktdaten",
          };
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "PLZ-Abfrage fehlgeschlagen. Bitte erneut versuchen.",
          });
        }
      }),
  }),

  // ─── Exposé-KI-Extraktion ─────────────────────────────────────────────────
  expose: router({
    extractData: publicProcedure
      .input(z.object({
        fileUrl: z.string().url(),
        mimeType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
      }))
      .mutation(async ({ input }) => {
        const { fileUrl, mimeType } = input;

        const isImage = mimeType.startsWith("image/");
        const isPdf = mimeType === "application/pdf";

        const messages: any[] = [
          {
            role: "system",
            content: `Du bist ein KI-Assistent der Immobilien-Exposés analysiert und strukturierte Daten extrahiert.
Antworte NUR mit einem validen JSON-Objekt ohne Markdown oder Codeblöcke.
Format: {
  "kaufpreis": number | null,
  "wohnflaeche": number | null,
  "zimmeranzahl": number | null,
  "baujahr": number | null,
  "hausgeld": number | null,
  "kaltmiete": number | null,
  "adresse": string | null,
  "ort": string | null,
  "plz": string | null,
  "energieklasse": string | null,
  "stellplaetze": number | null,
  "grundstueckFlaeche": number | null,
  "beschreibung": string | null
}`,
          },
        ];

        if (isImage) {
          messages.push({
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: fileUrl, detail: "high" },
              },
              {
                type: "text",
                text: "Analysiere dieses Immobilien-Exposé und extrahiere alle verfügbaren Daten als JSON.",
              },
            ],
          });
        } else if (isPdf) {
          messages.push({
            role: "user",
            content: [
              {
                type: "file_url",
                file_url: { url: fileUrl, mime_type: "application/pdf" },
              },
              {
                type: "text",
                text: "Analysiere dieses Immobilien-Exposé (PDF) und extrahiere alle verfügbaren Daten als JSON.",
              },
            ],
          });
        } else {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nicht unterstütztes Format" });
        }

        try {
          const response = await invokeLLM({ messages });
          const rawContent2 = response.choices?.[0]?.message?.content ?? "";
          const content = typeof rawContent2 === "string" ? rawContent2 : JSON.stringify(rawContent2);
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("Kein JSON");
          const data = JSON.parse(jsonMatch[0]);
          return { success: true, data };
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Exposé-Analyse fehlgeschlagen. Bitte erneut versuchen.",
          });
        }
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
        const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? 0;
        if (count >= limit) {
          const msg = plan === "none"
            ? "Speichern nicht verfügbar. Upgrade auf Basic oder höher um Immobilien zu speichern."
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
