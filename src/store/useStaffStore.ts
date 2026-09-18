import { create } from 'zustand';
import { PatientFormData } from '../lib/schemas';

interface StaffState {
  patientData: PatientFormData | null;
  patientStatus: 'offline' | 'typing' | 'idle' | 'submitted';
  setPatientData: (data: PatientFormData) => void;
  setPatientStatus: (status: StaffState['patientStatus']) => void;
}

export const useStaffStore = create<StaffState>((set) => ({
  patientData: null,
  patientStatus: 'offline',
  setPatientData: (data) => set({ patientData: data }),
  setPatientStatus: (status) => set({ patientStatus: status }),
}));
