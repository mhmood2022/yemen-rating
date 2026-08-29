import React, { useState } from 'react';
import { Building2, Search, Filter, ShieldCheck, EyeOff, Award, ArrowUpRight } from 'lucide-react';

export const CompaniesManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBadge, setFilterBadge] = useState('all');

  // نموذج بيانات للشركات
  const companies = [
    { id: '1', name: 'مجموعة بن محفوظ للتجارة', city: 'صنعاء', category: 'تجارة واستيراد', badge: 'gold', boost: 85, verified: true, isHidden: false },
    { id: '2', name: 'شركة عدن للتقنية والشبكات', city: 'عدن', category: 'تكنولوجيا ومعلومات', badge: 'blue', boost: 40, verified: true, isHidden: false },
    { id: '3', name: 'مؤسسة الشامل للخدمات', city: 'تعز', category: 'خدمات عامة', badge: 'gray', boost: 0, verified: false, isHidden: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">إدارة الشركات والأنشطة</h2>
          <p className="text-[#9CA3AF] text-xs">التحكم في الشارات (Gold/Blue/Gray)، التوثيق، ترتيب الـ Boost، والإخفاء</p>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search size={16} className="absolute right-3 top-3 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="بحث باسم الشركة، المدينة، أو التصنيف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1F2937] rounded-xl pr-9 pl-4 py-2.5 text-xs text-white focus:border-[#FFC500] outline-none"
          />
        </div>
        <select
          value={filterBadge}
          onChange={(e) => setFilterBadge(e.target.value)}
          className="bg-[#0B0F17] border border-[#1F2937] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#FFC500] outline-none"
        >
          <option value="all">جميع الشارات</option>
          <option value="gold">شارة ذهبية (Gold)</option>
          <option value="blue">شارة موثقة (Blue)</option>
          <option value="gray">بدون شارة (Gray)</option>
        </select>
      </div>

      {/* جدول الشركات */}
      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="py-3.5 px-4">اسم الشركة</th>
                <th className="py-3.5 px-4">المدينة والتصنيف</th>
                <th className="py-3.5 px-4">الشارة الحالية</th>
                <th className="py-3.5 px-4">الترويج (Boost)</th>
                <th className="py-3.5 px-4">حالة الصفحة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-[#161D2B]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                    <Building2 size={16} className="text-[#FFC500]" />
                    {c.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#9CA3AF]">{c.city} • {c.category}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.badge === 'gold' ? 'bg-[#FFC500]/20 text-[#FFC500]' :
                      c.badge === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      {c.badge.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#16A34A]">+{c.boost} Pts</td>
                  <td className="py-3.5 px-4">
                    {c.isHidden ? (
                      <span className="text-[#DC2626] font-semibold text-[11px]">مخفية</span>
                    ) : (
                      <span className="text-[#16A34A] font-semibold text-[11px]">نشطة</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="px-2 py-1 rounded bg-[#161D2B] text-[#FFC500] hover:bg-[#FFC500] hover:text-black font-bold text-[11px] transition-all">
                        تعديل الشارة
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
