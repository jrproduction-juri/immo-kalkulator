/**
 * InvestmentBewertung – Ampelsystem mit Stärken, Risiken und Potenzialen
 * Zeigt einen Gesamtscore (0–100) und eine farbliche Ampelbewertung.
 */
import { InvestmentBewertung as InvestmentBewertungType } from '@/lib/calculations';
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, ShieldAlert, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentBewertungProps {
  bewertung: InvestmentBewertungType;
}

function ScoreRing({ score, ampel }: { score: number; ampel: 'gruen' | 'gelb' | 'rot' }) {
  const colorMap = {
    gruen: { stroke: '#059669', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    gelb:  { stroke: '#D97706', text: 'text-amber-700',   bg: 'bg-amber-50' },
    rot:   { stroke: '#DC2626', text: 'text-red-700',     bg: 'bg-red-50' },
  };
  const c = colorMap[ampel];
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative w-24 h-24 flex items-center justify-center rounded-full', c.bg)}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
        {/* Hintergrundring */}
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        {/* Score-Ring */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={c.stroke}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <p className={cn('text-2xl font-bold num-display leading-none', c.text)}>{score}</p>
        <p className="text-[10px] text-gray-500">/ 100</p>
      </div>
    </div>
  );
}

function ListSection({
  title,
  items,
  icon: Icon,
  colorClass,
  emptyText,
}: {
  title: string;
  items: string[];
  icon: React.ElementType;
  colorClass: string;
  emptyText: string;
}) {
  return (
    <div>
      <div className={cn('flex items-center gap-2 mb-2')}>
        <Icon className={cn('w-4 h-4', colorClass)} />
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</p>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic pl-6">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5 pl-6">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={cn('mt-1 w-1.5 h-1.5 rounded-full shrink-0', colorClass.replace('text-', 'bg-'))} />
              <p className="text-xs text-foreground leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function InvestmentBewertungPanel({ bewertung }: InvestmentBewertungProps) {
  const ampelConfig = {
    gruen: {
      label: 'Gutes Investment',
      icon: CheckCircle2,
      headerBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
    gelb: {
      label: 'Prüfen',
      icon: AlertTriangle,
      headerBg: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-800',
    },
    rot: {
      label: 'Kritisch',
      icon: XCircle,
      headerBg: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      badgeBg: 'bg-red-100 text-red-800',
    },
  };

  const c = ampelConfig[bewertung.ampel];
  const AmpelIcon = c.icon;

  return (
    <div className="space-y-5 animate-slide-in-up">
      {/* Ampel-Header mit Score */}
      <div className={cn('p-4 rounded-2xl border', c.headerBg)}>
        <div className="flex items-center gap-4">
          {/* Score-Ring */}
          <ScoreRing score={bewertung.gesamtScore} ampel={bewertung.ampel} />

          {/* Ampel-Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AmpelIcon className={cn('w-5 h-5', c.iconColor)} />
              <p className={cn('text-lg font-bold', c.textColor)}>{c.label}</p>
            </div>
            <p className={cn('text-xs leading-relaxed', c.textColor, 'opacity-80')}>
              {bewertung.ampelBeschreibung}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
              {bewertung.empfehlungKurz}
            </p>
          </div>
        </div>

        {/* Score-Legende */}
        <div className="mt-3 flex gap-3">
          {[
            { label: 'Kritisch', range: '0–39', color: 'bg-red-400' },
            { label: 'Prüfen', range: '40–64', color: 'bg-amber-400' },
            { label: 'Gut', range: '65–100', color: 'bg-emerald-400' },
          ].map(({ label, range, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', color)} />
              <span className="text-[10px] text-muted-foreground">{label} ({range})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stärken */}
      <div className="bg-card border border-border rounded-xl p-4">
        <ListSection
          title="Stärken"
          items={bewertung.staerken}
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          emptyText="Keine besonderen Stärken identifiziert."
        />
      </div>

      {/* Risiken */}
      <div className="bg-card border border-border rounded-xl p-4">
        <ListSection
          title="Risiken"
          items={bewertung.risiken}
          icon={ShieldAlert}
          colorClass="text-red-500"
          emptyText="Keine kritischen Risiken identifiziert."
        />
      </div>

      {/* Potenziale */}
      <div className="bg-card border border-border rounded-xl p-4">
        <ListSection
          title="Potenziale"
          items={bewertung.potenziale}
          icon={Lightbulb}
          colorClass="text-blue-500"
          emptyText="Keine besonderen Potenziale identifiziert."
        />
      </div>

      {/* Hinweis */}
      <p className="text-[10px] text-muted-foreground text-center px-2">
        Die Investment-Bewertung basiert auf den eingegebenen Kennzahlen und dient als Orientierungshilfe. Sie ersetzt keine professionelle Immobilienberatung.
      </p>
    </div>
  );
}
