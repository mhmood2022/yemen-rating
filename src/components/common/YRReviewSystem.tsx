import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { bankService } from '../../services/bankService';
import { ReviewData } from '../../types/schema.types';

interface YRReviewSystemProps {
  entityType: string;
  entityId: string;
  initialReviews: ReviewData[];
  onAddReview?: (newReview: ReviewData) => void;
}

export const YRReviewSystem: React.FC<YRReviewSystemProps> = ({ entityType, entityId }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (entityId) {
      bankService.fetchReviews(entityId).then((data) => {
        setReviews(data.map((r: any) => ({
          id: r.id,
          user_name: r.author_name,
          user_avatar: 'https://ui-avatars.com/api/?name=' + r.author_name,
          entity_type: entityType,
          entity_id: entityId,
          rating: r.rating,
          comment: r.comment,
          status: 'approved',
          created_at: new Date(r.created_at).toLocaleDateString('ar-EG')
        })));
        setLoading(false);
      });
    }
  }, [entityId, entityType]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await bankService.addReview({
      business_id: entityId,
      author_name: authorName.trim(),
      rating: selectedStars,
      comment: commentText.trim()
    });

    if (res.success) {
      // إعادة تحميل التقييمات
      const fresh = await bankService.fetchReviews(entityId);
      setReviews(fresh.map((r: any) => ({
        id: r.id,
        user_name: r.author_name,
        user_avatar: 'https://ui-avatars.com/api/?name=' + r.author_name,
        entity_type: entityType,
        entity_id: entityId,
        rating: r.rating,
        comment: r.comment,
        status: 'approved',
        created_at: new Date(r.created_at).toLocaleDateString('ar-EG')
      })));
      setAuthorName('');
      setCommentText('');
      setSelectedStars(5);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3500);
    } else {
      alert('فشل في نشر التقييم');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center p-4 text-zinc-500">تحميل التقييمات...</div>;

  return (
    <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] p-4 sm:p-5 space-y-4 font-['Cairo',sans-serif] text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-[#222226] pb-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Star size={16} className="text-[#FFC500] fill-[#FFC500]" /> التقييمات الحقيقية
        </h3>
        <div className="text-2xl font-black text-[#FFC500">
          {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '0.0'}
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-100">
          <CheckCircle2 size={16} className="inline ml-1" /> تم تسجيل تقييمك بنجاح!
        </div>
      )}

      <form onSubmit={handleSubmitReview} className="p-3.5 bg-[#141417] rounded-xl border border-[#222226] space-y-2.5">
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setSelectedStars(star)} className="focus:outline-none">
              <Star size={20} className={star <= selectedStars ? 'text-[#FFC500] fill-[#FFC500]' : 'text-zinc-700'} />
            </button>
          ))}
        </div>
        <input
          type="text"
          required
          placeholder="اسمك..."
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-xl p-2 text-xs outline-none"
        />
        <textarea
          rows={2}
          required
          placeholder="تجربتك..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-xl p-2 text-xs outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs disabled:opacity-50"
        >
          {submitting ? 'جاري النشر...' : 'نشر التقييم'}
        </button>
      </form>

      <div className="space-y-2 pt-1">
        {reviews.length === 0 ? (
          <div className="text-center py-4 text-zinc-500 text-xs">لا توجد تقييمات بعد.</div>
        ) : (
          reviews.map(rev => (
            <div key={rev.id} className="p-3 bg-[#141417] rounded-xl border border-[#222226]">
              <div className="flex justify-between items-center mb-1">
                <h5 className="text-xs font-bold">{rev.user_name}</h5>
                <div className="flex text-[#FFC500] text-[10px]">{'★'.repeat(rev.rating)}</div>
              </div>
              <p className="text-xs text-zinc-300">"{rev.comment}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
