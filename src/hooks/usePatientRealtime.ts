import { useEffect, useRef, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { PatientFormData, PatientFormStep } from "@/lib/schemas";
import {
  broadcastFormUpdate,
  trackPatientPresence,
  broadcastFormSubmit,
  PatientPresenceStatus,
} from "@/lib/realtime";

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
  const currentStatusRef = useRef<PatientPresenceStatus>("idle");

  // Keep step ref in sync without effect re-run overhead
  currentStepRef.current = currentStep;

  const clearTimeouts = useCallback(() => {
    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current);
      broadcastTimeoutRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  const setIdle = useCallback(() => {
    if (!isSubmittedRef.current) {
      currentStatusRef.current = "idle";
      trackPatientPresence("idle", { currentStep: currentStepRef.current });
    }
  }, []);

  // Update presence whenever step changes
  useEffect(() => {
    if (!isSubmittedRef.current) {
      currentStatusRef.current = "idle";
      trackPatientPresence("idle", { currentStep });
    }
  }, [currentStep]);

  // Subscribe to form keystrokes with 100ms debounce and efficient presence state transitions
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (isSubmittedRef.current) return;

      // 1. Transition to 'typing' presence (only network dispatch on state transition)
      if (currentStatusRef.current !== "typing") {
        currentStatusRef.current = "typing";
        trackPatientPresence("typing", {
          currentStep: currentStepRef.current,
        });
      }

      // Reset 5-second inactivity timer on every keystroke
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(setIdle, 5000);

      // 2. Debounce form update broadcast by 100ms
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
      clearTimeouts();
    };
  }, [form, setIdle, clearTimeouts]);

  // Coordinate form submission broadcast and presence transition
  const handleSubmission = useCallback(
    async (data?: PatientFormData, submittedAt?: string) => {
      isSubmittedRef.current = true;
      currentStatusRef.current = "submitted";
      clearTimeouts();

      const finalData = data || form.getValues();
      const finalTimestamp = submittedAt || new Date().toISOString();

      await broadcastFormSubmit(finalData, { submittedAt: finalTimestamp });
      await trackPatientPresence("submitted", {
        currentStep: currentStepRef.current,
      });
    },
    [form, clearTimeouts]
  );

  // Reset realtime state for fresh intake registration
  const resetRealtimeState = useCallback(() => {
    isSubmittedRef.current = false;
    currentStatusRef.current = "idle";
    clearTimeouts();
    trackPatientPresence("idle", { currentStep: 1 });
  }, [clearTimeouts]);

  return {
    handleSubmission,
    resetRealtimeState,
  };
}
