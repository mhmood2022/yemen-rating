export interface HomeHeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

export interface HomeCategoryItem {
  id: string;
  name: string;
  categoryValue: string;
  iconName: string;
  href: string;
}

export interface HomeReviewItem {
  id: string;
  businessName: string;
  businessImage: string;
  authorName: string;
  rating: number;
  comment: string;
  timeAgo: string;
}

export const HERO_SLIDES: HomeHeroSlide[] = [
  {
    id: 'slide_1',
    title: 'اكتشف الأفضل',
    subtitle: 'تقييمات حقيقية من المجتمع لأفضل الشركات والخدمات في اليمن',
    ctaText: 'استكشف الآن',
    ctaLink: '/directory',
    imageUrl: 'https://images.unsplash.com/photo-1578895210405-907db486c111?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'slide_2',
    title: 'سوق الجوالات والإلكترونيات',
    subtitle: 'استعرض أفضل محلات الجوالات الموثقة مع أسعار حصرية وضمانات معتمدة',
    ctaText: 'سوق الجوالات',
    ctaLink: '/phones',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
  }
];

export const ALL_OFFICIAL_CATEGORIES: HomeCategoryItem[] = [
  { id: 'c_jobs', name: 'وظائف وتوظيف', categoryValue: 'الوظائف', iconName: 'Briefcase', href: '/jobs' },
  { id: 'c1', name: 'مطاعم ومقاهي', categoryValue: 'المطاعم', iconName: 'Utensils', href: '/directory?category=المطاعم' },
  { id: 'c2', name: 'متاجر ومحلات', categoryValue: 'المحلات', iconName: 'Store', href: '/directory?category=المحلات' },
  { id: 'c3', name: 'سوق الجوالات', categoryValue: 'محلات الجوالات والإلكترونيات', iconName: 'Smartphone', href: '/phones' },
  { id: 'c4', name: 'سيارات ونقل', categoryValue: 'السيارات', iconName: 'Car', href: '/directory?category=السيارات' },
  { id: 'c5', name: 'خدمات وأعمال', categoryValue: 'الخدمات', iconName: 'Sparkles', href: '/directory?category=الخدمات' },
  { id: 'c6', name: 'صحة ومستشفيات', categoryValue: 'الصحة', iconName: 'HeartPulse', href: '/directory?category=الصحة' },
  { id: 'c7', name: 'شركات ومؤسسات', categoryValue: 'الشركات', iconName: 'Building2', href: '/directory?category=الشركات' },
  { id: 'c8', name: 'بنوك مصرفية', categoryValue: 'البنوك', iconName: 'Landmark', href: '/banks-wallets' },
  { id: 'c9', name: 'محافظ إلكترونية', categoryValue: 'المحافظ الإلكترونية', iconName: 'Wallet', href: '/banks-wallets' },
  { id: 'c10', name: 'صرافة وتحويلات', categoryValue: 'الصرافة', iconName: 'Coins', href: '/prices' },
  { id: 'c11', name: 'فنادق وسياحة', categoryValue: 'الفنادق', iconName: 'Hotel', href: '/directory?category=الفنادق' },
  { id: 'c12', name: 'عقارات وأملاك', categoryValue: 'العقارات', iconName: 'Home', href: '/directory?category=العقارات' },
  { id: 'c13', name: 'نقل وشحن', categoryValue: 'النقل', iconName: 'Truck', href: '/directory?category=النقل' },
  { id: 'c14', name: 'تقنية وبرمجيات', categoryValue: 'التقنية', iconName: 'Laptop', href: '/directory?category=التقنية' },
  { id: 'c15', name: 'تعليم وجامعات', categoryValue: 'التعليم', iconName: 'GraduationCap', href: '/directory?category=التعليم' },
  { id: 'c16', name: 'اتصالات وشبكات', categoryValue: 'الاتصالات', iconName: 'Radio', href: '/directory?category=الاتصالات' },
];

export const LATEST_REVIEWS: HomeReviewItem[] = [
  {
    id: 'rev_1',
    businessName: 'مطعم البيت اليمني',
    businessImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
    authorName: 'أبو محمد',
    rating: 5,
    comment: 'تجربة رائعة وجودة ممتازة وتعامل راقي جداً، من أفضل المطاعم في صنعاء.',
    timeAgo: 'منذ ساعتين'
  },
  {
    id: 'rev_2',
    businessName: 'متجر العصرية للإلكترونيات',
    businessImage: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80',
    authorName: 'سامي الوصابي',
    rating: 5,
    comment: 'ضمان حقيقي وأسعار منافسة وسرعة في استبدال القطع الأصلية.',
    timeAgo: 'منذ 4 ساعات'
  }
];
