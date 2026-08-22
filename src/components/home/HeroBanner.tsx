import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../../data/demoHome';
import { Button } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

export const HeroBanner: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="relative rounded-[16px] overflow-hidden border border-[#E2E8F0] dark:border-[#222222] bg-[#0B1F3A] dark:bg-[#0A0A0A] shadow-lg">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="relative h-[200px] sm:h-[240px] w-full overflow-hidden">
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full h-full object-cover opacity-35 dark:opacity-25 scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0B1F3A]/80 to-transparent dark:from-[#000000] dark:via-[#000000]/80 dark:to-transparent" />
        
        {/* Slide Content */}
        <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between z-10">
          <div className="space-y-1.5 max-w-sm sm:max-w-md">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {slide.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#CBD5E1] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">
              {slide.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate(slide.ctaLink)}
              className="h-[36px] px-4 font-extrabold text-xs shadow-md"
            >
              <span>{slide.ctaText}</span>
              <ArrowLeft size={13} strokeWidth={2} />
            </Button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    currentSlide === idx
                      ? 'w-5 bg-[#F5C400]'
                      : 'w-1.5 bg-white/40 dark:bg-white/20'
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
