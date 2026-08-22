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
  'الشركات': <Building2 size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
  'المحلات': <Store size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
  'المطاعم': <Utensils size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
  'الفنادق': <Hotel size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
  'الصحة': <HeartPulse size={20} strokeWidth={1.75} className="text-[#16A34A] dark:text-[#22C55E]" />,
  'العقارات': <HomeIcon size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
  'السيارات': <Car size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
  'النقل': <Truck size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
  'التقنية': <Laptop size={20} strokeWidth={1.75} className="text-[#2563EB] dark:text-[#F59E0B]" />,
  'التعليم': <GraduationCap size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
  'الخدمات': <Sparkles size={20} strokeWidth={1.75} className="text-[#F59E0B]" />,
  'الاتصالات': <Radio size={20} strokeWidth={1.75} className="text-[#2563EB] dark:text-[#F59E0B]" />,
  'الصرافة': <Coins size={20} strokeWidth={1.75} className="text-[#F5C400]" />,
  'محلات الجوالات والإلكترونيات': <Smartphone size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />,
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
    <div className="space-y-8 pb-6">
      {/* 1. HERO SECTION - Pure Dark in Dark Mode */}
      <section className="relative rounded-[16px] bg-[#0B1F3A] dark:bg-[#0A0A0A] text-white p-5 sm:p-8 shadow-lg border border-transparent dark:border-[#222222]">
        <div className="max-w-2xl space-y-3.5">
          <span className="inline-block px-3 py-0.5 rounded-full bg-[#F5C400]/20 text-[#F5C400] text-[11px] font-extrabold border border-[#F5C400]/30">
            دليل الأنشطة والخدمات في اليمن
          </span>

          <h1 className="text-xl sm:text-3xl font-black leading-tight tracking-tight text-white">
            اكتشف الأفضل في اليمن
          </h1>

          <p className="text-xs sm:text-sm text-[#CBD5E1] dark:text-[#A1A1AA] leading-relaxed max-w-xl">
            منصة يمن ريتغ (YR) للبحث عن الشركات والمحلات والخدمات والبنوك والوظائف، مع تقييمات موثوقة ومؤشرات YR Score المعتمدة.
          </p>

          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search size={17} strokeWidth={1.75} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#71717A]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن شركة، محل، خدمة، بنك..."
                className="w-full h-[44px] pr-10 pl-4 rounded-[10px] bg-white dark:bg-[#000000] text-[#0B1F3A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-[#71717A] text-xs sm:text-sm outline-none border border-transparent dark:border-[#222222] focus:border-[#F5C400] shadow-sm"
              />
            </div>
            <Button type="submit" variant="secondary" size="md" className="h-[44px] px-5 font-bold shrink-0">
              بحث
            </Button>
          </form>

          <div className="flex items-center gap-2.5 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('/directory')}
              className="text-xs font-bold"
            >
              استكشف الأنشطة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/directory')}
              className="text-xs text-white border-white/30 hover:bg-white/10 dark:border-[#222222] dark:hover:bg-[#141414]"
            >
              الوظائف
            </Button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES GRID */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">دليل الأنشطة</h2>
            <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">تصفح الأنشطة والخدمات حسب التصنيف الاقتصادي</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/directory')} className="text-xs text-[#0B1F3A] dark:text-white">
            <span>عرض الكل</span>
            <ArrowLeft size={13} strokeWidth={1.75} />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {CATEGORIES_LIST.map((cat) => (
            <Card
              key={cat}
              hoverable
              onClick={() => onNavigate(`/directory?category=${encodeURIComponent(cat)}`)}
              className="p-3 text-center flex flex-col items-center justify-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-[10px] bg-[#0B1F3A]/5 dark:bg-[#141414] border border-[#E2E8F0] dark:border-[#222222] flex items-center justify-center group-hover:bg-[#0B1F3A] group-hover:text-[#F5C400] dark:group-hover:bg-[#1F1F1F] transition-colors">
                {categoryIconMap[cat] || <Building2 size={20} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />}
              </div>
              <span className="text-xs font-bold text-[#0B1F3A] dark:text-white leading-tight line-clamp-1">{cat}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. TRENDING PREVIEW (YR Trend) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#F59E0B]/20 text-[#F59E0B]">
              <Flame size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">YR Trend</h2>
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">الأنشطة الأكثر تفاعلاً وظهوراً في السوق اليمني</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#F5C400]/20 text-[#F5C400]">
              <Star size={17} strokeWidth={1.75} className="fill-[#F5C400]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">الأعلى تقييمًا</h2>
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">الأنشطة الحاصلة على أعلى مؤشرات YR Score الموثقة</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#0B1F3A]/5 dark:bg-[#141414] border border-[#E2E8F0] dark:border-[#222222]">
              <Smartphone size={17} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">سوق الجوالات</h2>
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">معاينة لمحلات ومراكز صيانة الهواتف الذكية</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/directory?category=محلات الجوالات والإلكترونيات')}
            className="text-xs text-[#0B1F3A] dark:text-white"
          >
            <span>استكشاف المحلات</span>
            <ArrowLeft size={13} strokeWidth={1.75} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[8px] bg-[#2563EB]/10 text-[#2563EB] dark:text-[#F59E0B]">
              <Briefcase size={17} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">الوظائف</h2>
              <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">فرص التوظيف المتاحة لدى الشركات المعتمدة</p>
            </div>
          </div>
        </div>

        <Card className="p-5 sm:p-6 text-center">
          <h3 className="font-bold text-sm text-[#0B1F3A] dark:text-white mb-1">نظام مطابقة الوظائف الذكي قادم قريباً</h3>
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA] max-w-md mx-auto mb-3.5">
            يتم التجهيز لربط طلبات التوظيف وعروض الشركات مباشرة بعد اكتمال المراحل المخصصة.
          </p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('/directory')} className="text-[#0B1F3A] dark:text-white">
            استكشاف الشركات الموثقة
          </Button>
        </Card>
      </section>
    </div>
  );
};
