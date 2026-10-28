homeview_code = '''import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Eye, Clock, ChevronLeft, Building2, Gavel,
  Briefcase, Landmark, Hotel, UtensilsCrossed, Stethoscope, GraduationCap,
  Smartphone, ShoppingBag, Truck, Wrench, Sparkles, Scissors, Glasses,
  Coffee, Store, ShieldCheck, Layers, X, TrendingUp, Car
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
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigateBanks = () => {
    if (onNavigateBanks) onNavigateBanks();
    else {
      try { navigate('/banks'); } catch { window.location.href = '/banks'; }
    }
  };

  // قائمة الـ 33 تصنيفاً الرسمية المستقلة
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

  // أسعار الصرف والذهب الحية
  const ratesData = {
    sanaa: { usd: { buy: '534.76', sell: '538.00' }, sar: { buy: '140.43', sell: '140.70' }, gold24: '42,500', gold21: '37,200', updated: 'اليوم 09:00 ص' },
    aden: { usd: { buy: '1,910.00', sell: '1,925.00' }, sar: { buy: '501.50', sell: '504.00' }, gold24: '132,000', gold21: '115,500', updated: 'اليوم 09:00 ص' }
  };
  const currentRates = ratesData[activeMarket];

  // 1. آخر ما أضيف
  const recentlyAdded = useMemo(() => {
    if (businesses && businesses.length > 0) {
      return businesses.slice(0, 6);
    }
    return [
      { id: 'r1', name: 'مطعم الشيباني رويال', category: 'المطاعم والأغذية', city: 'صنعاء', rating: 4.8, reviewsCount: 84, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80', tag: 'مطعم • مأكولات' },
      { id: 'r2', name: 'مقهى وكافيه بارك', category: 'الكافيهات', city: 'عدن', rating: 4.6, reviewsCount: 42, image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80', tag: 'مقهى • كافيه' },
      { id: 'r3', name: 'مخبز وحلويات أزال الحديثة', category: 'المحلات والمتاجر', city: 'تعز', rating: 4.7, reviewsCount: 65, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80', tag: 'مخبز • حلويات' },
    ];
  }, [businesses]);

  // 2. الأعلى تقييماً (Yelp Model)
  const topRated = useMemo(() => {
    if (businesses && businesses.length > 0) {
      return [...businesses].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    }
    return [
      { id: 'top1', name: 'مطعم البيت اليمني الأصيل', category: 'المطاعم والأغذية', city: 'صنعاء', rating: 4.9, reviewsCount: 218, tag: 'مطعم • مأكولات', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80', path: '/businesses/yemeni-house-restaurant' },
      { id: 'top2', name: 'فندق كورال إنترناشونال', category: 'الفنادق', city: 'عدن', rating: 4.8, reviewsCount: 142, tag: 'فندق • إقامة فاخرة', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80', path: '/hotels' },
      { id: 'top3', name: 'بنك التضامن الإسلامي', category: 'البنوك والصرافة', city: 'صنعاء - عدن', rating: 4.9, reviewsCount: 310, tag: 'بنك ومصرف معتمد', image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=500&auto=format&fit=crop&q=80', path: '/banks/tadhamon-bank' }
    ];
  }, [businesses]);

  // 3. الأكثر زيارة
  const mostVisited = [
    { id: 'v1', name: 'حديقة السبعين الكبرى', city: 'صنعاء', visits: '15.2k', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=120&auto=format&fit=crop&q=80', category: 'parks' },
    { id: 'v2', name: 'سوق الملح وباب اليمن التاريخي', city: 'صنعاء القديمة', visits: '9.8k', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80', category: 'shops' },
    { id: 'v3', name: 'متحف وصهاريج عدن التاريخية', city: 'عدن - كريتر', visits: '7.4k', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&auto=format&fit=crop&q=80', category: 'parks' }
  ];

  // 4. العقارات والاستثمار
  const realEstateList = [
    { id: 're1', title: 'فيلا فاخرة مستقلة مع حوش ومسبح', type: 'للبيع', city: 'عدن - خور مكسر', price: '$450,000', period: 'بيع نهائي', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&auto=format&fit=crop&q=80' },
    { id: 're2', title: 'شقة سوبر ديلوكس مفروشة راقية', type: 'للإيجار', city: 'صنعاء - حدة', price: '300 ألف', period: '/شهر', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=80' },
    { id: 're3', title: 'عمارة استثمارية 4 أدوار دخل ممتاز', type: 'للبيع', city: 'تعز - المسبح', price: '45 مليون', period: 'ريال يمني', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=80' }
  ];

  // 5. المزادات الحية
  const auctionsList = [
    { id: 'auc1', title: 'تويوتا لاندكروزر V8 2023 وكالة', currentBid: '6.5 مليون', currency: 'ريال سعودي', timeLeft: '02:15:00', timeAgo: 'منذ يومين', status: 'نشط', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80' },
    { id: 'auc2', title: 'تحفة تراثية وجنبية فضية صيفاني', currentBid: '150 ألف', currency: 'ريال يمني', timeLeft: '05:42:12', timeAgo: 'منذ 3 أيام', status: 'نشط', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80' }
  ];

  // 6. فرص التوظيف المعتمدة
  const jobsList = [
    { id: 'job1', title: 'مهندس برمجيات وتطبيقات React & Node', company: 'قطاع التكنولوجيا', city: 'صنعاء', salary: '$1,200', type: 'دوام كامل' },
    { id: 'job2', title: 'مدير تسويق رقمي ومبيعات', company: 'مجموعة تجارية واستيراد', city: 'عدن', salary: '$900', type: 'دوام كامل' }
  ];

  return (
    <div dir="rtl" className="space-y-5 pt-1 max-w-5xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">

      {/* ======================================================== */}
      {/* 🔍 شريط البحث الذكي الوطني */}
      {/* ======================================================== */}
      <div className="relative">
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-[#0D1322] border border-zinc-700/60 hover:border-[#FFC500]/60 transition-all shadow-lg group">
          <div className="flex items-center gap-2.5 text-zinc-400 group-hover:text-zinc-200 flex-1">
            <Search size={17} className="text-[#FFC500]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مطعم، فندق، عقار، وظيفة، بنك في اليمن..."
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-zinc-500"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] text-zinc-300 shrink-0">
            <MapPin size={12} className="text-[#FFC500]" />
            <span>كل اليمن</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🏛️ بوابات التصنيفات الـ 33 المعتمدة */}
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
            <span>عرض الكل (33)</span>
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
                  if (cat.id === 'banks') handleNavigateBanks();
                  else onSelectCategory(cat.id);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#101522] hover:bg-[#182032] border border-white/10 hover:border-[#FFC500]/50 transition-all shrink-0 w-[78px] text-center cursor-pointer group"
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
      {/* 1️⃣ قسم: آخر ما أضيف (Recently Added) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Clock size={16} className="text-[#FFC500]" /> آخر ما أضيف
          </h3>
          <button
            onClick={() => onSelectCategory('restaurants')}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recentlyAdded.map((item: any) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.path) navigate(item.path);
                else onSelectBusiness(item);
              }}
              className="rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/50 transition-all overflow-hidden cursor-pointer group flex flex-col justify-between shadow-md"
            >
              <div className="relative h-28 w-full overflow-hidden bg-zinc-900">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-[#FFC500] transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-1 text-zinc-400 text-[10px] mt-0.5">
                    <MapPin size={10} className="text-[#FFC500]" />
                    <span>{item.city}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-[#FFC500]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className="fill-[#FFC500]" />
                    ))}
                    <span className="text-[10px] font-mono font-bold text-white mr-1">{item.rating || '4.8'}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5">
                    {item.tag || item.category || 'معتمد'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2️⃣ قسم: الأعلى تقييماً (Yelp Model - بطاقات عرضية) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Star size={16} className="text-[#FFC500] fill-[#FFC500]" /> الأعلى تقييماً
          </h3>
          <button
            onClick={() => onSelectCategory('restaurants')}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topRated.map((item: any) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.path) navigate(item.path);
                else onSelectBusiness(item);
              }}
              className="p-2.5 rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/60 transition-all cursor-pointer flex items-center gap-3 group shadow-md"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FFC500] transition-colors truncate">
                  {item.name}
                </h4>

                <div className="flex items-center gap-1 text-[#FFC500]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-[#FFC500]" />
                  ))}
                  <span className="text-xs font-mono font-bold text-white mr-1">{item.rating || '4.9'}</span>
                </div>

                <div className="text-[10px] text-zinc-400">
                  <span>{item.reviewsCount || 128} تقييم</span>
                  <span className="mx-1.5">•</span>
                  <span>{item.city}</span>
                </div>

                <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <MapPin size={10} className="text-[#FFC500]" />
                  <span>{item.tag || item.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3️⃣ قسم: الأكثر زيارة (Most Visited) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Eye size={16} className="text-[#FFC500]" /> الأكثر زيارة
          </h3>
          <button
            onClick={() => onSelectCategory('parks')}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="rounded-2xl bg-[#0F1420] border border-zinc-800/80 divide-y divide-white/5 overflow-hidden shadow-md">
          {mostVisited.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCategory(item.category)}
              className="p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">{item.name}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                    <MapPin size={10} className="text-[#FFC500]" />
                    <span>{item.city}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFC500] font-mono bg-[#FFC500]/10 px-2.5 py-1 rounded-xl border border-[#FFC500]/20">
                <Eye size={13} />
                <span>زيارة {item.visits}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4️⃣ قسم: أسعار الصرف الحية والذهب */}
      {/* ======================================================== */}
      <div className="rounded-2xl bg-[#0D121F] border border-[#1F2937] p-3 shadow-md space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={16} className="text-[#FFC500]" />
            <h3 className="text-xs font-black text-white">أسعار الصرف والذهب الحية</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono">آخر تحديث: {currentRates.updated}</span>
            <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveMarket('sanaa')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  activeMarket === 'sanaa' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'
                }`}
              >
                صنعاء
              </button>
              <button
                onClick={() => setActiveMarket('aden')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  activeMarket === 'aden' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'
                }`}
              >
                عدن
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="text-zinc-400 border-b border-white/5 text-[11px]">
                <th className="py-1.5 font-bold text-right pr-2">العملة</th>
                <th className="py-1.5 font-bold">شراء</th>
                <th className="py-1.5 font-bold">بيع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              <tr>
                <td className="py-2 text-right pr-2 font-bold text-white font-sans flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> الدولار الأمريكي $
                </td>
                <td className="py-2 text-white font-bold">{currentRates.usd.buy}</td>
                <td className="py-2 text-[#FFC500] font-bold">{currentRates.usd.sell}</td>
              </tr>
              <tr>
                <td className="py-2 text-right pr-2 font-bold text-white font-sans flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> الريال السعودي ر.س
                </td>
                <td className="py-2 text-white font-bold">{currentRates.sar.buy}</td>
                <td className="py-2 text-[#FFC500] font-bold">{currentRates.sar.sell}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          onClick={onNavigateExchangeRates}
          className="w-full pt-2 border-t border-white/5 text-xs font-bold text-[#FFC500] hover:underline flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>اضغط لمعرفة التفاصيل</span>
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 5️⃣ قسم: العقارات والاستثمار (تم تصحيحها من الوظائف) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Building2 size={16} className="text-[#FFC500]" /> العقارات والاستثمار
          </h3>
          <button
            onClick={onNavigateRealEstate}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {realEstateList.map((item) => (
            <div
              key={item.id}
              onClick={onNavigateRealEstate}
              className="rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/60 transition-all overflow-hidden cursor-pointer group flex flex-col justify-between shadow-md"
            >
              <div className="relative h-32 w-full overflow-hidden bg-zinc-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-bold text-[#FFC500] border border-[#FFC500]/30">
                  {item.type}
                </span>
              </div>

              <div className="p-3 space-y-1.5">
                <h4 className="font-bold text-xs text-white group-hover:text-[#FFC500] transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <MapPin size={10} className="text-[#FFC500]" />
                  <span>{item.city}</span>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-mono font-black text-[#FFC500]">{item.price}</span>
                  <span className="text-[10px] text-zinc-400">{item.period}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6️⃣ قسم: المزادات الحية (Auctions) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Gavel size={16} className="text-red-500" /> المزادات الحية (%5)
          </h3>
          <button
            onClick={onNavigateAuctions}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {auctionsList.map((item) => (
            <div
              key={item.id}
              onClick={onNavigateAuctions}
              className="p-3 rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-red-500/50 transition-all cursor-pointer flex gap-3 group shadow-md"
            >
              <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold">
                  {item.status}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-red-400 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFC500] mt-1 font-mono">
                    <span className="text-[10px] text-zinc-400 font-sans">السعر الحالي:</span>
                    <span>{item.currentBid}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1 text-red-400 font-bold">
                    <Clock size={10} /> ينتهي خلال {item.timeLeft}
                  </span>
                  <span>{item.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7️⃣ قسم: فرص التوظيف المعتمدة */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Briefcase size={16} className="text-emerald-400" /> فرص التوظيف المعتمدة
          </h3>
          <button
            onClick={onNavigateJobs}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {jobsList.map((job) => (
            <div
              key={job.id}
              onClick={onNavigateJobs}
              className="p-3 rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                    {job.type}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <MapPin size={10} className="text-[#FFC500]" />
                    <span>{job.city}</span>
                  </div>
                </div>
                <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                  {job.title}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">{job.company}</p>
              </div>

              <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">الراتب المتوقع:</span>
                <span className="font-mono font-bold text-xs text-emerald-400">{job.salary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 8️⃣ البنر الإعلاني الأوسط */}
      {/* ======================================================== */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* ======================================================== */}
      {/* 9️⃣ بوابة التوثيق الرسمي لأصحاب المنشآت */}
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
      {/* 🔟 نافذة استعراض كامل الـ 33 تصنيفاً الرسمية */}
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
print("✅ تم بنجاح استرجاع التصميم الكامل وضبط أيقونة Car بنجاح.")
