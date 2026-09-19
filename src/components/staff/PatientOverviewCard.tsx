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
  male: 'Male / ชาย',
  female: 'Female / หญิง',
  other: 'Other / อื่นๆ',
  prefer_not_to_say: 'Not specified / ไม่ระบุ',
};

interface CompletenessInfo {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

function getCompleteness(filledCount: number, totalRequired: number, isOptional = false): CompletenessInfo {
  if (filledCount === totalRequired) {
    return {
      label: isOptional ? `Provided (${filledCount}/${totalRequired})` : `Complete (${filledCount}/${totalRequired})`,
      badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      icon: CheckCircle2,
    };
  }

  if (filledCount > 0) {
    return {
      label: `In Progress (${filledCount}/${totalRequired})`,
      badgeClass: 'border-primary/25 bg-primary/10 text-primary dark:text-primary-foreground',
      icon: Clock,
    };
  }

  if (isOptional) {
    return {
      label: 'Optional',
      badgeClass: 'border-border bg-muted/60 text-muted-foreground',
      icon: Circle,
    };
  }

  return {
    label: `Pending (0/${totalRequired})`,
    badgeClass: 'border-border bg-muted/60 text-muted-foreground',
    icon: Circle,
  };
}

// ============================================================================
// 2. Shared Step Card Header (Clean Clinical Scannability)
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
    <CardHeader className="border-b border-border/60 pb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold tracking-tight">
                {stepNumber}. {title}
              </CardTitle>
              {isActive && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                  Active
                </span>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">{subtitle}</CardDescription>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn('text-[11px] gap-1 py-0.5 px-2 font-medium shrink-0', completeness.badgeClass)}
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
        'flex flex-col border-border/80 shadow-xs transition-colors duration-200',
        isActive && 'border-primary/50 ring-1 ring-primary/30',
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
        'flex flex-col border-border/80 shadow-xs transition-colors duration-200',
        isActive && 'border-primary/50 ring-1 ring-primary/30',
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
        'flex flex-col border-border/80 shadow-xs transition-colors duration-200',
        isActive && 'border-primary/50 ring-1 ring-primary/30',
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
