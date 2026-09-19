"use client";

import * as React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPhoneNumber,
  handlePhoneBackspaceKeyDown,
  type PatientFormData,
} from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";


export interface StepContactInfoProps {
  /** React Hook Form instance for PatientFormData */
  form: UseFormReturn<PatientFormData, any, any>;
  /** Callback fired when Step 2 validation passes and user advances to Step 3 */
  onNext: () => void;
  /** Callback fired when user navigates back to Step 1 (no validation required) */
  onBack: () => void;
  /** Optional custom CSS classes */
  className?: string;
}

function RequiredIndicator() {
  return (
    <span className="text-destructive font-semibold ml-0.5" aria-hidden="true">
      *
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

/**
 * StepContactInfo Component
 *
 * Patient intake multi-step wizard - Step 2: Contact Details & Address.
 *
 * Features:
 * - 3 fields aligned with `contactInfoSchema`: Phone Number, Email, Residential Address
 * - Phone number auto-formatting / input masking: Formats Thai mobile (08X-XXX-XXXX),
 *   landline (02-XXX-XXXX), and international numbers (+66...) seamlessly while typing
 * - Smooth backspace and paste handling
 * - Smart validation UX: validates on blur, preventing premature errors during typing
 * - Character count indicator for Address field (max 300 characters)
 * - Accessible healthcare UX: minimum 44x44px touch targets, 16px font preventing iOS Safari auto-zoom
 * - Semantic HTML with ARIA linking (`<Label htmlFor="...">`, `aria-invalid`, `aria-describedby`)
 * - Responsive layout supporting mobile screens down to 320px
 */
export function StepContactInfo({
  form,
  onNext,
  onBack,
  className,
}: StepContactInfoProps) {
  const {
    register,
    control,
    trigger,
    watch,
    formState: { errors },
  } = form;

  const contactErrors = errors.contact;
  const addressValue = watch("contact.address") || "";

  const handleNext = async () => {
    const isValid = await trigger("contact");
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className={cn("w-full bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-xs", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-5 mb-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Phone className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Contact & Address
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            ข้อมูลติดต่อและที่อยู่ปัจจุบัน เพื่อการติดต่อและการส่งเอกสารทางการแพทย์
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Section 1: Phone Number & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Phone Number with Auto-Formatting */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Phone Number / เบอร์โทรศัพท์</span>
              <RequiredIndicator />
            </Label>
            <Controller
              control={control}
              name="contact.phoneNumber"
              render={({ field }) => (
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="e.g. 081-234-5678 or +66 81 234 5678"
                    value={field.value || ""}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                    onBlur={field.onBlur}
                    onKeyDown={(e) => handlePhoneBackspaceKeyDown(e, field.onChange)}
                    aria-invalid={Boolean(contactErrors?.phoneNumber)}
                    aria-describedby={
                      contactErrors?.phoneNumber
                        ? "phoneNumber-error"
                        : "phoneNumber-hint"
                    }
                    className="min-h-[44px] h-11 text-base touch-target tabular-nums"
                  />
                </div>
              )}
            />
            <p id="phoneNumber-hint" className="text-xs text-muted-foreground">
              รองรับเบอร์มือถือไทย 10 หลัก (08X-XXX-XXXX) หรือเบอร์สากล (+66...)
            </p>
            <FieldError
              id="phoneNumber-error"
              error={contactErrors?.phoneNumber?.message}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Email / อีเมล</span>
              <RequiredIndicator />
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="e.g. somchai.j@example.com"
              autoComplete="email"
              aria-invalid={Boolean(contactErrors?.email)}
              aria-describedby={
                contactErrors?.email ? "email-error" : "email-hint"
              }
              className="min-h-[44px] h-11 text-base touch-target"
              {...register("contact.email")}
            />
            <p id="email-hint" className="text-xs text-muted-foreground">
              สำหรับรับเอกสารรับรองแพทย์หรือผลตรวจทางอิเล็กทรอนิกส์
            </p>
            <FieldError
              id="email-error"
              error={contactErrors?.email?.message}
            />
          </div>
        </div>

        {/* Section 2: Residential Address */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Current Residential Address / ที่อยู่ปัจจุบัน</span>
              <RequiredIndicator />
            </Label>
            <span
              className={cn(
                "text-xs tabular-nums transition-colors",
                addressValue.length > 280
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground"
              )}
              aria-live="polite"
            >
              {addressValue.length}/300
            </span>
          </div>

          <Textarea
            id="address"
            rows={3}
            maxLength={300}
            placeholder="e.g. 123/45 หมู่บ้านสุขสบาย ซอย 5 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
            autoComplete="street-address"
            aria-invalid={Boolean(contactErrors?.address)}
            aria-describedby={
              contactErrors?.address ? "address-error" : "address-hint"
            }
            className="min-h-[100px] text-base touch-target leading-relaxed"
            {...register("contact.address")}
          />
          <p id="address-hint" className="text-xs text-muted-foreground">
            ระบุเลขที่บ้าน หมู่ ซอย ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด และรหัสไปรษณีย์
          </p>
          <FieldError
            id="address-error"
            error={contactErrors?.address?.message}
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full sm:w-auto min-h-[44px] h-11 px-5 font-medium text-base touch-target cursor-pointer hover:bg-muted"
        >
          <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
          <span>Back: Personal Details</span>
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto min-h-[44px] h-11 px-6 font-semibold text-base touch-target group shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <span>Next: Emergency & Review</span>
          <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
