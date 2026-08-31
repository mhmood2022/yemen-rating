import React, { useState, useMemo } from 'react';
import { 
  Smartphone, Tag, Wrench, Radio, Sparkles, Search, 
  MapPin, Phone, MessageCircle, ArrowRight, Star, ShieldCheck, 
  Filter, Check, SlidersHorizontal, Store
} from 'lucide-react';
import { AdBanner } from '../components/common/AdBanner';

interface PhoneItem {
  id: string;
  name: string;
  brand: 'Apple' | 'Samsung' | 'Xiaomi' | 'Huawei' | 'Other';
  price: string;
  currency: string;
  condition: 'جديد كرت' | 'شبه جديد' | 'مستعمل نظيف';
  storage: string;
  ram?: string;
  color?: string;
  city: string;
  storeName: string;
  storePhone: string;
  isVerified: boolean;
  image: string;
  category: 'phones' | 'accessories' | 'maintenance' | 'sim_services';
}

const DEMO_PHONES: PhoneItem[] = [
  {
    id: 'ph-1',
    name: 'iPhone 15 Pro Max (256GB)',
    brand: 'Apple',
    price: '1,150',
    currency: 'USD',
    condition: 'جديد كرت',
    storage: '256GB',
    ram: '8GB',
    color: 'تيتانيوم طبيعي',
    city: 'صنعاء',
    storeName: 'مركز أبل الخليج',
    storePhone: '967777123456',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    category: 'phones'
  },
  {
    id: 'ph-2',
    name: 'Samsung Galaxy S24 Ultra (512GB)',
    brand: 'Samsung',
    price: '1,080',
    currency: 'USD',
    condition: 'جديد كرت',
    storage: '512GB',
    ram: '12GB',
    color: 'رمادي تيتانيوم',
    city: 'عدن',
    storeName: 'سامسونج ستور عدن',
    storePhone: '967733987654',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    category: 'phones'
  },
  {
    id: 'ph-3',
    name: 'Xiaomi 14 Pro Leica (256GB)',
    brand: 'Xiaomi',
    price: '720',
    currency: 'USD',
    condition: 'شبه جديد',
    storage: '256GB',
    ram: '12GB',
    color: 'أسود مطفي',
    city: 'تعز',
    storeName: 'فون زون للإلكترونيات',
    storePhone: '967711223344',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
    category: 'phones'
  },
  {
    id: 'ph-4',
    name: 'iPhone 13 Pro (128GB)',
    brand: 'Apple',
    price: '580',
    currency: 'USD',
    condition: 'مستعمل نظيف',
    storage: '128GB',
    ram: '6GB',
    color: 'أزرق سيراميك',
    city: 'حضرموت - المكلا',
    storeName: 'حضرموت فون',
    storePhone: '967770112233',
    isVerified: false,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    category: 'phones'
  },
  {
    id: 'ph-5',
    name: 'شاحن أنكر الأصلي 65W GaN سريع',
    brand: 'Other',
    price: '35',
    currency: 'USD',
    condition: 'جديد كرت',
    storage: 'شحن فائق',
    city: 'صنعاء',
    storeName: 'العصرية للإكسسوارات',
    storePhone: '967777000111',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    category: 'accessories'
  },
  {
    id: 'ph-6',
    name: 'سماعات Apple AirPods Pro 2 الأصلية',
    brand: 'Apple',
    price: '210',
    currency: 'USD',
    condition: 'جديد كرت',
    storage: 'عازل للضوضاء',
    city: 'عدن',
    storeName: 'توب تيك عدن',
    storePhone: '967733556677',
    isVerified: true,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
    category: 'accessories'
  }
];

export const PhoneMarketPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'phones' | 'accessories' | 'maintenance' | 'sim_services'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'devices' | 'stores'>('devices');

  const filteredPhones = useMemo(() => {
    return DEMO_PHONES.filter(item => {
      const matchCategory = activeTab === 'all' || item.category === activeTab;
      const matchBrand = selectedBrand === 'all' || item.brand === selectedBrand;
      const matchCity = selectedCity === 'all' || item.city.includes(selectedCity);
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.storeName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchBrand && matchCity && matchSearch;
    });
  }, [activeTab, selectedBrand, selectedCity, searchQuery]);

  return (
    <div dir="rtl" className="space-y-4 pb-28 pt-2 max-w-6xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">
      
      {/* 1. شريط العنوان والرجوع السلس */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-lg shadow-[#FFC500]/20">
            <Smartphone size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white leading-tight">
              سوق الهواتف والأجهزة الذكية
            </h2>
            <p className="text-[10px] text-[#9CA3AF]">
              أحدث الجوالات الأصلية، الإكسسوارات، وخدمات الصيانة المعتمدة في اليمن
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#121215] border border-[#242428] text-xs font-bold text-[#D1D5DB] hover:text-[#FFC500] transition-colors cursor-pointer"
        >
          <span>الرئيسية</span>
          <ArrowRight size={13} className="rtl:rotate-180" />
        </button>
      </div>

      {/* 2. إعلان البانر المخصص لسوق الهواتف YR Ads #9 */}
      <AdBanner placementId="9" className="mb-2" />

      {/* 3. شريط البحث والفلترة السريعة بالهوية الجديدة */}
      <div className="space-y-2.5 bg-[#0F0F12] p-3.5 rounded-2xl border border-[#222226] shadow-xl">
        
        {/* حقل البحث بالاسم */}
        <div className="flex items-center bg-[#18181C] border border-[#27272A] rounded-xl px-3 py-1.5">
          <Search size={16} className="text-[#8E8E93] ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن موديل (iPhone 15, S24 Ultra, Xiaomi) أو اسم المحل..."
            className="flex-1 bg-transparent text-xs text-white placeholder-[#6B6B75] outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-white">
              إلغاء
            </button>
          )}
        </div>

        {/* فلاتر الأقسام (الكل، الجوالات، الإكسسوارات، الصيانة) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'الكل', icon: Sparkles },
            { id: 'phones', label: 'الجوالات', icon: Smartphone },
            { id: 'accessories', label: 'الإكسسوارات والشواحن', icon: Tag },
            { id: 'maintenance', label: 'مراكز الصيانة والقطع', icon: Wrench },
            { id: 'sim_services', label: 'الشرائح والخدمات', icon: Radio },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id as any)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#FFC500] text-black shadow-md shadow-[#FFC500]/20' 
                    : 'bg-[#18181C] text-[#9CA3AF] border border-[#27272A] hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* فلاتر الماركات والمدن السريعة */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#1F2937]/60 flex-wrap">
          {/* الماركات */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
            {['all', 'Apple', 'Samsung', 'Xiaomi', 'Other'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  selectedBrand === b 
                    ? 'bg-[#161D2B] border-[#FFC500] text-[#FFC500]' 
                    : 'bg-[#121215] border-[#222226] text-gray-400'
                }`}
              >
                {b === 'all' ? 'جميع الماركات' : b === 'Other' ? 'ماركات أخرى' : b}
              </button>
            ))}
          </div>

          {/* المدن */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-[#18181C] border border-[#27272A] rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#D1D5DB] outline-none cursor-pointer"
          >
            <option value="all">كل المدن</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="حضرموت">حضرموت - المكلا</option>
            <option value="الحديدة">الحديدة</option>
            <option value="إب">إب</option>
          </select>
        </div>

      </div>

      {/* 4. شبكة كروت الهواتف والأجهزة العصرية بالهوية الفاخرة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[#9CA3AF]">
            تم العثور على <b className="text-white font-mono">{filteredPhones.length}</b> جهاز وعرض متاح
          </span>
        </div>

        {filteredPhones.length === 0 ? (
          <div className="text-center py-12 bg-[#0F0F12] rounded-2xl border border-[#222226] p-6 space-y-2">
            <Smartphone size={32} className="mx-auto text-gray-500" />
            <h4 className="text-sm font-bold text-white">لا توجد أجهزة مطابقة لبحثك حالياً</h4>
            <p className="text-xs text-gray-400">جرب تغيير الماركة أو المدينة للوصول لنتائج أكثر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPhones.map((phone) => (
              <div 
                key={phone.id}
                className="bg-[#0F0F12] rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 overflow-hidden shadow-lg transition-all flex flex-col justify-between"
              >
                {/* الجزء العلوي: الصورة والشارات */}
                <div className="h-40 w-full relative bg-[#161619]">
                  <img src={phone.image} alt={phone.name} className="w-full h-full object-cover" />
                  
                  {/* شارة الحالة */}
                  <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-md ${
                    phone.condition === 'جديد كرت' ? 'bg-[#16A34A] text-white' : 'bg-[#FFC500] text-black'
                  }`}>
                    {phone.condition}
                  </span>

                  {/* مواصفات الذاكرة */}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 text-gray-200 text-[10px] font-mono border border-white/10 backdrop-blur-sm">
                    {phone.storage} {phone.ram ? `• ${phone.ram} RAM` : ''}
                  </span>

                  {/* شارة السعر */}
                  <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/90 text-[#FFC500] text-xs font-mono font-black border border-[#FFC500]/40 shadow-lg">
                    ${phone.price}
                  </span>
                </div>

                {/* تفاصيل الجهاز والمتجر */}
                <div className="p-3.5 space-y-2">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white leading-snug">
                      {phone.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] mt-1">
                      <MapPin size={12} className="text-[#FFC500]" />
                      <span>{phone.city}</span>
                      <span>•</span>
                      <span className="text-gray-300">{phone.color || 'أصلي وكالة'}</span>
                    </div>
                  </div>

                  {/* بيانات المحل والتواصل الفوري */}
                  <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-200 truncate max-w-[130px]">
                      <Store size={13} className="text-[#FFC500] shrink-0" />
                      <span className="truncate">{phone.storeName}</span>
                      {phone.isVerified && <ShieldCheck size={13} className="text-[#16A34A] shrink-0" />}
                    </div>

                    {/* أزرار التواصل المباشر */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* واتساب */}
                      <a
                        href={`https://wa.me/${phone.storePhone}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن جهاز ${phone.name} المعلن بسعر $${phone.price} في يمن ريتنغ`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/30 hover:bg-[#16A34A] hover:text-white transition-all text-[11px] font-bold flex items-center gap-1"
                        title="محادثة واتساب مباشرة"
                      >
                        <MessageCircle size={13} />
                        <span>واتساب</span>
                      </a>

                      {/* اتصال */}
                      <a
                        href={`tel:${phone.storePhone}`}
                        className="p-1.5 rounded-lg bg-[#18181C] text-gray-300 border border-[#27272A] hover:text-[#FFC500] hover:border-[#FFC500] transition-all"
                        title="اتصال هاتفي"
                      >
                        <Phone size={13} />
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
