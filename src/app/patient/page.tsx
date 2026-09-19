"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  patientFormSchema,
  defaultPatientFormData,
  type PatientFormData,
  type PatientFormStep,
} from "@/lib/schemas";
import {
  usePatientDraft,
  mergeDraftWithDefault,
} from "@/hooks/usePatientDraft";
import { usePatientRealtime } from "@/hooks/usePatientRealtime";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { PatientStepper } from "@/components/patient/PatientStepper";
import { StepPersonalInfo } from "@/components/patient/StepPersonalInfo";
import { StepContactInfo } from "@/components/patient/StepContactInfo";
import { StepEmergencyReview } from "@/components/patient/StepEmergencyReview";
import { SubmissionSuccessDialog } from "@/components/patient/SubmissionSuccessDialog";
import { CheckCircle2, Cloud, HeartPulse } from "lucide-react";

export default function PatientPage() {
  const { lang, setLang, t } = useLanguage("agnos_lang_patient", "th");
  const [currentStep, setCurrentStep] = React.useState<PatientFormStep>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionErrorKey, setSubmissionErrorKey] = React.useState<keyof typeof t.errors | null>(null);
  const submissionErrorMessage = submissionErrorKey ? t.errors[submissionErrorKey] : null;
  const [isSuccessOpen, setIsSuccessOpen] = React.useState(false);
  const [submittedData, setSubmittedData] = React.useState<PatientFormData | null>(null);
  const [submittedAt, setSubmittedAt] = React.useState<string | null>(null);
  const [referenceId, setReferenceId] = React.useState<string>("");

  const form = useForm<PatientFormData>({
    mode: "onBlur",
    resolver: zodResolver(patientFormSchema) as any,
    defaultValues: defaultPatientFormData,
  });

  const { reset, watch, getValues, trigger } = form;
  const watchedFormData = watch();

  // Auto-save draft hook
  const { draft, isLoaded, isSaving, lastSavedAt, clearDraft } = usePatientDraft({
    formData: watchedFormData,
    currentStep,
  });

  // Real-time broadcast and presence sync
  const { handleSubmission, resetRealtimeState } = usePatientRealtime({
    form,
    currentStep,
  });

  // Restore saved draft on mount
  React.useEffect(() => {
    if (isLoaded && draft?.formData) {
      reset(mergeDraftWithDefault(draft.formData));
      if (draft.currentStep) {
        setCurrentStep(draft.currentStep);
      }
    }
  }, [isLoaded, reset]);

  // Stepper navigation with validation guard
  const handleStepClick = async (targetStep: PatientFormStep) => {
    if (targetStep === currentStep) return;
    // Allow stepping back to previous completed steps freely
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    // Advancing forward requires validation of previous steps
    if (currentStep === 1) {
      const isPersonalValid = await trigger("personal");
      if (!isPersonalValid) return;
      if (targetStep === 2) {
        setCurrentStep(2);
      } else if (targetStep === 3) {
        const isContactValid = await trigger("contact");
        if (isContactValid) {
          setCurrentStep(3);
        }
      }
    } else if (currentStep === 2) {
      if (targetStep === 3) {
        const isContactValid = await trigger("contact");
        if (isContactValid) {
          setCurrentStep(3);
        }
      }
    }
  };

  // Final Form Submission handler
  const handleSubmit = async () => {
    setSubmissionErrorKey(null);
    setIsSubmitting(true);

    try {
      // Validate all fields across all steps
      const isFormValid = await trigger();
      if (!isFormValid) {
        const currentErrors = form.formState.errors;
        if (currentErrors.personal) {
          setSubmissionErrorKey("step1");
        } else if (currentErrors.contact) {
          setSubmissionErrorKey("step2");
        } else if (currentErrors.emergency) {
          setSubmissionErrorKey("emergency");
        } else {
          setSubmissionErrorKey("general");
        }
        setIsSubmitting(false);
        return;
      }

      const currentValues = getValues();
      const nowIso = new Date().toISOString();
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const generatedRefId = `AGN-${datePart}-${randPart}`;

      // 1. Broadcast submission event to Realtime & update presence
      await handleSubmission(currentValues, nowIso);

      // 2. Clear auto-saved draft so user isn't stuck with completed intake on reload
      clearDraft();

      // 3. Update local state & trigger confirmation modal
      setSubmittedData(currentValues);
      setSubmittedAt(nowIso);
      setReferenceId(generatedRefId);
      setIsSuccessOpen(true);
    } catch (err) {
      console.error("[PatientPage] Submission failed:", err);
      setSubmissionErrorKey("unexpected");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset and prepare fresh registration for another patient
  const handleResetAndNew = () => {
    setIsSuccessOpen(false);
    clearDraft();
    resetRealtimeState();
    reset(defaultPatientFormData);
    setCurrentStep(1);
    setSubmittedData(null);
    setSubmittedAt(null);
    setReferenceId("");
    setSubmissionErrorKey(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Brand & Status Navigation */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/80 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">
                {t.nav.brand}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t.nav.patientTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <LanguageToggle
              currentLang={lang}
              onLanguageChange={setLang}
            />

            {/* Auto-save Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border/50">
              {isSaving ? (
                <>
                  <Cloud className="size-3.5 animate-pulse text-primary" />
                  <span>{t.common.saveDraft}</span>
                </>
              ) : lastSavedAt ? (
                <>
                  <CheckCircle2 className="size-3.5 text-success" />
                  <span>{t.common.draftSaved}</span>
                </>
              ) : (
                <span>{t.common.ready}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stepper Wizard Progress */}
      <div className="max-w-4xl w-full mx-auto px-2 sm:px-4 pt-4">
        <PatientStepper
          currentStep={currentStep}
          onStepClick={handleStepClick}
          lang={lang}
          t={t}
        />
      </div>

      {/* Main Form Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-6">
        {currentStep === 1 && (
          <StepPersonalInfo
            form={form}
            onNext={() => setCurrentStep(2)}
            lang={lang}
            t={t}
          />
        )}

        {currentStep === 2 && (
          <StepContactInfo
            form={form}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            lang={lang}
            t={t}
          />
        )}

        {currentStep === 3 && (
          <StepEmergencyReview
            form={form}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(2)}
            onEditStep={(step) => setCurrentStep(step)}
            isSubmitting={isSubmitting}
            submissionError={submissionErrorMessage}
            lang={lang}
            t={t}
          />
        )}
      </main>

      {/* Submission Success Dialog */}
      <SubmissionSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        data={submittedData}
        referenceId={referenceId}
        submittedAt={submittedAt || undefined}
        onResetAndNew={handleResetAndNew}
        lang={lang}
        t={t}
      />
    </div>
  );
}
