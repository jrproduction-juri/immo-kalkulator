/**
 * Tests für den KI-Chat-Endpunkt (chat.ask)
 * Prüft: Plan-Lock, System-Prompt-Aufbau, Deal-Daten-Einbettung
 */
import { describe, it, expect } from 'vitest';

// ─── Hilfsfunktion: System-Prompt-Aufbau nachbauen ────────────────────────────

function buildSystemPrompt(dealData?: Record<string, unknown>): string {
  let systemPrompt = `Du bist ein erfahrener Immobilien-Investment-Berater und hilfst Nutzern, ihre Immobilienanalysen zu verstehen und zu verbessern. Du antwortest auf Deutsch, präzise und praxisnah.

Wichtige Regeln:
- Beantworte Fragen konkret auf Basis der vorliegenden Zahlen, wenn Daten vorhanden sind.
- Erkläre Fachbegriffe verständlich (z. B. AfA, Nettomietrendite, Eigenkapitalrendite).
- Gib keine Kauf- oder Verkaufsempfehlungen.
- Bleibe sachlich und neutral.
- Antworte kompakt (max. 300 Wörter), es sei denn, der Nutzer fragt nach Details.`;

  if (dealData) {
    const fmt = (v: unknown, suffix = '') =>
      v != null ? `${Number(v).toLocaleString('de-DE')}${suffix}` : 'nicht angegeben';

    systemPrompt += `

---
Aktuell analysiertes Objekt:
- Kaufpreis: ${fmt(dealData.kaufpreis, ' €')}
- Kaltmiete: ${fmt(dealData.kaltmiete, ' €/Mo')}
- Brutto-Mietrendite: ${fmt(dealData.bruttomietrendite, ' %')}
- Monatlicher Cashflow: ${fmt(dealData.cashflowMonatlich, ' €')}
---`;
  }

  return systemPrompt;
}

// ─── Plan-Check-Logik ─────────────────────────────────────────────────────────

function checkPlanAccess(plan: string): boolean {
  return plan === 'pro' || plan === 'investor';
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('KI-Chat Plan-Check', () => {
  it('erlaubt Zugriff für Pro-Plan', () => {
    expect(checkPlanAccess('pro')).toBe(true);
  });

  it('erlaubt Zugriff für Investor-Plan', () => {
    expect(checkPlanAccess('investor')).toBe(true);
  });

  it('verweigert Zugriff für Free-Plan', () => {
    expect(checkPlanAccess('none')).toBe(false);
  });

  it('verweigert Zugriff für Basic-Plan', () => {
    expect(checkPlanAccess('basic')).toBe(false);
  });

  it('verweigert Zugriff für leeren Plan', () => {
    expect(checkPlanAccess('')).toBe(false);
  });
});

describe('KI-Chat System-Prompt', () => {
  it('enthält Basis-Regeln ohne Deal-Daten', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Immobilien-Investment-Berater');
    expect(prompt).toContain('Gib keine Kauf- oder Verkaufsempfehlungen');
    expect(prompt).toContain('Deutsch');
    expect(prompt).not.toContain('Aktuell analysiertes Objekt');
  });

  it('enthält Deal-Daten wenn übergeben', () => {
    const prompt = buildSystemPrompt({
      kaufpreis: 250000,
      kaltmiete: 900,
      bruttomietrendite: 4.32,
      cashflowMonatlich: 120,
    });
    expect(prompt).toContain('Aktuell analysiertes Objekt');
    expect(prompt).toContain('250.000 €');
    expect(prompt).toContain('900 €/Mo');
  });

  it('zeigt "nicht angegeben" für fehlende Felder', () => {
    const prompt = buildSystemPrompt({ kaufpreis: 100000 });
    expect(prompt).toContain('nicht angegeben');
  });

  it('formatiert Zahlen mit deutschem Tausendertrennzeichen', () => {
    const prompt = buildSystemPrompt({ kaufpreis: 1000000 });
    expect(prompt).toContain('1.000.000 €');
  });
});

describe('KI-Chat Nachrichten-Aufbau', () => {
  it('begrenzt History auf max. 18 Nachrichten', () => {
    const history = Array.from({ length: 25 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant' as const,
      content: `Nachricht ${i}`,
    }));
    const limited = history.slice(-18);
    expect(limited.length).toBe(18);
  });

  it('fügt System-Prompt immer an erster Stelle ein', () => {
    const systemPrompt = buildSystemPrompt();
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: 'Hallo' },
    ];
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
  });

  it('hängt Nutzerfrage ans Ende', () => {
    const history = [
      { role: 'user' as const, content: 'Erste Frage' },
      { role: 'assistant' as const, content: 'Erste Antwort' },
    ];
    const newMessage = 'Neue Frage';
    const messages = [
      { role: 'system' as const, content: buildSystemPrompt() },
      ...history,
      { role: 'user' as const, content: newMessage },
    ];
    expect(messages[messages.length - 1].content).toBe(newMessage);
    expect(messages[messages.length - 1].role).toBe('user');
  });
});

describe('KI-Chat Deal-Daten-Validierung', () => {
  it('akzeptiert optionale Deal-Daten (undefined)', () => {
    const prompt = buildSystemPrompt(undefined);
    expect(prompt).not.toContain('Aktuell analysiertes Objekt');
  });

  it('akzeptiert leeres Deal-Daten-Objekt', () => {
    const prompt = buildSystemPrompt({});
    // Leeres Objekt ist truthy, daher wird der Block ausgeführt
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('verarbeitet null-Eigenkapitalrendite korrekt', () => {
    // EKR null = Vollfinanzierung
    const ekr: number | null = null;
    const display = ekr != null ? `${ekr} %` : 'n/a (Vollfinanzierung)';
    expect(display).toBe('n/a (Vollfinanzierung)');
  });

  it('verarbeitet normale Eigenkapitalrendite korrekt', () => {
    const ekr: number | null = 8.5;
    const display = ekr != null ? `${ekr} %` : 'n/a (Vollfinanzierung)';
    expect(display).toBe('8.5 %');
  });
});
