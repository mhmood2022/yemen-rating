export type BusinessCategory =
  | 'الشركات'
  | 'المحلات'
  | 'المطاعم'
  | 'الفنادق'
  | 'الصحة'
  | 'العقارات'
  | 'السيارات'
  | 'النقل'
  | 'التقنية'
  | 'التعليم'
  | 'الخدمات'
  | 'الاتصالات'
  | 'الصرافة'
  | 'البنوك'
  | 'المحافظ الإلكترونية'
  | 'محلات الجوالات والإلكترونيات';

export type YemenCity =
  | 'صنعاء'
  | 'عدن'
  | 'تعز'
  | 'حضرموت'
  | 'الحديدة'
  | 'إب'
  | 'مأرب'
  | 'ذمار';

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
  name: string;
  category: BusinessCategory;
  city: YemenCity;
  address?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  yrScore: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isTrending?: boolean;
  phone?: string;
  whatsapp?: string;
  mapUrl?: string;
  email?: string;
  website?: string;
  services?: string[];
  products?: { id: string; name: string; price?: string; description?: string }[];
  branches?: BusinessBranch[];
  exchangeRates?: { currency: string; code: string; buy: number; sell: number }[];
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
