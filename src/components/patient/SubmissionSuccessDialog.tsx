"use client";

import * as React from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getPatientFullName, type PatientFormData } from "@/lib/schemas";
import { type TranslationDictionary, type Language } from "@/lib/i18n/translations";

export interface SubmissionSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PatientFormData | null;
  referenceId?: string;
  submittedAt?: string;
  onResetAndNew: () => void;
  lang?: Language;
  t: TranslationDictionary;
}

export function SubmissionSuccessDialog({
  open,
  onOpenChange,
  data,
  referenceId,
  submittedAt,
  onResetAndNew,
  lang = "th",
  t,
}: SubmissionSuccessDialogProps) {
  if (!data) return null;

  const patientFullName = getPatientFullName(data.personal);

  const formattedDate = React.useMemo(() => {
    try {
      const dateObj = submittedAt ? new Date(submittedAt) : new Date();
      return new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(dateObj);
    } catch {
      return new Date().toLocaleString();
    }
  }, [submittedAt, lang]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-md p-6 sm:p-8 rounded-2xl border-border shadow-2xl overflow-hidden font-sans"
        showCloseButton={false}
      >
        <DialogHeader className="items-center text-center sm:text-center space-y-3">
          {/* Calm Medical Success Icon Badge */}
          <div className="flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success ring-8 ring-success/10 shadow-xs animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="size-9 stroke-[2.5]" aria-hidden="true" />
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground text-center sm:text-center">
            {t.success.title}
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-center sm:text-center max-w-sm mx-auto leading-relaxed">
            {t.success.subtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Patient Submission Summary Card (Receipt Style) */}
        <div className="w-full my-2 rounded-xl bg-muted/40 border border-border/80 overflow-hidden divide-y divide-border/60">
          {/* Reference ID Ticket Header */}
          <div className="bg-primary/5 px-4 py-2.5 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {t.success.refId}
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-primary tracking-wide">
              {referenceId || "AGN-PENDING"}
            </span>
          </div>

          {/* Details Grid */}
          <div className="p-4 space-y-2.5 text-left text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium shrink-0">
                {t.personal.fullName}
              </span>
              <span className="font-semibold text-foreground text-sm sm:text-base truncate text-right">
                {patientFullName}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium shrink-0">
                {t.contact.phoneNumber}
              </span>
              <span className="font-mono text-xs sm:text-sm font-medium text-foreground text-right">
                {data.contact.phoneNumber}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground font-medium shrink-0">
                {t.success.submittedAt}
              </span>
              <span className="text-muted-foreground tabular-nums text-right">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Full-Width Footer Actions */}
        <DialogFooter className="flex flex-col gap-2.5 pt-2 w-full min-w-0">
          <Button
            type="button"
            onClick={onResetAndNew}
            className="w-full h-auto min-h-[44px] py-2.5 px-4 text-sm sm:text-base font-semibold touch-target shadow-sm cursor-pointer whitespace-normal text-center bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="size-4 mr-2 shrink-0" aria-hidden="true" />
            <span>{t.success.registerNext}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full min-h-[44px] h-11 text-sm sm:text-base font-medium touch-target cursor-pointer hover:bg-muted active:scale-[0.98] transition-all"
          >
            <span>{t.common.close}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
