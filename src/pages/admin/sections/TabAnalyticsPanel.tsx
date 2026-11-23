import React, { useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Eye, Heart, Megaphone, Layers, Sparkles, MessageSquare, AlertTriangle } from 'lucide-react';
import type { CommunitySection } from '../../../services/sectionsService';
import { AdminSelect, toArabicErrorMessage, useAdminFeedback } from '../../../components/admin/accounts-pages/AndroidAdminKit';
import { fetchUnifiedTabsAnalytics, type UnifiedTabsAnalytics } from '../../../services/communityTabsAdminService';

interface TabAnalyticsPanelProps {
  sections: CommunitySection[];
}

export const TabAnalyticsPanel: React.FC<TabAnalyticsPanelProps> = ({ sections }) => {
  const [sectionId, setSectionId] = useState<string>('all');
  const [periodDays, setPeriodDays] = useState<'7' | '30' | '90' | 'all'>('30');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<UnifiedTabsAnalytics | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchUnifiedTabsAnalytics(sections, { sectionId, periodDays });
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [sectionId, periodDays, sections.length]);

  return (
    <div className="space-y-4">
      <div className="bg-[#0B0B0B] border border-[#2F3336] rounded p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-black text-white">
          <BarChart3 size={16} className="text-[#FFC500]" />
          <span>إحصائيات التبويبات الفعلية (بيانات حية من القاعدة)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[150px]"><AdminSelect compact title="التبويب" value={sectionId} onChange={setSectionId} options={[{ value: 'all', label: 'جميع التبويبات' }, { value: 'community', label: 'المجتمع العام' }, ...sections.filter((s) => !s.isArchived).map((s) => ({ value: s.id, label: s.label }))]} /></div>

          <div className="min-w-[130px]"><AdminSelect compact title="الفترة" value={String(periodDays)} onChange={(v) => setPeriodDays(v as any)} options={[{ value: '7', label: 'آخر 7 أيام' }, { value: '30', label: 'آخر 30 يوماً' }, { value: '90', label: 'آخر 90 يوماً' }, { value: 'all', label: 'كل الفترات' }]} /></div>

          <button
            type="button"
            onClick={loadAnalytics}
            disabled={loading}
            className="px-3 py-1.5 rounded bg-black border border-[#2F3336] hover:border-white text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {loading || !analytics ? (
        <div className="py-12 text-center text-xs text-[#71767B] bg-[#0B0B0B] border border-[#2F3336] rounded">
          جارِ احتساب الإحصائيات الفعلية...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              { label: 'إجمالي المنشورات', val: analytics.totalPosts, icon: Layers, cls: 'text-white' },
              { label: 'المنشورات المجانية', val: analytics.freePosts, icon: MessageSquare, cls: 'text-sky-400' },
              { label: 'إعلانات متخصصة', val: analytics.specializedPosts, icon: Sparkles, cls: 'text-[#FFC500]' },
              { label: 'المشاهدات', val: analytics.totalViews, icon: Eye, cls: 'text-emerald-400' },
              { label: 'التفاعلات', val: analytics.totalInteractions, icon: Heart, cls: 'text-rose-400' },
              { label: 'الإعلانات النشطة', val: analytics.activeAdsCount, icon: Megaphone, cls: 'text-amber-300' },
              { label: 'بلاغات معلقة', val: analytics.pendingReportsCount, icon: AlertTriangle, cls: 'text-red-400' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-[#0B0B0B] border border-[#2F3336] rounded p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#71767B] font-bold">
                    <span>{card.label}</span>
                    <Icon size={13} className={card.cls} />
                  </div>
                  <div className={`text-lg font-black ${card.cls}`}>{card.val.toLocaleString()}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#0B0B0B] border border-[#2F3336] rounded overflow-x-auto">
            <table className="w-full text-right text-xs min-w-[620px]">
              <thead className="bg-black text-[#71767B] border-b border-[#2F3336]">
                <tr>
                  <th className="py-3 px-3">التبويب / القسم</th>
                  <th className="py-3 px-3 text-center">إجمالي المنشورات</th>
                  <th className="py-3 px-3 text-center">المجانية</th>
                  <th className="py-3 px-3 text-center">المتخصصة المدفوعة</th>
                  <th className="py-3 px-3 text-center">المشاهدات</th>
                  <th className="py-3 px-3 text-center">التفاعلات</th>
                  <th className="py-3 px-3 text-center">الإعلانات النشطة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2F3336] text-white">
                {analytics.perTab.map((row) => (
                  <tr key={row.sectionId} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-bold">{row.label}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{row.totalPosts.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-sky-400">{row.freePosts.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#FFC500]">{row.specializedPosts.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400">{row.views.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-rose-400">{row.interactions.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-300">{row.activeAds.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
