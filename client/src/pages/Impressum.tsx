import { Navbar } from "@/components/Navbar";
export default function Impressum() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-bold text-3xl text-gray-900 mb-2">Impressum</h1>
        <p className="text-gray-500 text-sm mb-10">Angaben gemäß § 5 TMG</p>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">Anbieter</h2>
          <div className="text-gray-700 leading-relaxed space-y-1">
            <p className="font-medium">ImmoRenditeTool</p>
            <p>ein Projekt von</p>
            <p className="font-medium">Juri Telipko</p>
            <p>JR Production</p>
            <p>Einzelunternehmen</p>
            <p>Römerallee 5</p>
            <p>50127 Bergheim</p>
            <p>Deutschland</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">Kontakt</h2>
          <div className="text-gray-700 leading-relaxed">
            <p>E-Mail: <a href="mailto:info@immorenditetool.de" className="text-blue-600 hover:underline">info@immorenditetool.de</a></p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">Umsatzsteuer</h2>
          <div className="text-gray-700 leading-relaxed">
            <p>Gemäß § 19 UStG wird keine Umsatzsteuer erhoben (Kleinunternehmerregelung).</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 MStV</h2>
          <div className="text-gray-700 leading-relaxed space-y-1">
            <p>Juri Telipko</p>
            <p>Römerallee 5</p>
            <p>50127 Bergheim</p>
            <p>Deutschland</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">Haftungsausschluss</h2>
          <div className="text-gray-700 leading-relaxed space-y-3">
            <p><strong>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>
            <p><strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
            <p><strong>Keine Anlageberatung:</strong> Alle Berechnungen und Auswertungen des ImmoRenditeTools dienen ausschließlich zu Informationszwecken und stellen keine Anlage-, Steuer- oder Rechtsberatung dar.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-semibold text-lg text-gray-900 mb-3">Online-Streitbeilegung</h2>
          <div className="text-gray-700 leading-relaxed">
            <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://ec.europa.eu/consumers/odr/</a></p>
            <p className="mt-2">Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </div>
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
