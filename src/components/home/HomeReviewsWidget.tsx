import React from 'react';
import { LATEST_REVIEWS } from '../../data/demoHome';
import { Star, User } from 'lucide-react';
import { Card } from '../ui/Card';

export const HomeReviewsWidget: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const review = LATEST_REVIEWS[0];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm sm:text-base font-black text-white">
          آخر التقييمات
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('/directory')}
          className="text-xs font-black text-[#F5C400] hover:underline transition-colors"
        >
          عرض الكل
        </button>
      </div>

      <Card className="p-3.5 bg-[#111111] border border-[#222222] rounded-[14px]">
        <div className="flex items-center gap-3">
          {/* Borderless Business Image */}
          <div className="w-16 h-16 rounded-[10px] overflow-hidden shrink-0 border-0 bg-[#0A0A0A]">
            <img
              src={review.businessImage}
              alt={review.businessName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs font-bold text-white truncate">
                {review.authorName}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#1E1E1E] text-[#A1A1AA] flex items-center justify-center shrink-0 border-0">
                <User size={12} strokeWidth={2} />
              </div>
            </div>

            <p className="text-[11px] text-[#A1A1AA] line-clamp-1 leading-relaxed">
              {review.comment}
            </p>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[9px] text-[#71717A]">{review.timeAgo}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={10}
                    strokeWidth={2}
                    className="text-[#F5C400] fill-[#F5C400]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
