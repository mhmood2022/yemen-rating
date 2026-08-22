import React from 'react';
import { Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { BusinessReview } from '../../types/business';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';

export const BusinessReviews: React.FC<{ reviews?: BusinessReview[] }> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        title="لا توجد تقييمات متاحة حاليًا"
        description="كن أول من يشارك تجربته مع هذا النشاط بعد التحقق."
        icon={<MessageSquare size={36} strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((rev) => (
        <Card key={rev.id} className="p-4 border-[#E2E8F0]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#0B1F3A]">{rev.authorName}</span>
              {rev.isVerifiedReviewer && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded-[4px]">
                  <CheckCircle2 size={11} />
                  مقيم موثق
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#94A3B8]">{rev.date}</span>
          </div>

          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={13}
                className={s <= Math.round(rev.rating) ? 'text-[#F5C400] fill-[#F5C400]' : 'text-[#CBD5E1]'}
              />
            ))}
          </div>

          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{rev.comment}</p>
        </Card>
      ))}
    </div>
  );
};
