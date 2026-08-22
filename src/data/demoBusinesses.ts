import { BusinessItem, YemenCity, BusinessCategory } from '../types/business';

export const DEMO_BUSINESSES: BusinessItem[] = [
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
    reviews: [
      {
        id: 'r1',
        authorName: 'م. أحمد الحميري',
        rating: 5,
        date: '2026-08-10',
        comment: 'أفضل نظام محاسبي في اليمن مع دعم فني مستمر واستجابة ممتازة.',
        isVerifiedReviewer: true,
      },
      {
        id: 'r2',
        authorName: 'سامي الوصابي',
        rating: 4.5,
        date: '2026-07-28',
        comment: 'برمجيات قوية جداً وتناسب السوق اليمني بشكل دقيق.',
        isVerifiedReviewer: true,
      }
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
    products: [
      { id: 'ph1', name: 'هواتف الفئة العليا 2026', description: 'ضمان رسمي لمدة سنة مع استبدال مجاني' },
      { id: 'ph2', name: 'إكسسوارات وشواحن أصلية', description: 'شواحن سريعة معتمدة ضد تقلبات التيار' }
    ],
    reviews: [
      {
        id: 'r3',
        authorName: 'عمر العدني',
        rating: 5,
        date: '2026-08-01',
        comment: 'خدمة راقية وأسعار واضحة وضمان حقيقي للأجهزة.',
        isVerifiedReviewer: true,
      }
    ],
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
    services: ['طوارئ 24/7', 'مركز التشخيص والأشعة المقطعية', 'مختبرات تخصصية دقيقة', 'عيادات القلب والباطنية'],
    reviews: [
      {
        id: 'r4',
        authorName: 'د. ياسمين الشميري',
        rating: 5,
        date: '2026-08-15',
        comment: 'طاقم طبي متميز ونظافة فائقة ورعاية استثنائية.',
        isVerifiedReviewer: true,
      }
    ],
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
    services: ['أجنحة فندقية فاخرة', 'قاعات مؤتمرات دولية', 'بوفيه مفتوح ومطاعم عالمية', 'خدمة نقل المطار'],
    reviews: [
      {
        id: 'r5',
        authorName: 'طارق الأهدل',
        rating: 4,
        date: '2026-07-20',
        comment: 'إقامة مريحة وخدمة غرف ممتازة وقاعات احتفالات واسعة.',
        isVerifiedReviewer: false,
      }
    ],
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
    services: ['وجبات يمنية شعبية', 'مشويات طازجة', 'أسماك ومأكولات بحرية', 'قسم خاص بالعائلات', 'توصيل طلبات'],
    reviews: [
      {
        id: 'r6',
        authorName: 'خالد باوزير',
        rating: 5,
        date: '2026-08-18',
        comment: 'السلتة والفحسة والسمك الموفى من أروع ما يكون، خدمة سريعة جداً.',
        isVerifiedReviewer: true,
      }
    ],
    stats: { views7d: 2100, views30d: 8900, searches30d: 4100 }
  },
  {
    id: '6',
    name: 'شركة القطيبي للصرافة والتحويلات',
    category: 'الصرافة',
    city: 'حضرموت',
    address: 'المكلا، الشارع العام',
    description: 'خدمات مصرفية وتحويلات مالية سريعة وموثوقة داخل اليمن وحول العالم عبر شبكة قطيبي إكسبرس.',
    yrScore: 92,
    rating: 4.6,
    reviewCount: 310,
    isVerified: true,
    isTrending: false,
    phone: '+967 5 300000',
    services: ['حوالات نقدية فورية', 'صرف وتغيير العملات', 'خدمات سداد الفواتير', 'تغذية المحافظ الإلكترونية'],
    reviews: [
      {
        id: 'r7',
        authorName: 'سعيد العولقي',
        rating: 4.5,
        date: '2026-08-12',
        comment: 'سرعة التحويل وحسن التعامل وأسعار صرف منافسة.',
        isVerifiedReviewer: true,
      }
    ],
    stats: { views7d: 1350, views30d: 5100, searches30d: 2900 }
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
  'محلات الجوالات والإلكترونيات'
];
