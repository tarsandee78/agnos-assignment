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
import { PatientStepper } from "@/components/patient/PatientStepper";
import { StepPersonalInfo } from "@/components/patient/StepPersonalInfo";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Cloud, ArrowLeft, HeartPulse } from "lucide-react";

export default function PatientPage() {
  const [currentStep, setCurrentStep] = React.useState<PatientFormStep>(1);

  const form = useForm<PatientFormData>({
    mode: "onBlur",
    resolver: zodResolver(patientFormSchema) as any,
    defaultValues: defaultPatientFormData,
  });

  const { reset, watch } = form;
  const watchedFormData = watch();

  // Auto-save draft hook
  const { draft, isLoaded, isSaving, lastSavedAt } = usePatientDraft({
    formData: watchedFormData,
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Brand & Status Navigation */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/80 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <HeartPulse className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">
                Agnos Health
              </h1>
              <p className="text-xs text-muted-foreground">
                Patient Intake Registration / แบบฟอร์มลงทะเบียนผู้ป่วย
              </p>
            </div>
          </div>

          {/* Auto-save Status Badge */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border/50">
            {isSaving ? (
              <>
                <Cloud className="size-3.5 animate-pulse text-primary" />
                <span className="hidden sm:inline">Saving draft...</span>
              </>
            ) : lastSavedAt ? (
              <>
                <CheckCircle2 className="size-3.5 text-success" />
                <span className="hidden sm:inline">Draft saved locally</span>
              </>
            ) : (
              <span>Ready</span>
            )}
          </div>
        </div>
      </header>

      {/* Stepper Wizard Progress */}
      <div className="max-w-4xl w-full mx-auto px-2 sm:px-4 pt-4">
        <PatientStepper
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />
      </div>

      {/* Main Form Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-6">
        {currentStep === 1 && (
          <StepPersonalInfo
            form={form}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Step 2: Contact Details & Address (ข้อมูลติดต่อและที่อยู่)
              </CardTitle>
              <CardDescription>
                Next component in roadmap (Issue #12)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-muted-foreground text-sm">
                Phone Number, Email, and Residential Address will be implemented in Step 2.
              </p>
              <div className="pt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="min-h-[44px] h-11 px-5"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Personal Details
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="min-h-[44px] h-11 px-5"
                >
                  Skip to Step 3 Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Step 3: Emergency Contact & Confirmation (ข้อมูลติดต่อฉุกเฉิน)
              </CardTitle>
              <CardDescription>
                Next component in roadmap (Issue #13)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-8 text-center">
              <p className="text-muted-foreground text-sm">
                Emergency contact details and final confirmation summary.
              </p>
              <div className="pt-4 flex justify-start items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="min-h-[44px] h-11 px-5"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Contact Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
