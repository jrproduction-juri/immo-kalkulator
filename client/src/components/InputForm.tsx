/**
 * InputForm – dynamisches Formular je Immobilienart
 * Wohnung (Free) | MFH / Neubau / Gewerbe (Pro)
 */
import { useState } from 'react';
import { FormData, ImmobilienArt, getDefaultFormData, isProArt } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { InfoModal } from '@/components/InfoModal';
import { PlzMietempfehlung } from '@/components/PlzMietempfehlung';
import { ExposeUpload } from '@/components/ExposeUpload';
import { Badge } from '@/components/ui/badge';
import { Lock, Building2, Home, Warehouse, Building, Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Info-Texte ────────────────────────────────────────────────────────────────

const INFO: Record<string, { title: string; text: string }> = {
  kaufpreis: {
    title: 'Kaufpreis',
    text: 'Der Kaufpreis ist der vereinbarte Preis ohne Kaufnebenkosten (Notar, Grunderwerbsteuer, Makler).',
  },
  wohnflaeche: {
    title: 'Wohnfläche',
    text: 'Die Wohnfläche in m² laut Grundriss oder Exposé. Wird für Preis/m² und AfA-Berechnung verwendet.',
  },
  kaltmiete: {
    title: 'Kaltmiete',
    text: 'Die monatliche Kaltmiete ohne Nebenkosten. Basis für die Renditeberechnung.',
  },
  warmmiete: {
    title: 'Warmmiete',
    text: 'Die monatliche Warmmiete inkl. Nebenkosten. Wird für den Hinweis „Von der Warmmiete bleiben X € übrig" verwendet.',
  },
  hausgeld: {
    title: 'Hausgeld',
    text: 'Das monatliche Hausgeld umfasst Verwaltungskosten, Versicherungen und Instandhaltungsrücklage. Teilweise umlagefähig.',
  },
  ruecklagen: {
    title: 'Instandhaltungsrücklage',
    text: 'Monatliche Instandhaltungsrücklage für Reparaturen und Modernisierungen. Empfehlung: 1–2 % des Kaufpreises p.a.',
  },
  nichtUmlagefaehig: {
    title: 'Nicht umlagefähige Kosten',
    text: 'Kosten, die nicht auf den Mieter umgelegt werden können (z.B. Verwaltungskosten, nicht umlagefähige Reparaturen). Direkt cashflow-wirksam.',
  },
  eigenkapital: {
    title: 'Eigenkapital',
    text: 'Das eingesetzte Eigenkapital inkl. Kaufnebenkosten. Mindestens 10–20 % des Kaufpreises empfohlen.',
  },
  zinssatz: {
    title: 'Zinssatz',
    text: 'Der jährliche Zinssatz des Darlehens in %. Aktuell typisch: 3,5–4,5 % für 10 Jahre Zinsbindung.',
  },
  tilgung: {
    title: 'Tilgung',
    text: 'Der jährliche Tilgungssatz in %. Empfehlung: mind. 2 % für angemessene Entschuldung.',
  },
  kreditrate: {
    title: 'Kreditrate (optional)',
    text: 'Die monatliche Kreditrate (Zins + Tilgung). Wenn angegeben, wird die automatische Berechnung überschrieben.',
  },
  anzahlEinheiten: {
    title: 'Anzahl Einheiten',
    text: 'Anzahl der vermietbaren Wohneinheiten im Mehrfamilienhaus.',
  },
  durchschnittsMieteProEinheit: {
    title: 'Ø Miete pro Einheit',
    text: 'Durchschnittliche monatliche Kaltmiete pro Wohneinheit.',
  },
  leerstandsquote: {
    title: 'Leerstandsquote',
    text: 'Erwarteter prozentualer Leerstand pro Jahr. Empfehlung: 5–10 % als Puffer einkalkulieren.',
  },
  afaSatz: {
    title: 'AfA-Satz',
    text: 'Abschreibungssatz für Neubau: 3 % p.a. (ab 2023), Altbau: 2 % p.a. Basis: 80 % des Kaufpreises.',
  },
  erstvermietung: {
    title: 'Erstvermietung',
    text: 'Bei Erstvermietung gelten besondere steuerliche Regelungen. Kaufnebenkosten sind voll absetzbar.',
  },
  mietvertragslaufzeit: {
    title: 'Mietvertragslaufzeit',
    text: 'Laufzeit des Gewerbemietvertrags in Jahren. Längere Laufzeiten erhöhen die Planungssicherheit.',
  },
  indexmiete: {
    title: 'Indexmiete',
    text: 'Die Miete wird an den Verbraucherpreisindex (VPI) gekoppelt. Schützt vor Inflation.',
  },
  tripleNet: {
    title: 'Triple-Net',
    text: 'Bei Triple-Net trägt der Mieter alle Nebenkosten (Steuern, Versicherungen, Instandhaltung). Vermieter hat nahezu keine laufenden Kosten.',
  },
  eigennutzungMonate: {
    title: 'Eigennutzung (Monate)',
    text: 'Wie lange nutzt du die Immobilie selbst? Ab 24 Monaten Eigennutzung ist der Verkauf einer ETW steuerfrei (§ 23 EStG).',
  },
  grundstueckFlaeche: {
    title: 'Grundstücksgröße',
    text: 'Die Grundstücksgröße in m². Relevant für die Bewertung und den Preis pro m² Grundstück.',
  },
  grundsteuer: {
    title: 'Grundsteuer',
    text: 'Die monatliche Grundsteuer (Jahresbetrag / 12). Beim EFH typisch: 500–1.500 €/Jahr je nach Lage.',
  },
  versicherung: {
    title: 'Gebäudeversicherung',
    text: 'Monatliche Gebäudeversicherung (Jahresbetrag / 12). Beim EFH typisch: 400–1.000 €/Jahr.',
  },
  verwaltungEFH: {
    title: 'Verwaltungskosten',
    text: 'Optionale monatliche Verwaltungskosten (z.B. Hausverwaltung). Beim selbstverwalteten EFH oft 0 €.',
  },
  persönlicherSteuersatz: {
    title: 'Persönlicher Steuersatz',
    text: 'Persönlicher Grenzsteuersatz aus der Einkommensteuer. Falls unbekannt, kann der Standardwert von 35 % verwendet werden. Der Steuersatz beeinflusst die Steuerersparnis durch AfA und negative Einkünfte aus Vermietung.',
  },
  verkauf24Monate: {
    title: 'Steuerfreier Verkauf',
    text: 'Bei mind. 24 Monaten Eigennutzung ist der Verkauf einer Eigentumswohnung steuerfrei (§ 23 EStG). Diese Regelung gilt nur für Eigentumswohnungen, nicht für Mehrfamilienhäuser.',
  },
};

function InfoBtn({ field }: { field: string }) {
  const info = INFO[field];
  if (!info) return null;
  return <InfoModal text={info.text} title={info.title} />;
}

function FieldLabel({ label, field }: { label: string; field: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      <InfoBtn field={field} />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
  step?: number;
}) {
  return (
    <div className="relative">
      <Input
        type="number"
        value={value || ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        min={min}
        step={step}
        className="text-sm pr-10 h-9"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ─── Immobilienart-Karten ──────────────────────────────────────────────────────

const ART_OPTIONS: { value: ImmobilienArt; label: string; icon: React.ReactNode; proOnly: boolean; desc: string }[] = [
  { value: 'wohnung', label: 'Wohnung', icon: <Home className="w-4 h-4" />, proOnly: false, desc: 'ETW / Eigentumswohnung' },
  { value: 'efh', label: 'Einfamilienhaus', icon: <Home className="w-4 h-4" />, proOnly: true, desc: 'EFH mit Grundstück' },
  { value: 'mfh', label: 'Mehrfamilienhaus', icon: <Building2 className="w-4 h-4" />, proOnly: true, desc: 'MFH mit mehreren Einheiten' },
  { value: 'neubau', label: 'Neubau', icon: <Building className="w-4 h-4" />, proOnly: true, desc: 'Neubau mit 3 % AfA' },
  { value: 'gewerbe', label: 'Gewerbe', icon: <Warehouse className="w-4 h-4" />, proOnly: true, desc: 'Büro, Laden, Lager' },
];

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

interface InputFormProps {
  data: FormData;
  onChange: (data: FormData) => void;
  onCalculate: () => void;
  isPro: boolean;
  onUpgrade: () => void;
  isLoading?: boolean;
}

export function InputForm({ data, onChange, onCalculate, isPro, onUpgrade, isLoading }: InputFormProps) {
  const [showPersonal, setShowPersonal] = useState(true);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    onChange({ ...data, [key]: value });
  }

  function handleArtChange(art: ImmobilienArt) {
    if (isProArt(art) && !isPro) {
      onUpgrade();
      return;
    }
    const defaults = getDefaultFormData(art);
    onChange({
      ...defaults,
      eigenkapital: data.eigenkapital,
      zinssatz: data.zinssatz,
      tilgung: data.tilgung,
      kreditrate: data.kreditrate,
      persönlicherSteuersatz: data.persönlicherSteuersatz,
      standort: data.standort,
      highlights: data.highlights,
    });
  }

  const art = data.art;

  return (
    <div className="space-y-5">
      {/* ── Immobilienart ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Immobilienart</Label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ART_OPTIONS.map(opt => {
            const locked = opt.proOnly && !isPro;
            const active = data.art === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleArtChange(opt.value)}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all text-sm',
                  active
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : locked
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-pointer hover:border-blue-300'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/30'
                )}
              >
                <span className={active ? 'text-blue-600' : locked ? 'text-gray-400' : 'text-gray-500'}>
                  {opt.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{opt.label}</div>
                  <div className="text-[10px] text-gray-400 truncate">{opt.desc}</div>
                </div>
                {locked && (
                  <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                )}
                {opt.proOnly && !locked && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-blue-100 text-blue-700">Pro</Badge>
                )}
              </button>
            );
          })}
        </div>
        {!isPro && (
          <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            MFH, Neubau & Gewerbe nur in der Pro-Version
          </p>
        )}
      </div>

      {/* ── Exposé-Upload ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Exposé hochladen (optional)</Label>
        <ExposeUpload
          onDataExtracted={extracted => {
            const updates: Partial<FormData> = {};
            if (extracted.kaufpreis != null) updates.kaufpreis = extracted.kaufpreis;
            if (extracted.wohnflaeche != null) updates.wohnflaeche = extracted.wohnflaeche;
            if (extracted.baujahr != null) updates.baujahr = extracted.baujahr;
            if (extracted.hausgeld != null) updates.hausgeld = extracted.hausgeld;
            if (extracted.kaltmiete != null) updates.kaltmiete = extracted.kaltmiete;
            if (extracted.grundstueckFlaeche != null) updates.grundstueckFlaeche = extracted.grundstueckFlaeche;
            onChange({ ...data, ...updates });
          }}
        />
      </div>

      {/* ── Objekt-Grunddaten ────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Objektdaten</Label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel label="Kaufpreis" field="kaufpreis" />
            <NumberInput value={data.kaufpreis} onChange={v => set('kaufpreis', v)} suffix="€" placeholder="300000" />
          </div>
          <div>
            <FieldLabel label="Wohnfläche" field="wohnflaeche" />
            <NumberInput value={data.wohnflaeche} onChange={v => set('wohnflaeche', v)} suffix="m²" placeholder="75" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel label="Baujahr" field="baujahr" />
            <NumberInput value={data.baujahr} onChange={v => set('baujahr', v)} placeholder="2000" min={1900} step={1} />
          </div>
          <div>
            <FieldLabel label="Zustand" field="zustand" />
            <Select value={data.zustand} onValueChange={v => set('zustand', v as FormData['zustand'])}>
              <SelectTrigger className="text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neu">Neuwertig</SelectItem>
                <SelectItem value="renoviert">Renoviert</SelectItem>
                <SelectItem value="renovierungsbeduerftig">Renovierungsbedürftig</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* EFH: Grundstücksgröße */}
        {art === 'efh' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel label="Grundstücksgröße" field="grundstueckFlaeche" />
              <NumberInput value={data.grundstueckFlaeche ?? 0} onChange={v => set('grundstueckFlaeche', v)} suffix="m²" placeholder="500" />
            </div>
            <div>
              <FieldLabel label="Standort (optional)" field="nichtUmlagefaehig" />
              <Input
                type="text"
                value={data.standort ?? ''}
                onChange={e => set('standort', e.target.value)}
                placeholder="z.B. Hamburg, Rahlstedt"
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}
        {art !== 'efh' && (
          <div>
            <FieldLabel label="Standort (optional)" field="nichtUmlagefaehig" />
            <Input
              type="text"
              value={data.standort ?? ''}
              onChange={e => set('standort', e.target.value)}
              placeholder="z.B. München, Schwabing"
              className="h-9 text-sm"
            />
          </div>
        )}
      </div>

      {/* ── Miete / Einnahmen ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
          {art === 'mfh' ? 'Einnahmen (MFH)' : 'Miete & Einnahmen'}
        </Label>

        {/* EFH */}
        {art === 'efh' && (
          <div>
            <FieldLabel label="Kaltmiete" field="kaltmiete" />
            <NumberInput value={data.kaltmiete} onChange={v => set('kaltmiete', v)} suffix="€/Mo" placeholder="1400" />
          </div>
        )}

        {/* Wohnung / Neubau */}
        {(art === 'wohnung' || art === 'neubau') && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Kaltmiete" field="kaltmiete" />
                <NumberInput value={data.kaltmiete} onChange={v => set('kaltmiete', v)} suffix="€/Mo" placeholder="900" />
              </div>
              <div>
                <FieldLabel label="Warmmiete" field="warmmiete" />
                <NumberInput value={data.warmmiete ?? 0} onChange={v => set('warmmiete', v > 0 ? v : undefined as unknown as number)} suffix="€/Mo" placeholder="1100" />
              </div>
            </div>
            <PlzMietempfehlung
              wohnflaeche={data.wohnflaeche}
              onVorschlagUebernehmen={v => set('kaltmiete', v)}
            />
          </div>
        )}

        {/* MFH */}
        {art === 'mfh' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Anzahl Einheiten" field="anzahlEinheiten" />
                <NumberInput value={data.anzahlEinheiten ?? 1} onChange={v => set('anzahlEinheiten', v)} placeholder="6" min={1} step={1} />
              </div>
              <div>
                <FieldLabel label="Ø Miete/Einheit" field="durchschnittsMieteProEinheit" />
                <NumberInput value={data.durchschnittsMieteProEinheit ?? 0} onChange={v => set('durchschnittsMieteProEinheit', v)} suffix="€/Mo" placeholder="700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Leerstandsquote" field="leerstandsquote" />
                <NumberInput value={data.leerstandsquote ?? 5} onChange={v => set('leerstandsquote', v)} suffix="%" placeholder="5" step={0.5} />
              </div>
              <div>
                <FieldLabel label="Gesamte Wohnfläche" field="wohnflaeche" />
                <NumberInput value={data.wohnflaeche} onChange={v => set('wohnflaeche', v)} suffix="m²" placeholder="400" />
              </div>
            </div>
          </>
        )}

        {/* Gewerbe */}
        {art === 'gewerbe' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Kaltmiete" field="kaltmiete" />
                <NumberInput value={data.kaltmiete} onChange={v => set('kaltmiete', v)} suffix="€/Mo" placeholder="2500" />
              </div>
              <div>
                <FieldLabel label="Leerstandsquote" field="leerstandsquote" />
                <NumberInput value={data.leerstandsquoteGewerbe ?? 10} onChange={v => set('leerstandsquoteGewerbe', v)} suffix="%" placeholder="10" step={0.5} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Mietvertragslaufzeit" field="mietvertragslaufzeit" />
                <NumberInput value={data.mietvertragslaufzeit ?? 10} onChange={v => set('mietvertragslaufzeit', v)} suffix="Jahre" placeholder="10" step={1} />
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-gray-700">Indexmiete</Label>
                    <InfoBtn field="indexmiete" />
                  </div>
                  <Switch checked={data.indexmiete ?? false} onCheckedChange={v => set('indexmiete', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-gray-700">Triple-Net</Label>
                    <InfoBtn field="tripleNet" />
                  </div>
                  <Switch checked={data.tripleNet ?? false} onCheckedChange={v => set('tripleNet', v)} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Kosten ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Kosten</Label>

        {/* EFH: Grundsteuer, Versicherung, Verwaltung (kein Hausgeld) */}
        {art === 'efh' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Instandhaltungsrücklage" field="ruecklagen" />
                <NumberInput value={data.ruecklagen} onChange={v => set('ruecklagen', v)} suffix="€/Mo" placeholder="150" />
              </div>
              <div>
                <FieldLabel label="Grundsteuer" field="grundsteuer" />
                <NumberInput value={data.grundsteuer ?? 0} onChange={v => set('grundsteuer', v)} suffix="€/Mo" placeholder="80" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Gebäudeversicherung" field="versicherung" />
                <NumberInput value={data.versicherung ?? 0} onChange={v => set('versicherung', v)} suffix="€/Mo" placeholder="60" />
              </div>
              <div>
                <FieldLabel label="Verwaltung (opt.)" field="verwaltungEFH" />
                <NumberInput value={data.verwaltungEFH ?? 0} onChange={v => set('verwaltungEFH', v)} suffix="€/Mo" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Kreditrate (opt.)" field="kreditrate" />
                <NumberInput value={data.kreditrate ?? 0} onChange={v => set('kreditrate', v > 0 ? v : undefined as unknown as number)} suffix="€/Mo" placeholder="auto" />
              </div>
              <div>
                <FieldLabel label="Sonstige Ausgaben" field="nichtUmlagefaehig" />
                <NumberInput value={data.sonstigeAusgaben} onChange={v => set('sonstigeAusgaben', v)} suffix="€/Mo" placeholder="0" />
              </div>
            </div>
          </div>
        )}

        {/* Alle anderen Arten: Standard-Kosten */}
        {art !== 'efh' && (
          <div className="grid grid-cols-2 gap-3">
            {art !== 'mfh' && art !== 'gewerbe' && (
              <div>
                <FieldLabel label="Hausgeld" field="hausgeld" />
                <NumberInput value={data.hausgeld} onChange={v => set('hausgeld', v)} suffix="€/Mo" placeholder="200" />
              </div>
            )}
            <div>
              <FieldLabel label={art === 'neubau' ? 'Rücklage (reduziert)' : 'Rücklage'} field="ruecklagen" />
              <NumberInput value={data.ruecklagen} onChange={v => set('ruecklagen', v)} suffix="€/Mo" placeholder={art === 'neubau' ? '20' : '50'} />
            </div>
            <div>
              <FieldLabel label="Nicht umlagefähige Kosten" field="nichtUmlagefaehig" />
              <NumberInput value={data.nichtUmlagefaehig} onChange={v => set('nichtUmlagefaehig', v)} suffix="€/Mo" placeholder="100" />
            </div>
            <div>
              <FieldLabel label="Sonstige Ausgaben" field="nichtUmlagefaehig" />
              <NumberInput value={data.sonstigeAusgaben} onChange={v => set('sonstigeAusgaben', v)} suffix="€/Mo" placeholder="0" />
            </div>
          </div>
        )}

        {/* Neubau: AfA-Satz */}
        {art === 'neubau' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel label="AfA-Satz" field="afaSatz" />
              <NumberInput value={data.afaSatz ?? 3} onChange={v => set('afaSatz', v)} suffix="%" placeholder="3" step={0.5} />
            </div>
            <div className="flex items-center justify-between pt-5">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-gray-700">Erstvermietung</Label>
                <InfoBtn field="erstvermietung" />
              </div>
              <Switch checked={data.erstvermietung ?? false} onCheckedChange={v => set('erstvermietung', v)} />
            </div>
          </div>
        )}
      </div>

      {/* ── Finanzierung ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Finanzierung</Label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel label="Eigenkapital" field="eigenkapital" />
            <NumberInput value={data.eigenkapital} onChange={v => set('eigenkapital', v)} suffix="€" placeholder="60000" />
          </div>
          <div>
            <FieldLabel label="Kreditrate (opt.)" field="kreditrate" />
            <NumberInput value={data.kreditrate ?? 0} onChange={v => set('kreditrate', v > 0 ? v : undefined as unknown as number)} suffix="€/Mo" placeholder="auto" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel label="Zinssatz" field="zinssatz" />
            <NumberInput value={data.zinssatz} onChange={v => set('zinssatz', v)} suffix="%" placeholder="3.5" step={0.1} />
          </div>
          <div>
            <FieldLabel label="Tilgung" field="tilgung" />
            <NumberInput value={data.tilgung} onChange={v => set('tilgung', v)} suffix="%" placeholder="2.0" step={0.1} />
          </div>
        </div>
      </div>

      {/* ── Persönliche Daten ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <button
          type="button"
          className="flex items-center gap-2 w-full"
          onClick={() => setShowPersonal(p => !p)}
        >
          <Label className="text-xs font-semibold text-gray-800 uppercase tracking-wide cursor-pointer">
            Persönliche Daten (für Steuer)
          </Label>
          <span className="text-gray-400">
            {showPersonal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showPersonal && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Label className="text-xs font-medium text-gray-700">Persönlicher Steuersatz (%)</Label>
                <InfoBtn field="persönlicherSteuersatz" />
              </div>
              <NumberInput
                value={data.persönlicherSteuersatz}
                onChange={v => set('persönlicherSteuersatz', v)}
                suffix="%"
                placeholder="35"
                step={1}
              />
              <p className="text-xs text-gray-400 mt-1">Falls unbekannt, wird ein durchschnittlicher Steuersatz von 35 % angenommen.</p>
            </div>
            <div>
              <FieldLabel label="Eigennutzung (Monate)" field="eigennutzungMonate" />
              <NumberInput value={data.eigennutzungMonate ?? 0} onChange={v => set('eigennutzungMonate', v)} suffix="Mo" placeholder="0" step={1} />
            </div>
            <div>
              <FieldLabel label="Highlights (für Exposé)" field="kaltmiete" />
              <Input
                type="text"
                value={data.highlights ?? ''}
                onChange={e => set('highlights', e.target.value)}
                placeholder="z.B. Balkon, Aufzug, Tiefgarage"
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Szenarien ────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Szenarien berechnen</Label>

        <div className="space-y-2">
          <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-100">
            <Label className="text-sm text-gray-700 cursor-pointer">Buy & Hold (Vermietung)</Label>
            <Switch checked={data.szenarioVermietung} onCheckedChange={v => set('szenarioVermietung', v)} />
          </div>

          <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-100">
            <Label className="text-sm text-gray-700 cursor-pointer">Eigennutzung</Label>
            <Switch checked={data.szenarioEigennutzung} onCheckedChange={v => set('szenarioEigennutzung', v)} />
          </div>

          {isPro ? (
            <>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm text-gray-700 cursor-pointer">Verkauf nach 24 Monaten</Label>
                  <InfoBtn field="verkauf24Monate" />
                </div>
                <Switch checked={data.szenarioVerkauf24Monate} onCheckedChange={v => set('szenarioVerkauf24Monate', v)} />
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-100">
                <Label className="text-sm text-gray-700 cursor-pointer">Fix & Flip</Label>
                <Switch checked={data.szenarioFlipSanieren} onCheckedChange={v => set('szenarioFlipSanieren', v)} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 border border-gray-100 opacity-70">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-gray-400" />
                <Label className="text-sm text-gray-400">Verkauf nach 24 Monaten</Label>
                <InfoBtn field="verkauf24Monate" />
              </div>
              <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 cursor-pointer" onClick={onUpgrade}>Pro</Badge>
            </div>
          )}
        </div>
      </div>

      {/* ── Berechnen-Button ─────────────────────────────────────────── */}
      <Button
        type="button"
        onClick={onCalculate}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 text-base rounded-xl shadow-md shadow-blue-200 transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Calculator className="w-4 h-4 animate-pulse" />
            Berechne…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Jetzt berechnen
          </span>
        )}
      </Button>
    </div>
  );
}
