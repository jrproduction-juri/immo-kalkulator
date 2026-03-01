import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputForm } from '@/components/InputForm';
import { FreeResultsPanel } from '@/components/FreeResults';
import { ProResultsPanel } from '@/components/ProResults';
import { EmailGenerator } from '@/components/EmailGenerator';
import { ExposeGenerator } from '@/components/ExposeGenerator';
import { Navbar } from '@/components/Navbar';
import { UpgradeModal } from '@/components/UpgradeModal';
import { usePro } from '@/contexts/ProContext';
import { trpc } from '@/lib/trpc';
import {
  FormData,
  FreeResults,
  ProResults,
  berechneFreeResults,
  berechneProResults,
  getDefaultFormData,
} from '@/lib/calculations';
import { exportFreePDF, exportProPDF } from '@/lib/pdfExport';
import { exportExcel } from '@/lib/excelExport';
import { toast } from 'sonner';
import {
  Building2, BarChart3, Mail, FileText, ChevronRight,
  Zap, Calculator, TrendingUp, Save, ArrowLeft, Check, Table
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { KennzahlenLegende } from '@/components/KennzahlenLegende';

const PRO_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/d1B7vnkB4jEDrlWUS8LSxe/sandbox/l45cXWfOMIxTINpDvpvKli-img-3_1771591078000_na1fn_cHJvLWZlYXR1cmUtYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvZDFCN3Zua0I0akVEcmxXVVM4TFN4ZS9zYW5kYm94L2w0NWNYV2ZPTUl4VElOcER2cHZLbGktaW1nLTNfMTc3MTU5MTA3ODAwMF9uYTFmbl9jSEp2TFdabFlYUjFjbVV0WW1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=RS28g3EBd~EPunsFekybwqu0aewP6mf6XXvu~lIQY-XO6erJwjZE-lLUq-7obXeGI7veSrx4-bYpOdlfTLQxODG582opb5OkUrIjVfj58PZd12-P6t5DePbVzCojt54FxqypRFznXYvEtaMlr-Bm5Z1xesSahyigYdQdVojFmDZekY1sxoJ5XF6~OVd9DvAyPrAxfPfKmPSzM2N2Ksk7mxJACOeYmwtCrieVYda19p1t9O8qWCXAkaYsCOwR4KcGoQ-tZEUCbVMzVlhHV52kJi106sBQEWOx8QYvzynvGP7sPW3-b8cjP5KfjGGL~pZmZfGYfnyF2t1WdeF21e~JqQ__';

export default function Kalkulator() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { isPro, isBasic, isInvestor, setShowUpgradeModal } = usePro();

  // Formular-State (kontrolliert)
  const [formData, setFormData] = useState<FormData>(() => getDefaultFormData('wohnung'));

  const [freeResults, setFreeResults] = useState<FreeResults | null>(null);
  const [proResults, setProResults] = useState<ProResults | null>(null);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('ergebnisse');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedId, setSavedId] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  // Bestehende Immobilie laden wenn ID vorhanden
  const existingQuery = trpc.immobilien.get.useQuery(
    { id: parseInt(params.id ?? '0') },
    { enabled: !!params.id && !isNaN(parseInt(params.id ?? '0')) }
  );

  const createMutation = trpc.immobilien.create.useMutation({
    onSuccess: (data: any) => {
      toast.success('Analyse gespeichert!');
      setSavedId(data.id ?? null);
      setShowSaveDialog(false);
      utils.immobilien.list.invalidate();
    },
    onError: (err) => {
      if (err.message.includes('Upgrade')) {
        toast.error('Upgrade erforderlich', { description: err.message });
        navigate('/pricing');
      } else {
        toast.error(err.message);
      }
    },
  });

  const updateMutation = trpc.immobilien.update.useMutation({
    onSuccess: () => {
      toast.success('Analyse aktualisiert!');
      setShowSaveDialog(false);
      utils.immobilien.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Bestehende Daten laden
  useEffect(() => {
    if (existingQuery.data) {
      const immo = existingQuery.data;
      setSavedId(immo.id);
      setSaveName(immo.name);
      const eingaben = immo.eingaben as FormData;
      if (eingaben) {
        setLastFormData(eingaben);
        const free = berechneFreeResults(eingaben);
        setFreeResults(free);
        const pro = berechneProResults(eingaben);
        setProResults(pro);
        setActiveTab('ergebnisse');
      }
    }
  }, [existingQuery.data]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setLastFormData(formData);

    setTimeout(() => {
      try {
        const free = berechneFreeResults(formData);
        setFreeResults(free);
        const pro = berechneProResults(formData);
        setProResults(pro);
        setActiveTab('ergebnisse');
        setIsCalculating(false);

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        toast.success('Berechnung abgeschlossen', {
          description: isPro ? 'Pro-Analyse mit allen Kennzahlen erstellt.' : 'Basis-Analyse erstellt.',
        });
      } catch (e) {
        setIsCalculating(false);
        toast.error('Fehler bei der Berechnung', { description: 'Bitte prüfe deine Eingaben.' });
      }
    }, 300);
  };

  const handleSave = () => {
    if (!lastFormData || !freeResults) return;
    // Speichern ist fuer alle Plaene erlaubt (Free, Basic, Pro, Investor)
    // Das Backend prueft die Limits
    if (savedId) {
      // Update
      updateMutation.mutate({
        id: savedId,
        name: saveName || 'Meine Immobilie',
        art: lastFormData.art as any,
        standort: lastFormData.standort,
        eingaben: lastFormData as any,
        ergebnisse: freeResults as any,
        szenarien: proResults as any,
      });
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleSaveConfirm = () => {
    if (!lastFormData || !freeResults) return;
    createMutation.mutate({
      name: saveName || 'Meine Immobilie',
      art: lastFormData.art as any,
      standort: lastFormData.standort,
      eingaben: lastFormData as any,
      ergebnisse: freeResults as any,
      szenarien: proResults as any,
    });
  };

  const handleExportExcel = () => {
    if (!lastFormData || !freeResults) return;
    try {
      exportExcel(lastFormData, freeResults, proResults);
      toast.success('Excel exportiert');
    } catch (e) {
      toast.error('Excel-Export fehlgeschlagen');
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <UpgradeModal />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/20">
        <div className="container py-2 flex items-center gap-2">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs text-foreground font-medium">
            {savedId ? saveName || 'Analyse' : 'Neue Analyse'}
          </span>
          {savedId && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
              <Check className="w-3 h-3" /> Gespeichert
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">

          {/* Left: Input Form */}
          <div className="lg:sticky lg:top-20">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calculator className="w-3.5 h-3.5 text-blue-700" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-sm text-foreground">Eingabe</h2>
                      <p className="text-xs text-muted-foreground">Objekt- & Finanzierungsdaten</p>
                    </div>
                  </div>
                  {freeResults && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5"
                      onClick={handleSave}
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <Save className="w-3 h-3" />
                      {savedId ? 'Aktualisieren' : 'Speichern'}
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <InputForm
                  data={formData}
                  onChange={setFormData}
                  onCalculate={handleCalculate}
                  isPro={isPro}
                  onUpgrade={() => setShowUpgradeModal(true)}
                  isLoading={isCalculating}
                />
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div ref={resultsRef}>
            {!freeResults ? (
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
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
                      { icon: TrendingUp, label: 'Empfehlung', desc: 'Kauf sinnvoll?' },
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
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                              {isInvestor && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={handleExportExcel}
                                >
                                  <Table className="w-3.5 h-3.5 mr-1.5" />
                                  Excel
                                </Button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-4">Pro-Analyse noch nicht berechnet</p>
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

            {/* Kennzahlen-Legende – immer sichtbar wenn Ergebnisse vorhanden */}
            {freeResults && (
              <div className="mt-4">
                <KennzahlenLegende />
              </div>
            )}

            {/* Pro Features Teaser */}
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
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">Pro</span>
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

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Analyse speichern</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-sm mb-1.5 block">Name der Immobilie</Label>
            <Input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="z.B. ETW München Schwabing"
              className="h-9"
              onKeyDown={e => e.key === 'Enter' && handleSaveConfirm()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>Abbrechen</Button>
            <Button
              size="sm"
              className="btn-gradient"
              onClick={handleSaveConfirm}
              disabled={createMutation.isPending}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
