import { FreeResults as FreeResultsType, formatEuro, formatProzent } from '@/lib/calculations';
import { MetricCard, MetricGrid } from './MetricCard';
import { usePro } from '@/contexts/ProContext';
import { ProLockBadge } from './UpgradeModal';
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

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

function SzenarioCard({ szenario }: { szenario: NonNullable<FreeResultsType['szenarioVermietung']> }) {
  const colorMap = { positiv: 'border-emerald-200 bg-emerald-50', neutral: 'border-amber-200 bg-amber-50', negativ: 'border-red-200 bg-red-50' };
  const textMap = { positiv: 'text-emerald-700', neutral: 'text-amber-700', negativ: 'text-red-700' };
  return (
    <div className={`p-3 rounded-lg border ${colorMap[szenario.bewertung]}`}>
      <p className={`font-display font-semibold text-xs ${textMap[szenario.bewertung]}`}>{szenario.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{szenario.beschreibung}</p>
      <p className="text-xs mt-1.5 text-foreground/70">{szenario.details}</p>
    </div>
  );
}

export function FreeResultsPanel({ results, onExportPDF }: FreeResultsProps) {
  const { isPro, setShowUpgradeModal } = usePro();

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
        <div className="flex items-center gap-2">
          {!isPro && (
            <span className="text-xs text-muted-foreground">
              Free-Version
            </span>
          )}
        </div>
      </div>

      {/* Empfehlung */}
      <EmpfehlungBanner empfehlung={results.empfehlung} text={results.empfehlungText} />

      {/* Hauptkennzahlen */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kernkennzahlen</p>
        <MetricGrid>
          <MetricCard
            label="Bruttomietrendite"
            value={formatProzent(results.bruttomietrendite)}
            trend={results.bruttomietrendite >= 5 ? 'up' : results.bruttomietrendite >= 3.5 ? 'neutral' : 'down'}
            color={results.bruttomietrendite >= 5 ? 'success' : results.bruttomietrendite >= 3.5 ? 'warning' : 'danger'}
            highlight
          />
          <MetricCard
            label="Netto-Cashflow / Monat"
            value={formatEuro(results.nettoCashflowMonat)}
            subValue={`${formatEuro(results.nettoCashflowJahr)} / Jahr`}
            trend={results.nettoCashflowMonat >= 0 ? 'up' : 'down'}
            color={results.nettoCashflowMonat >= 0 ? 'success' : results.nettoCashflowMonat >= -200 ? 'warning' : 'danger'}
            highlight
          />
          <MetricCard
            label="Nettomietrendite"
            value={formatProzent(results.nettomietrendite)}
            color={results.nettomietrendite >= 3 ? 'success' : 'warning'}
          />
          <MetricCard
            label="Monatliche Kreditrate"
            value={formatEuro(results.monatlicheRate)}
            color="blue"
          />
        </MetricGrid>
      </div>

      {/* Finanzierungsübersicht */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Finanzierung</p>
        <MetricGrid>
          <MetricCard label="Kaufnebenkosten" value={formatEuro(results.kaufnebenkosten)} size="sm" />
          <MetricCard label="Gesamtinvestition" value={formatEuro(results.gesamtinvestition)} size="sm" color="blue" />
          <MetricCard label="Darlehenssumme" value={formatEuro(results.darlehenssumme)} size="sm" />
          <MetricCard label="Monatliche Kosten" value={formatEuro(results.monatlicheKosten)} size="sm" />
        </MetricGrid>
      </div>

      {/* Cashflow-Chart */}
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

      {/* Basis-Szenarien - immer anzeigen */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Basis-Szenarien</p>
        <div className="space-y-2">
          {results.szenarioVermietung && <SzenarioCard szenario={results.szenarioVermietung} />}
          {results.szenarioEigennutzung && <SzenarioCard szenario={results.szenarioEigennutzung} />}
        </div>
      </div>

      {/* Pro-Teaser */}
      {!isPro && (
        <div
          className="relative rounded-xl overflow-hidden border border-blue-200"
          style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1565C0 100%)' }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-white/70" />
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Pro-Features gesperrt</p>
            </div>
            <p className="text-white font-display font-bold text-base mb-1">
              Vollständige Analyse freischalten
            </p>
            <p className="text-white/70 text-xs mb-4">
              Steueroptimierung, 10-Jahres-Projektion, PDF-Export, Email-Generator & Exposé
            </p>
            <Button
              className="bg-white text-blue-900 hover:bg-blue-50 h-9 text-sm font-semibold"
              onClick={() => setShowUpgradeModal(true)}
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Pro freischalten – 29 €
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* PDF Export Free */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={onExportPDF}
        >
          Basis-PDF exportieren
        </Button>
        {!isPro && (
          <div className="flex items-center gap-1.5">
            <ProLockBadge />
            <span className="text-xs text-muted-foreground">Vollständiges PDF</span>
          </div>
        )}
      </div>
    </div>
  );
}
