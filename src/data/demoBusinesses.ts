import { BusinessItem, YemenCity, BusinessCategory } from '../types/business';

export const DEMO_BUSINESSES: BusinessItem[] = [
  /* ==================== البنوك ==================== */
  {
    id: 'b1',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    category: 'البنوك' as any,
    city: 'صنعاء',
    address: 'شارع حدة، تقاطع الرويشان',
    description: 'المؤسسة المصرفية الأوسع انتشاراً في اليمن لخدمات الحسابات والتمويلات والتحويلات النقدية السريعة عبر تطبيق كريمي جوال وشبكة الفروع.',
    yrScore: 96,
    rating: 4.8,
    reviewCount: 1240,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 503888',
    website: 'https://kuraimibank.com',
    services: [
      'حسابات جارية وتوفير استثمارية',
      'حساب كريمي جوال وتطبيق مصرفي',
      'خدمة الحوالات السريعة (مميّز)',
      'تمويل المشروعات الصغيرة والأصغر',
      'بطاقات الدفع الإلكتروني والإنترنت'
    ],
    products: [
      { id: 'f1', name: 'فتح حساب جاري / توفير', price: 'مجاناً', description: 'يتطلب إيداع أولي وتفعيل فوري' },
      { id: 'f2', name: 'التحويل بين الحسابات', price: 'مجاناً', description: 'حتى 10,000,000 ريال يومياً عبر التطبيق' },
      { id: 'f3', name: 'السحب من الصراف الآلي', price: 'مجاناً', description: 'عبر أكثر من 220 صراف آلي في عموم المحافظات' }
    ],
    reviews: [
      { id: 'r1', authorName: 'أحمد المقطري', rating: 5, date: '2026-08-14', comment: 'أفضل شبكة فروع وصرافات في اليمن وتطبيق سريع جداً.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 3420, views30d: 14890, searches30d: 5100 }
  },
  {
    id: 'b2',
    name: 'بنك التضامن',
    category: 'البنوك' as any,
    city: 'صنعاء',
    address: 'شارع علي عبدالمغني',
    description: 'أحد أكبر البنوك الإسلامية في اليمن، يقدم حلولاً مصرفية متكاملة للشركات والأفراد، وخدمات التجارة الدولية وبطاقات فيزا وماستركارد.',
    yrScore: 94,
    rating: 4.7,
    reviewCount: 680,
    isVerified: true,
    isTrending: false,
    phone: '+967 1 204000',
    website: 'https://tadhamonbank.com',
    services: [
      'الخدمات المصرفية للشركات وكبار العملاء',
      'محفظة وتطبيق تضامن باي',
      'الاعتمادات المستندية وخطابات الضمان',
      'التمويل العقاري والتجاري بصيغ إسلامية'
    ],
    products: [
      { id: 'f4', name: 'تطبيق تضامن باي', price: 'مجاناً', description: 'تحويلات وسداد فوري لكافة الفواتير' },
      { id: 'f5', name: 'بطاقات فيزا وماستركارد', price: 'رسوم سنوية معتمدة', description: 'مقبولة عالمياً للمشتريات والتسوق' }
    ],
    stats: { views7d: 1850, views30d: 7200, searches30d: 2900 }
  },
  {
    id: 'b3',
    name: 'بنك القطيبي الإسلامي للتمويل الأصغر',
    category: 'البنوك' as any,
    city: 'عدن',
    address: 'المنصورة، شارع التسعين',
    description: 'بنك مصرفي رائد في المحافظات الجنوبية والشرقية، يتميز بحلول تمويل المشاريع وتطبيق قطيبي لحظات وشبكة تحويلات واسعة.',
    yrScore: 93,
    rating: 4.6,
    reviewCount: 540,
    isVerified: true,
    isTrending: true,
    phone: '+967 2 358888',
    website: 'https://qutaibibank.com',
    services: [
      'تطبيق قطيبي لحظات للخدمات الإلكترونية',
      'شبكة قطيبي إكسبرس للحوالات',
      'صرف رواتب موظفي القطاع العام والخاص'
    ],
    products: [
      { id: 'f6', name: 'فتح حساب قطيبي', price: 'مجاناً', description: 'تفعيل فوري وخدمات مصرفية إلكترونية' }
    ],
    stats: { views7d: 2100, views30d: 8400, searches30d: 3800 }
  },

  /* ==================== المحافظ الإلكترونية ==================== */
  {
    id: 'w1',
    name: 'محفظة جيب (Jeeb Wallet)',
    category: 'المحافظ الإلكترونية' as any,
    city: 'صنعاء',
    address: 'بنك اليمن والكويت، شارع الزبيري',
    description: 'المحفظة الإلكترونية الأحدث والأسرع نمواً، تتيح سداد الفواتير، الشراء عبر QR Code، التحويل برقم الجوال، وسحب وإيداع عبر آلاف الوكلاء.',
    yrScore: 95,
    rating: 4.8,
    reviewCount: 920,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 200444',
    services: [
      'سداد فواتير الهاتف والإنترنت والكهرباء والماء',
      'التحويل المالي الفوري برقم الهاتف',
      'الدفع للتجار والمطاعم عبر رمز QR',
      'سحب وإيداع نقدي عبر +8,500 وكيل'
    ],
    products: [
      { id: 'w1_f1', name: 'التسجيل وتفعيل المحفظة', price: 'مجاناً', description: 'برقم الهاتف والبطاقة الشخصية' },
      { id: 'w1_f2', name: 'التحويل بين محافظ جيب', price: 'مجاناً 100%', description: 'فوري وبدون أي عمولة' }
    ],
    reviews: [
      { id: 'r2', authorName: 'سامي الوادعي', rating: 5, date: '2026-08-16', comment: 'أفضل وأسرع محفظة في سداد الفواتير والشراء من السوبرماركت.', isVerifiedReviewer: true }
    ],
    stats: { views7d: 4100, views30d: 16200, searches30d: 6800 }
  },
  {
    id: 'w2',
    name: 'محفظة كاش (Cash Wallet)',
    category: 'المحافظ الإلكترونية' as any,
    city: 'صنعاء',
    address: 'بنك سبأ الإسلامي',
    description: 'محفظة رقمية مرخصة تتيح للمستخدمين إجراء المعاملات المالية اليومية وسداد المشتريات وإرسال الأموال بسهولة وبدون كاش.',
    yrScore: 93,
    rating: 4.6,
    reviewCount: 710,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 450000',
    services: [
      'تحويل الأموال للأرقام غير المشتركة',
      'دفع المشتريات في المتاجر والمولات والمستشفيات',
      'تغذية الحساب عبر الصرافات والبنوك'
    ],
    stats: { views7d: 2200, views30d: 9100, searches30d: 3400 }
  },

  /* ==================== الأنشطة التجارية الأخرى ==================== */
  {
    id: '1',
    name: 'شركة يمن سوفت للأنظمة والاستشارات',
    category: 'التقنية',
    city: 'صنعاء',
    address: 'شارع الزبيري، تقاطع حدة',
    description: 'شركة رائدة في مجال تطوير البرمجيات والأنظمة المحاسبية والإدارية (أونكس برو ويمن إي آر بي).',
    yrScore: 95,
    rating: 4.8,
    reviewCount: 342,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 200000',
    email: 'info@yemensoft.com',
    website: 'https://yemensoft.com',
    services: ['أنظمة أونكس برو ERP', 'نظام المتكامل بلس', 'استشارات التحول الرقمي', 'حلول نقاط البيع السحابية'],
    products: [
      { id: 'p1', name: 'Onyx Pro ERP 2026', description: 'منظومة إدارة المؤسسات والشركات العملاقة' },
      { id: 'p2', name: 'Al-Motakamel Plus', description: 'النظام المحاسبي الشامل للشركات المتوسطة والصغيرة' }
    ],
    stats: { views7d: 1420, views30d: 5890, searches30d: 2100 }
  },
  {
    id: '2',
    name: 'عالم الهواتف الذكية والإلكترونيات',
    category: 'محلات الجوالات والإلكترونيات',
    city: 'عدن',
    address: 'كريتر، شارع أروى',
    description: 'مركز متخصص في بيع وصيانة أحدث الهواتف الذكية والأجهزة اللوحية وقطع الغيار الأصلية.',
    yrScore: 91,
    rating: 4.6,
    reviewCount: 184,
    isVerified: true,
    isTrending: true,
    phone: '+967 2 255555',
    services: ['صيانة فورية معتمدة', 'فحص البطاريات والشاشات', 'برمجة وتحديث الأجهزة'],
    stats: { views7d: 890, views30d: 3200, searches30d: 1450 }
  },
  {
    id: '3',
    name: 'مستشفى الدكتور عبدالقادر المتخصص',
    category: 'الصحة',
    city: 'تعز',
    address: 'شارع جمال عبدالناصر',
    description: 'مجمع طبي متكامل يقدم خدمات الطوارئ على مدار 24 ساعة وجراحة القلب والعيادات التخصصية.',
    yrScore: 93,
    rating: 4.7,
    reviewCount: 265,
    isVerified: true,
    isTrending: false,
    phone: '+967 4 211111',
    services: ['طوارئ 24/7', 'مركز التشخيص والأشعة المقطعية', 'مختبرات تخصصية دقيقة'],
    stats: { views7d: 1100, views30d: 4600, searches30d: 1800 }
  },
  {
    id: '4',
    name: 'فندق وأجنحة سبأ إنترناشيونال',
    category: 'الفنادق',
    city: 'صنعاء',
    address: 'شارع علي عبدالمغني',
    description: 'فندق 5 نجوم يقدم خدمات الضيافة الفاخرة وقاعات مؤتمرات مجهزة بأحدث التقنيات.',
    yrScore: 89,
    rating: 4.4,
    reviewCount: 152,
    isVerified: true,
    isTrending: false,
    phone: '+967 1 270000',
    services: ['أجنحة فندقية فاخرة', 'قاعات مؤتمرات دولية', 'بوفيه مفتوح ومطاعم عالمية'],
    stats: { views7d: 650, views30d: 2400, searches30d: 920 }
  },
  {
    id: '5',
    name: 'مطاعم الشيباني الملكية',
    category: 'المطاعم',
    city: 'عدن',
    address: 'المنصورة، ريمي',
    description: 'أشهر وأعرق مطاعم المأكولات اليمنية والشعبية والمشويات والمأكولات البحرية الطازجة.',
    yrScore: 94,
    rating: 4.8,
    reviewCount: 420,
    isVerified: true,
    isTrending: true,
    phone: '+967 2 388888',
    services: ['وجبات يمنية شعبية', 'مشويات طازجة', 'أسماك ومأكولات بحرية'],
    stats: { views7d: 2100, views30d: 8900, searches30d: 4100 }
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
  'الشركات',
  'المحلات',
  'المطاعم',
  'الفنادق',
  'الصحة',
  'العقارات',
  'السيارات',
  'النقل',
  'التقنية',
  'التعليم',
  'الخدمات',
  'الاتصالات',
  'الصرافة',
  'البنوك' as any,
  'المحافظ الإلكترونية' as any,
  'محلات الجوالات والإلكترونيات'
];
