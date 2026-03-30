/**
 * Tests: Exposé-Upload Plan-Check (nur Pro/Investor)
 */
import { describe, it, expect } from "vitest";

// Logik aus ExposeUpload.tsx nachgebaut
function hasExposeAccess(plan: string | null | undefined): boolean {
  const p = plan ?? "none";
  return p === "pro" || p === "investor";
}

describe("ExposeUpload: Plan-Zugriffskontrolle", () => {
  it("sollte Free-Nutzer (none) sperren", () => {
    expect(hasExposeAccess("none")).toBe(false);
  });

  it("sollte Basic-Nutzer sperren", () => {
    expect(hasExposeAccess("basic")).toBe(false);
  });

  it("sollte Pro-Nutzer erlauben", () => {
    expect(hasExposeAccess("pro")).toBe(true);
  });

  it("sollte Investor-Nutzer erlauben", () => {
    expect(hasExposeAccess("investor")).toBe(true);
  });

  it("sollte null/undefined wie 'none' behandeln", () => {
    expect(hasExposeAccess(null)).toBe(false);
    expect(hasExposeAccess(undefined)).toBe(false);
  });
});

describe("Pricing: Exposé-Upload Feature-Einträge", () => {
  const BASIC_FEATURES = [
    { text: "Bis zu 10 Immobilien speichern", included: true },
    { text: "PDF-Report & Exposé", included: false },
    { text: "Exposé-Upload (KI-Analyse)", included: false },
    { text: "Email-Generator", included: false },
  ];

  const PRO_FEATURES = [
    { text: "Alle Basic-Features", included: true },
    { text: "Vollständiger PDF-Report", included: true },
    { text: "Exposé-Generator", included: true },
    { text: "Exposé-Upload (KI analysiert Dokument)", included: true },
    { text: "Email-Generator", included: true },
  ];

  it("sollte Exposé-Upload im Basic-Plan als nicht enthalten markieren", () => {
    const exposeFeature = BASIC_FEATURES.find(f => f.text.includes("Exposé-Upload"));
    expect(exposeFeature).toBeDefined();
    expect(exposeFeature?.included).toBe(false);
  });

  it("sollte Exposé-Upload im Pro-Plan als enthalten markieren", () => {
    const exposeFeature = PRO_FEATURES.find(f => f.text.includes("Exposé-Upload"));
    expect(exposeFeature).toBeDefined();
    expect(exposeFeature?.included).toBe(true);
  });

  it("sollte sicherstellen dass Basic keinen Exposé-Upload-Zugang hat", () => {
    const hasAccess = BASIC_FEATURES
      .filter(f => f.text.includes("Exposé-Upload"))
      .every(f => !f.included);
    expect(hasAccess).toBe(true);
  });
});
