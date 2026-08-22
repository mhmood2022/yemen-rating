export type BusinessType =
  | 'BANK'
  | 'WALLET'
  | 'COMPANY'
  | 'SHOP'
  | 'RESTAURANT'
  | 'REAL_ESTATE'
  | 'CAR_DEALER'
  | 'HEALTHCARE'
  | 'HOTEL'
  | 'EDUCATION'
  | 'TRANSPORT'
  | 'TELECOM'
  | 'PROFESSIONAL';

export type YemenCity =
  | 'صنعاء'
  | 'عدن'
  | 'تعز'
  | 'حضرموت'
  | 'الحديدة'
  | 'إب'
  | 'مأرب'
  | 'ذمار';

export type BusinessCategory =
  | 'المطاعم'
  | 'المحلات'
  | 'محلات الجوالات والإلكترونيات'
  | 'السيارات'
  | 'النقل'
  | 'الخدمات'
  | 'الصحة'
  | 'الشركات'
  | 'البنوك'
  | 'المحافظ الإلكترونية'
  | 'الصرافة'
  | 'الفنادق'
  | 'العقارات'
  | 'التقنية'
  | 'التعليم'
  | 'الاتصالات';

export interface BusinessReview {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  isVerifiedReviewer?: boolean;
}

export interface BusinessBranch {
  city: string;
  address: string;
  phone?: string;
}

export interface BusinessItem {
  id: string;
  businessType: BusinessType;
  name: string;
  commercialName?: string;
  category: BusinessCategory;
  city: YemenCity;
  address?: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  yrScore: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verifiedBadgeType?: 'gold' | 'blue' | 'gray'; // الشارات الثلاث
  isTrending?: boolean;
  phone?: string;
  whatsapp?: string;
  mapUrl?: string;
  email?: string;
  website?: string;
  workingHours?: string;
  services?: string[];
  branches?: BusinessBranch[];
  agentCount?: number;
  exchangeRates?: { currency: string; code: string; buy: number; sell: number }[];
  walletFees?: { serviceName: string; feeAmount: string; limits?: string }[];
  reviews?: BusinessReview[];
  stats?: {
    views7d: number;
    views30d: number;
    searches30d: number;
  };
}

export interface DirectoryFilterState {
  searchQuery: string;
  category: string;
  city: string;
  minRating: number;
  verifiedOnly: boolean;
  sortBy: 'highest_score' | 'most_reviewed' | 'newest' | 'trending';
}
