import { FormData, ProResults, formatEuro, formatProzent } from '@/lib/calculations';
import { exportExposePDF } from '@/lib/pdfExport';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Euro, TrendingUp, Star, FileDown, Loader2, Sparkles, RefreshCw, X, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

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

  // KI-Highlights State: null = noch nicht geladen, [] = leer, [...] = geladen
  const [aiHighlights, setAiHighlights] = useState<string[] | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const hasGeneratedRef = useRef(false);

  const generateHighlightsMutation = trpc.expose.generateHighlights.useMutation({
    onSuccess: (data) => {
      setAiHighlights(data.highlights);
    },
    onError: () => {
      // Fallback auf manuelle Highlights oder generische
      const fallback = formData.highlights
        ? formData.highlights.split(',').map((h: string) => h.trim()).filter(Boolean)
        : [];
      setAiHighlights(fallback.length > 0 ? fallback : ['Solide Kapitalanlage', 'Vermietetes Objekt', 'Langfristiges Investment']);
      toast.error('KI-Highlights konnten nicht generiert werden', { description: 'Generische Highlights werden angezeigt.' });
    },
  });

  // Beim ersten Rendern automatisch KI-Highlights generieren
  useEffect(() => {
    if (hasGeneratedRef.current) return;
    hasGeneratedRef.current = true;
    generateHighlightsMutation.mutate({
      kaufpreis: formData.kaufpreis,
      wohnflaeche: formData.wohnflaeche,
      baujahr: formData.baujahr,
      zustand: formData.zustand as 'neu' | 'renoviert' | 'renovierungsbeduerftig',
      ort: formData.standort || formData.ort || undefined,
      adresse: formData.adresse || undefined,
      zimmeranzahl: formData.zimmeranzahl || undefined,
      energieklasse: formData.energieklasse || undefined,
      kaltmiete: formData.kaltmiete,
      nettoCashflowMonat: results.nettoCashflowMonat,
      bruttomietrendite: results.bruttomietrendite,
      nettomietrendite: results.nettomietrendite,
      eigenkapitalrendite: results.eigenkapitalrendite ?? undefined,
      gesamtinvestition: results.gesamtinvestition,
      objekttyp: formData.objekttyp || undefined,
      beschreibung: formData.beschreibung || undefined,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegenerate = () => {
    setAiHighlights(null);
    generateHighlightsMutation.mutate({
      kaufpreis: formData.kaufpreis,
      wohnflaeche: formData.wohnflaeche,
      baujahr: formData.baujahr,
      zustand: formData.zustand as 'neu' | 'renoviert' | 'renovierungsbeduerftig',
      ort: formData.standort || formData.ort || undefined,
      adresse: formData.adresse || undefined,
      zimmeranzahl: formData.zimmeranzahl || undefined,
      energieklasse: formData.energieklasse || undefined,
      kaltmiete: formData.kaltmiete,
      nettoCashflowMonat: results.nettoCashflowMonat,
      bruttomietrendite: results.bruttomietrendite,
      nettomietrendite: results.nettomietrendite,
      eigenkapitalrendite: results.eigenkapitalrendite ?? undefined,
      gesamtinvestition: results.gesamtinvestition,
      objekttyp: formData.objekttyp || undefined,
      beschreibung: formData.beschreibung || undefined,
    });
  };

  const handleEditSave = (index: number) => {
    if (!aiHighlights) return;
    const updated = [...aiHighlights];
    updated[index] = editValue.trim();
    setAiHighlights(updated.filter(Boolean));
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (!aiHighlights) return;
    setAiHighlights(aiHighlights.filter((_, i) => i !== index));
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setAiHighlights([...(aiHighlights ?? []), newHighlight.trim()]);
    setNewHighlight('');
    setShowAddInput(false);
  };

  const isLoading = generateHighlightsMutation.isPending || aiHighlights === null;
  const displayHighlights = aiHighlights ?? [];

  const cashflowData = [
    { name: 'Kaltmiete', value: formData.kaltmiete, fill: '#059669' },
    { name: 'Kreditrate', value: results.monatlicheRate, fill: '#1565C0' },
    { name: 'Nebenkosten', value: formData.hausgeld + formData.ruecklagen, fill: '#7C3AED' },
    { name: 'Cashflow', value: Math.abs(results.nettoCashflowMonat), fill: results.nettoCashflowMonat >= 0 ? '#059669' : '#DC2626' },
  ];

  const renditeData = [
    { name: 'Brutto', value: results.bruttomietrendite, fill: '#1565C0' },
    { name: 'Netto', value: results.nettomietrendite, fill: '#059669' },
    { name: 'EK-Rendite', value: Math.max(0, results.eigenkapitalrendite ?? 0), fill: '#7C3AED' },
  ];

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Aktuelle KI-Highlights in formData einbetten für PDF
      const formDataWithHighlights = {
        ...formData,
        highlights: displayHighlights.join(', '),
      };
      await exportExposePDF(formDataWithHighlights, results);
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

          {/* KI-Highlights */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Highlights</p>
                {!isLoading && (
                  <span className="flex items-center gap-0.5 text-[10px] text-blue-500 font-medium">
                    <Sparkles className="w-2.5 h-2.5" />
                    KI
                  </span>
                )}
              </div>
              {!isLoading && (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-blue-600 transition-colors"
                  title="Neu generieren"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Neu
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 py-3">
                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-xs text-muted-foreground">KI analysiert das Objekt...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5">
                  {displayHighlights.map((h, i) => (
                    <div key={i} className="group flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 hover:border-blue-300 transition-colors">
                      {editingIndex === i ? (
                        <input
                          autoFocus
                          className="text-xs text-blue-700 font-medium bg-transparent outline-none w-28"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave(i)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleEditSave(i);
                            if (e.key === 'Escape') setEditingIndex(null);
                          }}
                        />
                      ) : (
                        <>
                          <Star className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                          <span
                            className="text-xs text-blue-700 font-medium cursor-pointer"
                            onClick={() => { setEditingIndex(i); setEditValue(h); }}
                            title="Klicken zum Bearbeiten"
                          >
                            {h}
                          </span>
                          <button
                            onClick={() => handleDelete(i)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                            title="Entfernen"
                          >
                            <X className="w-2.5 h-2.5 text-blue-400 hover:text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Hinzufügen-Button */}
                  {!showAddInput && displayHighlights.length < 6 && (
                    <button
                      onClick={() => setShowAddInput(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-blue-200 text-blue-400 hover:border-blue-400 hover:text-blue-600 transition-colors text-xs"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      Hinzufügen
                    </button>
                  )}
                </div>

                {showAddInput && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      autoFocus
                      className="text-xs border border-blue-200 rounded-full px-2.5 py-1 outline-none focus:border-blue-400 w-40"
                      placeholder="Neues Highlight..."
                      value={newHighlight}
                      onChange={e => setNewHighlight(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddHighlight();
                        if (e.key === 'Escape') setShowAddInput(false);
                      }}
                    />
                    <button onClick={handleAddHighlight} className="text-xs text-blue-600 hover:text-blue-800 font-medium">OK</button>
                    <button onClick={() => setShowAddInput(false)} className="text-xs text-muted-foreground hover:text-foreground">Abbrechen</button>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground/60 mt-1">Klicke auf ein Highlight zum Bearbeiten · Hover zum Löschen</p>
              </div>
            )}
          </div>

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
