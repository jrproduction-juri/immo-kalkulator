import {
  Building2, Zap, Crown, LayoutDashboard, LogOut, LogIn,
  ChevronDown, User, Star, Shield, TrendingUp, BarChart3,
  ArrowUpRight, XCircle, RotateCcw, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePro } from '@/contexts/ProContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useState } from 'react';

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

/* ── Hilfsfunktion: Tage seit Kauf ──────────────────────────────────── */
function tageSeitKauf(planActivatedAt: string | null | undefined): number | null {
  if (!planActivatedAt) return null;
  const d = new Date(planActivatedAt);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

/* ── Komponente ─────────────────────────────────────────────────────── */
export function Navbar() {
  const { isPro, plan, setShowUpgradeModal } = usePro();
  const { isAuthenticated, user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Bestätigungs-Dialog-State
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  // Plan-Details aus DB (inkl. Ablaufdatum)
  const planQuery = trpc.plan.get.useQuery(undefined, { enabled: isAuthenticated });
  const planData = planQuery.data;
  const ablaufFormatiert = formatAblauf(planData?.planExpiresAt as string | null | undefined);

  // Widerrufsfrist prüfen (14 Tage)
  const tage = tageSeitKauf((planData?.user as any)?.planActivatedAt);
  const widerrufMoeglich = plan !== 'none' && (tage === null || tage <= 14);
  const widerrufTageVerbleibend = tage !== null ? Math.max(0, 14 - tage) : 14;

  const meta = PLAN_META[plan] ?? PLAN_META['none'];
  const PlanIcon = meta.icon;

  // Mutations
  const utils = trpc.useUtils();

  const cancelMutation = trpc.plan.cancel.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.plan.get.invalidate();
      setShowCancelDialog(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setShowCancelDialog(false);
    },
  });

  const revokeMutation = trpc.plan.revoke.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.plan.get.invalidate();
      setShowRevokeDialog(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setShowRevokeDialog(false);
    },
  });

  return (
    <>
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

                        {/* ── Kündigung (nur für zahlende Nutzer) ── */}
                        {plan !== 'none' && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-3 py-2 text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                            onClick={() => setShowCancelDialog(true)}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Abo kündigen
                          </DropdownMenuItem>
                        )}

                        {/* ── Widerruf (nur innerhalb 14 Tage) ──── */}
                        {widerrufMoeglich && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-3 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => setShowRevokeDialog(true)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Kauf widerrufen
                            <span className="ml-auto text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                              noch {widerrufTageVerbleibend}d
                            </span>
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

      {/* ── Bestätigungs-Dialog: Kündigung ───────────────────────────── */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Abo kündigen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
              Möchtest du dein Abonnement wirklich kündigen?
              <br /><br />
              Du behältst deinen <strong>{meta.label}-Zugang bis zum Ende der aktuellen Laufzeit</strong>.
              Danach wird dein Konto auf den kostenlosen Plan zurückgesetzt.
              <br /><br />
              <span className="text-xs text-muted-foreground">
                Hinweis: Lifetime-Käufe können nicht über diese Funktion gekündigt werden.
                Für eine Rückerstattung nutze bitte „Kauf widerrufen" (innerhalb 14 Tage).
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {cancelMutation.isPending ? 'Wird gekündigt…' : 'Ja, Abo kündigen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Bestätigungs-Dialog: Widerruf ────────────────────────────── */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Kauf widerrufen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
              Du machst von deinem <strong>14-tägigen Widerrufsrecht</strong> Gebrauch.
              <br /><br />
              Der Kaufbetrag wird vollständig erstattet und dein Zugang wird <strong>sofort deaktiviert</strong>.
              Die Erstattung erscheint in 5–10 Werktagen auf deinem Konto.
              <br /><br />
              {tage !== null && (
                <span className="text-xs text-amber-600 font-medium">
                  Noch {widerrufTageVerbleibend} Tag{widerrufTageVerbleibend !== 1 ? 'e' : ''} verbleibend in der Widerrufsfrist.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeMutation.mutate()}
              disabled={revokeMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {revokeMutation.isPending ? 'Wird widerrufen…' : 'Ja, Kauf widerrufen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
