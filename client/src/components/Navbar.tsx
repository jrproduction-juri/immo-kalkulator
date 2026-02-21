import { Building2, Zap, Crown, LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePro } from '@/contexts/ProContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';

const PLAN_LABELS: Record<string, string> = {
  none: 'Kein Plan',
  basic: 'Basic',
  pro: 'Pro',
  investor: 'Investor',
  trial: 'Pro Trial',
};

export function Navbar() {
  const { isPro, plan, setShowUpgradeModal } = usePro();
  const { isAuthenticated, user, logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/dashboard" className="flex items-center gap-2.5">
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
          </a>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isPro ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">{PLAN_LABELS[plan] ?? 'Pro'} aktiv</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold btn-gradient"
                    onClick={() => navigate('/pricing')}
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Upgraden
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => logout()}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="h-8 text-xs font-semibold btn-gradient"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Anmelden
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
