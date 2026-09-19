'use client';

import React from 'react';
import { useStaffStore, useCurrentStep } from '@/store/useStaffStore';
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
} from 'lucide-react';
import {
  formatPhoneNumber,
  getPatientFullName,
  calculatePatientAge,
  type Gender,
} from '@/lib/schemas';

// ============================================================================
// 1. Interfaces & Configurations
// ============================================================================

export interface PatientOverviewCardsProps {
  className?: string;
}

const GENDER_LABEL_MAP: Record<Gender, string> = {
  male: 'Male (ชาย)',
  female: 'Female (หญิง)',
  other: 'Other (อื่นๆ)',
  prefer_not_to_say: 'Prefer not to say (ไม่ระบุ)',
};

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
// 2. Shared Step Card Header (Eliminates Duplicated Code)
// ============================================================================

interface StepCardHeaderProps {
  stepNumber: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  completeness: CompletenessInfo;
}

function StepCardHeader({
  stepNumber,
  title,
  subtitle,
  icon: Icon,
  isActive,
  completeness,
}: StepCardHeaderProps) {
  const CompletenessIcon = completeness.icon;

  return (
    <CardHeader className="border-b border-border/50 pb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-base font-bold">
                {stepNumber}. {title}
              </CardTitle>
              {isActive && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] gap-1 border-primary/40 text-primary bg-primary/5 font-semibold"
                >
                  <Radio className="size-2.5 animate-pulse text-primary" />
                  <span>Active</span>
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn('text-xs gap-1 py-0.5 px-2 font-medium shrink-0', completeness.badgeClass)}
        >
          <CompletenessIcon className="size-3 shrink-0" />
          <span>{completeness.label}</span>
        </Badge>
      </div>
    </CardHeader>
  );
}

// ============================================================================
// 3. Step 1: Personal Details Card
// ============================================================================

export function PersonalDetailsCard({ className }: { className?: string }) {
  const personal = useStaffStore((state) => state.patientData?.personal);
  const currentStep = useCurrentStep();
  const isActive = currentStep === 1;

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

  const fullName = getPatientFullName(personal);
  const ageLabel = calculatePatientAge(personal?.dateOfBirth);
  const formattedGender = personal?.gender
    ? GENDER_LABEL_MAP[personal.gender] || personal.gender
    : null;

  return (
    <Card
      className={cn(
        'transition-all duration-300 flex flex-col',
        isActive && 'ring-2 ring-primary/40 border-primary/40 shadow-sm',
        className
      )}
    >
      <StepCardHeader
        stepNumber={1}
        title="Personal Details"
        subtitle="ข้อมูลส่วนตัวและอัตลักษณ์"
        icon={User}
        isActive={isActive}
        completeness={completeness}
      />

      <CardContent className="space-y-2.5 pt-4 flex-1">
        {/* Full Name display */}
        <FieldDisplay
          label="Full Name / ชื่อ-นามสกุล"
          value={fullName}
          fieldName="personal.firstName"
          icon={User}
        />

        {/* First, Middle, Last */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <FieldDisplay
            label="First Name / ชื่อจริง"
            section="personal"
            field="firstName"
          />
          <FieldDisplay
            label="Middle Name / ชื่อกลาง"
            section="personal"
            field="middleName"
          />
          <FieldDisplay
            label="Last Name / นามสกุล"
            section="personal"
            field="lastName"
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
            section="personal"
            field="preferredLanguage"
            icon={Globe}
          />
          <FieldDisplay
            label="Nationality / สัญชาติ"
            section="personal"
            field="nationality"
          />
          <FieldDisplay
            label="Religion / ศาสนา"
            section="personal"
            field="religion"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 4. Step 2: Contact Information Card
// ============================================================================

export function ContactDetailsCard({ className }: { className?: string }) {
  const contact = useStaffStore((state) => state.patientData?.contact);
  const currentStep = useCurrentStep();
  const isActive = currentStep === 2;

  const requiredValues = [contact?.phoneNumber, contact?.email, contact?.address];
  const filledCount = requiredValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 3);

  const formattedPhone = contact?.phoneNumber ? formatPhoneNumber(contact.phoneNumber) : null;
  const phoneTelHref = contact?.phoneNumber
    ? `tel:${contact.phoneNumber.replace(/[^\d+]/g, '')}`
    : undefined;
  const emailHref = contact?.email ? `mailto:${contact.email}` : undefined;

  return (
    <Card
      className={cn(
        'transition-all duration-300 flex flex-col',
        isActive && 'ring-2 ring-primary/40 border-primary/40 shadow-sm',
        className
      )}
    >
      <StepCardHeader
        stepNumber={2}
        title="Contact & Address"
        subtitle="ช่องทางติดต่อและที่อยู่ปัจจุบัน"
        icon={Phone}
        isActive={isActive}
        completeness={completeness}
      />

      <CardContent className="space-y-2.5 pt-4 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FieldDisplay
            label="Phone Number / เบอร์โทรศัพท์"
            value={formattedPhone}
            fieldName="contact.phoneNumber"
            mono
            href={phoneTelHref}
            icon={Phone}
          />
          <FieldDisplay
            label="Email Address / อีเมล"
            section="contact"
            field="email"
            href={emailHref}
            icon={Mail}
          />
        </div>

        <FieldDisplay
          label="Residential Address / ที่อยู่ปัจจุบัน"
          section="contact"
          field="address"
          icon={MapPin}
          className="min-h-[72px]"
        />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// 5. Step 3: Emergency Contact Card
// ============================================================================

export function EmergencyContactCard({ className }: { className?: string }) {
  const emergency = useStaffStore((state) => state.patientData?.emergency);
  const currentStep = useCurrentStep();
  const isActive = currentStep === 3;

  const optionalValues = [
    emergency?.contactName,
    emergency?.relationship,
    emergency?.contactPhone,
  ];
  const filledCount = optionalValues.filter((v) => v && v.trim().length > 0).length;
  const completeness = getCompleteness(filledCount, 3, true);

  const formattedEmergencyPhone = emergency?.contactPhone
    ? formatPhoneNumber(emergency.contactPhone)
    : null;
  const emergencyPhoneHref = emergency?.contactPhone
    ? `tel:${emergency.contactPhone.replace(/[^\d+]/g, '')}`
    : undefined;

  return (
    <Card
      className={cn(
        'transition-all duration-300 flex flex-col',
        isActive && 'ring-2 ring-primary/40 border-primary/40 shadow-sm',
        className
      )}
    >
      <StepCardHeader
        stepNumber={3}
        title="Emergency Contact"
        subtitle="ผู้ติดต่อฉุกเฉิน (ไม่บังคับ)"
        icon={ShieldAlert}
        isActive={isActive}
        completeness={completeness}
      />

      <CardContent className="space-y-2.5 pt-4 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FieldDisplay
            label="Contact Name / ผู้ติดต่อ"
            section="emergency"
            field="contactName"
            icon={User}
          />
          <FieldDisplay
            label="Relationship / ความสัมพันธ์"
            section="emergency"
            field="relationship"
            icon={Heart}
          />
        </div>

        <FieldDisplay
          label="Emergency Phone / เบอร์โทรฉุกเฉิน"
          value={formattedEmergencyPhone}
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
// 6. Main Container
// ============================================================================

export function PatientOverviewCards({ className }: PatientOverviewCardsProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-3', className)}>
      <PersonalDetailsCard />
      <ContactDetailsCard />
      <EmergencyContactCard />
    </div>
  );
}
