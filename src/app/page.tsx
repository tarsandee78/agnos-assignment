import Link from "next/link";
import { HeartPulse, UserCheck, ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <Link href="/patient">
              <Button size="sm" variant="outline" className="min-h-[36px]">
                Patient View
              </Button>
            </Link>
            <Link href="/staff">
              <Button size="sm" className="min-h-[36px]">
                Staff View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
          <Activity className="size-3.5 animate-pulse" />
          <span>Next.js 16 • React 19 • Tailwind CSS v4 • Supabase Realtime</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight">
          Real-Time Patient Intake & Staff Monitoring
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mt-4">
          A mobile-first, low cognitive load intake wizard for patients synchronized with zero-database overhead to staff dashboards.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-12 text-left">
          {/* Patient Portal Card */}
          <Card className="border-border/80 hover:border-primary/50 transition-all hover:shadow-md group">
            <CardHeader>
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                <UserCheck className="size-6" />
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                Patient Intake Form (/patient)
              </CardTitle>
              <CardDescription>
                Mobile-first responsive 3-step wizard with smart onBlur validation, accessible touch targets, and offline draft autosave.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/patient" className="block w-full">
                <Button className="w-full min-h-[44px] h-11 group/btn font-medium">
                  <span>Open Patient Form</span>
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Staff Dashboard Card */}
          <Card className="border-border/80 hover:border-primary/50 transition-all hover:shadow-md group">
            <CardHeader>
              <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground mb-2">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                Staff Monitoring Dashboard (/staff)
              </CardTitle>
              <CardDescription>
                Desktop-optimized live monitoring view with patient presence indicators (Typing / Idle / Submitted) and real-time field mirroring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/staff" className="block w-full">
                <Button variant="secondary" className="w-full min-h-[44px] h-11 group/btn font-medium">
                  <span>Open Staff Dashboard</span>
                  <ArrowRight className="size-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Agnos Candidate Assignment • Production System
      </footer>
    </div>
  );
}
