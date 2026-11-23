import React, { useCallback, useEffect, useState } from 'react';
import { PageDetailBundle, PageSummaryRow } from '../../../types/adminAccountsPages';
import { fetchPageDetailBundle } from '../../../services/pagesAdminService';
import { BadgePill, PageKindPill, PageStatusPill } from '../../../components/admin/accounts-pages/SharedAdminUI';
import { toArabicErrorMessage, useAdminFeedback, useBackClose } from '../../../components/admin/accounts-pages/AndroidAdminKit';
import { PageTabsInfoAndTeam } from './PageTabsInfoAndTeam';
import { PageTabsBusinessOps } from './PageTabsBusinessOps';
import {
  X, RefreshCw, Info, Users, FileText, Heart, Star,
  ShieldCheck, CreditCard, Megaphone, Flag, History, ExternalLink,
} from 'lucide-react';

interface Props {
  page: PageSummaryRow;
  canEdit: boolean;
  canViewPrivate: boolean;
  initialTab?: (typeof TABS)[number]['id'];
  onClose: () => void;
  onGlobalRefresh: () => Promise<void>;
  onToast?: (msg: string, type?: 'success' | 'error') => void;
}

const TABS = [
  { id: 'info', label: 'المعلومات', icon: Info },
  { id: 'ownership', label: 'الملكية والربط', icon: Users },
  { id: 'content', label: 'المنشورات', icon: FileText },
  { id: 'followers', label: 'المتابعون', icon: Heart },
  { id: 'reviews', label: 'التقييمات', icon: Star },
  { id: 'verification', label: 'التوثيق', icon: ShieldCheck },
  { id: 'subscriptions', label: 'الاشتراكات', icon: CreditCard },
  { id: 'ads', label: 'الإعلانات', icon: Megaphone },
  { id: 'reports_support', label: 'البلاغات والدعم', icon: Flag },
  { id: 'logs', label: 'السجل', icon: History },
] as const;

export const PageDetailModal: React.FC<Props> = ({
  page,
  canEdit,
  canViewPrivate,
  initialTab = 'info',
  onClose,
  onGlobalRefresh,
  onToast,
}) => {
  const feedback = useAdminFeedback();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>(initialTab);
  const [bundle, setBundle] = useState<PageDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);

  useBackClose(true, onClose);

  const notify = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      if (type === 'error') feedback.showError(msg);
      else feedback.showSuccess(msg);
      onToast?.(msg, type);
    },
    [feedback, onToast]
  );

  const loadBundle = useCallback(async () => {
    setLoading(true);
    try {
      setBundle(await fetchPageDetailBundle(page));
    } catch (e) {
      notify(toArabicErrorMessage(e, 'تعذر تحميل تفاصيل الصفحة'), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, notify]);

  useEffect(() => {
    loadBundle();
  }, [loadBundle]);

  const handleRefreshAll = async () => {
    await loadBundle();
    await onGlobalRefresh();
  };

  return (
    <div
      className="fixed inset-0 z-[170] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-5xl max-h-[94dvh] bg-[#181B20] border-t sm:border border-[#2F343D] rounded-t-md sm:rounded flex flex-col overflow-hidden text-white"
      >
        <div className="w-10 h-1 bg-[#3A404B] rounded-full mx-auto mt-2 sm:hidden shrink-0" />
        <div className="relative h-24 bg-[#14171C] border-b border-[#2A2E35] shrink-0">
          {page.cover_url && <img src={page.cover_url} alt="" className="w-full h-full object-cover opacity-45" />}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <a
              href={`/business-page/${page.id}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded bg-[#181B20]/90 border border-[#2F343D] text-[#FFC500] hover:bg-[#232830]"
              title="فتح الصفحة"
            >
              <ExternalLink size={15} />
            </a>
            <button
              type="button"
              onClick={handleRefreshAll}
              className="p-2 rounded bg-[#181B20]/90 border border-[#2F343D] text-zinc-200 hover:bg-[#232830] cursor-pointer"
              title="تحديث"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#FFC500]' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded bg-[#181B20]/90 border border-[#2F343D] text-zinc-200 hover:bg-[#232830] cursor-pointer"
              title="إغلاق"
            >
              <X size={16} />
            </button>
          </div>
          <div className="absolute -bottom-6 right-4 flex items-end gap-3">
            <div className="w-14 h-14 rounded border-2 border-[#181B20] bg-[#14171C] overflow-hidden flex items-center justify-center font-black text-[#FFC500] text-lg shrink-0">
              {page.logo_url ? <img src={page.logo_url} alt="" className="w-full h-full object-cover" /> : (page.name?.[0] || 'ص')}
            </div>
            <div className="pb-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white truncate max-w-[200px] sm:max-w-md">{page.name}</h3>
                <BadgePill badge={page.badge_type} />
                <PageKindPill kind={page.page_kind} />
                <PageStatusPill status={page.status} />
              </div>
              <p className="text-[11px] text-[#9CA3AF]" dir="ltr">@{page.slug || page.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        <div className="pt-8 px-3 border-b border-[#2A2E35] bg-[#14171C] flex gap-1 overflow-x-auto no-scrollbar shrink-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  active ? 'text-[#FFC500]' : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{t.label}</span>
                {active && <span className="absolute bottom-0 right-2 left-2 h-0.5 bg-[#FFC500]" />}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#121417]">
          {loading || !bundle ? (
            <div className="py-16 text-center text-xs text-[#9CA3AF]">جارٍ تحميل تفاصيل الصفحة...</div>
          ) : (
            <>
              {['info', 'ownership', 'content', 'followers'].includes(activeTab) ? (
                <PageTabsInfoAndTeam
                  tab={activeTab as any}
                  bundle={bundle}
                  canEdit={canEdit}
                  canViewPrivate={canViewPrivate}
                  onRefresh={handleRefreshAll}
                  onToast={notify}
                />
              ) : (
                <PageTabsBusinessOps
                  tab={activeTab as any}
                  bundle={bundle}
                  canEdit={canEdit}
                  onRefresh={handleRefreshAll}
                  onToast={notify}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
