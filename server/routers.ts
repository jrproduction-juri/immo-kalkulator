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
import { createCheckoutSession, createCustomerPortalSession, cancelSubscription, refundLastPayment } from "./stripe/stripeService";
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
        const { url } = await createCheckoutSession({
          userId: user.id,
          email: user.email ?? "",
          name: user.name ?? undefined,
          stripeCustomerId: user.stripeCustomerId ?? null,
          planId: input.planId,
          billingType: input.billingType,
          origin: input.origin,
        });

        return { url };
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

    // ─── Abo kündigen (zum Ende der Laufzeit) ─────────────────────────────────────
    cancel: protectedProcedure
      .mutation(async ({ ctx }) => {
        const user = ctx.user;

        // Nur für Nutzer mit aktivem Abo (nicht none)
        if (user.plan === "none") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Kein aktiver Plan zum Kündigen." });
        }

        // Lifetime-Pläne haben kein Abo – nur DB-Plan entfernen
        if (!user.stripeCustomerId) {
          await updateUserPlan(user.id, "none", { planExpiresAt: null });
          return { success: true, cancelAt: null, message: "Plan wurde deaktiviert." };
        }

        try {
          const { cancelAt } = await cancelSubscription(user.stripeCustomerId);
          // Ablaufdatum in DB speichern (Zugang bis dahin erhalten)
          if (cancelAt) {
            await updateUserPlan(user.id, user.plan, { planExpiresAt: cancelAt });
          }
          return {
            success: true,
            cancelAt: cancelAt?.toISOString() ?? null,
            message: cancelAt
              ? `Dein Abo läuft am ${cancelAt.toLocaleDateString("de-DE")} aus.`
              : "Abo wurde gekündigt.",
          };
        } catch (e: any) {
          // Kein Stripe-Abo (z.B. Lifetime) – Plan direkt deaktivieren
          if (e.message?.includes("Kein aktives Abonnement")) {
            await updateUserPlan(user.id, "none", { planExpiresAt: null });
            return { success: true, cancelAt: null, message: "Plan wurde deaktiviert." };
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e.message });
        }
      }),

    // ─── Widerruf (14-Tage-Rückgaberecht, sofortige Erstattung) ───────────────
    revoke: protectedProcedure
      .mutation(async ({ ctx }) => {
        const user = ctx.user;

        if (user.plan === "none") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Kein aktiver Plan zum Widerrufen." });
        }

        // 14-Tage-Frist prüfen
        const kaufDatum = user.planActivatedAt ? new Date(user.planActivatedAt) : null;
        if (kaufDatum) {
          const tageSeitKauf = Math.floor((Date.now() - kaufDatum.getTime()) / (1000 * 60 * 60 * 24));
          if (tageSeitKauf > 14) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Die 14-tägige Widerrufsfrist ist abgelaufen (Kauf vor ${tageSeitKauf} Tagen).`,
            });
          }
        }

        if (!user.stripeCustomerId) {
          // Kein Stripe-Konto – Plan direkt zurücksetzen
          await updateUserPlan(user.id, "none", { planExpiresAt: null });
          return { success: true, refundId: null, amount: 0, message: "Plan wurde zurückgesetzt." };
        }

        try {
          const { refundId, amount, currency } = await refundLastPayment(user.stripeCustomerId);
          // Plan sofort auf none setzen
          await updateUserPlan(user.id, "none", { planExpiresAt: null });

          const betrag = (amount / 100).toFixed(2);
          return {
            success: true,
            refundId,
            amount,
            message: `Widerruf erfolgreich. ${betrag} ${currency.toUpperCase()} werden in 5–10 Werktagen erstattet.`,
          };
        } catch (e: any) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e.message });
        }
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

  // ─── Admin-Router ────────────────────────────────────────────────────────
  admin: router({
    // Alle Nutzer auflisten (nur Owner oder Admin)
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });
      const allUsers = await db.select().from(users).orderBy(users.createdAt);
      return { users: allUsers };
    }),

    // Plan eines Nutzers manuell ändern (Support-Funktion)
    changePlan: protectedProcedure
      .input(z.object({
        userId: z.number(),
        plan: z.enum(["none", "basic", "pro", "investor"]),
        billingType: z.enum(["monthly", "yearly", "lifetime"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Kein Zugriff" });
        }
        let planExpiresAt: Date | null = null;
        if (input.plan !== "none") {
          if (input.billingType === "monthly") {
            planExpiresAt = new Date();
            planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);
          } else if (input.billingType === "yearly") {
            planExpiresAt = new Date();
            planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);
          } else {
            // Lifetime: +100 Jahre
            planExpiresAt = new Date();
            planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 100);
          }
        }
        await updateUserPlan(input.userId, input.plan, { planExpiresAt });
        return { success: true };
      }),
  }),

  // ─── KI-Chat ─────────────────────────────────────────────────────────────
  chat: router({
    ask: protectedProcedure
      .input(z.object({
        message: z.string().min(1).max(2000),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).max(20).default([]),
        dealData: z.object({
          kaufpreis: z.number().optional(),
          kaltmiete: z.number().optional(),
          wohnflaeche: z.number().optional(),
          eigenkapital: z.number().optional(),
          kaufnebenkosten: z.number().optional(),
          kreditrate: z.number().optional(),
          zinssatz: z.number().optional(),
          tilgung: z.number().optional(),
          hausgeld: z.number().optional(),
          ruecklagen: z.number().optional(),
          steuersatz: z.number().optional(),
          baujahr: z.number().optional(),
          standort: z.string().optional(),
          // Berechnete Ergebnisse
          bruttomietrendite: z.number().optional(),
          nettomietrendite: z.number().optional(),
          cashflowMonatlich: z.number().optional(),
          cashflowJaehrlich: z.number().optional(),
          eigenkapitalrendite: z.number().nullable().optional(),
          gesamtinvestition: z.number().optional(),
          risikoScore: z.number().optional(),
          risikoLabel: z.string().optional(),
          investmentScore: z.number().optional(),
          investmentLabel: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Plan-Check: nur Pro und Investor
        const plan = ctx.user.plan ?? "none";
        if (plan !== "pro" && plan !== "investor") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Der KI-Chat ist ab dem Pro-Plan verfügbar.",
          });
        }

        // System-Prompt mit Deal-Daten aufbauen
        const d = input.dealData;
        let systemPrompt = `Du bist ein erfahrener Immobilien-Investment-Berater und hilfst Nutzern, ihre Immobilienanalysen zu verstehen und zu verbessern. Du antwortest auf Deutsch, präzise und praxisnah.

Wichtige Regeln:
- Beantworte Fragen konkret auf Basis der vorliegenden Zahlen, wenn Daten vorhanden sind.
- Erkläre Fachbegriffe verständlich (z. B. AfA, Nettomietrendite, Eigenkapitalrendite).
- Gib keine Kauf- oder Verkaufsempfehlungen.
- Bleibe sachlich und neutral.
- Antworte kompakt (max. 300 Wörter), es sei denn, der Nutzer fragt nach Details.`;

        if (d) {
          const fmt = (v: number | null | undefined, suffix = "") =>
            v != null ? `${v.toLocaleString("de-DE")}${suffix}` : "nicht angegeben";

          systemPrompt += `

---
Aktuell analysiertes Objekt:
- Kaufpreis: ${fmt(d.kaufpreis, " €")}
- Wohnfläche: ${fmt(d.wohnflaeche, " m²")}
- Kaltmiete: ${fmt(d.kaltmiete, " €/Mo")}
- Eigenkapital: ${fmt(d.eigenkapital, " €")}
- Gesamtinvestition: ${fmt(d.gesamtinvestition, " €")}
- Kaufnebenkosten: ${fmt(d.kaufnebenkosten, " €")}
- Kreditrate: ${fmt(d.kreditrate, " €/Mo")}
- Zinssatz: ${fmt(d.zinssatz, " %")}
- Tilgung: ${fmt(d.tilgung, " %")}
- Hausgeld: ${fmt(d.hausgeld, " €/Mo")}
- Rücklagen: ${fmt(d.ruecklagen, " €/Mo")}
- Steuersatz: ${fmt(d.steuersatz, " %")}
- Baujahr: ${d.baujahr ?? "nicht angegeben"}
- Standort/PLZ: ${d.standort ?? "nicht angegeben"}

Berechnete Kennzahlen:
- Brutto-Mietrendite: ${fmt(d.bruttomietrendite, " %")}
- Netto-Mietrendite: ${fmt(d.nettomietrendite, " %")}
- Monatlicher Cashflow: ${fmt(d.cashflowMonatlich, " €")}
- Jährlicher Cashflow: ${fmt(d.cashflowJaehrlich, " €")}
- Eigenkapitalrendite: ${d.eigenkapitalrendite != null ? fmt(d.eigenkapitalrendite, " %") : "n/a (Vollfinanzierung)"}
- Risiko-Score: ${d.risikoScore != null ? `${d.risikoScore.toFixed(1)} / 3 (${d.risikoLabel ?? ""})` : "nicht berechnet"}
- Investment-Score: ${d.investmentScore != null ? `${d.investmentScore} / 100 (${d.investmentLabel ?? ""})` : "nicht berechnet"}
---`;
        }

        // Nachrichten für LLM zusammenstellen
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: systemPrompt },
          ...input.history.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: input.message },
        ];

        try {
          const response = await invokeLLM({ messages });
          const rawContent = response.choices?.[0]?.message?.content ?? "";
          const answer = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
          return { answer };
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "KI-Antwort fehlgeschlagen. Bitte erneut versuchen.",
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
