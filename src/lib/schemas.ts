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
 * Formats raw phone number input into standard readable representations:
 * - Thai mobile (10 digits): 08X-XXX-XXXX
 * - Bangkok landline (9 digits): 02-XXX-XXXX
 * - Thailand international prefix (+66): +66 8X XXX XXXX or +66 2 XXX XXXX
 * - Generic international (+...): preserves '+' and standard formatting up to 15 digits
 */
export function formatPhoneNumber(val: string): string {
  if (!val) return '';

  const trimmed = val.trim();

  // 1. International numbers starting with '+'
  if (trimmed.startsWith('+')) {
    const digitsOnly = trimmed.slice(1).replace(/\D/g, '');

    // Thailand international prefix: +66
    if (digitsOnly.startsWith('66')) {
      let thaiDigits = digitsOnly.slice(2);
      // Strip redundant leading zero if entered (e.g. +660812345678 -> 812345678)
      if (thaiDigits.startsWith('0')) {
        thaiDigits = thaiDigits.slice(1);
      }
      if (thaiDigits.length === 0) return '+66';

      // Bangkok landline (starts with 2): +66 2 XXX XXXX (8 digits total)
      if (thaiDigits.startsWith('2')) {
        if (thaiDigits.length <= 1) return `+66 ${thaiDigits}`;
        if (thaiDigits.length <= 4)
          return `+66 ${thaiDigits.slice(0, 1)} ${thaiDigits.slice(1)}`;
        return `+66 ${thaiDigits.slice(0, 1)} ${thaiDigits.slice(1, 4)} ${thaiDigits.slice(4, 8)}`;
      }

      // Mobile / provincial (e.g. 8X XXX XXXX - 9 digits total)
      if (thaiDigits.length <= 2) return `+66 ${thaiDigits}`;
      if (thaiDigits.length <= 5)
        return `+66 ${thaiDigits.slice(0, 2)} ${thaiDigits.slice(2)}`;
      return `+66 ${thaiDigits.slice(0, 2)} ${thaiDigits.slice(2, 5)} ${thaiDigits.slice(5, 9)}`;
    }

    // Generic international format (E.164: preserve '+' and digits up to 15 chars cleanly)
    const cleaned = trimmed.replace(/[^\d+\s-]/g, '').slice(0, 20);
    return cleaned;
  }

  // 2. Domestic numbers (starting with 0 or local digits)
  const digits = val.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';

  // Bangkok landline (02): 9 digits (02-XXX-XXXX)
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
  }

  // Standard Thai mobile (06, 08, 09) and provincial landlines (10 digits: 08X-XXX-XXXX)
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
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

export const GENDER_DISPLAY_MAP: Record<Gender, string> = {
  male: 'Male / ชาย',
  female: 'Female / หญิง',
  other: 'Other / อื่นๆ',
  prefer_not_to_say: 'Not specified / ไม่ประสงค์ระบุ',
};

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

/**
 * Helper to construct readable patient full name.
 */
export function getPatientFullName(
  personal?: Partial<PersonalInfo> | null
): string {
  if (!personal) return '';
  return [personal.firstName, personal.middleName, personal.lastName]
    .filter(Boolean)
    .join(' ');
}

/**
 * Shared input keydown handler for phone number fields with hyphen formatting.
 * Enables smooth backspace across hyphen delimiters.
 */
export function handlePhoneBackspaceKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  onChange: (val: string) => void
): void {
  if (e.key === 'Backspace') {
    const input = e.currentTarget;
    const { selectionStart, selectionEnd, value } = input;
    if (
      selectionStart === selectionEnd &&
      selectionStart !== null &&
      selectionStart > 1
    ) {
      const charBeforeCursor = value[selectionStart - 1];
      if (charBeforeCursor === '-') {
        e.preventDefault();
        const before = value.slice(0, selectionStart - 2);
        const after = value.slice(selectionStart);
        const nextRaw = before + after;
        const formatted = formatPhoneNumber(nextRaw);
        onChange(formatted);
        requestAnimationFrame(() => {
          const newCursorPos = Math.max(0, selectionStart - 2);
          input.setSelectionRange(newCursorPos, newCursorPos);
        });
      }
    }
  }
}

/**
 * Calculates current age from a YYYY-MM-DD date of birth string.
 */
export function calculatePatientAge(dateOfBirth?: string | null): string | null {
  if (!dateOfBirth) return null;
  const parts = dateOfBirth.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }

  return age >= 0 && age <= 130 ? `${age} yrs old` : null;
}

