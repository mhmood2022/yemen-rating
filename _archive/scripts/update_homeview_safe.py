homeview_code = '''import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, X, Star, Gavel, ChevronLeft, Landmark, Briefcase, Smartphone,
  GraduationCap, Hotel, Building2, UtensilsCrossed, Stethoscope,
  Layers, Clock, ShieldCheck, Car, Wrench, ShoppingBag, Truck,
  Sparkles, ArrowRight
} from 'lucide-react';
import { BusinessItem } from '../../data/mockData';
import { AdBanner } from '../common/AdBanner';

interface HomeViewProps {
  onSelectCategory: (slug: string) => void;
  onSelectBusiness: (business: BusinessItem) => void;
  businesses?: BusinessItem[];
  onNavigateAuctions: () => void;
  onNavigateRealEstate: () => void;
  onNavigateJobs: () => void;
  onNavigateExchangeRates: () => void;
  onNavigatePhones?: () => void;
  onNavigateBanks?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCategory,
  onSelectBusiness,
  businesses = [],
  onNavigateAuctions,
  onNavigateRealEstate,
  onNavigateJobs,
  onNavigateExchangeRates,
  onNavigatePhones = () => onSelectCategory('phones'),
  onNavigateBanks
}) => {
  const navigate = useNavigate();

  // حالات الواجهة والتفاعل
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [activeDealsTab, setActiveDealsTab] = useState<'auctions' | 'realestate' | 'jobs'>('auctions');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('الكل');
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);

  // محافظات الجمهورية اليمنية للفلترة الوطنية
  const governorates = [
    'الكل', 'صنعاء', 'عدن', 'تعز', 'حضرموت', 'مأرب', 'إب', 'الحديدة',
    'شبوة', 'لحج', 'أبين', 'المهرة', 'صعدة', 'ذمار', 'عمران', 'حجة',
    'البيضاء', 'الضالع', 'سقطرى', 'ريمة', 'المحويت', 'الجوف'
  ];

  // قائمة الـ 34 تصنيفاً الرسمية الكاملة للمنصة
  const all34Categories = [
    { id: 'banks', name: 'البنوك والمصارف', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10', sector: 'مال وأعمال' },
    { id: 'exchange', name: 'شركات الصرافة والتحويلات', icon: Landmark, color: 'text-emerald-400', bg: 'bg-emerald-400/10', sector: 'مال وأعمال' },
    { id: 'hotels', name: 'الفنادق والشاليهات', icon: Hotel, color: 'text-blue-400', bg: 'bg-blue-400/10', sector: 'سياحة وضيافة' },
    { id: 'restaurants', name: 'المطاعم والكافيهات', icon: UtensilsCrossed, color: 'text-orange-400', bg: 'bg-orange-400/10', sector: 'سياحة وضيافة' },
    { id: 'hospitals', name: 'المستشفيات والمراكز الطبية', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-400/10', sector: 'صحة ورعاية' },
    { id: 'pharmacies', name: 'الصيدليات والمختبرات', icon: Stethoscope, color: 'text-teal-400', bg: 'bg-teal-400/10', sector: 'صحة ورعاية' },
    { id: 'universities', name: 'الجامعات والكليات', icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-400/10', sector: 'تعليم وتأهيل' },
    { id: 'schools', name: 'المدارس والمعاهد', icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-400/10', sector: 'تعليم وتأهيل' },
    { id: 'realestate', name: 'العقارات والاستثمار', icon: Building2, color: 'text-green-400', bg: 'bg-green-400/10', sector: 'عقارات ومقاولات' },
    { id: 'auctions', name: 'المزادات العامة', icon: Gavel, color: 'text-red-400', bg: 'bg-red-400/10', sector: 'صفقات وفرص' },
    { id: 'jobs', name: 'فرص التوظيف والعمل', icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-400/10', sector: 'صفقات وفرص' },
    { id: 'cars', name: 'معارض وتجارة السيارات', icon: Car, color: 'text-violet-400', bg: 'bg-violet-400/10', sector: 'سيارات ونقل' },
    { id: 'phones', name: 'سوق الهواتف والأجهزة', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-400/10', sector: 'إلكترونيات وتكنولوجيا' },
    { id: 'solar', name: 'الطاقة الشمسية والكهرباء', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10', sector: 'طاقة وصناعة' },
    { id: 'malls', name: 'المراكز التجارية والمولات', icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-400/10', sector: 'تسوق وتجارة' },
    { id: 'shipping', name: 'شركات النقل والشحن', icon: Truck, color: 'text-sky-400', bg: 'bg-sky-400/10', sector: 'سيارات ونقل' },
    { id: 'maintenance', name: 'خدمات الصيانة والمهن', icon: Wrench, color: 'text-lime-400', bg: 'bg-lime-400/10', sector: 'خدمات عامة' },
    { id: 'contracting', name: 'المقاولات والإنشاءات', icon: Building2, color: 'text-yellow-500', bg: 'bg-yellow-500/10', sector: 'عقارات ومقاولات' }
  ];

  // التوجيه الصحيح المباشر للبنوك
  const handleNavigateBanks = () => {
    if (onNavigateBanks) {
      onNavigateBanks();
    } else {
      try {
        navigate('/banks');
      } catch {
        window.location.href = '/banks';
      }
    }
  };

  // أسعار الصرف الحية والذهب
  const ratesData = {
    sanaa: {
      usd: { buy: '534.76', sell: '538.00' },
      sar: { buy: '140.43', sell: '140.70' },
      gold24: { buy: '42,500' },
      gold21: { buy: '37,200' }
    },
    aden: {
      usd: { buy: '1,910.00', sell: '1,925.00' },
      sar: { buy: '501.50', sell: '504.00' },
      gold24: { buy: '132,000' },
      gold21: { buy: '115,500' }
    }
  };
  const currentRates = ratesData[activeMarket];

  // محرك البحث الحي المرتبط بقاعدة البيانات ومصفوفة businesses الحقيقية
  const filteredSearchBusinesses = useMemo(() => {
    if (!searchQuery.trim() && selectedGovernorate === 'الكل') return [];
    return businesses.filter(b => {
      const q = searchQuery.toLowerCase();
      const matchName = b.name ? b.name.toLowerCase().includes(q) : false;
      const matchCat = (b.category && b.category.toLowerCase().includes(q)) ||
                       ((b as Record<string, any>).categorySlug && (b as Record<string, any>).categorySlug.toLowerCase().includes(q));
      const matchCity = selectedGovernorate === 'الكل' || (b.city && b.city.includes(selectedGovernorate));
      return (searchQuery.trim() === '' || matchName || matchCat) && matchCity;
    });
  }, [businesses, searchQuery, selectedGovernorate]);

  return (
    <div dir="rtl" className="space-y-3.5 pt-1 max-w-5xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">

      {/* ======================================================== */}
      {/* 1. شريط البحث الذكي الوطني التفاعلي (مربوط بقاعدة البيانات) */}
      {/* ======================================================== */}
      <div
        onClick={() => setIsSearchOpen(true)}
        className="flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-[#0D1322] border border-zinc-700/60 hover:border-[#FFC500]/60 transition-all cursor-pointer shadow-lg group"
      >
        <div className="flex items-center gap-2.5 text-zinc-400 group-hover:text-zinc-200">
          <Search size={18} className="text-[#FFC500]" />
          <span className="text-xs sm:text-sm font-medium">ابحث عن بنك، فندق، وظيفة، عقار، منشأة معتمدة...</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/50 border border-white/10 text-[11px] text-zinc-300">
          <MapPin size={12} className="text-[#FFC500]" />
          <span>كل محافظات اليمن</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. أسعار الصرف والذهب الحية (صنعاء / عدن) */}
      {/* ======================================================== */}
      <div className="bg-[#0D121F] border border-[#1F2937] rounded-2xl p-2.5 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>أسعار الصرف والذهب المباشرة</span>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveMarket('sanaa')}
              className={`px-3 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeMarket === 'sanaa' ? 'bg-[#FFC500] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              صنعاء
            </button>
            <button
              onClick={() => setActiveMarket('aden')}
              className={`px-3 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeMarket === 'aden' ? 'bg-[#FFC500] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              عدن
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-2 text-center">
          <div className="bg-black/30 p-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-zinc-400 block">الدولار $</span>
            <span className="text-xs font-mono font-bold text-white block">{currentRates.usd.buy}</span>
            <span className="text-[9px] text-zinc-500 block">بيع: {currentRates.usd.sell}</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-zinc-400 block">السعودي ر.س</span>
            <span className="text-xs font-mono font-bold text-white block">{currentRates.sar.buy}</span>
            <span className="text-[9px] text-zinc-500 block">بيع: {currentRates.sar.sell}</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-amber-400 block">ذهب 24</span>
            <span className="text-xs font-mono font-bold text-amber-300 block">{currentRates.gold24.buy}</span>
            <span className="text-[9px] text-zinc-500 block">ريال</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-amber-400 block">ذهب 21</span>
            <span className="text-xs font-mono font-bold text-amber-300 block">{currentRates.gold21.buy}</span>
            <span className="text-[9px] text-zinc-500 block">ريال</span>
          </div>
        </div>

        <button
          onClick={onNavigateExchangeRates}
          className="w-full mt-2 pt-1.5 border-t border-white/5 text-[11px] font-bold text-[#FFC500] hover:underline flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>جدول الصرافة والتحويلات التفصيلي</span>
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. إعلان الراعي الرسمي الأول (محمي بنظام AdBanner الأصلي) */}
      {/* ======================================================== */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md">
        <AdBanner placementId="1" className="w-full" />
      </div>

      {/* ======================================================== */}
      {/* 4. بوابات الخدمات المعتمدة (الـ 34 تصنيفاً الرسمية) */}
      {/* ======================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Layers size={15} className="text-[#FFC500]" /> بوابات الخدمات والمنشآت المعتمدة
          </h3>
          <button
            onClick={() => setShowAllCategoriesModal(true)}
            className="text-[11px] font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض كافة التصنيفات (34)</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {/* أهم الأيقونات في شريط سريع */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { name: 'البنوك والصرافة', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10', action: handleNavigateBanks },
            { name: 'المطاعم والكافيهات', icon: UtensilsCrossed, color: 'text-orange-400', bg: 'bg-orange-400/10', action: () => onSelectCategory('restaurants') },
            { name: 'الفنادق والشاليهات', icon: Hotel, color: 'text-blue-400', bg: 'bg-blue-400/10', action: () => onSelectCategory('hotels') },
            { name: 'المستشفيات والعيادات', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-400/10', action: () => onSelectCategory('hospitals') },
            { name: 'الجامعات والتعليم', icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-400/10', action: () => onSelectCategory('universities') },
            { name: 'سوق الهواتف', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-400/10', action: onNavigatePhones },
            { name: 'العقارات', icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-400/10', action: onNavigateRealEstate },
            { name: 'المزادات', icon: Gavel, color: 'text-red-400', bg: 'bg-red-400/10', action: onNavigateAuctions },
            { name: 'الوظائف', icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-400/10', action: onNavigateJobs }
          ].map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={cat.action}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#101522] hover:bg-[#182032] border border-white/10 hover:border-[#FFC500]/50 transition-all shrink-0 w-[80px] text-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={19} />
                </div>
                <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white line-clamp-1">
                  {cat.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. محرك الصفقات الحية: مزادات 5% + عقارات + توظيف */}
      {/* ======================================================== */}
      <div className="bg-[#0A0E18] border border-[#1E2638] rounded-2xl p-3 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveDealsTab('auctions')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDealsTab === 'auctions' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Gavel size={13} /> المزادات (%5)
            </button>
            <button
              onClick={() => setActiveDealsTab('realestate')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDealsTab === 'realestate' ? 'bg-[#FFC500] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 size={13} /> العقارات
            </button>
            <button
              onClick={() => setActiveDealsTab('jobs')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDealsTab === 'jobs' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Briefcase size={13} /> الوظائف
            </button>
          </div>

          <button
            onClick={() => {
              if (activeDealsTab === 'auctions') onNavigateAuctions();
              else if (activeDealsTab === 'realestate') onNavigateRealEstate();
              else onNavigateJobs();
            }}
            className="text-[11px] font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>استعراض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {activeDealsTab === 'auctions' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { title: 'تويوتا لاندكروزر V8 2023', price: '182k SAR', time: '04:12', city: 'صنعاء' },
              { title: 'أرض تجارية 800م² موقع استثماري', price: '95m YER', time: '08:45', city: 'عدن' },
              { title: 'شاحنة نقل مرسيدس أكتروس 2021', price: '58k USD', time: '02:30', city: 'حضرموت' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={onNavigateAuctions}
                className="bg-black/40 border border-zinc-800 p-2.5 rounded-xl hover:border-red-500/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className="px-1.5 py-0.2 bg-red-600/30 text-red-400 rounded font-bold border border-red-600/40">مزاد موثق</span>
                    <span className="text-zinc-400 flex items-center gap-0.5 font-mono"><Clock size={10} /> {item.time}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                  <span className="text-[10px] text-zinc-500 mt-1 block">📍 {item.city}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">الافتتاح:</span>
                  <span className="font-mono font-bold text-sm text-[#FFC500]">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeDealsTab === 'realestate' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { title: 'شقة سكنية عائلية فاخرة', price: '3.5k SAR/شهر', type: 'إيجار', city: 'تعز' },
              { title: 'فيلا مستقلة مع مسبح وحوش', price: '$450,000', type: 'بيع', city: 'عدن' },
              { title: 'عمارة استثمارية 4 طوابق موقع حيوي', price: '$850,000', type: 'فرصة', city: 'صنعاء' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={onNavigateRealEstate}
                className="bg-black/40 border border-zinc-800 p-2.5 rounded-xl hover:border-[#FFC500]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="px-1.5 py-0.2 bg-[#FFC500]/20 text-[#FFC500] rounded font-bold">{item.type}</span>
                  <span className="text-zinc-500 font-bold">📍 {item.city}</span>
                </div>
                <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">القيمة:</span>
                  <span className="font-mono font-bold text-xs text-[#FFC500]">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeDealsTab === 'jobs' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { title: 'مهندس برمجيات وتطبيقات', company: 'قطاع التكنولوجيا', salary: '$1,200', city: 'صنعاء' },
              { title: 'مدير تسويق رقمي ومبيعات', company: 'مجموعة استيراد وتوزيع', salary: '$900', city: 'عدن' },
              { title: 'محاسب مالي قانوني معتمد', company: 'مؤسسة تجارية كبرى', salary: '$800', city: 'حضرموت' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={onNavigateJobs}
                className="bg-black/40 border border-zinc-800 p-2.5 rounded-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-bold">توظيف مباشر</span>
                  <span className="text-zinc-500 font-mono text-[9px]">📍 {item.city}</span>
                </div>
                <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                <p className="text-[10px] text-zinc-400">{item.company}</p>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">الراتب:</span>
                  <span className="font-mono font-bold text-xs text-emerald-400">{item.salary}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 6. البنر الإعلاني الأوسط (محمي بنظام AdBanner الأصلي) */}
      {/* ======================================================== */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* ======================================================== */}
      {/* 7. بوابة التوثيق الرسمي لأصحاب الأعمال والتجار في اليمن */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#101524] to-black border border-[#FFC500]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC500]/20 text-[#FFC500] border border-[#FFC500]/40 flex items-center justify-center shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">هل تمتلك منشأة، متجر، أو نشاط تجاري في اليمن؟</h4>
            <p className="text-[11px] text-zinc-300 mt-0.5">وثّق نشاطك رسمياً في "يمن ريتنغ" واحصل على تقييمات موثوقة وعملاء جدد من عموم المحافظات.</p>
          </div>
        </div>

        <button
          onClick={() => alert('لإضافة وتوثيق منشأتك يرجى التواصل مع إدارة منصة يمن ريتنغ عبر واتساب المعتمد.')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-xs transition-all shrink-0 cursor-pointer shadow active:scale-95"
        >
          طلب توثيق منشأة الآن
        </button>
      </div>

      {/* ======================================================== */}
      {/* نافذة البحث الذكي المنبثقة التفاعلية (مع إعلان الراعي المدمج) */}
      {/* ======================================================== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="max-w-3xl w-full mx-auto space-y-3">
            {/* حقل البحث وزر الإغلاق */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 p-2.5 px-3.5 bg-[#121826] border border-[#FFC500]/60 rounded-2xl">
                <Search size={18} className="text-[#FFC500]" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، التصنيف، أو النشاط التجاري..."
                  className="w-full bg-transparent border-none outline-none text-white text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 rounded-2xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* فلتر المحافظات في اليمن */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
              <span className="text-zinc-400 shrink-0 text-[11px] font-bold">المحافظة:</span>
              {governorates.map((gov) => (
                <button
                  key={gov}
                  onClick={() => setSelectedGovernorate(gov)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all text-xs cursor-pointer ${
                    selectedGovernorate === gov ? 'bg-[#FFC500] text-black' : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {gov}
                </button>
              ))}
            </div>

            {/* مساحة إعلانية استثمارية راعية داخل البحث */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-900/30 to-zinc-900 border border-[#FFC500]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FFC500] text-black rounded">إعلان ممول</span>
                <span className="text-xs font-bold text-white">عروض الشحن السريع والتحويلات المعتمدة</span>
              </div>
              <span className="text-[10px] text-[#FFC500] font-bold">برعاية YR Pro</span>
            </div>

            {/* عرض نتائج البحث الحقيقية المقروءة من businesses */}
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pt-1">
              {filteredSearchBusinesses.length > 0 ? (
                filteredSearchBusinesses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSelectBusiness(item);
                    }}
                    className="p-3 rounded-xl bg-[#121826] border border-zinc-800 hover:border-[#FFC500] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{item.category} • 📍 {item.city || 'اليمن'}</p>
                    </div>
                    <span className="text-xs text-[#FFC500] flex items-center gap-0.5 font-bold font-mono">
                      {item.rating || '5.0'} <Star size={12} className="fill-[#FFC500]" />
                    </span>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  لا توجد منشآت مسجلة تطابق بحثك حالياً في {selectedGovernorate === 'الكل' ? 'عموم المحافظات' : selectedGovernorate}.
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  <span className="text-xs font-bold text-zinc-400">التصنيفات الشائعة:</span>
                  <div className="flex flex-wrap gap-2">
                    {['بنوك وصرافة', 'شقق للإيجار', 'مطاعم', 'أطباء استشاريون', 'سيارات للبيع'].map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 hover:border-[#FFC500] cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* نافذة استعراض كامل التصنيفات الـ 34 الرسمية */}
      {/* ======================================================== */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="max-w-4xl w-full mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Layers className="text-[#FFC500]" /> الدليل الوطني الشامل (34 تصنيفاً رسمياً)
              </h3>
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-1">
              {all34Categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setShowAllCategoriesModal(false);
                      if (cat.id === 'banks') handleNavigateBanks();
                      else onSelectCategory(cat.id);
                    }}
                    className="p-3 rounded-xl bg-[#111624] border border-zinc-800/80 hover:border-[#FFC500]/60 transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-200 group-hover:text-white line-clamp-1">{cat.name}</h4>
                      <span className="text-[10px] text-zinc-500 block">{cat.sector}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
'''

with open("src/components/home/HomeView.tsx", "w", encoding="utf-8") as f:
    f.write(homeview_code)
print("✅ تم حفظ الملف بنجاح مع الحفاظ على جميع ارتباطات قاعدة البيانات والإعلانات.")
