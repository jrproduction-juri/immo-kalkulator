/**
 * InfoButton – Wrapper um InfoTooltip für Rückwärtskompatibilität.
 * Nutzt die neue InfoTooltip-Komponente mit Hover+Tap-Support.
 */
import { InfoTooltip } from '@/components/InfoTooltip';

interface InfoButtonProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoButton({ text, side = 'top' }: InfoButtonProps) {
  return <InfoTooltip text={text} preferSide={side} />;
}
