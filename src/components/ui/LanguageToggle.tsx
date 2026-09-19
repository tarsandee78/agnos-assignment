'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { type Language } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

export interface LanguageToggleProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
  size?: 'sm' | 'default';
}

export function LanguageToggle({
  currentLang,
  onLanguageChange,
  className,
  size = 'default',
}: LanguageToggleProps) {
  return (
    <div
      role="group"
      aria-label="Select Language"
      className={cn(
        'inline-flex items-center rounded-lg bg-muted/80 p-0.5 border border-border/60 shadow-2xs select-none',
        className
      )}
    >
      <div className="flex items-center pl-2 pr-1 text-muted-foreground" aria-hidden="true">
        <Globe className="size-3.5" />
      </div>

      <button
        type="button"
        onClick={() => onLanguageChange('th')}
        aria-pressed={currentLang === 'th'}
        className={cn(
          'rounded-md font-medium transition-all min-h-[32px] px-2.5 text-xs',
          currentLang === 'th'
            ? 'bg-background text-foreground shadow-2xs font-bold'
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
          'rounded-md font-medium transition-all min-h-[32px] px-2.5 text-xs',
          currentLang === 'en'
            ? 'bg-background text-foreground shadow-2xs font-bold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
    </div>
  );
}
