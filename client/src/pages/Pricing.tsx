import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, CheckCircle2, X, ArrowLeft, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

type BillingType = "once" | "monthly" | "yearly";

const PLANS = [
  {
    id: "basic" as const,
    name: "Basic",
    priceOnce: "49 €",
    priceMonthly: null,
    priceYearly: null,
    billing: "Einmalzahlung",
    desc: "Für Einsteiger und gelegentliche Analysen",
    highlight: false,
    badge: null,
    features: [
      { text: "Buy & Hold Szenario", included: true },
      { text: "Bruttomietrendite", included: true },
      { text: "Netto-Cashflow", included: true },
      { text: "AfA & vereinfachte Steuer", included: true },
      { text: "Eigenkapitalrendite", included: true },
      { text: "Bis zu 10 Immobilien speichern", included: true },
      { text: "Erweiterte Szenarien", included: false },
      { text: "PDF-Report", included: false },
      { text: "Exposé-Generator", included: false },
      { text: "Email-Generator", included: false },
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    priceOnce: "99 €",
    priceMonthly: "19 €",
    priceYearly: "149 €",
    billing: "Einmalig, monatlich oder jährlich",
    desc: "Für aktive Investoren mit mehreren Objekten",
    highlight: true,
    badge: "BELIEBTESTE WAHL",
    features: [
      { text: "Alle Basic-Features", included: true },
      { text: "Sanieren & Verkaufen Szenario", included: true },
      { text: "10 Jahre Vermietung Szenario", included: true },
      { text: "Eigennutzung 24 Monate & steuerfrei", included: true },
      { text: "Vollständiger PDF-Report", included: true },
      { text: "Exposé-Generator", included: true },
      { text: "Email-Generator", included: true },
      { text: "Szenario-Vergleich in Diagrammen", included: true },
      { text: "Bis zu 50 Immobilien", included: true },
      { text: "14 Tage kostenlos testen", included: true },
    ],
  },
  {
    id: "investor" as const,
    name: "Investor",
    priceOnce: "149 €",
    priceMonthly: null,
    priceYearly: null,
    billing: "Einmalzahlung",
    desc: "Für Profi-Investoren und Portfolios",
    highlight: false,
    badge: null,
    features: [
      { text: "Alle Pro-Features", included: true },
      { text: "Unbegrenzte Immobilien", included: true },
      { text: "Portfolio-Gesamtübersicht", included: true },
      { text: "Objekte nebeneinander vergleichen", included: true },
      { text: "Excel-Export", included: true },
      { text: "Erweiterte Kennzahlen (ROI-Kurve)", included: true },
      { text: "Cashflow-Entwicklung Portfolio", included: true },
      { text: "Priority Support", included: true },
    ],
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedBilling, setSelectedBilling] = useState<Record<string, BillingType>>({
    pro: "once",
  });

  const upgradeMutation = trpc.plan.upgrade.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.plan.charAt(0).toUpperCase() + data.plan.slice(1)}-Plan aktiviert!`);
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error("Fehler beim Upgrade: " + err.message);
    },
  });

  const trialMutation = trpc.plan.startTrial.useMutation({
    onSuccess: () => {
      toast.success("14-Tage Pro-Trial gestartet!");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSelect = (planId: "basic" | "pro" | "investor") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    const billing = selectedBilling[planId] ?? "once";
    upgradeMutation.mutate({ plan: planId, billingType: billing });
  };

  const handleTrial = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    trialMutation.mutate();
  };

  const getPrice = (plan: typeof PLANS[0]) => {
    const billing = selectedBilling[plan.id] ?? "once";
    if (billing === "monthly" && plan.priceMonthly) return plan.priceMonthly + "/Monat";
    if (billing === "yearly" && plan.priceYearly) return plan.priceYearly + "/Jahr";
    return plan.priceOnce;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">ImmoKalkulator</span>
          </a>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Dashboard
              </Button>
            ) : (
              <Button size="sm" onClick={() => window.location.href = getLoginUrl()} className="text-white" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}>
                Anmelden
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-bold text-4xl text-gray-900 mb-4">Transparente Preise</h1>
        <p className="text-gray-500 text-xl max-w-xl mx-auto">
          Einmalzahlung oder flexibles Abo — du entscheidest. Kein Abo-Zwang.
        </p>

        {/* Pro Trial Banner */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-blue-700 text-sm font-medium">Pro 14 Tage kostenlos testen — keine Kreditkarte erforderlich</span>
          <button
            onClick={handleTrial}
            className="ml-2 text-xs font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Jetzt starten →
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl overflow-hidden border ${plan.highlight ? 'border-blue-500 shadow-xl shadow-blue-100' : 'border-gray-200 bg-white shadow-sm'}`}
              style={plan.highlight ? { background: 'linear-gradient(160deg, #0A2540 0%, #1565C0 100%)' } : {}}
            >
              {plan.badge && (
                <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold text-center py-1.5">
                  {plan.badge}
                </div>
              )}
              <div className={`p-6 ${plan.badge ? 'pt-10' : ''}`}>
                {/* Plan Header */}
                <div className="mb-6">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${plan.highlight ? 'text-blue-300' : 'text-gray-400'}`}>
                    {plan.name}
                  </p>
                  <p className={`font-bold text-4xl ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {getPrice(plan)}
                  </p>
                  <p className={`text-sm mt-2 ${plan.highlight ? 'text-white/70' : 'text-gray-500'}`}>{plan.desc}</p>
                </div>

                {/* Billing Toggle for Pro */}
                {plan.id === "pro" && (
                  <div className="flex gap-1 p-1 rounded-lg bg-white/10 mb-6">
                    {(["once", "monthly", "yearly"] as BillingType[]).map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBilling(prev => ({ ...prev, pro: b }))}
                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${
                          (selectedBilling.pro ?? "once") === b
                            ? 'bg-white text-blue-900 shadow-sm'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {b === "once" ? "Einmalig" : b === "monthly" ? "Monatlich" : "Jährlich"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? 'text-white/85' : 'text-gray-600'}`}>
                      {f.included ? (
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-blue-300' : 'text-blue-500'}`} />
                      ) : (
                        <X className="w-4 h-4 shrink-0 text-gray-300" />
                      )}
                      <span className={!f.included ? 'opacity-40' : ''}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full font-semibold ${plan.highlight ? 'bg-white text-blue-900 hover:bg-blue-50' : ''}`}
                  variant={plan.highlight ? 'default' : 'outline'}
                  onClick={() => handleSelect(plan.id)}
                  disabled={upgradeMutation.isPending}
                >
                  {upgradeMutation.isPending ? 'Wird aktiviert...' : `${plan.name} wählen`}
                </Button>

                {plan.id === "pro" && (
                  <button
                    onClick={handleTrial}
                    disabled={trialMutation.isPending}
                    className="w-full mt-2 text-xs text-center text-white/60 hover:text-white/90 transition-colors"
                  >
                    Oder 14 Tage kostenlos testen →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="font-bold text-2xl text-gray-900 text-center mb-8">Häufige Fragen</h2>
          <div className="space-y-4">
            {[
              { q: "Gibt es eine Rückerstattungsgarantie?", a: "Ja, innerhalb von 14 Tagen nach Kauf erstatten wir dir den vollen Betrag — kein Wenn und Aber." },
              { q: "Wie funktioniert der Pro-Trial?", a: "Du kannst Pro 14 Tage kostenlos testen. Ohne Zahlung wird der Plan nach Ablauf automatisch deaktiviert." },
              { q: "Kann ich später upgraden?", a: "Ja, du kannst jederzeit von Basic auf Pro oder Investor upgraden. Der Preis wird anteilig berechnet." },
              { q: "Ist die Zahlung sicher?", a: "Zahlungen werden über Stripe abgewickelt — dem weltweit führenden Zahlungsdienstleister." },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="font-semibold text-gray-900 mb-1.5">{q}</p>
                <p className="text-gray-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
