import { create } from 'zustand';
import {
  PatientFormData,
  PartialPatientFormData,
  PatientFormStep,
} from '@/lib/schemas';
import {
  PatientPresenceStatus,
  RealtimeConnectionStatus,
} from '@/lib/realtime';

// ============================================================================
// 1. Types & State Interface
// ============================================================================

export interface StaffStateValues {
  patientData: PartialPatientFormData | null;
  lastFieldChanged: string | null;
  lastFieldChangedAt: number | null;
  currentStep: PatientFormStep;
  patientStatus: PatientPresenceStatus;
  connectionStatus: RealtimeConnectionStatus;
  submittedData: PatientFormData | null;
  isSubmitted: boolean;
  submittedAt: string | null;
}

export interface StaffActions {
  updatePatientData: (
    data: PartialPatientFormData,
    lastFieldChanged?: string | null,
    currentStep?: PatientFormStep
  ) => void;
  setPatientStatus: (status: PatientPresenceStatus) => void;
  setConnectionStatus: (status: RealtimeConnectionStatus) => void;
  setSubmittedData: (data: PatientFormData, submittedAt?: string) => void;
  resetStaffState: () => void;
}

export type StaffState = StaffStateValues & StaffActions;

// ============================================================================
// 2. Helpers & Initial State
// ============================================================================

function mergeSection<T extends object>(
  prev?: Partial<T>,
  incoming?: Partial<T>
): Partial<T> | undefined {
  if (!incoming) return prev;
  if (!prev) return { ...incoming };

  const merged = { ...prev };
  let hasChanged = false;

  for (const [key, value] of Object.entries(incoming)) {
    if (value !== undefined && (merged as Record<string, unknown>)[key] !== value) {
      (merged as Record<string, unknown>)[key] = value;
      hasChanged = true;
    }
  }

  return hasChanged ? merged : prev;
}

/**
 * Deeply merges incoming partial form data into existing patient data.
 * Preserves reference equality for unchanged sections to prevent unnecessary re-renders.
 */
export function mergePatientData(
  prev: PartialPatientFormData | null,
  incoming: PartialPatientFormData
): PartialPatientFormData {
  if (!prev) return { ...incoming };

  const personal = mergeSection(prev.personal, incoming.personal);
  const contact = mergeSection(prev.contact, incoming.contact);
  const emergency = mergeSection(prev.emergency, incoming.emergency);

  if (
    personal === prev.personal &&
    contact === prev.contact &&
    emergency === prev.emergency
  ) {
    return prev;
  }

  return {
    ...prev,
    ...(personal !== undefined ? { personal } : {}),
    ...(contact !== undefined ? { contact } : {}),
    ...(emergency !== undefined ? { emergency } : {}),
  };
}

export const initialStaffState: StaffStateValues = {
  patientData: null,
  lastFieldChanged: null,
  lastFieldChangedAt: null,
  currentStep: 1,
  patientStatus: 'offline',
  connectionStatus: 'DISCONNECTED',
  submittedData: null,
  isSubmitted: false,
  submittedAt: null,
};

// ============================================================================
// 3. Zustand Store Definition
// ============================================================================

export const useStaffStore = create<StaffState>((set) => ({
  ...initialStaffState,

  updatePatientData: (data, lastFieldChanged, currentStep) =>
    set((state) => {
      let nextLastFieldChanged = state.lastFieldChanged;
      let nextLastFieldChangedAt = state.lastFieldChangedAt;

      if (lastFieldChanged !== undefined) {
        nextLastFieldChanged = lastFieldChanged;
        nextLastFieldChangedAt = lastFieldChanged ? Date.now() : null;
      }

      return {
        patientData: mergePatientData(state.patientData, data),
        lastFieldChanged: nextLastFieldChanged,
        lastFieldChangedAt: nextLastFieldChangedAt,
        currentStep: currentStep ?? state.currentStep,
      };
    }),

  setPatientStatus: (patientStatus) => set({ patientStatus }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setSubmittedData: (data, submittedAt) =>
    set((state) => ({
      submittedData: data,
      patientData: mergePatientData(state.patientData, data),
      isSubmitted: true,
      submittedAt: submittedAt ?? new Date().toISOString(),
      patientStatus: 'submitted',
    })),

  resetStaffState: () => set(initialStaffState),
}));

// ============================================================================
// 4. Granular Selectors & Helper Hooks (Re-render Prevention)
// ============================================================================

/**
 * Granular hook to select a single field from patient data with strict typing.
 * Prevents re-renders when other unrelated fields or sections are updated.
 */
export function usePatientField<
  Section extends keyof PatientFormData,
  Field extends keyof PatientFormData[Section]
>(
  section: Section,
  field: Field
): PatientFormData[Section][Field] | undefined {
  return useStaffStore((state) => {
    const sectionData = state.patientData?.[section];
    if (!sectionData) return undefined;
    return (sectionData as Partial<PatientFormData[Section]>)[field];
  });
}

export const usePatientStatus = (): PatientPresenceStatus =>
  useStaffStore((state) => state.patientStatus);

export const useConnectionStatus = (): RealtimeConnectionStatus =>
  useStaffStore((state) => state.connectionStatus);

export const useCurrentStep = (): PatientFormStep =>
  useStaffStore((state) => state.currentStep);

export const useLastFieldChanged = (): string | null =>
  useStaffStore((state) => state.lastFieldChanged);

export const useLastFieldChangedAt = (): number | null =>
  useStaffStore((state) => state.lastFieldChangedAt);
