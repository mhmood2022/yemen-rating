import React, { useCallback, useEffect, useState } from 'react';
import { PageDetailBundle, PageSummaryRow } from '../../../types/adminAccountsPages';
import { fetchPageDetailBundle } from '../../../services/pagesAdminService';
import { BadgePill, PageKindPill, PageStatusPill } from '../../../components/admin/accounts-pages/SharedAdminUI';
import { PageTabsInfoAndTeam } from './PageTabsInfoAndTeam';
import { PageTabsBusinessOps } from './PageTabsBusinessOps';
import { X, RefreshCw, Info, Users, FileText, Heart, Star, ShieldCheck, CreditCard, Megaphone, Flag, History, ExternalLink } from 'lucide-react';
interface Props { page: PageSummaryRow; canEdit: boolean; canViewPrivate: boolean; onClose: () => void; onGlobalRefresh: () => Promise<void>; onToast: (msg: string, type?: 'success' | 'error') => void; }
const TABS = [
  { id: 'info', label: 'أ. المعلومات', icon: Info }, { id: 'ownership', label: 'ب. الملكية', icon: Users },
  { id: 'content', label: 'ج. المنشورات', icon: FileText }, { id: 'followers', label: 'د. المتابعون', icon: Heart },
  { id: 'reviews', label: 'هـ. التقييمات', icon: Star }, { id: 'verification', label: 'و. التوثيق', icon: ShieldCheck },
  { id: 'subscriptions', label: 'ز. الاشتراكات', icon: CreditCard }, { id: 'ads', label: 'ح. الإعلانات', icon: Megaphone },
  { id: 'reports_support', label: 'ط. البلاغات والدعم', icon: Flag }, { id: 'logs', label: 'ي. السجل', icon: History },
] as const;
export const PageDetailModal: React.FC<Props> = ({ page, canEdit, canViewPrivate, onClose, onGlobalRefresh, onToast }) => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('info');
  const [bundle, setBundle] = useState<PageDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const loadBundle = useCallback(async () => {
    setLoading(true);
    try { setBundle(await fetchPageDetailBundle(page)); }
    catch (e: any) { onToast(e?.message || 'تعذر التحميل', 'error'); }
    finally { setLoading(false); }
  }, [page, onToast]);
  useEffect(() => { loadBundle(); }, [loadBundle]);
  const handleRefreshAll = async () => { await loadBundle(); await onGlobalRefresh(); };
  return (
    <div className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-2 sm:p-4" dir="rtl" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl max-h-[92vh] bg-black border border-[#2F3336] rounded-2xl flex flex-col overflow-hidden">
        <div className="relative h-24 bg-[#0B0B0B] border-b border-[#2F3336] shrink-0">
          {page.cover_url && <img src={page.cover_url} alt="" className="w-full h-full object-cover opacity-50" />}
          <div className="absolute top-3 left-3 flex gap-2">
            <a href={`/business-page/${page.id}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-black/80 border border-[#2F3336] text-[#FFC500]"><ExternalLink size={15} /></a>
            <button type="button" onClick={handleRefreshAll} className="p-2 rounded-xl bg-black/80 border border-[#2F3336] text-zinc-300 cursor-pointer"><RefreshCw size={15} /></button>
            <button type="button" onClick={onClose} className="p-2 rounded-xl bg-black/80 border border-[#2F3336] text-zinc-300 cursor-pointer"><X size={16} /></button>
          </div>
          <div className="absolute -bottom-6 right-5 flex items-end gap-3">
            <div className="w-16 h-16 rounded-2xl border-2 border-black bg-[#111] overflow-hidden flex items-center justify-center font-black text-[#FFC500] text-xl">{page.logo_url ? <img src={page.logo_url} alt="" className="w-full h-full object-cover" /> : page.name[0]}</div>
            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm sm:text-base font-black text-white">{page.name}</h3><BadgePill badge={page.badge_type} /><PageKindPill kind={page.page_kind} /><PageStatusPill status={page.status} /></div>
              <p className="text-xs text-[#71767B]" dir="ltr">@{page.slug || page.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>
        <div className="pt-8 px-4 pb-2 border-b border-[#2F3336] flex gap-1.5 overflow-x-auto shrink-0">
          {TABS.map((t) => { const Icon = t.icon; return (<button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${activeTab === t.id ? 'bg-[#FFC500] text-black' : 'bg-[#111] text-zinc-400 hover:text-white'}`}><Icon size={13} /><span>{t.label}</span></button>); })}
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading || !bundle ? <div className="py-16 text-center text-xs text-[#71767B]">جاري التحميل...</div> : (
            <>{['info', 'ownership', 'content', 'followers'].includes(activeTab) ? <PageTabsInfoAndTeam tab={activeTab as any} bundle={bundle} canEdit={canEdit} canViewPrivate={canViewPrivate} onRefresh={handleRefreshAll} onToast={onToast} /> : <PageTabsBusinessOps tab={activeTab as any} bundle={bundle} canEdit={canEdit} onRefresh={handleRefreshAll} onToast={onToast} />}</>
          )}
        </div>
      </div>
    </div>
  );
};
