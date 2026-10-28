homeview_code = '''import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, Gavel, ChevronLeft, Landmark, Briefcase, Smartphone,
  GraduationCap, Hotel, Building2, UtensilsCrossed, Stethoscope,
  Layers, Clock, ShieldCheck, Car, Wrench, ShoppingBag, Truck,
  Sparkles, ArrowRight, X, Coffee, Store, Scissors, Glasses, MapPin
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
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [activeDealsTab, setActiveDealsTab] = useState<'auctions' | 'realestate' | 'jobs'>('auctions');
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);

  // أسعار الصرف الحية والذهب
  const ratesData = {
    sanaa: { usd: { buy: '534.76', sell: '538.00' }, sar: { buy: '140.43', sell: '140.70' }, gold24: { buy: '42,500' }, gold21: { buy: '37,200' } },
    aden: { usd: { buy: '1,910.00', sell: '1,925.00' }, sar: { buy: '501.50', sell: '504.00' }, gold24: { buy: '132,000' }, gold21: { buy: '115,500' } }
  };
  const currentRates = ratesData[activeMarket];

  // قائمة الـ 33 تصنيفاً الرسمية - كل صنف مستقل تماماً بقالبه الخاص
  const officialCategories = [
    { id: 'banks', name: 'البنوك والصرافة', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'transport', name: 'شركات النقل', icon: Truck, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { id: 'hospitals', name: 'المستشفيات', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 'clinics', name: 'العيادات', icon: Stethoscope, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'labs', name: 'المختبرات', icon: Stethoscope, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { id: 'pharmacies', name: 'الصيدليات', icon: Stethoscope, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'universities', name: 'الجامعات', icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'schools', name: 'المدارس', icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: 'hotels', name: 'الفنادق', icon: Hotel, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'chalets', name: 'الشاليهات', icon: Hotel, color: 'text-blue-300', bg: 'bg-blue-300/10' },
    { id: 'parks', name: 'الحدائق', icon: Sparkles, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'wedding-halls', name: 'صالات الأفراح', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'barbers', name: 'الحلاقون', icon: Scissors, color: 'text-amber-300', bg: 'bg-amber-300/10' },
    { id: 'salons', name: 'الكوافير', icon: Scissors, color: 'text-rose-300', bg: 'bg-rose-300/10' },
    { id: 'steam-baths', name: 'الحمامات البخارية', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'cafes', name: 'الكافيهات', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'buffets', name: 'البوفيهات', icon: UtensilsCrossed, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'restaurants', name: 'المطاعم والأغذية', icon: UtensilsCrossed, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'supermarkets', name: 'السوبرماركت', icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'shopping-centers', name: 'مراكز التسوق', icon: Store, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'malls', name: 'المولات', icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'shops', name: 'المحلات والمتاجر', icon: Store, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'phones', name: 'سوق الهواتف', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'auctions', name: 'المزاد', icon: Gavel, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'realestate', name: 'العقارات', icon: Building2, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'jobs', name: 'التوظيف', icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'cleaning', name: 'شركات التنظيف', icon: Wrench, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { id: 'cars', name: 'معارض السيارات', icon: Car, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { id: 'motorcycles', name: 'معارض الدراجات النارية', icon: Car, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'clothing-shoes', name: 'محلات الملابس والأحذية', icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'gold', name: 'محلات الذهب', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'poultry', name: 'مزارع الدواجن', icon: Store, color: 'text-lime-400', bg: 'bg-lime-400/10' },
    { id: 'optics', name: 'البصريات والسمعيات', icon: Glasses, color: 'text-cyan-400', bg: 'bg-cyan-400/10' }
  ];

  // نموذج Yelp: قائمة المنشآت الأكثر تقييماً في اليمن من مختلف القطاعات الحقيقية
  const topRatedEntities = [
    {
      id: 't1',
      name: 'بنك التضامن الإسلامي',
      category: 'البنوك والصرافة',
      city: 'صنعاء - عدن',
      rating: 4.9,
      reviewsCount: 142,
      path: '/banks/tadhamon-bank',
      badge: 'موثق YR'
    },
    {
      id: 't2',
      name: 'مطعم البيت اليمني الأصيل',
      category: 'المطاعم والأغذية',
      city: 'صنعاء - حدة',
      rating: 4.9,
      reviewsCount: 218,
      path: '/businesses/yemeni-house-restaurant',
      badge: 'موثق YR'
    },
    {
      id: 't3',
      name: 'شركة يمن سوفت للحلول التقنية',
      category: 'المحلات والمتاجر',
      city: 'صنعاء - الدائري',
      rating: 4.9,
      reviewsCount: 96,
      path: '/businesses/yemensoft',
      badge: 'موثق YR'
    },
    {
      id: 't4',
      name: 'بنك الكريمي للتمويل الأصغر',
      category: 'البنوك والصرافة',
      city: 'عموم المحافظات',
      rating: 4.8,
      reviewsCount: 310,
      path: '/banks/kuraimi-bank',
      badge: 'موثق YR'
    }
  ];

  // التوجيه المباشر للملف الفردي للمنشأة
  const handleEntityClick = (entity: any) => {
    if (entity.path) {
      navigate(entity.path);
    } else if (onSelectBusiness) {
      onSelectBusiness(entity);
    }
  };

  return (
    <div dir="rtl" className="space-y-4 pt-1 max-w-5xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">

      {/* ======================================================== */}
      {/* 1. أسعار الصرف والذهب الحية (صنعاء / عدن) */}
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
            <span className="text-[10px] text-zinc-400 block">الدولار</span>
            <span className="text-xs font-mono font-bold text-white block">{currentRates.usd.buy}</span>
            <span className="text-[9px] text-zinc-500 block">بيع: {currentRates.usd.sell}</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-zinc-400 block">السعودي</span>
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
          <span>اضغط لمعرفة التفاصيل</span>
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. شريط بوابات الخدمات المعتمدة (كل صنف مستقل تماماً) */}
      {/* ======================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Layers size={15} className="text-[#FFC500]" /> بوابات الخدمات المعتمدة
          </h3>
          <button
            onClick={() => setShowAllCategoriesModal(true)}
            className="text-[11px] font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض كافة التصنيفات (33)</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {officialCategories.slice(0, 11).map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'banks' && onNavigateBanks) onNavigateBanks();
                  else onSelectCategory(cat.id);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#101522] hover:bg-[#182032] border border-white/10 hover:border-[#FFC500]/50 transition-all shrink-0 w-[80px] text-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={19} />
                </div>
                <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white line-clamp-1">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. قطاع المنشآت الأكثر تقييماً في اليمن (نموذج Yelp الحقيقي) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <Star size={14} className="text-[#FFC500] fill-[#FFC500]" /> المنشآت الأكثر تقييماً في اليمن
            </h3>
            <span className="text-[10px] text-zinc-400 block mt-0.5">مطاعم، بنوك، وشركات معتمدة حازت على أعلى ثقة الزوار</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {topRatedEntities.map((entity) => (
            <div
              key={entity.id}
              onClick={() => handleEntityClick(entity)}
              className="p-3 rounded-xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/60 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {entity.badge}
                  </span>
                  <span className="text-[10px] text-[#FFC500] font-bold bg-[#FFC500]/10 px-1.5 py-0.5 rounded">
                    {entity.category}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white group-hover:text-[#FFC500] transition-colors line-clamp-1">
                  {entity.name}
                </h4>
                <div className="flex items-center gap-1 text-zinc-400 text-[10px] mt-1">
                  <MapPin size={11} className="text-zinc-500 shrink-0" />
                  <span className="truncate">{entity.city}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/5 text-[10px]">
                <span className="text-zinc-500 font-mono">({entity.reviewsCount} تقييم)</span>
                <span className="font-bold text-white flex items-center gap-1 font-mono">
                  {entity.rating} <Star size={11} className="text-[#FFC500] fill-[#FFC500]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. محرك الصفقات الحية: مزادات 5% + عقارات + توظيف */}
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
              <Briefcase size={13} /> التوظيف
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
                    <span className="px-1.5 py-0.2 bg-red-600/30 text-red-400 rounded font-bold border border-red-600/40">مزاد حي</span>
                    <span className="text-zinc-400 flex items-center gap-0.5 font-mono"><Clock size={10} /> {item.time}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                    <MapPin size={10} />
                    <span>{item.city}</span>
                  </div>
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
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <MapPin size={10} />
                    <span>{item.city}</span>
                  </div>
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
                  <div className="flex items-center gap-1 text-zinc-500 font-mono text-[9px]">
                    <MapPin size={10} />
                    <span>{item.city}</span>
                  </div>
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
      {/* 5. البنر الإعلاني المدمج للمنصة */}
      {/* ======================================================== */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* ======================================================== */}
      {/* 6. بوابات التصفح المستقلة للأصناف الكبرى (كل صنف بقالبه المستقل) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* بوابة الفنادق المستقلة */}
        <div
          onClick={() => onSelectCategory('hotels')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0E1320] to-black border border-blue-900/40 hover:border-blue-500/60 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Hotel size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">دليل الفنادق المعتمدة</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">استعراض وحجوزات الفنادق في مختلف المحافظات</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
        </div>

        {/* بوابة الشاليهات المستقلة */}
        <div
          onClick={() => onSelectCategory('chalets')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-[#0E1320] to-black border border-sky-900/40 hover:border-sky-500/60 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Hotel size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-sky-300 transition-colors">دليل الشاليهات والمنتجعات</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">أماكن الاستجمام والشاليهات العائلية والسياحية</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
        </div>

        {/* بوابة المستشفيات المستقلة */}
        <div
          onClick={() => onSelectCategory('hospitals')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#140C12] to-black border border-rose-900/40 hover:border-rose-500/60 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Stethoscope size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-rose-300 transition-colors">دليل المستشفيات</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">المستشفيات العامة والتخصصية وأقسام الطوارئ</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
        </div>

        {/* بوابة المختبرات المستقلة */}
        <div
          onClick={() => onSelectCategory('labs')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-[#0A1414] to-black border border-teal-900/40 hover:border-teal-500/60 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Stethoscope size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-teal-300 transition-colors">دليل المختبرات الطبية</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">مراكز الفحوصات الطبية والتحاليل المخبرية الدقيقة</p>
            </div>
          </div>
          <ChevronLeft size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. بوابة التوثيق الرسمي لأصحاب المنشآت في اليمن */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#101524] to-black border border-[#FFC500]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC500]/20 text-[#FFC500] border border-[#FFC500]/40 flex items-center justify-center shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">هل تمتلك منشأة أو نشاط تجاري في اليمن؟</h4>
            <p className="text-[11px] text-zinc-300 mt-0.5">وثّق نشاطك رسمياً في يمن ريتنغ واحصل على تقييمات موثوقة وعملاء جدد من عموم المحافظات.</p>
          </div>
        </div>

        <button
          onClick={() => alert('لإضافة وتوثيق منشأتك يرجى التواصل مع إدارة منصة يمن ريتنغ.')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-xs transition-all shrink-0 cursor-pointer shadow active:scale-95"
        >
          طلب توثيق منشأة الآن
        </button>
      </div>

      {/* ======================================================== */}
      {/* نافذة استعراض كامل الـ 33 تصنيفاً الرسمية المنفصلة */}
      {/* ======================================================== */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="max-w-4xl w-full mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Layers className="text-[#FFC500]" /> الدليل الوطني الشامل (كافة التصنيفات المعتمدة)
              </h3>
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-1">
              {officialCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setShowAllCategoriesModal(false);
                      if (cat.id === 'banks' && onNavigateBanks) onNavigateBanks();
                      else onSelectCategory(cat.id);
                    }}
                    className="p-3 rounded-xl bg-[#111624] border border-zinc-800/80 hover:border-[#FFC500]/60 transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-200 group-hover:text-white line-clamp-1">{cat.name}</h4>
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
print("✅ تم بنجاح تحديث HomeView.tsx بنموذج Yelp الحقيقي وفصل كافة الأصناف بدون إيموجي وبأعلى معايير الاحترافية.")
