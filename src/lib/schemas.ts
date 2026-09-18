import { z } from 'zod';

export const patientFormSchema = z.object({
  personal: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    idNumber: z.string().min(13, 'Invalid ID number').max(13),
  }),
  contact: z.object({
    phone: z.string().min(10, 'Invalid phone number'),
  }),
  emergency: z.object({
    contactName: z.string().min(1, 'Emergency contact name is required'),
    contactPhone: z.string().min(10, 'Invalid phone number'),
  }),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;
