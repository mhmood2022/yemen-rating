import { BankWalletItem } from '../types/banksWallets';

export const DEMO_BANKS_AND_WALLETS: BankWalletItem[] = [
  /* ==================== 1. البنوك (Banks) ==================== */
  {
    id: 'b1',
    type: 'bank',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    commercialName: 'Kuraimi Bank',
    entityCategory: 'بنك تمويل أصغر إسلامي',
    headquartersCity: 'صنعاء',
    branchCount: 185,
    atmCount: 220,
    agentCount: 3500,
    yrScore: 96,
    rating: 4.8,
    reviewCount: 1240,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 503888',
    supportPhone: '8008800',
    website: 'https://kuraimibank.com',
    description: 'المؤسسة المصرفية الأوسع انتشاراً في اليمن لخدمات الحسابات والتمويلات والتحويلات النقدية السريعة.',
    services: [
      'حسابات جارية وتوفير استثمارية',
      'حساب كريمي جوال وتطبيق مصرفي',
      'خدمة الحوالات السريعة (مميّز)',
      'تمويل المشروعات الصغيرة والأصغر',
      'بطاقات الدفع الإلكتروني والإنترنت'
    ],
    features: ['أوسع شبكة فروع وصرافات في كافة المحافظات', 'خدمة دعم عملاء 24/7', 'ربط فوري مع محفظة أم فلوس'],
    fees: [
      { serviceName: 'فتح حساب جاري / توفير', feeAmount: 'مجاناً', notes: 'يتطلب إيداع أولي' },
      { serviceName: 'التحويل بين حسابات البنك', feeAmount: 'مجاناً', limits: 'حتى 10,000,000 ريال يومياً' },
      { serviceName: 'السحب من الصراف الآلي للبنك', feeAmount: 'مجاناً', limits: 'حسب سقف البطاقة' },
      { serviceName: 'إصدار بطاقة صراف آلي', feeAmount: 'رسوم رمزية', notes: 'تجدد كل 3 سنوات' }
    ]
  },
  {
    id: 'b2',
    type: 'bank',
    name: 'بنك التضامن',
    commercialName: 'Tadhamon Bank',
    entityCategory: 'بنك إسلامي تجاري',
    headquartersCity: 'صنعاء',
    branchCount: 48,
    atmCount: 95,
    agentCount: 1200,
    yrScore: 94,
    rating: 4.7,
    reviewCount: 680,
    isVerified: true,
    isTrending: false,
    phone: '+967 1 204000',
    supportPhone: '8004400',
    website: 'https://tadhamonbank.com',
    description: 'أحد أكبر وأعرق البنوك الإسلامية في اليمن، يقدم حلول مصرفية متكاملة للأفراد والشركات والتجارة الدولية.',
    services: [
      'الخدمات المصرفية للشركات وكبار العملاء',
      'محفظة وتطبيق تضامن باي',
      'الاعتمادات المستندية وخطابات الضمان',
      'التمويل العقاري والتجاري بصيغ إسلامية',
      'بطاقات فيزا وماستركارد الدولية'
    ],
    features: ['بنية تقنية متطورة وحماية مصرفية متقدمة', 'خدمات الحوالات الخارجية السريعة', 'حلول نقاط البيع للتجار'],
    fees: [
      { serviceName: 'فتح حساب فردي / شركات', feeAmount: 'مجاناً', notes: 'طباعة الدفتر برسوم معتمدة' },
      { serviceName: 'التحويل المباشر عبر تضامن باي', feeAmount: 'مجاناً داخل الشبكة', limits: 'حسب الفئة' },
      { serviceName: 'الاشتراك في الخدمات الإلكترونية', feeAmount: 'مجاناً', notes: 'تفعيل فوري' }
    ]
  },
  {
    id: 'b3',
    type: 'bank',
    name: 'بنك القطيبي الإسلامي للتمويل الأصغر',
    commercialName: 'Al-Qutaibi Islamic Bank',
    entityCategory: 'بنك إسلامي للتمويل الأصغر',
    headquartersCity: 'عدن',
    branchCount: 52,
    atmCount: 70,
    agentCount: 2100,
    yrScore: 93,
    rating: 4.6,
    reviewCount: 540,
    isVerified: true,
    isTrending: true,
    phone: '+967 2 358888',
    supportPhone: '8005500',
    website: 'https://qutaibibank.com',
    description: 'بنك مصرفي رائد في المحافظات الجنوبية والشرقية، يتميز بحلول تمويل المشاريع وتطبيق قطيبي لحظات وشبكة تحويلات واسعة.',
    services: [
      'تطبيق قطيبي لحظات للخدمات الإلكترونية',
      'شبكة قطيبي إكسبرس للحوالات',
      'صرف رواتب موظفي القطاع العام والخاص',
      'تمويلات ميسرة لأصحاب الأعمال والمزارعين'
    ],
    features: ['انتشار واسع في عدن وحضرموت والمهرة وشبوة', 'سرعة صرف وتسليم الحوالات', 'شراكات واسعة مع المرافق الخدمية'],
    fees: [
      { serviceName: 'فتح حساب قطيبي', feeAmount: 'مجاناً' },
      { serviceName: 'التحويل بين الحسابات', feeAmount: 'مجاناً عبر التطبيق' },
      { serviceName: 'سحب الرواتب من الفروع', feeAmount: 'بدون عمولة' }
    ]
  },
  {
    id: 'b4',
    type: 'bank',
    name: 'البنك الأهلي اليمني',
    commercialName: 'National Bank of Yemen',
    entityCategory: 'بنك تجاري حكومي',
    headquartersCity: 'عدن',
    branchCount: 36,
    atmCount: 45,
    agentCount: 400,
    yrScore: 90,
    rating: 4.4,
    reviewCount: 390,
    isVerified: true,
    isTrending: false,
    phone: '+967 2 252224',
    website: 'https://nbyemen.com',
    description: 'البنك التجاري الحكومي العريق، يمتلك شبكة مراسلين دوليين ويقدم خدمات الحسابات والودائع والعمليات المالية الحكومية.',
    services: [
      'إدارة الحسابات الحكومية وحسابات الأفراد',
      'خدمات التحصيل وتغطية الاعتمادات',
      'إصدار البطاقات المصرفية الوطنية',
      'شهادات الإيداع والودائع الاستثمارية'
    ],
    features: ['ضمان حكومي مباشر', 'خبرة تاريخية ممتدة لأكثر من 50 عاماً'],
    fees: [
      { serviceName: 'فتح الحساب التجاري', feeAmount: 'حسب التعرفة الرسمية' },
      { serviceName: 'التحويلات بين الفروع', feeAmount: 'عمولة معتمدة من البنك المركزي' }
    ]
  },

  /* ==================== 2. المحافظ الإلكترونية (Wallets) ==================== */
  {
    id: 'w1',
    type: 'wallet',
    name: 'محفظة جيب (Jeeb Wallet)',
    commercialName: 'بنك اليمن والكويت',
    entityCategory: 'محفظة إلكترونية شاملة',
    headquartersCity: 'صنعاء',
    agentCount: 8500,
    yrScore: 95,
    rating: 4.8,
    reviewCount: 920,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 200444',
    supportPhone: '8000000',
    description: 'المحفظة الإلكترونية الأحدث والأسرع نمواً، تتيح سداد الفواتير، الشراء عبر QR Code، التحويل برقم الجوال، وشراء البطاقات الرقمية.',
    services: [
      'سداد فواتير الهاتف والإنترنت والكهرباء والماء',
      'التحويل المالي الفوري برقم الهاتف',
      'الدفع للتجار والمطاعم عبر رمز الاستجابة السريع (QR)',
      'سحب وإيداع نقدي عبر آلاف الوكلاء في كل مكان',
      'شراء بطاقات الألعاب والتطبيقات والإنترنت الدولي'
    ],
    features: ['واجهة تطبيق فائقة السرعة والسهولة', 'عروض واسترداد نقدي (Cashback)', 'لا يشترط وجود حساب بنكي لفتح المحفظة'],
    fees: [
      { serviceName: 'التسجيل وتفعيل المحفظة', feeAmount: 'مجاناً برقم الهاتف والبطاقة' },
      { serviceName: 'التحويل من محفظة إلى محفظة جيب', feeAmount: 'مجاناً 100%' },
      { serviceName: 'سداد فواتير الاتصالات والخدمات', feeAmount: 'مجاناً وبدون أي رسوم إضافية' },
      { serviceName: 'السحب النقدي من الوكلاء', feeAmount: 'عمولة رمزية حسب المبلغ' }
    ]
  },
  {
    id: 'w2',
    type: 'wallet',
    name: 'محفظة كاش (Cash Wallet)',
    commercialName: 'بنك سبأ الإسلامي',
    entityCategory: 'محفظة نقد رقمي إلكتروني',
    headquartersCity: 'صنعاء',
    agentCount: 6200,
    yrScore: 93,
    rating: 4.6,
    reviewCount: 710,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 450000',
    description: 'محفظة رقمية مرخصة تتيح للمستخدمين إجراء المعاملات المالية اليومية وسداد المشتريات وإرسال الأموال بسهولة وبدون كاش.',
    services: [
      'تحويل الأموال للأرقام غير المشتركة',
      'دفع المشتريات في المتاجر والمولات والمستشفيات',
      'تغذية الحساب عبر الصرافات والبنوك ووكلاء الخدمة',
      'سداد الرسوم الجامعية والخدمات الحكومية'
    ],
    features: ['أمان مشفر بمعايير عالية', 'خدمة دعم عبر الواتساب والمكالمات', 'تغطية واسعة لدى المحلات التجارية'],
    fees: [
      { serviceName: 'إنشاء المحفظة', feeAmount: 'مجاناً' },
      { serviceName: 'التحويل الداخلي بين مشتركي كاش', feeAmount: 'مجاناً' },
      { serviceName: 'التحويل لغير مشترك', feeAmount: 'رسوم تحويل تنافسية' }
    ]
  },
  {
    id: 'w3',
    type: 'wallet',
    name: 'محفظة جوالي (Jawali Wallet)',
    commercialName: 'بنك كاك بنك (CAC Bank)',
    entityCategory: 'محفظة دفع وتطبيق نقدي',
    headquartersCity: 'عدن',
    agentCount: 5400,
    yrScore: 91,
    rating: 4.5,
    reviewCount: 620,
    isVerified: true,
    isTrending: false,
    phone: '+967 2 240000',
    description: 'المحفظة الإلكترونية التابعة لبنك التسليف التعاوني والزراعي، تقدم خدمات السداد والتحويل وصرف الرواتب والمساعدات المالية.',
    services: [
      'صرف واستلام الرواتب والمساعدات الإنسانية',
      'سداد فواتير يمن موبايل وسبأفون ويو وواي',
      'حوالات نقدية فورية سريعة',
      'دفع مشتريات الوقود والمتاجر الكبرى'
    ],
    features: ['ربط مباشر مع شبكة كاك بنك', 'خدمات مصرفية للأرياف والمدن'],
    fees: [
      { serviceName: 'فتح المحفظة', feeAmount: 'مجاناً' },
      { serviceName: 'سداد فواتير الاتصالات', feeAmount: 'مجاناً' },
      { serviceName: 'التحويل بين المحافظ', feeAmount: 'مجاناً' }
    ]
  },
  {
    id: 'w4',
    type: 'wallet',
    name: 'محفظة ون كاش (OneCash)',
    commercialName: 'شركة ون كاش لخدمات الدفع',
    entityCategory: 'محفظة دفع إلكتروني مستقلة',
    headquartersCity: 'صنعاء',
    agentCount: 7800,
    yrScore: 92,
    rating: 4.6,
    reviewCount: 510,
    isVerified: true,
    isTrending: true,
    phone: '+967 1 511111',
    description: 'محفظة مالية رقمية مرخصة من البنك المركزي، تتيح حلول الدفع للتجار وربط المتاجر الإلكترونية وسداد الخدمات اليومية.',
    services: [
      'بوابة دفع إلكتروني للمتاجر والتطبيقات (Payment Gateway)',
      'سداد خدمات الاتصالات والإنترنت',
      'التحويل الفوري والسحب عبر الوكلاء',
      'دفع المشتريات بنقاط البيع'
    ],
    features: ['واجهة برمجية API قوية للمطورين والتجار', 'تنفيذ فوري للعمليات 24 ساعة'],
    fees: [
      { serviceName: 'تفعيل المحفظة', feeAmount: 'مجاناً' },
      { serviceName: 'التحويل بين المشتركين', feeAmount: 'مجاناً' },
      { serviceName: 'ربط بوابة الدفع للتجار', feeAmount: 'عمولة تنافسية حسب العمليات' }
    ]
  }
];
