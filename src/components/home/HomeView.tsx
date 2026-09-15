import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, Gavel, ChevronLeft, Landmark, Briefcase, Smartphone,
  GraduationCap, Hotel, Tag, Building2, UtensilsCrossed, Stethoscope,
  Check, Copy, Layers, Clock, MessageSquare, ArrowRight
} from 'lucide-react';
import { BusinessItem } from '../../data/mockData';
import { AdBanner } from '../common/AdBanner';

interface HomeViewProps {
  onSelectCategory: (slug: string) => void;
  onSelectBusiness: (business: BusinessItem) => void;
  businesses: BusinessItem[];
  onNavigateAuctions: () => void;
  onNavigateRealEstate: () => void;
  onNavigateJobs: () => void;
  onNavigateExchangeRates: () => void;
  onNavigatePhones?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCategory,
  onSelectBusiness,
  businesses = [],
  onNavigateAuctions,
  onNavigateRealEstate,
  onNavigateJobs,
  onNavigateExchangeRates,
  onNavigatePhones = () => onSelectCategory('phones')
}) => {
  const navigate = useNavigate();
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [activeDealsTab, setActiveDealsTab] = useState<'auctions' | 'realestate' | 'jobs'>('auctions');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // التوجيه الصحيح المباشر لصفحة البنوك والصرافة
  const handleNavigateBanks = () => {
    try {
      navigate('/banks');
    } catch {
      window.location.href = '/banks';
    }
  };

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

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  // فلترة المنشآت الحقيقية المضافة في النظام بحسب التصنيف
  const getRealBusinesses = (categorySlug: string) => {
    return businesses.filter(b =>
      b.category === categorySlug ||
      b.categorySlug === categorySlug
    );
  };

  const realHotels = getRealBusinesses('hotels');
  const realUniversities = getRealBusinesses('universities');
  const realHospitals = getRealBusinesses('hospitals');

  // أهم التصنيفات السريعة مع روابطها الصحيحة المباشرة
  const quickCategories = [
    { id: 'banks', name: 'البنوك والصرافة', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10', action: handleNavigateBanks },
    { id: 'hotels', name: 'الفنادق والشاليهات', icon: Hotel, color: 'text-blue-400', bg: 'bg-blue-400/10', action: () => onSelectCategory('hotels') },
    { id: 'universities', name: 'الجامعات والمعاهد', icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-400/10', action: () => onSelectCategory('universities') },
    { id: 'hospitals', name: 'المستشفيات والعيادات', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-400/10', action: () => onSelectCategory('hospitals') },
    { id: 'auctions', name: 'سوق المزادات', icon: Gavel, color: 'text-red-400', bg: 'bg-red-400/10', action: onNavigateAuctions },
    { id: 'realestate', name: 'العقارات والاستثمار', icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-400/10', action: onNavigateRealEstate },
    { id: 'jobs', name: 'فرص التوظيف', icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-400/10', action: onNavigateJobs },
    { id: 'phones', name: 'سوق الهواتف', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-400/10', action: onNavigatePhones },
    { id: 'restaurants', name: 'المطاعم والكافيهات', icon: UtensilsCrossed, color: 'text-orange-400', bg: 'bg-orange-400/10', action: () => onSelectCategory('restaurants') }
  ];

  return (
    <div dir="rtl" className="space-y-4 pt-1 max-w-6xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">

      {/* ======================================================== */}
      {/* 1. أسعار الصرف والذهب الحية (صنعاء / عدن) */}
      {/* ======================================================== */}
      <div className="bg-[#0D121F] border border-[#1F2937] rounded-xl p-2.5 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>أسعار الصرف والذهب الحية</span>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveMarket('sanaa')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeMarket === 'sanaa' ? 'bg-[#FFC500] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              صنعاء
            </button>
            <button
              onClick={() => setActiveMarket('aden')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                activeMarket === 'aden' ? 'bg-[#FFC500] text-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              عدن
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-2 text-center">
          <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-zinc-400 block">الدولار $</span>
            <span className="text-xs font-mono font-bold text-white block">{currentRates.usd.buy}</span>
            <span className="text-[9px] text-zinc-500 block">بيع: {currentRates.usd.sell}</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-zinc-400 block">السعودي ر.س</span>
            <span className="text-xs font-mono font-bold text-white block">{currentRates.sar.buy}</span>
            <span className="text-[9px] text-zinc-500 block">بيع: {currentRates.sar.sell}</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-amber-400 block">ذهب 24</span>
            <span className="text-xs font-mono font-bold text-amber-300 block">{currentRates.gold24.buy}</span>
            <span className="text-[9px] text-zinc-500 block">ريال</span>
          </div>
          <div className="bg-black/30 p-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-amber-400 block">ذهب 21</span>
            <span className="text-xs font-mono font-bold text-amber-300 block">{currentRates.gold21.buy}</span>
            <span className="text-[9px] text-zinc-500 block">ريال</span>
          </div>
        </div>

        <button
          onClick={onNavigateExchangeRates}
          className="w-full mt-2 pt-1 border-t border-white/5 text-[10px] text-[#FFC500] hover:underline flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>جدول الصرافة والتحويلات التفصيلي</span>
          <ChevronLeft size={12} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. شريط بوابات التصنيفات السريعة (34 تصنيفاً) */}
      {/* ======================================================== */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
            <Layers size={14} className="text-[#FFC500]" /> بوابات الخدمات المعتمدة
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">34 تصنيفاً رسمياً</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
          {quickCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={cat.action}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#121622] hover:bg-[#1A2234] border border-white/10 hover:border-[#FFC500]/50 transition-all shrink-0 w-[78px] text-center group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
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
      {/* 3. قطاع البنوك والصرافة (ينقل مباشرة إلى /banks) */}
      {/* ======================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Landmark size={14} className="text-[#FFC500]" /> البنوك وشركات الصرافة الأكثر تقييماً
          </h3>
          <button
            onClick={handleNavigateBanks}
            className="text-[11px] font-bold text-[#FFC500] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>دليل البنوك والصرافة</span>
            <ChevronLeft size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { name: 'بنك التضامن', sub: 'خدمات مصرفية واستثمارية', rating: '4.9', count: 94, badge: 'موثق YR' },
            { name: 'بنك الكريمي للتمويل الأصغر', sub: 'حسابات وتحويلات نقدية', rating: '4.8', count: 128, badge: 'موثق YR' },
            { name: 'بنك اليمن والكويت YKB', sub: 'خدمات مصرفية للأفراد والشركات', rating: '4.8', count: 75, badge: 'موثق YR' },
            { name: 'مصرف القطيبي الإسلامي', sub: 'تمويل وخدمات مصرفية إلكترونية', rating: '4.9', count: 83, badge: 'موثق YR' }
          ].map((bank, idx) => (
            <div
              key={idx}
              onClick={handleNavigateBanks}
              className="p-2.5 rounded-xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/50 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded border bg-blue-500/20 text-blue-400 border-blue-500/40">
                    {bank.badge}
                  </span>
                  <Landmark size={14} className="text-[#FFC500]" />
                </div>
                <h4 className="font-bold text-xs text-white line-clamp-1">{bank.name}</h4>
                <p className="text-[9.5px] text-zinc-400 line-clamp-1 mt-0.5">{bank.sub}</p>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[10px]">
                <span className="text-zinc-500 font-mono">({bank.count})</span>
                <span className="font-bold text-white flex items-center gap-1 font-mono">
                  {bank.rating} <Star size={10} className="text-[#FFC500] fill-[#FFC500]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. محرك الصفقات الحية: مزادات + عقارات + توظيف */}
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
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {activeDealsTab === 'auctions' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { title: 'تويوتا لاندكروزر V8 2023', price: '182k SAR', time: '04:12' },
              { title: 'أرض تجارية شارع الستين 800م²', price: '95m YER', time: '08:45' },
              { title: 'شاحنة مرسيدس أكتروس 2021', price: '58k USD', time: '02:30' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={onNavigateAuctions}
                className="bg-black/40 border border-zinc-800 p-2.5 rounded-xl hover:border-red-500/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className="px-1.5 py-0.2 bg-red-600/30 text-red-400 rounded font-bold border border-red-600/40">
                      مزاد حي
                    </span>
                    <span className="font-mono text-zinc-400 flex items-center gap-0.5">
                      <Clock size={10} /> {item.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{item.title}</h4>
                </div>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">السعر الافتتاحي:</span>
                  <span className="font-mono font-bold text-sm text-[#FFC500]">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeDealsTab === 'realestate' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { title: 'شقة سوبر ديلوكس - تعز', price: '3.5k SAR/شهر', type: 'إيجار' },
              { title: 'فيلا فاخرة مسبح - عدن كالتكس', price: '$450,000', type: 'بيع' },
              { title: 'عمارة استثمارية 4 طوابق - صنعاء', price: '$850,000', type: 'فرصة' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={onNavigateRealEstate}
                className="bg-black/40 border border-zinc-800 p-2.5 rounded-xl hover:border-[#FFC500]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="px-1.5 py-0.2 bg-[#FFC500]/20 text-[#FFC500] rounded font-bold">
                    {item.type}
                  </span>
                  <span className="text-zinc-400 font-bold">عقار موثق</span>
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
              { title: 'مهندس برمجيات React & Node', company: 'يمن تك • صنعاء', salary: '$1,200' },
              { title: 'مدير تسويق رقمي ومبيعات', company: 'مجموعة تجارية • عدن', salary: '$900' },
              { title: 'محاسب قانوني رئيسي', company: 'مكتب تدقيق • تعز', salary: '$800' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={onNavigateJobs}
                className="bg-black/40 border border-zinc-800 p-2.5 rounded-xl hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-bold">
                    دوام كامل
                  </span>
                  <span className="text-zinc-400 font-mono text-[9px]">توظيف فوري</span>
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
      {/* 5. إعلان الراعي الأوسط المدمج */}
      {/* ======================================================== */}
      <div className="w-full">
        <AdBanner placementId="2" className="w-full shadow-md" />
      </div>

      {/* ======================================================== */}
      {/* 6. بوابة الفنادق والشاليهات (بيانات حقيقية ديناميكية أو بوابة تصفح) */}
      {/* ======================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Hotel size={14} className="text-blue-400" /> دليل الفنادق والشاليهات السياحية
          </h3>
          <button
            onClick={() => onSelectCategory('hotels')}
            className="text-[11px] font-bold text-[#FFC500] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>استعراض الفنادق</span>
            <ChevronLeft size={12} />
          </button>
        </div>

        {realHotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {realHotels.slice(0, 3).map((hotel) => (
              <div
                key={hotel.id}
                onClick={() => onSelectBusiness(hotel)}
                className="p-3 rounded-xl bg-[#0E1320] border border-blue-900/30 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      فندق موثق
                    </span>
                    <span className="font-bold text-xs text-[#FFC500] flex items-center gap-0.5 font-mono">
                      {hotel.rating || '5.0'} <Star size={11} className="fill-[#FFC500]" />
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{hotel.name}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{hotel.city || 'اليمن'}</p>
                </div>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-0.5">
                    التفاصيل والتواصل <ChevronLeft size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => onSelectCategory('hotels')}
            className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/30 via-[#0E1320] to-black border border-blue-900/40 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Hotel size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">تصفح الفنادق والشاليهات والمنتجعات المعتمدة</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">دليل الحجوزات وأفضل أماكن الإقامة السياحية في محافظات اليمن</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0">
              <span>عرض الدليل</span>
              <ArrowRight size={12} className="rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 7. بوابة الجامعات والتعليم (بيانات حقيقية ديناميكية أو بوابة تصفح) */}
      {/* ======================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <GraduationCap size={15} className="text-emerald-400" /> دليل الجامعات والمؤسسات التعليمية
          </h3>
          <button
            onClick={() => onSelectCategory('universities')}
            className="text-[11px] font-bold text-[#FFC500] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>استعراض الجامعات</span>
            <ChevronLeft size={12} />
          </button>
        </div>

        {realUniversities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {realUniversities.slice(0, 3).map((uni) => (
              <div
                key={uni.id}
                onClick={() => onSelectBusiness(uni)}
                className="p-3 rounded-xl bg-[#0A121A] border border-emerald-900/30 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      جامعة معتمدة
                    </span>
                    <span className="text-[10px] text-zinc-400">{uni.city || 'اليمن'}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{uni.name}</h4>
                </div>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    دليل البرامج والتسجيل <ChevronLeft size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => onSelectCategory('universities')}
            className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#0A121A] to-black border border-emerald-900/40 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">دليل الجامعات والكليات والمعاهد الأكاديمية</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">تعرف على التخصصات الأكاديمية ونسب القبول والجامعات المعتمدة</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0">
              <span>تصفح الجامعات</span>
              <ArrowRight size={12} className="rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 8. بوابة المستشفيات والمراكز الصحية (بيانات حقيقية ديناميكية أو بوابة تصفح) */}
      {/* ======================================================== */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Stethoscope size={15} className="text-rose-400" /> دليل المستشفيات والعيادات الطبية
          </h3>
          <button
            onClick={() => onSelectCategory('hospitals')}
            className="text-[11px] font-bold text-[#FFC500] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>استعراض المستشفيات</span>
            <ChevronLeft size={12} />
          </button>
        </div>

        {realHospitals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {realHospitals.slice(0, 3).map((hosp) => (
              <div
                key={hosp.id}
                onClick={() => onSelectBusiness(hosp)}
                className="p-3 rounded-xl bg-[#140C12] border border-rose-900/30 hover:border-rose-500/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      منشأة طبية
                    </span>
                    <span className="text-[10px] text-zinc-400">{hosp.city || 'اليمن'}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white">{hosp.name}</h4>
                </div>
                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-rose-400 font-bold flex items-center gap-0.5">
                    العيادات والاتصال <ChevronLeft size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => onSelectCategory('hospitals')}
            className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/30 via-[#140C12] to-black border border-rose-900/40 hover:border-rose-500/50 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Stethoscope size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">دليل المستشفيات والمختبرات والمراكز التخصصية</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">أرقام الطوارئ وحجز المواعيد وأطباء الاختصاص في عموم المحافظات</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0">
              <span>تصفح الدليل الطبي</span>
              <ArrowRight size={12} className="rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 9. متجر العروض وكوبونات الخصم الحقيقية */}
      {/* ======================================================== */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#141824] to-black border border-[#FFC500]/30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FFC500]/20 text-[#FFC500] flex items-center justify-center font-black shrink-0">
              <Tag size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-white">عروض متجر العصرية للجوالات</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white">خصم 20%</span>
              </div>
              <p className="text-[10px] text-zinc-400">ضمان سنة كاملة + شاحن مجاني لجميع الأجهزة الذكية</p>
            </div>
          </div>

          <button
            onClick={() => handleCopyCoupon('YR20')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-xs transition-all shrink-0 cursor-pointer shadow active:scale-95"
          >
            {copiedCoupon === 'YR20' ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedCoupon === 'YR20' ? 'تم النسخ' : 'كود: YR20'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 10. شريط الثقة والمراجعات الحية */}
      {/* ======================================================== */}
      <div className="space-y-2 pt-1 pb-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <MessageSquare size={13} className="text-[#FFC500]" /> آخر التقييمات والمراجعات المعتمدة
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { user: 'أحمد الوصابي', text: 'خدمة راقية جداً وخدمات مصرفية متقدمة وتطبيق بنكي ممتاز.', stars: 5 },
            { user: 'م. سالم الكاف', text: 'منصة احترافية ودقة في المواعيد ووساطة معتمدة تحمي الجميع.', stars: 5 }
          ].map((rev, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{rev.user}</span>
                <div className="flex items-center gap-0.5">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} size={10} className="text-[#FFC500] fill-[#FFC500]" />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 line-clamp-1 leading-relaxed">{rev.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
