"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface ProgressProps
  extends Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> {
  value?: number | null
  indicatorClassName?: string
}

function Progress({
  className,
  value = 0,
  max = 100,
  min = 0,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value ?? 0}
      max={max}
      min={min}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Track className="h-full w-full">
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            "h-full w-full flex-1 bg-primary transition-all duration-500 ease-out",
            indicatorClassName
          )}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export interface StepperProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
  totalSteps?: number
  stepLabels?: string[]
  isCompleted?: boolean
}

const DEFAULT_STEPPER_LABELS = [
  "Personal Details",
  "Contact Info",
  "Emergency Contact",
]

function StepperProgress({
  currentStep,
  totalSteps = 3,
  stepLabels = DEFAULT_STEPPER_LABELS,
  isCompleted = false,
  className,
  ...props
}: StepperProgressProps) {
  const allCompleted = isCompleted || currentStep > totalSteps
  const clampedStep = Math.min(Math.max(currentStep, 1), totalSteps)
  const progressPercent = allCompleted
    ? 100
    : Math.round((clampedStep / totalSteps) * 100)

  return (
    <div
      data-slot="stepper-progress"
      className={cn("w-full space-y-3", className)}
      {...props}
    >
      {/* Visual step indicators with labels */}
      <nav aria-label="Form Progress" className="w-full">
        <ol className="flex items-center justify-between gap-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1
            const stepDone = allCompleted || stepNumber < currentStep
            const isCurrent = !allCompleted && stepNumber === clampedStep
            const label = stepLabels[index] ?? `Step ${stepNumber}`

            return (
              <li
                key={stepNumber}
                aria-current={isCurrent ? "step" : undefined}
                className="flex flex-1 flex-col items-center text-center group"
              >
                <div className="flex items-center justify-center">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                      stepDone && "bg-primary text-primary-foreground",
                      isCurrent &&
                        "border-2 border-primary bg-background text-primary ring-4 ring-primary/15 font-bold scale-105",
                      !stepDone &&
                        !isCurrent &&
                        "border border-border bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {stepDone ? (
                      <Check className="size-4 stroke-[2.5]" aria-hidden="true" />
                    ) : (
                      stepNumber
                    )}
                  </span>
                </div>
                <span
                  className={cn(
                    "mt-1.5 hidden text-xs font-medium sm:inline-block transition-colors",
                    isCurrent && "text-primary font-semibold",
                    stepDone && "text-foreground",
                    !stepDone && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Accessible progress bar */}
      <Progress
        value={progressPercent}
        aria-label={`Step ${clampedStep} of ${totalSteps}: ${
          stepLabels[clampedStep - 1] ?? ""
        }`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
        className="h-2"
      />
    </div>
  )
}

export { Progress, StepperProgress, ProgressPrimitive }
