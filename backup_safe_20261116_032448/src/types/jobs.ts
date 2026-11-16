import { YemenCity } from './business';

export type JobSector =
  | 'تقنية وبرمجيات'
  | 'محاسبة وبنوك'
  | 'طب ورعاية صحية'
  | 'مبيعات وتسويق'
  | 'هندسة ومقاولات'
  | 'نقل وخدمات لوجستية'
  | 'إدارة وموارد بشرية'
  | 'خدمة عملاء واستقبال';

export type JobWorkType =
  | 'دوام كامل'
  | 'دوام جزئي'
  | 'عن بعد (Remote)'
  | 'تدريب منتهي بالتوظيف';

export type JobExperienceLevel =
  | 'مبتدئ (0-1 سنة)'
  | 'متوسط (2-4 سنوات)'
  | 'خبير (5+ سنوات)'
  | 'إداري وقيادي';

export interface JobVacancy {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  contactPerson?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  locationDetails?: string;
  isVerifiedEmployer: boolean;
  verifiedBadgeType?: 'gold' | 'blue' | 'gray';
  city: YemenCity;
  sector: JobSector;
  workType: JobWorkType;
  experienceLevel: JobExperienceLevel;
  salaryRange: string;
  postedDate: string;
  deadline: string;
  description: string;
  requirements: string[];
  qualifications?: string[];
  skills?: string[];
  benefits?: string[];
  status?: 'active' | 'paused' | 'closed' | 'draft';
  employerAgreedCommission?: boolean;
  matchScore?: number; // AI Match percentage
  applicantsCount: number;
}

export interface JobSeekerProfile {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  qualification: string;
  specialization: string;
  experienceYears: string;
  skills: string[];
  summary: string;
  createdAt: string;
  applicantAgreedCommission: boolean;
}

export interface JobMatchRecord {
  id: string;
  orderNumber: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyPhone: string;
  companyWhatsapp: string;
  companyLocation: string;
  applicantId: string;
  applicantName: string;
  applicantPhone: string;
  matchDate: string;
  matchedCriteria: string[];
  status: 'matched' | 'interviewing' | 'hired' | 'rejected';
}

export interface CommissionPolicy {
  isEnabled: boolean;
  payer: 'employer_only' | 'seeker_only' | 'both';
  calculationType: 'percentage' | 'fixed';
  percentageValue: number;
  fixedValue: number;
  sectorRules: Record<string, { type: 'percentage' | 'fixed'; value: number }>;
}

export interface ConfirmedHireRecord {
  id: string;
  orderNumber: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
  applicantPhone: string;
  hiredDate: string;
  startDate: string;
  agreedSalary: string;
  commissionAmountText: string;
  payer: string;
  commissionStatus: 'due' | 'paid' | 'pending';
  dueDate: string;
  reminderSent: boolean;
}

export interface JobFilterState {
  searchQuery: string;
  city: string;
  sector: string;
  workType: string;
  experienceLevel: string;
  verifiedOnly: boolean;
  sortBy: 'newest' | 'highest_salary' | 'highest_match';
}
