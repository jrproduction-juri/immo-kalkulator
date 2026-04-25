import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Building2, Plus, BarChart3, TrendingUp, Zap,
  Trash2, Edit, ArrowRight, Star, AlertCircle, Clock,
  Home, Briefcase, Building, HardHat, Upload, Settings,
  ChevronRight, Brain, FileText
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
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

const PLAN_BADGE: Record<string, { label: string; style: React.CSSProperties }> = {
  none: { label: "Free", style: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' } },
  basic: { label: "Basic", style: { background: 'rgba(59,130,246,0.15)', color: '#60A5FA' } },
  pro: { label: "Pro", style: { background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#0A0F1A' } },
  investor: { label: "Investor", style: { background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white' } },
  trial: { label: "Pro Trial", style: { background: 'rgba(16,185,129,0.15)', color: '#10B981' } },
};

function RisikoIndikator({ value }: { value: number | undefined }) {
  if (value === undefined) return null;
  const color = value >= 5 ? '#10B981' : value >= 3.5 ? '#F59E0B' : '#EF4444';
  const label = value >= 5 ? 'Gut' : value >= 3.5 ? 'Mittel' : 'Kritisch';
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
      />
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
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
  const isFree = !isBasic;

  const immobilien = immobilienQuery.data ?? [];

  const portfolioStats = immobilien.reduce((acc, immo) => {
    const e = immo.ergebnisse as any;
    const inp = immo.eingaben as any;
    if (e) {
      acc.gesamtKaufpreis += (e.gesamtinvestition as number) || (inp?.kaufpreis as number) || 0;
      acc.gesamtCashflow += (e.nettoCashflowMonat as number) || 0;
      acc.gesamtRendite += (e.bruttomietrendite as number) || 0;
    }
    return acc;
  }, { gesamtKaufpreis: 0, gesamtCashflow: 0, gesamtRendite: 0 });

  if (immobilien.length > 0) {
    portfolioStats.gesamtRendite = portfolioStats.gesamtRendite / immobilien.length;
  }

  const chartData = immobilien.slice(0, 8).reverse().map((immo) => {
    const e = immo.ergebnisse as any;
    return {
      name: immo.name.slice(0, 12),
      cashflow: Math.round((e?.nettoCashflowMonat as number) || 0),
      rendite: Math.round(((e?.bruttomietrendite as number) || 0) * 10) / 10,
    };
  });

  const trialExpiry = planQuery.data?.user?.planExpiresAt;
  const trialDaysLeft = trialExpiry
    ? Math.max(0, Math.ceil((new Date(trialExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const planBadge = PLAN_BADGE[plan] ?? PLAN_BADGE.none;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0F1A' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Trial Banner */}
        {plan === "trial" && trialDaysLeft !== null && (
          <div
            className="mb-6 flex items-center gap-3 p-4 rounded-xl"
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <Clock className="w-5 h-5 shrink-0" style={{ color: '#10B981' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#10B981' }}>
                Pro Trial aktiv — noch {trialDaysLeft} Tage
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Nach Ablauf wird der Plan automatisch deaktiviert. Jetzt upgraden um alle Features zu behalten.
              </p>
            </div>
            <button
              onClick={() => navigate("/pricing")}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white shrink-0 transition-all"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
            >
              Jetzt upgraden
            </button>
          </div>
        )}

        {/* No Plan Banner */}
        {plan === "none" && (
          <div
            className="mb-6 flex items-center gap-3 p-4 rounded-xl"
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#60A5FA' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#60A5FA' }}>Kein aktiver Plan</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Wähle einen Plan, um Berechnungen zu speichern und alle Features zu nutzen.
              </p>
            </div>
            <button
              onClick={() => navigate("/pricing")}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white shrink-0 transition-all"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
            >
              Plan wählen
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1
                className="font-bold text-2xl text-white"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                Mein Dashboard
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={planBadge.style}
              >
                {planBadge.label}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Übersicht deiner Immobilien-Analysen
            </p>
          </div>
          <button
            onClick={() => navigate("/kalkulator")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            <Plus className="w-4 h-4" />
            Neue Analyse
          </button>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            {
              icon: Plus,
              title: 'Neue Analyse',
              desc: 'Kalkulator starten',
              color: '#3B82F6',
              bg: 'rgba(59, 130, 246, 0.1)',
              action: () => navigate('/kalkulator')
            },
            {
              icon: Upload,
              title: 'Exposé hochladen',
              desc: 'PDF analysieren',
              color: '#10B981',
              bg: 'rgba(16, 185, 129, 0.1)',
              action: () => navigate('/kalkulator'),
              proOnly: !isPro
            },
            {
              icon: Building2,
              title: 'Gespeicherte Analysen',
              desc: `${immobilien.length} Objekte`,
              color: '#F59E0B',
              bg: 'rgba(245, 158, 11, 0.1)',
              action: () => {}
            },
            {
              icon: Settings,
              title: 'Account & Plan',
              desc: planBadge.label,
              color: '#8B5CF6',
              bg: 'rgba(139, 92, 246, 0.1)',
              action: () => navigate('/pricing')
            },
          ].map(({ icon: Icon, title, desc, color, bg, action, proOnly }) => (
            <button
              key={title}
              onClick={action}
              className="relative rounded-xl p-4 text-left transition-all group"
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
                (e.currentTarget as HTMLElement).style.background = '#1a2235';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.background = '#111827';
              }}
            >
              {proOnly && (
                <div
                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#0A0F1A' }}
                >
                  Pro
                </div>
              )}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: bg }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="font-semibold text-sm text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
            </button>
          ))}
        </div>

        {/* Portfolio Stats (Investor) */}
        {isInvestor && immobilien.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Gesamtinvestition",
                value: `${(portfolioStats.gesamtKaufpreis / 1000).toFixed(0)}k €`,
                icon: Building2,
                color: '#3B82F6',
                bg: 'rgba(59, 130, 246, 0.1)'
              },
              {
                label: "Gesamt-Cashflow/Monat",
                value: `${portfolioStats.gesamtCashflow >= 0 ? '+' : ''}${portfolioStats.gesamtCashflow.toFixed(0)} €`,
                icon: TrendingUp,
                color: portfolioStats.gesamtCashflow >= 0 ? '#10B981' : '#EF4444',
                bg: portfolioStats.gesamtCashflow >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              },
              {
                label: "Ø Rendite",
                value: `${portfolioStats.gesamtRendite.toFixed(2)} %`,
                icon: BarChart3,
                color: '#F59E0B',
                bg: 'rgba(245, 158, 11, 0.1)'
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="rounded-xl p-5"
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: bg }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'IBM Plex Mono, monospace', color }}
                >
                  {value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Portfolio Chart (Investor) */}
        {isInvestor && chartData.length > 1 && (
          <div
            className="rounded-2xl p-6 mb-8"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h2
              className="font-semibold text-white mb-4"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Portfolio-Cashflow Übersicht
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`${v} €`, "Cashflow/Monat"]}
                  contentStyle={{
                    background: '#1a2235',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: 'white'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cashflow"
                  stroke="#3B82F6"
                  fill="url(#cashflowGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Saved Analyses Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-bold text-lg text-white"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Gespeicherte Analysen
            </h2>
            {immobilien.length > 0 && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                {immobilien.length} Objekte
              </span>
            )}
          </div>

          {immobilienQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'rgba(59, 130, 246, 0.3)', borderTopColor: '#3B82F6' }}
              />
            </div>
          ) : immobilien.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                background: '#111827',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(59, 130, 246, 0.1)' }}
              >
                <Building2 className="w-7 h-7" style={{ color: '#3B82F6' }} />
              </div>
              <h3
                className="font-semibold text-white mb-2"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                Noch keine Immobilien gespeichert
              </h3>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Starte deine erste Analyse und speichere das Ergebnis in deinem Dashboard.
              </p>
              <button
                onClick={() => navigate("/kalkulator")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
              >
                <Plus className="w-4 h-4" />
                Erste Analyse starten
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {immobilien.map((immo) => {
                const e = immo.ergebnisse as any;
                const inp = immo.eingaben as any;
                const artInfo = ART_LABELS[immo.art] ?? ART_LABELS.etw;
                const ArtIcon = artInfo.icon;
                const cashflow = e?.nettoCashflowMonat as number | undefined;
                const rendite = e?.bruttomietrendite as number | undefined;
                const kaufpreis = (inp?.kaufpreis as number) || undefined;
                const cashflowPositive = cashflow !== undefined && cashflow >= 0;

                return (
                  <div
                    key={immo.id}
                    className="rounded-2xl overflow-hidden transition-all group"
                    style={{
                      background: '#111827',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      (e.currentTarget as HTMLElement).style.background = '#1a2235';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                      (e.currentTarget as HTMLElement).style.background = '#111827';
                    }}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                          >
                            <ArtIcon className="w-4.5 h-4.5" style={{ color: '#3B82F6' }} />
                          </div>
                          <div>
                            <p
                              className="font-semibold text-sm text-white leading-tight"
                              style={{ fontFamily: 'Sora, sans-serif' }}
                            >
                              {immo.name}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {artInfo.label}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => navigate(`/kalkulator/${immo.id}`)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'rgba(255,255,255,0.3)' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(59, 130, 246, 0.1)';
                              (e.currentTarget as HTMLElement).style.color = '#3B82F6';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)';
                            }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(immo.id)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'rgba(255,255,255,0.3)' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)';
                              (e.currentTarget as HTMLElement).style.color = '#EF4444';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)';
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {kaufpreis && (
                        <p
                          className="text-sm font-bold mb-3"
                          style={{
                            fontFamily: 'IBM Plex Mono, monospace',
                            color: 'rgba(255,255,255,0.7)'
                          }}
                        >
                          {kaufpreis.toLocaleString('de-DE')} €
                        </p>
                      )}

                      {e && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div
                            className="p-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                          >
                            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              Cashflow/Monat
                            </p>
                            <p
                              className="font-bold text-sm"
                              style={{
                                fontFamily: 'IBM Plex Mono, monospace',
                                color: cashflowPositive ? '#10B981' : '#EF4444'
                              }}
                            >
                              {cashflow !== undefined
                                ? `${cashflowPositive ? '+' : ''}${cashflow.toFixed(0)} €`
                                : '—'}
                            </p>
                          </div>
                          <div
                            className="p-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                          >
                            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              Bruttomietrendite
                            </p>
                            <div className="flex items-center justify-between">
                              <p
                                className="font-bold text-sm"
                                style={{
                                  fontFamily: 'IBM Plex Mono, monospace',
                                  color: '#60A5FA'
                                }}
                              >
                                {rendite !== undefined ? `${rendite.toFixed(2)} %` : '—'}
                              </p>
                              <RisikoIndikator value={rendite} />
                            </div>
                          </div>
                        </div>
                      )}

                      {immo.standort && (
                        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          📍 {immo.standort}
                        </p>
                      )}

                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {new Date(immo.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>

                    <div
                      className="px-5 py-3"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <button
                        onClick={() => navigate(`/kalkulator/${immo.id}`)}
                        className="text-xs font-medium flex items-center gap-1 transition-colors"
                        style={{ color: '#60A5FA' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3B82F6')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#60A5FA')}
                      >
                        Analyse öffnen
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upgrade Teaser */}
        {isFree && (
          <div
            className="mt-6 rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f1f3d 0%, #1a2f5a 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 100% 50%, rgba(245, 158, 11, 0.06) 0%, transparent 70%)'
              }}
            />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(59, 130, 246, 0.15)' }}
              >
                <Brain className="w-6 h-6" style={{ color: '#60A5FA' }} />
              </div>
              <div className="flex-1">
                <p
                  className="font-bold text-white mb-1"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  Schalte die vollständige KI-Investmentanalyse frei
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Mit Pro erhältst du KI-Analyse, detailliertes Risiko-Scoring, PDF-Report, Exposé-Generator und mehr.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['KI-Analyse', 'Risiko-Scoring', 'PDF-Report', 'Exposé', 'Szenarien'].map(f => (
                    <span
                      key={f}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: '#60A5FA'
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate("/pricing")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shrink-0 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                <Zap className="w-4 h-4" />
                Auf Pro upgraden
              </button>
            </div>
          </div>
        )}

        {/* Investor Upgrade Teaser */}
        {isBasic && !isInvestor && (
          <div
            className="mt-6 rounded-2xl p-5 flex items-center gap-4"
            style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px dashed rgba(245, 158, 11, 0.2)'
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245, 158, 11, 0.1)' }}
            >
              <Star className="w-5 h-5 fill-current" style={{ color: '#F59E0B' }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                {isPro ? "Upgrade auf Investor" : "Upgrade auf Pro"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {isPro
                  ? "Unbegrenzte Immobilien, Portfolio-Übersicht und Excel-Export."
                  : "Erweiterte Szenarien, PDF-Report, Exposé- und Email-Generator."}
              </p>
            </div>
            <button
              onClick={() => navigate("/pricing")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm shrink-0 transition-all"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#0A0F1A' }}
            >
              <Zap className="w-3.5 h-3.5" />
              Upgraden
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="py-8 mt-8"
        style={{
          backgroundColor: '#080D16',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
            >
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              ImmoRenditeTool
            </span>
          </div>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Alle Berechnungen ohne Gewähr · Keine Anlageberatung · © {new Date().getFullYear()} ImmoRenditeTool
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { href: '/pricing', label: 'Preise' },
              { href: '/kalkulator', label: 'Kalkulator' },
              { href: '/impressum', label: 'Impressum' },
              { href: '/datenschutz', label: 'Datenschutz' },
              { href: '/agb', label: 'AGB' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Delete Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent
          style={{
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white'
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'white', fontFamily: 'Sora, sans-serif' }}>
              Immobilie löschen?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'rgba(255,255,255,0.5)' }}>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Analyse wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)'
              }}
            >
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate({ id: deleteId });
                setDeleteId(null);
              }}
              style={{ background: '#EF4444', color: 'white' }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
