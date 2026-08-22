import { BusinessItem, YemenCity, BusinessCategory } from '../types/business';

export const CITIES_LIST: YemenCity[] = [
  'صنعاء',
  'عدن',
  'تعز',
  'حضرموت',
  'الحديدة',
  'إب',
  'مأرب',
  'ذمار'
];

export const CATEGORIES_LIST: BusinessCategory[] = [
  'المطاعم',
  'المحلات',
  'محلات الجوالات والإلكترونيات',
  'السيارات',
  'النقل',
  'الخدمات',
  'الصحة',
  'الشركات',
  'البنوك',
  'المحافظ الإلكترونية',
  'الصرافة',
  'الفنادق',
  'العقارات',
  'التقنية',
  'التعليم',
  'الاتصالات'
];

export const DEMO_BUSINESSES: BusinessItem[] = [
  /* 1. البنوك - شارة ذهبية */
  {
    id: 'b1',
    businessType: 'BANK',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    category: 'البنوك',
    city: 'صنعاء',
    address: 'شارع حدة، تقاطع الرويشان',
    description: 'المؤسسة المصرفية الأوسع انتشاراً في اليمن لخدمات الحسابات والتمويلات والتحويلات النقدية السريعة.',
    logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1578895210405-907db486c111?w=1000&auto=format&fit=crop&q=80',
    yrScore: 96,
    rating: 4.8,
    reviewCount: 1240,
    isVerified: true,
    verifiedBadgeType: 'gold',
    isTrending: true,
    phone: '+967 1 503888',
    whatsapp: '+967 777503888',
    website: 'https://kuraimibank.com',
    services: ['حسابات جارية وتوفير', 'كريمي جوال وتطبيق مصرفي', 'خدمة مميّز للحوالات'],
    branches: [
      { city: 'صنعاء', address: 'فرع حدة، فرع الزبيري، فرع التحرير' },
      { city: 'عدن', address: 'فرع كريتر، فرع المنصورة' }
    ],
    exchangeRates: [
      { currency: 'الدولار الأمريكي', code: 'USD', buy: 535, sell: 538 },
      { currency: 'الريال السعودي', code: 'SAR', buy: 140.0, sell: 140.5 }
    ],
    stats: { views7d: 5400, views30d: 24000, searches30d: 8900 }
  },

  /* 2. المحافظ والتقنية - شارة زرقاء */
  {
    id: 'w1',
    businessType: 'WALLET',
    name: 'محفظة جيب (Jeeb Wallet)',
    category: 'المحافظ الإلكترونية',
    city: 'صنعاء',
    address: 'بنك اليمن والكويت، شارع الزبيري',
    description: 'المحفظة الإلكترونية الأسرع نمواً لسداد الفواتير والشراء عبر QR Code والتحويل الفوري.',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
    yrScore: 95,
    rating: 4.8,
    reviewCount: 920,
    isVerified: true,
    verifiedBadgeType: 'blue',
    isTrending: true,
    phone: '+967 1 200444',
    whatsapp: '+967 777200444',
    agentCount: 8500,
    services: ['سداد الفواتير', 'تحويل فوري برقم الجوال', 'الدفع للتجار'],
    walletFees: [
      { serviceName: 'التسجيل وتفعيل المحفظة', feeAmount: 'مجاناً' },
      { serviceName: 'التحويل بين محافظ جيب', feeAmount: 'مجاناً 100%' }
    ],
    stats: { views7d: 4800, views30d: 19500, searches30d: 7400 }
  },

  /* 3. المطاعم - شارة ذهبية */
  {
    id: 't1',
    businessType: 'RESTAURANT',
    name: 'مطعم البيت اليمني',
    category: 'المطاعم',
    city: 'صنعاء',
    address: 'حدة، بالقرب من جولة الرويشان',
    description: 'أرقى المأكولات اليمنية والشعبية والمشويات والأطباق التراثية الأصيلة بخدمة مميزة.',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
    yrScore: 97,
    rating: 4.8,
    reviewCount: 480,
    isVerified: true,
    verifiedBadgeType: 'gold',
    isTrending: true,
    phone: '+967 1 440000',
    whatsapp: '+967 777440000',
    services: ['جلسات عائلية', 'سلتة وفحسة بلدية', 'مشويات طازجة'],
    menuItems: [
      { id: 'm1', name: 'فحسة لحم بلدي مع الملوج', categoryName: 'الأطباق الشعبية', price: '3,500 ريال', isSpecialty: true },
      { id: 'm2', name: 'مشويات مشكلة البيت اليمني', categoryName: 'المشويات', price: '6,000 ريال', isSpecialty: true }
    ],
    stats: { views7d: 3200, views30d: 14500, searches30d: 5400 }
  },

  /* 4. شركات النقل - شارة رمادية رسمية */
  {
    id: 'tr_1',
    businessType: 'TRANSPORT',
    name: 'شركة راحة للنقل الدولي والمحلي',
    category: 'النقل',
    city: 'صنعاء',
    address: 'شارع الستين الجنوبي، جولة المصباحي',
    description: 'الشركة الرائدة في خدمات نقل الركاب VIP بين المحافظات اليمنية ورحلات العمرة والمملكة العربية السعودية.',
    logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&auto=format&fit=crop&q=80',
    yrScore: 96,
    rating: 4.8,
    reviewCount: 740,
    isVerified: true,
    verifiedBadgeType: 'gray',
    isTrending: true,
    phone: '+967 1 433333',
    whatsapp: '+967 777433333',
    services: ['رحلات يومية بين المحافظات', 'رحلات دولية للسعودية', 'نقل طرود سريع'],
    branches: [
      { city: 'صنعاء', address: 'فرع الستين الجنوبي' },
      { city: 'عدن', address: 'فرع الشيخ عثمان' }
    ],
    stats: { views7d: 4200, views30d: 18500, searches30d: 6200 }
  },

  /* 5. المتاجر والإلكترونيات - شارة ذهبية */
  {
    id: 't5',
    businessType: 'SHOP',
    name: 'متجر العصرية للإلكترونيات والجوالات',
    category: 'محلات الجوالات والإلكترونيات',
    city: 'عدن',
    address: 'كريتر، شارع أروى',
    description: 'مركز مبيعات وصيانة الهواتف الذكية والإكسسوارات والشواحن الأصلية.',
    logoUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80',
    yrScore: 93,
    rating: 4.6,
    reviewCount: 310,
    isVerified: true,
    verifiedBadgeType: 'gold',
    isTrending: true,
    phone: '+967 2 255555',
    whatsapp: '+967 777255555',
    services: ['هواتف 2026', 'صيانة فورية', 'إكسسوارات أصلية'],
    stats: { views7d: 2100, views30d: 8900, searches30d: 3600 }
  }
];
