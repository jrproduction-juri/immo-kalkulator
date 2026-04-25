import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import {
  Building2, BarChart3, TrendingUp, Shield, Zap, CheckCircle2,
  ArrowRight, Calculator, Lock, Star, ChevronDown, FileText,
  Brain, AlertTriangle, Download, Layers
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0F1A' }}>
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          backgroundColor: 'rgba(10, 15, 26, 0.92)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(255,255,255,0.06)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
              ImmoRenditeTool
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/pricing"
              className="text-sm font-medium transition-colors hidden sm:block"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >
              Preise
            </a>
            <button
              onClick={handleLogin}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
              style={{
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.color = 'white';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              Anmelden
            </button>
            <button
              onClick={handleLogin}
              className="text-sm font-bold px-5 py-2 rounded-lg transition-all text-white"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              Kostenlos starten
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative pt-16 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0A0F1A 0%, #0D1B2A 100%)',
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px),
            linear-gradient(180deg, #0A0F1A 0%, #0D1B2A 100%)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%'
        }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59, 130, 246, 0.10) 0%, transparent 70%)'
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: '10%', right: '10%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)'
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-36">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: '#60A5FA'
              }}
            >
              <Star className="w-3.5 h-3.5 fill-current" style={{ color: '#F59E0B' }} />
              <span>Professionelle Investment-Analyse für Deutschland</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1
              className="font-bold leading-tight mb-6"
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                color: 'white',
                letterSpacing: '-0.02em'
              }}
            >
              Immobilien-Investments{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                in Sekunden
              </span>{' '}
              analysieren
            </h1>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Cashflow, Mietrendite &amp; Risikobewertung auf einen Blick — mit AfA-Berechnung,
              Steueroptimierung und 10-Jahres-Projektion.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
            >
              <Calculator className="w-5 h-5" />
              Kostenlose Analyse starten
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/pricing"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-all"
              style={{
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.04)'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLElement).style.color = 'white';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              Preise ansehen
            </a>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: BarChart3, text: 'Rendite-Analyse' },
              { icon: Calculator, text: 'Cashflow-Berechnung' },
              { icon: TrendingUp, text: '10-Jahres-Projektion' },
              { icon: Shield, text: 'Steueroptimierung' },
              { icon: Brain, text: 'KI-Bewertung' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)'
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: '#60A5FA' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Results Preview ── */}
      <section
        className="py-24"
        style={{
          background: 'linear-gradient(180deg, #0D1B2A 0%, #0A0F1A 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#F59E0B'
              }}
            >
              <Zap className="w-3 h-3" />
              BEISPIEL-ANALYSE
            </div>
            <h2
              className="font-bold text-3xl md:text-4xl text-white mb-4"
              style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
            >
              So sehen deine Ergebnisse aus
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-lg max-w-xl mx-auto">
              Verstehe den Wert des Tools, bevor du startest.
            </p>
          </div>

          {/* Example Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Cashflow */}
            <div
              className="rounded-2xl p-6 transition-all"
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Netto-Cashflow
                </p>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                >
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                </div>
              </div>
              <p
                className="font-bold text-3xl mb-1"
                style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#10B981' }}
              >
                +320 €
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>pro Monat</p>
              <div className="mt-4">
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: '72%', background: 'linear-gradient(90deg, #059669, #10B981)' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>72% positiver Cashflow</p>
              </div>
            </div>

            {/* Mietrendite */}
            <div
              className="rounded-2xl p-6 transition-all"
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Bruttomietrendite
                </p>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(59, 130, 246, 0.15)' }}
                >
                  <BarChart3 className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
                </div>
              </div>
              <p
                className="font-bold text-3xl mb-1"
                style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#60A5FA' }}
              >
                5,8 %
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>p.a. — sehr gut</p>
              <div className="mt-4">
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: '80%', background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Über Marktdurchschnitt</p>
              </div>
            </div>

            {/* EK-Rendite */}
            <div
              className="rounded-2xl p-6 transition-all"
              style={{
                background: '#111827',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  EK-Rendite
                </p>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(245, 158, 11, 0.15)' }}
                >
                  <Star className="w-3.5 h-3.5 fill-current" style={{ color: '#F59E0B' }} />
                </div>
              </div>
              <p
                className="font-bold text-3xl mb-1"
                style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#F59E0B' }}
              >
                8,0 %
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>p.a. — sehr gut</p>
              <div className="mt-4">
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: '88%', background: 'linear-gradient(90deg, #d97706, #f59e0b)' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Hebeleffekt aktiv</p>
              </div>
            </div>

            {/* Risikobewertung */}
            <div
              className="rounded-2xl p-6 transition-all"
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Risikobewertung
                </p>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(16, 185, 129, 0.15)' }}
                >
                  <Shield className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
                />
                <p
                  className="font-bold text-2xl"
                  style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#10B981' }}
                >
                  Niedrig
                </p>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Score: 82 / 100</p>
              <div className="mt-4">
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: '82%', background: 'linear-gradient(90deg, #059669, #10B981)' }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Empfehlung: Kaufen</p>
              </div>
            </div>
          </div>

          {/* AI Summary Preview */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(245,158,11,0.05))',
              border: '1px solid rgba(59, 130, 246, 0.15)'
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
              >
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-bold text-white text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                    KI-Investmentanalyse
                  </p>
                  <span className="badge-pro">Pro</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Starkes Investment.</span> Die Immobilie zeigt eine
                  überdurchschnittliche Bruttomietrendite von 5,8 % bei positivem Cashflow von +320 €/Monat.
                  Der Hebeleffekt durch Finanzierung steigert die EK-Rendite auf 8,0 % p.a. — deutlich über
                  alternativen Anlageformen. Risikofaktoren: moderate Leerstandsgefahr, Instandhaltungsrücklage
                  ausreichend. <span style={{ color: '#F59E0B', fontWeight: 600 }}>Kaufempfehlung bei aktuellem Preisniveau.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Free vs Pro Comparison ── */}
      <section className="py-24" style={{ backgroundColor: '#0A0F1A' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: '#60A5FA'
              }}
            >
              <Layers className="w-3 h-3" />
              PLÄNE VERGLEICHEN
            </div>
            <h2
              className="font-bold text-3xl md:text-4xl text-white mb-4"
              style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
            >
              Free vs. Pro — Was du bekommst
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-lg max-w-xl mx-auto">
              Starte kostenlos und upgrade, wenn du mehr brauchst.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Card */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div className="mb-6">
                <span className="badge-free">Free</span>
                <p className="font-bold text-2xl text-white mt-3 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Kostenlos
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)' }} className="text-sm">
                  Für erste Analysen und Einsteiger
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  { text: 'Bruttomietrendite', ok: true },
                  { text: 'Netto-Cashflow', ok: true },
                  { text: 'Basis-Empfehlung', ok: true },
                  { text: 'Cashflow-Chart', ok: true },
                  { text: 'Nettomietrendite', ok: false },
                  { text: 'Finanzierungsübersicht', ok: false },
                  { text: 'Szenarien & Projektion', ok: false },
                  { text: 'KI-Investmentanalyse', ok: false },
                  { text: 'PDF-Report', ok: false },
                  { text: 'Risiko-Scoring', ok: false },
                ].map(({ text, ok }) => (
                  <li key={text} className="flex items-center gap-3">
                    {ok ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#10B981' }} />
                    ) : (
                      <Lock className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    )}
                    <span
                      className="text-sm"
                      style={{ color: ok ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }}
                    >
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleLogin}
                className="w-full mt-8 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
              >
                Kostenlos starten
              </button>
            </div>

            {/* Pro Card */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0f1f3d 0%, #1a2f5a 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.12)'
              }}
            >
              {/* Popular badge */}
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#0A0F1A' }}
              >
                BELIEBTESTE WAHL
              </div>

              <div className="mb-6">
                <span className="badge-pro">Pro</span>
                <p className="font-bold text-2xl text-white mt-3 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                  ab 19 €<span className="text-base font-normal" style={{ color: 'rgba(255,255,255,0.5)' }}>/Monat</span>
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)' }} className="text-sm">
                  Für aktive Investoren mit mehreren Objekten
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  'Alle Free-Features',
                  'Nettomietrendite & Finanzierung',
                  'Szenarien & 10-Jahres-Projektion',
                  'KI-Investmentanalyse',
                  'Detailliertes Risiko-Scoring',
                  'PDF Investment-Report',
                  'Exposé-Generator',
                  'Email-Generator',
                  'Steueroptimierung & AfA',
                  '14 Tage kostenlos testen',
                ].map((text) => (
                  <li key={text} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#3B82F6' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{text}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleLogin}
                className="w-full mt-8 py-3 rounded-xl font-bold text-sm transition-all text-white"
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                Pro 14 Tage kostenlos testen
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
              <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Keine Kreditkarte erforderlich
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="/pricing"
              className="text-sm font-medium inline-flex items-center gap-1 transition-colors"
              style={{ color: '#60A5FA' }}
            >
              Alle Pläne vergleichen (Basic, Pro, Investor)
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Pro Features Highlight ── */}
      <section
        className="py-24"
        style={{
          background: 'linear-gradient(180deg, #0A0F1A 0%, #0D1525 100%)',
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(180deg, #0A0F1A 0%, #0D1525 100%)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#F59E0B'
              }}
            >
              <Star className="w-3 h-3 fill-current" />
              PRO FEATURES
            </div>
            <h2
              className="font-bold text-3xl md:text-4xl text-white mb-4"
              style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
            >
              Alles was professionelle Investoren brauchen
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-lg max-w-xl mx-auto">
              Von der ersten Kalkulation bis zum professionellen Investment-Report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                title: 'KI-Investmentanalyse',
                desc: 'GPT-gestützte Bewertung deiner Immobilie mit Stärken, Risiken und konkreter Handlungsempfehlung.',
                color: '#3B82F6',
                bg: 'rgba(59, 130, 246, 0.1)',
                pro: true,
              },
              {
                icon: Shield,
                title: 'Detailliertes Risiko-Scoring',
                desc: 'Ampel-System mit Score 0–100, Leerstandsrisiko, Finanzierungsrisiko und Marktrisiko-Analyse.',
                color: '#10B981',
                bg: 'rgba(16, 185, 129, 0.1)',
                pro: true,
              },
              {
                icon: FileText,
                title: 'PDF Investment-Report',
                desc: 'Professioneller Report mit allen Kennzahlen, Grafiken und Szenarien — bereit für Banken und Berater.',
                color: '#F59E0B',
                bg: 'rgba(245, 158, 11, 0.1)',
                pro: true,
              },
              {
                icon: TrendingUp,
                title: '10-Jahres-Projektion',
                desc: 'Cashflow-Entwicklung, Wertsteigerung und Eigenkapitalaufbau über 10 Jahre visualisiert.',
                color: '#8B5CF6',
                bg: 'rgba(139, 92, 246, 0.1)',
                pro: true,
              },
              {
                icon: Download,
                title: 'Exposé & Email-Generator',
                desc: 'Professionelle Makler-Emails und Exposés direkt aus deinen Berechnungen generieren.',
                color: '#EC4899',
                bg: 'rgba(236, 72, 153, 0.1)',
                pro: true,
              },
              {
                icon: Calculator,
                title: 'Erweiterte Finanzrechnung',
                desc: 'AfA-Berechnung, Spekulationssteuer, Grenzsteuersatz und vollständige Steueroptimierung.',
                color: '#06B6D4',
                bg: 'rgba(6, 182, 212, 0.1)',
                pro: false,
              },
            ].map(({ icon: Icon, title, desc, color, bg, pro }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all group"
                style={{
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  {pro && <span className="badge-pro">Pro</span>}
                </div>
                <h3
                  className="font-bold text-white mb-2"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-24" style={{ backgroundColor: '#0A0F1A' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10B981'
              }}
            >
              <CheckCircle2 className="w-3 h-3" />
              WARUM IMMORENDITETOOL
            </div>
            <h2
              className="font-bold text-3xl md:text-4xl text-white mb-4"
              style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
            >
              Transparente Berechnungen, denen du vertrauen kannst
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Calculator,
                title: 'Wie die Berechnungen funktionieren',
                desc: 'Alle Formeln basieren auf deutschen Immobilien-Standards: DIN-konforme AfA-Berechnung, aktuelles Steuerrecht (§ 21 EStG), marktübliche Hausgeld-Schätzungen und Finanzierungsrechner nach Annuitätenmethode.',
                color: '#3B82F6',
                bg: 'rgba(59, 130, 246, 0.1)',
              },
              {
                icon: TrendingUp,
                title: 'Warum die Analyse hilft',
                desc: 'Schlechte Immobilien-Investments entstehen durch fehlende Zahlen. Mit ImmoRenditeTool siehst du sofort, ob eine Immobilie positiven Cashflow bringt, welche Rendite realistisch ist und wo Risiken lauern — bevor du kaufst.',
                color: '#10B981',
                bg: 'rgba(16, 185, 129, 0.1)',
              },
              {
                icon: Shield,
                title: 'Sicherheit & Datenschutz',
                desc: 'Deine Daten werden verschlüsselt gespeichert und niemals an Dritte weitergegeben. Alle Berechnungen laufen direkt in deinem Browser. DSGVO-konform, Server in Deutschland.',
                color: '#F59E0B',
                bg: 'rgba(245, 158, 11, 0.1)',
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-2xl p-6"
                style={{
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3
                  className="font-bold text-white mb-3"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        className="py-24"
        style={{
          background: 'linear-gradient(180deg, #0A0F1A 0%, #0D1B2A 100%)'
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                color: '#A78BFA'
              }}
            >
              FAQ
            </div>
            <h2
              className="font-bold text-3xl md:text-4xl text-white mb-4"
              style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
            >
              Häufige Fragen
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-lg">
              Alles Wichtige rund um Rendite, Cashflow und Steueroptimierung.
            </p>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'Wie berechne ich die Bruttomietrendite einer Immobilie?',
                a: 'Die Bruttomietrendite berechnet sich als: (Jahreskaltmiete ÷ Kaufpreis) × 100. Beispiel: Bei 1.000 €/Monat Kaltmiete und 300.000 € Kaufpreis ergibt sich eine Bruttomietrendite von 4 %. Als Faustregel gilt: ab 4 % brutto ist eine Immobilie für Buy-and-Hold interessant.',
              },
              {
                q: 'Was ist ein guter Netto-Cashflow bei einer Immobilie?',
                a: 'Ein positiver Netto-Cashflow bedeutet, dass die Mieteinnahmen alle Kosten (Kreditrate, Hausgeld, Verwaltung, Rücklagen) übersteigen. Für Investoren gilt ein monatlicher Überschuss von 100–300 € als solide Basis. Negativer Cashflow ist nur dann tragbar, wenn die Steuerersparnis und Wertsteigerung dies ausgleichen.',
              },
              {
                q: 'Was bedeutet AfA bei Immobilien und wie hoch ist sie?',
                a: 'AfA steht für Absetzung für Abnutzung. Bei vermieteten Immobilien können Gebäudekosten steuerlich abgeschrieben werden: 2 % p.a. bei Baujahr nach 1924, 2,5 % bei älteren Gebäuden, 3 % bei Neubauten ab 2023. Das Grundstück ist nicht abschreibungsfähig.',
              },
              {
                q: 'Wie hoch sollte die Eigenkapitalrendite bei einer Immobilie sein?',
                a: 'Eine Eigenkapitalrendite von 5–10 % gilt als attraktiv für Immobilien-Investments in Deutschland. Sie berechnet sich aus dem jährlichen Cashflow nach Steuern geteilt durch das eingesetzte Eigenkapital. Mit Hebeleffekt (Finanzierung) kann sie deutlich über der Bruttomietrendite liegen.',
              },
              {
                q: 'Kann ich Immobilien nach 24 Monaten steuerfrei verkaufen?',
                a: 'Ja, bei selbstgenutzten Eigentumswohnungen entfällt die Spekulationssteuer nach 24 Monaten Eigennutzung. Das ImmoRenditeTool berechnet dieses Szenario automatisch und zeigt den steuerfreien Verkaufsgewinn.',
              },
              {
                q: 'Ist das ImmoRenditeTool kostenlos nutzbar?',
                a: 'Ja, die Grundfunktionen sind kostenlos: Bruttomietrendite, Cashflow und Basisanalyse. Premium-Funktionen wie erweiterte Szenarien, PDF Investment-Report, Portfolio-Verwaltung und Excel-Export sind ab 9 €/Monat verfügbar.',
              },
              {
                q: 'Welche Immobilienarten unterstützt das ImmoRenditeTool?',
                a: 'Das ImmoRenditeTool unterstützt Eigentumswohnungen (ETW), Einfamilienhäuser (EFH), Mehrfamilienhäuser (MFH), Neubauten und Gewerbeimmobilien — jeweils mit spezifischen Berechnungsfeldern und Kennzahlen.',
              },
            ].map(({ q, a }, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  background: '#111827',
                  border: `1px solid ${openFaq === i ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.06)'}`
                }}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span
                    className="font-semibold text-sm pr-4"
                    style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.8)', fontFamily: 'Sora, sans-serif' }}
                  >
                    {q}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 shrink-0 transition-transform"
                    style={{
                      color: 'rgba(255,255,255,0.4)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>
                {openFaq === i && (
                  <p
                    className="px-5 pb-5 text-sm leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f1f3d 0%, #1a2f5a 100%)',
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.06) 1px, transparent 1px),
            linear-gradient(135deg, #0f1f3d 0%, #1a2f5a 100%)
          `,
          backgroundSize: '40px 40px, 40px 40px, 100% 100%'
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59, 130, 246, 0.12) 0%, transparent 70%)'
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2
            className="font-bold text-3xl md:text-4xl text-white mb-4"
            style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
          >
            Starte jetzt deine erste Analyse
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Kostenlos anmelden, Daten eingeben, sofort Ergebnisse sehen.
          </p>
          <button
            onClick={handleLogin}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.35)'
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
          >
            Kostenlos starten
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Keine Kreditkarte · Keine Verpflichtung · Sofort loslegen
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-10"
        style={{
          backgroundColor: '#080D16',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-bold text-white"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              ImmoRenditeTool
            </span>
          </div>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Alle Berechnungen ohne Gewähr · Keine Anlageberatung · © {new Date().getFullYear()} ImmoRenditeTool
          </p>
          <div className="flex flex-wrap gap-5 justify-center">
            {[
              { href: '/pricing', label: 'Preise' },
              { href: '/impressum', label: 'Impressum' },
              { href: '/datenschutz', label: 'Datenschutz' },
              { href: '/agb', label: 'AGB' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
