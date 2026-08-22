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
  'الخدمات',
  'الصحة',
  'الشركات',
  'البنوك',
  'المحافظ الإلكترونية',
  'الصرافة',
  'الفنادق',
  'العقارات',
  'النقل',
  'التقنية',
  'التعليم',
  'الاتصالات'
];

export const DEMO_BUSINESSES: BusinessItem[] = [
  /* 1. المطاعم */
  {
    id: 't1',
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
    isTrending: true,
    phone: '+967 1 440000',
    whatsapp: '+967 777440000',
    services: ['جلسات عائلية', 'سلتة وفحسة بلدية', 'مشويات طازجة', 'توصيل سريع']
  },
  /* 2. المحلات والمتاجر */
  {
    id: 't2',
    name: 'هايبر بلس',
    category: 'المحلات',
    city: 'صنعاء',
    address: 'شارع الستين الجنوبي',
    description: 'أكبر مركز تسوق متكامل للمواد الغذائية والمنزلية والإلكترونيات مع عروض يومية.',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=1000&auto=format&fit=crop&q=80',
    yrScore: 95,
    rating: 4.6,
    reviewCount: 390,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 510000',
    services: ['تسوق عائلي', 'عروض أسبوعية', 'مواقف سيارات', 'دفع إلكتروني']
  },
  /* 3. محلات الجوالات */
  {
    id: 't5',
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
    isTrending: true,
    phone: '+967 2 255555',
    whatsapp: '+967 777255555',
    services: ['هواتف 2026', 'صيانة فورية', 'إكسسوارات أصلية']
  },
  /* 4. السيارات */
  {
    id: 't3',
    name: 'خدمات الخليج للسيارات',
    category: 'السيارات',
    city: 'صنعاء',
    address: 'شارع النصر، سعوان',
    description: 'مركز متطور لفحص وصيانة وبرمجة أحدث السيارات وخدمات الميزان وتغيير الزيوت.',
    logoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
    yrScore: 94,
    rating: 4.8,
    reviewCount: 260,
    isVerified: true,
    isTrending: false,
    phone: '+967 1 320000',
    services: ['فحص كمبيوتر', 'صيانة محركات', 'ميزان ليزر']
  },
  /* 5. الخدمات */
  {
    id: 't6',
    name: 'مغسلة حريري للسيارات والخدمات',
    category: 'الخدمات',
    city: 'صنعاء',
    address: 'شارع الخمسين',
    description: 'غسيل وتلميع ساطع بالبخار والنانو سيراميك وحماية الفرش الداخلي.',
    logoUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&auto=format&fit=crop&q=80',
    yrScore: 92,
    rating: 4.5,
    reviewCount: 190,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 660000',
    services: ['غسيل بخار', 'تلميع نانو', 'حماية فرش']
  },
  /* 6. الصحة */
  {
    id: 't8',
    name: 'صيدلية الحكمة الحديثة',
    category: 'الصحة',
    city: 'صنعاء',
    address: 'شارع الزبيري، جوار المستشفى الجمهوري',
    description: 'صيدلية متكاملة توفر كافة الأدوية والمستلزمات الطبية على مدار 24 ساعة.',
    logoUrl: 'https://images.unsplash.com/photo-1586015555751-63c25b7b9195?w=500&auto=format&fit=crop&q=80',
    yrScore: 95,
    rating: 4.8,
    reviewCount: 420,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 280000',
    services: ['أدوية تخصصية', 'طوارئ 24 ساعة', 'استشارات طبية']
  },
  /* 7. الشركات والتقنية */
  {
    id: 'comp_1',
    name: 'شركة يمن سوفت للأنظمة والاستشارات',
    category: 'التقنية',
    city: 'صنعاء',
    address: 'شارع حدة، برج يمن سوفت',
    description: 'الشركة الرائدة في البرمجيات والأنظمة الإدارية والمحاسبية وأنظمة أونكس برو ERP.',
    logoUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80',
    yrScore: 96,
    rating: 4.9,
    reviewCount: 650,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 430000',
    services: ['أنظمة ERP', 'المتكامل بلس', 'حلول نقاط البيع السحابية']
  },
  /* 8. البنوك */
  {
    id: 'b1',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    category: 'البنوك',
    city: 'صنعاء',
    address: 'شارع حدة، تقاطع الرويشان',
    description: 'المؤسسة المصرفية الأوسع انتشاراً في اليمن لخدمات الحسابات والتمويلات والتحويلات.',
    logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1578895210405-907db486c111?w=1000&auto=format&fit=crop&q=80',
    yrScore: 89,
    rating: 4.8,
    reviewCount: 1240,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 503888',
    services: ['حسابات جارية وتوفير', 'كريمي جوال', 'خدمة مميّز للحوالات']
  },
  /* 9. المحافظ الإلكترونية */
  {
    id: 'w1',
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
    isTrending: true,
    phone: '+967 1 200444',
    services: ['سداد الفواتير', 'تحويل برقم الجوال', 'الدفع للتجار']
  },
  /* 10. الفنادق */
  {
    id: 'htl_1',
    name: 'فندق وأجنحة سبأ إنترناشيونال',
    category: 'الفنادق',
    city: 'صنعاء',
    address: 'شارع علي عبدالمغني',
    description: 'فندق 5 نجوم يقدم خدمات الضيافة الفاخرة وقاعات مؤتمرات مجهزة بأحدث التقنيات.',
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80',
    yrScore: 91,
    rating: 4.5,
    reviewCount: 220,
    isVerified: true,
    isTrending: false,
    phone: '+967 1 270000',
    services: ['أجنحة فاخرة', 'قاعات مؤتمرات', 'مطاعم عالمية']
  }
];
