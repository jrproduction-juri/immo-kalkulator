/**
 * PlzMietempfehlung – PLZ-Eingabe mit KI-gestützter Mietpreisempfehlung
 * Zeigt Ø Kaltmiete/m² für die Region und berechnet empfohlene Kaltmiete.
 * Nutzer kann den Vorschlag per Button übernehmen.
 */
import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { MapPin, Loader2, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

interface PlzMietempfehlungProps {
  wohnflaeche: number;
  onVorschlagUebernehmen: (kaltmiete: number) => void;
  className?: string;
}

export function PlzMietempfehlung({ wohnflaeche, onVorschlagUebernehmen, className }: PlzMietempfehlungProps) {
  const [plz, setPlz] = useState('');
  const [enabledPlz, setEnabledPlz] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Query wird nur ausgelöst wenn enabledPlz gesetzt (5-stellige PLZ)
  const query = trpc.plz.getMietempfehlung.useQuery(
    { plz: enabledPlz ?? '', wohnflaeche: wohnflaeche > 0 ? wohnflaeche : 70 },
    {
      enabled: !!enabledPlz && enabledPlz.length === 5,
      staleTime: 1000 * 60 * 10, // 10 min cachen
      retry: 1,
    }
  );

  // Debounce: Query erst nach 800ms Tipp-Pause auslösen
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setAccepted(false);
    if (plz.length === 5 && /^\d{5}$/.test(plz)) {
      debounceRef.current = setTimeout(() => {
        setEnabledPlz(plz);
      }, 800);
    } else {
      setEnabledPlz(null);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [plz]);

  // Wenn sich Wohnfläche ändert → Query neu auslösen
  useEffect(() => {
    if (enabledPlz) {
      query.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wohnflaeche]);

  const handleUebernehmen = () => {
    if (!query.data) return;
    onVorschlagUebernehmen(query.data.empfohleneKaltmiete);
    setAccepted(true);
  };

  const isLoading = query.isFetching;
  const hasData = !!query.data && !isLoading;
  const hasError = !!query.error && !isLoading;

  return (
    <div className={cn('space-y-2', className)}>
      {/* PLZ-Eingabe */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Label className="text-xs font-medium text-gray-700">PLZ (für Mietpreisempfehlung)</Label>
          <MapPin className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="relative">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            value={plz}
            onChange={e => setPlz(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="z.B. 80331"
            className="h-9 text-sm pr-8"
          />
          {isLoading && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />
          )}
          {hasData && !isLoading && (
            <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500" />
          )}
        </div>
      </div>

      {/* Ergebnis-Box */}
      {isLoading && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-100">
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
          <p className="text-xs text-blue-700">KI ermittelt Mietpreise für {plz}…</p>
        </div>
      )}

      {hasError && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">PLZ nicht gefunden. Bitte prüfe die Eingabe.</p>
        </div>
      )}

      {hasData && query.data && (
        <div className={cn(
          'px-3 py-3 rounded-xl border transition-all',
          accepted
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-blue-50 border-blue-100'
        )}>
          {/* Ort + Mietpreis */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs font-semibold text-gray-800">
                {query.data.ort}
                {query.data.bundesland && (
                  <span className="text-gray-500 font-normal"> · {query.data.bundesland}</span>
                )}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Ø {query.data.mietpreisProQm.toFixed(2)} €/m²
                {query.data.preisspanne && (
                  <span> ({query.data.preisspanne.min.toFixed(0)}–{query.data.preisspanne.max.toFixed(0)} €/m²)</span>
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-blue-700 num-display">
                {query.data.empfohleneKaltmiete.toLocaleString('de-DE')} €
              </p>
              <p className="text-[10px] text-gray-500">empf. Kaltmiete/Mo</p>
            </div>
          </div>

          {/* Formel */}
          <p className="text-[10px] text-gray-400 mb-2">
            {wohnflaeche > 0 ? wohnflaeche : 70} m² × {query.data.mietpreisProQm.toFixed(2)} €/m² = {query.data.empfohleneKaltmiete.toLocaleString('de-DE')} €
          </p>

          {/* Vorschlag übernehmen */}
          {accepted ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-xs text-emerald-700 font-medium">Kaltmiete übernommen</p>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleUebernehmen}
            >
              <ArrowRight className="w-3 h-3 mr-1.5" />
              Vorschlag übernehmen ({query.data.empfohleneKaltmiete.toLocaleString('de-DE')} €)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
