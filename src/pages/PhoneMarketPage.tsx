import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Smartphone, Tag, Wrench, Radio, Sparkles, Search, 
  MapPin, Phone, MessageCircle, ArrowRight, Plus, X, 
  Upload, Trash2, CheckCircle2, ShieldCheck, User, Camera,
  Zap, Check, SlidersHorizontal, Cpu
} from 'lucide-react';
import { AdBanner } from '../components/common/AdBanner';
import { YRSelect } from '../components/common/YRSelect';
import { XSearchFilterBar, XFilterModal, YEMEN_GOV_FILTER_OPTIONS } from '../components/common/XMarketUI';
import { UserProfile } from '../types/auth';
import { getMyBusinessPage, BusinessPageRecord } from '../services/businessPageService';
import { uploadSocialImage } from '../services/socialService';
import { VerifiedBadge, BadgeType } from '../components/common/VerifiedBadge';
import { supabase } from '../lib/supabase';

export interface PhoneDeviceItem {
  id: string;
  name: string;
  brand: string;
  modelDetails?: string;
  price: number;
  currency: string;
  condition: 'جديد كرت' | 'شبه جديد' | 'مستعمل نظيف';
  storage: string;
  ram?: string;
  color?: string;
  city: string;
  sellerName: string;
  sellerPhone: string;
  isVerified: boolean;
  images: string[];
  category: 'phones' | 'tablets' | 'laptops' | 'accessories' | 'maintenance' | 'sim_services';
  description?: string;
  createdAt: string;
  sellerUsername?: string;
  sellerAvatar?: string;
  badgeType?: BadgeType;
  businessId?: string;
  authorId?: string;
}

const PHONES_STORAGE_KEY = 'yr_phone_market_items_v1';

const YEMEN_GOVERNORATES = [
  'صنعاء', 'عدن', 'تعز', 'حضرموت', 'إب', 'الحديدة', 'ذمار', 'مأرب',
  'عمران', 'حجة', 'صعدة', 'البيضاء', 'لحج', 'أبين', 'شبوة',
  'المهرة', 'الضالع', 'المحويت', 'ريمة', 'الجوف', 'سقطرى',
];

const PHONE_BRANDS = [
  { id: 'Apple', label: 'آبل · آيفون / آيباد (Apple)' },
  { id: 'Samsung', label: 'سامسونج · جالكسي / تاب (Samsung)' },
  { id: 'Xiaomi', label: 'شاومي · ريدمي / بوكو (Xiaomi)' },
  { id: 'Huawei', label: 'هواوي · ميت باد (Huawei)' },
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
  { id: 'Sony', label: 'سوني (Sony)' },
  { id: 'Nothing', label: 'ناثينج (Nothing)' },
  { id: 'itel', label: 'آيتل (itel)' },
  { id: 'ZTE', label: 'زد تي إي (ZTE)' },
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
  { id: 'Toshiba', label: 'توشيبا (Toshiba)' },
  { id: 'Razer', label: 'ريزر (Razer)' },
  { id: 'LG', label: 'إل جي (LG)' },
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

const INITIAL_PHONES: PhoneDeviceItem[] = [
  {
    id: 'ph-1',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    modelDetails: 'نسخة الشرق الأوسط شريحتين',
    price: 620000,
    currency: 'YER',
    condition: 'جديد كرت',
    storage: '256GB',
    ram: '8GB',
    color: 'تيتانيوم طبيعي',
    city: 'صنعاء — حدة',
    sellerName: 'مركز الخليج الذكي',
    sellerPhone: '967777123456',
    isVerified: true,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'phones',
    description: 'جهاز أصلي جديد كرت بالضمان وجميع الملحقات الأصلية متوفرة.',
    createdAt: 'اليوم'
  },
  {
    id: 'ph-2',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    modelDetails: 'النسخة العالمية سناب دراجون',
    price: 580000,
    currency: 'YER',
    condition: 'جديد كرت',
    storage: '512GB',
    ram: '12GB',
    color: 'رمادي تيتانيوم',
    city: 'عدن — المنصورة',
    sellerName: 'سامسونج ستور عدن',
    sellerPhone: '967733987654',
    isVerified: true,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'phones',
    description: 'جهاز وكالة مع قلم S-Pen وضمان سنة كاملة ضد العيوب المصنعية.',
    createdAt: 'أمس'
  },
  {
    id: 'ph-3',
    name: 'Xiaomi 14 Pro Leica',
    brand: 'Xiaomi',
    modelDetails: 'كاميرات لايكا الاحترافية',
    price: 390000,
    currency: 'YER',
    condition: 'شبه جديد',
    storage: '256GB',
    ram: '12GB',
    color: 'أسود مطفي',
    city: 'تعز — جمال',
    sellerName: 'فون زون تعز',
    sellerPhone: '967711223344',
    isVerified: true,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'phones',
    description: 'استخدام أسبوعين فقط بحالة الوكالة بدون أي خدش مع الشاحن السريع 120W.',
    createdAt: 'منذ يومين'
  },
  {
    id: 'ph-4',
    name: 'iPhone 13 Pro',
    brand: 'Apple',
    modelDetails: 'بطارية 92%',
    price: 315000,
    currency: 'YER',
    condition: 'مستعمل نظيف',
    storage: '128GB',
    ram: '6GB',
    color: 'أزرق سييرا',
    city: 'حضرموت — المكلا',
    sellerName: 'المكلا فون',
    sellerPhone: '967770112233',
    isVerified: false,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'phones',
    description: 'جهاز نظيف جداً كرت مجمرك شغال شريحتين بطارية ممتازة.',
    createdAt: 'منذ 3 أيام'
  },
  {
    id: 'ph-5',
    name: 'شاحن أنكر الأصلي 65W GaN سريع',
    brand: 'Other',
    price: 19000,
    currency: 'YER',
    condition: 'جديد كرت',
    storage: 'شحن فائق 3 منافذ',
    city: 'صنعاء — الصافية',
    sellerName: 'العصرية للإكسسوارات',
    sellerPhone: '967777000111',
    isVerified: true,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&auto=format&fit=crop&q=85'
    ],
    category: 'accessories',
    description: 'شاحن أصلي يدعم الشحن فائق السرعة لجميع الجوالات واللابتوبات.',
    createdAt: 'أمس'
  }
];

export const PhoneMarketPage: React.FC<{ onNavigate: (path: string) => void; embedded?: boolean }> = ({ onNavigate, embedded = false }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'phones' | 'tablets' | 'laptops' | 'accessories' | 'maintenance' | 'sim_services'>('all');
  const [phoneCategory, setPhoneCategory] = useState<PhoneDeviceItem['category']>('phones');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const activeFiltersCount =
    (activeTab !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedCondition !== 'all' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setActiveTab('all');
    setSelectedBrand('all');
    setSelectedCondition('all');
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PHONES;
  });

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
          return;
        }

        const [{ data: profData }, biz] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
          getMyBusinessPage(uid),
        ]);

        if (!active) return;
        if (profData) {
          const p = profData as UserProfile;
          setProfile(p);
          setSellerName((prev) => prev || p.full_name || '');
          setSellerPhone((prev) => prev || p.phone || '');
        }
        if (biz) {
          setMyBusinessPage(biz);
          setSellerName(biz.name || '');
          setSellerPhone((prev) => prev || biz.phone || '');
          if (biz.city) setPhoneCity(biz.city);
        }
      } catch (err) {
        console.warn('PhoneMarketPage identity load fallback:', err);
      }
    };
    loadIdentity();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadIdentity();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const [selectedPhone, setSelectedPhone] = useState<PhoneDeviceItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // نافذة إضافة هاتف للبيع
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [phoneBrand, setPhoneBrand] = useState<PhoneDeviceItem['brand']>('Apple');
  const [phoneModel, setPhoneModel] = useState('');
  const [phoneStorage, setPhoneStorage] = useState('256GB');
  const [phoneRam, setPhoneRam] = useState('8GB');
  const [phoneCondition, setPhoneCondition] = useState<PhoneDeviceItem['condition']>('جديد كرت');
  const [phonePrice, setPhonePrice] = useState<number>(300000);
  const [phoneCurrency, setPhoneCurrency] = useState('YER');
  const [phoneCity, setPhoneCity] = useState('صنعاء');
  const [phoneColor, setPhoneColor] = useState('');
  const [phoneDesc, setPhoneDesc] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handleOpenPhone = (phone: PhoneDeviceItem) => {
    setSelectedPhone(phone);
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !selectedPhone) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        setActiveImageIndex(prev => (prev + 1) % selectedPhone.images.length);
      } else {
        setActiveImageIndex(prev => (prev - 1 + selectedPhone.images.length) % selectedPhone.images.length);
      }
    }
    touchStartX.current = null;
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePhone = myBusinessPage?.phone || sellerPhone.trim() || profile?.phone || '';
    if (!phoneModel.trim() || !effectivePhone || isSubmittingPhone) return;

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
      if (finalImages.length === 0) {
        finalImages = uploadedImages.length > 0
          ? uploadedImages
          : ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=85'];
      }

      const activeName = myBusinessPage?.name || sellerName.trim() || profile?.full_name || 'بائع معتمد';
      const activeUsername = myBusinessPage?.username || (profile?.email ? profile.email.split('@')[0] : 'seller');
      const activeAvatar = myBusinessPage?.avatarUrl || profile?.avatar_url || '';
      const activeBadge: BadgeType = myBusinessPage
        ? ((myBusinessPage.verificationType as BadgeType) || (myBusinessPage.isVerified ? 'gold' : 'none'))
        : ((profile as any)?.badge_type || ((profile as any)?.is_verified ? 'blue' : 'none'));

      const newEntry: PhoneDeviceItem = {
        id: `ph-${Date.now()}`,
        name: `${phoneBrand} ${phoneModel}`,
        brand: phoneBrand,
        price: Number(phonePrice),
        currency: phoneCurrency,
        condition: phoneCondition,
        storage: phoneStorage,
        ram: phoneRam,
        color: phoneColor || 'أصلي',
        city: myBusinessPage?.city || phoneCity,
        sellerName: activeName,
        sellerUsername: activeUsername,
        sellerAvatar: activeAvatar,
        sellerPhone: effectivePhone,
        isVerified: Boolean(myBusinessPage?.isVerified || (activeBadge && activeBadge !== 'none')),
        badgeType: activeBadge,
        businessId: myBusinessPage?.id,
        authorId: currentUserId || undefined,
        images: finalImages,
        category: phoneCategory,
        description: phoneDesc,
        createdAt: new Date().toISOString(),
      };

      setPhonesList(prev => {
        const updated = [newEntry, ...prev];
        try {
          localStorage.setItem(PHONES_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
      setIsAddModalOpen(false);
      setPhoneModel('');
      if (!myBusinessPage) {
        setSellerName('');
        setSellerPhone('');
      }
      setPhoneDesc('');
      setUploadedImages([]);
      setUploadedFiles([]);
      setToastMessage('تم نشر إعلان الهاتف بنجاح');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSubmittingPhone(false);
    }
  };

  const filteredPhones = useMemo(() => {
    return phonesList.filter(item => {
      const matchCategory = activeTab === 'all' || item.category === activeTab;
      const matchBrand = selectedBrand === 'all' || item.brand === selectedBrand;
      const matchCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      const matchCity = selectedCity === 'all' || item.city.includes(selectedCity);
      const q = searchQuery.trim().toLowerCase();
      const brandArMap: Record<string, string> = {
        Apple: 'ايفون آيفون ايباد آيباد أبل ابل apple iphone ipad',
        Samsung: 'سامسونج جالكسي تاب samsung galaxy tab',
        Xiaomi: 'شاومي ريدمي بوكو xiaomi redmi poco pad',
        Huawei: 'هواوي ميت باد huawei matepad',
        Honor: 'هونر honor',
        Oppo: 'اوبو أوبو oppo',
        Realme: 'ريلمي realme',
        Vivo: 'فيفو vivo',
        OnePlus: 'ون بلس oneplus',
        Google: 'جوجل بكسل google pixel',
        Tecno: 'تكنو tecno',
        Infinix: 'انفنكس إنفنكس infinix',
        Nokia: 'نوكيا nokia',
        Motorola: 'موتورولا motorola',
        Sony: 'سوني sony',
        Nothing: 'ناثينج nothing',
        itel: 'ايتل آيتل itel',
        ZTE: 'زد تي اي zte',
        MacBook: 'ماك بوك اي ماك macbook imac لابتوب حاسوب كمبيوتر',
        HP: 'اتش بي إتش بي hp لابتوب حاسوب كمبيوتر',
        Dell: 'ديل dell لابتوب حاسوب كمبيوتر',
        Lenovo: 'لينوفو ثينك باد lenovo thinkpad لابتوب حاسوب',
        Asus: 'اسوس أسوس asus لابتوب حاسوب',
        Acer: 'ايسر أيسر acer لابتوب حاسوب',
        MSI: 'ام اس اي msi لابتوب حاسوب',
        Microsoft: 'مايكروسوفت سيرفس microsoft surface لابتوب تابلت',
        Toshiba: 'توشيبا toshiba لابتوب حاسوب',
        Razer: 'ريزر razer لابتوب حاسوب',
        LG: 'ال جي lg لابتوب',
        Other: 'اخرى أخرى',
      };
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q) ||
        (item.sellerUsername || '').toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        (brandArMap[item.brand] || '').includes(q);
      return matchCategory && matchBrand && matchCondition && matchCity && matchSearch;
    });
  }, [phonesList, activeTab, selectedBrand, selectedCondition, selectedCity, searchQuery]);

  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-white"}>

      {!embedded && <AdBanner placementId="9" className="mb-1" />}

      {(!embedded && !selectedPhone) && (
      <div className={`flex items-center justify-between border-b border-[#2F3336] ${embedded ? 'px-3 py-2.5' : 'pb-2.5'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <Smartphone size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">
              سوق الهواتف والأجهزة
            </h1>
            <span className="text-[9.5px] text-[#9CA3AF] mt-0.5 block">
              أحدث الجوالات والإكسسوارات ومراكز الصيانة المعتمدة
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!embedded && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus size={13} />
              <span>عرض هاتف للبيع</span>
            </button>
          )}

          {(selectedPhone || !embedded) && (
            <button
              onClick={selectedPhone ? () => setSelectedPhone(null) : () => onNavigate('home')}
              className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{selectedPhone ? 'رجوع' : 'الرئيسية'}</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
      )}

      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-[#16A34A]/20 border border-[#16A34A] text-white text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={15} className="text-[#16A34A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================
          عرض تفاصيل الهاتف المحدد
          ============================================================ */}
      {selectedPhone ? (
        <div data-no-tab-swipe="true" className="bg-black min-h-screen pb-24">
          {/* شريط X العلوي: زر الرجوع في اليمين */}
          <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-[#2F3336]/70 px-3 py-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedPhone(null)}
              aria-label="رجوع"
              className="w-9 h-9 rounded-full hover:bg-white/10 active:scale-95 text-white flex items-center justify-center transition cursor-pointer"
            >
              <ArrowRight size={20} />
            </button>
            <h2 className="text-[16px] font-bold text-white">المنشور</h2>
          </div>

          {/* تغريدة المنشأة بالتفصيل */}
          <article className="px-3.5 pt-3">
            {/* رأس التغريدة: أفاتار + اسم المنشأة + شارة التوثيق + المعرف */}
            <div className="flex items-center justify-between gap-2">
              <div
                onClick={() => {
                  if (selectedPhone.businessId) onNavigate(`/businesses/${selectedPhone.businessId}`);
                }}
                className={`flex items-center gap-2.5 min-w-0 ${selectedPhone.businessId ? 'cursor-pointer' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 text-white font-bold text-base">
                  {selectedPhone.sellerAvatar ? (
                    <img src={selectedPhone.sellerAvatar} alt={selectedPhone.sellerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedPhone.sellerName?.[0] || 'م'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#E7E9EA] text-[15px] hover:underline truncate">
                      {selectedPhone.sellerName}
                    </span>
                    <VerifiedBadge
                      type={selectedPhone.badgeType || (selectedPhone.isVerified ? 'gold' : 'none')}
                      size={15}
                      className="shrink-0"
                    />
                  </div>
                  <div className="text-[13px] text-[#71767B] truncate" dir="ltr">
                    @{getDefaultHandle(selectedPhone)}
                  </div>
                </div>
              </div>

              <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                selectedPhone.condition === 'جديد كرت'
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                  : 'border-[#2F3336] text-[#E7E9EA] bg-black'
              }`}>
                {selectedPhone.condition}
              </span>
            </div>

            {/* نص التغريدة المرتب */}
            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h1 className="text-[16.5px] font-bold text-white leading-snug">{selectedPhone.name}</h1>
                <span className="text-[15px] font-bold text-[#FFC500] font-mono">
                  {selectedPhone.price.toLocaleString()} {selectedPhone.currency}
                </span>
              </div>

              {selectedPhone.description && (
                <p className="text-[15px] leading-[22px] text-[#E7E9EA] whitespace-pre-wrap break-words">
                  {selectedPhone.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-[#71767B]">
                <span>السعة: <strong className="text-[#E7E9EA] font-normal">{selectedPhone.storage}</strong></span>
                {selectedPhone.ram && (
                  <>
                    <span>·</span>
                    <span>الذاكرة: <strong className="text-[#E7E9EA] font-normal">{selectedPhone.ram}</strong></span>
                  </>
                )}
                {selectedPhone.color && (
                  <>
                    <span>·</span>
                    <span>اللون: <strong className="text-[#E7E9EA] font-normal">{selectedPhone.color}</strong></span>
                  </>
                )}
                <span>·</span>
                <span>{selectedPhone.city}</span>
              </div>
            </div>

            {/* صور التغريدة (تفتح مثل منصة X وتمرر باللمس) */}
            <div
              className="mt-3 relative rounded-2xl overflow-hidden border border-[#2F3336]/80 bg-black cursor-pointer select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={selectedPhone.images[activeImageIndex]}
                alt={selectedPhone.name}
                className="w-full max-h-[420px] object-cover"
              />
              {selectedPhone.images.length > 1 && (
                <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/80 text-white text-[11px] font-bold border border-white/10 flex items-center gap-1">
                  <Camera size={11} /> {activeImageIndex + 1} / {selectedPhone.images.length}
                </span>
              )}
            </div>

            {selectedPhone.images.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-2.5">
                {selectedPhone.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`صورة ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-[#2F3336]'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* سطر الوقت مثل X */}
            <div className="mt-3 py-3 border-b border-[#2F3336]/60 text-[13px] text-[#71767B] flex items-center justify-between">
              <span>{formatPhoneTimeAgo(selectedPhone.createdAt)} · {selectedPhone.city}</span>
              <span className="font-mono text-[12px]" dir="ltr">{selectedPhone.sellerPhone}</span>
            </div>

            {/* فوتر التغريدة: التفاصيل + واتساب (بدل الرتويت) + اتصال + مشاركة */}
            <div className="py-2 border-b border-[#2F3336]/60 flex items-center justify-between text-[#71767B] px-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedPhone.businessId) onNavigate(`/businesses/${selectedPhone.businessId}`);
                }}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-[#1D9BF0]/10 hover:text-[#1D9BF0] transition text-[12.5px] font-medium cursor-pointer"
              >
                <User size={16} />
                <span>المنشأة</span>
              </button>

              <a
                href={`https://wa.me/${selectedPhone.sellerPhone}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن جهاز ${selectedPhone.name} المعروض في يمن ريتنغ بسعر ${selectedPhone.price} ${selectedPhone.currency}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-[#00BA7C]/10 hover:text-[#00BA7C] transition text-[12.5px] font-medium"
              >
                <MessageCircle size={16} />
                <span>واتساب</span>
              </a>

              <a
                href={`tel:${selectedPhone.sellerPhone}`}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-[#FFC500]/10 hover:text-[#FFC500] transition text-[12.5px] font-medium"
              >
                <Phone size={16} />
                <span>اتصال</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`${selectedPhone.name} - ${selectedPhone.price.toLocaleString()} ${selectedPhone.currency} - ${selectedPhone.sellerPhone}`);
                  setToastMessage('تم نسخ تفاصيل الإعلان');
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-full hover:bg-[#1D9BF0]/10 hover:text-[#1D9BF0] transition text-[12.5px] cursor-pointer"
                title="مشاركة"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="2.5" />
                  <circle cx="6" cy="12" r="2.5" />
                  <circle cx="18" cy="19" r="2.5" />
                  <line x1="8.5" y1="13.5" x2="15.5" y2="17.5" />
                  <line x1="15.5" y1="6.5" x2="8.5" y2="10.5" />
                </svg>
              </button>
            </div>
          </article>
        </div>
      ) : (
        /* ============================================================
           عرض قائمة سوق الهواتف
           ============================================================ */
        <div className={embedded ? "divide-y divide-[#2F3336]/40" : "space-y-3"}>

          {/* شريط البحث + الإعلان الراعي + الفلتر */}
          <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]"}>
            <XSearchFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} placeholder="ابحث في سوق الهواتف..." activeFiltersCount={activeFiltersCount} onOpenFilter={() => setIsFilterModalOpen(true)} />

            {/* 2. إعلان راعي */}
            {embedded && <AdBanner placementId="9" className="py-0.5" />}
          </div>

          {/* قائمة المنشورات بأسلوب تغريدات المنشأة في X */}
          <div className="divide-y divide-[#2F3336]/60">
            {filteredPhones.map((phone) => (
              <article
                key={phone.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target.closest('button') && !target.closest('a')) {
                    handleOpenPhone(phone);
                  }
                }}
                className="p-3.5 bg-black hover:bg-white/[0.02] transition cursor-pointer select-none"
              >
                <div className="flex gap-3">
                  {/* أفاتار المنشأة */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (phone.businessId) onNavigate(`/businesses/${phone.businessId}`);
                      else handleOpenPhone(phone);
                    }}
                    className="w-12 h-12 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 text-white font-bold text-base cursor-pointer hover:opacity-85 transition"
                  >
                    {phone.sellerAvatar ? (
                      <img src={phone.sellerAvatar} alt={phone.sellerName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{phone.sellerName?.[0] || 'م'}</span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* صف الاسم + شارة التوثيق + المعرّف + الوقت (مطابق لـ CommunityFeedPage) */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center flex-nowrap min-w-0 w-full gap-1">
                        <span
                          onClick={(e) => {
                            if (phone.businessId) {
                              e.stopPropagation();
                              onNavigate(`/businesses/${phone.businessId}`);
                            }
                          }}
                          className="font-bold text-[#E7E9EA] text-[13px] hover:underline cursor-pointer truncate shrink max-w-[135px] sm:max-w-[185px]"
                        >
                          {phone.sellerName}
                        </span>
                        <VerifiedBadge
                          type={phone.badgeType || (phone.isVerified ? 'gold' : 'none')}
                          size={14.5}
                          className="shrink-0"
                        />
                        <span className="text-[11.5px] text-[#71767B] truncate shrink max-w-[90px] sm:max-w-[125px]" dir="ltr">
                          @{getDefaultHandle(phone)}
                        </span>
                        <span className="text-[#71767B] text-[10.5px] mx-0.5 shrink-0">·</span>
                        <span className="text-[#71767B] text-[11px] whitespace-nowrap shrink-0">
                          {formatPhoneTimeAgo(phone.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* ترتيب النص مثل تغريدات المنشأة */}
                    <div className="mt-0.5 space-y-1">
                      <div className="text-[14px] leading-[20px] font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{phone.name}</span>
                        <span className="text-[#71767B] font-normal">·</span>
                        <span className="text-[#FFC500] font-mono text-[13px]">
                          {phone.price.toLocaleString()} {phone.currency}
                        </span>
                      </div>

                      {phone.description && (
                        <p className="text-[13.5px] leading-[20px] text-[#D6D9DB] whitespace-pre-wrap break-words font-normal select-text">
                          {phone.description}
                        </p>
                      )}

                      <div className="text-[12px] text-[#71767B] flex flex-wrap items-center gap-1.5">
                        <span>{phone.condition}</span>
                        <span>·</span>
                        <span>{phone.storage}{phone.ram ? ` / ${phone.ram}` : ''}</span>
                        <span>·</span>
                        <span>{phone.city}</span>
                      </div>
                    </div>

                    {/* صورة المنشور (تفتح عارض X مباشرة عند النقر) */}
                    {phone.images?.[0] && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhone(phone);
                          setActiveImageIndex(0);
                          setIsLightboxOpen(true);
                        }}
                        className="mt-2.5 rounded-2xl overflow-hidden border border-[#2F3336]/50 max-h-80 bg-zinc-950 relative cursor-pointer"
                      >
                        <img src={phone.images[0]} alt={phone.name} className="w-full max-h-80 object-cover" loading="lazy" />
                        {phone.images.length > 1 && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-white text-[10.5px] font-bold border border-white/10">
                            1 / {phone.images.length}
                          </span>
                        )}
                      </div>
                    )}

                    {/* فوتر التغريدة بأسلوب XActionBar: تفاصيل + واتساب (بدل الرتويت) + اتصال + مشاركة */}
                    <div
                      className="flex items-center justify-between text-[#71767B] w-full mt-2.5 mb-0 pb-0.5 px-0 select-none leading-none"
                      dir="rtl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenPhone(phone)}
                        className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors cursor-pointer py-1"
                        title="التفاصيل"
                      >
                        <ArrowRight size={14} className="rtl:rotate-180" />
                        <span className="text-[11.5px] font-medium">التفاصيل</span>
                      </button>

                      <a
                        href={`https://wa.me/${phone.sellerPhone}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن ${phone.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-[#00BA7C] transition-colors py-1"
                        title="واتساب"
                      >
                        <MessageCircle size={14.5} />
                        <span className="text-[11.5px] font-medium">واتساب</span>
                      </a>

                      <a
                        href={`tel:${phone.sellerPhone}`}
                        className="flex items-center gap-1.5 hover:text-[#FFC500] transition-colors py-1"
                        title="اتصال"
                      >
                        <Phone size={14} />
                        <span className="text-[11.5px] font-medium">اتصال</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(`${phone.name} - ${phone.price.toLocaleString()} ${phone.currency} - ${phone.sellerPhone}`);
                          setToastMessage('تم نسخ تفاصيل الإعلان');
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        className="hover:text-[#1D9BF0] transition-colors cursor-pointer py-1"
                        title="مشاركة"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="2.5" />
                          <circle cx="6" cy="12" r="2.5" />
                          <circle cx="18" cy="19" r="2.5" />
                          <line x1="8.5" y1="13.5" x2="15.5" y2="17.5" />
                          <line x1="15.5" y1="6.5" x2="8.5" y2="10.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {embedded && !selectedPhone && !isAddModalOpen && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-[#FFC500] hover:bg-[#E5B200] active:scale-95 text-black flex items-center justify-center shadow-lg shadow-black/60 transition"
              title="عرض هاتف للبيع"
            >
              <Plus size={24} className="stroke-[2.2]" />
            </button>
          )}
        </div>
      )}

      {/* ============================================================
          عارض الصور باللمس (Touch Swipe Lightbox)
          ============================================================ */}
      {isLightboxOpen && selectedPhone && (
        <div
          dir="rtl"
          className="fixed inset-0 z-[99999] bg-black flex flex-col justify-between select-none overflow-hidden"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* الشريط العلوي بأسلوب X: زر الرجوع في اليمين */}
          <div
            className="w-full pt-4 pb-2 px-4 flex items-center justify-between z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="رجوع"
              className="w-11 h-11 rounded-full bg-[#192227] hover:bg-[#202b32] active:scale-95 transition flex items-center justify-center text-white border border-white/5 shadow-md cursor-pointer"
            >
              <ArrowRight size={20} />
            </button>

            {selectedPhone.images.length > 1 && (
              <span className="px-3 py-1.5 rounded-full bg-[#192227] text-white text-xs font-mono border border-white/5">
                {activeImageIndex + 1} / {selectedPhone.images.length}
              </span>
            )}
          </div>

          {/* الصورة الوسطية (تمرر باللمس) */}
          <div
            className="flex-1 flex items-center justify-center px-2 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhone.images[activeImageIndex]}
              alt={selectedPhone.name}
              className="w-full max-h-[78vh] object-contain"
            />
          </div>

          {/* الشريط السفلي بأسلوب XImagePlayer */}
          <div
            className="w-full px-4 pt-6 pb-5 flex flex-col gap-3 z-50"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,0) 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPhone.images.length > 1 && (
              <div className="flex justify-center items-center gap-1.5">
                {selectedPhone.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`صورة ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {selectedPhone.sellerAvatar ? (
                    <img src={selectedPhone.sellerAvatar} alt={selectedPhone.sellerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedPhone.sellerName?.[0] || 'م'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-[14px] truncate">{selectedPhone.sellerName}</span>
                    <VerifiedBadge
                      type={selectedPhone.badgeType || (selectedPhone.isVerified ? 'gold' : 'none')}
                      size={13.5}
                      className="shrink-0"
                    />
                  </div>
                  <div className="text-[#71767B] text-[12px] truncate">
                    {selectedPhone.name} · {selectedPhone.price.toLocaleString()} {selectedPhone.currency}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://wa.me/${selectedPhone.sellerPhone}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن ${selectedPhone.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-full bg-[#192227] hover:bg-[#202b32] text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <MessageCircle size={14} />
                  <span>واتساب</span>
                </a>
                <a
                  href={`tel:${selectedPhone.sellerPhone}`}
                  className="px-3.5 py-2 rounded-full bg-[#192227] hover:bg-[#202b32] text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Phone size={14} />
                  <span>اتصال</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          نافذة إضافة هاتف للبيع (رفع من 1 إلى 6 صور)
          ============================================================ */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black sm:bg-black/80 flex items-center justify-center sm:p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <form
            onSubmit={handleSubmitPhone}
            className="bg-black sm:border sm:border-[#2F3336] sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden text-white"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* شريط X العلوي: إلغاء + زر نشر */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2F3336]/60 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition cursor-pointer"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
              <span className="text-[13px] font-bold text-[#71767B]">عرض هاتف للبيع</span>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black font-bold text-[13px] transition cursor-pointer"
              >
                نشر
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {(myBusinessPage || profile) ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-[#2F3336] flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0 text-white font-bold">
                      {(myBusinessPage?.avatarUrl || profile?.avatar_url) ? (
                        <img
                          src={myBusinessPage?.avatarUrl || profile?.avatar_url}
                          alt={myBusinessPage?.name || profile?.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{(myBusinessPage?.name || profile?.full_name)?.[0] || 'م'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white text-xs truncate">
                          {myBusinessPage?.name || profile?.full_name}
                        </span>
                        <VerifiedBadge
                          type={
                            myBusinessPage
                              ? ((myBusinessPage.verificationType as BadgeType) || (myBusinessPage.isVerified ? 'gold' : 'none'))
                              : 'none'
                          }
                          size={13}
                        />
                      </div>
                      <div className="text-[11px] text-[#71767B] truncate" dir="ltr">
                        @{myBusinessPage?.username || (profile?.email ? profile.email.split('@')[0] : 'account')}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold shrink-0">
                      {myBusinessPage ? 'صفحة المنشأة' : 'حسابك'}
                    </span>
                  </div>

                  {!(myBusinessPage?.phone || profile?.phone) && (
                    <div>
                      <label className="text-[11px] text-[#71767B] block mb-1">رقم الهاتف للتواصل (واتساب / اتصال)</label>
                      <input
                        type="tel"
                        required
                        placeholder="967777..."
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-xs text-white font-mono outline-none caret-white"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-[#71767B] block mb-1">اسم البائع / المحل</label>
                    <input
                      type="text"
                      required
                      placeholder="اسمك أو اسم المحل..."
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-xs text-white outline-none caret-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#71767B] block mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      required
                      placeholder="967777..."
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-xs text-white font-mono outline-none caret-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] text-[#71767B] block mb-1">القسم</label>
                <YRSelect
                  value={phoneCategory}
                  onChange={(val) => setPhoneCategory(val as PhoneDeviceItem['category'])}
                  options={[
                    { value: 'phones', label: 'الجوالات' },
                    { value: 'tablets', label: 'الآيبادات والأجهزة اللوحية' },
                    { value: 'laptops', label: 'الحواسيب واللابتوبات' },
                    { value: 'accessories', label: 'الإكسسوارات' },
                    { value: 'maintenance', label: 'الصيانة' },
                    { value: 'sim_services', label: 'الشرائح' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الماركة</label>
                  <YRSelect
                    value={phoneBrand}
                    onChange={(val) => setPhoneBrand(val)}
                    options={[
                      ...PHONE_BRANDS.map((b) => ({ value: b.id, label: b.label })),
                      ...COMPUTER_BRANDS.map((b) => ({ value: b.id, label: b.label })),
                      { value: 'Other', label: 'أخرى' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">موديل الجهاز</label>
                  <input
                    type="text"
                    required
                    placeholder="iPhone 15 Pro Max..."
                    value={phoneModel}
                    onChange={(e) => setPhoneModel(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-xs text-white outline-none caret-white"
                  />
                </div>
              </div>

              {/* رفع الصور */}
              <div>
                <label className="text-[11px] text-[#71767B] block mb-1">صور الهاتف (1 إلى 6 صور)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl border border-dashed border-[#2F3336] hover:border-white text-white/80 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer"
                >
                  <Upload size={14} className="text-[#FFC500]" />
                  <span>اختر صور الجهاز ({uploadedImages.length}/6)</span>
                </button>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative h-16 rounded-xl overflow-hidden border border-[#2F3336]">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(i)}
                          className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الحالة</label>
                  <YRSelect
                    compact
                    value={phoneCondition}
                    onChange={(val) => setPhoneCondition(val as any)}
                    options={[
                      { value: 'جديد كرت', label: 'جديد كرت' },
                      { value: 'شبه جديد', label: 'شبه جديد' },
                      { value: 'مستعمل نظيف', label: 'مستعمل نظيف' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">السعة</label>
                  <input
                    type="text"
                    required
                    placeholder="256GB"
                    value={phoneStorage}
                    onChange={(e) => setPhoneStorage(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white font-mono outline-none caret-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الرام</label>
                  <input
                    type="text"
                    placeholder="8GB"
                    value={phoneRam}
                    onChange={(e) => setPhoneRam(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white font-mono outline-none caret-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">السعر</label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    value={phonePrice}
                    onChange={(e) => setPhonePrice(Number(e.target.value))}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white font-mono outline-none caret-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">العملة</label>
                  <YRSelect
                    compact
                    value={phoneCurrency}
                    onChange={(val) => setPhoneCurrency(val)}
                    options={[
                      { value: 'YER', label: 'ر.ي (YER)' },
                      { value: 'SAR', label: 'ر.س (SAR)' },
                      { value: 'USD', label: 'دولار ($)' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">المحافظة</label>
                  <YRSelect
                    compact
                    value={phoneCity}
                    onChange={(val) => setPhoneCity(val)}
                    options={YEMEN_GOVERNORATES.map((gov) => ({ value: gov, label: gov }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#71767B] block mb-1">ملاحظات ومواصفات</label>
                <textarea
                  rows={3}
                  placeholder="اكتب مواصفات الجهاز وحالة البطارية والملحقات..."
                  value={phoneDesc}
                  onChange={(e) => setPhoneDesc(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-xs text-white outline-none resize-none caret-white"
                />
              </div>
            </div>
          </form>
        </div>
      )}

            <XFilterModal
        isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="تصفية النتائج"
        activeFiltersCount={activeFiltersCount} onReset={resetFilters} resultsCount={filteredPhones.length}
        fields={[
          { label: 'القسم', value: activeTab, onChange: (v) => setActiveTab(v as any), options: [{ value: 'all', label: 'كل الأقسام' }, { value: 'phones', label: 'الجوالات' }, { value: 'tablets', label: 'الآيبادات والأجهزة اللوحية' }, { value: 'laptops', label: 'الحواسيب واللابتوبات' }, { value: 'accessories', label: 'الإكسسوارات' }, { value: 'maintenance', label: 'الصيانة' }, { value: 'sim_services', label: 'الشرائح وخدمات الاتصال' }] },
          { label: 'الماركة / نوع الجهاز', value: selectedBrand, onChange: setSelectedBrand, options: [{ value: 'all', label: 'جميع الماركات والأجهزة' }, ...PHONE_BRANDS.map((b) => ({ value: b.id, label: b.label })), ...COMPUTER_BRANDS.map((b) => ({ value: b.id, label: b.label })), { value: 'Other', label: 'أخرى' }] },
          { label: 'الحالة', value: selectedCondition, onChange: setSelectedCondition, options: [{ value: 'all', label: 'كل الحالات' }, { value: 'جديد كرت', label: 'جديد كرت' }, { value: 'شبه جديد', label: 'شبه جديد' }, { value: 'مستعمل نظيف', label: 'مستعمل نظيف' }] },
          { label: 'المحافظة', value: selectedCity, onChange: setSelectedCity, options: YEMEN_GOV_FILTER_OPTIONS },
        ]}
      />
    </div>
  );
};
