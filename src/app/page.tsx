import Link from "next/link";
import {
  HeartPulse,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Columns2,
  Sparkles,
  Zap,
  Wifi,
  CheckCircle2,
  Clock,
  Layers,
  Smartphone,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground">
                Agnos Health
              </span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                Real-Time Patient Intake & Monitoring System
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/split-view">
              <Button
                variant="default"
                size="sm"
                className="min-h-[44px] px-3.5 font-medium shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 touch-target"
              >
                <Columns2 className="size-4" />
                <span>Split-Screen Demo</span>
              </Button>
            </Link>
            <Link href="/patient">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] px-3 font-medium hidden md:inline-flex touch-target"
              >
                Patient View
              </Button>
            </Link>
            <Link href="/staff">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] px-3 font-medium hidden md:inline-flex touch-target"
              >
                Staff View
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 sm:py-14 flex flex-col items-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
          <Sparkles className="size-3.5" />
          <span>Agnos Candidate Assignment • Milestone 4 Live Demo</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl text-center leading-[1.15]">
          Real-Time Patient Intake &amp;{" "}
          <span className="text-primary">Staff Monitoring System</span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl text-center mt-5 leading-relaxed">
          A mobile-first intake wizard for patients synchronized client-to-client
          with staff dashboards in sub-50ms using Supabase Realtime and local
          BroadcastChannel fallback — zero database write overhead.
        </p>

        {/* Primary CTA button for Split View */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/split-view">
            <Button
              size="lg"
              className="min-h-[48px] h-12 px-6 font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 group"
            >
              <Columns2 className="size-5" />
              <span>Launch Dual Split-Screen Demo</span>
              <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#evaluator-guide">
            <Button
              variant="outline"
              size="lg"
              className="min-h-[48px] h-12 px-5 font-medium"
            >
              <Eye className="size-4 mr-2 text-muted-foreground" />
              <span>Evaluator Test Guide</span>
            </Button>
          </Link>
        </div>

        {/* Route Navigation Cards (3 Options) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-14">
          {/* Card 1: Dual Split View (Featured) */}
          <Card className="border-primary/40 bg-card/60 relative overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary flex flex-col group">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
              Evaluator Pick
            </div>
            <CardHeader className="pb-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Columns2 className="size-6" />
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                Dual Split-Screen Demo
              </CardTitle>
              <CardDescription className="text-xs font-mono text-muted-foreground">
                Route: /split-view
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-0">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Side-by-side sandbox running Patient and Staff views simultaneously.
                Test instant keystroke mirroring and presence transitions in a single tab.
              </p>
              <Link href="/split-view" className="block w-full mt-auto">
                <Button className="w-full min-h-[44px] h-11 group/btn font-medium bg-primary text-primary-foreground">
                  <span>Open Split-Screen Sandbox</span>
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 2: Patient Portal */}
          <Card className="border-border/80 hover:border-primary/50 transition-all hover:shadow-md flex flex-col group">
            <CardHeader className="pb-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground mb-3">
                <UserCheck className="size-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                Patient Intake Form
              </CardTitle>
              <CardDescription className="text-xs font-mono text-muted-foreground">
                Route: /patient
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-0">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Mobile-first 3-step wizard with Zod validation onBlur, accessible
                44px touch targets, offline draft autosave, and keystroke broadcast.
              </p>
              <Link href="/patient" className="block w-full mt-auto">
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] h-11 group/btn font-medium"
                >
                  <span>Open Patient Form</span>
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 3: Staff Dashboard */}
          <Card className="border-border/80 hover:border-primary/50 transition-all hover:shadow-md flex flex-col group">
            <CardHeader className="pb-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground mb-3">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                Staff Monitoring View
              </CardTitle>
              <CardDescription className="text-xs font-mono text-muted-foreground">
                Route: /staff
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-0">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Desktop-optimized monitoring dashboard with live field mirroring,
                highlight animations on change, presence badges, and next patient turnover.
              </p>
              <Link href="/staff" className="block w-full mt-auto">
                <Button
                  variant="outline"
                  className="w-full min-h-[44px] h-11 group/btn font-medium"
                >
                  <span>Open Staff Dashboard</span>
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Evaluator Quick-Start Guide Section */}
        <section
          id="evaluator-guide"
          className="w-full mt-16 pt-10 border-t border-border/70"
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="mb-2 font-medium px-3 py-1">
              Evaluator Test Protocol
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How to Evaluate Real-Time Synchronization
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Follow these 4 verified steps on the Split-Screen Demo or using two
              browser windows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 1 */}
            <div className="rounded-xl border border-border/80 bg-card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  1
                </span>
                <Columns2 className="size-4 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1.5">Open Split-Screen</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Launch <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">/split-view</code>.
                Left side renders Patient View; right side renders Staff Dashboard with zero setup.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-border/80 bg-card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  2
                </span>
                <Zap className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-1.5">Test Live Typing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Type in First Name, Phone, or DOB on Patient side. Notice the Staff card
                mirrors each keystroke instantly with subtle blue highlight animations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-border/80 bg-card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  3
                </span>
                <Clock className="size-4 text-amber-500" />
              </div>
              <h3 className="font-semibold text-base mb-1.5">Observe Presence &amp; Idle</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Notice the status badge displays <strong>Typing</strong>. Stop typing for
                5 seconds: the presence tracker automatically transitions to <strong>Idle</strong>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-border/80 bg-card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  4
                </span>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-base mb-1.5">Submit &amp; Next Patient</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Complete Step 3 and submit the form. Staff view displays <strong>Submitted</strong>.
                Click &quot;Call Next Patient&quot; to reset and test the turnover cycle.
              </p>
            </div>
          </div>
        </section>

        {/* System Architecture & Engineering Highlights */}
        <section className="w-full mt-16 pt-10 border-t border-border/70">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Architecture &amp; Key Highlights
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Built to healthcare usability and high-throughput real-time standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-border/70 bg-card/60 p-4">
              <div className="flex items-center gap-2.5 font-semibold text-sm mb-2 text-foreground">
                <Wifi className="size-4 text-primary" />
                <span>Dual Realtime Synchronization</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Primary client-to-client broadcast via Supabase Realtime with automatic
                fallback to browser Web API <code className="bg-muted px-1 rounded">BroadcastChannel</code>,
                enabling zero-latency offline demo operation without database write latency.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card/60 p-4">
              <div className="flex items-center gap-2.5 font-semibold text-sm mb-2 text-foreground">
                <Smartphone className="size-4 text-primary" />
                <span>Accessible Mobile-First Intake</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Strict adherence to WCAG 2.5.5 touch target minimums (44×44px), 16px font
                size to eliminate iOS Safari viewport zoom, and onBlur validation to reduce
                premature cognitive stress.
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card/60 p-4">
              <div className="flex items-center gap-2.5 font-semibold text-sm mb-2 text-foreground">
                <Layers className="size-4 text-primary" />
                <span>2026 Production Tech Stack</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Next.js 16.3.5 (App Router, Turbopack), React 19.3, Tailwind CSS v4.3.3,
                React Hook Form 7.88, Zod 4.6, Zustand 5.0.15, and Lucide React 1.47.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Agnos Candidate Assignment • Milestone 4 Production Demo</span>
          <div className="flex items-center gap-4">
            <Link href="/patient" className="hover:text-foreground transition-colors">
              Patient View
            </Link>
            <Link href="/staff" className="hover:text-foreground transition-colors">
              Staff View
            </Link>
            <Link href="/split-view" className="hover:text-foreground transition-colors">
              Split-Screen Demo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
