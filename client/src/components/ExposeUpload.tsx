/**
 * ExposeUpload – Drag & Drop Upload für Exposés (PDF, JPG, PNG)
 * KI analysiert das Dokument und extrahiert Immobiliendaten.
 * Nutzer kann die erkannten Felder in einem Bestätigungs-Dialog übernehmen.
 */
import { useState, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import {
  Upload, FileText, Image as ImageIcon, Loader2, CheckCircle2,
  AlertCircle, X, ChevronRight, Sparkles, Lock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Felder die aus dem Exposé extrahiert werden können
interface ExtractedData {
  kaufpreis?: number | null;
  wohnflaeche?: number | null;
  zimmeranzahl?: number | null;
  baujahr?: number | null;
  hausgeld?: number | null;
  kaltmiete?: number | null;
  adresse?: string | null;
  ort?: string | null;
  plz?: string | null;
  energieklasse?: string | null;
  stellplaetze?: number | null;
  grundstueckFlaeche?: number | null;
  beschreibung?: string | null;
}

interface ExposeUploadProps {
  onDataExtracted: (data: ExtractedData) => void;
  className?: string;
}

const FIELD_LABELS: Record<keyof ExtractedData, string> = {
  kaufpreis: 'Kaufpreis',
  wohnflaeche: 'Wohnfläche (m²)',
  zimmeranzahl: 'Zimmeranzahl',
  baujahr: 'Baujahr',
  hausgeld: 'Hausgeld (€/Mo)',
  kaltmiete: 'Kaltmiete (€/Mo)',
  adresse: 'Adresse',
  ort: 'Ort',
  plz: 'PLZ',
  energieklasse: 'Energieklasse',
  stellplaetze: 'Stellplätze',
  grundstueckFlaeche: 'Grundstücksfläche (m²)',
  beschreibung: 'Beschreibung',
};

function formatValue(key: keyof ExtractedData, value: unknown): string {
  if (value === null || value === undefined) return '–';
  if (key === 'kaufpreis') return `${Number(value).toLocaleString('de-DE')} €`;
  if (key === 'hausgeld' || key === 'kaltmiete') return `${Number(value).toLocaleString('de-DE')} €/Mo`;
  if (key === 'wohnflaeche' || key === 'grundstueckFlaeche') return `${value} m²`;
  return String(value);
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 10;

export function ExposeUpload({ onDataExtracted, className }: ExposeUploadProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Plan-Check: nur Pro und Investor dürfen hochladen
  const plan = user?.plan ?? 'none';
  const hasAccess = plan === 'pro' || plan === 'investor';

  // Lock-Overlay für none/basic
  if (!hasAccess) {
    return (
      <div className={cn(
        'relative rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8',
        'flex flex-col items-center justify-center gap-4 text-center',
        className
      )}>
        {/* Gesperrtes Overlay */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <Lock className="w-7 h-7 text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-700 text-base">Exposé-Upload (Pro-Feature)</p>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Lade ein Exposé hoch und lass die KI alle Immobiliendaten automatisch ausfüllen.
              Verfügbar ab dem <strong>Pro-Plan</strong>.
            </p>
          </div>
          <Button
            size="sm"
            className="mt-1 bg-slate-900 hover:bg-slate-800 text-white"
            onClick={() => navigate('/pricing')}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Jetzt upgraden
          </Button>
        </div>
      </div>
    );
  }

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<keyof ExtractedData>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractMutation = trpc.expose.extractData.useMutation({
    onSuccess: (result) => {
      const data = result.data as ExtractedData;
      setExtractedData(data);
      // Alle nicht-null Felder vorselektieren
      const preSelected = new Set<keyof ExtractedData>(
        (Object.keys(data) as Array<keyof ExtractedData>).filter(k => data[k] !== null && data[k] !== undefined)
      );
      setSelectedFields(preSelected);
      setShowConfirmDialog(true);
    },
    onError: (err) => {
      toast.error('KI-Analyse fehlgeschlagen', { description: err.message });
    },
  });

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Nicht unterstütztes Format', { description: 'Bitte PDF, JPG oder PNG hochladen.' });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error('Datei zu groß', { description: `Maximal ${MAX_SIZE_MB} MB erlaubt.` });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setExtractedData(null);

    try {
      // Datei als Data-URL für KI-Analyse vorbereiten
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadedUrl(dataUrl);
      setIsUploading(false);

      // KI-Extraktion starten
      toast.loading('KI analysiert das Exposé…', { id: 'expose-extract' });
      await extractMutation.mutateAsync({
        fileUrl: dataUrl,
        mimeType: file.type as 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp',
      });
      toast.dismiss('expose-extract');
      toast.success('Exposé analysiert', { description: 'Bitte Felder prüfen und übernehmen.' });
    } catch {
      setIsUploading(false);
      toast.dismiss('expose-extract');
    }
  }, [extractMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const toggleField = (key: keyof ExtractedData) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleConfirm = () => {
    if (!extractedData) return;
    const toApply: ExtractedData = {};
    selectedFields.forEach(key => {
      (toApply as any)[key] = extractedData[key];
    });
    onDataExtracted(toApply);
    setShowConfirmDialog(false);
    toast.success('Felder übernommen', { description: `${selectedFields.size} Felder aus dem Exposé übertragen.` });
  };

  const handleReset = () => {
    setUploadedFile(null);
    setUploadedUrl(null);
    setExtractedData(null);
    setIsUploading(false);
  };

  const isAnalyzing = extractMutation.isPending;
  const hasResult = !!extractedData;

  // Felder mit Werten für die Anzeige
  const fieldsWithValues = extractedData
    ? (Object.keys(extractedData) as Array<keyof ExtractedData>).filter(
        k => extractedData[k] !== null && extractedData[k] !== undefined
      )
    : [];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload-Zone */}
      {!uploadedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Exposé hochladen</p>
              <p className="text-xs text-muted-foreground mt-0.5">PDF, JPG oder PNG · max. {MAX_SIZE_MB} MB</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <p className="text-xs text-amber-700 font-medium">KI extrahiert Daten automatisch</p>
            </div>
          </div>
        </div>
      ) : (
        /* Datei-Status */
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl border',
          isAnalyzing ? 'bg-blue-50 border-blue-100' :
          hasResult ? 'bg-emerald-50 border-emerald-100' :
          isUploading ? 'bg-gray-50 border-gray-200' : 'bg-gray-50 border-gray-200'
        )}>
          <div className="shrink-0">
            {uploadedFile.type === 'application/pdf'
              ? <FileText className="w-5 h-5 text-red-500" />
              : <ImageIcon className="w-5 h-5 text-blue-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{uploadedFile.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {isUploading ? 'Wird geladen…' :
               isAnalyzing ? 'KI analysiert…' :
               hasResult ? `${fieldsWithValues.length} Felder erkannt` :
               'Bereit'}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {(isUploading || isAnalyzing) && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
            {hasResult && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {!isUploading && !isAnalyzing && (
              <button onClick={handleReset} className="p-0.5 hover:text-red-500 transition-colors">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ergebnis-Button */}
      {hasResult && (
        <Button
          type="button"
          size="sm"
          className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setShowConfirmDialog(true)}
        >
          <ChevronRight className="w-3 h-3 mr-1.5" />
          {fieldsWithValues.length} Felder prüfen und übernehmen
        </Button>
      )}

      {/* Bestätigungs-Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Erkannte Felder übernehmen
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-xs text-muted-foreground mb-3">
              Wähle die Felder aus, die du in den Kalkulator übernehmen möchtest. Bereits ausgefüllte Felder werden überschrieben.
            </p>

            {/* Felder-Liste */}
            <div className="space-y-1.5">
              {fieldsWithValues.map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleField(key)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all',
                    selectedFields.has(key)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  )}
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">{FIELD_LABELS[key]}</p>
                    <p className="text-xs text-muted-foreground">{formatValue(key, extractedData?.[key])}</p>
                  </div>
                  <div className={cn(
                    'w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all',
                    selectedFields.has(key) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  )}>
                    {selectedFields.has(key) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Alle/Keine */}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setSelectedFields(new Set(fieldsWithValues))}
                className="text-xs text-blue-600 hover:underline"
              >
                Alle auswählen
              </button>
              <span className="text-xs text-muted-foreground">·</span>
              <button
                type="button"
                onClick={() => setSelectedFields(new Set())}
                className="text-xs text-muted-foreground hover:underline"
              >
                Keine
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowConfirmDialog(false)}>
              Abbrechen
            </Button>
            <Button
              size="sm"
              className="btn-gradient"
              onClick={handleConfirm}
              disabled={selectedFields.size === 0}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              {selectedFields.size} Felder übernehmen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
