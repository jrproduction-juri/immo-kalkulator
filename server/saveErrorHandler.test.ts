/**
 * Tests für die parseImmobilienSaveError-Funktion
 * Stellt sicher, dass alle Fehlerfälle korrekt erkannt und übersetzt werden.
 */
import { describe, it, expect } from "vitest";
import { TRPCClientError } from "@trpc/client";
import { parseImmobilienSaveError, SaveErrorKind } from "../client/src/lib/saveErrorHandler";

/** Hilfsfunktion: Erstellt einen simulierten TRPCClientError */
function makeTRPCError(message: string, code: string): TRPCClientError<any> {
  const err = new TRPCClientError(message, {
    result: {
      error: {
        json: {
          message,
          code: -32600,
          data: { code, httpStatus: 400, path: "immobilien.create" },
        },
      },
    },
  });
  // data.code manuell setzen, da TRPCClientError es aus dem result-Shape liest
  (err as any).data = { code };
  return err;
}

describe("parseImmobilienSaveError", () => {
  it("erkennt Netzwerkfehler (kein TRPCClientError)", () => {
    const result = parseImmobilienSaveError(new Error("fetch failed"));
    expect(result.kind).toBe<SaveErrorKind>("network");
    expect(result.redirectToPricing).toBe(false);
    expect(result.title).toContain("Verbindung");
  });

  it("erkennt Netzwerkfehler bei null/undefined", () => {
    const result = parseImmobilienSaveError(null);
    expect(result.kind).toBe<SaveErrorKind>("network");
    expect(result.redirectToPricing).toBe(false);
  });

  it("erkennt Free-Limit-Fehler", () => {
    const err = makeTRPCError("Free-Limit erreicht (1 Objekt). Upgrade für mehr Speicherplätze.", "FORBIDDEN");
    const result = parseImmobilienSaveError(err);
    expect(result.kind).toBe<SaveErrorKind>("limit_free");
    expect(result.redirectToPricing).toBe(true);
    expect(result.description).toContain("1 Immobilie");
  });

  it("erkennt Plan-Limit-Fehler (Basic/Pro)", () => {
    const err = makeTRPCError("Limit erreicht (10 Objekte). Upgrade auf Investor für unbegrenzte Speicherung.", "FORBIDDEN");
    const result = parseImmobilienSaveError(err);
    expect(result.kind).toBe<SaveErrorKind>("limit_plan");
    expect(result.redirectToPricing).toBe(true);
    expect(result.title).toContain("10");
  });

  it("erkennt NOT_FOUND-Fehler beim Update", () => {
    const err = makeTRPCError("NOT_FOUND", "NOT_FOUND");
    const result = parseImmobilienSaveError(err);
    expect(result.kind).toBe<SaveErrorKind>("not_found");
    expect(result.redirectToPricing).toBe(false);
  });

  it("erkennt UNAUTHORIZED-Fehler", () => {
    const err = makeTRPCError("Please login (10001)", "UNAUTHORIZED");
    const result = parseImmobilienSaveError(err);
    expect(result.kind).toBe<SaveErrorKind>("unauthorized");
    expect(result.redirectToPricing).toBe(false);
    expect(result.title).toContain("angemeldet");
  });

  it("erkennt BAD_REQUEST-Validierungsfehler", () => {
    const err = makeTRPCError("invalid_value: expected one of etw|mfh", "BAD_REQUEST");
    const result = parseImmobilienSaveError(err);
    expect(result.kind).toBe<SaveErrorKind>("validation");
    expect(result.redirectToPricing).toBe(false);
  });

  it("erkennt INTERNAL_SERVER_ERROR", () => {
    const err = makeTRPCError("Internal server error", "INTERNAL_SERVER_ERROR");
    const result = parseImmobilienSaveError(err);
    expect(result.kind).toBe<SaveErrorKind>("unknown");
    expect(result.redirectToPricing).toBe(false);
    expect(result.title).toContain("Serverfehler");
  });

  it("gibt Fallback für unbekannte Fehler zurück", () => {
    const err = makeTRPCError("Something weird happened", "SOMETHING_UNKNOWN");
    const result = parseImmobilienSaveError(err);
    expect(result.kind).toBe<SaveErrorKind>("unknown");
    expect(result.description).toContain("Something weird happened");
  });
});
