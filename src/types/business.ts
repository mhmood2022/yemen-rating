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

// 1. منتجات وكتالوج المحلات
export interface ShopProduct {
  id: string;
  name: string;
  price: string;
  description?: string;
  imageUrl?: string;
  warranty?: string;
  isAvailable?: boolean;
}

// 2. قائمة مأكولات المطاعم
export interface MenuItem {
  id: string;
  name: string;
  categoryName: string; // المشويات، الأطباق الشعبية، المشروبات
  price: string;
  description?: string;
  imageUrl?: string;
  isSpecialty?: boolean;
}

// 3. عروض العقارات
export interface RealEstateListing {
  id: string;
  title: string;
  type: 'شقة' | 'فيلا' | 'أرض' | 'محل تجاري' | 'عمارة';
  dealType: 'بيع' | 'إيجار';
  price: string;
  areaM2: number;
  rooms?: number;
  bathrooms?: number;
  floor?: string;
  location: string;
  features?: string[];
  imageUrl: string;
}

// 4. أسطول السيارات
export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  condition: 'جديد' | 'مستخدم نظيف';
  mileageKm?: number;
  transmission: 'أوتوماتيك' | 'عادي';
  fuelType: 'بنزين' | 'هايبرد' | 'ديزل';
  price: string;
  imageUrl: string;
}

// 5. أقسام الصحة
export interface MedicalDept {
  id: string;
  name: string;
  doctorsCount?: number;
  is24hEmergency?: boolean;
  services: string[];
}

// 6. غرف الفنادق
export interface HotelRoom {
  id: string;
  roomType: string;
  pricePerNight: string;
  capacity: string;
  amenities: string[];
  imageUrl?: string;
}

// 7. باقات الاتصالات
export interface TelecomPlan {
  id: string;
  name: string;
  price: string;
  dataGb: string;
  validity: string;
  details: string;
}

// الكيان الشامل للنشاط
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
  yrScore: number; // 0 to 100
  rating: number; // 0.0 to 5.0
  reviewCount: number;
  isVerified: boolean;
  verifiedBadgeText?: 'موثّق ✓' | 'نشاط رسمي' | 'حساب موثوق';
  isTrending?: boolean;
  phone?: string;
  whatsapp?: string;
  mapUrl?: string;
  email?: string;
  website?: string;
  workingHours?: string;
  appDownloadUrl?: string;
  
  // بيانات مخصصة لكل نشاط (يتم إظهارها فقط إذا توفرت)
  services?: string[];
  branches?: BusinessBranch[];
  agentCount?: number; // للمحافظ والخدمات
  exchangeRates?: { currency: string; code: string; buy: number; sell: number }[];
  walletFees?: { serviceName: string; feeAmount: string; limits?: string }[];
  products?: ShopProduct[];
  menuItems?: MenuItem[];
  realEstateListings?: RealEstateListing[];
  carListings?: CarListing[];
  medicalDepts?: MedicalDept[];
  hotelRooms?: HotelRoom[];
  telecomPlans?: TelecomPlan[];
  reviews?: BusinessReview[];
  stats?: {
    views7d: number;
    views30d: number;
    searches30d: number;
    clickCalls30d?: number;
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
