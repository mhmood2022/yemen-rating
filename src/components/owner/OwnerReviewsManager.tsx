import React, { useState } from 'react';
import { BusinessItem, BusinessReview } from '../../types/business';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Star, MessageSquare, CornerDownLeft, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { yrToast } from '../ui/Toast';

export const OwnerReviewsManager: React.FC<{ business: BusinessItem }> = ({ business }) => {
  const [reviews, setReviews] = useState<BusinessReview[]>(business.reviews || []);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) {
      yrToast.error('يرجى كتابة نص الرد الرسمي');
      return;
    }
    yrToast.success('تم نشر ردك الرسمي بنجاح!');
    setReplyingToId(null);
    setReplyText('');
  };

  const handleReportReview = (reviewId: string) => {
    yrToast.info('تم رفع بلاغ للإدارة لمراجعة هذا التقييم');
  };

  return (
    <Card className="p-4 sm:p-5 bg-[#111111] border border-[#222222] rounded-[14px] space-y-4 text-right">
      <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
        <div>
          <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-[#F5C400]" />
            <span>آراء العملاء والردود الرسمية ({reviews.length})</span>
          </h3>
          <p className="text-[11px] text-[#A1A1AA]">
            يمكنك الرد الرسمي على تقييمات العملاء لتعزيز موثوقية نشاطك (حذف التقييمات يتم عبر الإدارة وفق السياسة).
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs font-black text-[#F5C400]">
          <Star size={14} className="fill-[#F5C400]" />
          <span>{business.rating.toFixed(1)} / 5</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-xs text-[#71717A] text-center py-4">لا توجد تقييمات من العملاء حتى الآن.</p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 rounded-[10px] bg-[#0A0A0A] border border-[#1E1E1E] space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1E1E1E] text-[#A1A1AA] flex items-center justify-center text-xs">
                    <User size={13} />
                  </div>
                  <span className="font-bold text-xs text-white">{rev.authorName}</span>
                  {rev.isVerifiedReviewer && (
                    <span className="text-[10px] text-[#22C55E] font-bold bg-[#22C55E]/10 px-1.5 py-0.2 rounded">مقيم موثق</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        className={s <= rev.rating ? 'text-[#F5C400] fill-[#F5C400]' : 'text-[#333333]'}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#71717A]">· {rev.date}</span>
                </div>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed pr-8">{rev.comment}</p>

              {/* Action Toolbar: Reply & Report */}
              <div className="pr-8 pt-1 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setReplyingToId(replyingToId === rev.id ? null : rev.id)}
                  className="text-[#F5C400] font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <CornerDownLeft size={12} />
                  <span>{replyingToId === rev.id ? 'إلغاء الرد' : 'إضافة رد رسمي كإدارة النشاط'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReportReview(rev.id)}
                  className="text-[#71717A] hover:text-[#EF4444] text-[10px] flex items-center gap-1 transition-colors"
                >
                  <ShieldAlert size={11} />
                  <span>إبلاغ الإدارة</span>
                </button>
              </div>

              {/* Reply Input Box */}
              {replyingToId === rev.id && (
                <div className="pr-8 pt-2 space-y-2 animate-in fade-in duration-150">
                  <textarea
                    rows={2}
                    placeholder="اكتب رد إدارة النشاط الرسمي هنا..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#141414] text-white border border-[#262626] rounded-[8px] outline-none focus:border-[#F5C400]"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSendReply(rev.id)}
                    className="text-xs font-bold h-7 px-3"
                  >
                    نشر الرد الرسمي
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
