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

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  order: number;
}

export const OFFICIAL_CATEGORIES: CategoryItem[] = [
  { id: '1', name: 'البنوك والصرافة', slug: 'banks', icon: Landmark, order: 1 },
  { id: '2', name: 'أسعار الصرف والذهب', slug: 'exchange-rates', icon: TrendingUp, order: 2 },
  { id: '3', name: 'النقل والمواصلات', slug: 'transport', icon: Car, order: 3 },
  { id: '4', name: 'الصحة', slug: 'health', icon: HeartPulse, order: 4 },
  { id: '5', name: 'التعليم', slug: 'education', icon: GraduationCap, order: 5 },
  { id: '6', name: 'الفنادق', slug: 'hotels', icon: Hotel, order: 6 },
  { id: '7', name: 'الشاليهات والاستراحات', slug: 'chalets', icon: Palmtree, order: 7 },
  { id: '8', name: 'المنتزهات', slug: 'parks', icon: Trees, order: 8 },
  { id: '9', name: 'صالات الأفراح والمناسبات', slug: 'wedding-halls', icon: Sparkles, order: 9 },
  { id: '10', name: 'صالونات الحلاقة', slug: 'barbershops', icon: Scissors, order: 10 },
  { id: '11', name: 'الكوافير والتجميل', slug: 'beauty-salons', icon: Wand2, order: 11 },
  { id: '12', name: 'حمامات البخار والمساج', slug: 'saunas', icon: Flame, order: 12 },
  { id: '13', name: 'الكافيهات', slug: 'cafes', icon: Coffee, order: 13 },
  { id: '14', name: 'البوفيهات والكفتيريات', slug: 'buffets', icon: Sandwich, order: 14 },
  { id: '15', name: 'المطاعم والمأكولات', slug: 'restaurants', icon: Utensils, order: 15 },
  { id: '16', name: 'السوبرماركت', slug: 'supermarkets', icon: ShoppingCart, order: 16 },
  { id: '17', name: 'مراكز التسوق', slug: 'shopping-centers', icon: ShoppingBag, order: 17 },
  { id: '18', name: 'المولات', slug: 'malls', icon: Store, order: 18 },
  { id: '19', name: 'المتاجر والمحلات', slug: 'shops', icon: Tag, order: 19 },
  { id: '20', name: 'الاتصالات', slug: 'telecom', icon: PhoneCall, order: 20 },
  { id: '21', name: 'الأسواق', slug: 'markets', icon: Layers, order: 21 },
  { id: '22', name: 'المزادات', slug: 'auctions', icon: Gavel, order: 22 },
  { id: '23', name: 'العقارات', slug: 'real-estate', icon: Building, order: 23 },
  { id: '24', name: 'التوظيف والوظائف', slug: 'jobs', icon: Briefcase, order: 24 },
  { id: '25', name: 'السياحة والترفيه المحلي', slug: 'tourism', icon: Compass, order: 25 },
  { id: '26', name: 'الخدمات', slug: 'services', icon: Wrench, order: 26 }
];
