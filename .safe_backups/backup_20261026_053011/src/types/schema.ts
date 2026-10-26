import { BusinessType, YemenCity, BusinessCategory } from './business';
import { AdType, AdPlacement, AdStatus } from './ads';
import { PriceMarket } from './prices';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'content_manager'
  | 'verification_manager'
  | 'jobs_manager'
  | 'ads_manager'
  | 'support'
  | 'owner'
  | 'user';

export type OwnershipStatus =
  | 'UNCLAIMED'
  | 'CLAIM_PENDING'
  | 'CLAIMED'
  | 'VERIFIED'
  | 'SUSPENDED';

export type TierLevel = 'PREMIUM_VERIFIED' | 'VERIFIED' | 'STANDARD';

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  bannerAdUrl?: string;
}

export interface BusinessEntity {
  id: string;
  name: string;
  commercialName?: string;
  categoryId: string;
  businessType: BusinessType;
  city: YemenCity;
  address?: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  workingHours?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  tier: TierLevel;
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
  ownershipStatus: OwnershipStatus;
  claimedBy?: string;
  isVerified: boolean;
  verifiedBadgeType: 'gold' | 'blue' | 'gray';
  verifiedBadgeTitle: string;
  verifiedAt?: string;
  verifiedReason?: string;
  verifiedBy?: string;
  yrScore: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobEntity {
  id: string;
  businessId: string;
  title: string;
  city: YemenCity;
  sector: string;
  workType: string;
  experienceLevel: string;
  salaryRange?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  commissionAmount: number;
  commissionCurrency: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FILLED' | 'EXPIRED';
  applicantsCount: number;
  deadline?: string;
  createdAt: string;
}

export interface JobApplicationEntity {
  id: string;
  jobId: string;
  applicantId?: string;
  applicantName: string;
  applicantPhone: string;
  applicantCity: string;
  qualifications: string;
  experienceYears: number;
  cvFileUrl?: string;
  aiMatchScore: number;
  aiMatchReasons: string[];
  status: 'SUBMITTED' | 'MATCHED' | 'INTERVIEW_SCHEDULED' | 'OFFER_ACCEPTED' | 'COMMISSION_LOCKED' | 'REJECTED';
  lockedCommissionAmount?: number;
  lockedCommissionCurrency?: string;
  commissionPaid: boolean;
  createdAt: string;
}

export interface PropertyEntity {
  id: string;
  businessId?: string;
  ownerId?: string;
  title: string;
  propertyType: 'شقة' | 'فيلا' | 'أرض' | 'محل تجاري' | 'عمارة' | 'مستودع';
  dealType: 'بيع' | 'إيجار';
  city: YemenCity;
  locationDetails: string;
  price: number;
  currency: string;
  areaM2: number;
  rooms: number;
  bathrooms: number;
  floorNum?: string;
  features: string[];
  images: string[];
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'RENTED' | 'ARCHIVED';
  createdAt: string;
}

export interface PlatformSettingEntity {
  key: string;
  value: string;
  description?: string;
  updatedBy?: string;
  updatedAt: string;
}
