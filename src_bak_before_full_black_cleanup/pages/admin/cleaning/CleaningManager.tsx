import React, { useState } from 'react';
import { Sparkles, ShieldCheck, MapPin, Star } from 'lucide-react';

export const CleaningManager: React.FC = () => {
  const [providers] = useState([
    { id: 'CLN-1', name: 'مؤسسة النقاء للتنظيف الشامل', city: 'صنعاء', services: 'تنظيف منازل، واجهات، مكافحة حشرات', rating: 4.9, reviewsCount: 88, status: 'verified' },
    { id: 'CLN-2', name: 'البريق كلين للخدمات الفندقية', city: 'عدن', services: 'تنظيف قصور وفنادق، سجاد وكنب', rating: 4.8, reviewsCount: 64, status: 'verified' },
    { id: 'CLN-3', name: 'سوبر كلين تعز', city: 'تعز', services: 'تنظيف خزانات ومباني سكنية', rating: 4.6, reviewsCount: 39, status: 'verified' },
  ]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Sparkles className="text-[#FFC500]" />
          إدارة قطاع التنظيف والخدمات المنزلية
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          إدارة الشركات المعتمدة، التقييمات، والخدمات المتخصصة في التنظيف ومكافحة الآفات.
        </p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
            <tr>
              <th className="py-3.5 px-4">اسم الشركة / المؤسسة</th>
              <th className="py-3.5 px-4">المدينة</th>
              <th className="py-3.5 px-4">الخدمات المقدمة</th>
              <th className="py-3.5 px-4 text-center">التقييم</th>
              <th className="py-3.5 px-4 text-center">حالة الاعتماد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] text-white">
            {providers.map((pr) => (
              <tr key={pr.id} className="hover:bg-[#161D2B]/50">
                <td className="py-3.5 px-4 font-bold text-white">{pr.name}</td>
                <td className="py-3.5 px-4 text-[#9CA3AF]">{pr.city}</td>
                <td className="py-3.5 px-4 text-[#D1D5DB]">{pr.services}</td>
                <td className="py-3.5 px-4 text-center font-bold text-[#FFC500]">
                  ★ {pr.rating} <span className="text-[10px] text-[#9CA3AF]">({pr.reviewsCount})</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] font-bold text-[10px]">
                    مزود معتمد
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
