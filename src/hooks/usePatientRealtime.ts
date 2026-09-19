import { useEffect, useRef, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { PatientFormData, PatientFormStep } from "@/lib/schemas";
import { broadcastFormUpdate, trackPatientPresence, broadcastFormSubmit } from "@/lib/realtime";

interface UsePatientRealtimeProps {
  form: UseFormReturn<PatientFormData>;
  currentStep: PatientFormStep;
}

export function usePatientRealtime({
  form,
  currentStep,
}: UsePatientRealtimeProps) {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStepRef = useRef(currentStep);
  const isSubmittedRef = useRef(false);

  // Keep ref sync without effect overhead
  currentStepRef.current = currentStep;

  const clearTimeouts = () => {
    if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const setIdle = useCallback(() => {
    if (!isSubmittedRef.current) {
      trackPatientPresence("idle", { currentStep: currentStepRef.current });
    }
  }, []);

  useEffect(() => {
    // Initial presence
    setIdle();

    const handleActivity = () => {
      if (isSubmittedRef.current) return;
      trackPatientPresence("typing", { currentStep: currentStepRef.current });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(setIdle, 5000);
    };

    window.addEventListener("focusin", handleActivity);
    window.addEventListener("keydown", handleActivity);

    const subscription = form.watch((value, { name }) => {
      if (isSubmittedRef.current) return;
      handleActivity();

      if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
      broadcastTimeoutRef.current = setTimeout(() => {
        broadcastFormUpdate(value as Partial<PatientFormData>, {
          lastFieldChanged: name,
          currentStep: currentStepRef.current,
        });
      }, 100);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focusin", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearTimeouts();
      // Clean up on unmount (Presence leave / offline)
      if (!isSubmittedRef.current) {
        trackPatientPresence("offline", { currentStep: currentStepRef.current });
      }
    };
  }, [form, setIdle]);

  const handleSubmission = useCallback(async (data: PatientFormData, submittedAt: string) => {
    isSubmittedRef.current = true;
    clearTimeouts();
    await broadcastFormSubmit(data, { submittedAt });
    await trackPatientPresence("submitted", { currentStep: currentStepRef.current });
  }, []);

  return { handleSubmission };
}
