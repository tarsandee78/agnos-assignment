import { useEffect, useRef } from 'react';
import { broadcastFormUpdate, trackPatientPresence } from '@/lib/realtime';
import { PartialPatientFormData, PatientFormStep } from '@/lib/schemas';

interface UsePatientRealtimeProps {
  formData: PartialPatientFormData;
  currentStep: PatientFormStep;
  isSubmitted: boolean;
}

export function usePatientRealtime({
  formData,
  currentStep,
  isSubmitted,
}: UsePatientRealtimeProps) {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const prevFormDataRef = useRef<string>('');

  useEffect(() => {
    if (isSubmitted) {
      trackPatientPresence('submitted', { currentStep });
      return;
    }

    const currentFormDataString = JSON.stringify(formData);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevFormDataRef.current = currentFormDataString;
      trackPatientPresence('idle', { currentStep });
      return;
    }

    if (prevFormDataRef.current === currentFormDataString) {
      // Data didn't change, no need to broadcast or reset typing timeout
      return;
    }

    prevFormDataRef.current = currentFormDataString;

    trackPatientPresence('typing', { currentStep });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      trackPatientPresence('idle', { currentStep });
    }, 5000);

    if (broadcastTimeoutRef.current) {
      clearTimeout(broadcastTimeoutRef.current);
    }
    broadcastTimeoutRef.current = setTimeout(() => {
      broadcastFormUpdate(formData, { currentStep });
    }, 100);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
    };
  }, [formData, currentStep, isSubmitted]);
}
