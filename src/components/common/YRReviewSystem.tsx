import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { bankService } from '../../services/bankService';
import { ReviewData } from '../../types/schema.types';

interface YRReviewSystemProps {
  entityType: string;
  entityId: string;
  initialReviews?: ReviewData[];
  onAddReview?: (newReview: ReviewData) => void;
}

export const YRReviewSystem: React.FC<YRReviewSystemProps> = ({ entityType, entityId }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (entityId) {
      bankService.fetchReviews(entityId).then((data) => {
        setReviews(data.map((r: any) => ({
          id: r.id,
          user_name: r.user_name || r.author_name || 'زائر موثق',
          user_avatar: 'https://ui-avatars.com/api/?background=1E293B&color=FFC500&name=' + encodeURIComponent(r.user_name || r.author_name || 'زائر'),
          entity_type: entityType,
          entity_id: entityId,
          rating: Number(r.stars ?? r.rating ?? 5),
          comment: r.comment,
          status: 'approved',
          created_at: r.created_at ? new Date(r.created_at).toLocaleDateString('ar-YE') : 'مؤخراً'
        })));
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [entityId, entityType]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((a, b) => a + (Number(b.rating || (b as any).stars) || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!authorName.trim() || !commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await bankService.addReview({
        business_id: entityId,
        author_name: authorName.trim(),
        rating: selectedStars,
        comment: commentText.trim()
      });

      if (res && res.success) {
        const fresh = await bankService.fetchReviews(entityId);
        setReviews(fresh.map((r: any) => ({
          id: r.id,
          user_name: r.user_name || r.author_name || 'زائر موثق',
          user_avatar: 'https://ui-avatars.com/api/?background=1E293B&color=FFC500&name=' + encodeURIComponent(r.user_name || r.author_name || 'زائر'),
          entity_type: entityType,
          entity_id: entityId,
          rating: Number(r.stars ?? r.rating ?? 5),
          comment: r.comment,
          status: 'approved',
          created_at: r.created_at ? new Date(r.created_at).toLocaleDateString('ar-YE') : 'الآن'
        })));
        setAuthorName('');
        setCommentText('');
        setSelectedStars(5);
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3500);
      } else {
        setErrorMessage('تعذر حفظ التقييم، يرجى المحاولة لاحقاً');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="bg-[#070B13] rounded-2xl border border-[#1B253A] p-8 text-center flex flex-col items-center justify-center font-['Cairo',sans-serif]">
        <Loader2 className="w-7 h-7 animate-spin text-[#FFC500] mb-2.5" />
        <p className="text-xs font-bold text-slate-400">جاري تحميل مراجعات المنشأة...</p>
      </div>
    );
  }

  const activeStarValue = hoveredStars !== null ? hoveredStars : selectedStars;

  return (
    <div dir="rtl" className="bg-[#070B13] rounded-2xl border border-[#1B253A] p-4 sm:p-6 space-y-6 font-['Cairo',sans-serif] text-slate-100 shadow-2xl">
      {/* رأس قسم التقييمات ومعدل النجوم */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1B253A]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#0D1526] border border-[#1E293B] flex items-center justify-center text-[#FFC500] shrink-0">
            <Star className="w-5 h-5 fill-[#FFC500]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">التقييمات والمراجعات المعتمدة</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">آراء وتجارب العملاء الحقيقية المسجلة في المنصة</p>
          </div>
        </div>

        {/* كرت المعدل الإجمالي */}
        <div className="flex items-center gap-3 bg-[#0D1526] border border-[#1E293B] rounded-xl px-4 py-2 self-start sm:self-auto">
          <div className="text-left">
            <div className="text-2xl font-black text-[#FFC500] leading-none">{avgRating}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">{reviews.length} تقييم مسجل</div>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(Number(avgRating))
                    ? 'text-[#FFC500] fill-[#FFC500]'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* رسالة النجاح */}
      {successToast && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم تسجيل تقييمك ومراجعتك بنجاح في قاعدة البيانات.</span>
        </div>
      )}

      {/* رسالة الخطأ */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* نموذج إضافة تقييم جديد */}
      <form onSubmit={handleSubmitReview} className="bg-[#0B101D] rounded-2xl border border-[#1B253A] p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#FFC500]" />
            <span>شاركنا تجربتك وتقييمك</span>
          </span>
          <span className="text-[11px] font-bold text-[#FFC500]">
            {activeStarValue} من 5 نجوم
          </span>
        </div>

        {/* أزرار اختيار النجوم - مقاس لمس قياسي مريح */}
        <div className="flex items-center gap-2 bg-[#070B13] border border-[#1E293B] rounded-xl p-2 w-fit">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoveredStars(star)}
              onMouseLeave={() => setHoveredStars(null)}
              onClick={() => setSelectedStars(star)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition hover:bg-[#111111]/60 focus:outline-none"
              title={`${star} نجوم`}
            >
              <Star
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${
                  star <= activeStarValue
                    ? 'text-[#FFC500] fill-[#FFC500] scale-110'
                    : 'text-slate-700'
                }`}
              />
            </button>
          ))}
        </div>

        {/* حقل اسم المقيم */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">
            اسم المقيم <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="اكتب اسمك الكامل أو اللقب..."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full h-11 bg-[#050811] border border-[#1E293B] focus:border-[#FFC500] rounded-xl pr-10 pl-3.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition"
            />
            <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* حقل التعليق والمراجعة */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">
            نص التقييم والملاحظات <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="اكتب تفاصيل تجربتك، مستوى الخدمة، الملاحظات..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-[#050811] border border-[#1E293B] focus:border-[#FFC500] rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition resize-none leading-relaxed"
          />
        </div>

        {/* زر النشر المتوافق مع الهوية */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-6 bg-[#FFC500] hover:bg-[#E6B200] active:scale-[0.98] disabled:opacity-50 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#FFC500]/10 transition cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>نشر التقييم المعتمد</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* قائمة المراجعات الحقيقية */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span>المراجعات المسجلة ({reviews.length})</span>
          <span>الأحدث أولاً</span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-[#0B101D] rounded-2xl border border-[#1B253A] p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-400">لا توجد تقييمات منشورة حتى الآن.</p>
            <p className="text-[11px] text-slate-500">كن أول من يشارك تجربته مع هذه المنشأة!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {reviews.map((rev) => {
              const starsCount = Math.max(1, Math.min(5, Math.round(Number(rev.rating || (rev as any).stars) || 5)));
              return (
                <div
                  key={rev.id}
                  className="bg-[#0B101D] hover:border-slate-700 rounded-2xl border border-[#1B253A] p-4 space-y-2.5 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#070B13] border border-[#1E293B] text-[#FFC500] flex items-center justify-center font-black text-xs shrink-0">
                        {rev.user_name ? rev.user_name.charAt(0) : 'م'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white">{rev.user_name}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
                            مقيم
                          </span>
                        </div>
                        {rev.created_at && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{rev.created_at}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* نجوم المراجعة */}
                    <div className="flex items-center gap-0.5 bg-[#070B13] border border-[#1E293B] px-2 py-1 rounded-lg">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= starsCount
                              ? 'text-[#FFC500] fill-[#FFC500]'
                              : 'text-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pr-10">
                    {rev.comment}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
