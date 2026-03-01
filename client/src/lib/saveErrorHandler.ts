import { TRPCClientError } from "@trpc/client";

export type SaveErrorKind =
  | "limit_free"
  | "limit_plan"
  | "not_found"
  | "unauthorized"
  | "validation"
  | "network"
  | "unknown";

export interface SaveErrorInfo {
  kind: SaveErrorKind;
  title: string;
  description: string;
  /** Wenn true, soll der Nutzer zur Pricing-Seite weitergeleitet werden */
  redirectToPricing: boolean;
}

/**
 * Analysiert einen tRPC-Fehler beim Speichern einer Immobilie und gibt
 * eine strukturierte, nutzerfreundliche Fehlerbeschreibung zurück.
 */
export function parseImmobilienSaveError(err: unknown): SaveErrorInfo {
  // Netzwerkfehler (kein tRPC-Fehler)
  if (!(err instanceof TRPCClientError)) {
    return {
      kind: "network",
      title: "Verbindungsfehler",
      description:
        "Die Verbindung zum Server wurde unterbrochen. Bitte prüfe deine Internetverbindung und versuche es erneut.",
      redirectToPricing: false,
    };
  }

  const message = err.message ?? "";
  const code = err.data?.code ?? "";

  // Nicht eingeloggt
  if (code === "UNAUTHORIZED" || message.includes("Please login")) {
    return {
      kind: "unauthorized",
      title: "Nicht angemeldet",
      description:
        "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an, um Analysen zu speichern.",
      redirectToPricing: false,
    };
  }

  // Limit-Fehler: Free-Plan (1 Objekt)
  if (
    code === "FORBIDDEN" &&
    (message.includes("Free-Limit") || message.includes("1 Objekt"))
  ) {
    return {
      kind: "limit_free",
      title: "Speicher-Limit erreicht",
      description:
        "Im kostenlosen Plan kannst du 1 Immobilie speichern. Upgrade auf Basic (10 Objekte), Pro (50 Objekte) oder Investor (unbegrenzt).",
      redirectToPricing: true,
    };
  }

  // Limit-Fehler: Bezahlter Plan
  if (code === "FORBIDDEN" && message.includes("Limit erreicht")) {
    // Planname aus Fehlermeldung extrahieren, z.B. "Limit erreicht (10 Objekte)"
    const match = message.match(/\((\d+) Objekte?\)/);
    const limitHint = match ? ` (${match[1]} Objekte)` : "";
    return {
      kind: "limit_plan",
      title: `Plan-Limit erreicht${limitHint}`,
      description:
        "Du hast das Speicher-Limit deines aktuellen Plans erreicht. Upgrade auf Investor für unbegrenzte Analysen.",
      redirectToPricing: true,
    };
  }

  // Objekt nicht gefunden (beim Update)
  if (code === "NOT_FOUND") {
    return {
      kind: "not_found",
      title: "Immobilie nicht gefunden",
      description:
        "Diese Analyse existiert nicht mehr oder wurde bereits gelöscht. Bitte speichere sie als neue Analyse.",
      redirectToPricing: false,
    };
  }

  // Validierungsfehler (z.B. ungültige Werte)
  if (code === "BAD_REQUEST" || message.includes("invalid")) {
    return {
      kind: "validation",
      title: "Ungültige Eingabe",
      description:
        "Einige Felder enthalten ungültige Werte. Bitte prüfe deine Eingaben und versuche es erneut.",
      redirectToPricing: false,
    };
  }

  // Allgemeiner Serverfehler
  if (code === "INTERNAL_SERVER_ERROR") {
    return {
      kind: "unknown",
      title: "Serverfehler",
      description:
        "Beim Speichern ist ein unerwarteter Fehler aufgetreten. Bitte versuche es in wenigen Sekunden erneut.",
      redirectToPricing: false,
    };
  }

  // Fallback: Originale Fehlermeldung anzeigen
  return {
    kind: "unknown",
    title: "Speichern fehlgeschlagen",
    description: message || "Ein unbekannter Fehler ist aufgetreten.",
    redirectToPricing: false,
  };
}
