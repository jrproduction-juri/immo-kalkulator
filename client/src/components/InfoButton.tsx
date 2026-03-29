/**
 * InfoButton – Wrapper um InfoModal für Rückwärtskompatibilität.
 * Nutzt die neue InfoModal-Komponente (Klick/Tap öffnet Mini-Modal).
 */
import { InfoModal } from '@/components/InfoModal';

interface InfoButtonProps {
  text: string;
  title?: string;
  /** side-Parameter wird nicht mehr benötigt, aber für Kompatibilität beibehalten */
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoButton({ text, title, side: _side }: InfoButtonProps) {
  return <InfoModal text={text} title={title} />;
}
