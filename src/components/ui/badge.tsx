import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { PatientPresenceStatus } from "@/lib/realtime"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive shadow-xs hover:bg-destructive/20",
        outline:
          "border-border text-foreground hover:bg-muted/50",
        success:
          "border-success/30 bg-success/15 text-success hover:bg-success/25",
        typing:
          "border-success/30 bg-success/15 text-success font-medium",
        idle:
          "border-warning/30 bg-warning/15 text-warning-foreground dark:text-warning font-medium",
        submitted:
          "border-primary/30 bg-primary/10 text-primary font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showIndicator?: boolean
}

function Badge({
  className,
  variant = "default",
  showIndicator = true,
  children,
  ...props
}: BadgeProps) {
  const isTyping = variant === "typing"
  const isIdle = variant === "idle"
  const isSubmitted = variant === "submitted"
  const hasStatusDot = showIndicator && (isTyping || isIdle || isSubmitted)

  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {hasStatusDot && (
        <span className="relative flex size-2 shrink-0 items-center justify-center">
          {isTyping && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
          )}
          <span
            className={cn(
              "relative inline-flex size-2 rounded-full",
              isTyping && "bg-success",
              isIdle && "bg-warning",
              isSubmitted && "bg-primary"
            )}
          />
        </span>
      )}
      {children}
    </div>
  )
}

export type PatientStatus = Extract<PatientPresenceStatus, "typing" | "idle" | "submitted">

export interface PatientStatusBadgeProps
  extends Omit<BadgeProps, "variant"> {
  status: PatientStatus
  labels?: Partial<Record<PatientStatus, string>>
}

const DEFAULT_STATUS_LABELS: Record<PatientStatus, string> = {
  typing: "Actively filling",
  idle: "Inactive",
  submitted: "Submitted",
}

function PatientStatusBadge({
  status,
  labels,
  children,
  className,
  ...props
}: PatientStatusBadgeProps) {
  const label = children ?? labels?.[status] ?? DEFAULT_STATUS_LABELS[status]

  return (
    <Badge
      variant={status}
      className={cn("select-none font-medium", className)}
      {...props}
    >
      {label}
    </Badge>
  )
}

export { Badge, badgeVariants, PatientStatusBadge }
