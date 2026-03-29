import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users, Search, Crown, Star, TrendingUp, Shield,
  RefreshCw, Edit2, ArrowLeft,
  ChevronUp, ChevronDown, AlertCircle
} from "lucide-react";
import type { User } from "../../../drizzle/schema";
import { toast } from "sonner";

type PlanType = "none" | "basic" | "pro" | "investor";

const PLAN_CONFIG: Record<PlanType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  none: { label: "Kein Plan", color: "text-slate-500", bg: "bg-slate-100", icon: <Shield className="w-3 h-3" /> },
  basic: { label: "Basic", color: "text-blue-600", bg: "bg-blue-100", icon: <Star className="w-3 h-3" /> },
  pro: { label: "Pro", color: "text-violet-600", bg: "bg-violet-100", icon: <TrendingUp className="w-3 h-3" /> },
  investor: { label: "Investor", color: "text-amber-600", bg: "bg-amber-100", icon: <Crown className="w-3 h-3" /> },
};

function PlanBadge({ plan }: { plan: PlanType }) {
  const config = PLAN_CONFIG[plan] ?? PLAN_CONFIG.none;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

type SortField = "name" | "plan" | "createdAt" | "planExpiresAt";
type SortDir = "asc" | "desc";

export default function AdminUsers() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editUser, setEditUser] = useState<any | null>(null);
  const [newPlan, setNewPlan] = useState<PlanType>("none");
  const [newBillingType, setNewBillingType] = useState<string>("lifetime");

  const { data, isLoading, refetch } = trpc.admin.getAllUsers.useQuery();
  const changePlanMutation = trpc.admin.changePlan.useMutation({
    onSuccess: () => {
      toast.success(`Plan für ${editUser?.name ?? "Nutzer"} geändert`);
      setEditUser(null);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Redirect wenn kein Admin
  if (!loading && user && user.role !== "admin") {
    navigate("/dashboard");
    return null;
  }

  if (!loading && !user) {
    navigate("/");
    return null;
  }

  const users = data?.users ?? [];

  // Filtern + Suchen
  const filtered = useMemo(() => {
    return users.filter((u: User) => {
      const matchSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.stripeCustomerId?.toLowerCase().includes(search.toLowerCase());
      const matchPlan = planFilter === "all" || u.plan === planFilter;
      return matchSearch && matchPlan;
    });
  }, [users, search, planFilter]);

  // Sortieren
  const sorted = useMemo(() => {
    return [...filtered].sort((a: User, b: User) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (valA instanceof Date || typeof valA === "string") {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }
      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-slate-300" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-slate-600" />
      : <ChevronDown className="w-3 h-3 text-slate-600" />;
  }

  // Statistiken
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u: User) => u.plan !== "none").length,
    investor: users.filter((u: User) => u.plan === "investor").length,
    pro: users.filter((u: User) => u.plan === "pro").length,
    basic: users.filter((u: User) => u.plan === "basic").length,
  }), [users]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-slate-500">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-700" />
              <h1 className="text-lg font-semibold text-slate-900">Nutzer-Verwaltung</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Aktualisieren
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Statistik-Karten */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Gesamt", value: stats.total, color: "text-slate-700", bg: "bg-white" },
            { label: "Aktive Pläne", value: stats.active, color: "text-green-700", bg: "bg-green-50" },
            { label: "Investor", value: stats.investor, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Pro", value: stats.pro, color: "text-violet-700", bg: "bg-violet-50" },
            { label: "Basic", value: stats.basic, color: "text-blue-700", bg: "bg-blue-50" },
          ].map((s) => (
            <Card key={s.label} className={`border-0 shadow-sm ${s.bg}`}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter-Leiste */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Name, E-Mail oder Stripe-ID suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200"
                />
              </div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-44 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Plan filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Pläne</SelectItem>
                  <SelectItem value="none">Kein Plan</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabelle */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-slate-100">
            <CardTitle className="text-sm font-medium text-slate-600">
              {sorted.length} von {users.length} Nutzern
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Name / E-Mail <SortIcon field="name" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("plan")}
                  >
                    <div className="flex items-center gap-1">
                      Plan <SortIcon field="plan" />
                    </div>
                  </TableHead>
                  <TableHead>Abrechnung</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("planExpiresAt")}
                  >
                    <div className="flex items-center gap-1">
                      Läuft ab <SortIcon field="planExpiresAt" />
                    </div>
                  </TableHead>
                  <TableHead>Stripe-Customer-ID</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Registriert <SortIcon field="createdAt" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Lade Nutzerdaten...
                    </TableCell>
                  </TableRow>
                ) : sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      Keine Nutzer gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((u) => {
                    const expired = isExpired(u.planExpiresAt) && u.plan !== "none";
                    return (
                      <TableRow key={u.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{u.name ?? "—"}</p>
                            <p className="text-xs text-slate-400">{u.email ?? "—"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <PlanBadge plan={u.plan as PlanType} />
                            {expired && (
                              <span title="Plan abgelaufen"><AlertCircle className="w-3.5 h-3.5 text-red-400" /></span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500 capitalize">
                            {u.billingType ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs ${expired ? "text-red-500 font-medium" : "text-slate-600"}`}>
                            {u.plan === "none" ? "—" : formatDate(u.planExpiresAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {u.stripeCustomerId ? (
                            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                              {u.stripeCustomerId}
                            </code>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">{formatDate(u.createdAt)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-slate-500 hover:text-slate-900"
                            onClick={() => {
                              setEditUser(u);
                              setNewPlan(u.plan as PlanType);
                              setNewBillingType(u.billingType ?? "lifetime");
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Plan-Änderungs-Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Plan ändern
            </DialogTitle>
          </DialogHeader>

          {editUser && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-900">{editUser.name}</p>
                <p className="text-xs text-slate-500">{editUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-400">Aktuell:</span>
                  <PlanBadge plan={editUser.plan as PlanType} />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Neuer Plan</label>
                  <Select value={newPlan} onValueChange={(v) => setNewPlan(v as PlanType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Kein Plan</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newPlan !== "none" && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Abrechnungstyp</label>
                    <Select value={newBillingType} onValueChange={setNewBillingType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                        <SelectItem value="yearly">Jährlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-700">
                  Diese Änderung wird sofort wirksam. Bei Lifetime-Plänen wird das Ablaufdatum auf +100 Jahre gesetzt.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                if (!editUser) return;
                changePlanMutation.mutate({
                  userId: editUser.id,
                  plan: newPlan,
                  billingType: newPlan === "none" ? undefined : newBillingType as any,
                });
              }}
              disabled={changePlanMutation.isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {changePlanMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Plan speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
