import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Building2, BarChart3, TrendingUp, Shield, Zap, CheckCircle2, Star, ArrowRight, Calculator } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const HERO_IMG = 'https://private-us-east-1.manuscdn.com/sessionFile/d1B7vnkB4jEDrlWUS8LSxe/sandbox/l45cXWfOMIxTINpDvpvKli-img-1_1771591087000_na1fn_aGVyby1idWlsZGluZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZDFCN3Zua0I0akVEcmxXVVM4TFN4ZS9zYW5kYm94L2w0NWNYV2ZPTUl4VElOcER2cHZLbGktaW1nLTFfMTc3MTU5MTA4NzAwMF9uYTFmbl9hR1Z5YnkxaWRXbHNaR2x1WncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=E0caWN5PU2RcuAI-R1YiAyalKQgE7sypGiKRPhUtgHtOuC7zykNm-bySdd4JMI0YfrNeqIrxGx87Rh3JinTXdoX29VC179WURA4OCwO5zmYV8IYejMKpqx191Gw5OKw6SjRUlgmxbe-cQpNvKoDBbZu6qpuaOFZvKbRS8P0fI79qnwRuQGCXH5fcEfXzj7uXpX92mnZtNXwg3Sg2OLAPbUQLfxWcx90VOzsOkpcv3X3H-k9Zhd5T753EUMtCxM2xRDPDJ0CSAvpJHeKUug-Vj9cuddLDH7ZMOrgBGtgeQPK5iy94zSQs4iZYMRTiDZuO6uPBsLmWc-bsEbuQye~rCA__';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">ImmoRenditeTool</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:block">Preise</a>
            <Button variant="outline" size="sm" onClick={handleLogin} className="text-sm">
              Anmelden
            </Button>
            <Button size="sm" onClick={handleLogin} className="text-sm text-white" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}>
              Kostenlos starten
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,37,64,0.92) 0%, rgba(13,110,253,0.80) 60%, rgba(10,37,64,0.85) 100%)' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 mb-6">
              <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span className="text-white/90 text-xs font-medium">Professionelle Investment-Analyse für Deutschland</span>
            </div>
            <h1 className="font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
              Immobilien Investment<br />
              <span className="text-blue-300">Kalkulator</span>
            </h1>
            <p className="text-white/75 text-lg leading-relaxed mb-8 max-w-xl">
              Berechne Cashflow, Rendite & Szenarien in wenigen Klicks. Fundierte Entscheidungsgrundlage für dein nächstes Investment — mit Steueroptimierung und 10-Jahres-Projektion.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: BarChart3, text: 'Rendite-Analyse' },
                { icon: Calculator, text: 'Cashflow-Berechnung' },
                { icon: TrendingUp, text: '10-Jahres-Projektion' },
                { icon: Shield, text: 'Steueroptimierung' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                  <Icon className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-white/80 text-sm">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={handleLogin}
                className="text-white font-semibold px-8 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #0D6EFD 0%, #0A2540 100%)' }}
              >
                Jetzt kostenlos starten
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="/pricing">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium">
                  Preise ansehen
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-bold text-3xl text-gray-900 mb-3">Alles was du für dein Investment brauchst</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Von der ersten Kalkulation bis zum professionellen Report — alles in einer App.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Calculator,
                title: 'Präzise Berechnungen',
                desc: 'Bruttomietrendite, Netto-Cashflow, Eigenkapitalrendite und AfA — alle relevanten Kennzahlen auf einen Blick.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: TrendingUp,
                title: 'Szenarien & Projektion',
                desc: '10-Jahres-Projektion, Sanieren & Verkaufen, steuerfreier Verkauf nach 24 Monaten Eigennutzung und mehr.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: Shield,
                title: 'Steueroptimierung',
                desc: 'AfA-Berechnung, Grenzsteuersatz, Spekulationssteuer und Steuerersparnis — rechtssicher und verständlich.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Building2,
                title: 'Portfolio-Verwaltung',
                desc: 'Speichere alle deine Immobilien, vergleiche sie nebeneinander und behalte den Überblick über dein Portfolio.',
                color: 'bg-orange-50 text-orange-600',
              },
              {
                icon: BarChart3,
                title: 'PDF & Excel Export',
                desc: 'Professionelle Reports mit allen Grafiken, Szenarien und Kennzahlen — bereit für Banken und Berater.',
                color: 'bg-red-50 text-red-600',
              },
              {
                icon: Zap,
                title: 'Email & Exposé',
                desc: 'Generiere professionelle Makler-Emails und Exposés direkt aus deinen Berechnungen.',
                color: 'bg-yellow-50 text-yellow-600',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-bold text-3xl text-gray-900 mb-3">Transparente Preise</h2>
            <p className="text-gray-500 text-lg">Einmalzahlung oder Abo — du entscheidest.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Basic',
                price: '49 €',
                billing: 'Einmalzahlung',
                desc: 'Perfekt für Einsteiger',
                features: ['Bruttomietrendite', 'Netto-Cashflow', 'AfA & Steuer', 'Eigenkapitalrendite', 'Bis zu 10 Immobilien'],
                cta: 'Basic wählen',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '99 €',
                billing: 'Einmalig oder 19 €/Monat',
                desc: 'Für aktive Investoren',
                features: ['Alle Basic-Features', 'Erweiterte Szenarien', 'PDF-Report', 'Exposé-Generator', 'Email-Generator', '14 Tage kostenlos testen'],
                cta: 'Pro wählen',
                highlight: true,
              },
              {
                name: 'Investor',
                price: '149 €',
                billing: 'Einmalzahlung',
                desc: 'Für Profi-Investoren',
                features: ['Alle Pro-Features', 'Unbegrenzte Immobilien', 'Portfolio-Übersicht', 'Objekte vergleichen', 'Excel-Export'],
                cta: 'Investor wählen',
                highlight: false,
              },
            ].map(({ name, price, billing, desc, features, cta, highlight }) => (
              <div
                key={name}
                className={`relative rounded-2xl p-6 border ${highlight ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-200'}`}
                style={highlight ? { background: 'linear-gradient(135deg, #0A2540 0%, #1565C0 100%)' } : { background: 'white' }}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold">BELIEBTESTE WAHL</span>
                  </div>
                )}
                <div className="mb-5">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${highlight ? 'text-blue-300' : 'text-gray-400'}`}>{name}</p>
                  <p className={`font-bold text-3xl ${highlight ? 'text-white' : 'text-gray-900'}`}>{price}</p>
                  <p className={`text-xs mt-1 ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>{billing}</p>
                  <p className={`text-sm mt-2 ${highlight ? 'text-white/70' : 'text-gray-500'}`}>{desc}</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${highlight ? 'text-white/85' : 'text-gray-600'}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${highlight ? 'text-blue-300' : 'text-blue-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full font-semibold ${highlight ? 'bg-white text-blue-900 hover:bg-blue-50' : ''}`}
                  variant={highlight ? 'default' : 'outline'}
                  onClick={handleLogin}
                >
                  {cta}
                </Button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/pricing" className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
              Alle Features vergleichen <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-bold text-3xl text-white mb-4">Starte jetzt deine erste Analyse</h2>
          <p className="text-white/70 text-lg mb-8">Kostenlos anmelden, Daten eingeben, sofort Ergebnisse sehen.</p>
          <Button
            size="lg"
            onClick={handleLogin}
            className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-10"
          >
            Kostenlos starten <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0A2540 0%, #0D6EFD 100%)' }}>
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-900">ImmoRenditeTool</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Alle Berechnungen ohne Gewähr · Keine Anlageberatung · © {new Date().getFullYear()} ImmoRenditeTool
          </p>
          <div className="flex gap-4">
            <a href="/pricing" className="text-xs text-gray-400 hover:text-gray-600">Preise</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
