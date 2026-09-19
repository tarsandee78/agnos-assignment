"use client";

import * as React from "react";
import { CheckCircle2, Sparkles, RefreshCw } from "lucide-react";
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

export interface SubmissionSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PatientFormData | null;
  referenceId?: string;
  submittedAt?: string;
  onResetAndNew: () => void;
}

export function SubmissionSuccessDialog({
  open,
  onOpenChange,
  data,
  referenceId,
  submittedAt,
  onResetAndNew,
}: SubmissionSuccessDialogProps) {
  if (!data) return null;

  const patientFullName = getPatientFullName(data.personal);

  const formattedDate = React.useMemo(() => {
    try {
      const dateObj = submittedAt ? new Date(submittedAt) : new Date();
      return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(dateObj);
    } catch {
      return new Date().toLocaleString();
    }
  }, [submittedAt]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-md p-6 sm:p-7 rounded-2xl border-border shadow-2xl overflow-hidden font-sans"
        showCloseButton={false}
      >
        <DialogHeader className="items-center text-center space-y-2.5">
          {/* Calm Medical Success Icon Badge */}
          <div className="flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success ring-4 ring-success/10 shadow-xs">
            <CheckCircle2 className="size-8 stroke-[2.5]" aria-hidden="true" />
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
            Registration Submitted!
          </DialogTitle>
          <p className="text-sm font-semibold text-success">
            ส่งข้อมูลลงทะเบียนผู้ป่วยเรียบร้อยแล้ว
          </p>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            ข้อมูลของผู้ป่วยได้รับการส่งตรงไปยังระบบหน้าจอเจ้าหน้าที่ (Staff Monitoring) แบบ Real-time เรียบร้อยแล้ว
          </DialogDescription>
        </DialogHeader>

        {/* Patient Submission Summary Card */}
        <div className="w-full my-3 rounded-xl bg-muted/60 border border-border/80 p-4 space-y-3 text-left text-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5 gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium shrink-0">
              Reference No. / เลขอ้างอิง:
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-primary truncate text-right">
              {referenceId || "AGN-PENDING"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium shrink-0">
              Patient Name / ชื่อผู้ป่วย:
            </span>
            <span className="font-semibold text-foreground text-sm sm:text-base truncate text-right">
              {patientFullName}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium shrink-0">
              Contact / เบอร์ติดต่อ:
            </span>
            <span className="font-mono text-xs sm:text-sm font-medium text-foreground text-right">
              {data.contact.phoneNumber}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground font-medium shrink-0">
              Submitted At / เวลาที่ส่ง:
            </span>
            <span className="text-muted-foreground tabular-nums text-right">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Responsive Full-Width Footer Actions */}
        <DialogFooter className="flex flex-col gap-2.5 pt-2 w-full min-w-0">
          <Button
            type="button"
            onClick={onResetAndNew}
            className="w-full h-auto min-h-[44px] py-2.5 px-4 text-sm sm:text-base font-semibold touch-target shadow-sm cursor-pointer whitespace-normal text-center bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="size-4 mr-2 shrink-0" aria-hidden="true" />
            <span>Register Another Patient (ลงทะเบียนเพิ่ม)</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full min-h-[44px] h-11 text-sm sm:text-base font-medium touch-target cursor-pointer hover:bg-muted"
          >
            <span>Close / ปิดหน้าต่าง</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
