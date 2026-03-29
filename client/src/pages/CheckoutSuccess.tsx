import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Loader2, Sparkles, Crown, Star, TrendingUp } from "lucide-react";

const PLAN_INFO: Record<string, { label: string; icon: React.ReactNode; color: string; features: string[] }> = {
  basic: {
    label: "Basic",
    icon: <Star className="w-8 h-8" />,
    color: "text-blue-600",
    features: ["Bis zu 10 Immobilien speichern", "PDF-Export", "Cashflow-Analyse"],
  },
  pro: {
    label: "Pro",
    icon: <TrendingUp className="w-8 h-8" />,
    color: "text-violet-600",
    features: ["Bis zu 50 Immobilien speichern", "Alle Pro-Analysen", "Steueroptimierung", "Excel-Export"],
  },
  investor: {
    label: "Investor",
    icon: <Crown className="w-8 h-8" />,
    color: "text-amber-600",
    features: ["Unbegrenzte Immobilien", "KI-Exposé-Analyse", "Investment-Bewertung", "Prioritäts-Support"],
  },
};

// Einfache Konfetti-Partikel-Animation (CSS-basiert, kein externes Paket)
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <div
      className="absolute top-0 w-2 h-2 rounded-sm opacity-0"
      style={{
        left: `${x}%`,
        backgroundColor: color,
        animation: `confettiFall 2.5s ease-in ${delay}s forwards`,
      }}
    />
  );
}

const CONFETTI_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#EC4899"];

function ConfettiEffect() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1.5,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
      ))}
    </div>
  );
}

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(8);
  const [showConfetti, setShowConfetti] = useState(true);

  // Plan aus URL-Parametern lesen
  const params = new URLSearchParams(window.location.search);
  const planFromUrl = params.get("plan") ?? "pro";

  // Aktuellen Plan vom Server laden (nach Webhook-Verarbeitung)
  const { data: planData, isLoading } = trpc.plan.get.useQuery(undefined, {
    refetchInterval: 3000, // Alle 3 Sekunden prüfen bis Plan aktiviert ist
    refetchIntervalInBackground: false,
  });

  const activePlan = planData?.plan ?? planFromUrl;
  const planInfo = PLAN_INFO[activePlan] ?? PLAN_INFO.pro;

  // Konfetti nach 3 Sekunden ausblenden
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Countdown für automatische Weiterleitung
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/kalkulator");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {showConfetti && <ConfettiEffect />}

      <div className="w-full max-w-lg">
        {/* Erfolgs-Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
            <div className="relative w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Zahlung erfolgreich! 🎉
          </h1>
          <p className="text-slate-500 text-lg">
            Dein Plan wird jetzt aktiviert.
          </p>
        </div>

        {/* Plan-Karte */}
        <Card className="border-0 shadow-xl mb-6 overflow-hidden">
          <div className={`h-1.5 bg-gradient-to-r ${
            activePlan === "basic" ? "from-blue-400 to-blue-600" :
            activePlan === "investor" ? "from-amber-400 to-amber-600" :
            "from-violet-400 to-violet-600"
          }`} />
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className={`p-3 rounded-xl bg-slate-50 ${planInfo.color}`}>
                {planInfo.icon}
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Aktivierter Plan</p>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  )}
                  <h2 className={`text-2xl font-bold ${planInfo.color}`}>
                    ImmoRendite {planInfo.label}
                  </h2>
                </div>
              </div>
            </div>

            <ul className="space-y-2.5">
              {planInfo.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Aktions-Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/kalkulator")}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
            size="lg"
          >
            Jetzt Immobilie analysieren
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="w-full h-11 text-slate-600"
          >
            Zum Dashboard
          </Button>
        </div>

        {/* Countdown-Hinweis */}
        <p className="text-center text-sm text-slate-400 mt-4">
          Automatische Weiterleitung in{" "}
          <span className="font-semibold text-slate-600">{countdown}s</span>
          {" "}zum Kalkulator
        </p>

        {/* Hinweis bei Verzögerung */}
        {isLoading && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 text-center">
              Plan-Aktivierung läuft... Dies kann einige Sekunden dauern.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
