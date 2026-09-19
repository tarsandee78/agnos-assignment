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
  type PatientFormData,
  type PatientFormStep,
} from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { type Language, type TranslationDictionary } from "@/lib/i18n/translations";

export interface StepEmergencyReviewProps {
  form: UseFormReturn<PatientFormData, any, any>;
  onSubmit: () => Promise<void> | void;
  onBack: () => void;
  onEditStep: (step: PatientFormStep) => void;
  isSubmitting?: boolean;
  submissionError?: string | null;
  className?: string;
  lang?: Language;
  t?: TranslationDictionary;
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
  editLabel = "Edit",
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onEdit?: () => void;
  editLabel?: string;
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
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium py-1 px-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Edit3 className="size-3" aria-hidden="true" />
            <span>{editLabel}</span>
          </button>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <dt className="text-muted-foreground text-[11px] font-medium">{item.label}</dt>
            <dd className="font-medium text-foreground truncate mt-0.5">
              {item.value || <span className="text-muted-foreground/60 italic">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * StepEmergencyReview Component
 *
 * Patient intake multi-step wizard - Step 3: Emergency Contact & Final Review.
 *
 * Features:
 * - Single-language UI driven by i18n dictionary (clean TH/EN)
 * - Uniform label container heights ensuring input alignment
 * - Accessible healthcare UX: 44x44px touch targets
 * - Summary sections with direct edit jump-back links
 */
export function StepEmergencyReview({
  form,
  onSubmit,
  onBack,
  onEditStep,
  isSubmitting = false,
  submissionError = null,
  className,
  t: propT,
}: StepEmergencyReviewProps) {
  const defaultHook = useLanguage("agnos_lang_patient", "th");
  const t = propT || defaultHook.t;

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
    { label: t.personal.fullName, value: fullName },
    { label: t.personal.dateOfBirth, value: personal?.dateOfBirth },
    {
      label: t.personal.gender,
      value: personal?.gender
        ? t.personal.genderOptions[personal.gender as keyof typeof t.personal.genderOptions] || personal.gender
        : null,
    },
    {
      label: t.personal.preferredLanguage,
      value: personal?.preferredLanguage
        ? t.personal.languageOptions[personal.preferredLanguage as keyof typeof t.personal.languageOptions] || personal.preferredLanguage
        : null,
    },
    { label: t.personal.nationality, value: personal?.nationality },
    {
      label: t.personal.religion,
      value: personal?.religion
        ? t.personal.religionOptions[personal.religion as keyof typeof t.personal.religionOptions] || personal.religion
        : t.personal.religionOptions.None,
    },
  ];

  const contactSummary: SummaryItem[] = [
    { label: t.contact.phoneNumber, value: contact?.phoneNumber },
    { label: t.contact.email, value: contact?.email },
    { label: t.contact.address, value: contact?.address },
  ];

  const hasEmergency = Boolean(
    emergency?.contactName || emergency?.contactPhone || emergency?.relationship
  );

  const emergencySummary: SummaryItem[] = hasEmergency
    ? [
        { label: t.emergency.contactName, value: emergency?.contactName },
        { label: t.emergency.relationship, value: emergency?.relationship },
        { label: t.emergency.emergencyPhone, value: emergency?.contactPhone },
      ]
    : [{ label: t.steps.step3Title, value: t.emergency.notProvided }];

  return (
    <div className={cn("w-full bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-xs space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            {t.steps.step3Title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.steps.step3Desc}
          </p>
        </div>
      </div>

      {/* SECTION 1: Emergency Contact Input Fields (Optional) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {t.emergency.sectionTitle}
          </h3>
          <span className="text-xs text-muted-foreground">{t.common.optional}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contact Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between min-h-[26px]">
              <Label htmlFor="contactName" className="text-sm font-medium">
                {t.emergency.contactName}
              </Label>
            </div>
            <Input
              id="contactName"
              type="text"
              maxLength={100}
              placeholder={t.emergency.contactNamePlaceholder}
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
            <div className="flex items-center justify-between min-h-[26px]">
              <Label htmlFor="contactPhone" className="text-sm font-medium">
                {t.emergency.emergencyPhone}
              </Label>
            </div>
            <Controller
              control={control}
              name="emergency.contactPhone"
              render={({ field }) => (
                <Input
                  id="contactPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t.emergency.emergencyPhonePlaceholder}
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
          <div className="flex items-center justify-between min-h-[26px]">
            <Label htmlFor="relationship" className="text-sm font-medium">
              {t.emergency.relationship}
            </Label>
          </div>
          <Input
            id="relationship"
            type="text"
            maxLength={50}
            placeholder={t.emergency.relationshipPlaceholder}
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
            {t.review.reviewTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.review.reviewDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummarySection
            title={t.steps.step1Title}
            icon={User}
            onEdit={() => onEditStep(1)}
            editLabel={t.common.edit}
            items={personalSummary}
          />
          <SummarySection
            title={t.steps.step2Title}
            icon={Phone}
            onEdit={() => onEditStep(2)}
            editLabel={t.common.edit}
            items={contactSummary}
          />
        </div>

        <SummarySection
          title={t.steps.step3Title}
          icon={ShieldAlert}
          editLabel={t.common.edit}
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
          <span>{t.common.back}: {t.steps.step2Title}</span>
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
              <span>{t.common.submitting}</span>
            </>
          ) : (
            <>
              <Send className="size-4 mr-2 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              <span>{t.common.submit}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
