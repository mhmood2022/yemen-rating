import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Eye, Clock, ChevronLeft, Building2, Gavel,
  Briefcase, Landmark, Hotel, UtensilsCrossed, Stethoscope, GraduationCap,
  Smartphone, ShoppingBag, Truck, Wrench, Sparkles, Scissors, Glasses,
  Coffee, Store, ShieldCheck, Layers, X, TrendingUp, Car, CircleDot,
  Award
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BusinessItem } from '../../data/mockData';
import { YRBadge, BadgeType } from '../common/YRBadge';
import { AdBanner } from '../common/AdBanner';
import { HomeSearchBar } from './HomeSearchBar';

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
  onNavigateAuctions,
  onNavigateRealEstate,
  onNavigateJobs,
  onNavigateExchangeRates,
  onNavigateBanks
}) => {
  const navigate = useNavigate();
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);

  const [liveBusinesses, setLiveBusinesses] = useState<any[]>([]);
  const [liveBanks, setLiveBanks] = useState<any[]>([]);
  const [liveJobs, setLiveJobs] = useState<any[]>([]);
  const [liveProperties, setLiveProperties] = useState<any[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<any[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Map<string, { avg: number; count: number }>>(new Map());

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [busRes, bankRes, jobRes, propRes, aucRes, revRes] = await Promise.allSettled([
          supabase.from('businesses').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('banks').select('*').order('created_at', { ascending: true }).limit(20),
          supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('auctions').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('reviews').select('entity_id, stars')
        ]);

        if (!isMounted) return;

        if (busRes.status === 'fulfilled' && busRes.value.data) setLiveBusinesses(busRes.value.data);
        if (bankRes.status === 'fulfilled' && bankRes.value.data) setLiveBanks(bankRes.value.data);
        if (jobRes.status === 'fulfilled' && jobRes.value.data) setLiveJobs(jobRes.value.data);
        if (propRes.status === 'fulfilled' && propRes.value.data) setLiveProperties(propRes.value.data);
        if (aucRes.status === 'fulfilled' && aucRes.value.data) setLiveAuctions(aucRes.value.data);

        if (revRes.status === 'fulfilled' && revRes.value.data) {
          const grouped = new Map<string, number[]>();
          revRes.value.data.forEach((r: any) => {
            if (r.entity_id) {
              const arr = grouped.get(r.entity_id) || [];
              const s = Number(r.stars);
              if (s >= 1 && s <= 5) arr.push(s);
              grouped.set(r.entity_id, arr);
            }
          });

          const calculatedMap = new Map<string, { avg: number; count: number }>();
          grouped.forEach((starsArr, id) => {
            const count = starsArr.length;
            const avg = Number((starsArr.reduce((a, b) => a + b, 0) / count).toFixed(1));
            calculatedMap.set(id, { avg, count });
          });
          setReviewsMap(calculatedMap);
        }
      } catch (err) {
        console.error('Data loading error:', err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleNavigateBanks = () => {
    if (onNavigateBanks) onNavigateBanks();
    else {
      navigate('/banks');
    }
  };

  const handleCardClick = (item: any) => {
    const target = item.slug || item.id;
    navigate(`/businesses/${target}`);
  };

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

  const ratesData = {
    sanaa: {
      usd: { buy: '533.5', sell: '535.5' },
      sar: { buy: '139.5', sell: '140.5' },
      gold24: { buy: '530.5', sell: '538.5' },
      gold18: { buy: '398.5', sell: '400.5' }
    },
    aden: {
      usd: { buy: '1,910.0', sell: '1,925.0' },
      sar: { buy: '501.5', sell: '504.0' },
      gold24: { buy: '112,000', sell: '115,000' },
      gold18: { buy: '84,000', sell: '86,500' }
    }
  };
  const currentRates = ratesData[activeMarket];
  // 🌟 المجمع الموحد الشامل لجميع المنشآت والبنوك والتصنيفات الحالية والمستقبلية
  const allUniversalEntities = useMemo(() => {
    return [
      ...liveBusinesses.map(b => {
        const rev = reviewsMap.get(b.id);
        const score = rev ? rev.avg : 0;
        const count = rev ? rev.count : 0;
        const badge = (b.badge_type && b.badge_type !== "none") ? b.badge_type : (b.is_verified ? "blue" : null);
        return {
          ...b,
          entityType: "business",
          categoryLabel: b.sub_category || b.category || "منشأة",
          score,
          count,
          activeBadge: badge
        };
      }),
      ...liveBanks.map(bk => {
        const rev = reviewsMap.get(bk.id);
        const score = rev ? rev.avg : 0;
        const count = rev ? rev.count : 0;
        const badge = (bk.badge_type && bk.badge_type !== "none") ? bk.badge_type : (bk.verified ? "blue" : null);
        return {
          ...bk,
          entityType: "bank",
          categoryLabel: "بنوك وصرافة",
          score,
          count,
          activeBadge: badge
        };
      })
    ];
  }, [liveBusinesses, liveBanks, reviewsMap]);

  // 1. آخر ما أضيف (آخر 2 تم إضافتهم مباشرة بدون تعقيد)
  const recentlyAdded = useMemo(() => {
    return [...allUniversalEntities]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 2);
  }, [allUniversalEntities]);

  // 2. الأكثر مشاهدة (أعلى 2 مشاهدة في قاعدة البيانات مباشرة)
  const mostViewed = useMemo(() => {
    return [...allUniversalEntities]
      .sort((a, b) => Number(b.views_count || 0) - Number(a.views_count || 0))
      .slice(0, 2);
  }, [allUniversalEntities]);

  // 3. الأكثر تميزاً (يشمل المنشآت والبنوك المميزة)
  const featuredBusinesses = useMemo(() => {
    return allUniversalEntities
      .filter((b: any) => b.is_featured === true || b.tier === "PREMIUM_VERIFIED")
      .slice(0, 2);
  }, [allUniversalEntities]);

  // 4. الأعلى تقييماً (مبني على نفس المجمع الموحد الشامل)
  const topRatedUniversal = useMemo(() => {
    return allUniversalEntities
      .filter(item => item.count > 0 && item.score > 0)
      .sort((a, b) => b.score - a.score || b.count - a.count)
      .slice(0, 2);
  }, [allUniversalEntities]);

  return (
    <div dir="rtl" className="space-y-5 pt-16 sm:pt-20 max-w-md mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white bg-[#0B1224] min-h-screen">

      {/* 🔍 شريط البحث الذكي وإعلان الراعي الرسمي */}
      <HomeSearchBar
        officialCategories={officialCategories}
        onSelectCategory={onSelectCategory}
      />

      {/* 📢 إعلان البانر العلوي */}
      <div className="w-full my-2"><AdBanner placementId="1" className="mb-0 !rounded-none" /></div>

      {/* 🏛️ بوابات الخدمات المعتمدة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-zinc-100 flex items-center gap-1.5">
            <Layers size={17} className="text-[#FFC500]" /> بوابات الخدمات المعتمدة
          </h3>
          <button
            onClick={() => setShowAllCategoriesModal(true)}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل (33)</span>
            <ChevronLeft size={14} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleNavigateBanks}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/60 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#12192B] border border-[#1C2844] flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
              <Landmark size={22} />
            </div>
            <span className="text-[11px] font-bold text-white line-clamp-1">البنوك والصرافة</span>
          </button>

          <button
            onClick={() => onSelectCategory('transport')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-sky-400/60 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#12192B] border border-[#1C2844] flex items-center justify-center text-sky-400 mb-2 group-hover:scale-105 transition-transform">
              <Truck size={22} />
            </div>
            <span className="text-[11px] font-bold text-white line-clamp-1">شركات النقل</span>
          </button>

          <button
            onClick={() => onSelectCategory('hospitals')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-rose-400/60 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#12192B] border border-[#1C2844] flex items-center justify-center text-rose-400 mb-2 group-hover:scale-105 transition-transform">
              <Stethoscope size={22} />
            </div>
            <span className="text-[11px] font-bold text-white line-clamp-1">المستشفيات</span>
          </button>

          <button
            onClick={() => onSelectCategory('clinics')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-pink-400/60 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#12192B] border border-[#1C2844] flex items-center justify-center text-pink-400 mb-2 group-hover:scale-105 transition-transform">
              <Stethoscope size={22} />
            </div>
            <span className="text-[11px] font-bold text-white line-clamp-1">العيادات</span>
          </button>
        </div>
      </div>

      {/* 🕒 آخر ما أضيف (بدون أي شارة فوق الغلاف نهائياً) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Clock size={17} className="text-[#FFC500]" /> آخر ما أضيف
          </h3>
          <button
            onClick={() => navigate('/directory?category=all')}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {recentlyAdded.map((item: any) => {
            const badge = (item.badge_type && item.badge_type !== 'none') ? item.badge_type : (item.is_verified ? 'blue' : null);
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/50 transition-all overflow-hidden cursor-pointer flex flex-col justify-between shadow-md"
              >
                {/* الغلاف نظيف 100% بدون أي شارة */}
                <div className="relative h-28 w-full overflow-hidden bg-[#101524]">
                  {item.cover_url || item.logo_url ? (
                    <img
                      src={item.cover_url || item.logo_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-zinc-600">
                      <Building2 size={36} />
                    </div>
                  )}
                </div>

                <div className="p-3 text-center space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* الشارة بجانب الاسم فقط */}
                    <h4 className="font-black text-xs text-[#FFC500] truncate flex items-center justify-center gap-1.5">
                      <span className="truncate">{item.name}</span>
                      {badge && (
                        <YRBadge type={badge as BadgeType} size={15} />
                      )}
                    </h4>
                    <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] mt-0.5">
                      <MapPin size={11} className="text-[#FFC500]" />
                      <span>{item.city || 'اليمن'}</span>
                    </div>
                    <div className="flex items-center justify-center gap-0.5 text-[#FFC500] my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className="fill-[#FFC500]" />
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCardClick(item); }}
                    className="w-full py-1.5 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-[11px] transition-all cursor-pointer"
                  >
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📈 أسعار الصرف والذهب */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <TrendingUp size={17} className="text-[#FFC500]" /> أسعار الصرف والذهب
          </h3>
          <button
            onClick={onNavigateExchangeRates}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="rounded-2xl bg-[#0A0E1A] border border-[#18233C] p-3.5 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-bold text-[#FFC500]">أسعار الصرف والذهب</span>
            <div className="flex items-center bg-[#101726] p-0.5 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveMarket('sanaa')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMarket === 'sanaa' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'
                }`}
              >
                صنعاء
              </button>
              <button
                onClick={() => setActiveMarket('aden')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeMarket === 'aden' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'
                }`}
              >
                عدن
              </button>
            </div>
          </div>

          <table className="w-full text-center text-xs">
            <thead>
              <tr className="text-zinc-400 border-b border-white/5 text-[11px]">
                <th className="py-1 text-right font-medium">العملة</th>
                <th className="py-1 font-medium">شراء</th>
                <th className="py-1 font-medium">بيع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              <tr>
                <td className="py-1.5 text-right font-bold text-white font-sans flex items-center gap-1.5">
                  <CircleDot size={9} className="text-emerald-500 fill-emerald-500" /> الدولار الأمريكي
                </td>
                <td className="py-1.5 text-white font-bold">{currentRates.usd.buy}</td>
                <td className="py-1.5 text-rose-400 font-bold">{currentRates.usd.sell}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-right font-bold text-white font-sans flex items-center gap-1.5">
                  <CircleDot size={9} className="text-emerald-500 fill-emerald-500" /> الريال السعودي
                </td>
                <td className="py-1.5 text-white font-bold">{currentRates.sar.buy}</td>
                <td className="py-1.5 text-rose-400 font-bold">{currentRates.sar.sell}</td>
              </tr>
              <tr className="text-zinc-400 border-t border-white/10">
                <th className="py-1 text-right font-medium text-[11px]">الذهب</th>
                <th className="py-1 font-medium text-[11px]">شراء</th>
                <th className="py-1 font-medium text-[11px]">بيع</th>
              </tr>
              <tr>
                <td className="py-1.5 text-right font-bold text-white font-sans flex items-center gap-1.5">
                  <CircleDot size={9} className="text-amber-400 fill-amber-400" /> عيار 24 قيراط
                </td>
                <td className="py-1.5 text-white font-bold">{currentRates.gold24.buy}</td>
                <td className="py-1.5 text-amber-400 font-bold">{currentRates.gold24.sell}</td>
              </tr>
              <tr>
                <td className="py-1.5 text-right font-bold text-white font-sans flex items-center gap-1.5">
                  <CircleDot size={9} className="text-amber-400 fill-amber-400" /> عيار 18 قيراط
                </td>
                <td className="py-1.5 text-white font-bold">{currentRates.gold18.buy}</td>
                <td className="py-1.5 text-amber-400 font-bold">{currentRates.gold18.sell}</td>
              </tr>
            </tbody>
          </table>

          <button
            onClick={onNavigateExchangeRates}
            className="w-full py-2.5 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>تفاصيل أسعار الصرف والذهب</span>
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      <div className="w-full my-2"><AdBanner placementId="2" className="w-full !rounded-none" /></div>

      {/* ⭐ الأكثر تقييماً (بدون أي شارة فوق الغلاف، الشارة فقط بجانب الاسم) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Star size={17} className="text-[#FFC500] fill-[#FFC500]" /> الأكثر تقييماً
          </h3>
          <button
            onClick={() => navigate('/directory?category=all')}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {topRatedUniversal.map((item: any) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/50 transition-all overflow-hidden cursor-pointer flex flex-col justify-between shadow-md"
            >
              {/* الغلاف نظيف تماماً بدون شارة */}
              <div className="relative h-28 w-full overflow-hidden bg-[#101524]">
                {item.cover_url || item.logo_url ? (
                  <img
                    src={item.cover_url || item.logo_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[#FFC500]">
                    <Award size={36} />
                  </div>
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm text-[9px] font-bold text-[#FFC500] border border-[#FFC500]/30">
                  {item.categoryLabel}
                </span>
              </div>

              <div className="p-3 text-center space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  {/* الشارة بجانب الاسم فقط */}
                  <h4 className="font-black text-xs text-[#FFC500] truncate flex items-center justify-center gap-1.5">
                    <span className="truncate">{item.name}</span>
                    {item.activeBadge && (
                      <YRBadge type={item.activeBadge as BadgeType} size={15} />
                    )}
                  </h4>
                  <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] mt-0.5">
                    <MapPin size={11} className="text-[#FFC500]" />
                    <span>{item.city || 'صنعاء'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 text-[#FFC500] my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="fill-[#FFC500]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold block">
                    {Number(item.score).toFixed(1)} من 5 ({item.count} تقييم)
                  </span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleCardClick(item); }}
                  className="w-full py-1.5 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-[11px] transition-all cursor-pointer"
                >
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 👁️ الأكثر مشاهدة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Eye size={17} className="text-[#FFC500]" /> الأكثر مشاهدة
          </h3>
          <button
            onClick={() => navigate("/directory?category=all")}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {mostViewed.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {mostViewed.map((item: any) => {
              const badge = (item.badge_type && item.badge_type !== "none") ? item.badge_type : (item.is_verified ? "blue" : null);
              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/50 transition-all overflow-hidden cursor-pointer flex flex-col justify-between shadow-md"
                >
                  <div className="relative h-28 w-full overflow-hidden bg-[#101524]">
                    {item.cover_url || item.logo_url ? (
                      <img
                        src={item.cover_url || item.logo_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-600">
                        <Building2 size={36} />
                      </div>
                    )}
                  </div>

                  <div className="p-3 text-center space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-xs text-[#FFC500] truncate flex items-center justify-center gap-1.5">
                        <span className="truncate">{item.name}</span>
                        {badge && (
                          <YRBadge type={badge as BadgeType} size={15} />
                        )}
                      </h4>
                      <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] mt-0.5">
                        <MapPin size={11} className="text-[#FFC500]" />
                        <span>{item.city || "اليمن"}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-[10px] my-1 font-mono">
                        <Eye size={12} className="text-[#FFC500]" />
                        <span className="text-white font-bold">{Number(item.views_count || 0)}</span>
                        <span>مشاهدة</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleCardClick(item); }}
                      className="w-full py-1.5 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-[11px] transition-all cursor-pointer"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[#18233C] text-center text-xs text-zinc-400">
            لا توجد بيانات مشاهدات مسجلة حالياً.
          </div>
        )}
      </div>

      {/* ✨ الأكثر تميزاً */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Sparkles size={17} className="text-[#FFC500]" /> الأكثر تميزاً
          </h3>
          <button
            onClick={() => navigate("/directory?category=all")}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {featuredBusinesses.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5">
            {featuredBusinesses.map((item: any) => {
              const badge = (item.badge_type && item.badge_type !== "none") ? item.badge_type : (item.is_verified ? "blue" : null);
              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/50 transition-all overflow-hidden cursor-pointer flex flex-col justify-between shadow-md"
                >
                  <div className="relative h-28 w-full overflow-hidden bg-[#101524]">
                    {item.cover_url || item.logo_url ? (
                      <img
                        src={item.cover_url || item.logo_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-600">
                        <Building2 size={36} />
                      </div>
                    )}
                  </div>

                  <div className="p-3 text-center space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-xs text-[#FFC500] truncate flex items-center justify-center gap-1.5">
                        <span className="truncate">{item.name}</span>
                        {badge && (
                          <YRBadge type={badge as BadgeType} size={15} />
                        )}
                      </h4>
                      <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] mt-0.5">
                        <MapPin size={11} className="text-[#FFC500]" />
                        <span>{item.city || "اليمن"}</span>
                      </div>
                      <div className="flex items-center justify-center gap-0.5 text-[#FFC500] my-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className="fill-[#FFC500]" />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleCardClick(item); }}
                      className="w-full py-1.5 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-[11px] transition-all cursor-pointer"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[#18233C] text-center text-xs text-zinc-400">
            لا توجد منشآت مميزة حالياً، ستظهر هنا فور تفعيل التمييز.
          </div>
        )}
      </div>

      {/* 🔨 المزادات */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Gavel size={17} className="text-[#FFC500]" /> المزادات
          </h3>
          <button
            onClick={onNavigateAuctions}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="space-y-2.5">
          {liveAuctions.length > 0 ? (
            liveAuctions.slice(0, 2).map((item: any) => (
              <div
                key={item.id}
                onClick={onNavigateAuctions}
                className="p-2.5 rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/50 transition-all cursor-pointer flex gap-3 shadow-md"
              >
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="font-bold text-xs text-white truncate">{item.title || item.name}</h4>
                    <div className="text-xs font-bold text-emerald-400 mt-1 font-mono">
                      <span className="text-[10px] text-zinc-400 font-sans">السعر الحالي: </span>
                      {item.current_bid || item.price}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                      <MapPin size={11} className="text-[#FFC500]" /> {item.city}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    <button className="w-full py-1.5 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-[11px] cursor-pointer">
                      عرض تفاصيل المزاد
                    </button>
                    <div className="text-[10px] text-zinc-400 flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Clock size={11} className="text-[#FFC500]" /> ينتهي المزاد : {item.end_time || item.time_left || 'مستمر'}
                      </span>
                    </div>
                  </div>
                </div>

                {item.image_url || item.cover_url ? (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                    <img src={item.image_url || item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold">
                      نشط
                    </span>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-xl bg-[#12192B] border border-[#1C2844] flex items-center justify-center text-[#FFC500] shrink-0">
                    <Gavel size={30} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[#18233C] text-center text-xs text-zinc-400">
              لا توجد مزادات نشطة حالياً، ستظهر هنا فور إضافتها من الإدارة.
            </div>
          )}
        </div>
      </div>

      {/* 🏢 العقارات */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Building2 size={17} className="text-[#FFC500]" /> العقارات
          </h3>
          <button
            onClick={onNavigateRealEstate}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[#18233C] text-center text-xs text-zinc-400">
          بانتظار إضافة عقارات معتمدة في قاعدة البيانات.
        </div>
      </div>

      {/* 💼 الوظائف */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Briefcase size={17} className="text-[#FFC500]" /> الوظائف
          </h3>
          <button
            onClick={onNavigateJobs}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {liveJobs.length > 0 ? (
          <div className="space-y-2.5">
            {liveJobs.slice(0, 2).map((job: any) => (
              <div
                key={job.id}
                onClick={onNavigateJobs}
                className="p-3 rounded-2xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/50 transition-all cursor-pointer space-y-2.5 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold flex items-center gap-1">
                    <Briefcase size={11} /> إعلان وظيفة
                  </span>
                </div>

                <h4 className="font-bold text-xs text-white leading-relaxed">
                  {job.title}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-zinc-300 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} className="text-[#FFC500]" /> <strong className="text-white">{job.city}</strong>
                  </span>
                  <span>الراتب: <strong className="text-emerald-400">{job.salary || 'بعد المقابلة'}</strong></span>
                  <span>الجنس: <strong className="text-white">{job.gender || 'الكل'}</strong></span>
                  <span>الدوام: <strong className="text-white">{job.type || 'كلي'}</strong></span>
                </div>

                <button className="w-28 py-1 rounded-lg bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-[10px] cursor-pointer">
                  عرض كامل المواد
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[#18233C] text-center text-xs text-zinc-400">
            لا توجد شواغر وظيفية حالياً، ستظهر هنا فور إضافتها.
          </div>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-[#18233C] shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-white">
            هل تمتلك منشأة؟ أضف نشاطك التجاري الآن
          </h4>
        </div>

        <button
          onClick={() => alert('لإضافة نشاطك التجاري يرجى التواصل مع إدارة منصة يمن ريتنغ.')}
          className="px-3.5 py-2 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-xs transition-all shrink-0 cursor-pointer shadow active:scale-95 whitespace-nowrap"
        >
          + أضف نشاطك
        </button>
      </div>

      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Layers className="text-[#FFC500]" /> بوابات الخدمات المعتمدة (33)
              </h3>
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="p-2 rounded-xl bg-[#12192B] text-zinc-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto grid grid-cols-2 gap-2 p-1">
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
                    className="p-3 rounded-xl bg-[#0A0E1A] border border-[#18233C] hover:border-[#FFC500]/60 transition-all cursor-pointer flex items-center gap-3 group"
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
