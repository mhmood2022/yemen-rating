import React, { useState, useMemo, useRef } from 'react';
import { 
  Smartphone, Tag, Wrench, Radio, Sparkles, Search, 
  MapPin, Phone, MessageCircle, ArrowRight, Plus, X, 
  Upload, Trash2, CheckCircle2, ShieldCheck, User, Camera,
  Zap, Check, SlidersHorizontal, Cpu
} from 'lucide-react';
import { AdBanner } from '../components/common/AdBanner';

export interface PhoneDeviceItem {
  id: string;
  name: string;
  brand: 'Apple' | 'Samsung' | 'Xiaomi' | 'Huawei' | 'Other';
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
  category: 'phones' | 'accessories' | 'maintenance' | 'sim_services';
  description?: string;
  createdAt: string;
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
  const [activeTab, setActiveTab] = useState<'all' | 'phones' | 'accessories' | 'maintenance' | 'sim_services'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [phonesList, setPhonesList] = useState<PhoneDeviceItem[]>(INITIAL_PHONES);
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

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 6 - uploadedImages.length;
      const filesToTake = Array.from(files).slice(0, remainingSlots);
      const newUrls = filesToTake.map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newUrls]);
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
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

  const handleSubmitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneModel.trim() || !sellerPhone.trim()) return;

    const defaultImg = uploadedImages.length > 0 
      ? uploadedImages 
      : ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&auto=format&fit=crop&q=85'];

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
      city: phoneCity,
      sellerName: sellerName || 'بائع معتمد',
      sellerPhone: sellerPhone,
      isVerified: true,
      images: defaultImg,
      category: 'phones',
      description: phoneDesc,
      createdAt: 'الآن'
    };

    setPhonesList(prev => [newEntry, ...prev]);
    setIsAddModalOpen(false);
    setPhoneModel('');
    setSellerName('');
    setSellerPhone('');
    setPhoneDesc('');
    setUploadedImages([]);
    setToastMessage('تم إضافة الهاتف وعرضه في السوق بنجاح');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredPhones = useMemo(() => {
    return phonesList.filter(item => {
      const matchCategory = activeTab === 'all' || item.category === activeTab;
      const matchBrand = selectedBrand === 'all' || item.brand === selectedBrand;
      const matchCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      const matchCity = selectedCity === 'all' || item.city.includes(selectedCity);
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchBrand && matchCondition && matchCity && matchSearch;
    });
  }, [phonesList, activeTab, selectedBrand, selectedCondition, selectedCity, searchQuery]);

  return (
    <div dir="rtl" className={embedded ? "bg-black min-h-screen text-white font-['Tahoma',sans-serif]" : "max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-white"}>

      {!embedded && <AdBanner placementId="9" className="mb-1" />}

      {(!embedded || selectedPhone) && (
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
        <div className="bg-black min-h-screen pb-24 divide-y divide-[#2F3336]/40">
          {/* منشور التفاصيل الرئيسي بنكهة X */}
          <div className="p-3.5 space-y-3">
            {/* صف البائع */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {selectedPhone.sellerName?.[0] || <Smartphone size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white text-[14.5px] truncate">{selectedPhone.sellerName}</span>
                    {selectedPhone.isVerified && <ShieldCheck size={14} className="text-[#FFC500] shrink-0" />}
                  </div>
                  <div className="text-[12px] text-[#71767B] truncate">
                    @{selectedPhone.city} · {selectedPhone.brand} · {selectedPhone.createdAt}
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                selectedPhone.condition === 'جديد كرت'
                  ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                  : 'border-[#2F3336] text-[#E7E9EA] bg-black'
              }`}>
                {selectedPhone.condition}
              </span>
            </div>

            {/* العنوان والسعر */}
            <div className="space-y-1">
              <h2 className="text-[16px] font-bold text-white leading-snug">{selectedPhone.name}</h2>
              <div className="text-[15px] font-bold text-[#FFC500] font-mono">
                {selectedPhone.price.toLocaleString()} {selectedPhone.currency}
              </div>
            </div>

            {/* المواصفات كسطر أنيق */}
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#71767B]">
              <span className="px-2.5 py-1 rounded-full border border-[#2F3336] text-[#E7E9EA]">السعة: {selectedPhone.storage}</span>
              <span className="px-2.5 py-1 rounded-full border border-[#2F3336] text-[#E7E9EA]">الذاكرة: {selectedPhone.ram || '—'}</span>
              <span className="px-2.5 py-1 rounded-full border border-[#2F3336] text-[#E7E9EA]">اللون: {selectedPhone.color || 'أصلي'}</span>
            </div>

            {/* الوصف */}
            {selectedPhone.description && (
              <p className="text-[14px] text-[#E7E9EA] leading-relaxed whitespace-pre-wrap">
                {selectedPhone.description}
              </p>
            )}

            {/* الصورة الرئيسية بنمط X */}
            <div
              className="relative rounded-2xl overflow-hidden border border-[#2F3336]/60 bg-black cursor-pointer select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={selectedPhone.images[activeImageIndex]}
                alt={selectedPhone.name}
                className="w-full max-h-[380px] object-cover"
              />
              {selectedPhone.images.length > 1 && (
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/80 text-white text-[11px] font-bold border border-white/10 flex items-center gap-1">
                  <Camera size={11} /> {activeImageIndex + 1} / {selectedPhone.images.length}
                </span>
              )}
            </div>

            {/* صور مصغرة */}
            {selectedPhone.images.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {selectedPhone.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-10 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-white' : 'border-[#2F3336] opacity-55'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* شريط التواصل بنمط X */}
          <div className="px-3.5 py-3 flex items-center justify-between gap-2">
            <div className="text-[12.5px] font-mono text-[#71767B]" dir="ltr">
              {selectedPhone.sellerPhone}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${selectedPhone.sellerPhone}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن جهاز ${selectedPhone.name} المعروض في يمن ريتنغ بسعر ${selectedPhone.price} ${selectedPhone.currency}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-full bg-[#FFC500] text-black text-[12px] font-bold flex items-center gap-1.5 hover:bg-[#e6b100] transition"
              >
                <MessageCircle size={14} />
                <span>واتساب</span>
              </a>
              <a
                href={`tel:${selectedPhone.sellerPhone}`}
                className="px-3.5 py-1.5 rounded-full bg-black text-white border border-[#2F3336] hover:border-white text-[12px] font-bold flex items-center gap-1.5 transition"
              >
                <Phone size={13} />
                <span>اتصال</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================
           عرض قائمة سوق الهواتف
           ============================================================ */
        <div className={embedded ? "divide-y divide-[#2F3336]/40" : "space-y-3"}>

          {/* شريط البحث + الإعلان الراعي + الفلتر */}
          <div className={embedded ? "px-3 pt-2.5 pb-2.5 space-y-2 bg-black border-b border-[#2F3336]/40" : "space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]"}>
            {/* 1. شريط البحث */}
            <div className="flex items-center bg-black border border-[#2F3336] focus-within:border-white rounded-full px-3.5 py-1.5 transition-colors">
              <Search size={15} className="text-[#71767B] ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في سوق الهواتف..."
                className="flex-1 bg-transparent text-[13px] text-white placeholder-[#71767B] outline-none caret-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#71767B] hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* 2. إعلان راعي */}
            {embedded && <AdBanner placementId="9" className="py-0.5" />}

            {/* 3. الفلتر */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'الكل', icon: Sparkles },
                { id: 'phones', label: 'الجوالات', icon: Smartphone },
                { id: 'accessories', label: 'الإكسسوارات', icon: Tag },
                { id: 'maintenance', label: 'الصيانة', icon: Wrench },
                { id: 'sim_services', label: 'الشرائح', icon: Radio },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`shrink-0 px-3 py-1 rounded-full text-[11.5px] font-bold border transition-all flex items-center gap-1 ${
                      activeTab === tab.id
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-[#71767B] border-[#2F3336] hover:text-white'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-1.5 pt-1">
              <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
                {[
                  { id: 'all', label: 'كل الماركات' },
                  { id: 'Apple', label: 'Apple' },
                  { id: 'Samsung', label: 'Samsung' },
                  { id: 'Xiaomi', label: 'Xiaomi' },
                  { id: 'Other', label: 'أخرى' },
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all ${
                      selectedBrand === b.id
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-black border-[#2F3336] text-[#71767B]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-black border border-[#2F3336] focus:border-white rounded-full px-2.5 py-0.5 text-[11px] font-bold text-[#E7E9EA] outline-none cursor-pointer shrink-0"
              >
                <option value="all">كل المحافظات</option>
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="حضرموت">حضرموت</option>
                <option value="إب">إب</option>
                <option value="الحديدة">الحديدة</option>
                <option value="مأرب">مأرب</option>
              </select>
            </div>
          </div>

          {/* قائمة المنشورات بأسلوب تغريدات X */}
          <div className="divide-y divide-[#2F3336]/40">
            {filteredPhones.map((phone) => (
              <article
                key={phone.id}
                onClick={() => handleOpenPhone(phone)}
                className="p-3 bg-black hover:bg-white/[0.03] transition cursor-pointer flex gap-3"
              >
                <div className="w-11 h-11 rounded-full bg-zinc-900 border border-[#2F3336] flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {phone.sellerName?.[0] || <Smartphone size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap text-[13px]">
                    <span className="font-bold text-white truncate max-w-[160px]">{phone.sellerName}</span>
                    {phone.isVerified && <ShieldCheck size={14} className="text-[#FFC500] shrink-0" />}
                    <span className="text-[#71767B] text-[12px]">@{phone.city} · {phone.brand}</span>
                    <span className="text-[#71767B] text-[11px] mr-auto">{phone.createdAt}</span>
                  </div>

                  <div className="mt-1 text-[14.5px] font-bold text-[#E7E9EA] leading-snug">
                    {phone.name}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-[#71767B] flex flex-wrap items-center gap-2">
                    <span>{phone.condition}</span>
                    <span>·</span>
                    <span>{phone.storage}{phone.ram ? ` / ${phone.ram}` : ''}</span>
                    <span className="text-[#FFC500] font-bold">· {phone.price.toLocaleString()} {phone.currency}</span>
                  </div>
                  {phone.description && (
                    <p className="mt-1 text-[13px] text-[#D6D9DB] line-clamp-2 leading-relaxed">
                      {phone.description}
                    </p>
                  )}

                  {phone.images?.[0] && (
                    <div className="mt-2.5 rounded-2xl overflow-hidden border border-[#2F3336]/50 max-h-80 bg-zinc-950">
                      <img src={phone.images[0]} alt={phone.name} className="w-full max-h-80 object-cover" loading="lazy" />
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-between text-[#71767B] text-[12px] pt-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleOpenPhone(phone)} className="hover:text-white transition flex items-center gap-1">
                      <ArrowRight size={14} className="rtl:rotate-180" />
                      <span>التفاصيل</span>
                    </button>
                    <a
                      href={`https://wa.me/${phone.sellerPhone}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن ${phone.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition flex items-center gap-1"
                    >
                      <MessageCircle size={14} />
                      <span>واتساب</span>
                    </a>
                    <a href={`tel:${phone.sellerPhone}`} className="hover:text-[#FFC500] transition flex items-center gap-1">
                      <Phone size={14} />
                      <span>اتصال</span>
                    </a>
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
          className="fixed inset-0 z-50 bg-black  flex flex-col justify-between p-4 select-none cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center pt-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <Camera size={13} /> {activeImageIndex + 1} من {selectedPhone.images.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="px-3 py-1 rounded-xl bg-[#18181C] text-[#FFC500] border border-[#FFC500]/30 text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
            >
              رجوع
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-4" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedPhone.images[activeImageIndex]} 
              alt="Fullscreen" 
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl" 
            />
          </div>

          <div className="flex justify-center items-center gap-1.5 pb-4" onClick={e => e.stopPropagation()}>
            {selectedPhone.images.map((_, idx) => (
              <span 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx ? 'w-5 bg-[#FFC500]' : 'w-1.5 bg-gray-700'
                }`} 
              />
            ))}
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

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">الماركة</label>
                  <select
                    value={phoneBrand}
                    onChange={(e) => setPhoneBrand(e.target.value as any)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2.5 text-xs text-white outline-none font-bold"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Huawei">Huawei</option>
                    <option value="Other">ماركات أخرى</option>
                  </select>
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
                  <select
                    value={phoneCondition}
                    onChange={(e) => setPhoneCondition(e.target.value as any)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="جديد كرت">جديد كرت</option>
                    <option value="شبه جديد">شبه جديد</option>
                    <option value="مستعمل نظيف">مستعمل نظيف</option>
                  </select>
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
                  <select
                    value={phoneCurrency}
                    onChange={(e) => setPhoneCurrency(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="ر.ي">ر.ي</option>
                    <option value="ر.س">ر.س</option>
                    <option value="$">$</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#71767B] block mb-1">المدينة</label>
                  <select
                    value={phoneCity}
                    onChange={(e) => setPhoneCity(e.target.value)}
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت">حضرموت</option>
                    <option value="إب">إب</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="مأرب">مأرب</option>
                  </select>
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

    </div>
  );
};
