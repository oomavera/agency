"use client";

import { CONFIG } from "../../lib/config";

interface EstimateBarProps {
  subtotal: number;
  isValid: boolean;
  onBookNow: () => void;
  isSubmitting?: boolean;
  frequency?: string;
}

export default function EstimateBar({ 
  subtotal, 
  isValid, 
  onBookNow, 
  isSubmitting = false,
  frequency
}: EstimateBarProps) {
  const isRecurring = frequency === 'monthly' || frequency === 'weekly' || frequency === 'every2weeks';
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-slopes/30 bg-snow p-3 shadow-lg md:relative md:border-0 md:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-mountain font-light">{CONFIG.COPY.estLabel}</div>
          <div className="text-xl font-bold text-midnight relative">
            <span className="blur-md select-none">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          {isRecurring && (
            <div className="mt-1 text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 text-xs font-semibold inline-block">
              -$100! You are receiving $100 off your first recurring clean.
            </div>
          )}
        </div>
        
        <button
          onClick={onBookNow}
          disabled={!isValid || isSubmitting}
          className={`rounded-md px-4 py-2 text-sm font-medium text-snow transition-colors ${
            isValid && !isSubmitting
              ? 'bg-midnight hover:bg-mountain focus:outline-none focus:ring-2 focus:ring-mountain focus:ring-offset-2'
              : 'cursor-not-allowed bg-apres-ski/80'
          }`}
        >
          {isSubmitting ? 'Processing...' : CONFIG.COPY.bookLabel}
        </button>
      </div>
      
      {/* Live update announcement for accessibility */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-label={`Estimated total now $${subtotal.toFixed(2)}`}
      >
        Estimated total: ${subtotal.toFixed(2)}
      </div>
    </div>
  );
} 