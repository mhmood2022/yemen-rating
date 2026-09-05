import {
  Home, Landmark, Coins, Bus, Building2, Stethoscope, Microscope,
  Pill, GraduationCap, School, Hotel, Palmtree, Trees, PartyPopper,
  Scissors, Sparkles, Bath, Coffee, UtensilsCrossed, Utensils,
  ShoppingCart, Store, Building, ShoppingBag, Smartphone, Gavel,
  Briefcase, Brush, Car, Bike, Shirt, Gem, Egg, Glasses, LucideIcon
} from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  slug: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  isMain?: boolean;
}

export const PLATFORM_NAVIGATION: NavItem[] = [
  { id: 'home', name: 'الرئيسية', slug: 'home', path: '/', icon: Home, isMain: true },
  
  // 1. البنوك والصرافة
  { id: 'banks', name: 'البنوك والصرافة', slug: 'banks', path: '/banks', icon: Landmark, isMain: true },
  
  // 2. أسعار الصرف والذهب
  { id: 'exchange-rates', name: 'أسعار الصرف والذهب', slug: 'exchange-rates', path: '/exchange-rates', icon: Coins, isMain: true },
  
  // 3. شركات النقل
  { id: 'transport', name: 'شركات النقل', slug: 'transport', path: '/businesses?category=transport', icon: Bus },
  
  // 4. المستشفيات
  { id: 'hospitals', name: 'المستشفيات', slug: 'hospitals', path: '/businesses?category=hospitals', icon: Building2 },
  
  // 5. العيادات
  { id: 'clinics', name: 'العيادات', slug: 'clinics', path: '/businesses?category=clinics', icon: Stethoscope },
  
  // 6. المختبرات
  { id: 'laboratories', name: 'المختبرات', slug: 'laboratories', path: '/businesses?category=laboratories', icon: Microscope },
  
  // 7. الصيدليات
  { id: 'pharmacies', name: 'الصيدليات', slug: 'pharmacies', path: '/businesses?category=pharmacies', icon: Pill },
  
  // 8. الجامعات
  { id: 'universities', name: 'الجامعات', slug: 'universities', path: '/businesses?category=universities', icon: GraduationCap },
  
  // 9. المدارس
  { id: 'schools', name: 'المدارس', slug: 'schools', path: '/businesses?category=schools', icon: School },
  
  // 10. الفنادق
  { id: 'hotels', name: 'الفنادق', slug: 'hotels', path: '/businesses?category=hotels', icon: Hotel },
  
  // 11. الشاليهات
  { id: 'chalets', name: 'الشاليهات', slug: 'chalets', path: '/businesses?category=chalets', icon: Palmtree },
  
  // 12. الحدائق
  { id: 'parks', name: 'الحدائق', slug: 'parks', path: '/businesses?category=parks', icon: Trees },
  
  // 13. صالات الأفراح
  { id: 'wedding-halls', name: 'صالات الأفراح', slug: 'wedding-halls', path: '/businesses?category=wedding-halls', icon: PartyPopper },
  
  // 14. الحلاقون
  { id: 'barbershops', name: 'الحلاقون', slug: 'barbershops', path: '/businesses?category=barbershops', icon: Scissors },
  
  // 15. الكوافير
  { id: 'beauty-salons', name: 'الكوافير', slug: 'beauty-salons', path: '/businesses?category=beauty-salons', icon: Sparkles },
  
  // 16. الحمامات البخارية
  { id: 'saunas', name: 'الحمامات البخارية', slug: 'saunas', path: '/businesses?category=saunas', icon: Bath },
  
  // 17. الكافيهات
  { id: 'cafes', name: 'الكافيهات', slug: 'cafes', path: '/businesses?category=cafes', icon: Coffee },
  
  // 18. البوفيهات
  { id: 'buffets', name: 'البوفيهات', slug: 'buffets', path: '/businesses?category=buffets', icon: UtensilsCrossed },
  
  // 19. المطاعم والأغذية
  { id: 'restaurants', name: 'المطاعم والأغذية', slug: 'restaurants', path: '/businesses?category=restaurants', icon: Utensils },
  
  // 20. السوبرماركت
  { id: 'supermarkets', name: 'السوبرماركت', slug: 'supermarkets', path: '/businesses?category=supermarkets', icon: ShoppingCart },
  
  // 21. مراكز التسوق
  { id: 'shopping-centers', name: 'مراكز التسوق', slug: 'shopping-centers', path: '/businesses?category=shopping-centers', icon: Store },
  
  // 22. المولات
  { id: 'malls', name: 'المولات', slug: 'malls', path: '/businesses?category=malls', icon: Building },
  
  // 23. المحلات والمتاجر
  { id: 'shops', name: 'المحلات والمتاجر', slug: 'shops', path: '/businesses?category=shops', icon: ShoppingBag },
  
  // 24. سوق الهواتف
  { id: 'phones', name: 'سوق الهواتف', slug: 'phones', path: '/phones', icon: Smartphone, isMain: true },
  
  // 25. المزاد
  { id: 'auctions', name: 'المزاد', slug: 'auctions', path: '/auctions', icon: Gavel, isMain: true },
  
  // 26. العقارات
  { id: 'properties', name: 'العقارات', slug: 'properties', path: '/properties', icon: Building, isMain: true },
  
  // 27. التوظيف
  { id: 'jobs', name: 'التوظيف', slug: 'jobs', path: '/jobs', icon: Briefcase, isMain: true },
  
  // 28. شركات التنظيف
  { id: 'cleaning-companies', name: 'شركات التنظيف', slug: 'cleaning-companies', path: '/businesses?category=cleaning-companies', icon: Brush },
  
  // 29. معارض السيارات
  { id: 'car-dealerships', name: 'معارض السيارات', slug: 'car-dealerships', path: '/businesses?category=car-dealerships', icon: Car },
  
  // 30. معارض الدراجات النارية
  { id: 'motorcycle-dealerships', name: 'معارض الدراجات النارية', slug: 'motorcycle-dealerships', path: '/businesses?category=motorcycle-dealerships', icon: Bike },
  
  // 31. محلات الملابس والأحذية
  { id: 'clothing-shoes', name: 'محلات الملابس والأحذية', slug: 'clothing-shoes', path: '/businesses?category=clothing-shoes', icon: Shirt },
  
  // 32. محلات الذهب
  { id: 'jewelry-gold', name: 'محلات الذهب', slug: 'jewelry-gold', path: '/businesses?category=jewelry-gold', icon: Gem },
  
  // 33. مزارع الدواجن
  { id: 'poultry-farms', name: 'مزارع الدواجن', slug: 'poultry-farms', path: '/businesses?category=poultry-farms', icon: Egg },
  
  // 34. البصريات والسمعيات
  { id: 'optics-hearing', name: 'البصريات والسمعيات', slug: 'optics-hearing', path: '/businesses?category=optics-hearing', icon: Glasses },
];
