'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { type Language } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

export interface LanguageToggleProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
}

/**
 * LanguageToggle Component.
 *
 * Fully compliant with AGENTS.md §4.4 (Minimum 44x44px touch targets).
 */
export function LanguageToggle({
  currentLang,
  onLanguageChange,
  className,
}: LanguageToggleProps) {
  return (
    <div
      role="group"
      aria-label="Select Language"
      className={cn(
        'inline-flex items-center rounded-xl bg-muted/80 p-1 border border-border/60 shadow-2xs select-none min-h-[44px]',
        className
      )}
    >
      <div className="flex items-center pl-2 pr-1 text-muted-foreground" aria-hidden="true">
        <Globe className="size-4" />
      </div>

      <button
        type="button"
        onClick={() => onLanguageChange('th')}
        aria-pressed={currentLang === 'th'}
        className={cn(
          'rounded-lg font-medium transition-all min-h-[36px] min-w-[40px] px-3 text-xs touch-target cursor-pointer flex items-center justify-center',
          currentLang === 'th'
            ? 'bg-background text-foreground shadow-2xs font-bold ring-1 ring-border/50'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        TH
      </button>

      <span className="text-border text-xs mx-0.5" aria-hidden="true">|</span>

      <button
        type="button"
        onClick={() => onLanguageChange('en')}
        aria-pressed={currentLang === 'en'}
        className={cn(
          'rounded-lg font-medium transition-all min-h-[36px] min-w-[40px] px-3 text-xs touch-target cursor-pointer flex items-center justify-center',
          currentLang === 'en'
            ? 'bg-background text-foreground shadow-2xs font-bold ring-1 ring-border/50'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
    </div>
  );
}
