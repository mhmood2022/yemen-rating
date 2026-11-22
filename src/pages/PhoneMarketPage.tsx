import React, { useState, useMemo, useRef, useEffect } from 'react';
import { XSpinner } from '../components/ui/LoadingSpinner';
import {
  Smartphone, Phone, MessageCircle, ArrowRight, Plus, X,
  Upload, Trash2, User, Camera, MoreHorizontal, Globe
} from 'lucide-react';
import { XActionBar } from '../components/feed/XActionBar';
import { AdBanner } from '../components/common/AdBanner';
import { MarketSponsorSlot } from '../components/ads/MarketSponsorSlot';
import { YRSelect, YRSelectOption } from '../components/common/YRSelect';
import {
  XSearchFilterBar, XFilterModal, YEMEN_GOV_FILTER_OPTIONS,
  XToast, XToastState, toArabicMarketError, toWaLink
} from '../components/common/XMarketUI';
import { UserProfile } from '../types/auth';
import { getMyBusinessPage, BusinessPageRecord } from '../services/businessPageService';
import { uploadSocialImage } from '../services/socialService';
import { VerifiedBadge, BadgeType } from '../components/common/VerifiedBadge';
import { supabase } from '../lib/supabase';
import {
  PhonePostTier,
  PhoneVipBanner,
  PhoneProAdCard,
  PhoneBasicAdCard,
  buildPhoneWaText,
} from '../components/phones/PhoneTierCards';

export type PhoneCategory = 'phones' | 'tablets' | 'laptops' | 'accessories' | 'maintenance' | 'sim_services';

export interface PhoneDeviceItem {
  id: string;
  name: string;
  brand: string;
  modelDetails?: string;
  price: number;
  currency: string;
  condition: string;
  storage: string;
  ram?: string;
  processor?: string;
  simSupport?: string;
  delivery?: string;
  negotiable?: string;
  color?: string;
  city: string;
  location?: string;
  contactUrl?: string;
  sellerName: string;
  sellerPhone: string;
  isVerified: boolean;
  images: string[];
  category: PhoneCategory;
  description?: string;
  createdAt: string;
  sellerUsername?: string;
  sellerAvatar?: string;
  badgeType?: BadgeType;
  businessId?: string;
  authorId?: string;
  adTier?: PhonePostTier;
  headline?: string;
  highlights?: string[];
  ctaLabel?: string;
  viewsCount?: number;
  expiresAt?: string;
  likesCount?: number;
  repostsCount?: number;
  repliesCount?: number;
  likedBy?: string[];
  repostedBy?: string[];
}

const PHONES_STORAGE_KEY = 'yr_phone_market_items_v2';

const CATEGORY_LABEL_MAP: Record<PhoneCategory, string> = {
  phones: 'هاتف',
  tablets: 'آيباد',
  laptops: 'لابتوب',
  accessories: 'إكسسوار',
  maintenance: 'صيانة',
  sim_services: 'شريحة وخدمة',
};

const YEMEN_GOVERNORATES = [
  'صنعاء', 'عدن', 'تعز', 'حضرموت', 'إب', 'الحديدة', 'ذمار', 'مأرب',
  'عمران', 'حجة', 'صعدة', 'البيضاء', 'لحج', 'أبين', 'شبوة',
  'المهرة', 'الضالع', 'المحويت', 'ريمة', 'الجوف', 'سقطرى',
];

const PHONE_BRANDS = [
  { id: 'Apple', label: 'آبل (Apple)' },
  { id: 'Samsung', label: 'سامسونج (Samsung)' },
  { id: 'Xiaomi', label: 'شاومي (Xiaomi)' },
  { id: 'Huawei', label: 'هواوي (Huawei)' },
  { id: 'Honor', label: 'هونر (Honor)' },
  { id: 'Oppo', label: 'أوبو (Oppo)' },
  { id: 'Realme', label: 'ريلمي (Realme)' },
  { id: 'Vivo', label: 'فيفو (Vivo)' },
  { id: 'OnePlus', label: 'ون بلس (OnePlus)' },
  { id: 'Google', label: 'جوجل بكسل (Google Pixel)' },
  { id: 'Tecno', label: 'تكنو (Tecno)' },
  { id: 'Infinix', label: 'إنفنكس (Infinix)' },
  { id: 'Nokia', label: 'نوكيا (Nokia)' },
  { id: 'Motorola', label: 'موتورولا (Motorola)' },
  { id: 'Nothing', label: 'ناثينج (Nothing)' },
];

const COMPUTER_BRANDS = [
  { id: 'MacBook', label: 'ماك بوك / آي ماك (Apple Mac)' },
  { id: 'HP', label: 'إتش بي (HP)' },
  { id: 'Dell', label: 'ديل (Dell)' },
  { id: 'Lenovo', label: 'لينوفو (Lenovo)' },
  { id: 'Asus', label: 'أسوس (Asus)' },
  { id: 'Acer', label: 'أيسر (Acer)' },
  { id: 'MSI', label: 'إم إس آي (MSI)' },
  { id: 'Microsoft', label: 'مايكروسوفت سيرفس (Surface)' },
];

const EXTRA_BRANDS = [
  { id: 'Anker', label: 'أنكر (Anker)' },
  { id: 'JBL', label: 'جي بي إل (JBL)' },
  { id: 'YemenMobile', label: 'يمن موبايل (Yemen Mobile)' },
  { id: 'Sabafon', label: 'سبأفون (Sabafon)' },
  { id: 'YOU', label: 'يو (YOU)' },
  { id: 'Other', label: 'متنوع / عام' },
];

const MODELS_BY_CATEGORY_BRAND: Record<string, Record<string, string[]>> = {
  phones: {
    Apple: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12 Pro Max', 'iPhone 12', 'iPhone 11 Pro Max', 'iPhone 11'],
    Samsung: ['Galaxy S25 Ultra', 'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy S22 Ultra', 'Galaxy Z Fold 6', 'Galaxy Z Flip 6', 'Galaxy A55 5G', 'Galaxy A35 5G', 'Galaxy A25', 'Galaxy A15'],
    Xiaomi: ['Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14', 'Xiaomi 13T Pro', 'Redmi Note 14 Pro+', 'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13', 'Poco X6 Pro', 'Poco F6 Pro'],
    Huawei: ['Pura 70 Ultra', 'Pura 70 Pro', 'Mate 60 Pro', 'Nova 12s', 'Nova 11 Pro'],
    Honor: ['Honor Magic 6 Pro', 'Honor 200 Pro', 'Honor 90', 'Honor X9b', 'Honor X8b'],
    Oppo: ['Oppo Find X7 Ultra', 'Oppo Reno 12 Pro', 'Oppo Reno 11', 'Oppo A79'],
    Realme: ['Realme GT 6', 'Realme 12 Pro+', 'Realme C67'],
    Vivo: ['Vivo X100 Pro', 'Vivo V30 Pro', 'Vivo Y36'],
    OnePlus: ['OnePlus 13', 'OnePlus 12', 'OnePlus 11', 'OnePlus Nord 4'],
    Google: ['Pixel 9 Pro XL', 'Pixel 9 Pro', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro'],
    Tecno: ['Tecno Camon 30 Pro', 'Tecno Spark 20 Pro+', 'Tecno Pova 6 Pro'],
    Infinix: ['Infinix Note 40 Pro', 'Infinix Zero 30', 'Infinix Hot 40 Pro'],
    Nokia: ['Nokia XR21', 'Nokia G42', 'Nokia C32'],
    Motorola: ['Motorola Edge 50 Ultra', 'Motorola Razr 50 Ultra'],
    Nothing: ['Nothing Phone (2)', 'Nothing Phone (2a)'],
  },
  tablets: {
    Apple: ['iPad Pro M4 (13 بوصة)', 'iPad Pro M4 (11 بوصة)', 'iPad Pro M2', 'iPad Air M2', 'iPad Air M1', 'iPad 10th Gen', 'iPad mini 6'],
    Samsung: ['Galaxy Tab S9 Ultra', 'Galaxy Tab S9+', 'Galaxy Tab S9', 'Galaxy Tab S9 FE', 'Galaxy Tab A9+'],
    Xiaomi: ['Xiaomi Pad 6S Pro', 'Xiaomi Pad 6', 'Redmi Pad Pro', 'Redmi Pad SE'],
    Huawei: ['MatePad Pro 13.2', 'MatePad 11.5S', 'MatePad SE'],
    Honor: ['Honor Pad 9', 'Honor Pad X9'],
  },
  laptops: {
    MacBook: ['MacBook Pro M4', 'MacBook Pro M3 Max', 'MacBook Pro M2', 'MacBook Air M3', 'MacBook Air M2', 'MacBook Air M1', 'iMac M3'],
    HP: ['HP Spectre x360', 'HP Envy 16', 'HP Victus Gaming', 'HP Pavilion 15', 'HP EliteBook 840', 'HP ProBook 450'],
    Dell: ['Dell XPS 15', 'Dell XPS 13', 'Dell Inspiron 15', 'Dell Latitude 7440', 'Dell G15 Gaming'],
    Lenovo: ['ThinkPad X1 Carbon', 'ThinkPad T14', 'Lenovo Legion 5 Pro', 'Lenovo IdeaPad Slim 5', 'Lenovo Yoga 7'],
    Asus: ['ASUS ROG Strix G16', 'ASUS TUF Gaming A15', 'ASUS Zenbook 14', 'ASUS Vivobook 16'],
    Acer: ['Acer Nitro 5', 'Acer Predator Helios', 'Acer Aspire 5'],
    MSI: ['MSI Raider GE78', 'MSI Katana 15', 'MSI Modern 15'],
    Microsoft: ['Surface Pro 11', 'Surface Laptop 6', 'Surface Pro 9'],
  },
  accessories: {
    Apple: ['سماعة AirPods Pro 2', 'ساعة Apple Watch Ultra 2', 'ساعة Apple Watch Series 10', 'شاحن Apple الأصلي 20W', 'قلم Apple Pencil Pro', 'غطاء MagSafe الأصلي'],
    Samsung: ['سماعة Galaxy Buds 3 Pro', 'ساعة Galaxy Watch Ultra', 'ساعة Galaxy Watch 7', 'شاحن سامسونج الأصلي 45W', 'شاحن سامسونج 25W'],
    Anker: ['شاحن أنكر 65W GaN سريع', 'باور بانك أنكر 20000mAh', 'باور بانك أنكر MagGo لاسلكي', 'كيبل أنكر أصلي PowerLine', 'سماعة Soundcore Liberty 4'],
    JBL: ['سماعة JBL Charge 5', 'سماعة JBL Flip 6', 'سماعة JBL Tune 770NC'],
    Other: ['شاحن سريع أصلي', 'باور بانك 10000/20000mAh', 'سماعة بلوتوث لاسلكية', 'كفر حماية ضد الصدمات', 'لاصق حماية شاشة نانو', 'حامل هاتف للسيارة'],
  },
  maintenance: {
    Apple: ['تغيير شاشة أصلية آيفون', 'تغيير بطارية أصلية آيفون', 'برمجة وفك آيكلاود / شبكات', 'صيانة بورد وآيسيات آيفون', 'تبديل قاعدة شحن آيفون'],
    Samsung: ['تغيير شاشة أصلية سامسونج', 'تغيير بطارية أصلية سامسونج', 'فك شفرات وتفعيل CDMA / 4G', 'تحديث سوفتوير وإصلاح النظام', 'صيانة بورد سامسونج'],
    Other: ['صيانة شاشات أصلية', 'صيانة بورد وآيسيات شاملة', 'برمجة وفك شفرات جميع الأجهزة', 'تغيير بطاريات أصلية بالضمان', 'تنظيف وإصلاح مداخل الشحن'],
  },
  sim_services: {
    YemenMobile: ['شريحة يمن موبايل 4G (جديدة)', 'تفعيل شريحة eSIM يمن موبايل', 'برمجة أرقام يمن موبايل CDMA', 'باقة إنترنت وتفعيل 4G'],
    Sabafon: ['شريحة سبأفون 4G (جديدة)', 'شريحة eSIM سبأفون', 'رقم مميز سبأفون'],
    YOU: ['شريحة YOU 4G (جديدة)', 'شريحة eSIM YOU', 'رقم مميز YOU'],
    Other: ['تفعيل شريحة eSIM لجميع الشبكات', 'فك شفرات وتفعيل شرائح دولية', 'خدمات نقل وتبديل الشرائح'],
  },
};

const STORAGE_OPTIONS: YRSelectOption[] = [
  { value: '16 GB', label: '16 GB' },
  { value: '32 GB', label: '32 GB' },
  { value: '64 GB', label: '64 GB' },
  { value: '128 GB', label: '128 GB' },
  { value: '256 GB', label: '256 GB' },
  { value: '512 GB', label: '512 GB' },
  { value: '1 TB', label: '1 TB' },
  { value: 'لا ينطبق', label: 'لا ينطبق (إكسسوار / خدمة)' },
];

const RAM_OPTIONS: YRSelectOption[] = [
  { value: '2 GB', label: '2 GB' },
  { value: '3 GB', label: '3 GB' },
  { value: '4 GB', label: '4 GB' },
  { value: '6 GB', label: '6 GB' },
  { value: '8 GB', label: '8 GB' },
  { value: '12 GB', label: '12 GB' },
  { value: '16 GB', label: '16 GB' },
  { value: '24 GB', label: '24 GB' },
  { value: '32 GB', label: '32 GB' },
  { value: 'لا ينطبق', label: 'لا ينطبق' },
];

const PROCESSOR_OPTIONS: YRSelectOption[] = [
  { value: 'Apple A18 Pro', label: 'Apple A18 Pro' },
  { value: 'Apple A17 Pro', label: 'Apple A17 Pro' },
  { value: 'Apple A16 Bionic', label: 'Apple A16 Bionic' },
  { value: 'Apple A15 Bionic', label: 'Apple A15 Bionic' },
  { value: 'Apple M4 / M3 / M2', label: 'Apple M4 / M3 / M2' },
  { value: 'Snapdragon 8 Elite', label: 'Snapdragon 8 Elite' },
  { value: 'Snapdragon 8 Gen 3', label: 'Snapdragon 8 Gen 3' },
  { value: 'Snapdragon 8 Gen 2', label: 'Snapdragon 8 Gen 2' },
  { value: 'Snapdragon 7 / 6 Series', label: 'Snapdragon 7 / 6 Series' },
  { value: 'MediaTek Dimensity', label: 'MediaTek Dimensity' },
  { value: 'MediaTek Helio', label: 'MediaTek Helio' },
  { value: 'Samsung Exynos', label: 'Samsung Exynos' },
  { value: 'Google Tensor', label: 'Google Tensor' },
  { value: 'Huawei Kirin', label: 'Huawei Kirin' },
  { value: 'Intel Core i7 / i5', label: 'Intel Core i7 / i5' },
  { value: 'AMD Ryzen', label: 'AMD Ryzen' },
  { value: 'غير محدد', label: 'غير محدد / لا ينطبق' },
];

const SIM_OPTIONS: YRSelectOption[] = [
  { value: 'شريحة واحدة', label: 'شريحة واحدة (GSM)' },
  { value: 'شريحتان', label: 'شريحتان (Dual SIM)' },
  { value: 'eSIM', label: 'eSIM (شريحة إلكترونية)' },
  { value: 'شريحة + eSIM', label: 'شريحة + eSIM' },
  { value: 'CDMA (يمن موبايل)', label: 'CDMA (يمن موبايل)' },
  { value: 'شريحتان + CDMA (يمن موبايل)', label: 'شريحتان + CDMA (يمن موبايل)' },
  { value: 'جميع الشبكات (CDMA + GSM)', label: 'جميع الشبكات (CDMA + GSM)' },
  { value: 'Wi-Fi فقط', label: 'Wi-Fi فقط / لا يدعم شريحة' },
];

const CONDITION_OPTIONS: YRSelectOption[] = [
  { value: 'جديد', label: 'جديد' },
  { value: 'مستعمل', label: 'مستعمل' },
  { value: 'مجدد', label: 'مجدد' },
];

const COLOR_OPTIONS: YRSelectOption[] = [
  { value: 'تيتانيوم طبيعي', label: 'تيتانيوم طبيعي' },
  { value: 'أسود', label: 'أسود' },
  { value: 'أبيض', label: 'أبيض' },
  { value: 'فضي', label: 'فضي' },
  { value: 'رمادي', label: 'رمادي' },
  { value: 'ذهبي', label: 'ذهبي' },
  { value: 'أزرق', label: 'أزرق' },
  { value: 'أخضر', label: 'أخضر' },
  { value: 'بنفسجي', label: 'بنفسجي' },
  { value: 'أحمر', label: 'أحمر' },
  { value: 'برونزي', label: 'برونزي' },
];

const DELIVERY_OPTIONS: YRSelectOption[] = [
  { value: 'متوفر', label: 'متوفر' },
  { value: 'غير متوفر', label: 'غير متوفر' },
];

const NEGOTIABLE_OPTIONS: YRSelectOption[] = [
  { value: 'نعم', label: 'نعم (قابل للتفاوض)' },
  { value: 'لا', label: 'لا (سعر نهائي)' },
];

function formatPhoneTimeAgo(dateStr: string): string {
  if (!dateStr) return 'الآن';
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;
  const diffSec = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const toAr = (n: number | string) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  if (diffSec < 60) return 'الآن';
  if (diffMin < 60) return `${toAr(diffMin)} د`;
  if (diffHour < 24) return `${toAr(diffHour)} س`;
  if (diffDay < 7) return `${toAr(diffDay)} ي`;
  return `${toAr(parsed.getDate())} ${parsed.toLocaleDateString('ar-YE', { month: 'short' })}`;
}

function getDefaultHandle(phone: PhoneDeviceItem): string {
  if (phone.sellerUsername) return phone.sellerUsername.replace(/^@+/, '');
  const map: Record<string, string> = {
    'ph-1': 'gulf_smart',
    'ph-2': 'samsung_aden',
    'ph-3': 'phone_zone',
    'ph-4': 'mukalla_phone',
    'ph-5': 'alasriya_acc',
  };
  return map[phone.id] || phone.brand.toLowerCase();
}

function getBrandsForCategory(cat: PhoneCategory): YRSelectOption[] {
  if (cat === 'phones') return PHONE_BRANDS.map((b) => ({ value: b.id, label: b.label }));
  if (cat === 'tablets') {
    return [
      ...PHONE_BRANDS.filter((b) => ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Honor', 'Lenovo'].includes(b.id)).map((b) => ({ value: b.id, label: b.label })),
      { value: 'Other', label: 'أخرى' },
    ];
  }
  if (cat === 'laptops') return COMPUTER_BRANDS.map((b) => ({ value: b.id, label: b.label }));
  if (cat === 'accessories') {
    return [
      { value: 'Apple', label: 'آبل (Apple)' },
      { value: 'Samsung', label: 'سامسونج (Samsung)' },
      { value: 'Anker', label: 'أنكر (Anker)' },
      { value: 'JBL', label: 'جي بي إل (JBL)' },
      { value: 'Other', label: 'متنوع / عام' },
    ];
  }
  if (cat === 'maintenance') {
    return [
      { value: 'Apple', label: 'آبل (Apple)' },
      { value: 'Samsung', label: 'سامسونج (Samsung)' },
      { value: 'Other', label: 'جميع الأجهزة والشركات' },
    ];
  }
  return [
    { value: 'YemenMobile', label: 'يمن موبايل (Yemen Mobile)' },
    { value: 'Sabafon', label: 'سبأفون (Sabafon)' },
    { value: 'YOU', label: 'يو (YOU)' },
    { value: 'Other', label: 'خدمات شرائح عامة' },
  ];
}

function getModelsFor(cat: PhoneCategory, brand: string): YRSelectOption[] {
  const catMap = MODELS_BY_CATEGORY_BRAND[cat] || {};
  const list = catMap[brand] || catMap['Other'] || Object.values(catMap)[0] || ['موديل قياسي'];
  return list.map((m) => ({ value: m, label: m }));
}

const INITIAL_PHONES: PhoneDeviceItem[] = [
  {
    id: 'ph-1',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: 620000,
    currency: 'YER',
    condition: 'جديد',
    storage: '256 GB',
    ram: '8 GB',
    processor: 'Apple A17 Pro',
    simSupport: 'شريحتان + CDMA (يمن موبايل)',
    delivery: 'متوفر',
    negotiable: 'لا',
    color: 'تيتانيوم طبيعي',
    city: 'صنعاء',
    sellerName: 'مركز الخليج الذكي',
    sellerPhone: '967777123456',
    isVerified: true,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'phones',
    createdAt: 'اليوم',
    adTier: 'vip',
    headline: 'أقوى عروض آيفون 15 برو ماكس — ضمان حقيقي وشحن فوري',
    highlights: ['ضمان حقيقي معتمد', 'شحن سريع لجميع المحافظات', 'دعم فني متواصل'],
    ctaLabel: 'تسوق الآن',
    viewsCount: 125000
  },
  {
    id: 'ph-2',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 580000,
    currency: 'YER',
    condition: 'جديد',
    storage: '512 GB',
    ram: '12 GB',
    processor: 'Snapdragon 8 Gen 3',
    simSupport: 'جميع الشبكات (CDMA + GSM)',
    delivery: 'متوفر',
    negotiable: 'نعم',
    color: 'رمادي',
    city: 'عدن',
    sellerName: 'سامسونج ستور عدن',
    sellerPhone: '967733987654',
    isVerified: true,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'phones',
    createdAt: 'أمس',
    adTier: 'pro',
    headline: 'أداء فائق .. كاميرا احترافية .. بسعر لا يُقاوم',
    highlights: ['512GB سعة تخزين', '12GB رام فائق السرعة', 'بطارية قوية طوال اليوم', 'توصيل مجاني داخل عدن'],
    ctaLabel: 'تواصل معنا',
    viewsCount: 78000
  },
  {
    id: 'ph-3',
    name: 'iPad Pro M4 (13 بوصة)',
    brand: 'Apple',
    price: 495000,
    currency: 'YER',
    condition: 'جديد',
    storage: '256 GB',
    ram: '8 GB',
    processor: 'Apple M4 / M3 / M2',
    simSupport: 'eSIM',
    delivery: 'متوفر',
    negotiable: 'نعم',
    color: 'فضي',
    city: 'تعز',
    sellerName: 'فون زون تعز',
    sellerPhone: '967711223344',
    isVerified: true,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'tablets',
    createdAt: 'منذ يومين',
    adTier: 'basic',
    headline: 'تصميم أقوى .. أداء أسرع لأعمالك ودراستك',
    highlights: ['256GB مساحة داخلية', 'شاشة مميزة M4', 'ضمان معتمد سنة'],
    ctaLabel: 'احصل عليه الآن',
    viewsCount: 62000
  },
  {
    id: 'ph-4',
    name: 'iPhone 13 Pro',
    brand: 'Apple',
    price: 315000,
    currency: 'YER',
    condition: 'مستعمل',
    storage: '128 GB',
    ram: '6 GB',
    processor: 'Apple A15 Bionic',
    simSupport: 'شريحتان',
    delivery: 'غير متوفر',
    negotiable: 'نعم',
    color: 'أزرق',
    city: 'حضرموت',
    sellerName: 'المكلا فون',
    sellerPhone: '967770112233',
    isVerified: false,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'phones',
    createdAt: 'منذ 3 أيام'
  },
  {
    id: 'ph-5',
    name: 'شاحن أنكر 65W GaN سريع',
    brand: 'Anker',
    price: 19000,
    currency: 'YER',
    condition: 'جديد',
    storage: 'لا ينطبق',
    ram: 'لا ينطبق',
    delivery: 'متوفر',
    negotiable: 'لا',
    color: 'أسود',
    city: 'صنعاء',
    sellerName: 'العصرية للإكسسوارات',
    sellerPhone: '967777000111',
    isVerified: true,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'accessories',
    createdAt: 'أمس'
  }
];

export const PhoneMarketPage: React.FC<{ onNavigate: (path: string) => void; embedded?: boolean }> = ({ onNavigate, embedded = false }) => {
  const [activeTab, setActiveTab] = useState<'all' | PhoneCategory>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStorage, setSelectedStorage] = useState<string>('all');
  const [selectedNegotiable, setSelectedNegotiable] = useState<string>('all');
  const fmtAmt = (v: string) => {
    const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
    return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [slot1AdId, setSlot1AdId] = useState<string | null | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (!embedded) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [embedded]);

  const activeFiltersCount =
    (activeTab !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedCondition !== 'all' ? 1 : 0) +
    (selectedStorage !== 'all' ? 1 : 0) +
    (selectedNegotiable !== 'all' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setActiveTab('all');
    setSelectedBrand('all');
    setSelectedCondition('all');
    setSelectedStorage('all');
    setSelectedNegotiable('all');
    setSelectedCity('all');
  };

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myBusinessPage, setMyBusinessPage] = useState<BusinessPageRecord | null>(null);
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);

  const [phonesList, setPhonesList] = useState<PhoneDeviceItem[]>(() => {
    try {
      const saved = localStorage.getItem(PHONES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultsById = new Map(INITIAL_PHONES.map((x) => [x.id, x]));
          return parsed.map((item: PhoneDeviceItem) => {
            const def = defaultsById.get(item.id);
            if (def && !item.adTier) {
              return { ...def, ...item, adTier: def.adTier, headline: def.headline, highlights: def.highlights, ctaLabel: def.ctaLabel, viewsCount: def.viewsCount };
            }
            return item;
          });
        }
      }
    } catch {}
    return INITIAL_PHONES;
  });

  const [selectedPhone, setSelectedPhone] = useState<PhoneDeviceItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<XToastState | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success', ms = 3500) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), ms);
  };

  // نافذة إضافة إعلان: جميع الحقول قوائم منسدلة باستثناء السعر بالريال اليمني
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [composeKind, setComposeKind] = useState<'free' | 'paid'>('free');
  const [selectedAdTier, setSelectedAdTier] = useState<PhonePostTier>('basic');
  const [freeTweetText, setFreeTweetText] = useState('');
  const [freeOptionalPrice, setFreeOptionalPrice] = useState('');
  const [freeShowOptionalSpecs, setFreeShowOptionalSpecs] = useState(false);
  const [adHeadline, setAdHeadline] = useState('');
  const [adHighlightsText, setAdHighlightsText] = useState('');
  const [adCtaLabel, setAdCtaLabel] = useState('تواصل معنا');
  const [accountPlanKey, setAccountPlanKey] = useState<'regular' | 'vip' | 'vip_pro'>('regular');
  const [activeVipIdx, setActiveVipIdx] = useState(0);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const [activeTweetMenuId, setActiveTweetMenuId] = useState<string | null>(null);
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerPhoneTouched, setSellerPhoneTouched] = useState(false);
  const normalizeYemenPhone = (val: string) =>
    val.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\D/g, '').slice(0, 9);
  const [adLocationOrSite, setAdLocationOrSite] = useState('');
  const isValidYemenPhone = (val: string) => /^(73|71|77|78)\d{7}$/.test(val);
  const [phoneCategory, setPhoneCategory] = useState<PhoneCategory>('phones');
  const [phoneBrand, setPhoneBrand] = useState<string>('Apple');
  const [phoneModel, setPhoneModel] = useState<string>('iPhone 15 Pro Max');
  const [phoneStorage, setPhoneStorage] = useState<string>('256 GB');
  const [phoneRam, setPhoneRam] = useState<string>('8 GB');
  const [phoneProcessor, setPhoneProcessor] = useState<string>('Apple A17 Pro');
  const [phoneSim, setPhoneSim] = useState<string>('شريحتان + CDMA (يمن موبايل)');
  const [phoneCondition, setPhoneCondition] = useState<string>('جديد');
  const [phoneColor, setPhoneColor] = useState<string>('تيتانيوم طبيعي');
  const [phoneDelivery, setPhoneDelivery] = useState<string>('متوفر');
  const [phonePrice, setPhonePrice] = useState<string>('250,000');
  const [phoneNegotiable, setPhoneNegotiable] = useState<string>('نعم');
  const [phoneCity, setPhoneCity] = useState<string>('صنعاء');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const loadIdentity = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id || '';
        if (!active) return;
        setCurrentUserId(uid);

        if (!uid) {
          setProfile(null);
          setMyBusinessPage(null);
          setAccountPlanKey('regular');
          setIsSubscriptionExpired(false);
          setSubscriptionEndDate(null);
          return;
        }

        const [{ data: profData }, biz, { data: latestSub }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
          getMyBusinessPage(uid),
          supabase
            .from('subscriptions')
            .select('id, status, end_date, plan:subscription_plans(name, badge_type)')
            .eq('user_id', uid)
            .in('status', ['ACTIVE', 'EXPIRED'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (!active) return;
        if (profData) {
          const p = profData as UserProfile;
          setProfile(p);
          setSellerName((prev) => prev || p.full_name || '');
          if (p.phone) setSellerPhone((prev) => prev || normalizeYemenPhone(p.phone!.replace(/^(\+?967)/, '')));
        }
        if (biz) {
          setMyBusinessPage(biz);
          setSellerName(biz.name || '');
          if (biz.phone) setSellerPhone((prev) => prev || normalizeYemenPhone(biz.phone!.replace(/^(\+?967)/, '')));
          if (biz.city) setPhoneCity(biz.city);
        }

        const subRow: any = latestSub;
        const endDateStr: string | null = subRow?.end_date || null;
        const isExpiredByDate = Boolean(endDateStr && !Number.isNaN(new Date(endDateStr).getTime()) && new Date(endDateStr).getTime() < Date.now());
        const subExpired = Boolean(subRow && (subRow.status === 'EXPIRED' || isExpiredByDate));
        const hasValidSub = Boolean(subRow && subRow.status === 'ACTIVE' && !isExpiredByDate);

        setIsSubscriptionExpired(subExpired);
        setSubscriptionEndDate(endDateStr);

        const subPlan: any = hasValidSub ? subRow?.plan : null;
        const planBadge = String(
          subPlan?.badge_type ||
          (!subExpired ? ((profData as any)?.verification_type || biz?.verificationType) : '') ||
          ''
        ).toLowerCase();
        const planName = String(subPlan?.name || '');
        if (planBadge === 'gold' || planName.includes('احترافي') || planName.toLowerCase().includes('pro') || (!subExpired && biz?.isVerified)) {
          setAccountPlanKey('vip_pro');
        } else if (planBadge === 'blue' || planBadge === 'vip' || hasValidSub) {
          setAccountPlanKey('vip');
        } else {
          setAccountPlanKey('regular');
        }
      } catch (err) {
        console.warn('PhoneMarketPage identity load fallback:', err);
      }
    };
    loadIdentity();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { loadIdentity(); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const handleCategoryChange = (cat: PhoneCategory) => {
    setPhoneCategory(cat);
    const brands = getBrandsForCategory(cat);
    const nextBrand = brands[0]?.value || 'Other';
    setPhoneBrand(nextBrand);
    const models = getModelsFor(cat, nextBrand);
    setPhoneModel(models[0]?.value || '');
    if (cat === 'accessories' || cat === 'maintenance' || cat === 'sim_services') {
      setPhoneStorage('لا ينطبق');
      setPhoneRam('لا ينطبق');
      setPhoneProcessor('غير محدد');
    } else {
      setPhoneStorage('256 GB');
      setPhoneRam('8 GB');
      setPhoneProcessor(nextBrand === 'Apple' ? 'Apple A17 Pro' : 'Snapdragon 8 Gen 3');
    }
  };

  const handleBrandChange = (brand: string) => {
    setPhoneBrand(brand);
    const models = getModelsFor(phoneCategory, brand);
    setPhoneModel(models[0]?.value || '');
  };

  const handleOpenPhone = (phone: PhoneDeviceItem) => {
    setSelectedPhone(phone);
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 6 - uploadedImages.length;
      const filesToTake = Array.from(files).slice(0, remainingSlots);
      setUploadedFiles(prev => [...prev, ...filesToTake]);
      filesToTake.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setUploadedImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !selectedPhone) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) {
      setActiveImageIndex(prev => diff > 0
        ? (prev + 1) % selectedPhone.images.length
        : (prev - 1 + selectedPhone.images.length) % selectedPhone.images.length);
    }
    touchStartX.current = null;
  };

  const tierLimits = useMemo(() => {
    if (accountPlanKey === 'vip_pro') {
      return { label: 'مشترك VIP احترافي', dailyFree: 20, monthlyFeatured: 8, canBasic: true, canPro: true, canVip: true };
    }
    if (accountPlanKey === 'vip') {
      return { label: 'مشترك VIP', dailyFree: 10, monthlyFeatured: 4, canBasic: true, canPro: true, canVip: false };
    }
    return { label: 'مستخدم عادي', dailyFree: 3, monthlyFeatured: 0, canBasic: false, canPro: false, canVip: false };
  }, [accountPlanKey]);

  const activeAuthorKey = currentUserId || 'guest_local';

  const usageStats = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * oneDayMs;
    const mine = phonesList.filter((item) => item.authorId === activeAuthorKey);
    const todayFreeCount = mine.filter((item) => {
      const t = new Date(item.createdAt).getTime();
      return (!item.adTier || item.adTier === 'free') && !Number.isNaN(t) && (now - t) < oneDayMs;
    }).length;
    const monthFeaturedCount = mine.filter((item) => {
      const t = new Date(item.createdAt).getTime();
      return item.adTier && item.adTier !== 'free' && !Number.isNaN(t) && (now - t) < thirtyDaysMs;
    }).length;
    return { todayFreeCount, monthFeaturedCount };
  }, [phonesList, activeAuthorKey]);

  const limitBlockReason = useMemo(() => {
    if (composeKind === 'free') {
      if (usageStats.todayFreeCount >= tierLimits.dailyFree) {
        return `انتهى الحد اليومي للنشر المجاني (${usageStats.todayFreeCount}/${tierLimits.dailyFree} تغريدات يومياً لباقة ${tierLimits.label}). حاول غداً أو رقِّ باقتك لزيادة الحد.`;
      }
      return null;
    }
    if (isSubscriptionExpired) {
      const dateTxt = subscriptionEndDate ? ` (${new Date(subscriptionEndDate).toLocaleDateString('ar-YE')})` : '';
      return `انتهت صلاحية اشتراكك المدفوع${dateTxt}. جدّد الاشتراك للاستمرار في نشر التغريدات المميزة.`;
    }
    if (tierLimits.monthlyFeatured === 0) {
      return 'باقة المستخدم العادي (3 تغريدات مجانية يومياً) لا تشمل التغريدات المميزة. اشترك في VIP (4 شهرياً) أو VIP احترافي (8 شهرياً).';
    }
    if (selectedAdTier === 'vip' && !tierLimits.canVip) {
      return 'باقة VIP المثبتة متاحة لمشتركي باقة VIP احترافي فقط (8 تغريدات مميزة شهرياً).';
    }
    if (usageStats.monthFeaturedCount >= tierLimits.monthlyFeatured) {
      return `انتهى رصيدك الشهري من التغريدات المميزة (${usageStats.monthFeaturedCount}/${tierLimits.monthlyFeatured} لباقة ${tierLimits.label}). يتجدد الشهر القادم أو عند الترقية.`;
    }
    return null;
  }, [composeKind, usageStats, tierLimits, isSubscriptionExpired, subscriptionEndDate, selectedAdTier]);

  const togglePhoneLike = (phoneId: string) => {
    setPhonesList((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== phoneId) return item;
        const likedBy = Array.isArray(item.likedBy) ? item.likedBy : [];
        const hasLiked = likedBy.includes(activeAuthorKey);
        const nextLikedBy = hasLiked ? likedBy.filter((id) => id !== activeAuthorKey) : [...likedBy, activeAuthorKey];
        const baseLikes = Number(item.likesCount ?? 0);
        return {
          ...item,
          likedBy: nextLikedBy,
          likesCount: Math.max(0, baseLikes + (hasLiked ? -1 : 1)),
        };
      });
      try { localStorage.setItem(PHONES_STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const togglePhoneRepost = (phoneId: string) => {
    setPhonesList((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== phoneId) return item;
        const repostedBy = Array.isArray(item.repostedBy) ? item.repostedBy : [];
        const hasReposted = repostedBy.includes(activeAuthorKey);
        const nextRepostedBy = hasReposted ? repostedBy.filter((id) => id !== activeAuthorKey) : [...repostedBy, activeAuthorKey];
        const baseReposts = Number(item.repostsCount ?? 0);
        return {
          ...item,
          repostedBy: nextRepostedBy,
          repostsCount: Math.max(0, baseReposts + (hasReposted ? -1 : 1)),
        };
      });
      try { localStorage.setItem(PHONES_STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteOwnPhonePost = (phoneId: string) => {
    setPhonesList((prev) => {
      const updated = prev.filter((item) => item.id !== phoneId);
      try { localStorage.setItem(PHONES_STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    setActiveTweetMenuId(null);
    showToast('تم حذف المنشور', 'success', 2500);
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPhone) return;
    if (limitBlockReason) {
      showToast(limitBlockReason, 'error', 4500);
      return;
    }

    const rawAccountPhone = (myBusinessPage?.phone || profile?.phone || '').trim();
    const normalizedAccountPhone = rawAccountPhone ? normalizeYemenPhone(rawAccountPhone.replace(/^(\+?967)/, '')) : '';
    const cleanedManualPhone = normalizeYemenPhone(sellerPhone);
    const effectivePhone = cleanedManualPhone || normalizedAccountPhone;
    const numericPrice = composeKind === 'free'
      ? (Number(String(freeOptionalPrice).replace(/,/g, '')) || 0)
      : (Number(String(phonePrice).replace(/,/g, '')) || 0);

    if (composeKind === 'free') {
      if (!freeTweetText.trim() && uploadedImages.length === 0 && !freeShowOptionalSpecs) {
        showToast('اكتب نص التغريدة أو أرفق صوراً أولاً', 'error', 3500);
        return;
      }
    } else {
      if (!numericPrice || numericPrice <= 0) {
        showToast('يرجى كتابة السعر بالريال اليمني', 'error', 3500);
        return;
      }
      setSellerPhoneTouched(true);
      if (!isValidYemenPhone(effectivePhone)) {
        showToast('الرقم خاطئ', 'error', 3500);
        return;
      }
    }

    setIsSubmittingPhone(true);
    try {
      let finalImages: string[] = [];
      if (uploadedFiles.length > 0 && currentUserId) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          try {
            const url = await uploadSocialImage(uploadedFiles[i], 'phones');
            if (url) finalImages.push(url);
          } catch {
            if (uploadedImages[i]) finalImages.push(uploadedImages[i]);
          }
        }
      }
      if (finalImages.length === 0 && uploadedImages.length > 0) {
        finalImages = uploadedImages.filter((u) => Boolean(u && u.trim()));
      }

      const activeName = myBusinessPage?.name || sellerName.trim() || profile?.full_name || 'بائع معتمد';
      const activeUsername = myBusinessPage?.username || (profile as any)?.username || (profile?.email ? profile.email.split('@')[0] : 'seller');
      const activeAvatar = myBusinessPage?.avatarUrl || profile?.avatar_url || '';
      const activeBadge: BadgeType = myBusinessPage
        ? ((myBusinessPage.verificationType as BadgeType) || (myBusinessPage.isVerified ? 'gold' : 'none'))
        : ((profile as any)?.badge_type || ((profile as any)?.is_verified ? 'blue' : 'none'));

      const parsedHighlights = adHighlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4);

      const resolvedTier: PhonePostTier = composeKind === 'free' ? 'free' : selectedAdTier;
      const resolvedImages =
        uploadedImages.length === 0 && uploadedFiles.length === 0
          ? []
          : finalImages.filter((u) => Boolean(u && u.trim() && !u.includes('yr-logo')));
      const rawLoc = adLocationOrSite.trim();
      const isLocUrl = Boolean(rawLoc && (/^https?:\/\//i.test(rawLoc) || /^[a-z0-9-]+\.[a-z]{2,}/i.test(rawLoc)));
      const resolvedContactUrl = isLocUrl ? (/^https?:\/\//i.test(rawLoc) ? rawLoc : `https://${rawLoc}`) : undefined;
      const resolvedLocationText = rawLoc && !isLocUrl ? rawLoc : undefined;

      const isPureFreeTweet = composeKind === 'free' && !freeShowOptionalSpecs;
      const newEntry: PhoneDeviceItem = {
        id: `ph-${Date.now()}`,
        name: isPureFreeTweet ? (freeTweetText.trim().slice(0, 42) || 'تغريدة') : (phoneModel || `${phoneBrand}`),
        brand: isPureFreeTweet ? '' : phoneBrand,
        price: numericPrice,
        currency: 'YER',
        condition: isPureFreeTweet ? '' : phoneCondition,
        storage: isPureFreeTweet ? '' : phoneStorage,
        ram: isPureFreeTweet ? '' : phoneRam,
        processor: isPureFreeTweet ? '' : phoneProcessor,
        simSupport: isPureFreeTweet ? '' : phoneSim,
        delivery: isPureFreeTweet ? '' : phoneDelivery,
        negotiable: isPureFreeTweet ? '' : phoneNegotiable,
        color: isPureFreeTweet ? '' : phoneColor,
        city: phoneCity,
        location: composeKind === 'paid' ? resolvedLocationText : undefined,
        contactUrl: composeKind === 'paid' ? resolvedContactUrl : undefined,
        sellerName: activeName,
        sellerUsername: activeUsername,
        sellerAvatar: activeAvatar,
        sellerPhone: composeKind === 'free' ? '' : effectivePhone,
        isVerified: Boolean(myBusinessPage?.isVerified || (activeBadge && activeBadge !== 'none')),
        badgeType: activeBadge,
        businessId: myBusinessPage?.id,
        authorId: activeAuthorKey,
        expiresAt: composeKind === 'paid' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        images: resolvedImages,
        category: phoneCategory,
        description: composeKind === 'free' ? freeTweetText.trim() : adHeadline.trim() || undefined,
        adTier: resolvedTier,
        headline: composeKind === 'paid' ? (adHeadline.trim() || `${CATEGORY_LABEL_MAP[phoneCategory]} ${phoneModel}`) : undefined,
        highlights: composeKind === 'paid' && parsedHighlights.length > 0 ? parsedHighlights : undefined,
        ctaLabel: composeKind === 'paid' ? adCtaLabel : undefined,
        viewsCount: composeKind === 'paid' ? 1 : undefined,
        createdAt: new Date().toISOString(),
      };

      setPhonesList(prev => {
        const updated = [newEntry, ...prev];
        try { localStorage.setItem(PHONES_STORAGE_KEY, JSON.stringify(updated)); } catch {}
        return updated;
      });
      setIsAddModalOpen(false);
      if (composeKind === 'paid') {
        setActiveTab('all');
        setSearchQuery('');
        setSelectedBrand('all');
        setSelectedCondition('all');
        setSelectedStorage('all');
        setSelectedNegotiable('all');
        setSelectedCity('all');
        if (resolvedTier === 'vip') setActiveVipIdx(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setUploadedImages([]);
      setUploadedFiles([]);
      setFreeTweetText('');
      setFreeOptionalPrice('');
      setFreeShowOptionalSpecs(false);
      setAdHeadline('');
      setAdHighlightsText('');
      setAdLocationOrSite('');
      setSellerPhoneTouched(false);
      showToast(composeKind === 'free' ? 'تم نشر التغريدة المجانية بنجاح' : 'تم نشر الإعلان المدفوع بنجاح', 'success', 3500);
    } catch (err: any) {
      showToast(toArabicMarketError(err, 'تعذر نشر الإعلان حالياً، يرجى المحاولة لاحقاً'), 'error', 4000);
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  const filteredPhones = useMemo(() => {
    return phonesList.filter(item => {
      const matchCategory = activeTab === 'all' || item.category === activeTab;
      const matchBrand = selectedBrand === 'all' || item.brand === selectedBrand;
      const matchCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      const matchStorage = selectedStorage === 'all' || item.storage === selectedStorage;
      const matchNeg = selectedNegotiable === 'all' || item.negotiable === selectedNegotiable;
      const matchCity = selectedCity === 'all' || item.city.includes(selectedCity);
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        (item.storage || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.city || '').toLowerCase().includes(q) ||
        (CATEGORY_LABEL_MAP[item.category] || '').includes(q);
      const isExpiredAd = Boolean(
        item.adTier &&
        item.adTier !== 'free' &&
        item.expiresAt &&
        !Number.isNaN(new Date(item.expiresAt).getTime()) &&
        new Date(item.expiresAt).getTime() < Date.now()
      );
      return !isExpiredAd && matchCategory && matchBrand && matchCondition && matchStorage && matchNeg && matchCity && matchSearch;
    });
  }, [phonesList, activeTab, selectedBrand, selectedCondition, selectedStorage, selectedNegotiable, selectedCity, searchQuery]);

  const vipPhones = useMemo(
    () => filteredPhones.filter((item) => item.adTier === 'vip'),
    [filteredPhones]
  );

  const feedPhones = useMemo(() => {
    const rest = filteredPhones.filter((item) => item.adTier !== 'vip');
    const toTime = (d?: string) => {
      const t = d ? new Date(d).getTime() : 0;
      return Number.isNaN(t) ? 0 : t;
    };
    const frees = rest.filter((item) => !item.adTier || item.adTier === 'free');
    const paids = rest
      .filter((item) => item.adTier === 'pro' || item.adTier === 'basic')
      .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));

    if (frees.length === 0) return paids;
    if (paids.length === 0) return frees;

    const merged: PhoneDeviceItem[] = [];
    let pIdx = 0;
    let fIdx = 0;
    const paidFirst = toTime(paids[0]?.createdAt) >= toTime(frees[0]?.createdAt);
    if (paidFirst) merged.push(paids[pIdx++]);
    while (fIdx < frees.length || pIdx < paids.length) {
      if (fIdx < frees.length) merged.push(frees[fIdx++]);
      if (pIdx < paids.length) merged.push(paids[pIdx++]);
    }
    return merged;
  }, [filteredPhones]);

  useEffect(() => {
    if (vipPhones.length <= 1) {
      setActiveVipIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setActiveVipIdx((prev) => (prev + 1) % vipPhones.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [vipPhones.length]);

  const currentVipPhone = vipPhones.length > 0 ? vipPhones[activeVipIdx % vipPhones.length] : null;

  const activeBrandOptions = useMemo(() => getBrandsForCategory(phoneCategory), [phoneCategory]);
  const activeModelOptions = useMemo(() => getModelsFor(phoneCategory, phoneBrand), [phoneCategory, phoneBrand]);
  const isDeviceCat = phoneCategory === 'phones' || phoneCategory === 'tablets' || phoneCategory === 'laptops';

  const renderSpecBadges = (item: PhoneDeviceItem) => {
    const rows: { k: string; v: string }[] = [];
    if (item.category === 'phones' || item.category === 'tablets' || item.category === 'laptops') {
      if (item.storage && item.storage !== 'لا ينطبق') rows.push({ k: 'التخزين', v: item.storage });
      if (item.ram && item.ram !== 'لا ينطبق') rows.push({ k: 'الرام', v: item.ram });
      if (item.processor && item.processor !== 'غير محدد') rows.push({ k: 'المعالج', v: item.processor });
      if (item.simSupport) rows.push({ k: 'الشريحة', v: item.simSupport });
    }
    if (item.condition) rows.push({ k: 'الحالة', v: item.condition });
    if (item.color) rows.push({ k: 'اللون', v: item.color });
    if (item.delivery) rows.push({ k: 'التوصيل', v: item.delivery });
    if (item.negotiable) rows.push({ k: 'التفاوض', v: item.negotiable });
    if (item.city) rows.push({ k: 'المحافظة', v: item.city });
    return rows.filter((r) => r.v && !['غير موجود', 'غير محدد', 'لا ينطبق'].includes(r.v.trim()));
  };

  useEffect(() => {
    const el = bottomSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount < filteredPhones.length && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 12);
            setIsLoadingMore(false);
          }, 360);
        }
      },
      { rootMargin: '120px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visibleCount, filteredPhones.length, isLoadingMore]);

  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-white"}>
      {(!embedded && !selectedPhone) && (
        <div className="space-y-2.5 border-b border-[#2F3336] pb-3">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
              <Smartphone size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white leading-none">سوق الهواتف والأجهزة</h1>
              <span className="text-[9.5px] text-[#9CA3AF] mt-0.5 block">أحدث الجوالات والآيبادات والإكسسوارات ومراكز الصيانة</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus size={13} />
              <span>إعلان جديد</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>الرئيسية</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </button>
          </div>
          </div>
          <MarketSponsorSlot section="phones" />
        </div>
      )}

      <XToast toast={toastMessage} />

        {selectedPhone ? ((() => {
          const livePhone = phonesList.find((p) => p.id === selectedPhone.id) || selectedPhone;
          const isFreeTweet = !livePhone.adTier || livePhone.adTier === 'free';
          const cleanImages = (Array.isArray(livePhone.images) ? livePhone.images : [])
            .map((u) => (u || '').trim())
            .filter((u) => Boolean(u && !u.includes('yr-logo')));
          const cleanSpecs = isFreeTweet
            ? []
            : renderSpecBadges(livePhone).filter(
                (r) => r.v && !['لا ينطبق', 'غير محدد', 'غير موجود', '-'].includes(String(r.v).trim())
              );
          const hasContactPhone = !isFreeTweet && Boolean(livePhone.sellerPhone && livePhone.sellerPhone.trim());
          const waHref = hasContactPhone
            ? toWaLink(
                livePhone.sellerPhone,
                buildPhoneWaText(livePhone, CATEGORY_LABEL_MAP[livePhone.category])
              )
            : '';
          const shareSummary = isFreeTweet
            ? `${livePhone.description || livePhone.name}${livePhone.price > 0 ? ` - ${livePhone.price.toLocaleString()} ر.ي` : ''}`
            : `${CATEGORY_LABEL_MAP[livePhone.category]} ${livePhone.name}${livePhone.price > 0 ? ` - ${livePhone.price.toLocaleString()} ر.ي` : ''}`;
          const isLiked = Boolean(livePhone.likedBy && activeAuthorKey && livePhone.likedBy.includes(activeAuthorKey));
          const isReposted = Boolean(livePhone.repostedBy && activeAuthorKey && livePhone.repostedBy.includes(activeAuthorKey));
          const locationDisplay = [livePhone.city, livePhone.location].filter(Boolean).join(' - ');
          return (
            <div data-no-tab-swipe="true" className="bg-black min-h-screen pb-24">
              <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-[#2F3336]/60 px-3 py-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPhone(null)}
                  aria-label="رجوع"
                  className="w-8 h-8 rounded-full hover:bg-white/10 active:scale-95 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <ArrowRight size={17} />
                </button>
                <h2 className="text-[13.5px] font-bold text-white">
                  {isFreeTweet ? 'المنشور' : 'تفاصيل الإعلان'}
                </h2>
              </div>

              <article className="px-4 pt-2">
                <div className="bg-black">
                  <div className="pb-2 flex items-center justify-between gap-2 bg-black">
                    <div
                      onClick={() => { if (livePhone.businessId) onNavigate(`/businesses/${livePhone.businessId}`); }}
                      className={`flex items-center gap-2.5 min-w-0 flex-1 ${livePhone.businessId ? 'cursor-pointer' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-black border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 text-white font-bold text-xs">
                        {livePhone.sellerAvatar ? (
                          <img src={livePhone.sellerAvatar} alt={livePhone.sellerName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{livePhone.sellerName?.[0] || 'م'}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-bold text-[#E7E9EA] text-[14px] hover:underline truncate max-w-[180px] sm:max-w-[260px]">
                            {livePhone.sellerName}
                          </span>
                          <VerifiedBadge type={livePhone.badgeType || (livePhone.isVerified ? 'gold' : 'none')} size={14} className="shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11.5px] text-[#71767B] min-w-0">
                          <span className="truncate max-w-[120px]" dir="ltr">@{getDefaultHandle(livePhone)}</span>
                          <span>·</span>
                          <span className="shrink-0">{formatPhoneTimeAgo(livePhone.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {!isFreeTweet && livePhone.condition && (
                      <span className="shrink-0 text-[11px] font-medium text-[#71767B]">
                        {CATEGORY_LABEL_MAP[livePhone.category]} · {livePhone.condition}
                      </span>
                    )}
                  </div>

                  {isFreeTweet ? (
                    <div className="bg-black pt-1 space-y-2.5">
                      <p dir="auto" className="text-[15px] leading-[23px] text-[#E7E9EA] whitespace-pre-wrap break-words select-text">
                        {livePhone.description || livePhone.name}
                      </p>
                      {livePhone.price > 0 && (
                        <div className="text-[12.5px] font-bold text-[#FFC500] font-mono">
                          السعر: {livePhone.price.toLocaleString()} ر.ي
                        </div>
                      )}
                      {cleanImages.length > 0 && (
                        <div>
                          <div
                            className="relative bg-black cursor-pointer select-none overflow-hidden rounded-none border border-[#2F3336]/80"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onClick={() => setIsLightboxOpen(true)}
                          >
                            <img
                              src={cleanImages[activeImageIndex] || cleanImages[0]}
                              alt={livePhone.name}
                              className="w-full max-h-[380px] object-cover rounded-none block"
                            />
                          </div>
                          {cleanImages.length > 1 && (
                            <div className="flex justify-center items-center gap-1.5 pt-2">
                              {cleanImages.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveImageIndex(idx)}
                                  className={`h-1 rounded-none transition-all cursor-pointer ${activeImageIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-[#2F3336]'}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {cleanImages.length > 0 ? (
                        <div className="bg-black">
                          <div
                            className="relative bg-black cursor-pointer select-none overflow-hidden rounded-none border border-[#2F3336]/80"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onClick={() => setIsLightboxOpen(true)}
                          >
                            <img
                              src={cleanImages[activeImageIndex] || cleanImages[0]}
                              alt={livePhone.name}
                              className="w-full h-[290px] sm:h-[340px] object-cover rounded-none block"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent pointer-events-none" />

                            <div className="absolute inset-x-0 bottom-0 px-3 py-2.5 flex items-end justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="text-[10.5px] text-[#A1A1AA]">
                                  {CATEGORY_LABEL_MAP[livePhone.category]}{locationDisplay ? ` · ${locationDisplay}` : ''}
                                </div>
                                <h1 className="text-[15.5px] font-bold text-white leading-snug truncate">
                                  {livePhone.name}
                                </h1>
                              </div>
                              {livePhone.price > 0 && (
                                <div className="shrink-0 text-left">
                                  <span className="text-[13px] font-bold text-[#FFC500] font-mono whitespace-nowrap">
                                    {livePhone.price.toLocaleString()} ر.ي
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {cleanImages.length > 1 && (
                            <div className="flex justify-center items-center gap-1.5 pt-2">
                              {cleanImages.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveImageIndex(idx)}
                                  className={`h-1 rounded-none transition-all cursor-pointer ${activeImageIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-[#2F3336]'}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-2 bg-black flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[10.5px] text-[#71767B]">
                              {CATEGORY_LABEL_MAP[livePhone.category]}{locationDisplay ? ` · ${locationDisplay}` : ''}
                            </div>
                            <h1 className="text-[15.5px] font-bold text-white leading-snug truncate">{livePhone.name}</h1>
                          </div>
                          {livePhone.price > 0 && (
                            <span className="shrink-0 text-[13px] font-bold text-[#FFC500] font-mono whitespace-nowrap">
                              {livePhone.price.toLocaleString()} ر.ي
                            </span>
                          )}
                        </div>
                      )}

                      {cleanSpecs.length > 0 && (
                        <div className="pt-2.5 bg-black grid grid-cols-2 gap-x-3 gap-y-1">
                          {cleanSpecs.map((r) => (
                            <div
                              key={r.k}
                              className="flex items-center gap-1 py-0.5 text-[11px] min-w-0"
                            >
                              <span className="text-[#71767B] shrink-0">{r.k}:</span>
                              <span className="text-[#E7E9EA] font-medium truncate">{r.v}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {livePhone.description && (
                        <div dir="auto" className="pt-2 bg-black text-[12.5px] leading-[19px] text-[#D6D9DB] whitespace-pre-wrap break-words">
                          {livePhone.description}
                        </div>
                      )}

                      {(hasContactPhone || livePhone.contactUrl || livePhone.businessId) && (
                        <div className="pt-3 bg-black flex items-center gap-2">
                          {hasContactPhone && (
                            <>
                              <a
                                href={waHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-none border border-[#2F3336]/80 bg-transparent text-[#E7E9EA] hover:border-white/50 transition text-[11.5px] font-medium"
                              >
                                <MessageCircle size={13} />
                                <span>واتساب</span>
                              </a>
                              <a
                                href={`tel:${livePhone.sellerPhone}`}
                                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-none border border-[#2F3336]/80 bg-transparent text-[#E7E9EA] hover:border-white/50 transition text-[11.5px] font-medium"
                              >
                                <Phone size={13} />
                                <span>اتصال</span>
                              </a>
                            </>
                          )}
                          {livePhone.contactUrl && (
                            <a
                              href={livePhone.contactUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-none border border-[#2F3336]/80 bg-transparent text-[#E7E9EA] hover:border-white/50 transition text-[11.5px] font-medium"
                            >
                              <Globe size={13} />
                              <span>الموقع</span>
                            </a>
                          )}
                          {livePhone.businessId && (
                            <button
                              type="button"
                              onClick={() => onNavigate(`/businesses/${livePhone.businessId}`)}
                              className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-none border border-[#2F3336]/80 bg-transparent text-[#E7E9EA] hover:border-white/50 transition text-[11.5px] font-medium cursor-pointer"
                            >
                              <User size={13} />
                              <span>المنشأة</span>
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-3 py-2.5 border-b border-[#2F3336]/60 text-[12px] text-[#71767B] flex items-center justify-between">
                  <span>{formatPhoneTimeAgo(livePhone.createdAt)}{!isFreeTweet && locationDisplay ? ` · ${locationDisplay}` : ''}</span>
                  {!isFreeTweet && <span>{CATEGORY_LABEL_MAP[livePhone.category]}</span>}
                </div>

                <div className="py-2.5 px-2 border-b border-[#2F3336]/60 flex items-center justify-between text-[#71767B] select-none" dir="rtl">
                  <button
                    type="button"
                    onClick={() => showToast(hasContactPhone ? 'استخدم زر واتساب أو اتصال للتواصل المباشر' : 'تم تسجيل تفاعلك', 'success', 2000)}
                    className="flex items-center gap-1 hover:text-[#1D9BF0] transition cursor-pointer p-1"
                    title="رد"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M1.751 10c0-4.42 3.584-8 8.001-8h4.496c4.417 0 8.001 3.58 8.001 8 0 3.297-1.988 6.16-4.887 7.382l.534 2.85c.08.43-.16.85-.56 1-.16.06-.33.09-.5.09-.27 0-.54-.11-.74-.31l-3.498-3.504c-.768.164-1.566.252-2.386.252-4.417 0-8.001-3.58-8.001-8zm8.001-6c-3.314 0-6 2.69-6 6 0 3.31 2.686 6 6 6 .802 0 1.58-.158 2.295-.457.406-.17.872-.07 1.176.244l2.039 2.043-.32-1.708c-.066-.352.062-.713.334-.949C17.279 13.568 18.25 11.87 18.25 10c0-3.31-2.69-6-6-6H9.752z" /></svg>
                    {(livePhone.repliesCount ?? 0) > 0 && <span className="text-[11px]">{livePhone.repliesCount}</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePhoneRepost(livePhone.id)}
                    className={`flex items-center gap-1 transition cursor-pointer p-1 ${isReposted ? 'text-[#00BA7C]' : 'hover:text-[#00BA7C]'}`}
                    title="إعادة نشر"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></svg>
                    {(livePhone.repostsCount ?? 0) > 0 && <span className="text-[11px]">{livePhone.repostsCount}</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePhoneLike(livePhone.id)}
                    className={`flex items-center gap-1 transition cursor-pointer p-1 ${isLiked ? 'text-[#F91880]' : 'hover:text-[#F91880]'}`}
                    title="إعجاب"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      {isLiked ? (
                        <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.505.3-.505-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
                      ) : (
                        <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-2.415.11-4.3 2.11-4.3 4.6 0 2.23 1.25 4.3 3.393 6.08C8.38 17.84 10.74 19.38 12 20c1.26-.62 3.62-2.16 5.603-3.82 2.143-1.78 3.397-3.85 3.397-6.08 0-2.49-1.885-4.49-4.303-4.6zM2 10.1c0-3.53 2.76-6.4 6.27-6.57 1.84-.09 3.69.75 4.73 2.14 1.04-1.39 2.89-2.23 4.73-2.14 3.51.17 6.27 3.04 6.27 6.57 0 3.36-1.89 6.22-4.82 8.65-2.4 1.99-5.18 3.67-6.18 4.25-.33.19-.74.19-1.07 0-.99-.58-3.77-2.26-6.17-4.25C3.89 16.32 2 13.46 2 10.1z" />
                      )}
                    </svg>
                    {(livePhone.likesCount ?? 0) > 0 && <span className="text-[11px]">{livePhone.likesCount}</span>}
                  </button>

                  <span className="flex items-center gap-1 p-1" title="المشاهدات">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10H6V21H4zm9.248 0v-7H15.25v7h-2.002z" /></svg>
                    {(livePhone.viewsCount ?? 0) > 0 && <span className="text-[11px]">{livePhone.viewsCount}</span>}
                  </span>

                  <button
                    type="button"
                    onClick={() => showToast('تم الحفظ في العلامات المرجعية', 'success', 2000)}
                    className="hover:text-[#1D9BF0] transition cursor-pointer p-1"
                    title="حفظ"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" /></svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(shareSummary);
                      showToast('تم نسخ التفاصيل للمشاركة', 'success', 2500);
                    }}
                    className="hover:text-[#1D9BF0] transition cursor-pointer p-1"
                    title="مشاركة"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><line x1="8.5" y1="13.5" x2="15.5" y2="17.5" /><line x1="15.5" y1="6.5" x2="8.5" y2="10.5" /></svg>
                  </button>
                </div>
              </article>
            </div>
          );
        })()
      ) : (
        <div className={embedded ? "divide-y divide-[#2F3336]/40" : "space-y-3"}>
          {embedded && <MarketSponsorSlot section="phones" />}
          <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]"}>
            <XSearchFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="ابحث في سوق الهواتف والأجهزة..." activeFiltersCount={activeFiltersCount} onOpenFilter={() => setIsFilterModalOpen(true)} sectionIcon={<Smartphone size={18} className="text-[#FFC500]" />} />
            </div>

          {currentVipPhone && (
            <PhoneVipBanner
              item={currentVipPhone}
              categoryLabel={CATEGORY_LABEL_MAP[currentVipPhone.category]}
              timeAgo={formatPhoneTimeAgo(currentVipPhone.createdAt)}
              specs={renderSpecBadges(currentVipPhone)}
              onOpenDetail={(it) => handleOpenPhone(it as PhoneDeviceItem)}
              onOpenImage={(it) => {
                setSelectedPhone(it as PhoneDeviceItem);
                setActiveImageIndex(0);
                setIsLightboxOpen(true);
              }}
              onOpenBusiness={(bizId) => onNavigate(`/businesses/${bizId}`)}
              onShare={(it) => {
                navigator.clipboard?.writeText(`${CATEGORY_LABEL_MAP[(it as PhoneDeviceItem).category]} ${it.name} - ${it.price.toLocaleString()} ر.ي`);
                showToast('تم نسخ تفاصيل الإعلان', 'success', 2500);
              }}
              totalVipCount={vipPhones.length}
              activeVipIndex={activeVipIdx % vipPhones.length}
              onSelectVipIndex={(idx) => setActiveVipIdx(idx)}
            />
          )}

          <div className="divide-y divide-[#2F3336]/60">
            {feedPhones.slice(0, visibleCount).map((phone, idx) => (
              <React.Fragment key={phone.id}>
              {phone.adTier === 'pro' ? (
                <PhoneProAdCard
                  item={phone}
                  categoryLabel={CATEGORY_LABEL_MAP[phone.category]}
                  timeAgo={formatPhoneTimeAgo(phone.createdAt)}
                  specs={renderSpecBadges(phone)}
                  onOpenDetail={(it) => handleOpenPhone(it as PhoneDeviceItem)}
                  onOpenImage={(it) => {
                    setSelectedPhone(it as PhoneDeviceItem);
                    setActiveImageIndex(0);
                    setIsLightboxOpen(true);
                  }}
                  onOpenBusiness={(bizId) => onNavigate(`/businesses/${bizId}`)}
                  onShare={(it) => {
                    navigator.clipboard?.writeText(`${CATEGORY_LABEL_MAP[(it as PhoneDeviceItem).category]} ${it.name} - ${it.price.toLocaleString()} ر.ي`);
                    showToast('تم نسخ تفاصيل الإعلان', 'success', 2500);
                  }}
                />
              ) : phone.adTier === 'basic' ? (
                <PhoneBasicAdCard
                  item={phone}
                  categoryLabel={CATEGORY_LABEL_MAP[phone.category]}
                  timeAgo={formatPhoneTimeAgo(phone.createdAt)}
                  specs={renderSpecBadges(phone)}
                  onOpenDetail={(it) => handleOpenPhone(it as PhoneDeviceItem)}
                  onOpenImage={(it) => {
                    setSelectedPhone(it as PhoneDeviceItem);
                    setActiveImageIndex(0);
                    setIsLightboxOpen(true);
                  }}
                  onOpenBusiness={(bizId) => onNavigate(`/businesses/${bizId}`)}
                  onShare={(it) => {
                    navigator.clipboard?.writeText(`${CATEGORY_LABEL_MAP[(it as PhoneDeviceItem).category]} ${it.name} - ${it.price.toLocaleString()} ر.ي`);
                    showToast('تم نسخ تفاصيل الإعلان', 'success', 2500);
                  }}
                />
              ) : (
              <article
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target.closest('button') && !target.closest('a')) handleOpenPhone(phone);
                }}
                className="p-3 border-b border-[#2F3336]/40 bg-black hover:bg-white/[0.03] transition cursor-pointer"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 overflow-hidden font-bold text-white text-lg">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (phone.businessId) onNavigate(`/businesses/${phone.businessId}`);
                        else handleOpenPhone(phone);
                      }}
                      className="w-full h-full cursor-pointer hover:opacity-80 transition flex items-center justify-center"
                    >
                      {phone.sellerAvatar ? (
                        <img src={phone.sellerAvatar} alt={phone.sellerName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{phone.sellerName?.[0] || 'م'}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center flex-nowrap min-w-0 w-full gap-1">
                        <span
                          onClick={(e) => {
                            if (phone.businessId) { e.stopPropagation(); onNavigate(`/businesses/${phone.businessId}`); }
                          }}
                          className="font-bold text-[#E7E9EA] text-[12.5px] hover:underline cursor-pointer truncate shrink max-w-[130px] sm:max-w-[180px]"
                        >
                          {phone.sellerName}
                        </span>
                        <VerifiedBadge type={phone.badgeType || (phone.isVerified ? 'gold' : 'none')} size={14.5} className="shrink-0" />
                        <span className="text-[11.5px] text-[#71767B] truncate shrink max-w-[90px] sm:max-w-[120px]" dir="ltr">@{getDefaultHandle(phone)}</span>
                        <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
                        <span className="text-[#71767B] text-[10.5px] whitespace-nowrap shrink-0">{formatPhoneTimeAgo(phone.createdAt)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTweetMenuId((prev) => (prev === phone.id ? null : phone.id));
                        }}
                        className="text-[#71767B] hover:text-[#FFC500] p-1.5 rounded-full hover:bg-[#FFC500]/10 transition shrink-0 cursor-pointer"
                        title="المزيد"
                      >
                        <MoreHorizontal size={14} className="rotate-90 text-[#71767B] hover:text-[#FFC500] transition" />
                      </button>

                      {activeTweetMenuId === phone.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-0 top-7 z-30 min-w-[140px] rounded-xl bg-[#09090B] border border-[#2F3336] shadow-xl py-1 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(`${phone.description || phone.name}${phone.price > 0 ? ` - ${phone.price.toLocaleString()} ر.ي` : ''}`);
                              setActiveTweetMenuId(null);
                              showToast('تم نسخ نص التغريدة', 'success', 2000);
                            }}
                            className="w-full text-right px-3 py-2 text-white hover:bg-white/10 transition cursor-pointer"
                          >
                            نسخ النص
                          </button>
                          {phone.authorId === activeAuthorKey && (
                            <button
                              type="button"
                              onClick={() => deleteOwnPhonePost(phone.id)}
                              className="w-full text-right px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            >
                              حذف التغريدة
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* التغريدة المجانية: نص اجتماعي طبيعي */}
                    <p className="-mt-1 text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap pr-0 -ml-8 pl-3 break-words font-normal select-text">
                      {phone.description
                        ? `${phone.description}${phone.price > 0 ? `
السعر: ${phone.price.toLocaleString()} ر.ي` : ''}`
                        : `${phone.name}${phone.storage && phone.storage !== 'لا ينطبق' ? ` · ${phone.storage}` : ''}${phone.condition ? ` · ${phone.condition}` : ''}${phone.price > 0 ? ` — ${phone.price.toLocaleString()} ر.ي` : ''}${phone.city ? ` (${phone.city})` : ''}`}
                    </p>

                    {phone.images?.[0] && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhone(phone);
                          setActiveImageIndex(0);
                          setIsLightboxOpen(true);
                        }}
                        className="mt-3 rounded-2xl overflow-hidden border-0 max-h-96 bg-zinc-950 relative cursor-pointer"
                      >
                        <img src={phone.images[0]} alt={phone.name} className="w-full h-full object-cover max-h-96" loading="lazy" />
                        {phone.images.length > 1 && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10.5px] font-bold border border-white/10">1 / {phone.images.length}</span>
                        )}
                      </div>
                    )}

                    <XActionBar
                      tweet={{
                        id: phone.id,
                        likes: phone.likesCount ?? 0,
                        likedBy: phone.likedBy ?? [],
                        reposts: phone.repostsCount ?? 0,
                        repostedBy: phone.repostedBy ?? [],
                        replies: phone.repliesCount ?? 0,
                        views: phone.viewsCount ?? 1,
                      }}
                      currentUserId={activeAuthorKey}
                      onReply={() => handleOpenPhone(phone)}
                      onRepost={() => togglePhoneRepost(phone.id)}
                      onLike={() => togglePhoneLike(phone.id)}
                      onBookmark={() => showToast('تم الحفظ في العلامات المرجعية', 'success', 2000)}
                      onShare={() => {
                        navigator.clipboard?.writeText(`${phone.description || phone.name}${phone.price > 0 ? ` - ${phone.price.toLocaleString()} ر.ي` : ''}`);
                        showToast('تم نسخ التغريدة للمشاركة', 'success', 2000);
                      }}
                    />
                  </div>
                </div>
              </article>
              )}
              {idx === (feedPhones.length >= 8 ? 2 : feedPhones.length >= 4 ? 1 : 0) && (
                <div className="bg-black">
                  <AdBanner section="phones" slot="slot_1" onAdResolved={setSlot1AdId} className="!my-0 border-x-0" />
                </div>
              )}
              {idx === (feedPhones.length >= 8 ? 7 : feedPhones.length >= 2 ? feedPhones.length - 1 : -1) && (
                <div className="bg-black">
                  <AdBanner section="phones" slot="slot_2" enabled={slot1AdId !== undefined} excludeAdIds={slot1AdId ? [slot1AdId] : []} className="!my-0 border-x-0" />
                </div>
              )}
              </React.Fragment>
            ))}

          </div>


          {feedPhones.length > 0 && (
            <div ref={bottomSentinelRef} className="py-3 flex items-center justify-center">
              {isLoadingMore || visibleCount < feedPhones.length ? (
                <XSpinner ariaLabel="جاري تحميل المزيد" />
              ) : (
                <span className="text-[11px] text-[#71767B]">تم عرض كل النتائج</span>
              )}
            </div>
          )}
          {embedded && !selectedPhone && !isAddModalOpen && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition"
              title="إعلان جديد"
            >
              <Plus size={24} className="stroke-[2.2]" />
            </button>
          )}
        </div>
      )}

      {isLightboxOpen && selectedPhone && (
        <div
          data-no-tab-swipe="true"
          dir="rtl"
          className="fixed inset-0 z-[99999] bg-black flex flex-col justify-between select-none overflow-hidden"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full pt-4 pb-2 px-4 flex items-center justify-between z-50" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setIsLightboxOpen(false)} aria-label="رجوع" className="w-11 h-11 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center text-white border border-white/5 shadow-md cursor-pointer">
              <ArrowRight size={20} />
            </button>
            {selectedPhone.images.length > 1 && <span className="px-3 py-1.5 rounded-full bg-[#192227] text-white text-xs font-mono border border-white/5">{activeImageIndex + 1} / {selectedPhone.images.length}</span>}
          </div>
          <div className="flex-1 flex items-center justify-center px-2 py-2" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhone.images[activeImageIndex]} alt={selectedPhone.name} className="w-full max-h-[78vh] object-contain" />
          </div>
          <div className="w-full px-4 pt-6 pb-5 flex flex-col gap-3 z-50" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)' }} onClick={(e) => e.stopPropagation()}>
            {selectedPhone.images.length > 1 && (
              <div className="flex justify-center items-center gap-1.5">
                {selectedPhone.images.map((_, idx) => <button key={idx} type="button" onClick={() => setActiveImageIndex(idx)} className={`h-1.5 rounded-full transition-all cursor-pointer ${activeImageIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`} />)}
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {selectedPhone.sellerAvatar ? <img src={selectedPhone.sellerAvatar} alt={selectedPhone.sellerName} className="w-full h-full object-cover" /> : <span>{selectedPhone.sellerName?.[0] || 'م'}</span>}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-[14px] truncate">{selectedPhone.sellerName}</span>
                    <VerifiedBadge type={selectedPhone.badgeType || (selectedPhone.isVerified ? 'gold' : 'none')} size={13.5} className="shrink-0" />
                  </div>
                    <div className="text-[#71767B] text-[12px] truncate">{selectedPhone.name}{selectedPhone.price > 0 ? ` · ${selectedPhone.price.toLocaleString()} ر.ي` : ''}</div>
                </div>
              </div>
                {selectedPhone.adTier && selectedPhone.adTier !== 'free' && selectedPhone.sellerPhone && (
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={toWaLink(selectedPhone.sellerPhone, buildPhoneWaText(selectedPhone, CATEGORY_LABEL_MAP[selectedPhone.category]))} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-full bg-[#192227] hover:bg-[#202b32] text-white border border-white/10 text-xs font-bold flex items-center gap-1.5">
                      <MessageCircle size={14} /><span>واتساب</span>
                    </a>
                    <a href={`tel:${selectedPhone.sellerPhone}`} className="px-3.5 py-2 rounded-full bg-[#192227] hover:bg-[#202b32] text-white border border-white/10 text-xs font-bold flex items-center gap-1.5">
                      <Phone size={14} /><span>اتصال</span>
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة إعلان: جميع الحقول قوائم منسدلة باستثناء السعر بالريال اليمني */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black sm:bg-black/80 flex items-center justify-center sm:p-4" onClick={() => setIsAddModalOpen(false)}>
          <form
            onSubmit={handleSubmitPhone}
            className="bg-black sm:border sm:border-[#2F3336] sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden text-white"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2F3336]/60 shrink-0">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer" aria-label="إغلاق">
                  <X size={18} />
                </button>
                <span className="text-[13px] font-bold text-white">نشر في سوق الهواتف</span>
                <button type="submit" disabled={isSubmittingPhone} className="px-5 py-1.5 rounded-full bg-[#FFC500] hover:bg-[#e6b100] disabled:opacity-50 text-black font-bold text-[13px] transition cursor-pointer">
                  {isSubmittingPhone ? 'جاري النشر...' : 'نشر'}
                </button>
              </div>

              <div className="px-4 pt-3 pb-2 border-b border-[#2F3336]/40 space-y-2 shrink-0 bg-black">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setComposeKind('free')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      composeKind === 'free'
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-950 text-zinc-300 border-[#2F3336] hover:border-white/40'
                    }`}
                  >
                    تغريدة عادية (مجانية)
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposeKind('paid')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      composeKind === 'paid'
                        ? 'bg-[#FFC500] text-black border-[#FFC500]'
                        : 'bg-zinc-950 text-[#FFC500] border-[#FFC500]/40 hover:border-[#FFC500]'
                    }`}
                  >
                    إعلان تجاري مدفوع
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#71767B] px-0.5">
                  <span>باقتك: <strong className="text-white">{tierLimits.label}</strong></span>
                  <span>
                    {composeKind === 'free'
                      ? `المجاني اليوم: ${usageStats.todayFreeCount} / ${tierLimits.dailyFree}`
                      : `المميزة هذا الشهر: ${usageStats.monthFeaturedCount} / ${tierLimits.monthlyFeatured}`}
                  </span>
                </div>

                {composeKind === 'paid' && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'basic' as PhonePostTier, label: 'الأساسية', sub: 'إعلان ممول', locked: !tierLimits.canBasic },
                        { id: 'pro' as PhonePostTier, label: 'الاحترافية', sub: 'إطار ذهبي', locked: !tierLimits.canPro },
                        { id: 'vip' as PhonePostTier, label: 'VIP مثبت', sub: 'رأس السوق', locked: !tierLimits.canVip },
                      ].map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => {
                            if (pkg.locked) {
                              showToast(
                                pkg.id === 'vip'
                                  ? 'باقة VIP المثبتة متاحة لمشتركي VIP احترافي'
                                  : 'الإعلانات الممولة متاحة لمشتركي VIP و VIP احترافي',
                                'error',
                                3500
                              );
                            }
                            setSelectedAdTier(pkg.id);
                          }}
                          className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                            selectedAdTier === pkg.id
                              ? 'border-[#FFC500] bg-[#FFC500]/15 text-white'
                              : 'border-[#2F3336] bg-zinc-950 text-zinc-400 hover:border-white/30'
                          }`}
                        >
                          <div className="text-[11.5px] font-black text-white">
                            {pkg.label} {pkg.locked ? '🔒' : ''}
                          </div>
                          <div className="text-[9.5px] text-[#FFC500]">{pkg.sub}</div>
                        </button>
                      ))}
                    </div>

                  </div>
                )}

                {limitBlockReason && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-rose-200 leading-relaxed">{limitBlockReason}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        onNavigate('/premium');
                      }}
                      className="px-3 py-1 rounded-full bg-[#FFC500] text-black font-black shrink-0 cursor-pointer"
                    >
                      {isSubscriptionExpired ? 'تجديد الاشتراك' : 'ترقية الباقة'}
                    </button>
                  </div>
                )}
              </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {(myBusinessPage || profile) && (
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-[#2F3336] flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 text-white font-bold">
                    {(myBusinessPage?.avatarUrl || profile?.avatar_url) ? <img src={myBusinessPage?.avatarUrl || profile?.avatar_url} alt="" className="w-full h-full object-cover" /> : <span>{(myBusinessPage?.name || profile?.full_name)?.[0] || 'م'}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white text-xs truncate">{myBusinessPage?.name || profile?.full_name}</span>
                      <VerifiedBadge type={myBusinessPage ? ((myBusinessPage.verificationType as BadgeType) || (myBusinessPage.isVerified ? 'gold' : 'none')) : 'none'} size={13} />
                    </div>
                    <div className="text-[11px] text-[#71767B] truncate" dir="ltr">@{myBusinessPage?.username || (profile as any)?.username || (profile?.email ? profile.email.split('@')[0] : 'account')}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold shrink-0">{myBusinessPage ? 'صفحة المنشأة' : 'حسابك'}</span>
                </div>
              )}

              {composeKind === 'free' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">نص التغريدة *</label>
                      <textarea
                        rows={4}
                        value={freeTweetText}
                        onChange={(e) => setFreeTweetText(e.target.value)}
                        placeholder="شارك تغريدتك عن هاتف أو عرض بحرية (مثال: للبيع آيفون 15 استخدام بسيط ومع كامل الملحقات...)"
                        className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-3 text-xs text-white outline-none caret-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">السعر (اختياري - ر.ي)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="اتركه فارغاً إذا لم ترغب بذكر السعر"
                        value={freeOptionalPrice}
                        onChange={(e) => setFreeOptionalPrice(fmtAmt(e.target.value))}
                        className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white font-mono outline-none caret-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFreeShowOptionalSpecs((prev) => !prev)}
                      className="text-[11px] text-[#FFC500] font-bold hover:underline cursor-pointer"
                    >
                      {freeShowOptionalSpecs ? '− إخفاء تفاصيل الهاتف الاختيارية' : '+ إضافة اسم الهاتف والموديل والحالة (اختياري)'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 p-2.5 rounded-xl border border-[#FFC500]/30 bg-[#FFC500]/[0.03]">
                    <div>
                      <label className="text-[11px] text-[#FFC500] font-bold block mb-1">العنوان التسويقي للإعلان</label>
                      <input
                        type="text"
                        value={adHeadline}
                        onChange={(e) => setAdHeadline(e.target.value)}
                        placeholder="مثال: أحدث هواتف آيفون بأسعار مميزة وضمان معتمد"
                        className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white outline-none caret-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">أبرز المميزات (كل ميزة في سطر)</label>
                      <textarea
                        rows={3}
                        value={adHighlightsText}
                        onChange={(e) => setAdHighlightsText(e.target.value)}
                        placeholder="اكتب كل ميزة في سطر (مثال: ضمان حقيقي سنة)"
                        className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white outline-none caret-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">نص زر الإجراء</label>
                      <YRSelect
                        compact
                        value={adCtaLabel}
                        onChange={setAdCtaLabel}
                        options={[
                          { value: 'تواصل معنا', label: 'تواصل معنا' },
                          { value: 'تسوق الآن', label: 'تسوق الآن' },
                          { value: 'احصل عليه الآن', label: 'احصل عليه الآن' },
                          { value: 'اطلب عبر واتساب', label: 'اطلب عبر واتساب' },
                        ]}
                      />
                    </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-[#71767B] block mb-1">رقم الهاتف *</label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            dir="ltr"
                            maxLength={9}
                            value={sellerPhone}
                            onChange={(e) => {
                              setSellerPhone(normalizeYemenPhone(e.target.value));
                              if (!sellerPhoneTouched) setSellerPhoneTouched(true);
                            }}
                            onBlur={() => setSellerPhoneTouched(true)}
                            className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white font-mono outline-none caret-white"
                          />
                          {sellerPhoneTouched && !isValidYemenPhone(normalizeYemenPhone(sellerPhone)) && (
                            <p className="text-[11px] text-rose-400 mt-1">الرقم خاطئ</p>
                          )}
                        </div>
                        <div>
                          <label className="text-[11px] text-[#71767B] block mb-1">الموقع</label>
                          <input
                            type="text"
                            value={adLocationOrSite}
                            onChange={(e) => setAdLocationOrSite(e.target.value)}
                            className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white outline-none caret-white"
                          />
                        </div>
                      </div>
                  </div>
                )}

                {(composeKind === 'paid' || freeShowOptionalSpecs) && (
                <>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">القسم *</label>
                <YRSelect
                  value={phoneCategory}
                  onChange={(val) => handleCategoryChange(val as PhoneCategory)}
                  options={[
                    { value: 'phones', label: 'الهواتف' },
                    { value: 'tablets', label: 'الآيبادات والأجهزة اللوحية' },
                    { value: 'laptops', label: 'الحواسيب واللابتوبات' },
                    { value: 'accessories', label: 'الإكسسوارات' },
                    { value: 'maintenance', label: 'الصيانة والبرمجة' },
                    { value: 'sim_services', label: 'الشرائح وخدمات الاتصال' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الشركة *</label>
                  <YRSelect value={phoneBrand} onChange={handleBrandChange} options={activeBrandOptions} />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الموديل / النوع *</label>
                  <YRSelect value={phoneModel} onChange={setPhoneModel} options={activeModelOptions} />
                </div>
              </div>

              </>
                )}

                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الصور ({composeKind === 'free' ? 'اختياري حتى 4 صور' : '1 إلى 6 صور'})</label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImagesUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 rounded-xl border border-dashed border-[#2F3336] hover:border-white text-white/80 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer">
                  <Upload size={14} className="text-[#FFC500]" /><span>اختر الصور ({uploadedImages.length}/6)</span>
                </button>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative h-16 rounded-xl overflow-hidden border border-[#2F3336]">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeUploadedImage(i)} className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center"><Trash2 size={11} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(composeKind === 'paid' || freeShowOptionalSpecs) && (
                <>
                {isDeviceCat && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">مساحة التخزين *</label>
                      <YRSelect compact value={phoneStorage} onChange={setPhoneStorage} options={STORAGE_OPTIONS} />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">الرام (GB) *</label>
                      <YRSelect compact value={phoneRam} onChange={setPhoneRam} options={RAM_OPTIONS} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">المعالج</label>
                      <YRSelect compact value={phoneProcessor} onChange={setPhoneProcessor} options={PROCESSOR_OPTIONS} />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">دعم الشريحة *</label>
                      <YRSelect compact value={phoneSim} onChange={setPhoneSim} options={SIM_OPTIONS} />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الحالة *</label>
                  <YRSelect compact value={phoneCondition} onChange={setPhoneCondition} options={CONDITION_OPTIONS} />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">اللون *</label>
                  <YRSelect compact value={phoneColor} onChange={setPhoneColor} options={COLOR_OPTIONS} />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">التوصيل *</label>
                  <YRSelect compact value={phoneDelivery} onChange={setPhoneDelivery} options={DELIVERY_OPTIONS} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#FFC500] font-bold block mb-1">السعر (ر.ي) *</label>
                  <input
                    type="text" inputMode="numeric"
                    required={composeKind === "paid"}
                                        placeholder="250,000"
                    value={phonePrice}
                    onChange={(e) => setPhonePrice(fmtAmt(e.target.value))}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white font-mono outline-none caret-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">قابل للتفاوض *</label>
                  <YRSelect compact value={phoneNegotiable} onChange={setPhoneNegotiable} options={NEGOTIABLE_OPTIONS} />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">المحافظة *</label>
                  <YRSelect compact value={phoneCity} onChange={setPhoneCity} options={YEMEN_GOVERNORATES.map((g) => ({ value: g, label: g }))} />
                </div>
              </div>
                </>
                )}
            </div>
          </form>
        </div>
      )}

      <XFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="تصفية النتائج"
        activeFiltersCount={activeFiltersCount}
        onReset={resetFilters}
        resultsCount={filteredPhones.length}
        fields={[
          {
            label: 'القسم',
            value: activeTab,
            onChange: (v) => { setActiveTab(v as any); setSelectedBrand('all'); },
            options: [
              { value: 'all', label: 'كل الأقسام' },
              { value: 'phones', label: 'الهواتف' },
              { value: 'tablets', label: 'الآيبادات والأجهزة اللوحية' },
              { value: 'laptops', label: 'الحواسيب واللابتوبات' },
              { value: 'accessories', label: 'الإكسسوارات' },
              { value: 'maintenance', label: 'الصيانة والبرمجة' },
              { value: 'sim_services', label: 'الشرائح وخدمات الاتصال' },
            ],
          },
          {
            label: 'الشركة',
            value: selectedBrand,
            onChange: setSelectedBrand,
            options: [
              { value: 'all', label: 'جميع الشركات' },
              ...(activeTab === 'phones' || activeTab === 'tablets'
                ? PHONE_BRANDS
                : activeTab === 'laptops'
                ? COMPUTER_BRANDS
                : [...PHONE_BRANDS, ...COMPUTER_BRANDS, ...EXTRA_BRANDS]
              ).map((b) => ({ value: b.id, label: b.label })),
            ],
          },
          {
            label: 'الحالة',
            value: selectedCondition,
            onChange: setSelectedCondition,
            options: [{ value: 'all', label: 'كل الحالات' }, ...CONDITION_OPTIONS],
          },
          {
            label: 'السعة التخزينية',
            value: selectedStorage,
            onChange: setSelectedStorage,
            options: [{ value: 'all', label: 'الكل' }, ...STORAGE_OPTIONS.filter((o) => o.value !== 'لا ينطبق')],
          },
          {
            label: 'التفاوض',
            value: selectedNegotiable,
            onChange: setSelectedNegotiable,
            options: [{ value: 'all', label: 'الكل' }, { value: 'نعم', label: 'قابل للتفاوض' }, { value: 'لا', label: 'سعر نهائي' }],
          },
          {
            label: 'المحافظة',
            value: selectedCity,
            onChange: setSelectedCity,
            options: YEMEN_GOV_FILTER_OPTIONS,
          },
        ]}
      />
    </div>
  );
};
