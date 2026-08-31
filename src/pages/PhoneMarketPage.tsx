import React, { useState, useMemo, useRef } from 'react';
import { 
  Smartphone, Tag, Wrench, Radio, Sparkles, Search, 
  MapPin, Phone, MessageCircle, ArrowRight, Plus, X, 
  Upload, Trash2, CheckCircle2, ShieldCheck, User
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

export const PhoneMarketPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'phones' | 'accessories' | 'maintenance' | 'sim_services'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // المعاينة وعارض الصور
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
  const [phoneCurrency, setPhoneCurrency] = useState('YER'); // يمني افتراضي
  const [phoneCity, setPhoneCity] = useState('صنعاء');
  const [phoneColor, setPhoneColor] = useState('');
  const [phoneDesc, setPhoneDesc] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // إحداثيات السحب باللمس
  const touchStartX = useRef<number | null>(null);

  const handleOpenPhone = (phone: PhoneDeviceItem) => {
    setSelectedPhone(phone);
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // رفع من 1 إلى 6 صور من الهاتف
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

  // التمرير باللمس في المعرض
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

  // إضافة هاتف للبيع
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
    setAgreedToPolicy(false);
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
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر المخصص لسوق الهواتف #9 */}
      <AdBanner placementId="9" className="mb-1" />

      {/* 2. رأس الصفحة الرسمي الأنيق */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus size={13} />
            <span>عرض هاتف للبيع</span>
          </button>
          
          <button
            onClick={selectedPhone ? () => setSelectedPhone(null) : () => onNavigate('home')}
            className="px-3 py-1.5 rounded-xl bg-[#161619] border border-[#FFC500]/40 text-xs font-black text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{selectedPhone ? 'رجوع' : 'الرئيسية'}</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

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
        <div className="space-y-3">
          <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] overflow-hidden shadow-xl">
            
            {/* معرض الصور باللمس (1-6 صور) */}
            <div 
              className="relative h-56 sm:h-72 w-full bg-[#161619] overflow-hidden cursor-pointer select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img 
                src={selectedPhone.images[activeImageIndex]} 
                alt={selectedPhone.name} 
                className="w-full h-full object-cover transition-all duration-300" 
              />
              
              <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-md ${
                selectedPhone.condition === 'جديد كرت' ? 'bg-[#16A34A] text-white' : 'bg-[#FFC500] text-black'
              }`}>
                {selectedPhone.condition}
              </span>

              <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/85 text-[#FFC500] text-xs font-mono font-black border border-[#FFC500]/30 backdrop-blur-md">
                {selectedPhone.price.toLocaleString()} {selectedPhone.currency}
              </span>

              <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/85 text-white text-[9px] font-bold border border-white/10">
                📷 {activeImageIndex + 1} من {selectedPhone.images.length}
              </span>
            </div>

            {/* صور مصغرة للتنقل السريع */}
            {selectedPhone.images.length > 1 && (
              <div className="flex gap-1.5 p-2 bg-[#121215] border-t border-[#1F2937] overflow-x-auto no-scrollbar">
                {selectedPhone.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-9 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#FFC500]' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* التفاصيل والمواصفات */}
            <div className="p-3.5 sm:p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-bold">
                    {selectedPhone.brand}
                  </span>
                  <span className="text-[11px] text-gray-400">📍 {selectedPhone.city}</span>
                  {selectedPhone.isVerified && <span className="text-[9px] text-[#16A34A] font-bold">✓ موثق</span>}
                </div>
                <h2 className="text-sm sm:text-base font-black text-white leading-snug">
                  {selectedPhone.name}
                </h2>
              </div>

              {/* شبكة مواصفات الذاكرة واللون */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                  <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">السعة التخزينية</span>
                  <b className="text-xs text-white font-bold">{selectedPhone.storage}</b>
                </div>
                <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                  <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">الذاكرة العشوائية</span>
                  <b className="text-xs text-white font-bold">{selectedPhone.ram || '—'}</b>
                </div>
                <div className="p-2 rounded-xl bg-[#161619] border border-[#27272A]">
                  <span className="text-[8.5px] text-[#9CA3AF] font-['Cairo'] block">اللون</span>
                  <b className="text-xs text-white font-bold font-['Cairo']">{selectedPhone.color || 'أصلي'}</b>
                </div>
              </div>

              {selectedPhone.description && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-[#D1D5DB]">ملاحظات ومواصفات الجهاز:</h3>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed font-medium">
                    {selectedPhone.description}
                  </p>
                </div>
              )}

              {/* أزرار التواصل المباشر */}
              <div className="bg-[#161619] p-3.5 rounded-xl border border-[#27272A] space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-[#FFC500]" />
                    <span className="text-xs font-bold text-white">{selectedPhone.sellerName}</span>
                  </div>
                  <span className="text-[9.5px] text-gray-400">تاريخ العرض: {selectedPhone.createdAt}</span>
                </div>

                <div className="pt-2 border-t border-[#27272A] flex items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-gray-200">
                    <span>{selectedPhone.sellerPhone}</span>
                  </div>

                  <div className="flex gap-1.5">
                    <a
                      href={`https://wa.me/${selectedPhone.sellerPhone}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن جهاز ${selectedPhone.name} المعروض في يمن ريتنغ بسعر ${selectedPhone.price} ${selectedPhone.currency}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#16A34A] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#16A34A]/90"
                    >
                      <MessageCircle size={13} />
                      <span>واتساب</span>
                    </a>
                    <a
                      href={`tel:${selectedPhone.sellerPhone}`}
                      className="p-1.5 rounded-lg bg-[#18181C] text-white border border-[#27272A] hover:border-[#FFC500]"
                    >
                      <Phone size={13} />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* ============================================================
           عرض قائمة سوق الهواتف
           ============================================================ */
        <div className="space-y-3">
          
          {/* شريط الفلاتر والبحث */}
          <div className="space-y-2 bg-[#0F0F12] p-2.5 rounded-2xl border border-[#222226]">
            
            {/* حقل البحث */}
            <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-xl px-2.5 py-1">
              <Search size={14} className="text-gray-400 ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن جوال، ماركة، أو محل..."
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* الأقسام السريعة */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'phones', label: 'الجوالات' },
                { id: 'accessories', label: 'الإكسسوارات' },
                { id: 'maintenance', label: 'الصيانة والقطع' },
                { id: 'sim_services', label: 'الشرائح' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#FFC500] text-black border-[#FFC500]' 
                      : 'bg-[#18181C] text-gray-400 border-[#27272A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* الماركات والمحافظات */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#1F2937]/50">
              <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1">
                {['all', 'Apple', 'Samsung', 'Xiaomi', 'Other'].map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      selectedBrand === b 
                        ? 'bg-[#18181C] border-[#FFC500] text-[#FFC500]' 
                        : 'bg-[#121215] border-[#222226] text-gray-400'
                    }`}
                  >
                    {b === 'all' ? 'الماركات' : b === 'Other' ? 'أخرى' : b}
                  </button>
                ))}
              </div>

              {/* اختيار المحافظة */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-[#18181C] border border-[#27272A] rounded-lg px-2 py-0.5 text-[10px] font-bold text-[#D1D5DB] outline-none cursor-pointer shrink-0"
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

          {/* شبكة كروت الهواتف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredPhones.map((phone) => (
              <div
                key={phone.id}
                className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 overflow-hidden shadow-md transition-all flex flex-col justify-between"
              >
                <div className="h-40 w-full relative bg-[#161619]">
                  <img src={phone.images[0]} alt={phone.name} className="w-full h-full object-cover" />
                  
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black ${
                    phone.condition === 'جديد كرت' ? 'bg-[#16A34A] text-white' : 'bg-[#FFC500] text-black'
                  }`}>
                    {phone.condition}
                  </span>

                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/85 text-[#FFC500] text-[10px] font-mono font-black border border-white/10">
                    {phone.price.toLocaleString()} {phone.currency}
                  </span>

                  <span className="absolute bottom-2 right-2 px-1.5 py-0.2 rounded bg-black/80 text-gray-300 text-[8.5px] font-mono">
                    {phone.storage}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9.5px] text-gray-400 mb-0.5">
                      <span className="text-[#FFC500] font-bold">{phone.brand}</span>
                      <span>•</span>
                      <span>{phone.city}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {phone.name}
                    </h3>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-[#1F2937]">
                    <span className="text-[10px] text-gray-300 font-bold truncate max-w-[120px]">
                      {phone.sellerName}
                    </span>

                    <button
                      onClick={() => handleOpenPhone(phone)}
                      className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center gap-1 cursor-pointer active:scale-98"
                    >
                      <span>عرض التفاصيل</span>
                      <ArrowRight size={11} className="rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================
          عارض الصور باللمس (Touch Swipe Lightbox)
          ============================================================ */}
      {isLightboxOpen && selectedPhone && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 select-none cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center pt-2" onClick={e => e.stopPropagation()}>
            <span className="text-xs text-gray-400 font-mono">
              {activeImageIndex + 1} من {selectedPhone.images.length}
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-md p-4 sm:p-5 space-y-3 max-h-[90vh] overflow-y-auto cursor-default shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#222226] pb-2">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Plus size={15} className="text-[#FFC500]" /> عرض هاتف للبيع
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="px-2.5 py-1 rounded-lg bg-[#18181C] text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
              >
                رجوع
              </button>
            </div>

            <form onSubmit={handleSubmitPhone} className="space-y-2.5 text-xs">
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">اسم البائع / المحل</label>
                  <input
                    type="text"
                    required
                    placeholder="اسمك أو اسم المحل..."
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">رقم الهاتف (للاتصال والواتساب)</label>
                  <input
                    type="tel"
                    required
                    placeholder="967777..."
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none focus:border-[#FFC500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">ماركة الهاتف</label>
                  <select
                    value={phoneBrand}
                    onChange={(e) => setPhoneBrand(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold"
                  >
                    <option value="Apple">Apple (آيفون)</option>
                    <option value="Samsung">Samsung (سامسونج)</option>
                    <option value="Xiaomi">Xiaomi (شاومي)</option>
                    <option value="Huawei">Huawei (هواوي)</option>
                    <option value="Other">ماركات أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">موديل الجهاز</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: iPhone 14 Pro Max..."
                    value={phoneModel}
                    onChange={(e) => setPhoneModel(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
                  />
                </div>
              </div>

              {/* رفع صور الهاتف من 1 إلى 6 صور */}
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">صور الهاتف (من 1 إلى 6 صور)</label>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImagesUpload} 
                  className="hidden" 
                />
                
                <div className="flex gap-2 items-center flex-wrap">
                  {uploadedImages.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3 rounded-xl bg-[#18181C] border border-dashed border-[#FFC500]/60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-[#FFC500]"
                    >
                      <Upload size={14} className="text-[#FFC500]" />
                      <span>اختيار صور من الهاتف</span>
                    </button>
                  )}

                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#27272A] shrink-0">
                      <img src={img} alt="upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded bg-red-600 text-white text-[9px]"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">الذاكرة والتخزين</label>
                  <select
                    value={phoneStorage}
                    onChange={(e) => setPhoneStorage(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-mono"
                  >
                    <option value="64GB">64 GB</option>
                    <option value="128GB">128 GB</option>
                    <option value="256GB">256 GB</option>
                    <option value="512GB">512 GB</option>
                    <option value="1TB">1 TB</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">حالة الجهاز</label>
                  <select
                    value={phoneCondition}
                    onChange={(e) => setPhoneCondition(e.target.value as any)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold"
                  >
                    <option value="جديد كرت">جديد كرت</option>
                    <option value="شبه جديد">شبه جديد (استخدام بسيط)</option>
                    <option value="مستعمل نظيف">مستعمل نظيف</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">السعر المطلوب</label>
                  <input
                    type="number"
                    required
                    value={phonePrice}
                    onChange={(e) => setPhonePrice(Number(e.target.value))}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">العملة</label>
                  <select
                    value={phoneCurrency}
                    onChange={(e) => setPhoneCurrency(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none font-bold"
                  >
                    <option value="YER">ريال يمني (YER)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">المحافظة</label>
                  <select
                    value={phoneCity}
                    onChange={(e) => setPhoneCity(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت - المكلا">حضرموت - المكلا</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="إب">إب</option>
                    <option value="مأرب">مأرب</option>
                    <option value="ذمار">ذمار</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">لون الجهاز</label>
                  <input
                    type="text"
                    placeholder="مثال: أسود، أزرق، تيتانيوم..."
                    value={phoneColor}
                    onChange={(e) => setPhoneColor(e.target.value)}
                    className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">تفاصيل ومواصفات إضافية</label>
                <textarea
                  rows={2}
                  value={phoneDesc}
                  onChange={(e) => setPhoneDesc(e.target.value)}
                  placeholder="اكتب حالة البطارية، الملحقات، أو الضمان..."
                  className="w-full bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#222226]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181C] text-gray-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#FFC500]/90 cursor-pointer shadow-md"
                >
                  نشر الهاتف في السوق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
