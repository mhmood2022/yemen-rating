import React, { useState } from 'react';
import { 
  Star, MapPin, Gavel, ChevronLeft, Landmark, CheckCircle2, Building, Briefcase, 
  ChevronDown, ChevronUp, Coins, Smartphone,
  Clock, ShieldCheck, MessageSquare
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
  
  // عرض أول 8 تصنيفات أو كامل الـ 26 تصنيفاً في مكانها بالصفحة
  const displayedCategories = showAllCategories 
    ? OFFICIAL_CATEGORIES 
    : OFFICIAL_CATEGORIES.slice(0, 8);

  return (
    <div dir="rtl" className="space-y-4 pt-1 max-w-6xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">
      
      {/* 1. الشركات والبنوك الأكثر تقييماً (بديل التصنيفات) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Star size={13} className="text-[#FFC500] fill-[#FFC500]" /> الشركات والبنوك الأكثر تقييماً
          </h3>
          <button
            type="button"
            onClick={() => { window.location.href = '/banks'; }}
            className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer bg-transparent border-0 flex items-center gap-1"
          >
            <span>دليل البنوك والشركات</span>
            <ChevronLeft size={12} />
          </button>
        </div>

        {/* شبكة المنشآت الأعلى تقييماً */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {[
            {
              id: 'bank-tadhamon',
              name: 'بنك التضامن',
              category: 'خدمات مصرفية • تعز / صنعاء',
              rating: '4.9',
              reviewsCount: 94,
              badge: 'موثق YR',
              badgeColor: 'text-[#1D9BF0] border-[#1D9BF0]/30 bg-[#1D9BF0]/10',
              iconType: 'bank',
              action: () => { window.location.href = '/bank?slug=tadhamon'; }
            },
            {
              id: 'bank-kuraimi',
              name: 'بنك الكريمي للتمويل الأصغر',
              category: 'خدمات مصرفية • صنعاء',
              rating: '4.8',
              reviewsCount: 128,
              badge: 'موثق YR',
              badgeColor: 'text-[#1D9BF0] border-[#1D9BF0]/30 bg-[#1D9BF0]/10',
              iconType: 'bank',
              action: () => { window.location.href = '/bank?slug=kuraimi'; }
            },
            {
              id: 'biz-yemensoft',
              name: 'شركة يمن سوفت للبرمجيات',
              category: 'تكنولوجيا ومعلومات • حدة',
              rating: '5.0',
              reviewsCount: 62,
              badge: 'شريك ذهبي',
              badgeColor: 'text-[#FFC500] border-[#FFC500]/30 bg-[#FFC500]/10',
              iconType: 'company',
              action: () => { onSelectCategory('software'); }
            },
            {
              id: 'biz-hsa',
              name: 'مجموعة هائل سعيد أنعم',
              category: 'صناعة وتجارة • تعز',
              rating: '4.9',
              reviewsCount: 85,
              badge: 'شريك ذهبي',
              badgeColor: 'text-[#FFC500] border-[#FFC500]/30 bg-[#FFC500]/10',
              iconType: 'company',
              action: () => { onSelectCategory('companies'); }
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={item.action}
              className="bg-[#0F0F12] border border-[#222226] hover:border-[#FFC500]/50 rounded-2xl p-2.5 flex flex-col justify-between gap-2 shadow-sm transition-all group active:scale-95 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#1A1A1E] group-hover:bg-[#FFC500]/10 text-[#FFC500] flex items-center justify-center transition-colors">
                  {item.iconType === 'bank' ? <Building size={16} /> : <Briefcase size={16} />}
                </div>
                <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <div className="space-y-0.5 text-right">
                <h4 className="text-[11px] font-black text-white group-hover:text-[#FFC500] transition-colors truncate">
                  {item.name}
                </h4>
                <p className="text-[9px] text-zinc-400 truncate">
                  {item.category}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-[#1C1C20]">
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-[#FFC500] fill-[#FFC500]" />
                  <span className="text-[10px] font-mono font-black text-white">{item.rating}</span>
                  <span className="text-[8px] text-zinc-500">({item.reviewsCount})</span>
                </div>
                <ChevronLeft size={12} className="text-zinc-500 group-hover:text-[#FFC500] transition-transform group-hover:-translate-x-0.5" />
              </div>
            </div>
          ))}
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

      {/* 3. المزادات الحية (3 بطاقات كاملة ومرتبة) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Gavel size={13} className="text-[#DC2626]" /> المزادات الحية المعتمدة (5% عمولة)
          </h3>
          <button onClick={onNavigateAuctions} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل ←
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '1', title: 'تويوتا لاندكروزر V8', price: '182k SAR', time: '04:12', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'أرض تجارية شارع الستين', price: '95m YER', time: '08:45', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop&q=80' },
            { id: '3', title: 'شاحنة مرسيدس أكتروس', price: '58k USD', time: '02:30', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80' }
          ].map(auc => (
            <div 
              key={auc.id} 
              onClick={onNavigateAuctions}
              className="rounded-xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-sm cursor-pointer hover:border-[#FFC500]/50 transition-all active:scale-95 flex flex-col justify-between"
            >
              <div className="h-20 w-full relative">
                <img src={auc.img} alt={auc.title} className="w-full h-full object-cover" />
                <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-[#DC2626] text-white text-[7.5px] font-black">
                  🔴 حي
                </span>
                <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/85 text-white text-[7.5px] font-mono">
                  ⏳ {auc.time}
                </span>
              </div>
              <div className="p-1.5 space-y-0.5">
                <h4 className="text-[10px] font-bold text-white truncate">{auc.title}</h4>
                <div className="text-[9.5px] font-mono font-black text-[#16A34A] truncate">{auc.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. إعلان YR Ads الموضع #2 (شريط عريض تجاري في المنتصف) */}
      <div className="w-full my-2">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* 5. أسعار العملات والذهب الأصلية */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] p-3 sm:p-4 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#222226] pb-2">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-[#FFC500]" />
            <h3 className="text-xs sm:text-sm font-black text-white">أسعار العملات والذهب</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#18181C] p-0.5 rounded-xl border border-[#27272A]">
              <button
                onClick={() => setActiveMarket('sanaa')}
                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black transition-all ${
                  activeMarket === 'sanaa' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                صنعاء
              </button>
              <button
                onClick={() => setActiveMarket('aden')}
                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black transition-all ${
                  activeMarket === 'aden' ? 'bg-[#FFC500] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                عدن
              </button>
            </div>

            <button onClick={onNavigateExchangeRates} className="text-[10px] font-bold text-[#FFC500] hover:underline cursor-pointer">
              البورصة ←
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono">
          <div onClick={onNavigateExchangeRates} className="p-2 rounded-xl bg-[#18181C] border border-[#27272A] space-y-0.5 cursor-pointer hover:border-[#FFC500]/40 transition-colors">
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="font-bold text-white font-['Cairo']">الدولار 🇺🇸</span>
              <span className="text-[8.5px] text-[#DC2626] font-black">{currentRates.usd.change}</span>
            </div>
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-gray-400 font-['Cairo']">شراء: <b className="text-[#16A34A]">{currentRates.usd.buy}</b></span>
              <span className="text-gray-400 font-['Cairo']">بيع: <b className="text-[#DC2626]">{currentRates.usd.sell}</b></span>
            </div>
          </div>

          <div onClick={onNavigateExchangeRates} className="p-2 rounded-xl bg-[#18181C] border border-[#27272A] space-y-0.5 cursor-pointer hover:border-[#FFC500]/40 transition-colors">
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="font-bold text-white font-['Cairo']">السعودي 🇸🇦</span>
              <span className="text-[8.5px] text-[#16A34A] font-black">{currentRates.sar.change}</span>
            </div>
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-gray-400 font-['Cairo']">شراء: <b className="text-[#16A34A]">{currentRates.sar.buy}</b></span>
              <span className="text-gray-400 font-['Cairo']">بيع: <b className="text-[#DC2626]">{currentRates.sar.sell}</b></span>
            </div>
          </div>

          <div onClick={onNavigateExchangeRates} className="p-2 rounded-xl bg-[#18181C] border border-[#27272A] space-y-0.5 cursor-pointer hover:border-[#FFC500]/40 transition-colors">
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="font-bold text-[#FFC500] font-['Cairo']">ذهب 24 🟡</span>
              <span className="text-[8.5px] text-[#16A34A] font-black">{currentRates.gold24.change}</span>
            </div>
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-gray-400 font-['Cairo']">شراء: <b className="text-[#16A34A]">{currentRates.gold24.buy}</b></span>
              <span className="text-gray-400 font-['Cairo']">بيع: <b className="text-[#DC2626]">{currentRates.gold24.sell}</b></span>
            </div>
          </div>

          <div onClick={onNavigateExchangeRates} className="p-2 rounded-xl bg-[#18181C] border border-[#27272A] space-y-0.5 cursor-pointer hover:border-[#FFC500]/40 transition-colors">
            <div className="flex justify-between items-center text-[9.5px]">
              <span className="font-bold text-[#FFC500] font-['Cairo']">ذهب 21 🟡</span>
              <span className="text-[8.5px] text-[#16A34A] font-black">{currentRates.gold21.change}</span>
            </div>
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-gray-400 font-['Cairo']">شراء: <b className="text-[#16A34A]">{currentRates.gold21.buy}</b></span>
              <span className="text-gray-400 font-['Cairo']">بيع: <b className="text-[#DC2626]">{currentRates.gold21.sell}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. سوق الهواتف والأجهزة الذكية (3 بطاقات كاملة ومرتبة) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Smartphone size={13} className="text-[#2EA5FF]" /> سوق الهواتف والأجهزة الذكية
          </h3>
          <button onClick={onNavigatePhones} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل ←
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '1', title: 'iPhone 15 Pro Max', price: '$1,150', store: 'مركز الخليج • صنعاء', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'Galaxy S24 Ultra', price: '$1,080', store: 'سامسونج • عدن', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80' },
            { id: '3', title: 'Xiaomi 14 Pro', price: '$720', store: 'فون زون • تعز', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80' }
          ].map(ph => (
            <div 
              key={ph.id} 
              onClick={onNavigatePhones}
              className="rounded-xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-sm cursor-pointer hover:border-[#2EA5FF]/50 transition-all active:scale-95 flex flex-col justify-between"
            >
              <div className="h-20 w-full relative bg-[#161619]">
                <img src={ph.img} alt={ph.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/85 text-[#2EA5FF] text-[8.5px] font-mono font-bold">
                  {ph.price}
                </span>
              </div>
              <div className="p-1.5 space-y-0.5">
                <h4 className="text-[10px] font-bold text-white truncate">{ph.title}</h4>
                <p className="text-[8px] text-[#9CA3AF] truncate">{ph.store}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. العقارات والفرص الاستثمارية (3 بطاقات كاملة ومرتبة) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Building size={13} className="text-[#3B82F6]" /> العقارات والفرص الاستثمارية
          </h3>
          <button onClick={onNavigateRealEstate} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل ←
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '1', title: 'شقة سوبر ديلوكس — حدة', price: '3.5k SAR/ش', specs: '3 غرف • 150م²', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'فيلا فاخرة مسبح — عدن', price: '$450,000', specs: '5 غرف • 450م²', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format&fit=crop&q=80' },
            { id: '3', title: 'عمارة استثمارية — تعز', price: '$850,000', specs: '10 شقق • 4 محلات', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80' }
          ].map(prop => (
            <div 
              key={prop.id} 
              onClick={onNavigateRealEstate}
              className="rounded-xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-sm cursor-pointer hover:border-[#FFC500]/50 transition-all active:scale-95 flex flex-col justify-between"
            >
              <div className="h-20 w-full relative">
                <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-[#FFC500] text-black text-[8px] font-black">
                  {prop.price}
                </span>
              </div>
              <div className="p-1.5 space-y-0.5">
                <h4 className="text-[10px] font-bold text-white truncate">{prop.title}</h4>
                <p className="text-[8px] text-[#9CA3AF] truncate">{prop.specs}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. أحدث الوظائف وفرص العمل (3 بطاقات كاملة ومرتبة) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Briefcase size={13} className="text-[#16A34A]" /> أحدث الوظائف وفرص العمل
          </h3>
          <button onClick={onNavigateJobs} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل ←
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '1', title: 'مهندس برمجيات React', company: 'يمن سوفت • صنعاء', salary: '$1,200' },
            { id: '2', title: 'مدير تسويق رقمي', company: 'هائل سعيد • عدن', salary: '$900' },
            { id: '3', title: 'محاسب مالي قانوني', company: 'الكريمي • المكلا', salary: '$800' }
          ].map(job => (
            <div 
              key={job.id} 
              onClick={onNavigateJobs}
              className="rounded-xl bg-[#0F0F12] border border-[#222226] p-2 space-y-1 shadow-sm cursor-pointer hover:border-[#16A34A]/50 transition-all active:scale-95 flex flex-col justify-between"
            >
              <h4 className="text-[10px] font-bold text-white truncate">{job.title}</h4>
              <p className="text-[8px] text-[#9CA3AF] truncate">{job.company}</p>
              <div className="pt-0.5 flex justify-between items-center border-t border-[#1F2937]">
                <span className="text-[7.5px] text-gray-400">الراتب:</span>
                <b className="text-[9.5px] font-mono text-[#FFC500]">{job.salary}</b>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. الشركات والأنشطة المعتمدة (3 بطاقات كاملة ومرتبة) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Star size={13} className="text-[#FFC500]" fill="#FFC500" /> الشركات والأنشطة المعتمدة
          </h3>
          <button onClick={() => onSelectCategory('all')} className="text-[11px] font-bold text-[#FFC500] hover:underline cursor-pointer">
            عرض الكل ←
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {businesses.slice(0, 3).map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBusiness(b)}
              className="rounded-xl bg-[#0F0F12] border border-[#222226] hover:border-[#FFC500]/50 overflow-hidden shadow-sm cursor-pointer transition-all active:scale-95 flex flex-col justify-between"
            >
              <div className="h-20 w-full relative">
                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/85 text-[#FFC500] text-[8px] font-black flex items-center gap-0.5">
                  ★ {b.rating}
                </span>
              </div>
              <div className="p-1.5 space-y-0.5">
                <h4 className="text-[10px] font-bold text-white truncate">{b.name}</h4>
                <p className="text-[8px] text-[#9CA3AF] truncate">{b.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. آخر التقييمات والمراجعات بصورة المقيم الحقيقية النظيفة */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <MessageSquare size={13} className="text-[#FFC500]" /> آخر التقييمات والمراجعات
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { id: '1', name: 'أحمد الوصابي', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', rating: 5, comment: 'خدمة راقية جداً وأكل يمني أصيل بنكهة ممتازة، أنصح بزيارة المطعم.' },
            { id: '2', name: 'م. سالم الكاف', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', rating: 5, comment: 'تعامل احترافي ودقة في مواعيد التسليم وخدمة ما بعد البيع ممتازة.' }
          ].map(rev => (
            <div 
              key={rev.id} 
              className="p-3 rounded-xl bg-[#0F0F12] border border-[#222226] space-y-1.5 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img 
                    src={rev.avatar} 
                    alt={rev.name} 
                    className="w-7 h-7 rounded-full object-cover border border-[#FFC500]/40 shadow-sm" 
                  />
                  <h5 className="text-xs font-bold text-white">{rev.name}</h5>
                </div>
                <div className="flex text-[#FFC500] text-[11px]">
                  {'★'.repeat(rev.rating)}
                </div>
              </div>
              <p className="text-[10px] text-gray-300 line-clamp-2 leading-relaxed font-medium">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
