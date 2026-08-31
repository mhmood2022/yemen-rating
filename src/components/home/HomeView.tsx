import React, { useState } from 'react';
import { 
  Star, MapPin, Gavel, Building, Briefcase, 
  ChevronDown, ChevronUp, Coins, ArrowRight, Smartphone,
  Clock, ShieldCheck, Sparkles, MessageSquare, Tag, UserCheck
} from 'lucide-react';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../../data/categories';
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
  businesses,
  onNavigateAuctions,
  onNavigateRealEstate,
  onNavigateJobs,
  onNavigateExchangeRates,
  onNavigatePhones = () => onSelectCategory('phones')
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');

  const ratesData = {
    sanaa: {
      usd: { buy: '534.76', sell: '538.00', change: '-0.20%' },
      sar: { buy: '140.43', sell: '140.70', change: '+0.15%' },
      gold24: { buy: '42,500', sell: '43,500', change: '+0.40%' },
      gold21: { buy: '37,200', sell: '38,100', change: '+0.35%' },
    },
    aden: {
      usd: { buy: '1,910.00', sell: '1,925.00', change: '+0.80%' },
      sar: { buy: '501.50', sell: '504.00', change: '+0.65%' },
      gold24: { buy: '132,000', sell: '135,000', change: '+1.10%' },
      gold21: { buy: '115,500', sell: '118,000', change: '+0.95%' },
    }
  };

  const currentRates = ratesData[activeMarket];
  const displayedCategories = showAllCategories 
    ? OFFICIAL_CATEGORIES 
    : OFFICIAL_CATEGORIES.slice(0, 8);

  return (
    <div dir="rtl" className="space-y-4 pb-28 pt-1 max-w-6xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">
      
      {/* 1. شبكة التصنيفات الرئيسية الفاخرة */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC500]" /> التصنيفات الرئيسية
          </h3>
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-[11px] font-bold text-[#FFC500] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>{showAllCategories ? 'عرض أقل' : 'عرض الكل'}</span>
            {showAllCategories ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {displayedCategories.map((cat: CategoryItem) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="h-18 rounded-2xl bg-[#0F0F12] border border-[#222226] hover:border-[#FFC500]/50 p-1.5 flex flex-col items-center justify-center gap-1 transition-all group active:scale-95 cursor-pointer shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-[#1A1A1E] group-hover:bg-[#FFC500] text-[#FFC500] group-hover:text-black flex items-center justify-center transition-all">
                  <Icon size={15} />
                </div>
                <span className="text-[9.5px] font-bold text-[#D1D5DB] group-hover:text-white truncate max-w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. بطاقة العروض والخصومات المعتمدة */}
      <div 
        onClick={onNavigatePhones}
        className="bg-[#0F0F12] p-3 rounded-2xl border border-[#222226] hover:border-[#FFC500]/40 shadow-md flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-98"
      >
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 rounded-lg bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30 font-black text-[10px] shrink-0">
            خصم 20%
          </div>
          <div>
            <h4 className="text-xs font-black text-white">عروض متجر العصرية للجوالات</h4>
            <p className="text-[9.5px] text-[#9CA3AF]">ضمان سنة كاملة + شاحن مجاني لجميع الأجهزة</p>
          </div>
        </div>
        <div className="border border-dashed border-[#FFC500]/60 bg-[#161619] px-2.5 py-0.5 rounded-xl text-center shrink-0">
          <span className="text-[7.5px] text-[#9CA3AF] block">كود الخصم</span>
          <b className="text-[11px] font-mono text-[#FFC500]">YR20</b>
        </div>
      </div>

      {/* 3. المزادات الحية المعتمدة (تتسع لـ 3 بطاقات مرتبة باللمس بدون شريط أبيض) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Gavel size={13} className="text-[#DC2626]" /> المزادات الحية المعتمدة (5% عمولة)
          </h3>
          <button onClick={onNavigateAuctions} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: '1', title: 'تويوتا لاندكروزر V8 بريمي 2022', price: '182,000 SAR', time: '04:12:30', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'أرض تجارية ركنية شارع الستين', price: '95,000,000 YER', time: '08:45:10', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop&q=80' },
            { id: '3', title: 'شاحنة مرسيدس أكتروس 2020', price: '58,000 USD', time: '02:30:00', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80' }
          ].map(auc => (
            <div 
              key={auc.id} 
              onClick={onNavigateAuctions}
              className="shrink-0 w-[145px] sm:w-48 rounded-xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-sm cursor-pointer hover:border-[#FFC500]/50 transition-all active:scale-95"
            >
              <div className="h-24 w-full relative">
                <img src={auc.img} alt={auc.title} className="w-full h-full object-cover" />
                <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-[#DC2626] text-white text-[8px] font-black">
                  🔴 مباشر
                </span>
                <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/85 text-white text-[8.5px] font-mono">
                  ⏳ {auc.time}
                </span>
              </div>
              <div className="p-2 space-y-0.5">
                <h4 className="text-[11px] font-bold text-white truncate">{auc.title}</h4>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-[8.5px] text-[#9CA3AF]">أعلى مزايدة:</span>
                  <b className="text-[10.5px] font-mono text-[#16A34A]">{auc.price}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. إعلان تجاري في المنتصف YR Ads #2 */}
      <div className="w-full my-2">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* 5. أسعار العملات والذهب الأصلية المصغرة */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] p-3.5 sm:p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#222226] pb-2.5">
          <div className="flex items-center gap-1.5">
            <Coins size={15} className="text-[#FFC500]" />
            <h3 className="text-xs sm:text-sm font-black text-white">أسعار العملات والذهب</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#18181C] p-0.5 rounded-xl border border-[#27272A]">
              <button
                onClick={() => setActiveMarket('sanaa')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                  activeMarket === 'sanaa' ? 'bg-[#FFC500] text-black shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                أسعار صنعاء
              </button>
              <button
                onClick={() => setActiveMarket('aden')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                  activeMarket === 'aden' ? 'bg-[#FFC500] text-black shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                أسعار عدن
              </button>
            </div>

            <button onClick={onNavigateExchangeRates} className="text-[10px] font-bold text-[#FFC500] hover:underline cursor-pointer">
              البورصة ←
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div onClick={onNavigateExchangeRates} className="p-2.5 rounded-xl bg-[#18181C] border border-[#27272A] space-y-1 cursor-pointer hover:border-[#FFC500]/40 transition-colors">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white font-['Cairo']">الدولار 🇺🇸</span>
              <span className="text-[9px] text-[#DC2626] font-black">{currentRates.usd.change}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 font-['Cairo'] text-[9px]">شراء: <b className="text-[#16A34A]">{currentRates.usd.buy}</b></span>
              <span className="text-gray-400 font-['Cairo'] text-[9px]">بيع: <b className="text-[#DC2626]">{currentRates.usd.sell}</b></span>
            </div>
          </div>

          <div onClick={onNavigateExchangeRates} className="p-2.5 rounded-xl bg-[#18181C] border border-[#27272A] space-y-1 cursor-pointer hover:border-[#FFC500]/40 transition-colors">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white font-['Cairo']">السعودي 🇸🇦</span>
              <span className="text-[9px] text-[#16A34A] font-black">{currentRates.sar.change}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 font-['Cairo'] text-[9px]">شراء: <b className="text-[#16A34A]">{currentRates.sar.buy}</b></span>
              <span className="text-gray-400 font-['Cairo'] text-[9px]">بيع: <b className="text-[#DC2626]">{currentRates.sar.sell}</b></span>
            </div>
          </div>

          <div onClick={onNavigateExchangeRates} className="p-2.5 rounded-xl bg-[#18181C] border border-[#27272A] space-y-1 cursor-pointer hover:border-[#FFC500]/40 transition-colors">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#FFC500] font-['Cairo']">ذهب عيار 24 🟡</span>
              <span className="text-[9px] text-[#16A34A] font-black">{currentRates.gold24.change}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 font-['Cairo'] text-[9px]">شراء: <b className="text-[#16A34A]">{currentRates.gold24.buy}</b></span>
              <span className="text-gray-400 font-['Cairo'] text-[9px]">بيع: <b className="text-[#DC2626]">{currentRates.gold24.sell}</b></span>
            </div>
          </div>

          <div onClick={onNavigateExchangeRates} className="p-2.5 rounded-xl bg-[#18181C] border border-[#27272A] space-y-1 cursor-pointer hover:border-[#FFC500]/40 transition-colors">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#FFC500] font-['Cairo']">ذهب عيار 21 🟡</span>
              <span className="text-[9px] text-[#16A34A] font-black">{currentRates.gold21.change}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400 font-['Cairo'] text-[9px]">شراء: <b className="text-[#16A34A]">{currentRates.gold21.buy}</b></span>
              <span className="text-gray-400 font-['Cairo'] text-[9px]">بيع: <b className="text-[#DC2626]">{currentRates.gold21.sell}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. سوق الهواتف والأجهزة الذكية */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Smartphone size={13} className="text-[#2EA5FF]" /> سوق الهواتف والأجهزة الذكية
          </h3>
          <button onClick={onNavigatePhones} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: '1', title: 'iPhone 15 Pro Max 256GB', price: '$1,150', store: 'مركز أبل الخليج • صنعاء', condition: 'جديد كرت', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'Samsung Galaxy S24 Ultra', price: '$1,080', store: 'سامسونج ستور • عدن', condition: 'جديد كرت', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80' },
            { id: '3', title: 'Xiaomi 14 Pro 512GB', price: '$720', store: 'فون زون • تعز', condition: 'شبه جديد', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80' }
          ].map(ph => (
            <div 
              key={ph.id} 
              onClick={onNavigatePhones}
              className="shrink-0 w-[145px] sm:w-48 rounded-xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-sm cursor-pointer hover:border-[#2EA5FF]/50 transition-all active:scale-95"
            >
              <div className="h-24 w-full relative">
                <img src={ph.img} alt={ph.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/85 text-[#2EA5FF] text-[9.5px] font-mono font-bold">
                  {ph.price}
                </span>
                <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-[8px] text-gray-300">
                  {ph.condition}
                </span>
              </div>
              <div className="p-2 space-y-0.5">
                <h4 className="text-[11px] font-bold text-white truncate">{ph.title}</h4>
                <p className="text-[8.5px] text-[#9CA3AF] truncate">{ph.store}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. العقارات والفرص الاستثمارية */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Building size={13} className="text-[#3B82F6]" /> العقارات والفرص الاستثمارية
          </h3>
          <button onClick={onNavigateRealEstate} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: '1', title: 'شقة سوبر ديلوكس مفروشة — حدة', price: '3,500 SAR / شهر', specs: '3 غرف • 2 حمام • 150 م²', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'فيلا مستقلة فاخرة مسبح وحديقة — عدن', price: '$450,000', specs: '5 غرف • 4 حمام • 450 م²', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format&fit=crop&q=80' },
            { id: '3', title: 'عمارة تجارية استثمارية 5 أدوار — تعز', price: '$850,000', specs: '10 شقق • 4 محلات • موقع ركني', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
          ].map(prop => (
            <div 
              key={prop.id} 
              onClick={onNavigateRealEstate}
              className="shrink-0 w-[145px] sm:w-48 rounded-xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-sm cursor-pointer hover:border-[#FFC500]/50 transition-all active:scale-95"
            >
              <div className="h-24 w-full relative">
                <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-[#FFC500] text-black text-[9px] font-black">
                  {prop.price}
                </span>
              </div>
              <div className="p-2 space-y-0.5">
                <h4 className="text-[11px] font-bold text-white truncate">{prop.title}</h4>
                <p className="text-[8.5px] text-[#9CA3AF] truncate">{prop.specs}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. أحدث الوظائف وفرص العمل */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Briefcase size={13} className="text-[#16A34A]" /> أحدث الوظائف وفرص العمل
          </h3>
          <button onClick={onNavigateJobs} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: '1', title: 'مهندس برمجيات React / Node', company: 'يمن سوفت • صنعاء', salary: '$1,200', type: 'دوام كامل' },
            { id: '2', title: 'مدير تسويق وحملات إعلانية', company: 'مجموعة هائل سعيد • عدن', salary: '$900', type: 'دوام كامل' },
            { id: '3', title: 'محاسب مالي قانوني معتمد', company: 'بنك الكريمي • المكلا', salary: '$800', type: 'دوام كامل' }
          ].map(job => (
            <div 
              key={job.id} 
              onClick={onNavigateJobs}
              className="shrink-0 w-[145px] sm:w-48 rounded-xl bg-[#0F0F12] border border-[#222226] p-2.5 space-y-1 shadow-sm cursor-pointer hover:border-[#16A34A]/50 transition-all active:scale-95"
            >
              <span className="px-1.5 py-0.2 rounded bg-[#16A34A]/15 text-[#16A34A] text-[8.5px] font-bold inline-block">
                {job.type}
              </span>
              <h4 className="text-[11px] font-bold text-white truncate">{job.title}</h4>
              <p className="text-[8.5px] text-[#9CA3AF] truncate">{job.company}</p>
              <div className="pt-1 flex justify-between items-center border-t border-[#1F2937]">
                <span className="text-[8px] text-gray-400">الراتب:</span>
                <b className="text-[10px] font-mono text-[#FFC500]">{job.salary}</b>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. الشركات والأنشطة المعتمدة */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Star size={13} className="text-[#FFC500]" fill="#FFC500" /> الشركات والأنشطة المعتمدة
          </h3>
          <button onClick={() => onSelectCategory('all')} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {businesses.slice(0, 6).map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBusiness(b)}
              className="shrink-0 w-[145px] sm:w-44 rounded-xl bg-[#0F0F12] border border-[#222226] hover:border-[#FFC500]/50 overflow-hidden shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <div className="h-20 w-full relative">
                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/85 text-[#FFC500] text-[8.5px] font-black flex items-center gap-0.5">
                  ★ {b.rating}
                </span>
              </div>
              <div className="p-2 space-y-0.5">
                <h4 className="text-[11px] font-bold text-white truncate">{b.name}</h4>
                <p className="text-[8.5px] text-[#9CA3AF] truncate">{b.category} • {b.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. آخر التقييمات والمراجعات الموثقة من المجتمع */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <MessageSquare size={13} className="text-[#FFC500]" /> آخر التقييمات والمراجعات
          </h3>
          <button onClick={() => onSelectCategory('all')} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { id: '1', user: 'أحمد الوصابي', business: 'مطعم البيت اليمني • صنعاء', rating: 5, comment: 'خدمة راقية جداً وأكل يمني أصيل بنكهة ممتازة، أنصح بزيارته بشدة.', time: 'منذ ساعتين' },
            { id: '2', user: 'م. سالم الكاف', business: 'شركة عدن للتقنية والشبكات • عدن', rating: 5, comment: 'تعامل احترافي ودقة في مواعيد التسليم وخدمة ما بعد البيع ممتازة.', time: 'أمس' }
          ].map(rev => (
            <div 
              key={rev.id} 
              onClick={() => onSelectCategory('all')}
              className="p-3 rounded-xl bg-[#0F0F12] border border-[#222226] space-y-1.5 shadow-sm cursor-pointer hover:border-[#FFC500]/40 transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#FFC500]/20 text-[#FFC500] font-black text-[10px] flex items-center justify-center">
                    {rev.user.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white">{rev.user}</h5>
                    <span className="text-[8.5px] text-[#9CA3AF]">{rev.business}</span>
                  </div>
                </div>
                <div className="flex text-[#FFC500] text-[10px]">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>
              <p className="text-[10px] text-gray-300 line-clamp-2 leading-relaxed">
                "{rev.comment}"
              </p>
              <span className="text-[8px] text-gray-500 font-mono block pt-0.5">{rev.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
