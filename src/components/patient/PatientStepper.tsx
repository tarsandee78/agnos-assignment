"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PatientFormStep } from "@/lib/schemas";
import { translations, type Language, type TranslationDictionary } from "@/lib/i18n/translations";

export interface StepItem {
  step: PatientFormStep;
  label: string;
}

export interface PatientStepperProps {
  /** The current active step in the wizard (1, 2, or 3) */
  currentStep: PatientFormStep;
  /** Optional callback triggered when a completed or accessible step is clicked */
  onStepClick?: (step: PatientFormStep) => void;
  /** Optional custom completion validator per step */
  isStepComplete?: (step: PatientFormStep) => boolean;
  /** Optional additional CSS classes for styling customization */
  className?: string;
  /** Active language */
  lang?: Language;
  /** Translation dictionary */
  t?: TranslationDictionary;
}

export function PatientStepper({
  currentStep,
  onStepClick,
  isStepComplete,
  className,
  t: propT,
}: PatientStepperProps) {
  const t = propT || translations.th;

  const steps: StepItem[] = React.useMemo(
    () => [
      {
        step: 1,
        label: t.steps.step1Title,
      },
      {
        step: 2,
        label: t.steps.step2Title,
      },
      {
        step: 3,
        label: t.steps.step3Title,
      },
    ],
    [t]
  );

  const currentStepItem =
    steps.find((s) => s.step === currentStep) ?? steps[0];

  const checkCompleted = (stepNum: PatientFormStep): boolean => {
    if (isStepComplete) {
      return isStepComplete(stepNum);
    }
    return currentStep > stepNum;
  };

  const completedStepsCount = steps.filter((s) =>
    checkCompleted(s.step)
  ).length;
  const progressPercent = Math.round(
    (completedStepsCount / steps.length) * 100
  );

  return (
    <header
      className={cn(
        "w-full bg-card/80 backdrop-blur-xs border-b border-border/70 py-3.5 px-3 sm:px-6 rounded-xl shadow-2xs",
        className
      )}
    >
      {/* Top Status & Progress Summary */}
      <div className="flex items-center justify-between text-xs mb-2.5 px-0.5 sm:px-1 gap-2">
        <span className="font-medium text-foreground truncate">
          {t.nav.stepOf(currentStep, steps.length)}:{" "}
          <span className="text-primary font-semibold">
            {currentStepItem.label}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {t.nav.completePercent(progressPercent)}
        </span>
      </div>

      {/* Semantic Stepper Navigation */}
      <nav aria-label="Progress" className="w-full">
        <ol className="grid grid-cols-3 w-full relative">
          {steps.map((item, index) => {
            const stepNum = item.step;
            const completed = checkCompleted(stepNum);
            const isActive = currentStep === stepNum;
            const isUpcoming = !isActive && !completed;
            const isClickable = Boolean(
              onStepClick && (completed || stepNum <= currentStep)
            );
            const isLast = index === steps.length - 1;

            return (
              <li
                key={stepNum}
                aria-current={isActive ? "step" : undefined}
                className="relative flex flex-col items-center group"
              >
                {/* Connecting horizontal line to next step */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="absolute top-[21px] left-1/2 w-full h-[2px] -z-0 pointer-events-none"
                  >
                    <div
                      className={cn(
                        "h-full w-full transition-colors duration-300",
                        completed ? "bg-primary" : "bg-border"
                      )}
                    />
                  </div>
                )}

                {/* Unified Interactive Step Element (Meets min 44x44px touch target) */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => onStepClick?.(stepNum)}
                  aria-label={`Step ${stepNum}: ${item.label}${
                    completed ? " (Completed)" : ""
                  }${isActive ? " (Current step)" : ""}`}
                  className={cn(
                    "w-full flex flex-col items-center text-center touch-target min-h-[44px] p-1 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 z-10",
                    isClickable
                      ? "cursor-pointer active:scale-[0.98] hover:opacity-90"
                      : "cursor-default"
                  )}
                >
                  {/* Step Indicator Circle */}
                  <span
                    className={cn(
                      "size-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs",
                      completed &&
                        !isActive &&
                        "bg-success text-success-foreground border border-success",
                      isActive &&
                        "bg-primary text-primary-foreground ring-2 ring-primary/25",
                      isUpcoming &&
                        "border border-border bg-card text-muted-foreground"
                    )}
                  >
                    {completed && !isActive ? (
                      <Check className="size-4 stroke-[3]" aria-hidden="true" />
                    ) : (
                      stepNum
                    )}
                  </span>

                  {/* Step Labels */}
                  <span className="mt-1.5 flex flex-col items-center text-center max-w-full px-1">
                    <span
                      className={cn(
                        "text-xs transition-colors truncate max-w-full",
                        isActive && "text-primary font-semibold",
                        completed && "text-foreground font-medium",
                        isUpcoming && "text-muted-foreground font-normal"
                      )}
                    >
                      <span>{item.label}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
