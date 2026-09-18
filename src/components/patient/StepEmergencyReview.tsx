"use client";

import * as React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  Edit3,
  HeartHandshake,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldAlert,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPhoneNumber,
  type PatientFormData,
  type PatientFormStep,
} from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export interface StepEmergencyReviewProps {
  /** React Hook Form instance for PatientFormData */
  form: UseFormReturn<PatientFormData, any, any>;
  /** Callback fired when user submits the completed registration */
  onSubmit: () => Promise<void> | void;
  /** Callback fired when navigating back to Step 2 (no validation required) */
  onBack: () => void;
  /** Callback fired when user clicks an 'Edit' button on review summary cards */
  onEditStep: (step: PatientFormStep) => void;
  /** Submission loading indicator */
  isSubmitting?: boolean;
  /** Submission general error message if any */
  submissionError?: string | null;
  /** Optional custom CSS classes */
  className?: string;
}

const COMMON_RELATIONSHIPS = [
  { label: "Father / บิดา", value: "Father (บิดา)" },
  { label: "Mother / มารดา", value: "Mother (มารดา)" },
  { label: "Spouse / คู่สมรส", value: "Spouse (คู่สมรส)" },
  { label: "Child / บุตร", value: "Child (บุตร)" },
  { label: "Sibling / พี่น้อง", value: "Sibling (พี่น้อง)" },
  { label: "Relative / ญาติ", value: "Relative (ญาติ)" },
] as const;

const GENDER_LABELS: Record<string, string> = {
  male: "Male (ชาย)",
  female: "Female (หญิง)",
  other: "Other (อื่นๆ)",
  prefer_not_to_say: "Prefer not to say (ไม่ประสงค์ระบุ)",
};

function OptionalBadge() {
  return (
    <span className="text-xs text-muted-foreground font-normal ml-1.5">
      (Optional / ไม่บังคับ)
    </span>
  );
}

interface FieldErrorProps {
  error?: string;
  id?: string;
}

function FieldError({ error, id }: FieldErrorProps) {
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

function calculateAge(dobString?: string): number | null {
  if (!dobString) return null;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * StepEmergencyReview Component
 *
 * Patient intake multi-step wizard - Step 3: Emergency Contact & Review Summary.
 *
 * Features:
 * 1. Emergency Contact input fields (Optional, max characters, auto-formatting phone).
 * 2. Pre-Submission Review Summary Cards mirroring all data from Steps 1, 2, and 3.
 * 3. Quick "Edit" action buttons per section jumping back to Step 1 or Step 2.
 * 4. Submission button with loading spinner & double-click prevention.
 * 5. Healthcare accessibility: >=44px touch targets, 16px input font, WCAG AA compliance.
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
  const formData = watch();

  const personal = formData.personal;
  const contact = formData.contact;
  const emergency = formData.emergency;

  const calculatedAge = React.useMemo(
    () => calculateAge(personal?.dateOfBirth),
    [personal?.dateOfBirth]
  );

  const fullName = [
    personal?.firstName,
    personal?.middleName,
    personal?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: Emergency Contact Input Fields (Optional)           */}
      {/* ------------------------------------------------------------- */}
      <Card className="w-full shadow-xs border-border/80">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldAlert className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                Emergency Contact
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                ข้อมูลผู้ติดต่อฉุกเฉิน (บุคคลที่โรงพยาบาลสามารถติดต่อได้ในกรณีจำเป็น)
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-medium">
                Contact Person Name / ชื่อ-นามสกุลผู้ติดต่อ
                <OptionalBadge />
              </Label>
              <Input
                id="contactName"
                type="text"
                maxLength={100}
                placeholder="e.g. สมศรี ใจดี / Somsri Jaidee"
                autoComplete="name"
                aria-invalid={Boolean(emergencyErrors?.contactName)}
                aria-describedby={
                  emergencyErrors?.contactName
                    ? "contactName-error"
                    : "contactName-hint"
                }
                className="min-h-[44px] h-11 text-base touch-target"
                {...register("emergency.contactName")}
              />
              <p id="contactName-hint" className="text-xs text-muted-foreground">
                ชื่อและนามสกุลของผู้ติดต่อในกรณีฉุกเฉิน
              </p>
              <FieldError
                id="contactName-error"
                error={emergencyErrors?.contactName?.message}
              />
            </div>

            {/* Emergency Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-sm font-medium">
                Emergency Phone / เบอร์โทรศัพท์ฉุกเฉิน
                <OptionalBadge />
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
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                    onBlur={field.onBlur}
                    onKeyDown={(e) => {
                      // Smooth backspace handling across hyphen delimiters
                      if (e.key === "Backspace") {
                        const input = e.currentTarget;
                        const { selectionStart, selectionEnd, value } = input;
                        if (
                          selectionStart === selectionEnd &&
                          selectionStart !== null &&
                          selectionStart > 1
                        ) {
                          const charBeforeCursor = value[selectionStart - 1];
                          if (charBeforeCursor === "-") {
                            e.preventDefault();
                            const before = value.slice(0, selectionStart - 2);
                            const after = value.slice(selectionStart);
                            const nextRaw = before + after;
                            const formatted = formatPhoneNumber(nextRaw);
                            field.onChange(formatted);
                            requestAnimationFrame(() => {
                              const newCursorPos = Math.max(0, selectionStart - 2);
                              input.setSelectionRange(newCursorPos, newCursorPos);
                            });
                          }
                        }
                      }
                    }}
                    aria-invalid={Boolean(emergencyErrors?.contactPhone)}
                    aria-describedby={
                      emergencyErrors?.contactPhone
                        ? "contactPhone-error"
                        : "contactPhone-hint"
                    }
                    className="min-h-[44px] h-11 text-base touch-target tabular-nums"
                  />
                )}
              />
              <p id="contactPhone-hint" className="text-xs text-muted-foreground">
                เบอร์โทรศัพท์ที่สามารถติดต่อได้ทันที 24 ชม.
              </p>
              <FieldError
                id="contactPhone-error"
                error={emergencyErrors?.contactPhone?.message}
              />
            </div>
          </div>

          {/* Relationship */}
          <div className="space-y-2.5 pt-1">
            <Label htmlFor="relationship" className="text-sm font-medium">
              Relationship / ความสัมพันธ์
              <OptionalBadge />
            </Label>
            <Input
              id="relationship"
              type="text"
              maxLength={50}
              placeholder="e.g. มารดา (Mother), คู่สมรส (Spouse), บุตร (Child)"
              aria-invalid={Boolean(emergencyErrors?.relationship)}
              aria-describedby={
                emergencyErrors?.relationship
                  ? "relationship-error"
                  : "relationship-hint"
              }
              className="min-h-[44px] h-11 text-base touch-target"
              {...register("emergency.relationship")}
            />

            {/* Quick Relationship Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground mr-1">Quick Select:</span>
              {COMMON_RELATIONSHIPS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => form.setValue("emergency.relationship", item.value, { shouldValidate: true })}
                  className="inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-full text-xs font-medium bg-muted hover:bg-primary/15 hover:text-primary transition-colors cursor-pointer border border-border/60"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p id="relationship-hint" className="text-xs text-muted-foreground">
              ระบุความสัมพันธ์กับผู้ป่วย หรือคลิกเลือกจากตัวเลือกด่วนด้านบน
            </p>
            <FieldError
              id="relationship-error"
              error={emergencyErrors?.relationship?.message}
            />
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: Pre-Submission Review Summary Cards                 */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 px-1">
          <HeartHandshake className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Review Registration Summary / ตรวจสอบข้อมูลก่อนยืนยัน
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Personal Details Summary */}
          <Card className="shadow-2xs border-border/70 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/40 border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <User className="size-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-bold text-foreground">
                  Personal Details (ข้อมูลส่วนตัว)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(1)}
                className="h-8 px-2.5 text-xs text-primary font-medium hover:bg-primary/10 touch-target min-h-[36px] cursor-pointer"
                aria-label="Edit personal details in step 1"
              >
                <Edit3 className="size-3.5 mr-1" aria-hidden="true" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground font-medium">Full Name / ชื่อ-นามสกุล:</span>
                <span className="font-semibold text-foreground text-right">
                  {fullName || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground font-medium">Date of Birth / ว/ด/ป เกิด:</span>
                <span className="font-medium text-foreground text-right tabular-nums">
                  {personal?.dateOfBirth || "—"}
                  {calculatedAge !== null ? ` (${calculatedAge} years)` : ""}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground font-medium">Gender / เพศสภาพ:</span>
                <span className="font-medium text-foreground text-right">
                  {personal?.gender ? GENDER_LABELS[personal.gender] || personal.gender : "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground font-medium">Language / ภาษา:</span>
                <span className="font-medium text-foreground text-right">
                  {personal?.preferredLanguage || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground font-medium">Nationality / สัญชาติ:</span>
                <span className="font-medium text-foreground text-right">
                  {personal?.nationality || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Religion / ศาสนา:</span>
                <span className="font-medium text-foreground text-right">
                  {personal?.religion ? personal.religion : "None / Not specified"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card B: Contact Details Summary */}
          <Card className="shadow-2xs border-border/70 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/40 border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-bold text-foreground">
                  Contact & Address (ข้อมูลติดต่อ)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(2)}
                className="h-8 px-2.5 text-xs text-primary font-medium hover:bg-primary/10 touch-target min-h-[36px] cursor-pointer"
                aria-label="Edit contact and address in step 2"
              >
                <Edit3 className="size-3.5 mr-1" aria-hidden="true" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Phone className="size-3" aria-hidden="true" /> Phone:
                </span>
                <span className="font-mono font-medium text-foreground text-right">
                  {contact?.phoneNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Mail className="size-3" aria-hidden="true" /> Email:
                </span>
                <span className="font-medium text-foreground text-right truncate max-w-[180px] sm:max-w-[220px]">
                  {contact?.email || "—"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden="true" /> Address:
                </span>
                <p className="font-medium text-foreground text-xs leading-relaxed bg-muted/30 p-2 rounded-md border border-border/40">
                  {contact?.address || "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card C: Emergency Contact Summary Preview */}
        <Card className="shadow-2xs border-border/70 overflow-hidden">
          <CardHeader className="pb-3 bg-muted/40 border-b border-border/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-bold text-foreground">
                Emergency Contact Summary (ผู้ติดต่อฉุกเฉิน)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-xs sm:text-sm">
            {emergency?.contactName || emergency?.contactPhone || emergency?.relationship ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Name:</span>
                  <span className="font-semibold text-foreground">
                    {emergency.contactName || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Relationship:</span>
                  <span className="font-medium text-foreground">
                    {emergency.relationship || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Phone:</span>
                  <span className="font-mono font-medium text-foreground">
                    {emergency.contactPhone || "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                None specified (ไม่ได้ระบุผู้ติดต่อฉุกเฉิน — ไม่บังคับ)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Error Alert (if any) */}
      {submissionError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs sm:text-sm font-medium animate-in fade-in-50"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: Navigation Footer & Submission Actions             */}
      {/* ------------------------------------------------------------- */}
      <Card className="border-border/80 shadow-xs">
        <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 p-4 sm:p-5">
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
            className="w-full sm:w-auto min-h-[44px] h-11 px-7 font-bold text-base touch-target group shadow-md cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
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
        </CardFooter>
      </Card>
    </div>
  );
}
