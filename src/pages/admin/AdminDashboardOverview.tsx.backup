import React from 'react';
import { Building2, Gavel, Home, Coins, ShieldCheck, Megaphone } from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
  const stats = [
    { title: 'إجمالي الشركات', value: '1,420', change: '+12%', icon: Building2, color: '#FFC500' },
    { title: 'المزادات النشطة', value: '28', change: '5% عمولة محتسبة', icon: Gavel, color: '#16A34A' },
    { title: 'العقارات المعروضة', value: '315', change: 'بيانات التواصل محمية', icon: Home, color: '#3B82F6' },
    { title: 'طلبات التوثيق', value: '14 معلق', change: 'يتطلب مراجعة', icon: ShieldCheck, color: '#F59E0B' },
    { title: 'الحملات الإعلانية YR', value: '42 حملة', change: '10 مواضع نشطة', icon: Megaphone, color: '#EC4899' },
    { title: 'أسعار الصرف والذهب', value: 'مُحدّث الآن', change: 'YER / SAR / USD', icon: Coins, color: '#EAB308' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">نظرة عامة على المنصة</h2>
        <p className="text-[#9CA3AF] text-xs mt-1">مؤشرات الأداء المباشرة لمنصة Yemen Rating</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-5 rounded-xl bg-[#0B0F17] border border-[#1F2937] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF] text-xs font-semibold">{stat.title}</p>
                  <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
                  <span className="text-[11px] font-medium text-[#FFC500] mt-2 block">{stat.change}</span>
                </div>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[#161D2B] border border-[#1F2937] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
          <div>
            <h4 className="text-sm font-bold text-white">Audit Log & Permissions</h4>
            <p className="text-[#9CA3AF] text-xs">جميع الإجراءات الحساسة (العمولات، التوثيق، كشف الأرقام) مسجلة ومحمية بـ RLS.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
