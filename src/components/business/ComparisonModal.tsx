import React from 'react';
import { BusinessItem } from '../../types/database.types';
import { Scale, Star, Award, Clock, MapPin, Briefcase, Phone, X, Crown, TrendingUp } from 'lucide-react';

interface Props {
  businesses: BusinessItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export const ComparisonModal: React.FC<Props> = ({ businesses, isOpen, onClose, onRemove }) => {
  if (!isOpen) return null;
  if (businesses.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans" dir="rtl">
        <div className="bg-[#14141C] border border-[#2A2A2A] w-full max-w-md rounded-3xl p-6 text-white text-center">
          <p className="text-neutral-400">اختر نشاطين على الأقل للمقارنة</p>
        </div>
      </div>
    );
  }

  // حساب أفضل قيمة لكل معيار
  const maxRating = Math.max(...businesses.map(b => Number(b.rating) || 0));
  const maxReviews = Math.max(...businesses.map(b => Number(b.reviews_count) || 0));
  const maxYr = Math.max(...businesses.map(b => Number(b.yr_score) || 0));
  const maxServices = Math.max(...businesses.map(b => (b.services || []).length));

  // تصميم الخلية المميزة
  const bestCellClass = "py-3 px-3 font-black text-emerald-400 bg-emerald-400/10 rounded-lg border border-emerald-400/30 relative";
  const normalCellClass = "py-3 px-3 text-neutral-300";

  // شارة "الأفضل"
  const BestBadge = () => (
    <span className="absolute -top-2 -left-2 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
      <Crown className="w-2 h-2" fill="black" />
      الأفضل
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans" dir="rtl">
      <div className="bg-[#14141C] border border-[#2A2A2A] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#14141C] flex justify-between items-center p-5 border-b border-[#2A2A2A] z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFC107]/10 text-[#FFC107]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">جدول المقارنة المباشرة</h2>
              <p className="text-xs text-neutral-400 mt-0.5">قارن بين {businesses.length} أنشطة — الأفضل باللون الأخضر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#2A2A2A] text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-5">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="pb-4 pr-3 text-neutral-500 font-bold text-xs uppercase tracking-wide">المعيار</th>
                {businesses.map(b => (
                  <th key={b.id} className="pb-4 px-3 text-center min-w-[180px]">
                    <div className="relative bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-3">
                      <button
                        onClick={() => onRemove(b.id)}
                        className="absolute top-2 left-2 p-1 rounded-full hover:bg-[#2A2A2A] text-neutral-500 hover:text-rose-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {b.logo_url && (
                        <img src={b.logo_url} alt={b.name} className="w-12 h-12 rounded-xl object-cover mx-auto mb-2 border border-[#2A2A2A]" />
                      )}
                      <div className="text-[#FFC107] font-black text-xs leading-tight">{b.name}</div>
                      <div className="text-[10px] text-neutral-500 mt-1">{b.categoryName}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F28]">
              {/* التقييم العام */}
              <tr>
                <td className="py-4 pr-3 text-neutral-400 font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#FFC107]" />
                  <span>التقييم العام</span>
                </td>
                {businesses.map(b => {
                  const isBest = Number(b.rating) === maxRating && maxRating > 0;
                  return (
                    <td key={b.id} className={isBest ? bestCellClass : normalCellClass}>
                      {isBest && <BestBadge />}
                      <div className="flex items-center justify-center gap-1">
                        <Star className={`w-4 h-4 ${isBest ? 'text-emerald-400' : 'text-[#FFC107]'}`} fill="currentColor" />
                        <span className={isBest ? 'text-emerald-400' : 'text-white'}>{b.rating}</span>
                      </div>
                      <div className="text-[10px] mt-1 text-center opacity-75">{b.reviews_count} تقييم</div>
                    </td>
                  );
                })}
              </tr>

              {/* عدد التقييمات */}
              <tr>
                <td className="py-4 pr-3 text-neutral-400 font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#FFC107]" />
                  <span>عدد التقييمات</span>
                </td>
                {businesses.map(b => {
                  const isBest = Number(b.reviews_count) === maxReviews && maxReviews > 0;
                  return (
                    <td key={b.id} className={`${isBest ? bestCellClass : normalCellClass} text-center`}>
                      {isBest && <BestBadge />}
                      <span className={`text-lg font-black ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                        {b.reviews_count}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* مؤشر YR Score */}
              <tr>
                <td className="py-4 pr-3 text-neutral-400 font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#FFC107]" />
                  <span>مؤشر YR Score</span>
                </td>
                {businesses.map(b => {
                  const isBest = Number(b.yr_score) === maxYr && maxYr > 0;
                  return (
                    <td key={b.id} className={`${isBest ? bestCellClass : normalCellClass} text-center`}>
                      {isBest && <BestBadge />}
                      <div className={`text-lg font-black ${isBest ? 'text-emerald-400' : 'text-[#FFC107]'}`}>
                        YR {b.yr_score}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* ساعات العمل */}
              <tr>
                <td className="py-4 pr-3 text-neutral-400 font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFC107]" />
                  <span>ساعات العمل</span>
                </td>
                {businesses.map(b => (
                  <td key={b.id} className={`${normalCellClass} text-center`}>
                    {b.hours || <span className="text-neutral-600">غير محدد</span>}
                  </td>
                ))}
              </tr>

              {/* الموقع */}
              <tr>
                <td className="py-4 pr-3 text-neutral-400 font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FFC107]" />
                  <span>الموقع</span>
                </td>
                {businesses.map(b => (
                  <td key={b.id} className={`${normalCellClass} text-center text-xs`}>
                    <div className="font-bold text-white">{b.city}</div>
                    <div className="text-[10px] mt-0.5 opacity-75">{b.district}</div>
                  </td>
                ))}
              </tr>

              {/* الخدمات */}
              <tr>
                <td className="py-4 pr-3 text-neutral-400 font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#FFC107]" />
                  <span>عدد الخدمات</span>
                </td>
                {businesses.map(b => {
                  const count = (b.services || []).length;
                  const isBest = count === maxServices && maxServices > 0;
                  return (
                    <td key={b.id} className={`${isBest ? bestCellClass : normalCellClass} text-center`}>
                      {isBest && <BestBadge />}
                      <div className={`text-lg font-black ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                        {count}
                      </div>
                      <div className="text-[10px] mt-1 opacity-75">خدمة متاحة</div>
                    </td>
                  );
                })}
              </tr>

              {/* قائمة الخدمات */}
              <tr>
                <td className="py-4 pr-3 text-neutral-400 font-bold flex items-center gap-2">
                  <span className="text-[10px]">تفاصيل الخدمات</span>
                </td>
                {businesses.map(b => (
                  <td key={b.id} className="py-4 px-3">
                    <div className="space-y-1">
                      {(b.services || []).slice(0, 5).map((s: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-300">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span className="leading-tight">{s}</span>
                        </div>
                      ))}
                      {(b.services || []).length > 5 && (
                        <div className="text-[10px] text-[#FFC107] mt-1">+ {(b.services || []).length - 5} أخرى</div>
                      )}
                      {(b.services || []).length === 0 && (
                        <div className="text-neutral-600 text-[11px]">لا توجد خدمات مسجلة</div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* التواصل */}
              <tr>
                <td className="py-4 pr-3 text-neutral-400 font-bold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#FFC107]" />
                  <span>التواصل المباشر</span>
                </td>
                {businesses.map(b => (
                  <td key={b.id} className="py-4 px-3 text-center">
                    <a
                      href={`tel:${b.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC107] hover:bg-[#E5A600] text-black font-black text-xs rounded-full transition"
                    >
                      <Phone className="w-3 h-3" />
                      اتصل الآن
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#14141C] border-t border-[#2A2A2A] p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span className="text-neutral-400">الأفضل</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#FFC107]"></span>
              <span className="text-neutral-400">قيمة مميزة</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2A2A2A] hover:bg-[#333] text-white font-bold text-sm rounded-xl transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
