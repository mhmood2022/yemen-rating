import React from 'react';
import { BarChart3, DollarSign, TrendingUp, Users, Gavel, Home, Megaphone } from 'lucide-react';

export const AnalyticsFinanceManager: React.FC = () => {
  const financialCards = [
    { title: 'إجمالي إيرادات العمولات المحتسبة', value: '$24,850', sub: 'مزادات وعقارات وتوظيف', color: '#16A34A' },
    { title: 'عمولات المزادات (5% المحققة)', value: '$12,400', sub: 'تمت تسويتها بنجاح', color: '#FFC500' },
    { title: 'إيرادات الإعلانات الممولة YR Ads', value: '$8,650', sub: '42 حملة نشطة', color: '#3B82F6' },
    { title: 'عمولات صفقات العقارات والتوظيف', value: '$3,800', sub: 'معاملات مكتملة', color: '#A855F7' },
  ];

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="text-[#FFC500]" />
          التقارير، التحليلات، والمركز المالي
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          متابعة مؤشرات الإيرادات، العمولات السرية المحصلة، نمو الأنشطة والمستخدمين.
        </p>
      </div>

      {/* بطاقات المؤشرات المالية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialCards.map((c, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#0B0F17] border border-[#1F2937] relative overflow-hidden">
            <span className="text-xs text-[#9CA3AF] font-bold block mb-1">{c.title}</span>
            <div className="text-2xl font-black text-white font-mono" style={{ color: c.color }}>
              {c.value}
            </div>
            <span className="text-[10px] text-[#6B7280] mt-1 block">{c.sub}</span>
          </div>
        ))}
      </div>

      {/* تفاصيل التوزيع المالي */}
      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp size={16} className="text-[#FFC500]" /> توزيع مصادر الدخل للمنصة
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-bold text-white mb-1">
              <span>عمولات المزادات (5%)</span>
              <span className="font-mono text-[#FFC500]">50%</span>
            </div>
            <div className="w-full bg-[#161D2B] h-2 rounded-full overflow-hidden">
              <div className="bg-[#FFC500] h-full rounded-full" style={{ width: '50%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-white mb-1">
              <span>الحملات الإعلانية YR Ads</span>
              <span className="font-mono text-[#3B82F6]">35%</span>
            </div>
            <div className="w-full bg-[#161D2B] h-2 rounded-full overflow-hidden">
              <div className="bg-[#3B82F6] h-full rounded-full" style={{ width: '35%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-white mb-1">
              <span>عمولات العقارات والتوظيف الثابتة</span>
              <span className="font-mono text-[#16A34A]">15%</span>
            </div>
            <div className="w-full bg-[#161D2B] h-2 rounded-full overflow-hidden">
              <div className="bg-[#16A34A] h-full rounded-full" style={{ width: '15%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
