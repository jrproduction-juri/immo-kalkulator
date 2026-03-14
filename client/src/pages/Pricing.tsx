import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Building2, CheckCircle2, X, ArrowLeft, Zap, Star, Infinity } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

type BillingType = "once" | "monthly" | "yearly";
type PaidPlanId = "basic" | "pro" | "investor";

/* ─── Stripe Payment-Links ──────────────────────────────────────────── */
const STRIPE_LINKS: Record<PaidPlanId, Record<BillingType, string>> = {
  basic: {
    monthly: "https://buy.stripe.com/6oU00beNmfR403P7Zj87K02",
    yearly:  "https://buy.stripe.com/dRm5kvfRq8oC5o93J387K03",
    once:    "https://buy.stripe.com/6oUfZ9cFeawK3g1gvP87K04",
  },
  pro: {
    monthly: "https://buy.stripe.com/6oUbIT48IdIWcQBcfz87K05",
    yearly:  "https://buy.stripe.com/5kQcMXbBaawK8AlfrL87K06",
    once:    "https://buy.stripe.com/dRm6ozeNm6gu7whbbv87K07",
  },
  investor: {
    monthly: "https://buy.stripe.com/4gM5kv5cM5cqdUFenH87K08",
    yearly:  "https://buy.stripe.com/14A4gr6gQ20eaIt7Zj87K09",
    once:    "https://buy.stripe.com/3cI9AL8oYdIW03P3J387K0a",
  },
};

/* ─── Free Plan ─────────────────────────────────────────────────────── */
const FREE_PLAN = {
  name: "Free",
  priceLabel: "0 €",
  billing: "Dauerhaft kostenlos",
  desc: "Schnelle Ersteinschätzung ohne Registrierung",
  features: [
    { text: "Bruttomietrendite berechnen", included: true },
    { text: "Netto-Cashflow (vereinfacht)", included: true },
    { text: "Basis-Empfehlung (sinnvoll / prüfen / kritisch)", included: true },
    { text: "Immobilien speichern", included: false },
    { text: "Erweiterte Kennzahlen (EK-Rendite, AfA …)", included: false },
    { text: "PDF-Export & Excel-Export", included: false },
    { text: "Szenarien & Vergleich", included: false },
    { text: "Investment-Report", included: false },
  ],
};

/* ─── Paid Plans ────────────────────────────────────────────────────── */
/**
 * Preislogik:
 *   Monatlich  = günstigster Einstieg, volle Flexibilität
 *   Jährlich   = Rabatt ggü. monatlich, ~2 Monate geschenkt
 *   Einmalig   = Lifetime-Zugang, einmaliger Höchstpreis
 *
 * Monatlich < Jährlich < Einmalig (in absoluten Zahlen)
 * Monatlich > Jährlich / 12  (pro Monat gerechnet)
 */
const PAID_PLANS: Array<{
  id: PaidPlanId;
  name: string;
  monthly: number;        // €/Monat
  yearly: number;         // €/Jahr
  once: number;           // € Lifetime
  savingsYearly: string;  // Ersparnis ggü. monatlich
  desc: string;
  highlight: boolean;
  badge: string | null;
  features: { text: string; included: boolean }[];
}> = [
  {
    id: "basic",
    name: "Basic",
    monthly: 9,
    yearly: 79,
    once: 149,
    savingsYearly: "26 % sparen",
    desc: "Für Einsteiger und gelegentliche Analysen",
    highlight: false,
    badge: null,
    features: [
      { text: "Bis zu 10 Immobilien speichern", included: true },
      { text: "Bruttomietrendite & Netto-Cashflow", included: true },
      { text: "Eigenkapitalrendite", included: true },
      { text: "AfA & vereinfachte Steuer", included: true },
      { text: "Buy & Hold Szenario", included: true },
      { text: "Erweiterte Szenarien", included: false },
      { text: "PDF-Report & Exposé", included: false },
      { text: "Email-Generator", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 19,
    yearly: 149,
    once: 299,
    savingsYearly: "35 % sparen",
    desc: "Für aktive Investoren mit mehreren Objekten",
    highlight: true,
    badge: "BELIEBTESTE WAHL",
    features: [
      { text: "Alle Basic-Features", included: true },
      { text: "Bis zu 50 Immobilien", included: true },
      { text: "Sanieren & Verkaufen Szenario", included: true },
      { text: "10 Jahre Vermietung Szenario", included: true },
      { text: "Eigennutzung 24 Monate & steuerfrei", included: true },
      { text: "Vollständiger PDF-Report", included: true },
      { text: "Exposé-Generator", included: true },
      { text: "Email-Generator", included: true },
    ],
  },
  {
    id: "investor",
    name: "Investor",
    monthly: 39,
    yearly: 299,
    once: 499,
    savingsYearly: "36 % sparen",
    desc: "Für Profi-Investoren und Portfolios",
    highlight: false,
    badge: null,
    features: [
      { text: "Alle Pro-Features", included: true },
      { text: "Unbegrenzte Immobilien", included: true },
      { text: "Portfolio-Gesamtübersicht", included: true },
      { text: "Excel-Export (4 Sheets)", included: true },
      { text: "Cashflow-Entwicklung Portfolio", included: true },
      { text: "Erweiterte Kennzahlen (ROI-Kurve)", included: true },
      { text: "Priority Support", included: true },
    ],
  },
];

/* ─── Hilfsfunktion: Preisanzeige ───────────────────────────────────── */
function getDisplayPrice(plan: typeof PAID_PLANS[0], billing: BillingType): string {
  if (billing === "monthly") return `${plan.monthly} €/Monat`;
  if (billing === "yearly")  return `${plan.yearly} €/Jahr`;
  return `${plan.once} € einmalig`;
}

function getSubline(plan: typeof PAID_PLANS[0], billing: BillingType): string {
  if (billing === "monthly") return `= ${plan.monthly} €/Monat · jederzeit kündbar`;
  if (billing === "yearly")  return `= ${(plan.yearly / 12).toFixed(0)} €/Monat · ${plan.savingsYearly}`;
  return "Einmalzahlung · lebenslanger Zugang";
}

/* ─── Komponente ────────────────────────────────────────────────────── */
export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  // Jeder Plan hat seinen eigenen Billing-Toggle
  const [billing, setBilling] = useState<Record<PaidPlanId, BillingType>>({
    basic: "monthly",
    pro: "monthly",
    investor: "monthly",
  });

  const handleSelect = (planId: PaidPlanId) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    const currentBilling = billing[planId];
    const link = STRIPE_LINKS[planId][currentBilling];
    toast.success("Du wirst zu Stripe weitergeleitet…");
    window.open(link, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663196939510/MpQxIZzGZxrLthGU.png"
              alt="ImmoRenditeTool Logo"
              className="h-11 w-auto object-contain"
            />
            <span className="font-bold text-gray-900 text-lg">ImmoRenditeTool</span>
          </a>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Dashboard
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => (window.location.href = getLoginUrl())}
                className="text-white"
                style={{ background: "linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)" }}
              >
                Anmelden
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-bold text-4xl text-gray-900 mb-4">Transparente Preise</h1>
        <p className="text-gray-500 text-xl max-w-xl mx-auto">
          Starte kostenlos — upgrade wenn du mehr brauchst. Kein Abo-Zwang.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-blue-700 text-sm font-medium">
            Free: Kostenlos kalkulieren · Upgrade für Speichern, PDF-Report & Szenarien
          </span>
        </div>
      </div>

      {/* ── Plans Grid ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">

          {/* Free-Karte */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-400">Free</p>
              <p className="font-bold text-4xl text-gray-900">0 €</p>
              <p className="text-xs text-gray-400 mt-1">{FREE_PLAN.billing}</p>
              <p className="text-sm mt-2 text-gray-500 mb-6">{FREE_PLAN.desc}</p>
              <ul className="space-y-3 mb-6">
                {FREE_PLAN.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                    {f.included ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
                    ) : (
                      <X className="w-4 h-4 shrink-0 text-gray-300" />
                    )}
                    <span className={!f.included ? "opacity-40" : ""}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full font-semibold" variant="outline" onClick={() => navigate("/kalkulator")}>
                Kostenlos starten
              </Button>
            </div>
          </div>

          {/* Bezahlte Pläne */}
          {PAID_PLANS.map((plan) => {
            const currentBilling = billing[plan.id];
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl overflow-hidden border ${
                  plan.highlight
                    ? "border-blue-500 shadow-xl shadow-blue-100"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
                style={plan.highlight ? { background: "linear-gradient(160deg, #0A2540 0%, #1565C0 100%)" } : {}}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold text-center py-1.5">
                    {plan.badge}
                  </div>
                )}

                <div className={`p-6 ${plan.badge ? "" : ""}`}>
                  {/* Plan-Name */}
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${plan.highlight ? "text-blue-300" : "text-gray-400"}`}>
                    {plan.name}
                  </p>

                  {/* ── Billing-Toggle ────────────────────────── */}
                  <div className={`flex gap-1 p-1 rounded-lg mb-4 ${plan.highlight ? "bg-white/10" : "bg-gray-100"}`}>
                    {(["monthly", "yearly", "once"] as BillingType[]).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBilling((prev) => ({ ...prev, [plan.id]: b }))}
                        className={`flex-1 text-[11px] py-1.5 rounded-md font-medium transition-all ${
                          currentBilling === b
                            ? plan.highlight
                              ? "bg-white text-blue-900 shadow-sm"
                              : "bg-white text-gray-900 shadow-sm"
                            : plan.highlight
                            ? "text-white/60 hover:text-white"
                            : "text-gray-400 hover:text-gray-700"
                        }`}
                      >
                        {b === "monthly" ? "Monatlich" : b === "yearly" ? "Jährlich" : "Einmalig"}
                      </button>
                    ))}
                  </div>

                  {/* Preis */}
                  <p className={`font-bold text-3xl leading-none ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {getDisplayPrice(plan, currentBilling)}
                  </p>
                  <p className={`text-xs mt-1.5 mb-1 ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>
                    {getSubline(plan, currentBilling)}
                  </p>

                  {/* Jährlich-Ersparnis-Badge */}
                  {currentBilling === "yearly" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mb-3">
                      <Star className="w-2.5 h-2.5" />
                      {plan.savingsYearly} ggü. monatlich
                    </span>
                  )}
                  {currentBilling === "once" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mb-3">
                      <Infinity className="w-2.5 h-2.5" />
                      Lebenslanger Zugang
                    </span>
                  )}
                  {currentBilling === "monthly" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mb-3">
                      Jederzeit kündbar
                    </span>
                  )}

                  <p className={`text-sm mb-5 ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>
                    {plan.desc}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f.text} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? "text-white/85" : "text-gray-600"}`}>
                        {f.included ? (
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-blue-300" : "text-blue-500"}`} />
                        ) : (
                          <X className="w-4 h-4 shrink-0 text-gray-300" />
                        )}
                        <span className={!f.included ? "opacity-40" : ""}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className={`w-full font-semibold ${plan.highlight ? "bg-white text-blue-900 hover:bg-blue-50" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => handleSelect(plan.id)}
                  >
                    {plan.name} wählen
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Preisvergleich-Hinweis ──────────────────────────────── */}
        <div className="mt-10 max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Wie unterscheiden sich die Zahlungsoptionen?</h3>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="font-bold text-blue-700 mb-1">Monatlich</p>
              <p className="text-gray-500 text-xs">Günstigster Einstieg · volle Flexibilität · jederzeit kündbar</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="font-bold text-emerald-700 mb-1">Jährlich</p>
              <p className="text-gray-500 text-xs">~2 Monate geschenkt · günstiger pro Monat als monatlich</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="font-bold text-amber-700 mb-1">Einmalig (Lifetime)</p>
              <p className="text-gray-500 text-xs">Einmaliger Höchstpreis · lebenslanger Zugang · keine Folgekosten</p>
            </div>
          </div>
        </div>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <div className="mt-12 max-w-2xl mx-auto">
          <h2 className="font-bold text-2xl text-gray-900 text-center mb-8">Häufige Fragen</h2>
          <div className="space-y-4">
            {[
              {
                q: "Was kann ich mit der Free-Version?",
                a: "Du kannst den Kalkulator vollständig nutzen und alle Berechnungen durchführen. Bruttomietrendite, Netto-Cashflow und Basis-Empfehlung sind immer kostenlos. Zum Speichern von Objekten benötigst du mindestens den Basic-Plan.",
              },
              {
                q: "Was ist der Unterschied zwischen monatlich, jährlich und einmalig?",
                a: "Monatlich ist der günstigste Einstieg mit voller Flexibilität. Jährlich spart ~2 Monate gegenüber monatlich. Einmalig (Lifetime) ist der höchste Preis, aber du zahlst nur einmal und hast dauerhaften Zugang — ohne Folgekosten.",
              },
              {
                q: "Gibt es eine Rückerstattungsgarantie?",
                a: "Ja, innerhalb von 14 Tagen nach Kauf erstatten wir dir den vollen Betrag — kein Wenn und Aber.",
              },
              {
                q: "Kann ich später upgraden?",
                a: "Ja, du kannst jederzeit von Basic auf Pro oder Investor upgraden. Der Preis wird anteilig berechnet.",
              },
              {
                q: "Ist die Zahlung sicher?",
                a: "Zahlungen werden über Stripe abgewickelt — dem weltweit führenden Zahlungsdienstleister.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="font-semibold text-gray-900 mb-1.5">{q}</p>
                <p className="text-gray-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663196939510/MpQxIZzGZxrLthGU.png"
              alt="ImmoRenditeTool Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-semibold text-sm text-gray-900">ImmoRenditeTool</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Alle Berechnungen ohne Gewähr · Keine Anlageberatung · © {new Date().getFullYear()} ImmoRenditeTool
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600">Startseite</a>
            <a href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">Dashboard</a>
            <a href="/impressum" className="text-xs text-gray-400 hover:text-gray-600">Impressum</a>
            <a href="/datenschutz" className="text-xs text-gray-400 hover:text-gray-600">Datenschutz</a>
            <a href="/agb" className="text-xs text-gray-400 hover:text-gray-600">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
