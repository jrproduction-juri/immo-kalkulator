import { FormData, ProResults, formatEuro, formatProzent } from '@/lib/calculations';
import { exportExposePDF } from '@/lib/pdfExport';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Euro, TrendingUp, Star, FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'sonner';

interface ExposeGeneratorProps {
  formData: FormData;
  results: ProResults;
}

export function ExposeGenerator({ formData, results }: ExposeGeneratorProps) {
  const zustandLabel = {
    neu: 'Neubau / Erstbezug',
    renoviert: 'Renoviert / Gepflegt',
    renovierungsbeduerftig: 'Renovierungsbedürftig',
  }[formData.zustand];

  const highlights = formData.highlights
    ? formData.highlights.split(',').map(h => h.trim()).filter(Boolean)
    : ['Gute Lage', 'Solide Bausubstanz', 'Investitionspotenzial'];

  const cashflowData = [
    { name: 'Kaltmiete', value: formData.kaltmiete, fill: '#059669' },
    { name: 'Kreditrate', value: results.monatlicheRate, fill: '#1565C0' },
    { name: 'Nebenkosten', value: formData.hausgeld + formData.ruecklagen, fill: '#7C3AED' },
    { name: 'Cashflow', value: Math.abs(results.nettoCashflowMonat), fill: results.nettoCashflowMonat >= 0 ? '#059669' : '#DC2626' },
  ];

  const renditeData = [
    { name: 'Brutto', value: results.bruttomietrendite, fill: '#1565C0' },
    { name: 'Netto', value: results.nettomietrendite, fill: '#059669' },
    { name: 'EK-Rendite', value: Math.max(0, results.eigenkapitalrendite), fill: '#7C3AED' },
  ];

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportExposePDF(formData, results);
      toast.success('Exposé-PDF exportiert!', { description: 'Das PDF wurde in deinen Downloads gespeichert.' });
    } catch (e) {
      console.error('Exposé PDF error:', e);
      toast.error('PDF-Export fehlgeschlagen', { description: 'Bitte versuche es erneut.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="font-display font-bold text-sm">Exposé-Vorschau</h3>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleExport} disabled={isExporting}>
          {isExporting
            ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            : <FileDown className="w-3.5 h-3.5 mr-1.5" />
          }
          {isExporting ? 'Wird erstellt...' : 'Als PDF exportieren'}
        </Button>
      </div>

      {/* Exposé Preview */}
      <div
        id="expose-preview"
        className="border border-border rounded-xl overflow-hidden"
        style={{ background: 'white' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 text-white"
          style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1565C0 100%)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Investitions-Exposé</p>
              <h2 className="font-display font-bold text-xl leading-tight">
                Immobilie {formData.wohnflaeche} m²
              </h2>
              {formData.standort && (
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3 h-3 text-white/70" />
                  <span className="text-white/70 text-xs">{formData.standort}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Kaufpreis</p>
              <p className="font-display font-bold text-2xl num-display">{formatEuro(formData.kaufpreis)}</p>
            </div>
          </div>
        </div>

        {/* Eckdaten */}
        <div className="px-5 py-4 grid grid-cols-3 gap-3 bg-blue-50/50">
          {[
            { icon: Building2, label: 'Wohnfläche', value: `${formData.wohnflaeche} m²` },
            { icon: Euro, label: 'Kaltmiete', value: `${formatEuro(formData.kaltmiete)}/Mo.` },
            { icon: TrendingUp, label: 'Bruttomietrendite', value: formatProzent(results.bruttomietrendite) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-bold num-display text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Objektbeschreibung */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Objektbeschreibung</p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Diese {formData.wohnflaeche} m² große Immobilie{formData.standort ? ` in ${formData.standort}` : ''} aus dem Baujahr {formData.baujahr} befindet sich in {zustandLabel.toLowerCase()} Zustand. 
              Mit einer monatlichen Kaltmiete von {formatEuro(formData.kaltmiete)} erzielt das Objekt eine Bruttomietrendite von {formatProzent(results.bruttomietrendite)}.
              {results.nettoCashflowMonat >= 0 
                ? ` Der monatliche Netto-Cashflow beträgt ${formatEuro(results.nettoCashflowMonat)} und macht das Objekt zu einem attraktiven Kapitalanlage-Investment.`
                : ` Das Objekt bietet langfristiges Wertsteigerungspotenzial.`
              }
            </p>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Highlights</p>
              <div className="flex flex-wrap gap-1.5">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                    <Star className="w-2.5 h-2.5 text-blue-600" />
                    <span className="text-xs text-blue-700 font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cashflow Chart */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cashflow-Analyse</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={cashflowData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v: number) => [formatEuro(v), '']} contentStyle={{ fontSize: 10, borderRadius: 6 }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {cashflowData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rendite Chart */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rendite-Überblick</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={renditeData} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={50} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(2)}%`, '']} contentStyle={{ fontSize: 10, borderRadius: 6 }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {renditeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Investitionsdaten */}
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Investitionsdaten</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Kaufpreis', formatEuro(formData.kaufpreis)],
                ['Kaufnebenkosten', formatEuro(results.kaufnebenkosten)],
                ['Eigenkapital', formatEuro(formData.eigenkapital)],
                ['Darlehenssumme', formatEuro(results.darlehenssumme)],
                ['Monatliche Rate', formatEuro(results.monatlicheRate)],
                ['Cashflow/Monat', formatEuro(results.nettoCashflowMonat)],
                ['AfA/Jahr', formatEuro(results.afaJaehrlich)],
                ['Steuerersparnis/J.', formatEuro(results.steuerersparnis)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}:</span>
                  <span className="font-medium num-display">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              Erstellt mit ImmoRenditeTool · Alle Angaben ohne Gewähr · Stand: {new Date().toLocaleDateString('de-DE')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
