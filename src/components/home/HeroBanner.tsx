import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';
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
    },
    {
      id: 's2',
      title: 'سوق الجوالات والإلكترونيات',
      subtitle: 'عروض حصرية وضمانات معتمدة لأحدث الهواتف والأجهزة',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      link: '/directory?category=محلات الجوالات والإلكترونيات',
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
    <div className="relative rounded-[16px] overflow-hidden border border-[#E2E8F0] dark:border-[#222222] bg-[#0B1F3A] dark:bg-[#0A0A0A] shadow-md">
      {/* Background Image with warm architectural night atmosphere */}
      <div className="relative h-[190px] sm:h-[220px] w-full overflow-hidden">
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full h-full object-cover opacity-45 dark:opacity-35 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-transparent" />

        {/* Slide Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
          <div className="space-y-1.5 max-w-[260px] sm:max-w-md">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {slide.title}
            </h2>
            <p className="text-xs text-[#CBD5E1] dark:text-[#A1A1AA] leading-relaxed">
              {slide.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => onNavigate(slide.link)}
              className="h-[34px] px-4 rounded-full bg-[#F5C400] text-black font-black text-xs flex items-center gap-1.5 hover:bg-[#DDAF00] active:scale-95 transition-all shadow-md"
            >
              <span>استكشف الآن</span>
              <ArrowLeft size={13} strokeWidth={2.5} />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    currentSlide === idx ? 'w-5 bg-[#F5C400]' : 'w-1.5 bg-white/40 dark:bg-white/20'
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
