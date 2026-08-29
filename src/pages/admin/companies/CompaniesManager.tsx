import React, { useState } from 'react';
import { Building2, Search, Award, Check, Filter } from 'lucide-react';
import { YRBadge, BadgeType } from '../../../components/common/YRBadge';

interface Company {
  id: string;
  name: string;
  city: string;
  category: string;
  badge: BadgeType;
  boost: number;
  isHidden: boolean;
}

export const CompaniesManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBadge, setFilterBadge] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // قائمة شركات تجريبية قابلة للتحكم
  const [companies, setCompanies] = useState<Company[]>([
    { id: '1', name: 'مجموعة بن محفوظ للتجارة والاستثمار', city: 'صنعاء', category: 'تجارة واستيراد', badge: 'gold', boost: 95, isHidden: false },
    { id: '2', name: 'شركة عدن للتقنية والحلول الرقمية', city: 'عدن', category: 'تكنولوجيا ومعلومات', badge: 'blue', boost: 60, isHidden: false },
    { id: '3', name: 'مؤسسة الأمل للخدمات اللوجستية', city: 'حضرموت - المكلا', category: 'شحن ونقل', badge: 'gray', boost: 25, isHidden: false },
    { id: '4', name: 'مركز تعز الطبي التخصصي', city: 'تعز', category: 'مستشفيات ورعاية صحية', badge: 'gold', boost: 80, isHidden: false },
    { id: '5', name: 'محلات الصقر للهواتف والإلكترونيات', city: 'إب', category: 'هواتف وأجهزة', badge: 'none', boost: 0, isHidden: true },
  ]);

  // تحديث شارة الشركة
  const updateBadge = (companyId: string, newBadge: BadgeType) => {
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, badge: newBadge } : c));
    setSelectedCompany(null);
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.city.includes(searchTerm);
    const matchesBadge = filterBadge === 'all' || c.badge === filterBadge;
    return matchesSearch && matchesBadge;
  });

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="text-[#FFC500]" />
            إدارة الشركات والأنشطة التجارية
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            التحكم الكامل في الشارات المعتمدة (Gold / Blue / Gray)، التوثيق، ترتيب الـ Boost، والإخفاء
          </p>
        </div>

        {/* عرض الشارات كمعاينة سريعة */}
        <div className="flex items-center gap-3 bg-[#0B0F17] p-2 px-3 rounded-xl border border-[#1F2937]">
          <span className="text-[11px] text-[#9CA3AF] font-bold">الشارات المعتمدة:</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-white">
              <YRBadge type="gold" size={16} /> ذهبي
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white">
              <YRBadge type="blue" size={16} /> موثق
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white">
              <YRBadge type="gray" size={16} /> قياسي
            </div>
          </div>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search size={16} className="absolute right-3 top-3.5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="بحث باسم الشركة، المدينة، أو النشاط..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#1F2937] rounded-xl pr-9 pl-4 py-2.5 text-xs text-white focus:border-[#FFC500] outline-none"
          />
        </div>
        <select
          value={filterBadge}
          onChange={(e) => setFilterBadge(e.target.value)}
          className="bg-[#0B0F17] border border-[#1F2937] rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#FFC500] outline-none cursor-pointer"
        >
          <option value="all">جميع الشارات</option>
          <option value="gold">الشارة الذهبية (Gold)</option>
          <option value="blue">الشارة الموثقة (Blue)</option>
          <option value="gray">الشارة القياسية (Gray)</option>
          <option value="none">بدون شارة</option>
        </select>
      </div>

      {/* جدول الشركات مع الشارات الحية */}
      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="py-3.5 px-4">اسم الشركة / المنشأة</th>
                <th className="py-3.5 px-4">المدينة والتصنيف</th>
                <th className="py-3.5 px-4 text-center">الشارة الممنوحة</th>
                <th className="py-3.5 px-4 text-center">نقاط الترويج (Boost)</th>
                <th className="py-3.5 px-4 text-center">حالة الظهور</th>
                <th className="py-3.5 px-4 text-center">إجراءات الإدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white">
              {filteredCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-[#161D2B]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{c.name}</span>
                      <YRBadge type={c.badge} size={18} showTooltip />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#9CA3AF]">
                    {c.city} • <span className="text-[#D1D5DB]">{c.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.badge === 'gold' ? 'bg-[#F5B800]/15 text-[#F5B800]' :
                      c.badge === 'blue' ? 'bg-[#2EA5FF]/15 text-[#2EA5FF]' :
                      c.badge === 'gray' ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-800 text-gray-500'
                    }`}>
                      <YRBadge type={c.badge} size={12} />
                      {c.badge === 'gold' ? 'ذهبية' : c.badge === 'blue' ? 'موثقة' : c.badge === 'gray' ? 'قياسية' : 'بدون'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#16A34A]">
                    +{c.boost} Pts
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {c.isHidden ? (
                      <span className="px-2 py-0.5 rounded bg-[#DC2626]/20 text-[#DC2626] font-bold text-[10px]">مخفية</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] font-bold text-[10px]">نشطة للعامة</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedCompany(c)}
                      className="px-3 py-1.5 rounded-lg bg-[#FFC500] text-black font-bold text-xs hover:bg-[#FFC500]/90 transition-all shadow-md shadow-[#FFC500]/10"
                    >
                      تغيير الشارة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal تغيير الشارة */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F2937] rounded-2xl p-6 w-full max-w-md space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">تعديل شارة التوثيق</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">{selectedCompany.name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#9CA3AF]">اختر الشارة المطلوبة:</label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateBadge(selectedCompany.id, 'gold')}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-right transition-all ${
                    selectedCompany.badge === 'gold' 
                      ? 'border-[#F5B800] bg-[#F5B800]/15 text-[#F5B800]' 
                      : 'border-[#1F2937] bg-[#161D2B] text-white hover:border-[#F5B800]/50'
                  }`}
                >
                  <YRBadge type="gold" size={22} />
                  <div>
                    <div className="font-bold text-xs">الشارة الذهبية</div>
                    <div className="text-[10px] text-[#9CA3AF]">VIP & Premium</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateBadge(selectedCompany.id, 'blue')}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-right transition-all ${
                    selectedCompany.badge === 'blue' 
                      ? 'border-[#2EA5FF] bg-[#2EA5FF]/15 text-[#2EA5FF]' 
                      : 'border-[#1F2937] bg-[#161D2B] text-white hover:border-[#2EA5FF]/50'
                  }`}
                >
                  <YRBadge type="blue" size={22} />
                  <div>
                    <div className="font-bold text-xs">الشارة الزرقاء</div>
                    <div className="text-[10px] text-[#9CA3AF]">توثيق رسمي</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateBadge(selectedCompany.id, 'gray')}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-right transition-all ${
                    selectedCompany.badge === 'gray' 
                      ? 'border-gray-400 bg-gray-500/20 text-gray-300' 
                      : 'border-[#1F2937] bg-[#161D2B] text-white hover:border-gray-500'
                  }`}
                >
                  <YRBadge type="gray" size={22} />
                  <div>
                    <div className="font-bold text-xs">الشارة الرمادية</div>
                    <div className="text-[10px] text-[#9CA3AF]">نشاط قياسي</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateBadge(selectedCompany.id, 'none')}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-right transition-all ${
                    selectedCompany.badge === 'none' 
                      ? 'border-[#DC2626] bg-[#DC2626]/15 text-[#DC2626]' 
                      : 'border-[#1F2937] bg-[#161D2B] text-white hover:border-[#DC2626]/50'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border border-dashed border-gray-500" />
                  <div>
                    <div className="font-bold text-xs">بدون شارة</div>
                    <div className="text-[10px] text-[#9CA3AF]">إلغاء التوثيق</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 rounded-xl bg-[#161D2B] text-white text-xs font-semibold hover:bg-[#1F2937]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
