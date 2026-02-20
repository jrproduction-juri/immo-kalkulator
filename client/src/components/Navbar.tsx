import { Building2, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePro } from '@/contexts/ProContext';

export function Navbar() {
  const { isPro, setShowUpgradeModal, deactivatePro } = usePro();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1565C0 100%)' }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-foreground leading-none block">
                ImmoKalkulator
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                Investment Analyse
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isPro ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">Pro aktiv</span>
                </div>
                <button
                  onClick={deactivatePro}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                className="h-8 text-xs font-semibold btn-gradient"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Pro freischalten
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
