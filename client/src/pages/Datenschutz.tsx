import { Navbar } from "@/components/Navbar";
export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-bold text-3xl text-gray-900 mb-2">Datenschutzerklärung</h1>
        <p className="text-gray-500 text-sm mb-10">Stand: März 2026</p>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">1. Allgemeine Hinweise</h2>
          <p className="text-gray-700 leading-relaxed">
            Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften (DSGVO, BDSG) sowie dieser Datenschutzerklärung. Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten möglich.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">2. Verantwortliche Stelle</h2>
          <div className="text-gray-700 leading-relaxed space-y-1">
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
            <div className="mt-2 pl-4 border-l-2 border-gray-200 space-y-1">
              <p className="font-medium">Juri Telipko · JR Production</p>
              <p>Römerallee 5, 50127 Bergheim</p>
              <p>E-Mail: <a href="mailto:info@immorenditetool.de" className="text-blue-600 hover:underline">info@immorenditetool.de</a></p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">3. Erhebung und Speicherung personenbezogener Daten</h2>
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p>Beim Besuch unserer Website werden automatisch Informationen durch den Hosting-Anbieter in sogenannten Server-Logfiles erfasst. Dazu gehören:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Browsertyp und Browserversion</li>
              <li>Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse (anonymisiert)</li>
            </ul>
            <p>Diese Daten sind nicht bestimmten Personen zuordenbar und werden nicht mit anderen Datenquellen zusammengeführt. Sie dienen ausschließlich der technischen Bereitstellung und Sicherheit der Website.</p>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren und fehlerfreien Bereitstellung der Website).</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">4. Nutzerkonto und Authentifizierung</h2>
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p>Zur Nutzung bestimmter Funktionen (Speichern von Analysen, Portfolio-Verwaltung) ist eine Registrierung und Anmeldung erforderlich. Wir nutzen dafür ein OAuth-basiertes Authentifizierungssystem. Dabei werden folgende Daten verarbeitet:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Benutzername / Anzeigename</li>
              <li>E-Mail-Adresse</li>
              <li>Sitzungstoken (verschlüsselt als Cookie)</li>
            </ul>
            <p>Passwörter werden nicht von uns gespeichert. Die Authentifizierung erfolgt über den OAuth-Anbieter Manus. Die gespeicherten Immobiliendaten (Eingaben, Berechnungen) sind ausschließlich Ihrem Konto zugeordnet und werden nicht an Dritte weitergegeben.</p>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">5. Nutzung des Immobilien-Analyse-Tools</h2>
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p>Bei der Nutzung des ImmoRenditeTools können Sie Immobiliendaten (Kaufpreis, Miete, Finanzierungsdaten etc.) eingeben. Diese Daten werden:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Zur Berechnung und Darstellung von Ergebnissen verarbeitet</li>
              <li>Bei angemeldeten Nutzern optional in Ihrer persönlichen Datenbank gespeichert</li>
              <li>Nicht ohne Ihre Zustimmung an Dritte weitergegeben</li>
              <li>Nicht für Werbezwecke genutzt</li>
            </ul>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) bzw. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">6. Zahlungsabwicklung (Stripe)</h2>
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p>Für die Abwicklung kostenpflichtiger Abonnements nutzen wir den Zahlungsdienstleister <strong>Stripe, Inc.</strong> (354 Oyster Point Blvd, South San Francisco, CA 94080, USA).</p>
            <p>Im Rahmen der Zahlungsabwicklung werden folgende Daten an Stripe übermittelt:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Name und E-Mail-Adresse</li>
              <li>Zahlungsdaten (Kreditkartennummer, IBAN etc. — direkt an Stripe, nicht an uns)</li>
              <li>Rechnungsadresse (optional)</li>
            </ul>
            <p>Stripe ist nach dem EU-US Data Privacy Framework zertifiziert. Die Datenschutzerklärung von Stripe finden Sie unter: <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://stripe.com/de/privacy</a></p>
            <p>Wir selbst speichern keine vollständigen Zahlungsdaten. Stripe stellt uns lediglich anonymisierte Transaktions-IDs und Abo-Status-Informationen zur Verfügung.</p>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">7. Webanalyse (Umami Analytics)</h2>
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p>Wir nutzen <strong>Umami Analytics</strong> zur datenschutzfreundlichen Analyse des Nutzungsverhaltens auf unserer Website. Umami:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Setzt keine Cookies</li>
              <li>Speichert keine personenbezogenen Daten</li>
              <li>Anonymisiert IP-Adressen vollständig</li>
              <li>Ist DSGVO-konform ohne Einwilligung nutzbar</li>
            </ul>
            <p>Es werden ausschließlich aggregierte, anonyme Nutzungsstatistiken (Seitenaufrufe, Verweildauer, Herkunftsland) erfasst.</p>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Verbesserung unseres Angebots).</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">8. Cookies</h2>
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p>Wir verwenden ausschließlich technisch notwendige Cookies:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Sitzungs-Cookie:</strong> Zur Aufrechterhaltung Ihrer Anmeldung (verschlüsselt, HttpOnly, SameSite=Strict)</li>
            </ul>
            <p>Tracking-Cookies oder Cookies von Drittanbietern für Werbezwecke werden nicht eingesetzt.</p>
            <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) für technisch notwendige Cookies.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">9. Ihre Rechte</h2>
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p>Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
              <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
              <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
              <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p>Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: <a href="mailto:info@immorenditetool.de" className="text-blue-600 hover:underline">info@immorenditetool.de</a></p>
            <p>Sie haben zudem das Recht, sich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren. In Nordrhein-Westfalen ist dies der <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Landesbeauftragte für Datenschutz und Informationsfreiheit NRW</a>.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">10. Datensicherheit</h2>
          <p className="text-gray-700 leading-relaxed">
            Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">11. Änderungen dieser Datenschutzerklärung</h2>
          <p className="text-gray-700 leading-relaxed">
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie stets den aktuellen rechtlichen Anforderungen entsprechen zu lassen oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6 bg-gray-50">
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
