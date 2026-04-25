import { Navbar } from "@/components/Navbar";
export default function AGB() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0F1A" }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-bold text-3xl text-white mb-2">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-gray-500 text-sm mb-10">Stand: März 2026 · ImmoRenditeTool von Juri Telipko / JR Production</p>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">1. Geltungsbereich</h2>
          <div className="text-gray-700 leading-relaxed space-y-2">
            <p>Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung des Online-Tools <strong>ImmoRenditeTool</strong> (nachfolgend „Tool" oder „Dienst") unter der Domain immorenditetool.de, betrieben von Juri Telipko / JR Production, Römerallee 5, 50127 Bergheim (nachfolgend „Anbieter").</p>
            <p>Mit der Registrierung oder der Nutzung des Tools erklärt sich der Nutzer mit diesen AGB einverstanden. Abweichende Bedingungen des Nutzers werden nicht anerkannt.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">2. Leistungsbeschreibung</h2>
          <div className="text-gray-700 leading-relaxed space-y-2">
            <p>Das ImmoRenditeTool stellt Berechnungen und Auswertungen zur wirtschaftlichen Analyse von Immobilieninvestitionen bereit. Der Dienst umfasst je nach gewähltem Tarif:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Berechnung von Bruttomietrendite, Netto-Cashflow und Eigenkapitalrendite</li>
              <li>AfA-Berechnung und Steueroptimierung</li>
              <li>10-Jahres-Projektion und Szenario-Analysen</li>
              <li>PDF Investment-Report (Pro und Investor)</li>
              <li>Portfolio-Verwaltung und Objekt-Speicherung</li>
              <li>Excel-Export (Investor)</li>
            </ul>
            <p className="mt-2"><strong>Wichtiger Hinweis:</strong> Die Ergebnisse des Tools dienen ausschließlich zu Informationszwecken und stellen keine Anlage-, Steuer- oder Rechtsberatung dar. Alle Berechnungen basieren auf den vom Nutzer eingegebenen Daten.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">3. Registrierung und Nutzerkonto</h2>
          <div className="text-gray-700 leading-relaxed space-y-2">
            <p>Zur Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. Der Nutzer verpflichtet sich:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Wahrheitsgemäße und vollständige Angaben zu machen</li>
              <li>Zugangsdaten vertraulich zu behandeln und nicht an Dritte weiterzugeben</li>
              <li>Den Anbieter unverzüglich zu informieren, wenn ein Missbrauch des Kontos vermutet wird</li>
            </ul>
            <p>Der Anbieter behält sich vor, Nutzerkonten bei Verstößen gegen diese AGB zu sperren oder zu löschen.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">4. Preise und Zahlungsbedingungen</h2>
          <div className="text-gray-700 leading-relaxed space-y-2">
            <p>Die aktuell gültigen Preise sind auf der Preisseite (<a href="/pricing" className="text-blue-600 hover:underline">immorenditetool.de/pricing</a>) einsehbar. Es gelten folgende Tarife:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Free:</strong> Kostenlos, eingeschränkte Funktionen</li>
              <li><strong>Basic:</strong> ab 9 €/Monat, 79 €/Jahr oder 149 € einmalig</li>
              <li><strong>Pro:</strong> ab 19 €/Monat, 149 €/Jahr oder 299 € einmalig</li>
              <li><strong>Investor:</strong> ab 39 €/Monat, 299 €/Jahr oder 499 € einmalig</li>
            </ul>
            <p className="mt-2">Die Zahlungsabwicklung erfolgt über <strong>Stripe</strong>. Alle Preise verstehen sich inkl. gesetzlicher Umsatzsteuer (soweit anwendbar). Da der Anbieter die Kleinunternehmerregelung gemäß § 19 UStG anwendet, wird keine Umsatzsteuer ausgewiesen.</p>
            <p><strong>Abonnements</strong> verlängern sich automatisch, sofern sie nicht spätestens 24 Stunden vor Ende des Abrechnungszeitraums gekündigt werden. <strong>Einmalige Lizenzen</strong> laufen unbefristet.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">5. Widerrufsrecht</h2>
          <div className="text-gray-700 leading-relaxed space-y-2">
            <p>Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Bei digitalen Inhalten, die sofort nach Kaufabschluss bereitgestellt werden, erlischt das Widerrufsrecht mit ausdrücklicher Zustimmung des Nutzers zur sofortigen Ausführung.</p>
            <p>Für Abonnements gilt: Der Nutzer kann innerhalb von 14 Tagen nach Vertragsschluss widerrufen. Für bereits erbrachte Leistungen wird eine anteilige Vergütung berechnet.</p>
            <p>Widerruf per E-Mail an: <a href="mailto:info@immorenditetool.de" className="text-blue-600 hover:underline">info@immorenditetool.de</a></p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">6. Haftungsausschluss</h2>
          <div className="text-gray-700 leading-relaxed space-y-2">
            <p>Alle Berechnungen erfolgen auf Basis der vom Nutzer eingegebenen Daten. Der Anbieter übernimmt keine Gewähr für:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Die Richtigkeit, Vollständigkeit oder Aktualität der Berechnungsergebnisse</li>
              <li>Investitionsentscheidungen, die auf Basis des Tools getroffen werden</li>
              <li>Steuerliche oder rechtliche Konsequenzen aus der Nutzung des Tools</li>
            </ul>
            <p>Die Haftung des Anbieters ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">7. Verfügbarkeit</h2>
          <p className="text-gray-700 leading-relaxed">
            Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit des Tools, kann jedoch keine dauerhafte Verfügbarkeit garantieren. Wartungsarbeiten, technische Störungen oder höhere Gewalt können zu vorübergehenden Einschränkungen führen. Ein Anspruch auf Verfügbarkeit besteht nicht.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">8. Nutzungsrechte und geistiges Eigentum</h2>
          <div className="text-gray-700 leading-relaxed space-y-2">
            <p>Der Anbieter räumt dem Nutzer ein nicht-exklusives, nicht übertragbares Recht zur Nutzung des Tools für private und gewerbliche Zwecke ein. Es ist nicht gestattet:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Das Tool zu kopieren, zu dekompilieren oder zu reverse-engineeren</li>
              <li>Zugangsdaten an Dritte weiterzugeben</li>
              <li>Das Tool für automatisierte Massenabfragen zu nutzen</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">9. Änderungen</h2>
          <p className="text-gray-700 leading-relaxed">
            Der Anbieter behält sich vor, Funktionen, Inhalte und Preise des Tools jederzeit zu ändern oder zu erweitern. Wesentliche Änderungen der AGB werden dem Nutzer per E-Mail mitgeteilt. Widerspricht der Nutzer nicht innerhalb von 30 Tagen, gelten die neuen AGB als akzeptiert.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-white mb-3">10. Schlussbestimmungen</h2>
          <div className="text-gray-700 leading-relaxed space-y-2">
            <p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist Bergheim, soweit gesetzlich zulässig.</p>
            <p>Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
          </div>
        </section>
      </main>

      <footer className="py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-wrap gap-4 justify-center text-xs text-gray-400">
          <a href="/impressum" className="hover:text-gray-600">Impressum</a>
          <a href="/datenschutz" className="hover:text-gray-600">Datenschutz</a>
          <a href="/agb" className="hover:text-gray-600">AGB</a>
          <span>© {new Date().getFullYear()} ImmoRenditeTool · Juri Telipko</span>
        </div>
      </footer>
    </div>
  );
}
