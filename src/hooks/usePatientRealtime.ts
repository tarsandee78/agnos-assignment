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
  const prevFormDataStr = useRef<string>('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    // If form is submitted, update presence and stop broadcasting
    if (isSubmitted) {
      trackPatientPresence('submitted', { currentStep });
      return;
    }

    const currentDataStr = JSON.stringify(formData);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevFormDataStr.current = currentDataStr;
      trackPatientPresence('idle', { currentStep });
      return;
    }

    // Only proceed if form data actually changed
    if (prevFormDataStr.current === currentDataStr) {
      return;
    }
    
    prevFormDataStr.current = currentDataStr;

    // Data changed: user is typing
    trackPatientPresence('typing', { currentStep });

    // Set a timeout to revert to idle after 5 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      trackPatientPresence('idle', { currentStep });
    }, 5000);

    // Debounce broadcasting the actual data by 100ms
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
