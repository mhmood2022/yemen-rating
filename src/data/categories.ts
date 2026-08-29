import {
  Landmark,
  Coins,
  Bus,
  Stethoscope,
  GraduationCap,
  Hotel,
  Palmtree,
  Trees,
  PartyPopper,
  Scissors,
  Sparkles,
  Bath,
  Coffee,
  UtensilsCrossed,
  Utensils,
  ShoppingCart,
  Store,
  Building,
  ShoppingBag,
  PhoneCall,
  Boxes,
  Gavel,
  Home,
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
  slug: string;
  name: string;
  icon: LucideIcon;
  iconName: string;
  description?: string;
  isActive: boolean;
  order: number;
  subcategories?: SubCategory[];
}

export const OFFICIAL_CATEGORIES: CategoryItem[] = [
  { id: '1', slug: 'banks', name: 'البنوك والصرافة', icon: Landmark, iconName: 'Landmark', isActive: true, order: 1 },
  { id: '2', slug: 'exchange-rates', name: 'أسعار الصرف والذهب', icon: Coins, iconName: 'Coins', isActive: true, order: 2 },
  { id: '3', slug: 'transport', name: 'النقل والمواصلات', icon: Bus, iconName: 'Bus', isActive: true, order: 3 },
  { id: '4', slug: 'health', name: 'الصحة', icon: Stethoscope, iconName: 'Stethoscope', isActive: true, order: 4 },
  { id: '5', slug: 'education', name: 'التعليم', icon: GraduationCap, iconName: 'GraduationCap', isActive: true, order: 5 },
  { id: '6', slug: 'hotels', name: 'الفنادق', icon: Hotel, iconName: 'Hotel', isActive: true, order: 6 },
  { id: '7', slug: 'chalets', name: 'الشاليهات والاستراحات', icon: Palmtree, iconName: 'Palmtree', isActive: true, order: 7 },
  { id: '8', slug: 'parks', name: 'المنتزهات', icon: Trees, iconName: 'Trees', isActive: true, order: 8 },
  { id: '9', slug: 'wedding-halls', name: 'صالات الأفراح والمناسبات', icon: PartyPopper, iconName: 'PartyPopper', isActive: true, order: 9 },
  { id: '10', slug: 'barbershops', name: 'صالونات الحلاقة', icon: Scissors, iconName: 'Scissors', isActive: true, order: 10 },
  { id: '11', slug: 'beauty-salons', name: 'الكوافير والتجميل', icon: Sparkles, iconName: 'Sparkles', isActive: true, order: 11 },
  { id: '12', slug: 'saunas', name: 'حمامات البخار والمساج', icon: Bath, iconName: 'Bath', isActive: true, order: 12 },
  { id: '13', slug: 'cafes', name: 'الكافيهات', icon: Coffee, iconName: 'Coffee', isActive: true, order: 13 },
  { id: '14', slug: 'buffets', name: 'البوفيهات والكفتيريات', icon: UtensilsCrossed, iconName: 'UtensilsCrossed', isActive: true, order: 14 },
  { id: '15', slug: 'restaurants', name: 'المطاعم والمأكولات', icon: Utensils, iconName: 'Utensils', isActive: true, order: 15 },
  { id: '16', slug: 'supermarkets', name: 'السوبرماركت', icon: ShoppingCart, iconName: 'ShoppingCart', isActive: true, order: 16 },
  { id: '17', slug: 'shopping-centers', name: 'مراكز التسوق', icon: Store, iconName: 'Store', isActive: true, order: 17 },
  { id: '18', slug: 'malls', name: 'المولات', icon: Building, iconName: 'Building', isActive: true, order: 18 },
  { id: '19', slug: 'shops', name: 'المتاجر والمحلات', icon: ShoppingBag, iconName: 'ShoppingBag', isActive: true, order: 19 },
  { id: '20', slug: 'telecom', name: 'الاتصالات', icon: PhoneCall, iconName: 'PhoneCall', isActive: true, order: 20 },
  { id: '21', slug: 'markets', name: 'الأسواق', icon: Boxes, iconName: 'Boxes', isActive: true, order: 21 },
  { id: '22', slug: 'auctions', name: 'المزادات', icon: Gavel, iconName: 'Gavel', isActive: true, order: 22 },
  { id: '23', slug: 'real-estate', name: 'العقارات', icon: Home, iconName: 'Home', isActive: true, order: 23 },
  { id: '24', slug: 'jobs', name: 'التوظيف والوظائف', icon: Briefcase, iconName: 'Briefcase', isActive: true, order: 24 },
  { id: '25', slug: 'tourism', name: 'السياحة والترفيه المحلي', icon: Compass, iconName: 'Compass', isActive: true, order: 25 },
  { id: '26', slug: 'services', name: 'الخدمات', icon: Wrench, iconName: 'Wrench', isActive: true, order: 26 },
];

export const getCategoryBySlug = (slug: string): CategoryItem | undefined => {
  return OFFICIAL_CATEGORIES.find((cat) => cat.slug === slug);
};
