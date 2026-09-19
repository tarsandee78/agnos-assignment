'use client';

import React, { useState } from 'react';
import { useStaffStore } from '@/store/useStaffStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type TranslationDictionary } from '@/lib/i18n/translations';

export interface NextPatientDialogProps {
  /** Additional styling for default trigger */
  className?: string;
  /** Variant of default trigger */
  variant?: 'outline' | 'default' | 'secondary';
  /** Button text label */
  label?: string;
  /** Translation dictionary */
  t?: TranslationDictionary;
}

export function NextPatientDialog({
  className,
  variant = 'outline',
  label,
  t,
}: NextPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const resetStaffState = useStaffStore((state) => state.resetStaffState);
  const patientData = useStaffStore((state) => state.patientData);
  const isSubmitted = useStaffStore((state) => state.isSubmitted);

  const handleConfirm = () => {
    resetStaffState();
    setOpen(false);
  };

  const hasActiveData = Boolean(patientData || isSubmitted);
  const isThai = t?.common.back === 'ย้อนกลับ' || !t;

  const buttonLabel = label ?? (t?.staff.nextPatient ?? 'Next Patient');

  return (
    <>
      {/* Trigger Button */}
      <Button
        type="button"
        variant={variant}
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          'gap-1.5 min-h-[44px] px-3.5 text-xs font-semibold touch-target cursor-pointer shadow-xs',
          className
        )}
        title={isThai ? 'เตรียมรับผู้ป่วยรายถัดไป' : 'Prepare for next patient'}
      >
        <UserPlus className="size-3.5" aria-hidden="true" />
        <span>{buttonLabel}</span>
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md p-6 rounded-2xl border-border shadow-xl font-sans"
          showCloseButton
        >
          <DialogHeader className="items-center text-center space-y-3">
            {/* Turnover Icon */}
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-8 ring-primary/5">
              <UserPlus className="size-6 stroke-[2.5]" aria-hidden="true" />
            </div>

            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {isThai ? 'เตรียมรับผู้ป่วยรายถัดไป?' : 'Prepare for Next Patient?'}
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {hasActiveData
                ? (isThai
                    ? 'ระบบจะล้างข้อมูลคนไข้ปัจจุบันและสถานะการกรอกทั้งหมดออกจากหน้าจอ เพื่อเตรียมพร้อมรับคนไข้รายใหม่'
                    : 'This will clear all current patient intake data and live presence state from this monitor screen, readying the room for the next patient.')
                : (isThai
                    ? 'หน้าจอไม่มีข้อมูลคนไข้ตกค้าง การรีเซ็ตจะตรวจสอบสถานะห้องใหม่อีกครั้ง'
                    : 'The dashboard is currently empty. Resetting will re-verify the room status.')}
            </DialogDescription>
          </DialogHeader>

          {hasActiveData && (
            <div className="my-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {isThai
                  ? 'โปรดตรวจสอบให้แน่ใจว่าได้บันทึกข้อมูลสำคัญเรียบร้อยแล้ว การกระทำนี้ไม่สามารถย้อนกลับได้'
                  : 'Make sure any required medical details have been recorded before clearing. This action cannot be undone.'}
              </span>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto min-h-[44px] text-sm font-medium touch-target cursor-pointer hover:bg-muted"
            >
              {isThai ? 'ยกเลิก' : 'Cancel'}
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto flex-1 min-h-[44px] text-sm font-semibold touch-target shadow-sm cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RotateCcw className="size-4 mr-2" aria-hidden="true" />
              {isThai ? 'ยืนยันเริ่มรายใหม่' : 'Confirm & Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
