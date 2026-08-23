import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export const HeroBanner: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 's1',
      title: 'اكتشف الأفضل',
      subtitle: 'تقييمات حقيقية من المجتمع لأفضل الشركات والخدمات في اليمن',
      imageUrl: 'https://images.unsplash.com/photo-1578895210405-907db486c111?w=800&auto=format&fit=crop&q=80',
      link: '/directory',
      ctaText: 'استكشف الآن',
    },
    {
      id: 's2',
      title: 'سوق الجوالات والإلكترونيات',
      subtitle: 'عروض حصرية وضمانات معتمدة لأحدث الهواتف والأجهزة',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      link: '/phones',
      ctaText: 'سوق الجوالات',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative rounded-[16px] overflow-hidden bg-[#0A0A0A] shadow-md border-0">
      <div className="relative h-[145px] sm:h-[165px] w-full overflow-hidden">
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full h-full object-cover opacity-45 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/60 to-transparent" />

        <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-right">
          <div className="space-y-1 max-w-[240px] sm:max-w-sm">
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
              className="h-[30px] px-4 rounded-full bg-[#F5C400] text-black font-black text-xs hover:bg-[#DDAF00] active:scale-95 transition-all shadow-md border-0"
            >
              {slide.ctaText}
            </button>

            <div className="flex items-center gap-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    'h-1 rounded-full transition-all duration-300',
                    currentSlide === idx ? 'w-4 bg-[#F5C400]' : 'w-1 bg-white/30'
                  )}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
