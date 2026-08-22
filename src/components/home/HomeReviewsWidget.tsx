import React from 'react';
import { LATEST_REVIEWS } from '../../data/demoHome';
import { Star, User, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';

export const HomeReviewsWidget: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const review = LATEST_REVIEWS[0];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm sm:text-base font-bold text-[#0B1F3A] dark:text-white">
          آخر التقييمات
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('/directory')}
          className="text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-[#F5C400] transition-colors flex items-center gap-1"
        >
          <span>عرض الكل</span>
          <ArrowLeft size={12} strokeWidth={1.75} />
        </button>
      </div>

      {/* Review Card */}
      <Card className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px]">
        <div className="flex items-center gap-3.5">
          {/* Business Image */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[10px] overflow-hidden shrink-0 border border-[#E2E8F0] dark:border-[#222222]">
            <img
              src={review.businessImage}
              alt={review.businessName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Review Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#0B1F3A]/5 dark:bg-[#222222] text-[#475569] dark:text-[#A1A1AA] flex items-center justify-center shrink-0">
                <User size={12} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-[#0B1F3A] dark:text-white truncate">
                {review.authorName}
              </span>
            </div>

            <p className="text-xs text-[#475569] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">
              {review.comment}
            </p>

            {/* Stars & Timestamp */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    strokeWidth={1.75}
                    className="text-[#F5C400] fill-[#F5C400]"
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#94A3B8] dark:text-[#71717A]">{review.timeAgo}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
