import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Plus, LogOut, BarChart3, TrendingUp, Zap,
  Trash2, Edit, ArrowRight, Star, AlertCircle, Clock,
  Home, Briefcase, Building, Factory, HardHat
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const ART_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  etw: { label: "Eigentumswohnung", icon: Home },
  mfh: { label: "Mehrfamilienhaus", icon: Building },
  efh: { label: "Einfamilienhaus", icon: Home },
  gewerbe: { label: "Gewerbeimmobilie", icon: Briefcase },
  neubau: { label: "Neubauprojekt", icon: HardHat },
};

const PLAN_COLORS: Record<string, string> = {
  none: "bg-gray-100 text-gray-600",
  basic: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  investor: "bg-yellow-100 text-yellow-700",
  trial: "bg-green-100 text-green-700",
};

const PLAN_LABELS: Record<string, string> = {
  none: "Kein Plan",
  basic: "Basic",
  pro: "Pro",
  investor: "Investor",
  trial: "Pro Trial",
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const planQuery = trpc.plan.get.useQuery();
  const immobilienQuery = trpc.immobilien.list.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.immobilien.delete.useMutation({
    onSuccess: () => {
      toast.success("Immobilie gelöscht");
      utils.immobilien.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const plan = planQuery.data?.plan ?? "none";
  const isInvestor = plan === "investor";
  const isPro = plan === "pro" || plan === "trial" || isInvestor;
  const isBasic = plan === "basic" || isPro;

  const immobilien = immobilienQuery.data ?? [];

  // Portfolio-Summen für Investor
  const portfolioStats = immobilien.reduce((acc, immo) => {
    const e = immo.ergebnisse as any;
    if (e) {
      acc.gesamtKaufpreis += (e.kaufpreis as number) || 0;
      acc.gesamtCashflow += (e.nettoCashflowMonatlich as number) || 0;
      acc.gesamtRendite += (e.bruttomietrendite as number) || 0;
    }
    return acc;
  }, { gesamtKaufpreis: 0, gesamtCashflow: 0, gesamtRendite: 0 });

  if (immobilien.length > 0) {
    portfolioStats.gesamtRendite = portfolioStats.gesamtRendite / immobilien.length;
  }

  // Cashflow-Chart-Daten
  const chartData = immobilien.slice(0, 8).map((immo) => {
    const e = immo.ergebnisse as any;
    return {
      name: immo.name.slice(0, 12),
      cashflow: Math.round((e?.nettoCashflowMonatlich as number) || 0),
      rendite: Math.round(((e?.bruttomietrendite as number) || 0) * 10) / 10,
    };
  });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const trialExpiry = planQuery.data?.user?.planExpiresAt;
  const trialDaysLeft = trialExpiry
    ? Math.max(0, Math.ceil((new Date(trialExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2.5">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663196939510/MpQxIZzGZxrLthGU.png" alt="ImmoRenditeTool Logo" className="h-11 w-auto object-contain" />
            <span className="font-bold text-gray-900 text-lg">ImmoRenditeTool</span>
          </a>
          <div className="flex items-center gap-3">
            <Badge className={PLAN_COLORS[plan]}>
              {PLAN_LABELS[plan]}
            </Badge>
            <span className="text-sm text-gray-600 hidden sm:block">{user?.name || user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Trial Banner */}
        {plan === "trial" && trialDaysLeft !== null && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
            <Clock className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Pro Trial aktiv — noch {trialDaysLeft} Tage</p>
              <p className="text-xs text-green-600">Nach Ablauf wird der Plan automatisch deaktiviert. Jetzt upgraden um alle Features zu behalten.</p>
            </div>
            <Button size="sm" onClick={() => navigate("/pricing")} className="bg-green-600 hover:bg-green-700 text-white shrink-0">
              Jetzt upgraden
            </Button>
          </div>
        )}

        {/* No Plan Banner */}
        {plan === "none" && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800">Kein aktiver Plan</p>
              <p className="text-xs text-blue-600">Wähle einen Plan, um Berechnungen zu speichern und alle Features zu nutzen.</p>
            </div>
            <Button size="sm" onClick={() => navigate("/pricing")} style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }} className="text-white shrink-0">
              Plan wählen
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-2xl text-gray-900">Mein Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Übersicht deiner Immobilien-Analysen</p>
          </div>
          <Button
            onClick={() => navigate("/kalkulator")}
            className="text-white font-semibold"
            style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Neue Analyse
          </Button>
        </div>

        {/* Investor Portfolio Stats */}
        {isInvestor && immobilien.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Gesamtinvestition", value: `${(portfolioStats.gesamtKaufpreis / 1000).toFixed(0)}k €`, icon: Building2, color: "text-blue-600 bg-blue-50" },
              { label: "Gesamt-Cashflow/Monat", value: `${portfolioStats.gesamtCashflow.toFixed(0)} €`, icon: TrendingUp, color: portfolioStats.gesamtCashflow >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50" },
              { label: "Ø Rendite", value: `${portfolioStats.gesamtRendite.toFixed(2)} %`, icon: BarChart3, color: "text-purple-600 bg-purple-50" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Chart (Investor) */}
        {isInvestor && chartData.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4">Portfolio-Cashflow Übersicht</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v} €`, "Cashflow/Monat"]} />
                <Area type="monotone" dataKey="cashflow" stroke="#0D6EFD" fill="#EFF6FF" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Immobilien List */}
        {immobilienQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : immobilien.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Noch keine Immobilien gespeichert</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Starte deine erste Analyse und speichere das Ergebnis in deinem Dashboard.
            </p>
            <Button
              onClick={() => navigate("/kalkulator")}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Erste Analyse starten
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {immobilien.map((immo) => {
              const e = immo.ergebnisse as any;
              const artInfo = ART_LABELS[immo.art] ?? ART_LABELS.etw;
              const ArtIcon = artInfo.icon;
              const cashflow = e?.nettoCashflowMonatlich as number | undefined;
              const rendite = e?.bruttomietrendite as number | undefined;

              return (
                <div key={immo.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <ArtIcon className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{immo.name}</p>
                          <p className="text-xs text-gray-400">{artInfo.label}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/kalkulator/${immo.id}`)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(immo.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {e && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2.5 rounded-lg bg-gray-50">
                          <p className="text-xs text-gray-400">Cashflow/Monat</p>
                          <p className={`font-bold text-sm ${(cashflow ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {cashflow !== undefined ? `${cashflow.toFixed(0)} €` : '—'}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-gray-50">
                          <p className="text-xs text-gray-400">Bruttomietrendite</p>
                          <p className="font-bold text-sm text-blue-600">
                            {rendite !== undefined ? `${rendite.toFixed(2)} %` : '—'}
                          </p>
                        </div>
                      </div>
                    )}

                    {immo.standort && (
                      <p className="text-xs text-gray-400 mb-3">📍 {immo.standort}</p>
                    )}

                    <p className="text-xs text-gray-300">
                      {new Date(immo.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="border-t border-gray-50 px-5 py-3">
                    <button
                      onClick={() => navigate(`/kalkulator/${immo.id}`)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      Analyse öffnen <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upgrade Teaser */}
        {!isInvestor && isBasic && (
          <div className="mt-8 p-5 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">
                {isPro ? "Upgrade auf Investor" : "Upgrade auf Pro"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPro
                  ? "Unbegrenzte Immobilien, Portfolio-Übersicht und Excel-Export."
                  : "Erweiterte Szenarien, PDF-Report, Exposé- und Email-Generator."}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate("/pricing")} className="text-white shrink-0" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}>
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Upgraden
            </Button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-6 bg-white mt-8">
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
            <a href="/pricing" className="text-xs text-gray-400 hover:text-gray-600">Preise</a>
            <a href="/kalkulator" className="text-xs text-gray-400 hover:text-gray-600">Kalkulator</a>
            <a href="/impressum" className="text-xs text-gray-400 hover:text-gray-600">Impressum</a>
            <a href="/datenschutz" className="text-xs text-gray-400 hover:text-gray-600">Datenschutz</a>
            <a href="/agb" className="text-xs text-gray-400 hover:text-gray-600">AGB</a>
          </div>
        </div>
      </footer>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Immobilie löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Analyse wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate({ id: deleteId });
                setDeleteId(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
