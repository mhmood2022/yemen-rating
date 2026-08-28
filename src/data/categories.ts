import {
  Landmark,
  TrendingUp,
  Car,
  HeartPulse,
  GraduationCap,
  Hotel,
  Palmtree,
  Trees,
  Sparkles,
  Scissors,
  Wand2,
  Flame,
  Coffee,
  Sandwich,
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Store,
  Tag,
  PhoneCall,
  Layers,
  Gavel,
  Building,
  Briefcase,
  Compass,
  Wrench,
  LucideIcon
} from 'lucide-react';

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  order: number;
  subcategories: SubCategory[];
}

export const OFFICIAL_CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    name: 'البنوك والصرافة',
    slug: 'banks',
    icon: Landmark,
    order: 1,
    subcategories: [
      { id: '1-1', name: 'البنوك', slug: 'banks', order: 1 },
      { id: '1-2', name: 'شركات الصرافة', slug: 'exchange-companies', order: 2 }
    ]
  },
  {
    id: '2',
    name: 'أسعار الصرف والذهب',
    slug: 'exchange-rates',
    icon: TrendingUp,
    order: 2,
    subcategories: [
      { id: '2-1', name: 'أسعار الصرف', slug: 'exchange-rates', order: 1 },
      { id: '2-2', name: 'أسعار الذهب', slug: 'gold-rates', order: 2 }
    ]
  },
  {
    id: '3',
    name: 'النقل والمواصلات',
    slug: 'transport',
    icon: Car,
    order: 3,
    subcategories: [
      { id: '3-1', name: 'شركات النقل', slug: 'transport-companies', order: 1 },
      { id: '3-2', name: 'سيارات الأجرة', slug: 'taxis', order: 2 },
      { id: '3-3', name: 'خدمات التوصيل', slug: 'delivery-services', order: 3 }
    ]
  },
  {
    id: '4',
    name: 'الصحة',
    slug: 'health',
    icon: HeartPulse,
    order: 4,
    subcategories: [
      { id: '4-1', name: 'المستشفيات', slug: 'hospitals', order: 1 },
      { id: '4-2', name: 'العيادات', slug: 'clinics', order: 2 },
      { id: '4-3', name: 'المختبرات', slug: 'laboratories', order: 3 },
      { id: '4-4', name: 'الصيدليات', slug: 'pharmacies', order: 4 },
      { id: '4-5', name: 'مراكز الأسنان', slug: 'dental-centers', order: 5 }
    ]
  },
  {
    id: '5',
    name: 'التعليم',
    slug: 'education',
    icon: GraduationCap,
    order: 5,
    subcategories: [
      { id: '5-1', name: 'المدارس الخاصة', slug: 'private-schools', order: 1 },
      { id: '5-2', name: 'الجامعات الخاصة', slug: 'private-universities', order: 2 },
      { id: '5-3', name: 'المعاهد الخاصة', slug: 'private-institutes', order: 3 }
    ]
  },
  {
    id: '6',
    name: 'الفنادق',
    slug: 'hotels',
    icon: Hotel,
    order: 6,
    subcategories: [
      { id: '6-1', name: 'الفنادق', slug: 'hotels', order: 1 }
    ]
  },
  {
    id: '7',
    name: 'الشاليهات والاستراحات',
    slug: 'chalets',
    icon: Palmtree,
    order: 7,
    subcategories: [
      { id: '7-1', name: 'الشاليهات', slug: 'chalets', order: 1 },
      { id: '7-2', name: 'الاستراحات', slug: 'resorts', order: 2 }
    ]
  },
  {
    id: '8',
    name: 'المنتزهات',
    slug: 'parks',
    icon: Trees,
    order: 8,
    subcategories: [
      { id: '8-1', name: 'الحدائق', slug: 'gardens', order: 1 },
      { id: '8-2', name: 'المنتزهات', slug: 'parks', order: 2 }
    ]
  },
  {
    id: '9',
    name: 'صالات الأفراح والمناسبات',
    slug: 'wedding-halls',
    icon: Sparkles,
    order: 9,
    subcategories: [
      { id: '9-1', name: 'قاعات الأفراح', slug: 'wedding-halls', order: 1 }
    ]
  },
  {
    id: '10',
    name: 'صالونات الحلاقة',
    slug: 'barbershops',
    icon: Scissors,
    order: 10,
    subcategories: []
  },
  {
    id: '11',
    name: 'الكوافير والتجميل',
    slug: 'beauty-salons',
    icon: Wand2,
    order: 11,
    subcategories: []
  },
  {
    id: '12',
    name: 'حمامات البخار والمساج',
    slug: 'saunas',
    icon: Flame,
    order: 12,
    subcategories: [
      { id: '12-1', name: 'رجالي', slug: 'men', order: 1 },
      { id: '12-2', name: 'نسائي', slug: 'women', order: 2 }
    ]
  },
  {
    id: '13',
    name: 'الكافيهات',
    slug: 'cafes',
    icon: Coffee,
    order: 13,
    subcategories: [
      { id: '13-1', name: 'كافيهات', slug: 'cafes', order: 1 },
      { id: '13-2', name: 'مقاهي', slug: 'coffee-shops', order: 2 }
    ]
  },
  {
    id: '14',
    name: 'البوفيهات والكفتيريات',
    slug: 'buffets',
    icon: Sandwich,
    order: 14,
    subcategories: [
      { id: '14-1', name: 'بوفيهات', slug: 'buffets', order: 1 },
      { id: '14-2', name: 'كفتيريات', slug: 'cafeterias', order: 2 }
    ]
  },
  {
    id: '15',
    name: 'المطاعم',
    slug: 'restaurants',
    icon: Utensils,
    order: 15,
    subcategories: [
      { id: '15-1', name: 'مطاعم شعبية', slug: 'traditional-restaurants', order: 1 },
      { id: '15-2', name: 'مطاعم عائلية', slug: 'family-restaurants', order: 2 },
      { id: '15-3', name: 'مطاعم فاخرة', slug: 'luxury-restaurants', order: 3 }
    ]
  },
  {
    id: '16',
    name: 'السوبرماركت',
    slug: 'supermarkets',
    icon: ShoppingCart,
    order: 16,
    subcategories: [
      { id: '16-1', name: 'سوبرماركت', slug: 'supermarkets', order: 1 },
      { id: '16-2', name: 'متاجر المواد الغذائية', slug: 'grocery-stores', order: 2 }
    ]
  },
  {
    id: '17',
    name: 'مراكز التسوق',
    slug: 'shopping-centers',
    icon: ShoppingBag,
    order: 17,
    subcategories: [
      { id: '17-1', name: 'مراكز تجارية', slug: 'commercial-centers', order: 1 }
    ]
  },
  {
    id: '18',
    name: 'المولات',
    slug: 'malls',
    icon: Store,
    order: 18,
    subcategories: [
      { id: '18-1', name: 'مولات', slug: 'malls', order: 1 },
      { id: '18-2', name: 'مراكز تسوق كبرى', slug: 'mega-malls', order: 2 }
    ]
  },
  {
    id: '19',
    name: 'المتاجر والمحلات',
    slug: 'shops',
    icon: Tag,
    order: 19,
    subcategories: [
      { id: '19-1', name: 'محلات الملابس', slug: 'clothing-shops', order: 1 },
      { id: '19-2', name: 'محلات الأحذية', slug: 'shoes-shops', order: 2 },
      { id: '19-3', name: 'محلات الأجهزة', slug: 'appliances-shops', order: 3 },
      { id: '19-4', name: 'محلات الأثاث', slug: 'furniture-shops', order: 4 },
      { id: '19-5', name: 'محلات متنوعة', slug: 'variety-shops', order: 5 }
    ]
  },
  {
    id: '20',
    name: 'الاتصالات',
    slug: 'telecom',
    icon: PhoneCall,
    order: 20,
    subcategories: [
      { id: '20-1', name: 'شركات الاتصالات', slug: 'telecom-companies', order: 1 },
      { id: '20-2', name: 'مراكز خدمات الاتصالات', slug: 'telecom-service-centers', order: 2 },
      { id: '20-3', name: 'خدمات الإنترنت', slug: 'internet-services', order: 3 }
    ]
  },
  {
    id: '21',
    name: 'الأسواق',
    slug: 'markets',
    icon: Layers,
    order: 21,
    subcategories: [
      { id: '21-1', name: 'سوق الهواتف', slug: 'phones-market', order: 1 },
      { id: '21-2', name: 'سوق الملابس', slug: 'clothes-market', order: 2 },
      { id: '21-3', name: 'سوق السيارات', slug: 'cars-market', order: 3 },
      { id: '21-4', name: 'سوق الأثاث', slug: 'furniture-market', order: 4 },
      { id: '21-5', name: 'سوق الإلكترونيات', slug: 'electronics-market', order: 5 },
      { id: '21-6', name: 'سوق المعدات والأدوات', slug: 'equipment-market', order: 6 }
    ]
  },
  {
    id: '22',
    name: 'المزادات',
    slug: 'auctions',
    icon: Gavel,
    order: 22,
    subcategories: []
  },
  {
    id: '23',
    name: 'العقارات',
    slug: 'real-estate',
    icon: Building,
    order: 23,
    subcategories: []
  },
  {
    id: '24',
    name: 'التوظيف والوظائف',
    slug: 'jobs',
    icon: Briefcase,
    order: 24,
    subcategories: []
  },
  {
    id: '25',
    name: 'السياحة والترفيه',
    slug: 'tourism',
    icon: Compass,
    order: 25,
    subcategories: [
      { id: '25-1', name: 'أماكن سياحية', slug: 'tourist-places', order: 1 },
      { id: '25-2', name: 'أماكن ترفيهية', slug: 'entertainment-places', order: 2 }
    ]
  },
  {
    id: '26',
    name: 'الخدمات',
    slug: 'services',
    icon: Wrench,
    order: 26,
    subcategories: [
      { id: '26-1', name: 'خدمات منزلية', slug: 'home-services', order: 1 },
      { id: '26-2', name: 'خدمات تقنية', slug: 'tech-services', order: 2 },
      { id: '26-3', name: 'خدمات عامة', slug: 'general-services', order: 3 }
    ]
  }
];
