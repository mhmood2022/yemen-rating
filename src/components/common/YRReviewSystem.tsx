import React, { useState } from 'react';
import { Star, Send, ShieldCheck, CheckCircle2, User } from 'lucide-react';
import { ReviewData } from '../../types/schema.types';

interface YRReviewSystemProps {
  entityType: string;
  entityId: string;
  initialReviews: ReviewData[];
  onAddReview?: (newReview: ReviewData) => void;
}

export const YRReviewSystem: React.FC<YRReviewSystemProps> = ({
  entityType,
  entityId,
  initialReviews,
  onAddReview
}) => {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  // حساب المتوسط الحسابي وتوزيع النجوم الحقيقي
  const summary = React.useMemo(() => {
    const valid = reviews.filter(r => r.status === 'approved');
    const totalCount = valid.length;
    if (totalCount === 0) {
      return { average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
    const sum = valid.reduce((acc, r) => acc + Number(r.rating), 0);
    const average = Number((sum / totalCount).toFixed(1));

    const dist: Record<1 | 2 | 3 | 4 | 5, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    valid.forEach(r => {
      const rate = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      dist[rate] = (dist[rate] || 0) + 1;
    });

    return { average, count: totalCount, distribution: dist };
  }, [reviews]);

  // إرسال تقييم حقيقي
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentText.trim() || selectedStars < 1 || selectedStars > 5) return;

    const newRev: ReviewData = {
      id: `rev-${Date.now()}`,
      entity_type: entityType,
      entity_id: entityId,
      user_name: authorName.trim(),
      user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: selectedStars,
      comment: commentText.trim(),
      status: 'approved',
      created_at: 'الآن'
    };

    setReviews(prev => [newRev, ...prev]);
    if (onAddReview) onAddReview(newRev);

    setAuthorName('');
    setCommentText('');
    setSelectedStars(5);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3500);
  };

  // دالة رسم النجوم الدقيقة (نجمة 1 = ★☆☆☆☆)
  const renderExactStars = (ratingValue: number, size = 14) => {
    const rounded = Math.max(0, Math.min(5, Math.round(ratingValue)));
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= rounded ? 'text-[#FFC500] fill-[#FFC500]' : 'text-zinc-700 fill-zinc-800'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] p-4 sm:p-5 space-y-4 font-['Cairo',sans-serif] text-white shadow-xl">
      
      {/* رأس التقييمات والحساب الإحصائي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222226] pb-3">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Star size={16} className="text-[#FFC500] fill-[#FFC500]" />
            التقييمات والمراجعات الموثقة
          </h3>
          <span className="text-[10px] text-zinc-400">حساب حقيقي من تجارب العملاء المعتمدة</span>
        </div>

        <div className="flex items-center gap-3 bg-[#161619] px-3.5 py-2 rounded-xl border border-[#27272A] font-mono">
          <div className="text-2xl font-black text-[#FFC500]">{summary.average}</div>
          <div>
            {renderExactStars(summary.average, 14)}
            <span className="text-[10px] text-zinc-400 font-['Cairo'] block mt-0.5 font-sans">
              ({summary.count} مراجعة مسجلة)
            </span>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-100 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>تم تسجيل وتوثيق تقييمك بنجاح واحتسابه في متوسط التقييم العام!</span>
        </div>
      )}

      {/* توزيع النجوم الـ 5 بنسب مئوية رياضية */}
      {summary.count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 bg-[#141417] rounded-xl border border-[#222226] text-[10px] font-mono">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage = summary.count > 0 ? Math.round((count / summary.count) * 100) : 0;
            return (
              <div key={stars} className="space-y-1">
                <div className="flex justify-between text-zinc-400 font-['Cairo']">
                  <span>{stars} نجوم</span>
                  <span>{percentage}% ({count})</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFC500] rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نموذج إضافة تقييم حقيقي واختيار النجوم من 1 إلى 5 */}
      <form onSubmit={handleSubmitReview} className="p-3.5 bg-[#141417] rounded-xl border border-[#222226] space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-white">اختر تقييمك الحقيقي:</span>
          
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStars(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                title={`${star} نجوم`}
              >
                <Star
                  size={20}
                  className={star <= selectedStars ? 'text-[#FFC500] fill-[#FFC500]' : 'text-zinc-700 fill-zinc-800'}
                />
              </button>
            ))}
            <span className="text-xs font-mono font-bold text-[#FFC500] mr-2">({selectedStars} من 5)</span>
          </div>
        </div>

        <input
          type="text"
          required
          placeholder="اسمك الكامل..."
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
        />

        <textarea
          rows={2}
          required
          placeholder="اكتب تقييمك وتجربتك بالتفصيل..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full bg-[#0B0B0E] border border-[#27272A] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
        />

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <Send size={13} />
            <span>نشر التقييم</span>
          </button>
        </div>
      </form>

      {/* قائمة المراجعات الحقيقية المنشورة */}
      <div className="space-y-2 pt-1">
        {reviews.filter(r => r.status === 'approved').length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">لا توجد تقييمات منشورة بعد، كن أول من يكتب تقييماً.</div>
        ) : (
          reviews.filter(r => r.status === 'approved').map(rev => (
            <div key={rev.id} className="p-3 bg-[#141417] rounded-xl border border-[#222226] space-y-1.5 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={rev.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={rev.user_name}
                    className="w-7 h-7 rounded-full object-cover border border-[#FFC500]/30"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">{rev.user_name}</h5>
                    <span className="text-[9px] text-zinc-500 font-mono">{rev.created_at}</span>
                  </div>
                </div>
                {renderExactStars(rev.rating, 12)}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium pr-9">
                "{rev.comment}"
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
