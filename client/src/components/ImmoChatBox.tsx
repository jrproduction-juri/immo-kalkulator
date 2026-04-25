/**
 * ImmoChatBox – KI-Berater für Immobilienanalysen
 * Schwebende Chat-UI, die Deal-Daten an den Server übergibt.
 * Plan-Lock: nur Pro/Investor. Basic/Free sehen Upgrade-Hinweis.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Streamdown } from 'streamdown';
import {
  MessageCircle, X, Send, Loader2, Sparkles,
  Lock, RotateCcw, ChevronDown,
} from 'lucide-react';

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface DealData {
  kaufpreis?: number;
  kaltmiete?: number;
  wohnflaeche?: number;
  eigenkapital?: number;
  kaufnebenkosten?: number;
  kreditrate?: number;
  zinssatz?: number;
  tilgung?: number;
  hausgeld?: number;
  ruecklagen?: number;
  steuersatz?: number;
  baujahr?: number;
  standort?: string;
  bruttomietrendite?: number;
  nettomietrendite?: number;
  cashflowMonatlich?: number;
  cashflowJaehrlich?: number;
  eigenkapitalrendite?: number | null;
  gesamtinvestition?: number;
  risikoScore?: number;
  risikoLabel?: string;
  investmentScore?: number;
  investmentLabel?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ImmoChatBoxProps {
  dealData?: DealData;
  className?: string;
}

// ─── Vorschläge ───────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  'Warum ist meine Eigenkapitalrendite niedrig?',
  'Wie kann ich meinen Cashflow verbessern?',
  'Was bedeutet Netto-Mietrendite?',
  'Wie hoch sollte mein Risiko-Score sein?',
  'Was ist AfA und wie wirkt sie sich aus?',
  'Ist dieser Deal rentabel?',
];

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export function ImmoChatBox({ dealData, className }: ImmoChatBoxProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const plan = user?.plan ?? 'none';
  const hasAccess = plan === 'pro' || plan === 'investor';

  const chatMutation = trpc.chat.ask.useMutation({
    onSuccess: ({ answer }) => {
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      setIsLoading(false);
    },
    onError: (err) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Fehler:** ${err.message}`,
      }]);
      setIsLoading(false);
    },
  });

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && hasAccess) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, hasAccess]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const newUserMsg: ChatMessage = { role: 'user', content: trimmed };
    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    chatMutation.mutate({
      message: trimmed,
      history: messages.slice(-18), // max 18 Nachrichten Verlauf
      dealData: dealData ?? undefined,
    });
  }, [messages, isLoading, dealData, chatMutation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
  };

  const hasDealData = dealData && Object.keys(dealData).length > 0;

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3', className)}>

      {/* ─── Chat-Fenster ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="
          w-[92vw] max-w-[400px] rounded-2xl shadow-2xl
          flex flex-col overflow-hidden
          animate-in slide-in-from-bottom-4 fade-in duration-200
        " style={{ height: 'min(560px, 80vh)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">KI-Berater</p>
                <p className="text-xs text-slate-400 leading-tight">
                  {hasDealData ? 'Kennt dein aktuelles Objekt' : 'Allgemeine Beratung'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={resetChat}
                  title="Chat zurücksetzen"
                  className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>

          {/* Plan-Lock für Free/Basic */}
          {!hasAccess ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center bg-slate-50">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <Lock className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-base">KI-Berater (Pro-Feature)</p>
                <p className="text-sm text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                  Stelle Fragen zu deinen Immobilienberechnungen und erhalte personalisierte Antworten
                  auf Basis deiner Deal-Daten. Verfügbar ab dem <strong>Pro-Plan</strong>.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => { navigate('/pricing'); setIsOpen(false); }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Jetzt upgraden
              </Button>
            </div>
          ) : (
            <>
              {/* Nachrichtenverlauf */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">

                {/* Leer-Zustand mit Vorschlägen */}
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-center pt-2">
                      <p className="text-sm font-medium text-slate-700">
                        Wie kann ich dir helfen?
                      </p>
                      {hasDealData && (
                        <p className="text-xs text-slate-500 mt-1">
                          Ich kenne dein aktuelles Objekt und kann konkrete Fragen beantworten.
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => sendMessage(prompt)}
                          className="
                            text-left text-xs px-3 py-2 rounded-lg border border-slate-200
                            hover:border-blue-500/30
                            text-slate-600 transition-colors leading-snug
                          "
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nachrichten */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-br-sm'
                        : 'rounded-bl-sm'
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-slate">
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Lade-Indikator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: "#1a2235", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Eingabefeld */}
              <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0f1929" }}>
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Frage stellen… (Enter zum Senden)"
                    rows={1}
                    disabled={isLoading}
                    className="
                      flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50
                      px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      disabled:opacity-50 max-h-32 leading-relaxed
                    "
                    style={{ minHeight: '38px' }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = Math.min(el.scrollHeight, 128) + 'px';
                    }}
                  />
                  <Button
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    onClick={() => sendMessage(input)}
                    className="h-9 w-9 rounded-xl bg-slate-900 hover:bg-slate-700 shrink-0"
                  >
                    {isLoading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 text-center">
                  Keine Anlageberatung · Shift+Enter für Zeilenumbruch
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Floating Button ──────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
          'hover:scale-105 active:scale-95',
          isOpen
            ? 'bg-slate-700 hover:bg-slate-600'
            : 'bg-slate-900 hover:bg-slate-800',
        )}
        title={isOpen ? 'Chat schließen' : 'KI-Berater öffnen'}
        aria-label={isOpen ? 'Chat schließen' : 'KI-Berater öffnen'}
      >
        {isOpen
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
        {/* Unread-Dot wenn neue KI-Antwort und Chat geschlossen */}
        {!isOpen && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  );
}
