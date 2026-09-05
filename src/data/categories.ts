import {
  Landmark, Coins, Bus, Building2, Stethoscope, Microscope,
  Pill, GraduationCap, School, Hotel, Palmtree, Trees,
  PartyPopper, Scissors, Sparkles, Bath, Coffee, UtensilsCrossed,
  Utensils, ShoppingCart, Store, Building, ShoppingBag, Smartphone,
  Gavel, Home, Briefcase, Brush, Car, Bike, Shirt, Gem, Egg,
  Glasses, LucideIcon
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
  { id: '3', slug: 'transport', name: 'شركات النقل', icon: Bus, iconName: 'Bus', isActive: true, order: 3 },
  { id: '4', slug: 'hospitals', name: 'المستشفيات', icon: Building2, iconName: 'Building2', isActive: true, order: 4 },
  { id: '5', slug: 'clinics', name: 'العيادات', icon: Stethoscope, iconName: 'Stethoscope', isActive: true, order: 5 },
  { id: '6', slug: 'laboratories', name: 'المختبرات', icon: Microscope, iconName: 'Microscope', isActive: true, order: 6 },
  { id: '7', slug: 'pharmacies', name: 'الصيدليات', icon: Pill, iconName: 'Pill', isActive: true, order: 7 },
  { id: '8', slug: 'universities', name: 'الجامعات', icon: GraduationCap, iconName: 'GraduationCap', isActive: true, order: 8 },
  { id: '9', slug: 'schools', name: 'المدارس', icon: School, iconName: 'School', isActive: true, order: 9 },
  { id: '10', slug: 'hotels', name: 'الفنادق', icon: Hotel, iconName: 'Hotel', isActive: true, order: 10 },
  { id: '11', slug: 'chalets', name: 'الشاليهات', icon: Palmtree, iconName: 'Palmtree', isActive: true, order: 11 },
  { id: '12', slug: 'parks', name: 'الحدائق', icon: Trees, iconName: 'Trees', isActive: true, order: 12 },
  { id: '13', slug: 'wedding-halls', name: 'صالات الأفراح', icon: PartyPopper, iconName: 'PartyPopper', isActive: true, order: 13 },
  { id: '14', slug: 'barbershops', name: 'الحلاقون', icon: Scissors, iconName: 'Scissors', isActive: true, order: 14 },
  { id: '15', slug: 'beauty-salons', name: 'الكوافير', icon: Sparkles, iconName: 'Sparkles', isActive: true, order: 15 },
  { id: '16', slug: 'saunas', name: 'الحمامات البخارية', icon: Bath, iconName: 'Bath', isActive: true, order: 16 },
  { id: '17', slug: 'cafes', name: 'الكافيهات', icon: Coffee, iconName: 'Coffee', isActive: true, order: 17 },
  { id: '18', slug: 'buffets', name: 'البوفيهات', icon: UtensilsCrossed, iconName: 'UtensilsCrossed', isActive: true, order: 18 },
  { id: '19', slug: 'restaurants', name: 'المطاعم والأغذية', icon: Utensils, iconName: 'Utensils', isActive: true, order: 19 },
  { id: '20', slug: 'supermarkets', name: 'السوبرماركت', icon: ShoppingCart, iconName: 'ShoppingCart', isActive: true, order: 20 },
  { id: '21', slug: 'shopping-centers', name: 'مراكز التسوق', icon: Store, iconName: 'Store', isActive: true, order: 21 },
  { id: '22', slug: 'malls', name: 'المولات', icon: Building, iconName: 'Building', isActive: true, order: 22 },
  { id: '23', slug: 'shops', name: 'المحلات والمتاجر', icon: ShoppingBag, iconName: 'ShoppingBag', isActive: true, order: 23 },
  { id: '24', slug: 'phones', name: 'سوق الهواتف', icon: Smartphone, iconName: 'Smartphone', isActive: true, order: 24 },
  { id: '25', slug: 'auctions', name: 'المزاد', icon: Gavel, iconName: 'Gavel', isActive: true, order: 25 },
  { id: '26', slug: 'real-estate', name: 'العقارات', icon: Home, iconName: 'Home', isActive: true, order: 26 },
  { id: '27', slug: 'jobs', name: 'التوظيف', icon: Briefcase, iconName: 'Briefcase', isActive: true, order: 27 },
  { id: '28', slug: 'cleaning-companies', name: 'شركات التنظيف', icon: Brush, iconName: 'Brush', isActive: true, order: 28 },
  { id: '29', slug: 'car-dealerships', name: 'معارض السيارات', icon: Car, iconName: 'Car', isActive: true, order: 29 },
  { id: '30', slug: 'motorcycle-dealerships', name: 'معارض الدراجات النارية', icon: Bike, iconName: 'Bike', isActive: true, order: 30 },
  { id: '31', slug: 'clothing-shoes', name: 'محلات الملابس والأحذية', icon: Shirt, iconName: 'Shirt', isActive: true, order: 31 },
  { id: '32', slug: 'jewelry-gold', name: 'محلات الذهب', icon: Gem, iconName: 'Gem', isActive: true, order: 32 },
  { id: '33', slug: 'poultry-farms', name: 'مزارع الدواجن', icon: Egg, iconName: 'Egg', isActive: true, order: 33 },
  { id: '34', slug: 'optics-hearing', name: 'البصريات والسمعيات', icon: Glasses, iconName: 'Glasses', isActive: true, order: 34 },
];

export const getCategoryBySlug = (slug: string): CategoryItem | undefined => {
  return OFFICIAL_CATEGORIES.find((cat) => cat.slug === slug);
};
