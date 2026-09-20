export interface BaseCardData {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  location?: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  viewsCount?: number;
  price?: string;
  badge?: string;
  badgeColor?: "gold" | "emerald" | "blue" | "rose";
  metaInfo?: { label: string; value: string };
  link?: string;
}

export interface HomeSectionsMockData {
  latest: BaseCardData[];
  topRated: BaseCardData[];
  mostViewed: BaseCardData[];
  auctions: BaseCardData[];
  jobs: BaseCardData[];
  realEstate: BaseCardData[];
}

export const HOME_MOCK_DATA: HomeSectionsMockData = {
  latest: [
    {
      id: "lat-1",
      title: "مركز الأفق للبرمجيات والحلول الذكية",
      subtitle: "تطوير حلول المؤسسات وخدمات التحول الرقمي",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
      location: "صنعاء - حدة",
      category: "تقنية ومعلومات",
      rating: 4.9,
      reviewsCount: 28,
      viewsCount: 1420,
      badge: "جديد وموثق",
      badgeColor: "gold",
      link: "/companies/lat-1",
    },
    {
      id: "lat-2",
      title: "مجموعة المروج للمقاولات والتوريدات",
      subtitle: "استشارات هندسية وبناء متكامل",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
      location: "عدن - المعلا",
      category: "مقاولات وإنشاءات",
      rating: 4.8,
      reviewsCount: 19,
      viewsCount: 980,
      badge: "أضيف مؤخراً",
      badgeColor: "blue",
      link: "/companies/lat-2",
    },
  ],
  topRated: [
    {
      id: "top-1",
      title: "مستشفى اليمن السعيد التخصصي",
      subtitle: "خدمات طبية ورعاية متكاملة على مدار الساعة",
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80",
      location: "صنعاء - شارع الزبيري",
      category: "صحة ومستشفيات",
      rating: 5.0,
      reviewsCount: 240,
      viewsCount: 8900,
      badge: "الأعلى تقييماً ★★★★★",
      badgeColor: "gold",
      link: "/companies/top-1",
    },
    {
      id: "top-2",
      title: "فندق وكافيه سماء عدن البانورامي",
      subtitle: "ضيافة فندقية راقية وإطلالة بحرية ساحرة",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      location: "عدن - خور مكسر",
      category: "سياحة وفنادق",
      rating: 4.9,
      reviewsCount: 185,
      viewsCount: 6540,
      badge: "خيار الجمهور المفضل",
      badgeColor: "gold",
      link: "/companies/top-2",
    },
  ],
  mostViewed: [
    {
      id: "view-1",
      title: "شركة الصقر للصرافة والتحويلات",
      subtitle: "شبكة فروع واسعة وخدمات تحويل مالية فورية",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
      location: "حضرموت - المكلا",
      category: "خدمات مالية وصرافة",
      rating: 4.7,
      reviewsCount: 94,
      viewsCount: 14500,
      badge: "رائج اليوم",
      badgeColor: "emerald",
      link: "/banks",
    },
    {
      id: "view-2",
      title: "معرض الأمل للسيارات الحديثة",
      subtitle: "وكيل معتمد لأحدث الطرازات وقطع الغيار الأصلية",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
      location: "صنعاء - شارع الستين",
      category: "سيارات ومحركات",
      rating: 4.6,
      reviewsCount: 67,
      viewsCount: 11200,
      badge: "11K+ مشاهدة",
      badgeColor: "blue",
      link: "/companies/view-2",
    },
  ],
  auctions: [
    {
      id: "auc-1",
      title: "مزاد علني: تويوتا لاندكروزر V8 موديل 2023",
      subtitle: "حالة الوكالة - عداد 18,000 كم فقط - فحص شامل",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
      location: "صنعاء - ساحة المعارض",
      category: "مزاد سيارات",
      price: "$ 42,500",
      badge: "ينتهي خلال: 04:18:20",
      badgeColor: "rose",
      metaInfo: { label: "أعلى مزايدة حالية", value: "42,500 $" },
      link: "/auctions/auc-1",
    },
    {
      id: "auc-2",
      title: "مزاد معدات ثقيلة: بوكلين كوماتسو PC200",
      subtitle: "جاهز للعمل الميداني - أوراق رسمية موثقة",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
      location: "الحديدة - المنطقة الصناعية",
      category: "مزاد آليات ومعدات",
      price: "$ 28,000",
      badge: "ينتهي خلال: يومين",
      badgeColor: "gold",
      metaInfo: { label: "السعر الابتدائي", value: "25,000 $" },
      link: "/auctions/auc-2",
    },
  ],
  jobs: [
    {
      id: "job-1",
      title: "مطور برمجيات Full Stack (React / Node.js)",
      subtitle: "شركة تكنولوجيا مالية رائدة - دوام كامل",
      image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=600&q=80",
      location: "صنعاء (أو عن بُعد)",
      category: "تكنولوجيا المعلومات",
      price: "$ 1,200 - $ 1,800",
      badge: "دوام كامل",
      badgeColor: "emerald",
      metaInfo: { label: "الخبرة المطلوبة", value: "3+ سنوات" },
      link: "/jobs/job-1",
    },
    {
      id: "job-2",
      title: "مدير تسويق رقمي وعلاقات عامة",
      subtitle: "مجموعة تجارية وصناعية كبرى في المحافظات الجنوبية",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
      location: "عدن - المنصورة",
      category: "إدارة وتسويق",
      price: "راتب مجزٍ + عمولات",
      badge: "شواغر عاجلة",
      badgeColor: "gold",
      metaInfo: { label: "المستوى", value: "إداري متقدم" },
      link: "/jobs/job-2",
    },
  ],
  realEstate: [
    {
      id: "prop-1",
      title: "عمارة استثمارية حديثة البناء 5 أدوار",
      subtitle: "موقع تجاري استراتيجي على شارعين - دخل شهري ممتاز",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      location: "صنعاء - بيت بوس",
      category: "عقارات للبيع",
      price: "$ 480,000",
      badge: "فرصة استثمارية",
      badgeColor: "gold",
      metaInfo: { label: "المساحة", value: "12 لبنة حر" },
      link: "/properties/prop-1",
    },
    {
      id: "prop-2",
      title: "شقة فاخرة مفروشة سوبر ديلوكس بإطلالة بحرية",
      subtitle: "3 غرف نوم + صالة واسعة + تكييف وتجهيزات كاملة",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
      location: "عدن - ريمي",
      category: "شقق للإيجار",
      price: "600 $ / شهرياً",
      badge: "للإيجار السنوي",
      badgeColor: "blue",
      metaInfo: { label: "المساحة", value: "160 متر مربع" },
      link: "/properties/prop-2",
    },
  ],
};
