import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePro } from '@/contexts/ProContext';
import { Check, Lock, Zap, FileText, Mail, Building2, BarChart3, X, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

const PRO_FEATURES = [
  { icon: BarChart3, text: 'Vollständige Berechnungen & erweiterte Szenarien' },
  { icon: FileText, text: 'PDF-Export mit allen Grafiken & Szenarien' },
  { icon: Mail, text: 'Email-Generator an Makler / Eigentümer' },
  { icon: Building2, text: 'Exposé-Generator mit professionellem Layout' },
  { icon: Zap, text: '10-Jahres-Projektion & Steueroptimierung' },
  { icon: Check, text: 'Risiko-Analyse & Lagebewertung' },
];

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal } = usePro();
  const [, navigate] = useLocation();

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        <DialogTitle className="sr-only">Pro freischalten</DialogTitle>
        {/* Header */}
        <div
          className="relative px-8 pt-8 pb-6 text-white"
          style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1565C0 100%)' }}
        >
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Upgrade auf</p>
              <h2 className="text-2xl font-display font-bold">Pro Version</h2>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Schalte alle Profi-Features frei und erhalte eine vollständige Investitionsanalyse.
          </p>
        </div>

        {/* Features */}
        <div className="px-8 py-6" style={{ background: "#111827" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Enthaltene Features
          </p>
          <ul className="space-y-3">
            {PRO_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <feature.icon className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm text-foreground">{feature.text}</span>
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-blue-900">ab 9 €</span>
              <span className="text-sm text-blue-600">/Monat</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">Basic, Pro oder Investor · Monatlich, jährlich oder einmalig</p>
          </div>

          {/* CTA */}
          <Button
            className="w-full mt-4 h-12 text-base font-semibold btn-gradient"
            onClick={handleUpgrade}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Zur Preisübersicht
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Alle Pläne ohne Risiko · Jederzeit kündbar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProLockBadge({ onClick }: { onClick?: () => void }) {
  const { setShowUpgradeModal } = usePro();
  return (
    <button
      type="button"
      onClick={() => { onClick?.(); setShowUpgradeModal(true); }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
    >
      <Lock className="w-3 h-3" />
      Pro
    </button>
  );
}
