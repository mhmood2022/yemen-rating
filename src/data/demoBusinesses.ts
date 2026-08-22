import { BusinessItem, YemenCity, BusinessCategory } from '../types/business';

export const DEMO_BUSINESSES: BusinessItem[] = [
  /* ==================== 1. بنك الكريمي ==================== */
  {
    id: 'b1',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    category: 'البنوك',
    city: 'صنعاء',
    address: 'شارع حدة، تقاطع الرويشان',
    description: 'المؤسسة المصرفية الأوسع انتشاراً في اليمن لخدمات الحسابات والتمويلات والتحويلات النقدية السريعة عبر تطبيق كريمي جوال وشبكة الفروع والصرافات الآلية في كافة المحافظات.',
    logoUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1578895210405-907db486c111?w=1000&auto=format&fit=crop&q=80',
    yrScore: 89,
    rating: 4.8,
    reviewCount: 1240,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 503888',
    whatsapp: '+967 777503888',
    website: 'https://kuraimibank.com',
    services: [
      'حسابات جارية وتوفير استثمارية',
      'حساب كريمي جوال وتطبيق مصرفي',
      'خدمة الحوالات السريعة (مميّز)',
      'تمويل المشروعات الصغيرة والأصغر',
      'بطاقات الدفع الإلكتروني والإنترنت'
    ],
    branches: [
      { city: 'صنعاء', address: 'فرع حدة، فرع الزبيري، فرع التحرير، فرع الستين' },
      { city: 'عدن', address: 'فرع كريتر، فرع المنصورة، فرع الشيخ عثمان' },
      { city: 'تعز', address: 'فرع شارع جمال، فرع الحوبان، فرع المسبح' },
      { city: 'حضرموت', address: 'فرع المكلا، فرع سيئون، فرع الشحر' }
    ],
    exchangeRates: [
      { currency: 'الدولار الأمريكي', code: 'USD', buy: 535, sell: 538 },
      { currency: 'الريال السعودي', code: 'SAR', buy: 140.0, sell: 140.5 }
    ],
    reviews: [
      { id: 'r1', authorName: 'أحمد المقطري', rating: 5, date: '2026-08-14', comment: 'أفضل شبكة فروع وصرافات وتطبيق سريع جداً في سداد الفواتير.', isVerifiedReviewer: true },
      { id: 'r2', authorName: 'محمد السامعي', rating: 4.5, date: '2026-08-10', comment: 'خدمة عملاء ممتازة واستجابة سريعة لخدمات الحوالات.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 5400, views30d: 24000, searches30d: 8900 }
  },

  /* ==================== 2. بنك التضامن ==================== */
  {
    id: 'b2',
    name: 'بنك التضامن',
    category: 'البنوك',
    city: 'صنعاء',
    address: 'شارع علي عبدالمغني',
    description: 'أحد أكبر البنوك الإسلامية في اليمن، يقدم حلولاً مصرفية متكاملة للأفراد والشركات والتجارة الدولية وبطاقات فيزا وماستركارد وتطبيق تضامن باي.',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
    yrScore: 94,
    rating: 4.7,
    reviewCount: 680,
    isVerified: true,
    isTrending: false,
    phone: '+967 1 204000',
    whatsapp: '+967 777204000',
    website: 'https://tadhamonbank.com',
    services: [
      'الخدمات المصرفية للشركات وكبار العملاء',
      'محفظة وتطبيق تضامن باي',
      'الاعتمادات المستندية وخطابات الضمان',
      'بطاقات فيزا وماستركارد الدولية'
    ],
    branches: [
      { city: 'صنعاء', address: 'الفرع الرئيسي، فرع الزبيري، فرع حدة' },
      { city: 'عدن', address: 'فرع كريتر، فرع المعلا' },
      { city: 'تعز', address: 'فرع شارع جمال' }
    ],
    exchangeRates: [
      { currency: 'الدولار الأمريكي', code: 'USD', buy: 535, sell: 538 },
      { currency: 'الريال السعودي', code: 'SAR', buy: 140.0, sell: 140.5 }
    ],
    reviews: [
      { id: 'r3', authorName: 'طارق الأهدل', rating: 5, date: '2026-08-01', comment: 'خدمات مصرفية راقية وحماية عالية للحسابات.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 2800, views30d: 11200, searches30d: 4100 }
  },

  /* ==================== 3. مطعم البيت اليمني ==================== */
  {
    id: 't1',
    name: 'مطعم البيت اليمني',
    category: 'المطاعم',
    city: 'صنعاء',
    address: 'حدة، بالقرب من جولة الرويشان',
    description: 'أرقى المأكولات اليمنية والشعبية والمشويات والأطباق التراثية الأصيلة بخدمة مميزة وقسم عائلي مريح.',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
    yrScore: 97,
    rating: 4.8,
    reviewCount: 480,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 440000',
    whatsapp: '+967 777440000',
    services: ['جلسات عائلية خاصة', 'مأكولات يمنية تراثية (سلتة وفحسة)', 'مشويات طازجة', 'توصيل طلبات فوري'],
    branches: [
      { city: 'صنعاء', address: 'فرع حدة، فرع التحرير' }
    ],
    reviews: [
      { id: 'r4', authorName: 'أبو محمد', rating: 5, date: '2026-08-18', comment: 'تجربة رائعة وجودة ممتازة وتعامل راقي جداً.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 3200, views30d: 14500, searches30d: 5400 }
  },

  /* ==================== 4. متجر العصرية ==================== */
  {
    id: 't5',
    name: 'متجر العصرية للإلكترونيات',
    category: 'محلات الجوالات والإلكترونيات',
    city: 'عدن',
    address: 'كريتر، شارع أروى',
    description: 'مركز مبيعات وصيانة الهواتف الذكية والإكسسوارات والشواحن الأصلية مع ضمان معتمد وخدمات ما بعد البيع.',
    logoUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80',
    yrScore: 93,
    rating: 4.6,
    reviewCount: 310,
    isVerified: true,
    isTrending: true,
    phone: '+967 2 255555',
    whatsapp: '+967 777255555',
    services: ['هواتف ذكية 2026', 'صيانة فورية معتمدة', 'إكسسوارات وبطاريات أصلية'],
    branches: [
      { city: 'عدن', address: 'فرع كريتر، فرع المنصورة' }
    ],
    reviews: [
      { id: 'r5', authorName: 'عمر العدني', rating: 5, date: '2026-08-12', comment: 'أسعار واضحة وضمان حقيقي وسرعة في الصيانة.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 2100, views30d: 8900, searches30d: 3600 }
  },

  /* ==================== 5. محفظة جيب ==================== */
  {
    id: 'w1',
    name: 'محفظة جيب (Jeeb Wallet)',
    category: 'المحافظ الإلكترونية',
    city: 'صنعاء',
    address: 'بنك اليمن والكويت، شارع الزبيري',
    description: 'المحفظة الإلكترونية الأحدث والأسرع نمواً لسداد الفواتير والشراء عبر QR Code والتحويل الفوري وسحب وإيداع عبر آلاف الوكلاء.',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
    yrScore: 95,
    rating: 4.8,
    reviewCount: 920,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 200444',
    whatsapp: '+967 777200444',
    services: ['سداد كافة فواتير الاتصالات والإنترنت', 'التحويل الفوري برقم الجوال', 'الدفع عبر QR Code'],
    branches: [
      { city: 'صنعاء', address: 'أكثر من 8,500 نقطة خدمة في عموم المحافظات' }
    ],
    reviews: [
      { id: 'r6', authorName: 'سامي الوادعي', rating: 5, date: '2026-08-16', comment: 'أفضل وأسرع محفظة في سداد الفواتير والشراء من السوبرماركت.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 4800, views30d: 19500, searches30d: 7400 }
  }
];

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
  'السيارات',
  'الخدمات',
  'المحلات',
  'الصحة',
  'الشركات',
  'الفنادق',
  'العقارات',
  'النقل',
  'التقنية',
  'التعليم',
  'الاتصالات',
  'الصرافة',
  'البنوك',
  'المحافظ الإلكترونية',
  'محلات الجوالات والإلكترونيات'
];
