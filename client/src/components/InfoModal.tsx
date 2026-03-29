/**
 * InfoModal – ersetzt InfoTooltip vollständig.
 * Klick/Tap auf das (i)-Icon öffnet ein zentriertes Mini-Modal.
 * Schließt sich bei: OK-Button, Außerhalb-Klick, erneutem i-Klick.
 * Funktioniert auf Desktop (Maus) und Mobile (Touch) gleich gut.
 */
import * as React from 'react';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface InfoModalProps {
  /** Kurzer Titel (optional) */
  title?: string;
  /** Erklärungstext */
  text: string;
  /** Zusätzliche CSS-Klassen für den Trigger-Button */
  className?: string;
}

/**
 * InfoModal – Klick auf (i) öffnet ein zentriertes Modal mit Erklärungstext und OK-Button.
 */
export function InfoModal({ title, text, className }: InfoModalProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Schließe Modal bei Klick außerhalb
  React.useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        modalRef.current &&
        !modalRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    // Kleines Timeout damit der initiale Klick nicht sofort schließt
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('touchstart', handleOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  // ESC-Taste schließt Modal
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Body-Scroll sperren wenn Modal offen
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleTriggerClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(prev => !prev);
  };

  const modal = open ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'info-modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Modal-Fenster */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 bg-white rounded-2xl shadow-2xl',
          'w-full max-w-sm mx-auto',        // Desktop: max 384px
          'sm:max-w-[380px]',
          'p-5',
          'animate-in fade-in-0 zoom-in-95 duration-150',
        )}
        style={{ maxWidth: 'min(380px, 90vw)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            {title && (
              <h3
                id="info-modal-title"
                className="text-sm font-semibold text-gray-900 leading-tight"
              >
                {title}
              </h3>
            )}
          </div>
          <button
            type="button"
            aria-label="Schließen"
            onClick={() => setOpen(false)}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text */}
        <p className="text-sm text-gray-700 leading-relaxed break-words">
          {text}
        </p>

        {/* OK-Button */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium',
              'bg-blue-600 text-white',
              'hover:bg-blue-700 active:bg-blue-800',
              'transition-colors',
              'min-w-[80px]',       // gut mit Daumen bedienbar
              'min-h-[40px]',
            )}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Info anzeigen"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-full',
          'text-muted-foreground hover:text-blue-600 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
          open && 'text-blue-600',
          className,
        )}
        onClick={handleTriggerClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTriggerClick(e);
        }}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Modal via Portal rendern – kein Abschneiden durch overflow:hidden */}
      {typeof document !== 'undefined' && createPortal(modal, document.body)}
    </>
  );
}

/**
 * KennzahlInfoModal – InfoModal für Kennzahlen mit strukturiertem Inhalt.
 * Zeigt Name, Formel, Erklärung, Beispiel und Bewertung übersichtlich an.
 */
interface KennzahlInfoModalProps {
  name: string;
  formel?: string;
  erklaerung: string;
  beispiel?: string;
  bewertung?: string;
  className?: string;
}

export function KennzahlInfoModal({
  name,
  formel,
  erklaerung,
  beispiel,
  bewertung,
  className,
}: KennzahlInfoModalProps) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        modalRef.current &&
        !modalRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('touchstart', handleOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleTriggerClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(prev => !prev);
  };

  const modal = open ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      <div
        ref={modalRef}
        className="relative z-10 bg-white rounded-2xl shadow-2xl p-5 animate-in fade-in-0 zoom-in-95 duration-150"
        style={{ maxWidth: 'min(400px, 90vw)', width: '100%' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
          </div>
          <button
            type="button"
            aria-label="Schließen"
            onClick={() => setOpen(false)}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Formel */}
        {formel && (
          <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">Formel</p>
            <p className="text-xs font-mono text-gray-700 break-words">{formel}</p>
          </div>
        )}

        {/* Erklärung */}
        <p className="text-sm text-gray-700 leading-relaxed break-words mb-3">{erklaerung}</p>

        {/* Beispiel */}
        {beispiel && (
          <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg">
            <p className="text-[11px] text-blue-600 font-medium uppercase tracking-wide mb-0.5">Beispiel</p>
            <p className="text-xs text-blue-800 italic break-words">{beispiel}</p>
          </div>
        )}

        {/* Bewertung */}
        {bewertung && (
          <div className="mb-3 px-3 py-2 bg-green-50 rounded-lg">
            <p className="text-[11px] text-green-600 font-medium uppercase tracking-wide mb-0.5">Bewertung</p>
            <p className="text-xs text-green-800 break-words">{bewertung}</p>
          </div>
        )}

        {/* OK-Button */}
        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors min-w-[80px] min-h-[40px]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Info anzeigen"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-full',
          'text-muted-foreground hover:text-blue-600 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
          open && 'text-blue-600',
          className,
        )}
        onClick={handleTriggerClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTriggerClick(e);
        }}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {typeof document !== 'undefined' && createPortal(modal, document.body)}
    </>
  );
}
