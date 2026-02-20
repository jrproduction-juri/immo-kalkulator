/**
 * Home Page – Immobilien Investment Kalkulator
 * Design: Financial Dashboard / Data Visualization First
 * Layout: Two-column app-like interface (Form left, Results right)
 * Colors: Deep Navy (#0A2540), Royal Blue (#1565C0), Ice Blue (#F0F7FF)
 * Typography: Sora (headlines), IBM Plex Sans (body), IBM Plex Mono (numbers)
 */

import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { InputForm } from '@/components/InputForm';
import { FreeResultsPanel } from '@/components/FreeResults';
import { ProResultsPanel } from '@/components/ProResults';
import { EmailGenerator } from '@/components/EmailGenerator';
import { ExposeGenerator } from '@/components/ExposeGenerator';
import { Navbar } from '@/components/Navbar';
import { UpgradeModal, ProLockBadge } from '@/components/UpgradeModal';
import { usePro } from '@/contexts/ProContext';
import {
  FormData,
  FreeResults,
  ProResults,
  berechneFreeResults,
  berechneProResults,
} from '@/lib/calculations';
import { exportFreePDF, exportProPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';
import {
  Building2, BarChart3, Mail, FileText, ChevronRight,
  Zap, Calculator, TrendingUp, Shield, Star
} from 'lucide-react';

const HERO_IMG = 'https://private-us-east-1.manuscdn.com/sessionFile/d1B7vnkB4jEDrlWUS8LSxe/sandbox/l45cXWfOMIxTINpDvpvKli-img-1_1771591087000_na1fn_aGVyby1idWlsZGluZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZDFCN3Zua0I0akVEcmxXVVM4TFN4ZS9zYW5kYm94L2w0NWNYV2ZPTUl4VElOcER2cHZLbGktaW1nLTFfMTc3MTU5MTA4NzAwMF9uYTFmbl9hR1Z5YnkxaWRXbHNaR2x1WncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=E0caWN5PU2RcuAI-R1YiAyalKQgE7sypGiKRPhUtgHtOuC7zykNm-bySdd4JMI0YfrNeqIrxGx87Rh3JinTXdoX29VC179WURA4OCwO5zmYV8IYejMKpqx191Gw5OKw6SjRUlgmxbe-cQpNvKoDBbZu6qpuaOFZvKbRS8P0fI79qnwRuQGCXH5fcEfXzj7uXpX92mnZtNXwg3Sg2OLAPbUQLfxWcx90VOzsOkpcv3X3H-k9Zhd5T753EUMtCxM2xRDPDJ0CSAvpJHeKUug-Vj9cuddLDH7ZMOrgBGtgeQPK5iy94zSQs4iZYMRTiDZuO6uPBsLmWc-bsEbuQye~rCA__';

const PRO_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/d1B7vnkB4jEDrlWUS8LSxe/sandbox/l45cXWfOMIxTINpDvpvKli-img-3_1771591078000_na1fn_cHJvLWZlYXR1cmUtYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZDFCN3Zua0I0akVEcmxXVVM4TFN4ZS9zYW5kYm94L2w0NWNYV2ZPTUl4VElOcER2cHZLbGktaW1nLTNfMTc3MTU5MTA3ODAwMF9uYTFmbl9jSEp2TFdabFlYUjFjbVV0WW1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=RS28g3EBd~EPunsFekybwqu0aewP6mf6XXvu~lIQY-XO6erJwjZE-lLUq-7obXeGI7veSrx4-bYpOdlfTLQxODG582opb5OkUrIjVfj58PZd12-P6t5DePbVzCojt54FxqypRFznXYvEtaMlr-Bm5Z1xesSahyigYdQdVojFmDZekY1sxoJ5XF6~OVd9DvAyPrAxfPfKmPSzM2N2Ksk7mxJACOeYmwtCrieVYda19p1t9O8qWCXAkaYsCOwR4KcGoQ-tZEUCbVMzVlhHV52kJi106sBQEWOx8QYvzynvGP7sPW3-b8cjP5KfjGGL~pZmZfGYfnyF2t1WdeF21e~JqQ__';

export default function Home() {
  const { isPro, setShowUpgradeModal } = usePro();
  const [freeResults, setFreeResults] = useState<FreeResults | null>(null);
  const [proResults, setProResults] = useState<ProResults | null>(null);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('ergebnisse');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleCalculate = (data: FormData) => {
    setIsCalculating(true);
    setLastFormData(data);

    setTimeout(() => {
      try {
        const free = berechneFreeResults(data);
        setFreeResults(free);

        const pro = berechneProResults(data);
        setProResults(pro);
        setActiveTab('ergebnisse');
        setIsCalculating(false);

        // Scroll to results on mobile
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        toast.success('Berechnung abgeschlossen', {
          description: isPro ? 'Pro-Analyse mit allen Kennzahlen erstellt.' : 'Basis-Analyse erstellt. Pro für vollständige Analyse.',
        });
      } catch (e) {
        setIsCalculating(false);
        toast.error('Fehler bei der Berechnung', { description: 'Bitte prüfe deine Eingaben.' });
      }
    }, 300);
  };

  const handleExportPDF = async () => {
    if (!freeResults || !lastFormData) return;
    try {
      toast.loading('PDF wird erstellt...');
      if (isPro && proResults) {
        await exportProPDF(lastFormData, proResults);
      } else {
        await exportFreePDF(lastFormData, freeResults);
      }
      toast.dismiss();
      toast.success('PDF exportiert');
    } catch (e) {
      toast.dismiss();
      toast.error('PDF-Export fehlgeschlagen');
    }
  };

  const handleProCalculate = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    if (lastFormData) {
      const pro = berechneProResults(lastFormData);
      setProResults(pro);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <UpgradeModal />

      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: '280px' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,37,64,0.88) 0%, rgba(21,101,192,0.75) 60%, rgba(10,37,64,0.6) 100%)' }} />
        <div className="relative container py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 mb-4">
              <Star className="w-3 h-3 text-yellow-300" />
              <span className="text-white/90 text-xs font-medium">Professionelle Investment-Analyse</span>
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-white leading-tight mb-3">
              Immobilien Investment<br />
              <span className="text-blue-300">Kalkulator</span>
            </h1>
            <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl">
              Berechne Cashflow, Rendite & Szenarien in wenigen Klicks. Fundierte Entscheidungsgrundlage für dein nächstes Investment.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: BarChart3, text: 'Rendite-Analyse' },
                { icon: Calculator, text: 'Cashflow-Berechnung' },
                { icon: TrendingUp, text: '10-Jahres-Projektion' },
                { icon: Shield, text: 'Risiko-Bewertung' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
                  <Icon className="w-3 h-3 text-blue-300" />
                  <span className="text-white/80 text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content: Two-Column Layout ───────────────────────────────────── */}
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">

          {/* ── Left Column: Input Form ──────────────────────────────────────── */}
          <div className="lg:sticky lg:top-20">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calculator className="w-3.5 h-3.5 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-sm text-foreground">Eingabe</h2>
                    <p className="text-xs text-muted-foreground">Objekt- & Finanzierungsdaten</p>
                  </div>
                </div>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <InputForm onCalculate={handleCalculate} isCalculating={isCalculating} />
              </div>
            </div>
          </div>

          {/* ── Right Column: Results ─────────────────────────────────────────── */}
          <div ref={resultsRef}>
            {!freeResults ? (
              /* Empty State */
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Placeholder Hero */}
                <div
                  className="relative h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${PRO_BG})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
                </div>
                <div className="px-6 py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    Bereit für deine Analyse
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Fülle das Formular links aus und klicke auf „Berechnung starten", um sofort Cashflow, Rendite und Szenarien zu sehen.
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    {[
                      { icon: BarChart3, label: 'Bruttomietrendite', desc: 'Sofort berechnet' },
                      { icon: Calculator, label: 'Netto-Cashflow', desc: 'Monatlich & jährlich' },
                      { icon: TrendingUp, label: 'Szenarien', desc: 'Vermietung & mehr' },
                      { icon: Shield, label: 'Empfehlung', desc: 'Kauf sinnvoll?' },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="p-3 rounded-xl bg-secondary/50 text-left">
                        <Icon className="w-4 h-4 text-blue-600 mb-1.5" />
                        <p className="text-xs font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Results Tabs */
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* Tab Header */}
                  <div className="px-4 pt-4 border-b border-border">
                    <TabsList className="h-9 bg-secondary/50">
                      <TabsTrigger value="ergebnisse" className="text-xs">
                        <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                        Ergebnisse
                      </TabsTrigger>
                      {isPro && (
                        <TabsTrigger value="pro-analyse" className="text-xs">
                          <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                          Pro-Analyse
                        </TabsTrigger>
                      )}
                      {isPro && lastFormData && (
                        <TabsTrigger value="email" className="text-xs">
                          <Mail className="w-3.5 h-3.5 mr-1.5" />
                          Email
                        </TabsTrigger>
                      )}
                      {isPro && proResults && lastFormData && (
                        <TabsTrigger value="expose" className="text-xs">
                          <Building2 className="w-3.5 h-3.5 mr-1.5" />
                          Exposé
                        </TabsTrigger>
                      )}
                      {!isPro && (
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowUpgradeModal(true)}
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          Pro-Features
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </TabsList>
                  </div>

                  {/* Tab Contents */}
                  <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <TabsContent value="ergebnisse" className="mt-0">
                      <FreeResultsPanel
                        results={freeResults}
                        onExportPDF={handleExportPDF}
                      />
                    </TabsContent>

                    {isPro && (
                      <TabsContent value="pro-analyse" className="mt-0">
                        {proResults ? (
                          <>
                            <ProResultsPanel results={proResults} />
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 btn-gradient text-xs"
                                onClick={handleExportPDF}
                              >
                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                Pro-PDF exportieren
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-4">Pro-Analyse noch nicht berechnet</p>
                            <Button size="sm" className="btn-gradient" onClick={handleProCalculate}>
                              Pro-Analyse starten
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    )}

                    {isPro && lastFormData && (
                      <TabsContent value="email" className="mt-0">
                        <EmailGenerator formData={lastFormData} />
                      </TabsContent>
                    )}

                    {isPro && proResults && lastFormData && (
                      <TabsContent value="expose" className="mt-0">
                        <ExposeGenerator formData={lastFormData} results={proResults} />
                      </TabsContent>
                    )}
                  </div>
                </Tabs>
              </div>
            )}

            {/* Pro Features Teaser (when not pro and has results) */}
            {freeResults && !isPro && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { icon: TrendingUp, label: 'Pro-Analyse', desc: 'Steuer & Projektion' },
                  { icon: Mail, label: 'Email-Generator', desc: 'Makler & Eigentümer' },
                  { icon: Building2, label: 'Exposé', desc: 'Professionelles PDF' },
                ].map(({ icon: Icon, label, desc }) => (
                  <button
                    key={label}
                    onClick={() => setShowUpgradeModal(true)}
                    className="p-3 rounded-xl border border-dashed border-border hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                      <ProLockBadge />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Features Section ──────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-secondary/30 py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Free vs. Pro
            </h2>
            <p className="text-sm text-muted-foreground">Wähle die Version, die zu deinen Anforderungen passt</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Free</p>
                <p className="font-display font-bold text-2xl text-foreground">Kostenlos</p>
                <p className="text-xs text-muted-foreground mt-1">Schnelle Übersicht</p>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[
                  'Bruttomietrendite',
                  'Netto-Cashflow (monatlich/jährlich)',
                  'Basis-Szenarien (Vermietung/Eigennutzung)',
                  'Empfehlung: Kauf sinnvoll?',
                  'Cashflow-Diagramm',
                  'Basis-PDF-Export',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-foreground/80">
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div
              className="relative rounded-2xl p-6 text-white overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1565C0 100%)' }}
            >
              <div className="absolute top-4 right-4">
                <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold">PRO</span>
              </div>
              <div className="mb-4">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Pro</p>
                <p className="font-display font-bold text-2xl">29 € <span className="text-base font-normal text-white/60">einmalig</span></p>
                <p className="text-white/60 text-xs mt-1">Vollständige Analyse</p>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[
                  'Alles aus Free +',
                  'Eigenkapitalrendite & Vervielfältiger',
                  'Steueroptimierung (AfA, Grenzsteuersatz)',
                  '10-Jahres-Projektion mit Grafiken',
                  'Erweiterte Szenarien (Fix & Flip, etc.)',
                  'Risiko-Analyse',
                  'Pro-PDF mit allen Grafiken',
                  'Email-Generator (4 Vorlagen)',
                  'Exposé-Generator',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-white/85">
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-5 bg-white text-blue-900 hover:bg-blue-50 font-semibold"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Jetzt Pro freischalten
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1565C0 100%)' }}
              >
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <span className="font-display font-semibold text-sm text-foreground">ImmoKalkulator</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Alle Berechnungen ohne Gewähr · Keine Anlageberatung · © {new Date().getFullYear()} ImmoKalkulator
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by Master Prompt V2
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
