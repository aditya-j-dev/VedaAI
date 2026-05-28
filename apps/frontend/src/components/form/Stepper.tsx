'use client';

import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  id?: string;
}

export default function Stepper({ value, onChange, min = 1, max = 50, id }: StepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex items-center gap-2 h-10 px-3 bg-bg-input rounded-pill select-none w-[110px] justify-between flex-shrink-0">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-6 h-6 flex items-center justify-center text-muted hover:text-primary
          disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        id={id ? `${id}-dec` : undefined}
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>

      <span className="font-bold text-[15px] text-primary w-6 text-center tabular-nums">
        {value}
      </span>

      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="w-6 h-6 flex items-center justify-center text-muted hover:text-primary
          disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        id={id ? `${id}-inc` : undefined}
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
