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
import type { PatientFormData } from "@/lib/schemas";

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

  const patientFullName = [
    data.personal.firstName,
    data.personal.middleName,
    data.personal.lastName,
  ]
    .filter(Boolean)
    .join(" ");

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
        className="max-w-md sm:max-w-lg p-6 sm:p-8 rounded-2xl border-border shadow-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="items-center text-center space-y-3">
          {/* Animated Success Icon Badge */}
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success ring-8 ring-success/10 shadow-sm animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="size-10 stroke-[2.5]" aria-hidden="true" />
            <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-3" aria-hidden="true" />
            </div>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Registration Submitted!
          </DialogTitle>
          <p className="text-xs sm:text-sm font-semibold text-success">
            ส่งข้อมูลลงทะเบียนผู้ป่วยเรียบร้อยแล้ว
          </p>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            ข้อมูลของผู้ป่วยได้รับการส่งตรงไปยังระบบหน้าจอเจ้าหน้าที่ (Staff Monitoring) แบบ Real-time เรียบร้อยแล้ว
          </DialogDescription>
        </DialogHeader>

        {/* Patient Submission Summary Card */}
        <div className="my-2 rounded-xl bg-muted/50 border border-border/70 p-4 space-y-2.5 text-left text-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Reference No. / เลขอ้างอิง:</span>
            <span className="font-mono font-bold text-xs sm:text-sm text-primary">
              {referenceId || "AGN-PENDING"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Patient Name / ชื่อผู้ป่วย:</span>
            <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[240px]">
              {patientFullName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Contact / เบอร์ติดต่อ:</span>
            <span className="font-mono text-xs sm:text-sm text-foreground">
              {data.contact.phoneNumber}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs">
            <span className="text-muted-foreground font-medium">Submitted At / เวลาที่ส่ง:</span>
            <span className="text-muted-foreground tabular-nums">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button
            type="button"
            onClick={onResetAndNew}
            className="w-full sm:w-auto flex-1 min-h-[44px] h-11 text-base font-semibold touch-target shadow-sm cursor-pointer"
          >
            <RefreshCw className="size-4 mr-2" aria-hidden="true" />
            Register Another Patient / ลงทะเบียนเพิ่ม
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto min-h-[44px] h-11 text-base font-medium touch-target cursor-pointer hover:bg-muted"
          >
            Close / ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
