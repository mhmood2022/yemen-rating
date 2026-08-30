import React, { useState } from 'react';
import { Store, TrendingUp, TrendingDown, MapPin, Tag } from 'lucide-react';

export const MarketsManager: React.FC = () => {
  const [markets] = useState([
    { id: 'MKT-1', name: 'سوق الجملة المركزي (شعوب)', city: 'صنعاء', category: 'خضار وفواكه وسلع أساسية', status: 'active', itemsCount: 140, updated: 'منذ ساعتين' },
    { id: 'MKT-2', name: 'سوق الشيخ عثمان المركزي', city: 'عدن', category: 'أسماك ومواد غذائية', status: 'active', itemsCount: 95, updated: 'اليوم، 08:00 ص' },
    { id: 'MKT-3', name: 'سوق باب مكة للسلع التموينية', city: 'الحديدة', category: 'تموين وحبوب ومستوردات', status: 'active', itemsCount: 80, updated: 'أمس' },
    { id: 'MKT-4', name: 'سوق الغويزي التجاري', city: 'المكلا', category: 'سلع استهلاكية وأسماك', status: 'active', itemsCount: 60, updated: 'اليوم، 09:30 ص' },
  ]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Store className="text-[#FFC500]" />
          إدارة الأسواق والأسعار
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          متابعة الأسواق المركزية في المحافظات، أسعار السلع، وحالة النشاط اليومي.
        </p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
            <tr>
              <th className="py-3.5 px-4">اسم السوق</th>
              <th className="py-3.5 px-4">المدينة / المحافظة</th>
              <th className="py-3.5 px-4">النشاط والتصنيف</th>
              <th className="py-3.5 px-4 text-center">السلع المسجلة</th>
              <th className="py-3.5 px-4 text-center">حالة السوق</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] text-white">
            {markets.map((m) => (
              <tr key={m.id} className="hover:bg-[#161D2B]/50">
                <td className="py-3.5 px-4 font-bold text-white">{m.name}</td>
                <td className="py-3.5 px-4 text-[#9CA3AF] flex items-center gap-1">
                  <MapPin size={13} className="text-[#FFC500]" /> {m.city}
                </td>
                <td className="py-3.5 px-4 text-[#D1D5DB]">{m.category}</td>
                <td className="py-3.5 px-4 text-center font-mono font-bold text-[#FFC500]">{m.itemsCount} سلعة</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] font-bold text-[10px]">
                    نشط ومُحدّث
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
