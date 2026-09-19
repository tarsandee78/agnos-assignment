"use client";

import * as React from "react";
import Link from "next/link";
import {
  HeartPulse,
  ArrowLeft,
  Columns2,
  Smartphone,
  Monitor,
  RotateCw,
  ExternalLink,
  Activity,
  Wifi,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ViewMode = "split-equal" | "mobile-mockup";
type MobileTab = "patient" | "staff";

export default function SplitViewPage() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("mobile-mockup");
  const [activeTab, setActiveTab] = React.useState<MobileTab>("patient");
  const [patientKey, setPatientKey] = React.useState(0);
  const [staffKey, setStaffKey] = React.useState(0);
  const [showTip, setShowTip] = React.useState(true);

  const handleReloadPatient = () => setPatientKey((k) => k + 1);
  const handleReloadStaff = () => setStaffKey((k) => k + 1);
  const handleReloadAll = () => {
    setPatientKey((k) => k + 1);
    setStaffKey((k) => k + 1);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-muted/20 flex flex-col text-foreground">
      {/* Top Navigation & Control Header */}
      <header className="h-14 border-b border-border/80 bg-card/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-30 shrink-0">
        {/* Left: Back Link & Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[38px] h-9 px-2.5 text-muted-foreground hover:text-foreground touch-target"
              title="Return to Landing Page"
            >
              <ArrowLeft className="size-4 mr-1.5" />
              <span className="hidden sm:inline font-medium text-xs">Home</span>
            </Button>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
              <HeartPulse className="size-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm tracking-tight leading-none hidden sm:inline">
                  Agnos Live Sandbox
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 px-1.5 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hidden sm:flex items-center gap-1 font-medium"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Realtime Room</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Mobile Tab Switcher (Visible on screens < 1024px) */}
        <div className="flex lg:hidden items-center bg-muted/80 p-0.5 rounded-lg border border-border/70">
          <button
            type="button"
            onClick={() => setActiveTab("patient")}
            className={`min-h-[34px] px-3 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "patient"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="size-3.5 text-primary" />
            <span>Patient View</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`min-h-[34px] px-3 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "staff"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="size-3.5 text-primary" />
            <span>Staff Monitor</span>
          </button>
        </div>

        {/* Center: Desktop Layout Selector (Visible on lg+ screens) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/70">
          <button
            type="button"
            onClick={() => setViewMode("mobile-mockup")}
            className={`min-h-[32px] px-2.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "mobile-mockup"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Simulate Mobile Phone beside Desktop Monitor"
          >
            <Smartphone className="size-3.5 text-primary" />
            <span>Mobile + Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split-equal")}
            className={`min-h-[32px] px-2.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "split-equal"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="50/50 Side-by-Side Split"
          >
            <Columns2 className="size-3.5 text-primary" />
            <span>50 / 50 Split</span>
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReloadAll}
            className="min-h-[38px] h-8 px-2 text-xs text-muted-foreground hover:text-foreground touch-target"
            title="Reload both frames"
          >
            <RotateCw className="size-3.5 mr-1" />
            <span className="hidden sm:inline">Reset Demo</span>
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <a
            href="/patient"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex"
            title="Open Patient View in separate tab"
          >
            <Button
              variant="outline"
              size="sm"
              className="min-h-[38px] h-8 px-2 text-[11px] text-muted-foreground"
            >
              <span>Patient Tab</span>
              <ExternalLink className="size-3 ml-1" />
            </Button>
          </a>

          <a
            href="/staff"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex"
            title="Open Staff View in separate tab"
          >
            <Button
              variant="outline"
              size="sm"
              className="min-h-[38px] h-8 px-2 text-[11px] text-muted-foreground"
            >
              <span>Staff Tab</span>
              <ExternalLink className="size-3 ml-1" />
            </Button>
          </a>
        </div>
      </header>

      {/* Evaluator Quick Hint Bar */}
      {showTip && (
        <div className="bg-primary/5 border-b border-primary/15 px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-primary shrink-0 transition-all">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
            <Sparkles className="size-3.5 shrink-0" />
            <span className="truncate">
              <strong>Tip:</strong> Type in Patient form to see live keystroke mirroring on Staff monitor!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTip(false)}
            className="text-xs text-muted-foreground hover:text-foreground ml-2 shrink-0"
            title="Dismiss tip"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split Viewport Body */}
      <main className="flex-1 w-full h-full overflow-hidden relative">
        {/* ========================================================================= */}
        {/* DESKTOP SPLIT VIEW (Visible on lg+ screens)                               */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex w-full h-full overflow-hidden divide-x divide-border/80">
          {/* LEFT PANEL: PATIENT INTAKE VIEW */}
          <section
            className={`h-full overflow-hidden flex flex-col bg-muted/30 transition-all duration-300 ${
              viewMode === "mobile-mockup"
                ? "w-[430px] shrink-0 p-3 items-center justify-center"
                : "w-1/2"
            }`}
          >
            {/* Panel Header Label */}
            <div className="w-full flex items-center justify-between px-3 py-2 bg-card/60 border-b border-border/60 text-xs shrink-0">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Smartphone className="size-3.5 text-primary" />
                <span>Patient View (Mobile Intake Wizard)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReloadPatient}
                  className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1"
                  title="Reload Patient Form"
                >
                  <RotateCw className="size-3" />
                  <span>Reload</span>
                </button>
              </div>
            </div>

            {/* Iframe Container */}
            {viewMode === "mobile-mockup" ? (
              /* Realistic Smartphone Mockup Frame */
              <div className="w-full max-w-[390px] h-[calc(100%-2.5rem)] rounded-[2.25rem] border-[7px] border-foreground/15 shadow-xl bg-background overflow-hidden flex flex-col relative my-auto">
                {/* Phone Speaker Notch */}
                <div className="w-full h-4 bg-muted/40 flex items-center justify-center shrink-0 border-b border-border/40">
                  <div className="w-12 h-1 bg-foreground/25 rounded-full" />
                </div>
                <iframe
                  key={`patient-mockup-${patientKey}`}
                  src="/patient"
                  title="Patient Intake Form (Mobile Mockup)"
                  className="w-full flex-1 border-0 bg-background"
                />
              </div>
            ) : (
              /* Full Width 50% Frame */
              <div className="w-full flex-1 overflow-hidden">
                <iframe
                  key={`patient-split-${patientKey}`}
                  src="/patient"
                  title="Patient Intake Form (50% Split)"
                  className="w-full h-full border-0 bg-background"
                />
              </div>
            )}
          </section>

          {/* RIGHT PANEL: STAFF MONITORING DASHBOARD */}
          <section className="flex-1 h-full overflow-hidden flex flex-col bg-background">
            {/* Panel Header Label */}
            <div className="w-full flex items-center justify-between px-3 py-2 bg-card/60 border-b border-border/60 text-xs shrink-0">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Monitor className="size-3.5 text-primary" />
                <span>Staff View (Real-Time Monitoring Dashboard)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReloadStaff}
                  className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1"
                  title="Reload Staff Dashboard"
                >
                  <RotateCw className="size-3" />
                  <span>Reload</span>
                </button>
              </div>
            </div>

            {/* Staff Iframe */}
            <div className="w-full flex-1 overflow-hidden">
              <iframe
                key={`staff-split-${staffKey}`}
                src="/staff"
                title="Staff Monitoring Dashboard"
                className="w-full h-full border-0 bg-background"
              />
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE & TABLET TABBED VIEW (< 1024px screens)                             */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full h-full overflow-hidden flex flex-col">
          {activeTab === "patient" ? (
            <div className="w-full h-full flex flex-col">
              <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 text-[11px] text-primary flex items-center justify-between">
                <span>Displaying Patient View (Use switcher above for Staff)</span>
                <button
                  type="button"
                  onClick={handleReloadPatient}
                  className="text-xs flex items-center gap-1"
                >
                  <RotateCw className="size-3" />
                  <span>Reload</span>
                </button>
              </div>
              <iframe
                key={`patient-mobile-${patientKey}`}
                src="/patient"
                title="Patient Intake Form"
                className="w-full flex-1 border-0 bg-background"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 text-[11px] text-primary flex items-center justify-between">
                <span>Displaying Staff Monitor (Use switcher above for Patient)</span>
                <button
                  type="button"
                  onClick={handleReloadStaff}
                  className="text-xs flex items-center gap-1"
                >
                  <RotateCw className="size-3" />
                  <span>Reload</span>
                </button>
              </div>
              <iframe
                key={`staff-mobile-${staffKey}`}
                src="/staff"
                title="Staff Monitoring Dashboard"
                className="w-full flex-1 border-0 bg-background"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
