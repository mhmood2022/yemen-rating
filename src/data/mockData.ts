export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface BusinessItem {
  id: string;
  name: string;
  categorySlug: string;
  governorateId: string;
  cityId: string;
  rating: number;
  reviewsCount: number;
  address: string;
  phone: string;
  whatsapp?: string;
  workingHours: string;
  description: string;
  isVerified: boolean;
  isFeatured?: boolean;
  coverImage: string;
  logo: string;
  gallery: string[];
  reviews: Review[];
}

export interface AdItem {
  id: string;
  title: string;
  description: string;
  categorySlug?: string;
  imageUrl: string;
  linkText: string;
  targetUrl: string;
  badgeText: string;
}

export const SAMPLE_BUSINESSES: BusinessItem[] = [
  {
    id: 'b-1',
    name: 'بنك الكريمي للتمويل الأصغر الإسلامي',
    categorySlug: 'banks',
    governorateId: 'sanaa',
    cityId: 'sabaeen',
    rating: 4.8,
    reviewsCount: 420,
    address: 'شارع الزبيري - تقاطع حدة، صنعاء',
    phone: '01-200000',
    whatsapp: '777000111',
    workingHours: '8:00 ص - 4:00 م (السبت - الخميس)',
    description: 'يقدم بنك الكريمي أوسع شبكة خدمات مصرفية وتمويلية في كافة أنحاء اليمن مع خدمات الحسابات والتحويلات اللحظية وتطبيق كريمي جوال.',
    isVerified: true,
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&auto=format&fit=crop&q=80'
    ],
    reviews: [
      { id: 'r-1', userName: 'محمد الأهدل', rating: 5, date: 'قبل يومين', comment: 'خدمة سريعة وتطبيق الهاتف يعمل بكفاءة عالية في كل المحافظات.' },
      { id: 'r-2', userName: 'فؤاد الشميري', rating: 4, date: 'قبل أسبوع', comment: 'الفروع متوفرة في كل مكان ولكن في أوقات الذروة يكون هناك بعض الازدحام.' }
    ]
  },
  {
    id: 'b-2',
    name: 'مطعم ومأكولات رويال ستار السياحي',
    categorySlug: 'restaurants',
    governorateId: 'aden',
    cityId: 'mansoura',
    rating: 4.9,
    reviewsCount: 290,
    address: 'المنصورة - ريمي - بجانب الكورنيش، عدن',
    phone: '02-345678',
    whatsapp: '733111222',
    workingHours: '11:00 ص - 1:00 ص (يومياً)',
    description: 'أرقى المأكولات اليمنية والبحرية والشرقية، مع صالات عائلية متميزة وإطلالة رائعة وخدمة فندقية راقية.',
    isVerified: true,
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80'
    ],
    reviews: [
      { id: 'r-3', userName: 'سالم بازرعة', rating: 5, date: 'قبل 3 أيام', comment: 'المأكولات البحرية طازجة والسمك الموفى من أروع ما تذوقت في عدن.' },
      { id: 'r-4', userName: 'أروى باعباد', rating: 5, date: 'قبل أسبوعين', comment: 'جلسات عائلية مريحة ونظافة استثنائية وأسعار معقولة.' }
    ]
  },
  {
    id: 'b-3',
    name: 'مستشفى الدكتور عبدالقادر المتوكل التخصصي',
    categorySlug: 'health',
    governorateId: 'sanaa',
    cityId: 'sabaeen',
    rating: 4.7,
    reviewsCount: 165,
    address: 'شارع بغداد - المتفرع من شارع حدة، صنعاء',
    phone: '01-445566',
    whatsapp: '771234567',
    workingHours: 'طوارئ 24 ساعة - العيادات 8:00 ص إلى 8:00 م',
    description: 'أحدث التجهيزات الطبية والكوادر الاستشارية في جميع التخصصات الجراحية والباطنية وقسم طوارئ متقدم.',
    isVerified: true,
    isFeatured: false,
    coverImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80'
    ],
    reviews: [
      { id: 'r-5', userName: 'طارق القباطي', rating: 5, date: 'قبل شهر', comment: 'رعاية ممتازة والأطباء متعاونون جداً.' }
    ]
  },
  {
    id: 'b-4',
    name: 'فندق بلقيس الملكي السياحي',
    categorySlug: 'hotels',
    governorateId: 'hadramout',
    cityId: 'mukalla',
    rating: 4.6,
    reviewsCount: 112,
    address: 'المكلا - شارع الستين - بجوار خور المكلا',
    phone: '05-312345',
    whatsapp: '775554433',
    workingHours: 'استقبال 24 ساعة',
    description: 'إطلالة بحرية ساحرة على بحر العرب وخور المكلا، أجنحة فندقية مجهزة بأحدث سبل الراحة ومطعم فاخر.',
    isVerified: false,
    isFeatured: true,
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80'
    ],
    reviews: [
      { id: 'r-6', userName: 'عمر الكثيري', rating: 4, date: 'قبل 3 أسابيع', comment: 'موقع استراتيجي رائع ونظافة عالية.' }
    ]
  }
];

export const SAMPLE_ADS: AdItem[] = [
  {
    id: 'ad-hero-1',
    title: 'تطبيق كريمي جوال - بنك الكريمي',
    description: 'سدد الفواتير وحول أموالك لحظياً في جميع المحافظات بأعلى أمان وسرعة.',
    categorySlug: 'banks',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    linkText: 'حمّل التطبيق الآن',
    targetUrl: '#',
    badgeText: 'إعلان مميز'
  },
  {
    id: 'ad-feed-1',
    title: 'عروض الشاليهات الصيفية في عدن والمكلا',
    description: 'احجز شاليهك العائلي الخاص مع مسبح خاص وإطلالة بحرية بأفضل الأسعار.',
    categorySlug: 'chalets',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    linkText: 'عرض الشاليهات المتاحة',
    targetUrl: '#',
    badgeText: 'إعلان مروّج'
  }
];
