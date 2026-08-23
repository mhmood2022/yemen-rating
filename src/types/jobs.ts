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
  companyLogo: string;
  isVerifiedEmployer: boolean;
  verifiedBadgeType: 'gold' | 'blue' | 'gray';
  city: YemenCity;
  sector: JobSector;
  workType: JobWorkType;
  experienceLevel: JobExperienceLevel;
  salaryRange: string;
  postedDate: string;
  deadline: string;
  description: string;
  requirements: string[];
  benefits: string[];
  matchScore: number; // AI Match percentage
  applicantsCount: number;
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
