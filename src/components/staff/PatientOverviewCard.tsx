'use client';

import React from 'react';
import { useStaffStore } from '@/store/useStaffStore';
import { FieldDisplay } from './FieldDisplay';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  User,
  Phone,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Circle,
  Radio,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Heart,
  Sparkles,
} from 'lucide-react';
import { GENDER_OPTIONS } from '@/lib/schemas';

// ============================================================================
// 1. Interfaces & Types (Small Interface - Matt Pocock)
// ============================================================================

export interface PatientOverviewCardsProps {
  className?: string;
}

// ============================================================================
// 2. Helper Functions (Surgical & Pure)
// ============================================================================

const GENDER_LABEL_MAP: Record<string, string> = {
  male: 'Male (ชาย)',
  female: 'Female (หญิง)',
  other: 'Other (อื่นๆ)',
  prefer_not_to_say: 'Prefer not to say (ไม่ระบุ)',
};

/**
 * Calculates current age from a YYYY-MM-DD date of birth string.
 */
function calculateAge(dateOfBirth?: string): string | null {
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

interface CompletenessInfo {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getCompleteness(filledCount: number, totalRequired: number, isOptional = false): CompletenessInfo {
  if (filledCount === totalRequired) {
    return {
      label: isOptional ? `Provided (${filledCount}/${totalRequired})` : `Completed (${filledCount}/${totalRequired})`,
      badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      icon: CheckCircle2,
    };
  }

  if (filledCount > 0) {
    return {
      label: `In Progress (${filledCount}/${totalRequired})`,
      badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
      icon: Clock,
    };
  }

  if (isOptional) {
    return {
      label: 'Not specified (Optional)',
      badgeClass: 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
      icon: Circle,
    };
  }

  return {
    label: `Pending (0/${totalRequired})`,
    badgeClass: 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
    icon: Circle,
  };
}

// ============================================================================
// 3. Step 1: Personal Details Card (Deep Module)
// ============================================================================

export function PersonalDetailsCard({ className }: { className?: string }) {
  const personal = useStaffStore((state) => state.patientData?.personal);
  const currentStep = useStaffStore((state) => state.currentStep);
  const isActiveStep = currentStep === 1;

  // 6 required fields: firstName, lastName, dateOfBirth, gender, preferredLanguage, nationality
  const requiredValues = [
    personal?.firstName,
    personal?.lastName,
    personal?.dateOfBirth,
    personal?.gender,
    personal?.preferredLanguage,
    personal?.nationality,
  ];
  const filledCount = requiredValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 6);
  const CompletenessIcon = completeness.icon;
  const ageLabel = calculateAge(personal?.dateOfBirth);

  const formattedGender = personal?.gender
    ? GENDER_LABEL_MAP[personal.gender] || personal.gender
    : null;

  return (
    <Card
      className={cn(
        'transition-all duration-300 flex flex-col',
        isActiveStep && 'ring-2 ring-primary/40 border-primary/40 shadow-sm',
        className
      )}
    >
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <User className="size-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-base font-bold">
                  1. Personal Details
                </CardTitle>
                {isActiveStep && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] gap-1 border-primary/40 text-primary bg-primary/5 font-semibold">
                    <Radio className="size-2.5 animate-pulse text-primary" />
                    <span>Active</span>
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                ข้อมูลส่วนตัวและอัตลักษณ์
              </CardDescription>
            </div>
          </div>

          {/* Completeness Badge */}
          <Badge
            variant="outline"
            className={cn('text-xs gap-1 py-0.5 px-2 font-medium shrink-0', completeness.badgeClass)}
          >
            <CompletenessIcon className="size-3 shrink-0" />
            <span>{completeness.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-4 flex-1">
        {/* Name Fields: First, Middle, Last */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FieldDisplay
            label="First Name / ชื่อจริง"
            value={personal?.firstName}
            fieldName="personal.firstName"
          />
          <FieldDisplay
            label="Middle Name / ชื่อกลาง"
            value={personal?.middleName}
            fieldName="personal.middleName"
          />
          <FieldDisplay
            label="Last Name / นามสกุล"
            value={personal?.lastName}
            fieldName="personal.lastName"
          />
        </div>

        {/* Date of Birth & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FieldDisplay
            label="Date of Birth / วันเกิด"
            value={personal?.dateOfBirth}
            fieldName="personal.dateOfBirth"
            subValue={ageLabel}
            icon={Calendar}
          />
          <FieldDisplay
            label="Gender / เพศสภาพ"
            value={formattedGender}
            fieldName="personal.gender"
          />
        </div>

        {/* Language, Nationality, Religion */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FieldDisplay
            label="Preferred Language / ภาษา"
            value={personal?.preferredLanguage}
            fieldName="personal.preferredLanguage"
            icon={Globe}
          />
          <FieldDisplay
            label="Nationality / สัญชาติ"
            value={personal?.nationality}
            fieldName="personal.nationality"
          />
          <FieldDisplay
            label="Religion / ศาสนา"
            value={personal?.religion || (personal?.firstName ? 'None / Not specified' : null)}
            fieldName="personal.religion"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 4. Step 2: Contact Information Card (Deep Module)
// ============================================================================

export function ContactDetailsCard({ className }: { className?: string }) {
  const contact = useStaffStore((state) => state.patientData?.contact);
  const currentStep = useStaffStore((state) => state.currentStep);
  const isActiveStep = currentStep === 2;

  // 3 required fields: phoneNumber, email, address
  const requiredValues = [contact?.phoneNumber, contact?.email, contact?.address];
  const filledCount = requiredValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 3);
  const CompletenessIcon = completeness.icon;

  const phoneTelHref = contact?.phoneNumber
    ? `tel:${contact.phoneNumber.replace(/[^\d+]/g, '')}`
    : undefined;
  const emailHref = contact?.email ? `mailto:${contact.email}` : undefined;

  return (
    <Card
      className={cn(
        'transition-all duration-300 flex flex-col',
        isActiveStep && 'ring-2 ring-primary/40 border-primary/40 shadow-sm',
        className
      )}
    >
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Phone className="size-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-base font-bold">
                  2. Contact & Address
                </CardTitle>
                {isActiveStep && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] gap-1 border-primary/40 text-primary bg-primary/5 font-semibold">
                    <Radio className="size-2.5 animate-pulse text-primary" />
                    <span>Active</span>
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                ช่องทางติดต่อและที่อยู่ปัจจุบัน
              </CardDescription>
            </div>
          </div>

          {/* Completeness Badge */}
          <Badge
            variant="outline"
            className={cn('text-xs gap-1 py-0.5 px-2 font-medium shrink-0', completeness.badgeClass)}
          >
            <CompletenessIcon className="size-3 shrink-0" />
            <span>{completeness.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-4 flex-1">
        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FieldDisplay
            label="Phone Number / เบอร์โทรศัพท์"
            value={contact?.phoneNumber}
            fieldName="contact.phoneNumber"
            mono
            href={phoneTelHref}
            icon={Phone}
          />
          <FieldDisplay
            label="Email Address / อีเมล"
            value={contact?.email}
            fieldName="contact.email"
            href={emailHref}
            icon={Mail}
          />
        </div>

        {/* Residential Address */}
        <FieldDisplay
          label="Residential Address / ที่อยู่ปัจจุบัน"
          value={contact?.address}
          fieldName="contact.address"
          icon={MapPin}
          className="min-h-[72px]"
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 5. Step 3: Emergency Contact Card (Deep Module)
// ============================================================================

export function EmergencyContactCard({ className }: { className?: string }) {
  const emergency = useStaffStore((state) => state.patientData?.emergency);
  const currentStep = useStaffStore((state) => state.currentStep);
  const isActiveStep = currentStep === 3;

  // Optional 3 fields: contactName, relationship, contactPhone
  const optionalValues = [
    emergency?.contactName,
    emergency?.relationship,
    emergency?.contactPhone,
  ];
  const filledCount = optionalValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 3, true);
  const CompletenessIcon = completeness.icon;

  const emergencyPhoneHref = emergency?.contactPhone
    ? `tel:${emergency.contactPhone.replace(/[^\d+]/g, '')}`
    : undefined;

  return (
    <Card
      className={cn(
        'transition-all duration-300 flex flex-col',
        isActiveStep && 'ring-2 ring-primary/40 border-primary/40 shadow-sm',
        className
      )}
    >
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldAlert className="size-4" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-base font-bold">
                  3. Emergency Contact
                </CardTitle>
                {isActiveStep && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] gap-1 border-primary/40 text-primary bg-primary/5 font-semibold">
                    <Radio className="size-2.5 animate-pulse text-primary" />
                    <span>Active</span>
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                ผู้ติดต่อฉุกเฉิน (ไม่บังคับ)
              </CardDescription>
            </div>
          </div>

          {/* Completeness Badge */}
          <Badge
            variant="outline"
            className={cn('text-xs gap-1 py-0.5 px-2 font-medium shrink-0', completeness.badgeClass)}
          >
            <CompletenessIcon className="size-3 shrink-0" />
            <span>{completeness.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-4 flex-1">
        {/* Contact Name & Relationship */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FieldDisplay
            label="Contact Name / ผู้ติดต่อ"
            value={emergency?.contactName}
            fieldName="emergency.contactName"
            icon={User}
          />
          <FieldDisplay
            label="Relationship / ความสัมพันธ์"
            value={emergency?.relationship}
            fieldName="emergency.relationship"
            icon={Heart}
          />
        </div>

        {/* Emergency Phone */}
        <FieldDisplay
          label="Emergency Phone / เบอร์โทรฉุกเฉิน"
          value={emergency?.contactPhone}
          fieldName="emergency.contactPhone"
          mono
          href={emergencyPhoneHref}
          icon={Phone}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 6. Main PatientOverviewCards Component
// ============================================================================

/**
 * High-Density Patient Intake Mirroring Cards Container.
 *
 * Provides a responsive 3-step grid displaying real-time patient intake progress:
 * - Step 1: Personal Details (names, DOB, age, gender, language, nationality, religion)
 * - Step 2: Contact Information (phone, email, residential address)
 * - Step 3: Emergency Contact (name, relationship, phone)
 *
 * Each card features dynamic step indicators, live typing highlight integration,
 * and section completeness badges.
 */
export function PatientOverviewCards({ className }: PatientOverviewCardsProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3', className)}>
      <PersonalDetailsCard />
      <ContactDetailsCard />
      <EmergencyContactCard />
    </div>
  );
}
