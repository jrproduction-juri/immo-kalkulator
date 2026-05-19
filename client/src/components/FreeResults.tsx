import { FreeResults as FreeResultsType, formatEuro, formatProzent } from '@/lib/calculations';
import { MetricCard, MetricGrid } from './MetricCard';
import { usePro } from '@/contexts/ProContext';
import { ProLockBadge } from './UpgradeModal';
import {
  CheckCircle2, AlertTriangle, XCircle, TrendingUp, Lock,
  ArrowRight, FileText, Mail, Building2, Brain, Zap, Shield
} from 'lucide-react';
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
      dotColor: '#10B981',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      textColor: '#10B981',
      subColor: 'var(--muted-foreground)',
    },
    pruefen: {
      icon: AlertTriangle,
      label: 'Prüfen empfohlen',
      dotColor: '#F59E0B',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      textColor: '#F59E0B',
      subColor: 'var(--muted-foreground)',
    },
    kritisch: {
      icon: XCircle,
      label: 'Kritisch bewerten',
      dotColor: '#EF4444',
      borderColor: 'rgba(239, 68, 68, 0.25)',
      bgColor: 'rgba(239, 68, 68, 0.08)',
      textColor: '#EF4444',
      subColor: 'var(--muted-foreground)',
    },
  };
  const c = config[empfehlung];
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl"
      style={{ background: c.bgColor, border: `1px solid ${c.borderColor}` }}
    >
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: c.dotColor, boxShadow: `0 0 8px ${c.dotColor}80` }}
        />
        <c.icon className="w-4 h-4" style={{ color: c.textColor }} />
      </div>
      <div>
        <p className="font-bold text-sm" style={{ color: c.textColor, fontFamily: 'Sora, sans-serif' }}>
          {c.label}
        </p>
        <p className="text-xs mt-0.5 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function LockedMetricCard({ label }: { label: string }) {
  return (
    <div
      className="relative rounded-xl p-3 overflow-hidden bg-muted border border-dashed border-border"
    >
      <div className="blur-sm select-none">
        <p className="text-xs mb-1 text-muted-foreground">{label}</p>
        <p className="font-bold text-lg text-foreground">– – –</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Lock className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden mt-2 bg-border"
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function FreeResultsPanel({ results, onExportPDF }: FreeResultsProps) {
  const { isPro, isBasic, isFree, setShowUpgradeModal } = usePro();
  const [, navigate] = useLocation();

  const cashflowData = [
    { name: 'Einnahmen', value: results.monatlicheEinnahmen, fill: '#10B981' },
    { name: 'Kreditrate', value: results.monatlicheRate, fill: '#3B82F6' },
    { name: 'Hausgeld+Rückl.', value: results.monatlicheKosten - results.monatlicheRate, fill: '#8B5CF6' },
    { name: 'Cashflow', value: Math.abs(results.nettoCashflowMonat), fill: results.nettoCashflowMonat >= 0 ? '#10B981' : '#EF4444' },
  ];

  const renditeColor = results.bruttomietrendite >= 5
    ? '#10B981'
    : results.bruttomietrendite >= 3.5
    ? '#F59E0B'
    : '#EF4444';

  const cashflowColor = results.nettoCashflowMonat >= 0 ? '#10B981'
    : results.nettoCashflowMonat >= -200 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="font-bold text-lg text-foreground"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Analyse-Ergebnis
          </h2>
          <p className="text-xs mt-0.5 text-muted-foreground">
            Basierend auf deinen Eingaben
          </p>
        </div>
        {isFree && (
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', border: '1px solid var(--border)'
            }}
          >
            Free
          </span>
        )}
      </div>

      {/* Empfehlung */}
      <EmpfehlungBanner empfehlung={results.empfehlung} text={results.empfehlungText} />

      {/* Kernkennzahlen */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted-foreground"
        >
          Kernkennzahlen
        </p>

        {/* Visual Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Bruttomietrendite */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--card)',
              border: `1px solid ${renditeColor}25`
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Bruttomietrendite</p>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: renditeColor, boxShadow: `0 0 6px ${renditeColor}80` }}
              />
            </div>
            <p
              className="font-bold text-2xl"
              style={{ fontFamily: 'IBM Plex Mono, monospace', color: renditeColor }}
            >
              {formatProzent(results.bruttomietrendite)}
            </p>
            <p className="text-xs mt-0.5 text-muted-foreground">
              {results.bruttomietrendite >= 5 ? 'sehr gut' : results.bruttomietrendite >= 3.5 ? 'akzeptabel' : 'kritisch'}
            </p>
            <ProgressBar value={results.bruttomietrendite} max={8} color={renditeColor} />
          </div>

          {/* Netto-Cashflow */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--card)',
              border: `1px solid ${cashflowColor}25`
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Cashflow/Monat</p>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: cashflowColor, boxShadow: `0 0 6px ${cashflowColor}80` }}
              />
            </div>
            <p
              className="font-bold text-2xl"
              style={{ fontFamily: 'IBM Plex Mono, monospace', color: cashflowColor }}
            >
              {results.nettoCashflowMonat >= 0 ? '+' : ''}{formatEuro(results.nettoCashflowMonat)}
            </p>
            <p className="text-xs mt-0.5 text-muted-foreground">
              {formatEuro(results.nettoCashflowJahr)} / Jahr
            </p>
            <ProgressBar
              value={Math.max(0, results.nettoCashflowMonat + 500)}
              max={1000}
              color={cashflowColor}
            />
          </div>
        </div>

        {/* Estimate Warning */}
        {results.usesEstimate && (
          <div
            className="p-3 rounded-lg flex gap-2 mb-3"
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#60A5FA' }} />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-primary">Automatische Schätzung</p>
              <p className="mt-1">
                Keine genauen Werte für Rücklagen angegeben — Schätzung: {formatEuro(results.estimatedEigentuemerkosten)}/Monat.
              </p>
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        <MetricGrid>
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

      {/* Finanzierungsübersicht */}
      {isBasic ? (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted-foreground"
          >
            Finanzierung
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Kaufnebenkosten', value: formatEuro(results.kaufnebenkosten) },
              { label: 'Gesamtinvestition', value: formatEuro(results.gesamtinvestition), highlight: true },
              { label: 'Darlehenssumme', value: formatEuro(results.darlehenssumme) },
              { label: 'Monatliche Kosten', value: formatEuro(results.monatlicheKosten) },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: 'var(--card)',
                  border: highlight ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                <p className="text-xs mb-1 text-muted-foreground">{label}</p>
                <p
                  className="font-bold text-sm"
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    color: highlight ? 'var(--primary)' : 'var(--foreground)'
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="relative rounded-xl p-4"
          style={{
            backgroundColor: 'var(--muted)',
            border: '1px dashed var(--border)'
          }}
        >
          <div className="blur-sm select-none pointer-events-none">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground"
            >
              Finanzierung
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Kaufnebenkosten', 'Gesamtinvestition', 'Darlehenssumme', 'Monatliche Kosten'].map(l => (
                <div
                  key={l}
                  className="rounded-lg p-2 bg-muted/50"
                >
                  <p className="text-xs text-muted-foreground">{l}</p>
                  <p className="font-bold text-sm text-foreground">– – –</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">
              Basic oder höher
            </p>
          </div>
        </div>
      )}

      {/* Cashflow-Chart */}
      <div
        className="bg-card border border-border rounded-xl p-4"
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted-foreground"
        >
          Monatlicher Cashflow-Überblick
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={cashflowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v: number) => [formatEuro(v), '']}
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                color: 'white'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {cashflowData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Basis-Szenarien */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Basis-Szenarien
          </p>
          {isFree && <ProLockBadge />}
        </div>
        {isFree ? (
          <div
            className="relative rounded-xl p-4"
            style={{
              backgroundColor: 'var(--muted)',
              border: '1px dashed var(--border)'
            }}
          >
            <div className="blur-sm select-none pointer-events-none space-y-2">
              <div
                className="p-3 rounded-lg"
                style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                <p className="font-semibold text-xs" style={{ color: '#10B981' }}>Buy & Hold</p>
                <p className="text-xs mt-0.5 text-muted-foreground">Langfristige Vermietung</p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
              >
                <p className="font-semibold text-xs" style={{ color: '#F59E0B' }}>Eigennutzungs-Strategie</p>
                <p className="text-xs mt-0.5 text-muted-foreground">Selbst nutzen & steuerfrei verkaufen</p>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Upgrade für Szenarien
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {results.szenarioVermietung && (
              <div
                className="p-3 rounded-lg"
                style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                <p className="font-bold text-xs" style={{ color: '#10B981', fontFamily: 'Sora, sans-serif' }}>
                  {results.szenarioVermietung.name}
                </p>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  {results.szenarioVermietung.beschreibung}
                </p>
                <p className="text-xs mt-1.5 text-muted-foreground">
                  {results.szenarioVermietung.details}
                </p>
              </div>
            )}
            {results.szenarioEigennutzung && (
              <div
                className="p-3 rounded-lg"
                style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
              >
                <p className="font-bold text-xs" style={{ color: '#F59E0B', fontFamily: 'Sora, sans-serif' }}>
                  {results.szenarioEigennutzung.name}
                </p>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  {results.szenarioEigennutzung.beschreibung}
                </p>
                <p className="text-xs mt-1.5 text-muted-foreground">
                  {results.szenarioEigennutzung.details}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Prompt for Free Users — subtle but clear */}
      {isFree && (
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'var(--primary)', opacity: 0.08
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 50% 60% at 100% 0%, rgba(245, 158, 11, 0.06) 0%, transparent 70%)'
            }}
          />
          <div className="relative p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4" style={{ color: '#60A5FA' }} />
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Pro freischalten
              </p>
            </div>
            <p
              className="font-bold text-base text-foreground mb-1"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Vollständige KI-Investmentanalyse &amp; Risiko-Report
            </p>
            <p className="text-xs mb-4 text-muted-foreground">
              Eigenkapitalrendite · AfA &amp; Steuer · Szenarien · PDF-Export · Exposé · Email-Generator
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[
                { icon: TrendingUp, text: 'Pro-Analyse' },
                { icon: Shield, text: 'Risiko-Score' },
                { icon: FileText, text: 'PDF-Report' },
                { icon: Mail, text: 'Email-Generator' },
                { icon: Building2, text: 'Exposé' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 border border-primary/20 text-primary"
                >
                  <Icon className="w-3 h-3" />
                  {text}
                </div>
              ))}
            </div>
            <button
              className="btn-gradient flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
              
              onClick={() => navigate('/pricing')}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              <Zap className="w-3.5 h-3.5" />
              Auf Pro upgraden
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* PDF-Export */}
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
          <div
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              border: '1px dashed var(--border)',
              backgroundColor: 'var(--muted)'
            }}
          >
            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              PDF-Export – Upgrade erforderlich
            </span>
            <ProLockBadge />
          </div>
        )}
        {isPro && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              Vollständiges PDF im Pro-Tab
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
