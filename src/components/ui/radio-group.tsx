"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupIndicator({
  className,
  ...props
}: React.ComponentProps<typeof RadioPrimitive.Indicator>) {
  return (
    <RadioPrimitive.Indicator
      data-slot="radio-indicator"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <span className="size-2 rounded-full bg-primary-foreground" />
    </RadioPrimitive.Indicator>
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioPrimitive.Root>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group relative flex size-5 shrink-0 items-center justify-center rounded-full border border-input text-primary shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary",
        /* WCAG 2.5.5 / 2.5.8: Expand touch target to min 44x44px with transparent pseudo-element */
        "before:absolute before:-inset-3 before:content-['']",
        className
      )}
      {...props}
    >
      <RadioGroupIndicator />
    </RadioPrimitive.Root>
  )
}

export interface RadioCardProps
  extends Omit<React.ComponentProps<typeof RadioPrimitive.Root>, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
}

/**
 * RadioCard is a high-affordance, accessible card selector tailored for healthcare intake forms.
 * It provides a large touch target (min 52px height) and high visual contrast to minimize
 * cognitive load for elderly and mobile patients.
 */
function RadioCard({
  className,
  children,
  title,
  description,
  icon,
  badge,
  ...props
}: RadioCardProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-card"
      className={cn(
        "group relative flex min-h-[52px] w-full cursor-pointer select-none items-center justify-between gap-3.5 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-all hover:bg-muted/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary/5 data-[checked]:ring-2 data-[checked]:ring-primary/20",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-3.5 min-w-0">
        {icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-data-[checked]:bg-primary/10 group-data-[checked]:text-primary">
            {icon}
          </div>
        )}

        <div className="flex flex-1 flex-col text-left min-w-0">
          {title && (
            <span className="text-sm font-semibold tracking-tight transition-colors group-data-[checked]:text-primary">
              {title}
            </span>
          )}
          {description && (
            <span className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {description}
            </span>
          )}
          {children}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {badge}
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-input transition-colors group-data-[checked]:border-primary group-data-[checked]:bg-primary">
          <RadioGroupIndicator />
        </div>
      </div>
    </RadioPrimitive.Root>
  )
}

export {
  RadioGroup,
  RadioGroupItem,
  RadioCard,
  RadioGroupPrimitive,
  RadioPrimitive,
}
