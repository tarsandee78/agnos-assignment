import { z } from 'zod';

/**
 * Regular expressions for phone number validation:
 * - Thai mobile (06, 08, 09 followed by 8 digits: e.g. 081-234-5678, 0812345678)
 * - Thai landline (02-05, 07 followed by 7-8 digits: e.g. 02-123-4567)
 * - Thai country code (+66 followed by 8-9 digits: e.g. +66 81 234 5678)
 * - International E.164 format (+[1-9] followed by 7-14 digits)
 */
export const THAI_PHONE_REGEX = /^(?:0[689]\d{8}|0[2-57]\d{7,8}|\+66[2-9]\d{7,8})$/;
export const INTL_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

export function isValidPhoneNumber(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const cleaned = val.replace(/[-\s()]/g, '');
  return THAI_PHONE_REGEX.test(cleaned) || INTL_PHONE_REGEX.test(cleaned);
}

/**
 * Validates date of birth:
 * 1. Must match YYYY-MM-DD format
 * 2. Must be a real calendar date (handles leap years, days per month)
 * 3. Cannot be in the future
 * 4. Must not be unreasonably old (> 130 years)
 */
export function isValidDateOfBirth(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;

  const [yearStr, monthStr, dayStr] = val.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return false;

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 130);
  if (date < minDate) return false;

  return true;
}

// -------------------------------------------------------------
// Options & Enumerations
// -------------------------------------------------------------

export const genderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
  message: 'Please select a gender',
});

export type Gender = z.infer<typeof genderEnum>;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const PREFERRED_LANGUAGE_OPTIONS = [
  { value: 'Thai', label: 'Thai (ไทย)' },
  { value: 'English', label: 'English' },
  { value: 'Chinese', label: 'Chinese (中文)' },
  { value: 'Japanese', label: 'Japanese (日本語)' },
  { value: 'Other', label: 'Other' },
] as const;

export const COMMON_RELIGION_OPTIONS = [
  'Buddhism',
  'Christianity',
  'Islam',
  'Hinduism',
  'Sikhism',
  'None',
  'Other',
] as const;

// -------------------------------------------------------------
// Step 1: Personal Details Schema
// -------------------------------------------------------------

export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  middleName: z
    .string()
    .trim()
    .max(50, 'Middle name must not exceed 50 characters')
    .optional()
    .default(''),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      isValidDateOfBirth,
      'Please enter a valid date of birth (cannot be in the future)'
    ),
  gender: genderEnum,
  preferredLanguage: z
    .string()
    .trim()
    .min(1, 'Preferred language is required'),
  nationality: z
    .string()
    .trim()
    .min(1, 'Nationality is required'),
  religion: z
    .string()
    .trim()
    .max(50, 'Religion must not exceed 50 characters')
    .optional()
    .default(''),
});

// -------------------------------------------------------------
// Step 2: Contact Details Schema
// -------------------------------------------------------------

export const contactInfoSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .refine(
      isValidPhoneNumber,
      'Please enter a valid phone number (e.g. 081-234-5678 or +66...)'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(300, 'Address must not exceed 300 characters'),
});

// -------------------------------------------------------------
// Step 3: Emergency Contact Schema (Optional)
// -------------------------------------------------------------

export const emergencyContactSchema = z.object({
  contactName: z
    .string()
    .trim()
    .max(100, 'Contact name must not exceed 100 characters')
    .optional()
    .default(''),
  relationship: z
    .string()
    .trim()
    .max(50, 'Relationship must not exceed 50 characters')
    .optional()
    .default(''),
  contactPhone: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine(
      (val) => !val || isValidPhoneNumber(val),
      'Please enter a valid emergency contact phone number (e.g. 081-234-5678)'
    ),
});

// -------------------------------------------------------------
// Complete Patient Form Schema
// -------------------------------------------------------------

export const patientFormSchema = z.object({
  personal: personalInfoSchema,
  contact: contactInfoSchema,
  emergency: emergencyContactSchema.default({
    contactName: '',
    relationship: '',
    contactPhone: '',
  }),
});

// -------------------------------------------------------------
// TypeScript Types & Sub-types
// -------------------------------------------------------------

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type PersonalDetails = PersonalInfo;

export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type ContactDetails = ContactInfo;

export type EmergencyContactInfo = z.infer<typeof emergencyContactSchema>;
export type EmergencyContactDetails = EmergencyContactInfo;

export type PatientFormData = z.infer<typeof patientFormSchema>;

// Recursive deep partial helper for real-time keystroke broadcasts and drafts
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PartialPatientFormData = DeepPartial<PatientFormData>;

export type PatientFormStep = 1 | 2 | 3;

// -------------------------------------------------------------
// Default Initial Values
// -------------------------------------------------------------

export const defaultPatientFormData: PatientFormData = {
  personal: {
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    preferredLanguage: 'Thai',
    nationality: 'Thai',
    religion: '',
  },
  contact: {
    phoneNumber: '',
    email: '',
    address: '',
  },
  emergency: {
    contactName: '',
    relationship: '',
    contactPhone: '',
  },
};

