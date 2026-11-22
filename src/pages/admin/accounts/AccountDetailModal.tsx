import React, { useEffect, useState, useCallback } from 'react';
import { AccountDetailBundle, AccountSummaryRow } from '../../../types/adminAccountsPages';
import { fetchAccountDetailBundle } from '../../../services/accountsAdminService';
import { AccountKindPill, AccountStatusPill, BadgePill } from '../../../components/admin/accounts-pages/SharedAdminUI';
import { AccountTabsPrimary } from './AccountTabsPrimary';
import { AccountTabsModeration } from './AccountTabsModeration';
import { X, RefreshCw, User, Activity, ShieldCheck, CreditCard, Megaphone, Flag, Headphones, History } from 'lucide-react';

interface Props {
  account: AccountSummaryRow;
  canEdit: boolean;
  canViewPrivate: boolean;
  onClose: () => void;
  onGlobalRefresh: () => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

const TABS = [
  { id: 'info', label: 'أ. المعلومات الأساسية', icon: User },
  { id: 'activity', label: 'ب. النشاط والمجتمع', icon: Activity },
  { id: 'verification', label: 'ج. التوثيق والشارات', icon: ShieldCheck },
  { id: 'subscriptions', label: 'د. الاشتراكات والمدفوعات', icon: CreditCard },
  { id: 'ads', label: 'هـ. الإعلانات', icon: Megaphone },
  { id: 'reports', label: 'و. البلاغات', icon: Flag },
  { id: 'support', label: 'ز. الدعم والشكاوى', icon: Headphones },
  { id: 'logs', label: 'ح. المخالفات والإجراءات', icon: History },
] as const;

export const AccountDetailModal: React.FC<Props> = ({
  account, canEdit, canViewPrivate, onClose, onGlobalRefresh, onToast,
}) => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('info');
  const [bundle, setBundle] = useState<AccountDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBundle = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAccountDetailBundle(account);
      setBundle(data);
    } catch (e: any) {
      onToast(e?.message || 'تعذر تحميل تفاصيل الحساب', 'error');
    } finally {
      setLoading(false);
    }
  }, [account, onToast]);

  useEffect(() => { loadBundle(); }, [loadBundle]);
  const handleRefreshAll = async () => { await loadBundle(); await onGlobalRefresh(); };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-2 sm:p-4" dir="rtl" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl max-h-[92vh] bg-black border border-[#2F3336] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="relative h-24 bg-gradient-to-l from-[#111] via-[#0B0B0B] to-black border-b border-[#2F3336] shrink-0">
          {account.cover_url && <img src={account.cover_url} alt="" className="w-full h-full object-cover opacity-50" />}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <button type="button" onClick={handleRefreshAll} className="p-2 rounded-xl bg-black/80 border border-[#2F3336] text-zinc-300 hover:text-white cursor-pointer" title="تحديث"><RefreshCw size={15} /></button>
            <button type="button" onClick={onClose} className="p-2 rounded-xl bg-black/80 border border-[#2F3336] text-zinc-300 hover:text-white cursor-pointer" title="إغلاق"><X size={16} /></button>
          </div>
          <div className="absolute -bottom-6 right-5 flex items-end gap-3">
            <div className="w-16 h-16 rounded-2xl border-2 border-black bg-[#111] overflow-hidden flex items-center justify-center font-black text-[#FFC500] text-xl">
              {account.avatar_url ? <img src={account.avatar_url} alt="" className="w-full h-full object-cover" /> : account.full_name[0]}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white">{account.full_name}</h3>
                <BadgePill badge={account.badge_type} />
                <AccountKindPill kind={account.profile_kind} />
                <AccountStatusPill status={account.moderation_status} />
              </div>
              <p className="text-xs text-[#71767B]" dir="ltr">@{account.username}</p>
            </div>
          </div>
        </div>
        <div className="pt-8 px-4 pb-2 border-b border-[#2F3336] flex gap-1.5 overflow-x-auto shrink-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${active ? 'bg-[#FFC500] text-black' : 'bg-[#111] text-zinc-400 hover:text-white'}`}>
                <Icon size={13} /><span>{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading || !bundle ? <div className="py-16 text-center text-xs text-[#71767B]">جاري تحميل الملف الإداري الكامل للحساب...</div> : (
            <>
              {(activeTab === 'info' || activeTab === 'activity' || activeTab === 'verification' || activeTab === 'subscriptions') && (
                <AccountTabsPrimary tab={activeTab} bundle={bundle} canEdit={canEdit} canViewPrivate={canViewPrivate} onRefresh={handleRefreshAll} onToast={onToast} />
              )}
              {(activeTab === 'ads' || activeTab === 'reports' || activeTab === 'support' || activeTab === 'logs') && (
                <AccountTabsModeration tab={activeTab} bundle={bundle} canEdit={canEdit} onRefresh={handleRefreshAll} onToast={onToast} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
