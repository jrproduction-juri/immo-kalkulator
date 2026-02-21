import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoButton } from './InfoButton';
import { FormData } from '@/lib/calculations';
import { Calculator, ChevronDown, ChevronUp, Building2, Banknote, User } from 'lucide-react';

interface InputFormProps {
  onCalculate: (data: FormData) => void;
  isCalculating: boolean;
}

const DEFAULT_DATA: FormData = {
  art: 'etw',
  kaufpreis: 350000,
  wohnflaeche: 75,
  hausgeld: 280,
  ruecklagen: 100,
  baujahr: 1990,
  zustand: 'renoviert',
  kaltmiete: 1100,
  eigenkapital: 80000,
  zinssatz: 3.8,
  tilgung: 2.0,
  nettoEinkommen: 3500,
  steuerklasse: '1',
  sonstigeAusgaben: 0,
  szenarioVermietung: true,
  szenarioFlipSanieren: false,
  szenarioEigennutzung2J: false,
  szenarioSanierungEigennutzung: false,
  standort: '',
  highlights: '',
  eigennutzungMonate: 0,
  anzahlEinheiten: 1,
};

function FormSection({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-600" />
          <span className="font-display font-semibold text-sm text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

function FormField({ label, info, children, fullWidth = false }: {
  label: string;
  info?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <div className="flex items-center gap-0.5 mb-1.5">
        <Label className="text-xs font-medium text-foreground/80">{label}</Label>
        {info && <InfoButton text={info} />}
      </div>
      {children}
    </div>
  );
}

export function InputForm({ onCalculate, isCalculating }: InputFormProps) {
  const [data, setData] = useState<FormData>(DEFAULT_DATA);

  const set = (field: keyof FormData, value: string | number | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const numInput = (field: keyof FormData, value: string) => {
    const num = parseFloat(value.replace(',', '.')) || 0;
    set(field, num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Objekt */}
      <FormSection title="Objekt" icon={Building2}>
        <FormField label="Immobilienart" info="Art der Immobilie beeinflusst Berechnungen und Steuerregeln." fullWidth>
          <Select
            value={data.art ?? 'etw'}
            onValueChange={v => set('art', v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="etw">Eigentumswohnung (ETW)</SelectItem>
              <SelectItem value="mfh">Mehrfamilienhaus (MFH)</SelectItem>
              <SelectItem value="efh">Einfamilienhaus (EFH)</SelectItem>
              <SelectItem value="gewerbe">Gewerbeimmobilie</SelectItem>
              <SelectItem value="neubau">Neubauprojekt</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Kaufpreis (€)" info="Der Kaufpreis der Immobilie ohne Nebenkosten. Nebenkosten (ca. 10,6%) werden automatisch berechnet.">
          <Input
            type="number"
            value={data.kaufpreis || ''}
            onChange={e => numInput('kaufpreis', e.target.value)}
            placeholder="350.000"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Wohnfläche (m²)" info="Die Wohnfläche laut Grundriss oder Exposé in Quadratmetern.">
          <Input
            type="number"
            value={data.wohnflaeche || ''}
            onChange={e => numInput('wohnflaeche', e.target.value)}
            placeholder="75"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Kaltmiete (€/Monat)" info="Die monatliche Kaltmiete ohne Nebenkosten. Bei Leerstand: erzielbare Marktmiete eintragen.">
          <Input
            type="number"
            value={data.kaltmiete || ''}
            onChange={e => numInput('kaltmiete', e.target.value)}
            placeholder="1.100"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Baujahr" info="Das Baujahr beeinflusst die AfA-Berechnung (steuerliche Abschreibung). Neubauten ab 2023: 3% AfA.">
          <Input
            type="number"
            value={data.baujahr || ''}
            onChange={e => numInput('baujahr', e.target.value)}
            placeholder="1990"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Zustand" info="Der aktuelle Zustand der Immobilie beeinflusst Sanierungskosten und Wertsteigerungspotenzial." fullWidth>
          <Select
            value={data.zustand}
            onValueChange={v => set('zustand', v as FormData['zustand'])}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neu">Neubau / Erstbezug</SelectItem>
              <SelectItem value="renoviert">Renoviert / Gepflegt</SelectItem>
              <SelectItem value="renovierungsbeduerftig">Renovierungsbedürftig</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Hausgeld (€/Monat)" info="Hausgeld: monatliche Nebenkosten, die der Eigentümer an die WEG zahlt. Enthält Verwaltung, Versicherung, Gemeinschaftskosten.">
          <Input
            type="number"
            value={data.hausgeld || ''}
            onChange={e => numInput('hausgeld', e.target.value)}
            placeholder="280"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Rücklagen (€/Monat)" info="Instandhaltungsrücklagen für Reparaturen und Modernisierungen. Empfehlung: 1–2 €/m² pro Monat.">
          <Input
            type="number"
            value={data.ruecklagen || ''}
            onChange={e => numInput('ruecklagen', e.target.value)}
            placeholder="100"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Sonstige Ausgaben (€/Monat)" info="Weitere monatliche Kosten wie Steuerberater, Verwaltung, Versicherungen etc.">
          <Input
            type="number"
            value={data.sonstigeAusgaben || ''}
            onChange={e => numInput('sonstigeAusgaben', e.target.value)}
            placeholder="0"
            className="h-9 text-sm"
          />
        </FormField>
      </FormSection>

      {/* Finanzierung */}
      <FormSection title="Finanzierung" icon={Banknote}>
        <FormField label="Eigenkapital (€)" info="Eigenkapital: Geld, das du selbst einbringst. Reduziert die Kreditlast und verbessert die Konditionen. Empfehlung: mind. 20% des Kaufpreises.">
          <Input
            type="number"
            value={data.eigenkapital || ''}
            onChange={e => numInput('eigenkapital', e.target.value)}
            placeholder="80.000"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Zinssatz (% p.a.)" info="Der jährliche Zinssatz deines Darlehens. Aktuell (2025) ca. 3,5–4,5% für 10-jährige Zinsbindung.">
          <Input
            type="number"
            step="0.1"
            value={data.zinssatz || ''}
            onChange={e => numInput('zinssatz', e.target.value)}
            placeholder="3.8"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Tilgung (% p.a.)" info="Jährliche Tilgungsrate. Mindestens 2% empfohlen. Höhere Tilgung = schnellere Schuldenfreiheit, aber höhere Monatsrate.">
          <Input
            type="number"
            step="0.1"
            value={data.tilgung || ''}
            onChange={e => numInput('tilgung', e.target.value)}
            placeholder="2.0"
            className="h-9 text-sm"
          />
        </FormField>
      </FormSection>

      {/* Persönlich */}
      <FormSection title="Persönliche Daten" icon={User} defaultOpen={true}>
        <FormField label="Netto-Einkommen (€/Monat)" info="Dein monatliches Nettoeinkommen. Wird für die Steuerersparnis-Berechnung (AfA) verwendet.">
          <Input
            type="number"
            value={data.nettoEinkommen || ''}
            onChange={e => numInput('nettoEinkommen', e.target.value)}
            placeholder="3.500"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Steuerklasse" info="Deine Lohnsteuerklasse beeinflusst den Grenzsteuersatz und damit die Steuerersparnis durch AfA.">
          <Select
            value={data.steuerklasse}
            onValueChange={v => set('steuerklasse', v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Klasse 1 (ledig)</SelectItem>
              <SelectItem value="3">Klasse 3 (verheiratet, Hauptverdiener)</SelectItem>
              <SelectItem value="4">Klasse 4 (verheiratet, gleich)</SelectItem>
              <SelectItem value="5">Klasse 5 (verheiratet, Geringverdiener)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Standort (optional)" info="Adresse oder Ort der Immobilie. Wird für das Exposé verwendet." fullWidth>
          <Input
            type="text"
            value={data.standort || ''}
            onChange={e => set('standort', e.target.value)}
            placeholder="z.B. München, Schwabing"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Eigennutzung (Monate)" info="Wie lange nutzt du die Immobilie selbst? Ab 24 Monaten Eigennutzung im Verkaufsjahr und den 2 Vorjahren ist der Verkauf steuerfrei (Spekulationssteuer = 0 €).">
          <Input
            type="number"
            value={data.eigennutzungMonate || ''}
            onChange={e => numInput('eigennutzungMonate', e.target.value)}
            placeholder="0"
            className="h-9 text-sm"
          />
        </FormField>
        <FormField label="Highlights (optional)" info="Besondere Merkmale der Immobilie für das Exposé, z.B. Balkon, Tiefgarage, Aufzug." fullWidth>
          <Input
            type="text"
            value={data.highlights || ''}
            onChange={e => set('highlights', e.target.value)}
            placeholder="z.B. Balkon, Aufzug, Tiefgarage"
            className="h-9 text-sm"
          />
        </FormField>
      </FormSection>

      {/* Szenarien */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50">
          <Calculator className="w-4 h-4 text-blue-600" />
          <span className="font-display font-semibold text-sm text-foreground">Szenarien berechnen</span>
        </div>
        <div className="px-4 py-4 space-y-3">
          {[
            { field: 'szenarioVermietung' as const, label: 'Kaufen & Vermieten', desc: 'Buy & Hold Strategie' },
            { field: 'szenarioFlipSanieren' as const, label: 'Kaufen, Sanieren & Verkaufen', desc: 'Fix & Flip' },
            { field: 'szenarioEigennutzung2J' as const, label: '2 Jahre Eigennutzung & steuerfrei verkaufen', desc: 'Steueroptimiert' },
            { field: 'szenarioSanierungEigennutzung' as const, label: 'Sanieren + 2 Jahre Eigennutzung & verkaufen', desc: 'Kombination' },
          ].map(({ field, label, desc }) => (
            <div key={field} className="flex items-start gap-3">
              <Checkbox
                id={field}
                checked={data[field] as boolean}
                onCheckedChange={v => set(field, !!v)}
                className="mt-0.5"
              />
              <label htmlFor={field} className="cursor-pointer">
                <span className="text-sm font-medium text-foreground block">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-11 text-sm font-semibold btn-gradient"
        disabled={isCalculating}
      >
        <Calculator className="w-4 h-4 mr-2" />
        {isCalculating ? 'Berechne...' : 'Berechnung starten'}
      </Button>
    </form>
  );
}
