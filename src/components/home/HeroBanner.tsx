import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../lib/utils';

export const HeroBanner: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { ads } = useAdmin();

  // جلب الإعلانات المنشورة في أعلى الصفحة الرئيسية
  const publishedHomeAds = ads.filter(
    (a) => a.status === 'published' && a.placements.includes('home_top')
  );

  // إذا لم توجد إعلانات نشطة، استخدام البانر الترويجي الافتراضي
  const defaultSlides = [
    {
      id: 'default_1',
      title: 'اكتشف الأفضل',
      subtitle: 'تقييمات حقيقية من المجتمع لأفضل الشركات والخدمات في اليمن',
      imageUrl: 'https://images.unsplash.com/photo-1578895210405-907db486c111?w=800&auto=format&fit=crop&q=80',
      link: '/directory',
      ctaText: 'استكشف الآن',
    },
    {
      id: 'default_2',
      title: 'سوق الجوالات المعتمد',
      subtitle: 'استعرض أفضل عروض الهواتف والإلكترونيات وضمانات الصيانة',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      link: '/phones',
      ctaText: 'سوق الجوالات',
    },
  ];

  const activeSlides =
    publishedHomeAds.length > 0
      ? publishedHomeAds.map((ad) => ({
          id: ad.id,
          title: ad.title,
          subtitle: `برعاية: ${ad.advertiserName}`,
          imageUrl: ad.mediaUrl,
          link: ad.targetUrl,
          ctaText: 'استكشف العرض',
        }))
      : defaultSlides;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const slide = activeSlides[currentSlide] || activeSlides[0];

  return (
    <div className="relative rounded-[14px] overflow-hidden bg-[#0A0A0A] shadow-md border-0">
      {/* Reduced compact height (145px - 165px) */}
      <div className="relative h-[145px] sm:h-[165px] w-full overflow-hidden">
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full h-full object-cover opacity-50 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/65 to-transparent" />

        {/* Content Box */}
        <div className="absolute inset-0 p-3.5 sm:p-4 flex flex-col justify-between z-10 text-right">
          <div className="space-y-1 max-w-[230px] sm:max-w-sm">
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {slide.title}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[#A1A1AA] leading-snug line-clamp-2">
              {slide.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => onNavigate(slide.link)}
              className="h-[28px] px-3.5 rounded-full bg-[#F5C400] text-black font-black text-[11px] hover:bg-[#DDAF00] active:scale-95 transition-all shadow-sm border-0"
            >
              {slide.ctaText}
            </button>

            {/* Pagination Dots */}
            {activeSlides.length > 1 && (
              <div className="flex items-center gap-1">
                {activeSlides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      currentSlide === idx ? 'w-3.5 bg-[#F5C400]' : 'w-1 bg-white/30'
                    )}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
