import { useEffect } from 'react';
import { subscribeToPatientRoom } from '@/lib/realtime';
import { useStaffStore } from '@/store/useStaffStore';

// ============================================================================
// 1. Interfaces & Types
// ============================================================================

export interface UseStaffRealtimeOptions {
  patientId?: string;
}

// ============================================================================
// 2. Custom Hook: useStaffRealtime
// ============================================================================

/**
 * Custom hook for Staff Dashboard to listen to real-time patient room events
 * (broadcast keystrokes, presence state, form submissions) and dispatch
 * updates directly into the Zustand `useStaffStore`.
 *
 * Deep module: cleanly encapsulates subscription lifecycle and event routing
 * without acting as an unnecessary middle-man for store reads.
 */
export function useStaffRealtime(options?: UseStaffRealtimeOptions): void {
  const patientId = options?.patientId;

  const updatePatientData = useStaffStore((state) => state.updatePatientData);
  const setPatientStatus = useStaffStore((state) => state.setPatientStatus);
  const setConnectionStatus = useStaffStore((state) => state.setConnectionStatus);
  const setSubmittedData = useStaffStore((state) => state.setSubmittedData);

  useEffect(() => {
    const unsubscribe = subscribeToPatientRoom({
      patientId,
      onFormUpdate: (payload) => {
        updatePatientData(
          payload.formData,
          payload.lastFieldChanged,
          payload.currentStep
        );
      },
      onFormSubmit: (payload) => {
        setSubmittedData(payload.formData, payload.submittedAt);
      },
      onPresenceChange: (presence) => {
        setPatientStatus(presence ? presence.status : 'offline');
        if (presence?.currentStep) {
          useStaffStore.setState({ currentStep: presence.currentStep });
        }
      },
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [
    patientId,
    updatePatientData,
    setPatientStatus,
    setConnectionStatus,
    setSubmittedData,
  ]);
}
