import { FreeResults as FreeResultsType, formatEuro, formatProzent } from '@/lib/calculations';
import { MetricCard, MetricGrid } from './MetricCard';
import { usePro } from '@/contexts/ProContext';
import { ProLockBadge } from './UpgradeModal';
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Lock, ArrowRight, FileText, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useLocation } from 'wouter';

interface FreeResultsProps {
  results: FreeResultsType;
  onExportPDF?: () => void;
}

function EmpfehlungBanner({ empfehlung, text }: { empfehlung: FreeResultsType['empfehlung']; text: string }) {
  const config = {
    sinnvoll: {
      icon: CheckCircle2,
      label: 'Kauf sinnvoll',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      iconColor: 'text-emerald-600',
    },
    pruefen: {
      icon: AlertTriangle,
      label: 'Prüfen empfohlen',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      iconColor: 'text-amber-600',
    },
    kritisch: {
      icon: XCircle,
      label: 'Kritisch bewerten',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-600',
    },
  };
  const c = config[empfehlung];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${c.bg}`}>
      <c.icon className={`w-5 h-5 shrink-0 mt-0.5 ${c.iconColor}`} />
      <div>
        <p className={`font-display font-bold text-sm ${c.text}`}>{c.label}</p>
        <p className={`text-xs mt-0.5 ${c.text} opacity-80`}>{text}</p>
      </div>
    </div>
  );
}

/** Gesperrte Kennzahl-Kachel mit Blur-Effekt und Lock-Icon */
function LockedMetricCard({ label }: { label: string }) {
  return (
    <div className="relative rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 overflow-hidden">
      <div className="blur-sm select-none">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="font-bold text-lg text-foreground">– – –</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Lock className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

export function FreeResultsPanel({ results, onExportPDF }: FreeResultsProps) {
  const { isPro, isBasic, isFree, setShowUpgradeModal } = usePro();
  const [, navigate] = useLocation();

  const cashflowData = [
    { name: 'Einnahmen', value: results.monatlicheEinnahmen, fill: '#059669' },
    { name: 'Kreditrate', value: results.monatlicheRate, fill: '#1565C0' },
    { name: 'Hausgeld+Rückl.', value: results.monatlicheKosten - results.monatlicheRate, fill: '#7C3AED' },
    { name: 'Cashflow', value: Math.abs(results.nettoCashflowMonat), fill: results.nettoCashflowMonat >= 0 ? '#059669' : '#DC2626' },
  ];

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">Analyse-Ergebnis</h2>
          <p className="text-xs text-muted-foreground">Basierend auf deinen Eingaben</p>
        </div>
        {isFree && (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
            Free
          </span>
        )}
      </div>

      {/* Empfehlung */}
      <EmpfehlungBanner empfehlung={results.empfehlung} text={results.empfehlungText} />

      {/* Kernkennzahlen: Free zeigt nur Brutto + Cashflow, Rest gesperrt */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kernkennzahlen</p>
        <MetricGrid>
          {/* Immer sichtbar */}
          <MetricCard
            label="Bruttomietrendite"
            value={formatProzent(results.bruttomietrendite)}
            trend={results.bruttomietrendite >= 5 ? 'up' : results.bruttomietrendite >= 3.5 ? 'neutral' : 'down'}
            color={results.bruttomietrendite >= 5 ? 'success' : results.bruttomietrendite >= 3.5 ? 'warning' : 'danger'}
            highlight
            infoKuerzel="BMR"
          />
          <MetricCard
            label="Netto-Cashflow / Monat"
            value={formatEuro(results.nettoCashflowMonat)}
            subValue={`${formatEuro(results.nettoCashflowJahr)} / Jahr`}
            trend={results.nettoCashflowMonat >= 0 ? 'up' : 'down'}
            color={results.nettoCashflowMonat >= 0 ? 'success' : results.nettoCashflowMonat >= -200 ? 'warning' : 'danger'}
            highlight
            infoKuerzel="CF"
          />
          {/* Gesperrt für Free */}
          {isBasic ? (
            <>
              <MetricCard
                label="Nettomietrendite"
                value={formatProzent(results.nettomietrendite)}
                color={results.nettomietrendite >= 3 ? 'success' : 'warning'}
                infoKuerzel="NMR"
              />
              <MetricCard
                label="Monatliche Kreditrate"
                value={formatEuro(results.monatlicheRate)}
                color="blue"
              />
            </>
          ) : (
            <>
              <LockedMetricCard label="Nettomietrendite" />
              <LockedMetricCard label="Monatliche Kreditrate" />
            </>
          )}
        </MetricGrid>
      </div>

      {/* Finanzierungsübersicht: nur für Basic+ */}
      {isBasic ? (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Finanzierung</p>
          <MetricGrid>
          <MetricCard label="Kaufnebenkosten" value={formatEuro(results.kaufnebenkosten)} size="sm" infoKuerzel="NK" />
          <MetricCard label="Gesamtinvestition" value={formatEuro(results.gesamtinvestition)} size="sm" color="blue" infoKuerzel="GI" />
          <MetricCard label="Darlehenssumme" value={formatEuro(results.darlehenssumme)} size="sm" />
          <MetricCard label="Monatliche Kosten" value={formatEuro(results.monatlicheKosten)} size="sm" />
          </MetricGrid>
        </div>
      ) : (
        /* Gesperrter Finanzierungsbereich für Free */
        <div className="relative rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <div className="blur-sm select-none pointer-events-none">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Finanzierung</p>
            <div className="grid grid-cols-2 gap-2">
              {['Kaufnebenkosten', 'Gesamtinvestition', 'Darlehenssumme', 'Monatliche Kosten'].map(l => (
                <div key={l} className="bg-white rounded-lg p-2 border border-border">
                  <p className="text-xs text-muted-foreground">{l}</p>
                  <p className="font-bold text-sm">– – –</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" />
            <p className="text-xs text-gray-500 font-medium">Basic oder höher</p>
          </div>
        </div>
      )}

      {/* Cashflow-Chart: immer sichtbar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Monatlicher Cashflow-Überblick
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={cashflowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(v: number) => [formatEuro(v), '']}
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {cashflowData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Basis-Szenarien: immer anzeigen */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basis-Szenarien</p>
          {isFree && <ProLockBadge />}
        </div>
        {isFree ? (
          /* Gesperrte Szenarien für Free */
          <div className="relative rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <div className="blur-sm select-none pointer-events-none space-y-2">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                <p className="font-semibold text-xs text-emerald-700">Buy & Hold – Vermietung</p>
                <p className="text-xs text-muted-foreground mt-0.5">Langfristige Vermietungsstrategie</p>
              </div>
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
                <p className="font-semibold text-xs text-amber-700">Eigennutzung</p>
                <p className="text-xs text-muted-foreground mt-0.5">Selbst einziehen statt vermieten</p>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <p className="text-xs text-gray-500 font-medium">Upgrade für Szenarien</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {results.szenarioVermietung && (
              <div className={`p-3 rounded-lg border border-emerald-200 bg-emerald-50`}>
                <p className="font-display font-semibold text-xs text-emerald-700">{results.szenarioVermietung.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{results.szenarioVermietung.beschreibung}</p>
                <p className="text-xs mt-1.5 text-foreground/70">{results.szenarioVermietung.details}</p>
              </div>
            )}
            {results.szenarioEigennutzung && (
              <div className={`p-3 rounded-lg border border-amber-200 bg-amber-50`}>
                <p className="font-display font-semibold text-xs text-amber-700">{results.szenarioEigennutzung.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{results.szenarioEigennutzung.beschreibung}</p>
                <p className="text-xs mt-1.5 text-foreground/70">{results.szenarioEigennutzung.details}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upsell-Banner für Free-User */}
      {isFree && (
        <div
          className="relative rounded-xl overflow-hidden border border-blue-200"
          style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1565C0 100%)' }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-white/70" />
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Mehr freischalten</p>
            </div>
            <p className="text-white font-display font-bold text-base mb-1">
              Vollständige Analyse & mehr Objekte
            </p>
            <p className="text-white/70 text-xs mb-4">
              Eigenkapitalrendite · AfA & Steuer · Szenarien · PDF-Export · Exposé · Email-Generator
            </p>
            {/* Feature-Chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[
                { icon: TrendingUp, text: 'Pro-Analyse' },
                { icon: FileText, text: 'PDF-Report' },
                { icon: Mail, text: 'Email-Generator' },
                { icon: Building2, text: 'Exposé' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                  <Icon className="w-3 h-3 text-blue-300" />
                  <span className="text-white/80 text-xs">{text}</span>
                </div>
              ))}
            </div>
            <Button
              className="bg-white text-blue-900 hover:bg-blue-50 h-9 text-sm font-semibold"
              onClick={() => navigate('/pricing')}
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Pläne ansehen
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* PDF-Export: nur für Basic+ */}
      <div className="flex gap-2">
        {isBasic ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onExportPDF}
          >
            Basis-PDF exportieren
          </Button>
        ) : (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">PDF-Export – Upgrade erforderlich</span>
            <ProLockBadge />
          </div>
        )}
        {isPro && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Vollständiges PDF im Pro-Tab</span>
          </div>
        )}
      </div>
    </div>
  );
}
