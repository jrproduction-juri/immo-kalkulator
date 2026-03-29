import * as React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  text: string;
  className?: string;
  /** Bevorzugte Seite – wird automatisch angepasst wenn kein Platz vorhanden */
  preferSide?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * InfoTooltip – funktioniert auf Desktop (Hover) und Mobile (Tap).
 * Schließt sich bei Klick außerhalb. Positioniert sich automatisch.
 */
export function InfoTooltip({ text, className, preferSide = 'right' }: InfoTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [side, setSide] = React.useState<'top' | 'bottom' | 'left' | 'right'>(preferSide);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  // Schließe Tooltip bei Klick außerhalb
  React.useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [open]);

  // Berechne optimale Positionierung wenn Tooltip geöffnet wird
  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 280;
    const tooltipHeight = 100; // Schätzung

    // Prüfe verfügbaren Platz in jede Richtung
    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;

    if (spaceRight >= tooltipWidth) {
      setSide('right');
    } else if (spaceLeft >= tooltipWidth) {
      setSide('left');
    } else if (spaceTop >= tooltipHeight) {
      setSide('top');
    } else {
      setSide('bottom');
    }
  }, []);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!open) calculatePosition();
    setOpen(prev => !prev);
  };

  // Tooltip-Positions-Klassen
  const positionClasses: Record<string, string> = {
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  };

  // Pfeil-Klassen
  const arrowClasses: Record<string, string> = {
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
  };

  const arrowBorderClasses: Record<string, string> = {
    right: 'border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
    left: 'border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    top: 'border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
  };

  return (
    <span className={cn('relative inline-flex items-center', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Info anzeigen"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-full',
          'text-muted-foreground hover:text-foreground transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          open && 'text-foreground'
        )}
        onClick={handleClick}
        onMouseEnter={() => { calculatePosition(); setOpen(true); }}
        onMouseLeave={() => setOpen(false)}
        onTouchEnd={(e) => { e.preventDefault(); handleClick(e); }}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-[9999] w-[280px] max-w-[calc(100vw-2rem)]',
            'bg-gray-900 text-white text-xs rounded-lg shadow-xl',
            'px-3 py-2 leading-relaxed',
            'pointer-events-auto',
            positionClasses[side]
          )}
          style={{ wordBreak: 'break-word' }}
        >
          {/* Pfeil */}
          <span
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowBorderClasses[side],
              arrowClasses[side]
            )}
          />
          {text}
        </div>
      )}
    </span>
  );
}
