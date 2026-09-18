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
import type { PatientFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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

/**
 * Formats raw phone number input into standard readable representations:
 * - Thai mobile (10 digits): 08X-XXX-XXXX
 * - Bangkok landline (9 digits): 02-XXX-XXXX
 * - International starting with '+': preserves '+' and spaces e.g. +66 81 234 5678
 */
export function formatPhoneNumber(val: string): string {
  if (!val) return "";

  const trimmed = val.trim();

  // 1. International numbers starting with '+'
  if (trimmed.startsWith("+")) {
    const digitsOnly = trimmed.slice(1).replace(/\D/g, "");

    // Thailand international prefix: +66
    if (digitsOnly.startsWith("66")) {
      const thaiDigits = digitsOnly.slice(2);
      if (thaiDigits.length === 0) return "+66";
      // Landline 02 format under +66: +66 2 XXX XXXX (up to 8 digits)
      if (thaiDigits.startsWith("2")) {
        if (thaiDigits.length <= 1) return `+66 ${thaiDigits}`;
        if (thaiDigits.length <= 4)
          return `+66 ${thaiDigits.slice(0, 1)} ${thaiDigits.slice(1)}`;
        return `+66 ${thaiDigits.slice(0, 1)} ${thaiDigits.slice(1, 4)} ${thaiDigits.slice(4, 8)}`;
      }
      // Mobile format under +66: +66 XX XXX XXXX (up to 9 digits)
      if (thaiDigits.length <= 2) return `+66 ${thaiDigits}`;
      if (thaiDigits.length <= 5)
        return `+66 ${thaiDigits.slice(0, 2)} ${thaiDigits.slice(2)}`;
      return `+66 ${thaiDigits.slice(0, 2)} ${thaiDigits.slice(2, 5)} ${thaiDigits.slice(5, 9)}`;
    }

    // Generic international format (E.164: up to 15 digits)
    const limitedDigits = digitsOnly.slice(0, 15);
    if (limitedDigits.length <= 3) return `+${limitedDigits}`;
    if (limitedDigits.length <= 6)
      return `+${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3)}`;
    if (limitedDigits.length <= 10)
      return `+${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
    return `+${limitedDigits.slice(0, 3)} ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6, 10)} ${limitedDigits.slice(10)}`;
  }

  // 2. Domestic numbers (starting with 0 or local digits)
  const digits = val.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";

  // Bangkok landline (02): 9 digits (02-XXX-XXXX)
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
  }

  // Standard Thai mobile (06, 08, 09) and provincial landlines (10 digits: 08X-XXX-XXXX)
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
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
    <Card className={cn("w-full shadow-xs border-border/80", className)}>
      {/* Header */}
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Phone className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
              Contact & Address
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              ข้อมูลติดต่อและที่อยู่ปัจจุบัน เพื่อการติดต่อและการส่งเอกสารทางการแพทย์
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Form Content */}
      <CardContent className="space-y-6 pt-6">
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
                    onKeyDown={(e) => {
                      // Smooth backspace handling across separators ('-' or ' ')
                      if (e.key === "Backspace") {
                        const input = e.currentTarget;
                        const { selectionStart, selectionEnd, value } = input;
                        if (
                          selectionStart === selectionEnd &&
                          selectionStart !== null &&
                          selectionStart > 0
                        ) {
                          const charBeforeCursor = value[selectionStart - 1];
                          if (charBeforeCursor === "-" || charBeforeCursor === " ") {
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
              maxLength={100}
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
      </CardContent>

      {/* Navigation Footer */}
      <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full sm:w-auto min-h-[44px] h-11 px-5 font-medium text-base touch-target cursor-pointer hover:bg-muted"
        >
          <ArrowLeft className="size-4 mr-2" aria-hidden="true" />
          <span>Back: Personal Details</span>
        </Button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto min-h-[44px] h-11 px-6 font-medium text-base touch-target group shadow-sm cursor-pointer"
          >
            <span>Next: Emergency Contact</span>
            <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
