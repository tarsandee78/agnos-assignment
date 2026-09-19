"use client";

import * as React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  Edit3,
  Loader2,
  Mail,
  Phone,
  Send,
  ShieldAlert,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPhoneNumber,
  handlePhoneBackspaceKeyDown,
  getPatientFullName,
  GENDER_DISPLAY_MAP,
  type PatientFormData,
  type PatientFormStep,
} from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface StepEmergencyReviewProps {
  form: UseFormReturn<PatientFormData, any, any>;
  onSubmit: () => Promise<void> | void;
  onBack: () => void;
  onEditStep: (step: PatientFormStep) => void;
  isSubmitting?: boolean;
  submissionError?: string | null;
  className?: string;
}

function FieldError({ error, id }: { error?: string; id?: string }) {
  if (!error) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive animate-in fade-in-50 duration-150"
    >
      <AlertCircle className="size-3.5 shrink-0 text-destructive" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}

interface SummaryItem {
  label: string;
  value?: string | null;
}

function SummarySection({
  title,
  icon: Icon,
  onEdit,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onEdit?: () => void;
  items: SummaryItem[];
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Icon className="size-4 text-primary" aria-hidden="true" />
          <span>{title}</span>
        </div>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="min-h-[44px] min-w-[44px] h-11 px-3 text-xs sm:text-sm text-primary font-semibold hover:bg-primary/10 touch-target cursor-pointer"
            aria-label={`Edit ${title}`}
          >
            <Edit3 className="size-3.5 mr-1.5" aria-hidden="true" />
            Edit
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex justify-between items-start gap-2 border-b border-border/30 last:border-0 pb-1.5 last:pb-0"
          >
            <span className="text-muted-foreground font-medium shrink-0">{item.label}:</span>
            <span className="font-semibold text-foreground text-right break-words max-w-[65%]">
              {item.value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * StepEmergencyReview Component
 * Clean, senior-grade implementation adhering to Karpathy Simplicity First and Matt Pocock deep design.
 */
export function StepEmergencyReview({
  form,
  onSubmit,
  onBack,
  onEditStep,
  isSubmitting = false,
  submissionError = null,
  className,
}: StepEmergencyReviewProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const emergencyErrors = errors.emergency;
  const { personal, contact, emergency } = watch();
  const fullName = getPatientFullName(personal);

  const personalSummary: SummaryItem[] = [
    { label: "Full Name", value: fullName },
    { label: "Date of Birth", value: personal?.dateOfBirth },
    {
      label: "Gender",
      value: personal?.gender ? GENDER_DISPLAY_MAP[personal.gender] || personal.gender : null,
    },
    { label: "Language", value: personal?.preferredLanguage },
    { label: "Nationality", value: personal?.nationality },
    { label: "Religion", value: personal?.religion || "None / Not specified" },
  ];

  const contactSummary: SummaryItem[] = [
    { label: "Phone Number", value: contact?.phoneNumber },
    { label: "Email", value: contact?.email },
    { label: "Address", value: contact?.address },
  ];

  const hasEmergency = Boolean(
    emergency?.contactName || emergency?.contactPhone || emergency?.relationship
  );

  const emergencySummary: SummaryItem[] = hasEmergency
    ? [
        { label: "Contact Name", value: emergency?.contactName },
        { label: "Relationship", value: emergency?.relationship },
        { label: "Emergency Phone", value: emergency?.contactPhone },
      ]
    : [{ label: "Emergency Contact", value: "Not provided (Optional)" }];

  return (
    <div className={cn("w-full bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Emergency Contact &amp; Review
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            ข้อมูลผู้ติดต่อฉุกเฉินและตรวจสอบความถูกต้องของข้อมูลก่อนส่ง
          </p>
        </div>
      </div>

      {/* SECTION 1: Emergency Contact Input Fields (Optional) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Emergency Contact Information
          </h3>
          <span className="text-xs text-muted-foreground">(Optional / ไม่บังคับระบุ)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-sm font-medium">
              Contact Name / ชื่อผู้ติดต่อ
            </Label>
            <Input
              id="contactName"
              type="text"
              maxLength={100}
              placeholder="e.g. สมศรี ใจดี / Somsri Jaidee"
              autoComplete="name"
              aria-invalid={Boolean(emergencyErrors?.contactName)}
              aria-describedby={emergencyErrors?.contactName ? "contactName-error" : undefined}
              className="min-h-[44px] h-11 text-base touch-target"
              {...register("emergency.contactName")}
            />
            <FieldError id="contactName-error" error={emergencyErrors?.contactName?.message} />
          </div>

          {/* Emergency Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-sm font-medium">
              Emergency Phone / เบอร์โทรฉุกเฉิน
            </Label>
            <Controller
              control={control}
              name="emergency.contactPhone"
              render={({ field }) => (
                <Input
                  id="contactPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="e.g. 089-123-4567"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                  onBlur={field.onBlur}
                  onKeyDown={(e) => handlePhoneBackspaceKeyDown(e, field.onChange)}
                  aria-invalid={Boolean(emergencyErrors?.contactPhone)}
                  aria-describedby={emergencyErrors?.contactPhone ? "contactPhone-error" : undefined}
                  className="min-h-[44px] h-11 text-base touch-target tabular-nums"
                />
              )}
            />
            <FieldError id="contactPhone-error" error={emergencyErrors?.contactPhone?.message} />
          </div>
        </div>

        {/* Relationship */}
        <div className="space-y-2">
          <Label htmlFor="relationship" className="text-sm font-medium">
            Relationship / ความสัมพันธ์
          </Label>
          <Input
            id="relationship"
            type="text"
            maxLength={50}
            placeholder="e.g. มารดา (Mother), คู่สมรส (Spouse), บุตร (Child)"
            aria-invalid={Boolean(emergencyErrors?.relationship)}
            aria-describedby={emergencyErrors?.relationship ? "relationship-error" : undefined}
            className="min-h-[44px] h-11 text-base touch-target"
            {...register("emergency.relationship")}
          />
          <FieldError id="relationship-error" error={emergencyErrors?.relationship?.message} />
        </div>
      </div>

      {/* SECTION 2: Data-Driven Review Summary */}
      <div className="space-y-4 pt-6 border-t border-border/60">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Review Registration Summary / ตรวจสอบข้อมูลก่อนส่ง
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            กรุณาตรวจสอบความถูกต้องของข้อมูลทั้งหมด หากต้องการแก้ไขสามารถคลิก &quot;Edit&quot; ที่ส่วนนั้นได้
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummarySection
            title="Personal Details"
            icon={User}
            onEdit={() => onEditStep(1)}
            items={personalSummary}
          />
          <SummarySection
            title="Contact & Address"
            icon={Phone}
            onEdit={() => onEditStep(2)}
            items={contactSummary}
          />
        </div>

        <SummarySection
          title="Emergency Contact"
          icon={ShieldAlert}
          items={emergencySummary}
        />
      </div>

      {/* Submission Error Alert */}
      {submissionError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium animate-in fade-in-50"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* SECTION 3: Navigation Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onBack}
          className="w-full sm:w-auto min-h-[44px] h-11 px-5 font-medium text-base touch-target cursor-pointer hover:bg-muted"
        >
          <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
          <span>Back: Contact & Address</span>
        </Button>

        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full sm:w-auto min-h-[44px] h-11 px-7 font-bold text-base touch-target group shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
              <span>Submitting Registration...</span>
            </>
          ) : (
            <>
              <Send className="size-4 mr-2 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              <span>Submit Form / ส่งข้อมูลลงทะเบียน</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
