'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PatientFormData,
  PartialPatientFormData,
  PatientFormStep,
  defaultPatientFormData,
} from '@/lib/schemas';

// ============================================================================
// 1. Constants & Types
// ============================================================================

export const PATIENT_DRAFT_STORAGE_KEY = 'agnos_patient_form_draft';
const DEBOUNCE_MS = 500;

export interface PatientDraft {
  formData: PartialPatientFormData;
  currentStep: PatientFormStep;
  updatedAt: number;
}

export interface UsePatientDraftOptions {
  /**
   * The active form data to auto-save.
   * If provided, changes trigger a debounced save to localStorage.
   */
  formData?: PartialPatientFormData;
  /**
   * The active step in the multi-step form (1, 2, or 3). Defaults to 1.
   */
  currentStep?: PatientFormStep;
}

export interface UsePatientDraftReturn {
  /**
   * The restored draft loaded from localStorage, or null if no draft exists.
   */
  draft: PatientDraft | null;
  /**
   * True once the initial client-side localStorage check has completed.
   * Prevents hydration mismatch during SSR.
   */
  isLoaded: boolean;
  /**
   * True if a valid draft was found in localStorage.
   */
  hasExistingDraft: boolean;
  /**
   * True while a debounced auto-save is pending.
   */
  isSaving: boolean;
  /**
   * Timestamp of the last successful save to localStorage.
   */
  lastSavedAt: number | null;
  /**
   * Synchronously saves the draft to localStorage without waiting for debounce.
   */
  saveDraftImmediate: (
    dataToSave?: PartialPatientFormData,
    stepToSave?: PatientFormStep
  ) => boolean;
  /**
   * Clears the draft from localStorage and resets internal draft state.
   */
  clearDraft: () => boolean;
  /**
   * Manually re-reads the draft from localStorage.
   */
  restoreDraft: () => PatientDraft | null;
}

// ============================================================================
// 2. Pure Storage Helpers (Safe for SSR and Private Browsing)
// ============================================================================

/**
 * Safely reads and validates patient draft from localStorage.
 * Returns null if on server, no draft exists, or storage is corrupted/inaccessible.
 */
export function loadPatientDraft(): PatientDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(PATIENT_DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed) ||
      !parsed.formData ||
      typeof parsed.formData !== 'object' ||
      Array.isArray(parsed.formData)
    ) {
      return null;
    }

    const step = parsed.currentStep;
    const currentStep: PatientFormStep =
      step === 1 || step === 2 || step === 3 ? step : 1;

    // Structural hygiene: extract known form sections
    const rawForm = parsed.formData as Record<string, unknown>;
    const sanitizedForm: PartialPatientFormData = {};

    if (rawForm.personal && typeof rawForm.personal === 'object' && !Array.isArray(rawForm.personal)) {
      sanitizedForm.personal = rawForm.personal as PartialPatientFormData['personal'];
    }
    if (rawForm.contact && typeof rawForm.contact === 'object' && !Array.isArray(rawForm.contact)) {
      sanitizedForm.contact = rawForm.contact as PartialPatientFormData['contact'];
    }
    if (rawForm.emergency && typeof rawForm.emergency === 'object' && !Array.isArray(rawForm.emergency)) {
      sanitizedForm.emergency = rawForm.emergency as PartialPatientFormData['emergency'];
    }

    return {
      formData: sanitizedForm,
      currentStep,
      updatedAt:
        typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch (error) {
    console.warn('[usePatientDraft] Failed to load draft from localStorage:', error);
    return null;
  }
}

/**
 * Safely writes patient draft to localStorage.
 * Handles QuotaExceededError and private browsing restrictions gracefully.
 */
export function savePatientDraft(draft: PatientDraft): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(PATIENT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.warn('[usePatientDraft] Failed to save draft to localStorage:', error);
    return false;
  }
}

/**
 * Safely removes patient draft from localStorage.
 */
export function clearPatientDraft(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.removeItem(PATIENT_DRAFT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('[usePatientDraft] Failed to clear draft from localStorage:', error);
    return false;
  }
}

/**
 * Merges a partial draft with the full default patient form structure.
 * Useful for passing to React Hook Form's reset() or defaultValues.
 */
export function mergeDraftWithDefault(
  draft?: PartialPatientFormData | null,
  base: PatientFormData = defaultPatientFormData
): PatientFormData {
  if (!draft) return { ...base };

  return {
    personal: {
      ...base.personal,
      ...(draft.personal || {}),
    },
    contact: {
      ...base.contact,
      ...(draft.contact || {}),
    },
    emergency: {
      ...base.emergency,
      ...(draft.emergency || {}),
    },
  };
}

// ============================================================================
// 3. React Hook Implementation
// ============================================================================

/**
 * Hook for managing local draft persistence with debounce, safe SSR hydration,
 * and automatic flush on page unload.
 */
export function usePatientDraft({
  formData,
  currentStep = 1,
}: UsePatientDraftOptions = {}): UsePatientDraftReturn {
  const [draft, setDraft] = useState<PatientDraft | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isClearedRef = useRef(false);
  const isInitialMount = useRef(true);
  const prevSerializedRef = useRef<string | null>(null);

  // Keep latest options in ref to avoid recreating callbacks
  const latestRef = useRef({ formData, currentStep });
  latestRef.current = { formData, currentStep };

  // Write draft to storage and sync React state
  const persistDraft = useCallback(
    (targetData?: PartialPatientFormData, targetStep?: PatientFormStep): boolean => {
      const data = targetData ?? latestRef.current.formData ?? {};
      const step = targetStep ?? latestRef.current.currentStep;

      const updatedDraft: PatientDraft = {
        formData: data,
        currentStep: step,
        updatedAt: Date.now(),
      };

      const success = savePatientDraft(updatedDraft);
      if (success) {
        setDraft(updatedDraft);
        isClearedRef.current = false;
        prevSerializedRef.current = JSON.stringify({
          formData: data,
          currentStep: step,
        });
      }
      setIsSaving(false);
      return success;
    },
    []
  );

  // 1. Initial hydration / load on mount (SSR safe)
  useEffect(() => {
    const saved = loadPatientDraft();
    if (saved) {
      setDraft(saved);
      prevSerializedRef.current = JSON.stringify({
        formData: saved.formData,
        currentStep: saved.currentStep,
      });
    }
    setIsLoaded(true);
  }, []);

  // 2. Clear draft (prevents resurrection upon subsequent re-renders)
  const clearDraft = useCallback((): boolean => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    isClearedRef.current = true;
    setIsSaving(false);
    const success = clearPatientDraft();
    setDraft(null);
    prevSerializedRef.current = null;
    return success;
  }, []);

  // 3. Immediate save
  const saveDraftImmediate = useCallback(
    (
      dataToSave?: PartialPatientFormData,
      stepToSave?: PatientFormStep
    ): boolean => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      return persistDraft(dataToSave, stepToSave);
    },
    [persistDraft]
  );

  // 4. Manually re-read draft
  const restoreDraft = useCallback((): PatientDraft | null => {
    const saved = loadPatientDraft();
    setDraft(saved);
    if (saved) {
      isClearedRef.current = false;
      prevSerializedRef.current = JSON.stringify({
        formData: saved.formData,
        currentStep: saved.currentStep,
      });
    }
    return saved;
  }, []);

  // 5. Debounced auto-save on form or step changes
  useEffect(() => {
    if (!isLoaded || isClearedRef.current || (!formData && !currentStep)) {
      return;
    }

    const currentSerialized = JSON.stringify({
      formData: formData ?? {},
      currentStep,
    });

    // Skip saving on initial mount to avoid overwriting saved draft with blank form
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!prevSerializedRef.current) {
        prevSerializedRef.current = currentSerialized;
      }
      return;
    }

    // Skip if form data and step have not changed
    if (prevSerializedRef.current === currentSerialized) {
      return;
    }

    prevSerializedRef.current = currentSerialized;
    setIsSaving(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      persistDraft(formData, currentStep);
      debounceTimerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, currentStep, isLoaded, persistDraft]);

  // 6. Flush pending auto-save immediately before page unload
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      if (
        !isClearedRef.current &&
        debounceTimerRef.current &&
        latestRef.current.formData
      ) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        persistDraft();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [persistDraft]);

  return {
    draft,
    isLoaded,
    hasExistingDraft: Boolean(draft),
    isSaving,
    lastSavedAt: draft?.updatedAt ?? null,
    saveDraftImmediate,
    clearDraft,
    restoreDraft,
  };
}
