import { ProResults as ProResultsType, RisikoFaktor, formatEuro, formatProzent, formatZahl } from '@/lib/calculations';
import { MetricCard, MetricGrid } from './MetricCard';
import { Crown, TrendingUp, Shield, AlertTriangle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, AreaChart, Area
} from 'recharts';
import { cn } from '@/lib/utils';

interface ProResultsProps {
  results: ProResultsType;
}

function SzenarioCard({ szenario }: { szenario: NonNullable<ProResultsType['szenarioFlipSanieren']> }) {
  const colorMap = { positiv: 'border-emerald-200 bg-emerald-50', neutral: 'border-amber-200 bg-amber-50', negativ: 'border-red-200 bg-red-50' };
  const textMap = { positiv: 'text-emerald-700', neutral: 'text-amber-700', negativ: 'text-red-700' };
  const BewertungIcon = szenario.bewertung === 'positiv' ? CheckCircle2 : szenario.bewertung === 'neutral' ? AlertTriangle : XCircle;
  return (
    <div className={`p-4 rounded-xl border ${colorMap[szenario.bewertung]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`font-display font-bold text-sm ${textMap[szenario.bewertung]}`}>{szenario.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{szenario.beschreibung}</p>
        </div>
        <BewertungIcon className={`w-4 h-4 shrink-0 ${textMap[szenario.bewertung]}`} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {szenario.cashflowMonat !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground">Cashflow/Monat</p>
            <p className={`text-sm font-bold num-display ${szenario.cashflowMonat >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatEuro(szenario.cashflowMonat)}
            </p>
          </div>
        )}
        {szenario.rendite !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground">Rendite</p>
            <p className="text-sm font-bold num-display text-blue-700">{formatProzent(szenario.rendite)}</p>
          </div>
        )}
        {szenario.gewinnNachSteuer !== undefined && (
          <div>
            <p className="text-xs text-muted-foreground">Gewinn (nach Steuer)</p>
            <p className={`text-sm font-bold num-display ${szenario.gewinnNachSteuer >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatEuro(szenario.gewinnNachSteuer)}
            </p>
          </div>
        )}
        {szenario.dauer && (
          <div>
            <p className="text-xs text-muted-foreground">Zeithorizont</p>
            <p className="text-sm font-medium text-foreground">{szenario.dauer}</p>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-current/10">{szenario.details}</p>
    </div>
  );
}

/** Einzelner Risikofaktor mit Punktanzeige */
function RisikoItem({ faktor }: { faktor: RisikoFaktor }) {
  const colorMap = {
    niedrig: { icon: 'text-emerald-600', bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Niedrig' },
    mittel:  { icon: 'text-amber-600',   bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Mittel' },
    hoch:    { icon: 'text-red-600',     bg: 'bg-red-100',     text: 'text-red-700',     label: 'Hoch' },
  };
  const c = colorMap[faktor.level];

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <Shield className={cn('w-4 h-4 shrink-0 mt-0.5', c.icon)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-foreground">{faktor.label}</p>
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0', c.bg, c.text)}>
            {c.label} · {faktor.punkte}/3
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{faktor.text}</p>
      </div>
    </div>
  );
}

/** Risiko-Gesamtbewertung mit Balken */
function RisikoGesamtBewertung({ gesamt, gesamtPunkte }: { gesamt: 'niedrig' | 'mittel' | 'hoch'; gesamtPunkte: number }) {
  const config = {
    niedrig: { label: 'Niedriges Risiko', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500', icon: CheckCircle2 },
    mittel:  { label: 'Mittleres Risiko', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   bar: 'bg-amber-500',   icon: AlertTriangle },
    hoch:    { label: 'Hohes Risiko',     color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     bar: 'bg-red-500',     icon: AlertCircle },
  };
  const c = config[gesamt];
  const Icon = c.icon;
  // Balken: 1.0 = 0%, 3.0 = 100%
  const barWidth = Math.round(((gesamtPunkte - 1) / 2) * 100);

  return (
    <div className={cn('p-4 rounded-xl border mb-4', c.bg, c.border)}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-5 h-5', c.color)} />
          <div>
            <p className={cn('text-sm font-bold', c.color)}>{c.label}</p>
            <p className="text-[11px] text-muted-foreground">Durchschnitt: {gesamtPunkte.toFixed(1)} / 3.0 Punkte</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-2xl font-bold num-display', c.color)}>{gesamtPunkte.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">von 3.0</p>
        </div>
      </div>
      {/* Risiko-Balken */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', c.bar)}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-emerald-600 font-medium">Niedrig ≤ 1.5</span>
        <span className="text-[10px] text-amber-600 font-medium">Mittel 1.5–2.3</span>
        <span className="text-[10px] text-red-600 font-medium">Hoch &gt; 2.3</span>
      </div>
    </div>
  );
}

export function ProResultsPanel({ results }: ProResultsProps) {
  const projektion = results.projektion10J;

  const risikoColor = {
    niedrig: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    mittel: 'text-amber-600 bg-amber-50 border-amber-200',
    hoch: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Pro Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
        <Crown className="w-4 h-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-800">Pro-Analyse aktiv</p>
      </div>

      {/* Erweiterte Kennzahlen */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Erweiterte Kennzahlen</p>
        <MetricGrid>
          <MetricCard
            label="Eigenkapitalrendite"
            value={formatProzent(results.eigenkapitalrendite)}
            trend={(results.eigenkapitalrendite ?? 0) >= 8 ? 'up' : (results.eigenkapitalrendite ?? 0) >= 4 ? 'neutral' : 'down'}
            color={(results.eigenkapitalrendite ?? 0) >= 8 ? 'success' : (results.eigenkapitalrendite ?? 0) >= 4 ? 'warning' : 'danger'}
            highlight
            infoKuerzel="EKR"
          />
          <MetricCard
            label="Cashflow nach Steuer"
            value={formatEuro(results.cashflowNachSteuer)}
            subValue={results.cashflowNachSteuer < results.nettoCashflowMonat ? `Steuerlast: ${formatEuro((results.nettoCashflowMonat - results.cashflowNachSteuer))} / Mo` : `Steuervorteil: +${formatEuro((results.cashflowNachSteuer - results.nettoCashflowMonat))} / Mo`}
            trend={results.cashflowNachSteuer >= 0 ? 'up' : 'down'}
            color={results.cashflowNachSteuer >= 0 ? 'success' : 'warning'}
            highlight
          />
          <MetricCard
            label="Preis / m²"
            value={`${formatZahl(results.preisProQm)} €`}
            size="sm"
            color="blue"
            infoKuerzel="P/m²"
          />
          <MetricCard
            label="Vervielfältiger"
            value={`${results.vervielfaeltiger.toFixed(1)}x`}
            subValue="Kaufpreis / Jahreskaltmiete"
            size="sm"
            color={results.vervielfaeltiger <= 20 ? 'success' : results.vervielfaeltiger <= 30 ? 'warning' : 'danger'}
            infoKuerzel="VV"
          />
        </MetricGrid>
      </div>

      {/* Steuer */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Steueroptimierung</p>
        <MetricGrid>
          <MetricCard
            label="AfA (jährlich)"
            value={formatEuro(results.afaJaehrlich)}
            subValue="Steuerliche Abschreibung"
            size="sm"
            color="blue"
            infoKuerzel="AfA"
          />
          <MetricCard
            label={results.steuerersparnis >= 0 ? 'Steuervorteil / Jahr' : 'Steuerlast / Jahr'}
            value={formatEuro(Math.abs(results.steuerersparnis))}
            subValue={`= ${formatEuro(Math.abs(results.steuerersparnis / 12))} / Monat`}
            size="sm"
            color={results.steuerersparnis >= 0 ? 'success' : 'warning'}
            trend={results.steuerersparnis >= 0 ? 'up' : 'down'}
            infoKuerzel="SE"
          />
        </MetricGrid>
        {results.steuerfreierVerkaufMoeglich && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">Steuerfreier Verkauf möglich</p>
              <p className="text-xs text-emerald-600">Bei mind. 24 Monaten Eigennutzung im Verkaufsjahr und den 2 Vorjahren: Spekulationssteuer = 0 €</p>
            </div>
          </div>
        )}
      </div>

      {/* Zielrendite-Analyse */}
      {results.zielrenditeAnalyse && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Zielrendite-Analyse</p>
          <div className={`p-4 rounded-xl border ${
            results.zielrenditeAnalyse.bewertung === 'gleich' ? 'border-emerald-200 bg-emerald-50' :
            results.zielrenditeAnalyse.bewertung === 'ueber'  ? 'border-red-200 bg-red-50' :
                                                                'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-start gap-2 mb-3">
              <TrendingUp className={`w-4 h-4 shrink-0 mt-0.5 ${
                results.zielrenditeAnalyse.bewertung === 'gleich' ? 'text-emerald-600' :
                results.zielrenditeAnalyse.bewertung === 'ueber'  ? 'text-red-600' : 'text-blue-600'
              }`} />
              <p className={`text-xs font-medium ${
                results.zielrenditeAnalyse.bewertung === 'gleich' ? 'text-emerald-800' :
                results.zielrenditeAnalyse.bewertung === 'ueber'  ? 'text-red-800' : 'text-blue-800'
              }`}>
                {results.zielrenditeAnalyse.bewertungstext}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Aktuelle BMR</p>
                <p className="text-sm font-bold num-display text-foreground">{formatProzent(results.zielrenditeAnalyse.bruttomietrendite)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Zielrendite</p>
                <p className="text-sm font-bold num-display text-blue-700">{formatProzent(results.zielrenditeAnalyse.zielRendite)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max. Kaufpreis</p>
                <p className="text-sm font-bold num-display text-emerald-700">{formatEuro(results.zielrenditeAnalyse.maxKaufpreisZielrendite)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Preisabweichung</p>
                <p className={`text-sm font-bold num-display ${
                  results.zielrenditeAnalyse.preisabweichung > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {results.zielrenditeAnalyse.preisabweichung >= 0 ? '+' : ''}{formatEuro(results.zielrenditeAnalyse.preisabweichung)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erweiterte Szenarien */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Erweiterte Szenarien</p>
        <div className="space-y-3">
          {results.szenarioFlipSanieren && <SzenarioCard szenario={results.szenarioFlipSanieren} />}
          {results.szenarioVerkauf24Monate && <SzenarioCard szenario={results.szenarioVerkauf24Monate} />}
          {results.szenarioBuyHold10J && <SzenarioCard szenario={results.szenarioBuyHold10J} />}
        </div>
      </div>

      {/* 10-Jahres-Projektion Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          10-Jahres-Projektion
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={projektion} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorImmobilie" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1565C0" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="jahr" tick={{ fontSize: 10 }} tickFormatter={v => `J${v}`} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: number, name: string) => [formatEuro(v, true), name]}
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="immobilienwert" name="Immobilienwert" stroke="#1565C0" fill="url(#colorImmobilie)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="eigenkapital" name="Eigenkapital" stroke="#059669" fill="url(#colorEK)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="restschuld" name="Restschuld" stroke="#DC2626" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gesamtrendite Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Gesamtrendite auf Eigenkapital (%)
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={projektion} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="jahr" tick={{ fontSize: 10 }} tickFormatter={v => `J${v}`} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={(v: number) => [`${v}%`, 'Gesamtrendite']}
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
            />
            <Bar dataKey="gesamtrendite" name="Gesamtrendite" radius={[3, 3, 0, 0]}>
              {projektion.map((entry, i) => (
                <Cell key={i} fill={entry.gesamtrendite >= 0 ? '#1565C0' : '#DC2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Risiko-Analyse (neues Durchschnitts-Modell) ─────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risiko-Analyse</p>

        {/* Gesamtbewertung mit Balken */}
        <RisikoGesamtBewertung
          gesamt={results.risikoBewertung.gesamt}
          gesamtPunkte={results.risikoBewertung.gesamtPunkte}
        />

        {/* Einzelne Faktoren */}
        <div>
          {results.risikoBewertung.faktoren?.map((f, i) => (
            <RisikoItem key={i} faktor={f} />
          )) ?? (
            <>
              <RisikoItem faktor={{ label: 'Zinsänderungsrisiko', text: results.risikoBewertung.zinsaenderung, level: 'mittel', punkte: 2 }} />
              <RisikoItem faktor={{ label: 'Mietausfallrisiko', text: results.risikoBewertung.mietausfall, level: 'mittel', punkte: 2 }} />
              <RisikoItem faktor={{ label: 'Sanierungsrisiko', text: results.risikoBewertung.sanierungsrisiko, level: 'mittel', punkte: 2 }} />
              <RisikoItem faktor={{ label: 'Lageentwicklung', text: results.risikoBewertung.lage, level: 'mittel', punkte: 2 }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
