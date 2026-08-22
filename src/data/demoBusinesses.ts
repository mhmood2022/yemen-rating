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
  /* ==================== 1. شركات النقل والشحن ==================== */
  {
    id: 'tr_1',
    name: 'شركة راحة للنقل الدولي والمحلي',
    category: 'النقل',
    city: 'صنعاء',
    address: 'شارع الستين الجنوبي، جولة المصباحي',
    description: 'الشركة الرائدة في خدمات نقل الركاب VIP بين المحافظات اليمنية ورحلات العمرة والمملكة العربية السعودية، بأسطول حافلات مرسيدس حديث ومكيف.',
    logoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000&auto=format&fit=crop&q=80',
    yrScore: 96,
    rating: 4.8,
    reviewCount: 740,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 433333',
    whatsapp: '+967 777433333',
    website: 'https://rahatransport.com',
    services: [
      'رحلات يومية منتظمة (صنعاء - عدن - سيئون - مأرب)',
      'رحلات دولية يومية إلى السعودية (مكة - جدة - الرياض)',
      'خدمة نقل وشحن الطرود السريعة والمستندات',
      'حافلات VIP بدرجة رجال الأعمال مع شاشات وإنترنت'
    ],
    branches: [
      { city: 'صنعاء', address: 'فرع الستين الجنوبي، فرع نقم' },
      { city: 'عدن', address: 'فرع الشيخ عثمان، فرع خور مكسر' },
      { city: 'حضرموت', address: 'فرع سيئون، فرع المكلا' },
      { city: 'مأرب', address: 'الشارع العام، جوار الفاو' }
    ],
    reviews: [
      { id: 'r_tr1', authorName: 'عبدالرحمن العولقي', rating: 5, date: '2026-08-15', comment: 'حافلات مريحة جداً ومواعيد دقيقة وتعامل محترم من السائقين.', isVerifiedReviewer: true },
      { id: 'r_tr2', authorName: 'ياسر الشوافي', rating: 4.5, date: '2026-08-05', comment: 'أفضل خيار للسفر بين صنعاء وعدن وخدمة الطرود آمنة وسريعة.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 4200, views30d: 18500, searches30d: 6200 }
  },
  {
    id: 'tr_2',
    name: 'شركة الأولى للنقل البري',
    category: 'النقل',
    city: 'صنعاء',
    address: 'شارع الزبيري، تقاطع عمان',
    description: 'خدمات نقل المسافرين والطرود البريدية بين كافة المدن اليمنية، أسطول متطور وخدمات حجز وتأكيد المقاعد عبر الهاتف والواتساب.',
    logoUrl: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?w=1000&auto=format&fit=crop&q=80',
    yrScore: 94,
    rating: 4.6,
    reviewCount: 520,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 209000',
    whatsapp: '+967 777209000',
    services: [
      'رحلات منتظمة بين المدن والمحافظات',
      'خدمات التوصيل والشحن التجاري السريع',
      'حجز مسبق وخدمات المقاعد المريحة',
      'توفير وجبات ومياه للمسافرين'
    ],
    branches: [
      { city: 'صنعاء', address: 'فرع الزبيري، فرع شارع تعز' },
      { city: 'عدن', address: 'فرع المنصورة، شارع التسعين' },
      { city: 'تعز', address: 'فرع الحوبان، فرع المسبح' }
    ],
    reviews: [
      { id: 'r_tr3', authorName: 'عادل السعيدي', rating: 5, date: '2026-08-10', comment: 'حافلات نظيفة والتزام تام بمواعيد الانطلاق والوصول.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 3100, views30d: 13200, searches30d: 4800 }
  },
  {
    id: 'tr_3',
    name: 'شركة البراق للنقل الجماعي والشحن',
    category: 'النقل',
    city: 'عدن',
    address: 'الشيخ عثمان، جولة القاهرة',
    description: 'شبكة خطوط واسعة لنقل الركاب والبضائع مع تغطية شاملة لكافة المنافذ البرية وخدمات الشحن التجاري المجزأ والكامل.',
    logoUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80',
    yrScore: 93,
    rating: 4.5,
    reviewCount: 410,
    isVerified: true,
    isTrending: false,
    phone: '+967 2 380000',
    whatsapp: '+967 777380000',
    services: [
      'شحن بضائع وطرود بين المحافظات',
      'رحلات ركاب يومية منتظمة',
      'تأمين على البضائع والشحنات الحساسة'
    ],
    branches: [
      { city: 'عدن', address: 'فرع جولة القاهرة، الشيخ عثمان' },
      { city: 'صنعاء', address: 'فرع شارع خولان' },
      { city: 'حضرموت', address: 'فرع المكلا، الشارع العام' }
    ],
    stats: { views7d: 2400, views30d: 9800, searches30d: 3600 }
  },

  /* ==================== 2. المطاعم والمقاهي ==================== */
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
  {
    id: 't4',
    name: 'مطعم حضرموت السياحي',
    category: 'المطاعم',
    city: 'صنعاء',
    address: 'شارع الزبيري',
    description: 'أشهى المندي والمظبي والمأكولات البحرية على الطريقة الحضرمية الأصيلة.',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80',
    yrScore: 96,
    rating: 4.7,
    reviewCount: 510,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 210000',
    services: ['مندي ومظبي بلدي', 'أسماك ومأكولات بحرية', 'قسم العائلات'],
    stats: { views7d: 2900, views30d: 12400, searches30d: 4800 }
  },

  /* ==================== 3. البنوك والمحافظ ==================== */
  {
    id: 'b1',
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
    isTrending: true,
    phone: '+967 1 503888',
    whatsapp: '+967 777503888',
    website: 'https://kuraimibank.com',
    services: ['حسابات جارية وتوفير', 'كريمي جوال وتطبيق مصرفي', 'خدمة مميّز للحوالات', 'تمويلات ميسرة'],
    branches: [
      { city: 'صنعاء', address: 'فرع حدة، فرع الزبيري، فرع التحرير، فرع الستين' },
      { city: 'عدن', address: 'فرع كريتر، فرع المنصورة، فرع الشيخ عثمان' }
    ],
    exchangeRates: [
      { currency: 'الدولار الأمريكي', code: 'USD', buy: 535, sell: 538 },
      { currency: 'الريال السعودي', code: 'SAR', buy: 140.0, sell: 140.5 }
    ],
    stats: { views7d: 5400, views30d: 24000, searches30d: 8900 }
  },
  {
    id: 'w1',
    name: 'محفظة جيب (Jeeb Wallet)',
    category: 'المحافظ الإلكترونية',
    city: 'صنعاء',
    address: 'بنك اليمن والكويت، شارع الزبيري',
    description: 'المحفظة الإلكترونية الأحدث والأسرع نمواً لسداد الفواتير والشراء عبر QR Code والتحويل الفوري.',
    logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
    yrScore: 95,
    rating: 4.8,
    reviewCount: 920,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 200444',
    whatsapp: '+967 777200444',
    services: ['سداد الفواتير', 'تحويل فوري برقم الجوال', 'الدفع للتجار'],
    stats: { views7d: 4800, views30d: 19500, searches30d: 7400 }
  },

  /* ==================== 4. المتاجر والإلكترونيات ==================== */
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
    services: ['تسوق عائلي', 'عروض أسبوعية', 'مواقف سيارات', 'دفع إلكتروني'],
    stats: { views7d: 2800, views30d: 11200, searches30d: 4100 }
  },
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
    services: ['هواتف 2026', 'صيانة فورية', 'إكسسوارات أصلية'],
    stats: { views7d: 2100, views30d: 8900, searches30d: 3600 }
  },

  /* ==================== 5. السيارات والخدمات والصحة ==================== */
  {
    id: 't3',
    name: 'خدمات الخليج للسيارات',
    category: 'السيارات',
    city: 'صنعاء',
    address: 'شارع النصر، سعوان',
    description: 'مركز متطور لفحص وصيانة وبرمجة أحدث السيارات وخدمات الميزان وتغيير الزيوت.',
    logoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1000&auto=format&fit=crop&q=80',
    yrScore: 94,
    rating: 4.8,
    reviewCount: 260,
    isVerified: true,
    isTrending: false,
    phone: '+967 1 320000',
    services: ['فحص كمبيوتر', 'صيانة محركات', 'ميزان ليزر'],
    stats: { views7d: 1900, views30d: 8100, searches30d: 3100 }
  },
  {
    id: 't8',
    name: 'صيدلية الحكمة الحديثة',
    category: 'الصحة',
    city: 'صنعاء',
    address: 'شارع الزبيري، جوار المستشفى الجمهوري',
    description: 'صيدلية متكاملة توفر كافة الأدوية والمستلزمات الطبية على مدار 24 ساعة.',
    logoUrl: 'https://images.unsplash.com/photo-1586015555751-63c25b7b9195?w=500&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1586015555751-63c25b7b9195?w=1000&auto=format&fit=crop&q=80',
    yrScore: 95,
    rating: 4.8,
    reviewCount: 420,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 280000',
    services: ['أدوية تخصصية', 'طوارئ 24 ساعة', 'استشارات طبية'],
    stats: { views7d: 2400, views30d: 9800, searches30d: 4200 }
  }
];
