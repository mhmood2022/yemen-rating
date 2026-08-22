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
    title: 'أقوى العروض والتخفيضات',
    subtitle: 'استعرض أفضل محلات الجوالات والإلكترونيات الموثقة مع أسعار حصرية',
    ctaText: 'سوق الجوالات',
    ctaLink: '/directory?category=محلات الجوالات والإلكترونيات',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
  }
];

export const MAIN_CATEGORIES: HomeCategoryItem[] = [
  { id: 'cat_food', name: 'مطاعم ومقاهي', iconName: 'Utensils', href: '/directory?category=المطاعم' },
  { id: 'cat_cars', name: 'سيارات', iconName: 'Car', href: '/directory?category=السيارات' },
  { id: 'cat_services', name: 'خدمات', iconName: 'Briefcase', href: '/directory?category=الخدمات' },
  { id: 'cat_stores', name: 'متاجر', iconName: 'Store', href: '/directory?category=المحلات' },
  { id: 'cat_health', name: 'صحة وجمال', iconName: 'HeartPulse', href: '/directory?category=الصحة' },
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
