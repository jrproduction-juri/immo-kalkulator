import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData, formatEuro } from '@/lib/calculations';
import { Mail, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface EmailGeneratorProps {
  formData: FormData;
}

type EmailType = 'makler_anfrage' | 'eigentuemer_anfrage' | 'unterlagen_anforderung' | 'preisverhandlung';

function generateEmail(type: EmailType, data: FormData): string {
  const standort = data.standort || 'der Immobilie';
  const kaufpreis = formatEuro(data.kaufpreis);

  const emails: Record<EmailType, string> = {
    makler_anfrage: `Betreff: Anfrage zu Ihrer Immobilie – ${standort}

Sehr geehrte Damen und Herren,

ich bin auf Ihr Angebot für die Immobilie in ${standort} (Kaufpreis: ${kaufpreis}) aufmerksam geworden und interessiere mich für eine detaillierte Prüfung als Kapitalanlage.

Für meine Investitionsanalyse benötige ich folgende Unterlagen und Informationen:

1. Aktueller Grundbuchauszug
2. Teilungserklärung und Gemeinschaftsordnung
3. Protokolle der letzten 3 Eigentümerversammlungen
4. Aktuelle Nebenkostenabrechnung (Hausgeldabrechnung)
5. Wirtschaftsplan der WEG
6. Mietvertrag (bei vermieteten Objekten)
7. Energieausweis
8. Dokumentation durchgeführter Sanierungen/Renovierungen
9. Höhe der Instandhaltungsrücklage

Könnten Sie mir diese Unterlagen zukommen lassen? Ich würde mich über einen Besichtigungstermin freuen.

Mit freundlichen Grüßen`,

    eigentuemer_anfrage: `Betreff: Kaufanfrage – Ihre Immobilie in ${standort}

Sehr geehrte/r Eigentümer/in,

ich interessiere mich für den Erwerb Ihrer Immobilie in ${standort} und habe Ihr Angebot (${kaufpreis}) sorgfältig geprüft.

Um eine fundierte Kaufentscheidung treffen zu können, bitte ich Sie um folgende Informationen:

• Aktueller Zustand der Heizungsanlage und letzter Wartungsnachweis
• Alter und Zustand von Dach, Fenstern und Fassade
• Bestehende Mängel oder bekannte Schäden
• Monatliche Betriebskosten (Heizung, Wasser, Strom Gemeinschaft)
• Grund für den Verkauf
• Flexibilität beim Kaufpreis bei schneller Abwicklung

Ich bin ein seriöser Käufer mit gesicherter Finanzierung und kann zeitnah einen Besichtigungstermin wahrnehmen.

Mit freundlichen Grüßen`,

    unterlagen_anforderung: `Betreff: Anforderung fehlender Unterlagen – ${standort}

Sehr geehrte Damen und Herren,

vielen Dank für die bisherigen Informationen zur Immobilie in ${standort}. Für den Abschluss meiner Investitionsanalyse fehlen mir noch folgende Unterlagen:

Dringend benötigt:
□ Aktueller Grundbuchauszug (nicht älter als 3 Monate)
□ Vollständige Hausgeldabrechnung der letzten 2 Jahre
□ Protokoll der letzten Eigentümerversammlung
□ Aktueller Wirtschaftsplan

Zusätzlich hilfreich:
□ Mietvertrag mit aktueller Miethöhe
□ Energieausweis (Bedarfs- oder Verbrauchsausweis)
□ Nachweise über durchgeführte Modernisierungen

Ich bitte um Übersendung bis zum [Datum]. Bei Rückfragen stehe ich gerne zur Verfügung.

Mit freundlichen Grüßen`,

    preisverhandlung: `Betreff: Kaufpreisverhandlung – ${standort}

Sehr geehrte Damen und Herren,

nach eingehender Analyse der Immobilie in ${standort} und Berücksichtigung der aktuellen Marktlage möchte ich Ihnen folgendes Angebot unterbreiten:

Angeforderter Kaufpreis: ${kaufpreis}
Mein Angebot: ${formatEuro(data.kaufpreis * 0.93)} (ca. 7% unter Listenpreis)

Begründung meines Angebots:
• Aktuelles Zinsniveau erfordert höhere Eigenkapitalquote
• Renovierungsbedarf: geschätzte Kosten ca. ${formatEuro(data.wohnflaeche * (data.zustand === 'renovierungsbeduerftig' ? 800 : 300))}
• Vergleichbare Objekte in der Region erzielen ${formatEuro(data.kaufpreis * 0.9)}–${formatEuro(data.kaufpreis * 0.95)}

Ich bin zu einer schnellen und unkomplizierten Abwicklung bereit und kann innerhalb von 4 Wochen den Notartermin wahrnehmen.

Über eine konstruktive Rückmeldung freue ich mich.

Mit freundlichen Grüßen`,
  };

  return emails[type];
}

export function EmailGenerator({ formData }: EmailGeneratorProps) {
  const [emailType, setEmailType] = useState<EmailType>('makler_anfrage');
  const [copied, setCopied] = useState(false);

  const emailText = generateEmail(emailType, formData);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailText).then(() => {
      setCopied(true);
      toast.success('E-Mail in Zwischenablage kopiert');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-4 h-4 text-blue-600" />
        <h3 className="font-display font-bold text-sm">Email-Generator</h3>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email-Vorlage wählen</label>
        <Select value={emailType} onValueChange={v => setEmailType(v as EmailType)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="makler_anfrage">Makler-Anfrage (Unterlagen)</SelectItem>
            <SelectItem value="eigentuemer_anfrage">Eigentümer-Anfrage</SelectItem>
            <SelectItem value="unterlagen_anforderung">Fehlende Unterlagen anfordern</SelectItem>
            <SelectItem value="preisverhandlung">Preisverhandlung</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        value={emailText}
        readOnly
        className="text-xs font-mono min-h-[280px] resize-none bg-secondary/30"
      />

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
        {copied ? 'Kopiert!' : 'In Zwischenablage kopieren'}
      </Button>
    </div>
  );
}
