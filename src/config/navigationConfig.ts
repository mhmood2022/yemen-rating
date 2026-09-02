import { 
  Home, Landmark, Coins, Bus, Stethoscope, GraduationCap, 
  Hotel, Palmtree, Trees, PartyPopper, Scissors, Sparkles, 
  Bath, Coffee, UtensilsCrossed, Utensils, ShoppingCart, 
  Store, Building, ShoppingBag, PhoneCall, Boxes, Gavel, 
  Briefcase, Compass, Wrench, Smartphone, LucideIcon
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
  { id: 'banks', name: 'البنوك والصرافة', slug: 'banks', path: '/banks', icon: Landmark, isMain: true },
  { id: 'exchange-rates', name: 'أسعار الصرف والذهب', slug: 'exchange-rates', path: '/exchange-rates', icon: Coins, isMain: true },
  { id: 'phones', name: 'سوق الهواتف', slug: 'phones', path: '/phones', icon: Smartphone, isMain: true },
  { id: 'auctions', name: 'المزادات والبيع', slug: 'auctions', path: '/auctions', icon: Gavel, isMain: true },
  { id: 'properties', name: 'العقارات', slug: 'properties', path: '/properties', icon: Building, isMain: true },
  { id: 'jobs', name: 'التوظيف والوظائف', slug: 'jobs', path: '/jobs', icon: Briefcase, isMain: true },
  { id: 'transport', name: 'شركات النقل والمواصلات', slug: 'transport', path: '/businesses?category=transport', icon: Bus },
  { id: 'health', name: 'المستشفيات والمراكز الطبية', slug: 'health', path: '/businesses?category=health', icon: Stethoscope },
  { id: 'education', name: 'التعليم والجامعات', slug: 'education', path: '/businesses?category=education', icon: GraduationCap },
  { id: 'hotels', name: 'الفنادق والضيافة', slug: 'hotels', path: '/businesses?category=hotels', icon: Hotel },
  { id: 'chalets', name: 'الشاليهات والاستراحات', slug: 'chalets', path: '/businesses?category=chalets', icon: Palmtree },
  { id: 'parks', name: 'الحدائق والمنتزهات', slug: 'parks', path: '/businesses?category=parks', icon: Trees },
  { id: 'wedding-halls', name: 'صالات الأفراح والمناسبات', slug: 'wedding-halls', path: '/businesses?category=wedding-halls', icon: PartyPopper },
  { id: 'salons', name: 'الحلاقين والكوافير', slug: 'salons', path: '/businesses?category=salons', icon: Scissors },
  { id: 'cafes', name: 'المقاهي والكافيهات', slug: 'cafes', path: '/businesses?category=cafes', icon: Coffee },
  { id: 'restaurants', name: 'المطاعم والأغذية', slug: 'restaurants', path: '/businesses?category=restaurants', icon: Utensils },
  { id: 'supermarkets', name: 'السوبرماركت ومراكز التسوق', slug: 'supermarkets', path: '/businesses?category=supermarkets', icon: ShoppingCart },
  { id: 'malls', name: 'المولات والمراكز التجارية', slug: 'malls', path: '/businesses?category=malls', icon: ShoppingBag },
  { id: 'telecom', name: 'الاتصالات والشبكات', slug: 'telecom', path: '/businesses?category=telecom', icon: PhoneCall },
  { id: 'services', name: 'الخدمات العامة والصيانة', slug: 'services', path: '/businesses?category=services', icon: Wrench },
];
