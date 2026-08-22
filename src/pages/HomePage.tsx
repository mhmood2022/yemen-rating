import React, { useState } from 'react';
import {
  Search,
  Building2,
  Store,
  Utensils,
  Hotel,
  HeartPulse,
  Home as HomeIcon,
  Car,
  Truck,
  Laptop,
  GraduationCap,
  Sparkles,
  Radio,
  Coins,
  Smartphone,
  Flame,
  Star,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';
import { CATEGORIES_LIST, DEMO_BUSINESSES } from '../data/demoBusinesses';
import { BusinessCard } from '../components/business/BusinessCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const categoryIconMap: Record<string, React.ReactNode> = {
  'الشركات': <Building2 size={20} strokeWidth={1.75} />,
  'المحلات': <Store size={20} strokeWidth={1.75} />,
  'المطاعم': <Utensils size={20} strokeWidth={1.75} />,
  'الفنادق': <Hotel size={20} strokeWidth={1.75} />,
  'الصحة': <HeartPulse size={20} strokeWidth={1.75} />,
  'العقارات': <HomeIcon size={20} strokeWidth={1.75} />,
  'السيارات': <Car size={20} strokeWidth={1.75} />,
  'النقل': <Truck size={20} strokeWidth={1.75} />,
  'التقنية': <Laptop size={20} strokeWidth={1.75} />,
  'التعليم': <GraduationCap size={20} strokeWidth={1.75} />,
  'الخدمات': <Sparkles size={20} strokeWidth={1.75} />,
  'الاتصالات': <Radio size={20} strokeWidth={1.75} />,
  'الصرافة': <Coins size={20} strokeWidth={1.75} />,
  'محلات الجوالات والإلكترونيات': <Smartphone size={20} strokeWidth={1.75} />,
};

export const HomePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/directory?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('/directory');
    }
  };

  const trendingBusinesses = DEMO_BUSINESSES.filter((b) => b.isTrending).slice(0, 3);
  const topRatedBusinesses = [...DEMO_BUSINESSES].sort((a, b) => b.yrScore - a.yrScore).slice(0, 3);
  const phoneMarketPreview = DEMO_BUSINESSES.filter((b) => b.category === 'محلات الجوالات والإلكترونيات');

  return (
    <div className="space-y-10 pb-6">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-[16px] bg-gradient-to-br from-[#0B1F3A] to-[#162F52] text-white p-6 sm:p-10 shadow-lg overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#F5C400]/20 text-[#F5C400] text-xs font-extrabold border border-[#F5C400]/30">
            الدليل الاقتصادي الرقمي لليمن
          </span>

          <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
            اكتشف الأفضل في اليمن
          </h1>

          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed max-w-xl">
            منصة يمن ريتغ (YR) للبحث عن الشركات والمحلات والخدمات والبنوك والوظائف، مع تقييمات موثوقة ومؤشرات YR Score المعتمدة.
          </p>

          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن شركة، محل، خدمة، بنك..."
                className="w-full h-[46px] pr-10 pl-4 rounded-[10px] bg-white text-[#0B1F3A] placeholder:text-[#94A3B8] text-xs sm:text-sm outline-none border border-transparent focus:border-[#F5C400] shadow-sm"
              />
            </div>
            <Button type="submit" variant="secondary" size="md" className="h-[46px] px-5 font-bold shrink-0">
              بحث
            </Button>
          </form>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('/directory')}
              className="text-xs"
            >
              استكشف الأنشطة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/directory')}
              className="text-xs text-white border-white/30 hover:bg-white/10"
            >
              الوظائف
            </Button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#0B1F3A]">دليل الأنشطة</h2>
            <p className="text-xs text-[#64748B]">تصفح الأنشطة والخدمات حسب التصنيف الاقتصادي</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/directory')} className="text-xs">
            <span>عرض الكل</span>
            <ArrowLeft size={13} />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES_LIST.map((cat) => (
            <Card
              key={cat}
              hoverable
              onClick={() => onNavigate(`/directory?category=${encodeURIComponent(cat)}`)}
              className="p-3 text-center flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#0B1F3A]/5 text-[#0B1F3A] flex items-center justify-center group-hover:bg-[#0B1F3A] group-hover:text-[#F5C400] transition-colors">
                {categoryIconMap[cat] || <Building2 size={20} />}
              </div>
              <span className="text-xs font-bold text-[#0B1F3A] leading-tight line-clamp-1">{cat}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. TRENDING PREVIEW (YR TREND) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#F5C400]/20 text-[#0B1F3A]">
              <Flame size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0B1F3A]">🔥 YR Trend</h2>
              <p className="text-xs text-[#64748B]">الأنشطة الأكثر تفاعلاً وظهوراً في السوق اليمني</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingBusinesses.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onNavigate={(id) => onNavigate(`/business/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* 4. TOP RATED SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#16A34A]/10 text-[#16A34A]">
              <Star size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0B1F3A]">⭐ الأعلى تقييمًا</h2>
              <p className="text-xs text-[#64748B]">الأنشطة الحاصلة على أعلى مؤشرات YR Score الموثقة</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topRatedBusinesses.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onNavigate={(id) => onNavigate(`/business/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* 5. MOBILE PHONE MARKET PREVIEW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#0B1F3A]/5 text-[#0B1F3A]">
              <Smartphone size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0B1F3A]">📱 سوق الجوالات</h2>
              <p className="text-xs text-[#64748B]">معاينة لمحلات ومراكز صيانة الهواتف الذكية</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/directory?category=محلات الجوالات والإلكترونيات')}
            className="text-xs"
          >
            <span>استكشاف المحلات</span>
            <ArrowLeft size={13} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phoneMarketPreview.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onNavigate={(id) => onNavigate(`/business/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* 6. JOBS PREVIEW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#2563EB]/10 text-[#2563EB]">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0B1F3A]">💼 الوظائف</h2>
              <p className="text-xs text-[#64748B]">فرص التوظيف المتاحة لدى الشركات المعتمدة (معاينة Phase 2)</p>
            </div>
          </div>
        </div>

        <Card className="p-6 text-center bg-white border border-[#E2E8F0]">
          <h3 className="font-bold text-sm text-[#0B1F3A] mb-1">نظام مطابقة الوظائف الذكي قادم قريباً</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto mb-4">
            يتم التجهيز لربط طلبات التوظيف وعروض الشركات مباشرة بعد اكتمال المراحل المخصصة.
          </p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('/directory')}>
            استكشاف الشركات الموثقة
          </Button>
        </Card>
      </section>
    </div>
  );
};
