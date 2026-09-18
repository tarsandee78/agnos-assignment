"use client";

import * as React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { AlertCircle, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GENDER_OPTIONS,
  PREFERRED_LANGUAGE_OPTIONS,
  COMMON_RELIGION_OPTIONS,
  type PatientFormData,
} from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioCard } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export interface StepPersonalInfoProps {
  /** React Hook Form instance for PatientFormData */
  form: UseFormReturn<PatientFormData, any, any>;
  /** Callback fired when Step 1 validation passes and user advances to Step 2 */
  onNext: () => void;
  /** Optional custom CSS classes */
  className?: string;
}


const GENDER_DESCRIPTIONS: Record<string, string> = {
  male: "ชาย",
  female: "หญิง",
  other: "อื่นๆ",
  prefer_not_to_say: "ไม่ประสงค์ระบุ",
};

const RELIGION_SELECT_OPTIONS = [
  { value: "none", label: "None / Not specified (ไม่ระบุ)" },
  ...COMMON_RELIGION_OPTIONS.filter((r) => r !== "None").map((r) => ({
    value: r,
    label: r,
  })),
];

function RequiredIndicator() {
  return (
    <span className="text-destructive font-semibold ml-0.5" aria-hidden="true">
      *
    </span>
  );
}

function OptionalBadge() {
  return (
    <span className="text-xs text-muted-foreground font-normal ml-1">
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

/**
 * StepPersonalInfo Component
 *
 * Patient intake multi-step wizard - Step 1: Personal Details.
 *
 * Features:
 * - 8 fields aligned with `personalInfoSchema`: First/Middle/Last Name, DOB, Gender, Language, Nationality, Religion
 * - Smart validation UX: validates on blur, preventing intrusive premature errors during typing
 * - Accessible healthcare UX: minimum 44x44px touch targets on all interactive controls (inputs, selects, buttons)
 * - Semantic HTML with ARIA linking (`<Label htmlFor="...">`, `aria-invalid`, `aria-describedby`)
 * - Responsive layout supporting viewports down to 320px
 * - Local-timezone-aware maximum date calculation for date of birth
 */
export function StepPersonalInfo({
  form,
  onNext,
  className,
}: StepPersonalInfoProps) {
  const {
    register,
    control,
    trigger,
    formState: { errors },
  } = form;

  const personalErrors = errors.personal;

  // Local-calendar date calculation (YYYY-MM-DD) avoiding UTC skew in Asian timezones
  const todayString = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const handleNext = async () => {
    const isValid = await trigger("personal");
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
            <User className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
              Personal Details
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              ข้อมูลส่วนตัวของผู้เข้ารับบริการ กรุณากรอกข้อมูลให้ครบถ้วน
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Form Content */}
      <CardContent className="space-y-6 pt-6">
        {/* Section 1: Names (First / Middle / Last) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name / ชื่อจริง <RequiredIndicator />
            </Label>
            <Input
              id="firstName"
              type="text"
              maxLength={50}
              placeholder="e.g. สมชาย / Somchai"
              autoComplete="given-name"
              aria-invalid={Boolean(personalErrors?.firstName)}
              aria-describedby={
                personalErrors?.firstName ? "firstName-error" : undefined
              }
              className="min-h-[44px] h-11 text-base touch-target"
              {...register("personal.firstName")}
            />
            <FieldError
              id="firstName-error"
              error={personalErrors?.firstName?.message}
            />
          </div>

          {/* Middle Name */}
          <div className="space-y-2">
            <Label htmlFor="middleName" className="text-sm font-medium">
              Middle Name / ชื่อกลาง <OptionalBadge />
            </Label>
            <Input
              id="middleName"
              type="text"
              maxLength={50}
              placeholder="Optional"
              autoComplete="additional-name"
              aria-invalid={Boolean(personalErrors?.middleName)}
              aria-describedby={
                personalErrors?.middleName ? "middleName-error" : undefined
              }
              className="min-h-[44px] h-11 text-base touch-target"
              {...register("personal.middleName")}
            />
            <FieldError
              id="middleName-error"
              error={personalErrors?.middleName?.message}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name / นามสกุล <RequiredIndicator />
            </Label>
            <Input
              id="lastName"
              type="text"
              maxLength={50}
              placeholder="e.g. ใจดี / Jaidee"
              autoComplete="family-name"
              aria-invalid={Boolean(personalErrors?.lastName)}
              aria-describedby={
                personalErrors?.lastName ? "lastName-error" : undefined
              }
              className="min-h-[44px] h-11 text-base touch-target"
              {...register("personal.lastName")}
            />
            <FieldError
              id="lastName-error"
              error={personalErrors?.lastName?.message}
            />
          </div>
        </div>

        {/* Section 2: Date of Birth & Gender */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Date of Birth */}
          <div className="lg:col-span-5 space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of Birth / วันเดือนปีเกิด <RequiredIndicator />
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              max={todayString}
              autoComplete="bday"
              aria-invalid={Boolean(personalErrors?.dateOfBirth)}
              aria-describedby={
                personalErrors?.dateOfBirth ? "dateOfBirth-error" : undefined
              }
              className="min-h-[44px] h-11 text-base touch-target"
              {...register("personal.dateOfBirth")}
            />
            <FieldError
              id="dateOfBirth-error"
              error={personalErrors?.dateOfBirth?.message}
            />
          </div>

          {/* Gender (Radio Cards) */}
          <div className="lg:col-span-7 space-y-2">
            <fieldset
              className="space-y-2"
              aria-invalid={Boolean(personalErrors?.gender)}
              aria-describedby={
                personalErrors?.gender ? "gender-error" : undefined
              }
            >
              <legend className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                Gender / เพศสภาพ <RequiredIndicator />
              </legend>

              <Controller
                control={control}
                name="personal.gender"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      field.onBlur();
                    }}
                    aria-invalid={Boolean(personalErrors?.gender)}
                    aria-describedby={
                      personalErrors?.gender ? "gender-error" : undefined
                    }
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <RadioCard
                        key={opt.value}
                        value={opt.value}
                        title={opt.label}
                        description={GENDER_DESCRIPTIONS[opt.value]}
                        className="min-h-[52px] py-2.5 px-3 touch-target"
                      />
                    ))}
                  </RadioGroup>
                )}
              />

              <FieldError
                id="gender-error"
                error={personalErrors?.gender?.message}
              />
            </fieldset>
          </div>
        </div>

        {/* Section 3: Preferred Language, Nationality, Religion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {/* Preferred Language */}
          <div className="space-y-2">
            <Label htmlFor="preferredLanguage" className="text-sm font-medium">
              Preferred Language / ภาษาที่สะดวก <RequiredIndicator />
            </Label>
            <Controller
              control={control}
              name="personal.preferredLanguage"
              render={({ field }) => (
                <Select
                  items={PREFERRED_LANGUAGE_OPTIONS}
                  value={field.value}
                  onValueChange={(val) => {
                    if (val) {
                      field.onChange(val);
                      field.onBlur();
                    }
                  }}
                >
                  <SelectTrigger
                    id="preferredLanguage"
                    aria-invalid={Boolean(personalErrors?.preferredLanguage)}
                    aria-describedby={
                      personalErrors?.preferredLanguage
                        ? "preferredLanguage-error"
                        : undefined
                    }
                    className="min-h-[44px] h-11 text-base touch-target"
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREFERRED_LANGUAGE_OPTIONS.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError
              id="preferredLanguage-error"
              error={personalErrors?.preferredLanguage?.message}
            />
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-sm font-medium">
              Nationality / สัญชาติ <RequiredIndicator />
            </Label>
            <Input
              id="nationality"
              type="text"
              maxLength={50}
              defaultValue="Thai"
              placeholder="e.g. Thai"
              autoComplete="country-name"
              aria-invalid={Boolean(personalErrors?.nationality)}
              aria-describedby={
                personalErrors?.nationality ? "nationality-error" : undefined
              }
              className="min-h-[44px] h-11 text-base touch-target"
              {...register("personal.nationality")}
            />
            <FieldError
              id="nationality-error"
              error={personalErrors?.nationality?.message}
            />
          </div>

          {/* Religion */}
          <div className="space-y-2">
            <Label htmlFor="religion" className="text-sm font-medium">
              Religion / ศาสนา <OptionalBadge />
            </Label>
            <Controller
              control={control}
              name="personal.religion"
              render={({ field }) => {
                const selectValue = field.value || "none";
                return (
                  <Select
                    items={RELIGION_SELECT_OPTIONS}
                    value={selectValue}
                    onValueChange={(val) => {
                      if (val) {
                        field.onChange(val === "none" ? "" : val);
                        field.onBlur();
                      }
                    }}
                  >
                    <SelectTrigger
                      id="religion"
                      aria-invalid={Boolean(personalErrors?.religion)}
                      aria-describedby={
                        personalErrors?.religion ? "religion-error" : undefined
                      }
                      className="min-h-[44px] h-11 text-base touch-target"
                    >
                      <SelectValue placeholder="Select religion (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGION_SELECT_OPTIONS.map((rel) => (
                        <SelectItem key={rel.value} value={rel.value}>
                          {rel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            <FieldError
              id="religion-error"
              error={personalErrors?.religion?.message}
            />
          </div>
        </div>
      </CardContent>

      {/* Navigation Footer */}
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border/60">
        <p className="text-xs text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
          Fields marked with <span className="text-destructive font-bold">*</span> are required for registration
        </p>
        <Button
          type="button"
          onClick={handleNext}
          className="order-1 sm:order-2 w-full sm:w-auto min-h-[44px] h-11 px-6 font-medium text-base touch-target group shadow-sm cursor-pointer"
        >
          <span>Next: Contact Details</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  );
}
