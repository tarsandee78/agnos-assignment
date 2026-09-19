import { useEffect } from 'react';
import {
  subscribeToPatientRoom,
  RealtimeConnectionStatus,
  PatientPresenceStatus,
} from '@/lib/realtime';
import {
  PartialPatientFormData,
  PatientFormData,
  PatientFormStep,
} from '@/lib/schemas';
import { useStaffStore } from '@/store/useStaffStore';

// ============================================================================
// 1. Interfaces & Types
// ============================================================================

export interface UseStaffRealtimeOptions {
  patientId?: string;
  autoConnect?: boolean;
}

export interface UseStaffRealtimeReturn {
  patientData: PartialPatientFormData | null;
  lastFieldChanged: string | null;
  lastFieldChangedAt: number | null;
  currentStep: PatientFormStep;
  patientStatus: PatientPresenceStatus;
  connectionStatus: RealtimeConnectionStatus;
  submittedData: PatientFormData | null;
  isSubmitted: boolean;
  submittedAt: string | null;
  resetStaffState: () => void;
}

// ============================================================================
// 2. Custom Hook: useStaffRealtime
// ============================================================================

/**
 * Custom hook for Staff Dashboard to listen to real-time patient room events
 * (broadcast keystrokes, presence state, form submissions) and dispatch
 * updates directly into the Zustand `useStaffStore`.
 */
export function useStaffRealtime(
  options?: UseStaffRealtimeOptions
): UseStaffRealtimeReturn {
  // Store actions
  const updatePatientData = useStaffStore((state) => state.updatePatientData);
  const setPatientStatus = useStaffStore((state) => state.setPatientStatus);
  const setConnectionStatus = useStaffStore((state) => state.setConnectionStatus);
  const setSubmittedData = useStaffStore((state) => state.setSubmittedData);
  const resetStaffState = useStaffStore((state) => state.resetStaffState);

  // Store state values for caller ergonomics
  const patientData = useStaffStore((state) => state.patientData);
  const lastFieldChanged = useStaffStore((state) => state.lastFieldChanged);
  const lastFieldChangedAt = useStaffStore((state) => state.lastFieldChangedAt);
  const currentStep = useStaffStore((state) => state.currentStep);
  const patientStatus = useStaffStore((state) => state.patientStatus);
  const connectionStatus = useStaffStore((state) => state.connectionStatus);
  const submittedData = useStaffStore((state) => state.submittedData);
  const isSubmitted = useStaffStore((state) => state.isSubmitted);
  const submittedAt = useStaffStore((state) => state.submittedAt);

  const patientId = options?.patientId;
  const autoConnect = options?.autoConnect ?? true;

  useEffect(() => {
    if (!autoConnect) return;

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
          updatePatientData({}, undefined, presence.currentStep);
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
    autoConnect,
    updatePatientData,
    setPatientStatus,
    setConnectionStatus,
    setSubmittedData,
  ]);

  return {
    patientData,
    lastFieldChanged,
    lastFieldChangedAt,
    currentStep,
    patientStatus,
    connectionStatus,
    submittedData,
    isSubmitted,
    submittedAt,
    resetStaffState,
  };
}
