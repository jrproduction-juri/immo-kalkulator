import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoButtonProps {
  text: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoButton({ text, side = 'top' }: InfoButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors ml-1 shrink-0"
          aria-label="Info"
        >
          <Info className="w-2.5 h-2.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-sm">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
