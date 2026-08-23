import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Star, User, MessageSquare } from 'lucide-react';
import { yrToast } from '../ui/Toast';

interface AddReviewModalProps {
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: { authorName: string; rating: number; comment: string }) => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  businessName,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      yrToast.error('يرجى إدخال اسمك وتجربتك مع النشاط');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitReview({
        authorName: authorName.trim(),
        rating,
        comment: comment.trim(),
      });
      yrToast.success('تم إرسال تقييمك بنجاح!', 'شكراً لمشاركتك تجربتك الحقيقية في منصة يمن ريتغ');
      setAuthorName('');
      setComment('');
      setRating(5);
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إضافة تقييمك لـ: ${businessName}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        {/* Star Rating Selector */}
        <div className="space-y-1.5 text-center">
          <label className="block text-xs font-bold text-[#0B1F3A] dark:text-white">
            اختر تقييمك بالنجوم (1 إلى 5):
          </label>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  size={26}
                  strokeWidth={2}
                  className={
                    (hoverRating || rating) >= star
                      ? 'text-[#F5C400] fill-[#F5C400]'
                      : 'text-[#333333]'
                  }
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-black text-[#F5C400] block mt-1">
            {rating === 5 ? 'ممتاز جداً ★★★★★' : rating === 4 ? 'جيد جداً ★★★★' : rating === 3 ? 'متوسط ★★★' : rating === 2 ? 'مقبول ★★' : 'سيء ★'}
          </span>
        </div>

        <Input
          label="اسمك أو صفتك"
          placeholder="مثال: م. علي الريمي"
          required
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          rightIcon={<User size={16} />}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0B1F3A] dark:text-white">
            اكتب رأيك وتجربتك بالتفصيل
          </label>
          <textarea
            rows={3}
            required
            placeholder="اذكر جودة الخدمة، سرعة التعامل، والأسعار..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 text-xs bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white border border-[#CBD5E1] dark:border-[#222222] rounded-[10px] outline-none focus:border-[#F5C400]"
          />
        </div>

        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#222222] flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            className="font-bold h-[42px]"
          >
            {isSubmitting ? 'جارٍ الحفظ...' : 'نشر التقييم فوراً'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="h-[42px]">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
