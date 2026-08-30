import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Megaphone, Plus, Sparkles, Play, Pause, Archive, Eye, MousePointer, Target } from 'lucide-react';

export const AdsManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState([
    {
      id: 'CAMP-01',
      title: 'حملة بن محفوظ — تدشين الفرع الجديد',
      placement: 'الهيدر الرئيسي (Top Banner)',
      cityTarget: 'صنعاء • عدن',
      budget: '$650',
      views: '45,200',
      clicks: '3,840',
      ctr: '8.5%',
      status: 'active',
      startDate: '2026-08-01',
      endDate: '2026-09-01'
    },
    {
      id: 'CAMP-02',
      title: 'عروض عقارات المكلا الصيفية',
      placement: 'أعلى صفحات الشركات (Company Top)',
      cityTarget: 'حضرموت - المكلا',
      budget: '$400',
      views: '28,100',
      clicks: '1,950',
      ctr: '6.9%',
      status: 'active',
      startDate: '2026-08-10',
      endDate: '2026-08-30'
    },
    {
      id: 'CAMP-03',
      title: 'مهرجان الهواتف الذكية وتخفيضات العيد',
      placement: 'بين أقسام الرئيسية (In-Feed Main)',
      cityTarget: 'كل المحافظات',
      budget: '$900',
      views: '89,400',
      clicks: '7,120',
      ctr: '7.9%',
      status: 'paused',
      startDate: '2026-07-15',
      endDate: '2026-08-15'
    }
  ]);

  const toggleCampaignStatus = (id: string, newStatus: 'active' | 'paused' | 'archived') => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Megaphone className="text-[#FFC500]" />
            إدارة الحملات الإعلانية (YR Ads Directory)
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            متابعة أداء الحملات الممولة، المشاهدات، النقرات، الاستهداف الجغرافي، والتحكم بالحالة.
          </p>
        </div>

        <NavLink
          to="/admin/ads/generator"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/10"
        >
          <Sparkles size={16} />
          <span>فتح مولد الإعلانات (YR Studio)</span>
        </NavLink>
      </div>

      {/* ملخص إحصائيات الإعلانات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-xs text-[#9CA3AF]">الحملات النشطة</span>
          <h3 className="text-2xl font-black text-white mt-1">18 حملة</h3>
          <span className="text-[10px] text-[#16A34A] font-bold">10 مواضع مستهدفة</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-xs text-[#9CA3AF]">إجمالي المشاهدات (Impressions)</span>
          <h3 className="text-2xl font-black text-[#FFC500] mt-1">162.7K</h3>
          <span className="text-[10px] text-[#9CA3AF]">خلال 30 يوم</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-xs text-[#9CA3AF]">إجمالي النقرات (Clicks)</span>
          <h3 className="text-2xl font-black text-[#3B82F6] mt-1">12.9K</h3>
          <span className="text-[10px] text-[#3B82F6] font-bold">متوسط CTR 7.9%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#1F2937]">
          <span className="text-xs text-[#9CA3AF]">إجمالي ميزانية الإعلانات</span>
          <h3 className="text-2xl font-black text-[#16A34A] mt-1">$8,650</h3>
          <span className="text-[10px] text-[#9CA3AF]">عوائد YR Ads</span>
        </div>
      </div>

      {/* جدول الحملات */}
      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="py-3.5 px-4">عنوان الحملة والموضع</th>
                <th className="py-3.5 px-4">الاستهداف</th>
                <th className="py-3.5 px-4">الميزانية</th>
                <th className="py-3.5 px-4 text-center">المشاهدات / النقرات</th>
                <th className="py-3.5 px-4 text-center">معدل CTR</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[#161D2B]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{c.title}</div>
                    <div className="text-[10px] text-[#FFC500]">{c.placement}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#9CA3AF] flex items-center gap-1 mt-2">
                    <Target size={13} className="text-[#FFC500]" /> {c.cityTarget}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#16A34A]">{c.budget}</td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <div className="text-white font-bold">{c.views} مشاهدة</div>
                    <div className="text-[10px] text-[#3B82F6]">{c.clicks} نقرة</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#FFC500]">{c.ctr}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'active' ? 'bg-[#16A34A]/20 text-[#16A34A]' :
                      c.status === 'paused' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {c.status === 'active' ? 'نشطة' : c.status === 'paused' ? 'متوقفة مؤقتاً' : 'مؤرشفة'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {c.status === 'active' ? (
                        <button
                          onClick={() => toggleCampaignStatus(c.id, 'paused')}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          title="إيقاف مؤقت"
                        >
                          <Pause size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleCampaignStatus(c.id, 'active')}
                          className="p-1.5 rounded-lg bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20"
                          title="استئناف الحملة"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => toggleCampaignStatus(c.id, 'archived')}
                        className="p-1.5 rounded-lg bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20"
                        title="أرشفة"
                      >
                        <Archive size={14} />
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
