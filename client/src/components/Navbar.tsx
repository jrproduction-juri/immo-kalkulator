import {
  Building2, Zap, Crown, LayoutDashboard, LogOut, LogIn,
  ChevronDown, User, Star, Shield, TrendingUp, BarChart3,
  ArrowUpRight, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePro } from '@/contexts/ProContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

/* ── Plan-Metadaten ────────────────────────────────────────────────── */
const PLAN_META: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  badgeClass: string;
  beschreibung: string;
}> = {
  none: {
    label: 'Free',
    icon: User,
    color: 'text-slate-500',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    beschreibung: '1 Objekt · Basis-Kennzahlen',
  },
  basic: {
    label: 'Basic',
    icon: Shield,
    color: 'text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    beschreibung: '10 Objekte · Alle Kennzahlen',
  },
  pro: {
    label: 'Pro',
    icon: TrendingUp,
    color: 'text-violet-600',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    beschreibung: '50 Objekte · PDF · Exposé · Email',
  },
  investor: {
    label: 'Investor',
    icon: Crown,
    color: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    beschreibung: 'Unbegrenzt · Excel · Portfolio',
  },
};

/* ── Hilfsfunktion: Ablaufdatum formatieren ─────────────────────────── */
function formatAblauf(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ── Komponente ─────────────────────────────────────────────────────── */
export function Navbar() {
  const { isPro, plan, setShowUpgradeModal } = usePro();
  const { isAuthenticated, user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Plan-Details aus DB (inkl. Ablaufdatum)
  const planQuery = trpc.plan.get.useQuery(undefined, { enabled: isAuthenticated });
  const planData = planQuery.data;
  const ablaufFormatiert = formatAblauf(planData?.planExpiresAt as string | null | undefined);

  const meta = PLAN_META[plan] ?? PLAN_META['none'];
  const PlanIcon = meta.icon;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-14">

          {/* ── Logo ─────────────────────────────────────────────── */}
          <a href="/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663196939510/MpQxIZzGZxrLthGU.png"
              alt="ImmoRenditeTool Logo"
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div>
              <span className="font-display font-bold text-sm text-foreground leading-none block">
                ImmoRenditeTool
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                Rendite & Cashflow
              </span>
            </div>
          </a>

          {/* ── Rechte Seite ─────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Dashboard-Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs hidden sm:flex"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                  Dashboard
                </Button>

                {/* Upgrade-Button für Free-User */}
                {plan === 'none' && (
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold btn-gradient hidden sm:flex"
                    onClick={() => navigate('/pricing')}
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Upgraden
                  </Button>
                )}

                {/* ── Profil-Dropdown ──────────────────────────── */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border hover:bg-secondary/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {/* Avatar */}
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-bold leading-none">
                          {(user?.name ?? 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Name (versteckt auf sehr kleinen Screens) */}
                      <span className="text-xs font-medium text-foreground hidden sm:block max-w-[100px] truncate">
                        {user?.name ?? 'Profil'}
                      </span>
                      {/* Plan-Badge */}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${meta.badgeClass} hidden sm:block`}>
                        {meta.label}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">

                    {/* ── Kopfbereich: Plan-Info ──────────────── */}
                    <div className="px-4 py-3 bg-secondary/40 border-b border-border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Angemeldet als</p>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {user?.name ?? '–'}
                          </p>
                          {user?.email && (
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          )}
                        </div>
                        {/* Plan-Kachel */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shrink-0 ${meta.badgeClass}`}>
                          <PlanIcon className={`w-3.5 h-3.5 ${meta.color}`} />
                          <span className="text-xs font-bold">{meta.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Plan-Details ─────────────────────────── */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Dein Plan
                      </p>
                      <div className="flex items-center gap-2 mb-1.5">
                        <PlanIcon className={`w-4 h-4 ${meta.color}`} />
                        <span className="text-sm font-semibold text-foreground">{meta.label}-Plan</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{meta.beschreibung}</p>

                      {/* Ablaufdatum (nur wenn vorhanden) */}
                      {ablaufFormatiert && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                          <Star className="w-3 h-3 shrink-0" />
                          <span>Gültig bis {ablaufFormatiert}</span>
                        </div>
                      )}

                      {/* Objekt-Limit */}
                      {planData && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BarChart3 className="w-3 h-3 shrink-0" />
                          <span>
                            {planData.immobilienCount ?? 0} / {
                              plan === 'none' ? '1' :
                              plan === 'basic' ? '10' :
                              plan === 'pro' ? '50' : '∞'
                            } Objekte gespeichert
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Aktionen ─────────────────────────────── */}
                    <div className="p-1.5">
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-3 py-2"
                        onClick={() => navigate('/dashboard')}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" />
                        Mein Dashboard
                      </DropdownMenuItem>

                      {plan !== 'investor' && (
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-3 py-2 text-blue-700 focus:text-blue-700 focus:bg-blue-50"
                          onClick={() => navigate('/pricing')}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Plan upgraden
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="my-1" />

                      <DropdownMenuItem
                        className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-3 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => logout()}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Abmelden
                      </DropdownMenuItem>
                    </div>

                  </DropdownMenuContent>
                </DropdownMenu>
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
