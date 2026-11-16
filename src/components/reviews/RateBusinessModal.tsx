import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

interface RateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  businessAvatar?: string;
  reviewerName: string;
  reviewerUsername?: string;
  reviewerAvatar?: string;
  onSubmit: (payload: { businessId: string; stars: number; comment: string }) => Promise<void> | void;
}

export const RateBusinessModal: React.FC<RateBusinessModalProps> = ({
  isOpen,
  onClose,
  businessId,
  businessName,
  businessAvatar,
  reviewerName,
  reviewerUsername,
  reviewerAvatar,
  onSubmit,
}) => {
  const [stars, setStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const ratingLabel =
    stars === 5 ? 'ممتاز جداً' :
    stars === 4 ? 'جيد جداً' :
    stars === 3 ? 'متوسط' :
    stars === 2 ? 'مقبول' : 'سيء';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!comment.trim()) {
      setErrorMsg('يرجى كتابة تعليق عن تجربتك مع المنشأة');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ businessId, stars, comment: comment.trim() });
      setComment('');
      setStars(5);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[350] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="w-full sm:max-w-md bg-black border border-[#2F3336] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2F3336]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0">
              {businessAvatar ? (
                <img src={businessAvatar} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{businessName?.[0] || 'م'}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">تقييم {businessName}</h3>
              <p className="text-[11px] text-[#71767B]">تقييم يمن ريتنج</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#71767B] hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[#2F3336]/70 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden flex items-center justify-center shrink-0">
              {reviewerAvatar ? (
                <img src={reviewerAvatar} alt={reviewerName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{reviewerName?.[0] || 'م'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{reviewerName}</p>
              {reviewerUsername && (
                <p className="text-[11px] text-[#71767B] truncate" dir="ltr">@{reviewerUsername}</p>
              )}
            </div>
          </div>

          <div className="text-center space-y-1.5 py-1">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onMouseEnter={() => setHoverStars(value)}
                  onMouseLeave={() => setHoverStars(0)}
                  onClick={() => setStars(value)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={26}
                    strokeWidth={1.8}
                    className={
                      (hoverStars || stars) >= value
                        ? 'text-[#FFC500] fill-[#FFC500]'
                        : 'text-[#71767B]'
                    }
                  />
                </button>
              ))}
            </div>
            <span className="block text-xs font-bold text-white">{ratingLabel} ({stars}/5)</span>
          </div>

          <div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تجربتك مع هذه المنشأة..."
              className="w-full bg-black text-white text-sm p-3 rounded-xl border border-[#2F3336] focus:border-white outline-none caret-white placeholder-[#71767B] resize-none"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400">{errorMsg}</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-10 rounded-full bg-[#FFC500] text-black text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'جاري النشر...' : 'نشر التقييم'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-10 rounded-full border border-[#536471] text-white text-sm font-bold hover:bg-white/10 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
