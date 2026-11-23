import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccountSummaryRow,
  AccountsDashboardStats,
  LinkedPageBrief,
  PeriodPreset,
} from '../../../types/adminAccountsPages';
import { fetchAccountsDashboardData } from '../../../services/accountsAdminService';
import {
  fetchPagesPickerList,
  managePageAdminRpc,
  PagePickerItem,
  transferPageOwnershipRpc,
  unlinkPageOwner,
} from '../../../services/pagesAdminService';
import { getAccess, AccessInfo } from '../../../lib/access';
import { supabase } from '../../../lib/supabase';
import {
  AccountKindPill,
  AccountStatusPill,
  AdsCoveragePill,
  BadgePill,
  formatDateAr,
  PeriodFilterBar,
  PageStatusPill,
  StatMiniCard,
  SubCyclePill,
  SubStatusPill,
} from '../../../components/admin/accounts-pages/SharedAdminUI';
import {
  AdminButton,
  AdminConfirmDialog,
  AdminSelect,
  AdminSheetModal,
  toArabicErrorMessage,
  useAdminFeedback,
  useBackClose,
  useSectionViewState,
} from '../../../components/admin/accounts-pages/AndroidAdminKit';
import { AccountDetailModal } from './AccountDetailModal';
import {
  Users, UserPlus, UserCheck, UserX, ShieldCheck, CreditCard,
  Clock, Ban, Flag, Search, RefreshCw, Columns3, Eye, ChevronRight, ChevronLeft, Link2, Unlink,
} from 'lucide-react';

const ALL_COLUMNS = [
  { id: 'account', label: 'الحساب' },
  { id: 'kind', label: 'نوع الحساب' },
  { id: 'linked', label: 'الصفحات المرتبطة' },
  { id: 'followers', label: 'المتابعون' },
  { id: 'following', label: 'يتابع' },
  { id: 'posts', label: 'المنشورات' },
  { id: 'comments', label: 'التعليقات' },
  { id: 'likes', label: 'الإعجابات (على منشوراته)' },
  { id: 'badge', label: 'التوثيق' },
  { id: 'sub', label: 'الاشتراك' },
  { id: 'sub_status', label: 'حالة الاشتراك' },
  { id: 'ads', label: 'الإعلانات' },
  { id: 'reports', label: 'البلاغات (له/عليه)' },
  { id: 'support', label: 'الدعم' },
  { id: 'joined', label: 'تاريخ الانضمام' },
  { id: 'last_act', label: 'آخر نشاط' },
  { id: 'status', label: 'الحالة' },
  { id: 'details', label: 'التفاصيل' },
] as const;

export const AccountsManager: React.FC = () => {
  const { showSuccess, showError, showWarning } = useAdminFeedback();
  const [rows, setRows] = useState<AccountSummaryRow[]>([]);
  const [stats, setStats] = useState<AccountsDashboardStats | null>(null);
  const [pagesList, setPagesList] = useState<PagePickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessInfo | null>(null);
  const [hasSupabaseSession, setHasSupabaseSession] = useState(true);

  const [view, patchView] = useSectionViewState(
    'yr_admin_accounts_view_v2',
    {
      period: '30d' as PeriodPreset,
      customFrom: '',
      customTo: '',
      search: '',
      kindFilter: 'all',
      badgeFilter: 'all',
      subFilter: 'all',
      subStatusFilter: 'all',
      statusFilter: 'all',
      sortBy: 'newest' as 'newest' | 'oldest' | 'followers' | 'posts' | 'reports' | 'activity',
      page: 1,
    },
    { ready: !loading }
  );
  const { period, customFrom, customTo, search, kindFilter, badgeFilter, subFilter, subStatusFilter, statusFilter, sortBy, page } = view;
  const setPeriod = (v: PeriodPreset) => patchView({ period: v, page: 1 });
  const setCustomFrom = (v: string) => patchView({ customFrom: v });
  const setCustomTo = (v: string) => patchView({ customTo: v });
  const setSearch = (v: string) => patchView({ search: v, page: 1 });
  const setKindFilter = (v: string) => patchView({ kindFilter: v, page: 1 });
  const setBadgeFilter = (v: string) => patchView({ badgeFilter: v, page: 1 });
  const setSubFilter = (v: string) => patchView({ subFilter: v, page: 1 });
  const setSubStatusFilter = (v: string) => patchView({ subStatusFilter: v, page: 1 });
  const setStatusFilter = (v: string) => patchView({ statusFilter: v, page: 1 });
  const setSortBy = (v: any) => patchView({ sortBy: v });
  const setPage = (updater: number | ((prev: number) => number)) => {
    const next = typeof updater === 'function' ? updater(page) : updater;
    patchView({ page: next });
  };

  const pageSize = 15;
  const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS.map((c) => c.id));
  const [colsOpen, setColsOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  useBackClose(colsOpen, () => setColsOpen(false));

  const [linkAccountId, setLinkAccountId] = useState<string | null>(null);
  const [pageQuery, setPageQuery] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [linkMode, setLinkMode] = useState<'owner' | 'admin' | 'editor' | 'moderator'>('owner');
  const [confirmCfg, setConfirmCfg] = useState<{
    open: boolean; title: string; description: string; confirmLabel: string; variant: 'danger' | 'warning'; requireReason?: boolean; onConfirm: (reason: string) => Promise<void>;
  } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') showError(msg);
    else showSuccess(msg);
  }, [showError, showSuccess]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, sessRes, res, picker] = await Promise.all([
        getAccess(),
        supabase.auth.getSession(),
        fetchAccountsDashboardData(period, customFrom, customTo),
        fetchPagesPickerList(),
      ]);
      setAccess(acc);
      setHasSupabaseSession(Boolean(sessRes.data?.session?.user));
      setRows(res.rows);
      setStats(res.stats);
      setPagesList(picker);
    } catch (e: any) {
      showError(toArabicErrorMessage(e, 'تعذر تحميل بيانات الحسابات'), () => loadData());
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo, showError]);

  useEffect(() => { loadData(); }, [loadData]);
  const canEdit = Boolean(access && (access.role === 'super_admin' || access.role === 'admin' || access.can('users.edit')));
  const canViewPrivate = Boolean(access && (access.role === 'super_admin' || access.role === 'admin' || access.can('users.edit')));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && ![r.full_name, r.username, r.email, r.phone, r.id].some((v) => String(v || '').toLowerCase().includes(q))) return false;
      if (kindFilter !== 'all' && r.profile_kind !== kindFilter) return false;
      if (badgeFilter !== 'all' && r.badge_type !== badgeFilter) return false;
      if (subFilter !== 'all' && r.subscription_cycle !== subFilter) return false;
      if (subStatusFilter !== 'all' && r.subscription_status !== subStatusFilter) return false;
      if (statusFilter !== 'all' && r.moderation_status !== statusFilter) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'followers') return b.followers_count - a.followers_count;
      if (sortBy === 'posts') return b.posts_count - a.posts_count;
      if (sortBy === 'reports') return b.reports_received_count - a.reports_received_count;
      if (sortBy === 'activity') return new Date(b.last_activity_at || 0).getTime() - new Date(a.last_activity_at || 0).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [rows, search, kindFilter, badgeFilter, subFilter, subStatusFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  const selectedAccount = useMemo(() => rows.find((r) => r.id === selectedAccountId) || null, [rows, selectedAccountId]);
  const showCol = (id: string) => visibleCols.includes(id);
  return (
    <div dir="rtl" className="space-y-5 text-white font-['Cairo',sans-serif]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-[#FFC500]" size={22} /> إدارة الحسابات الشخصية
          </h1>
          <p className="text-xs text-[#71767B] mt-0.5">مركز رقابة وإدارة لجميع الحسابات الشخصية في منصة يمن ريتنج وربطها بصفحاتها</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilterBar period={period} onPeriodChange={setPeriod} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} />
          <button type="button" onClick={loadData} className="px-3 py-2 rounded bg-black border border-[#2F3336] hover:border-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#FFC500]' : 'text-[#FFC500]'} /><span>تحديث</span>
          </button>
        </div>
      </div>

      {!hasSupabaseSession && (
        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          ملاحظة أمنية: تم التحقق عبر جلسة محلية فقط. لتنفيذ الإجراءات الحساسة المحمية على خادم Supabase، يلزم الدخول بحساب المشرف عبر Google.
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2.5">
          <StatMiniCard label="إجمالي الحسابات" value={stats.total} icon={<Users size={15} />} />
          <StatMiniCard label="الحسابات الجديدة" value={stats.newInPeriod} icon={<UserPlus size={15} />} growthPct={stats.growthPct} subText={`السابقة: ${stats.prevPeriodNew}`} />
          <StatMiniCard label="الحسابات النشطة" value={stats.active} icon={<UserCheck size={15} />} accent="text-emerald-400" />
          <StatMiniCard label="غير النشطة" value={stats.inactive} icon={<UserX size={15} />} />
          <StatMiniCard label="الموثقة" value={stats.verified} icon={<ShieldCheck size={15} />} accent="text-sky-400" />
          <StatMiniCard label="المشتركة" value={stats.subscribed} icon={<CreditCard size={15} />} accent="text-[#FFC500]" />
          <StatMiniCard label="اشتراكات منتهية" value={stats.expiredSubscriptions} icon={<Clock size={15} />} accent="text-amber-400" />
          <StatMiniCard label="موقوفة/محظورة" value={stats.suspendedOrBanned} icon={<Ban size={15} />} accent="text-rose-400" />
          <StatMiniCard label="عليها بلاغات" value={stats.withReports} icon={<Flag size={15} />} accent="text-rose-300" />
        </div>
      )}
      <div className="bg-black border border-[#2F3336] rounded p-3.5 space-y-3">
        <div className="flex flex-col lg:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-2.5 text-[#71767B]" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث فوري بالاسم، @اسم_المستخدم، الهاتف، البريد، أو المعرف..."
              className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded pr-9 pl-3 py-2 text-xs text-white outline-none caret-white placeholder-[#71767B]" />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="min-w-[115px]"><AdminSelect compact title="النوع" value={kindFilter} onChange={setKindFilter} options={[{ value: 'all', label: 'كل الأنواع' }, { value: 'personal', label: 'شخصي' }, { value: 'business_owner', label: 'صاحب منشأة' }, { value: 'businessman', label: 'رجل أعمال' }]} /></div>
            <div className="min-w-[115px]"><AdminSelect compact title="التوثيق" value={badgeFilter} onChange={setBadgeFilter} options={[{ value: 'all', label: 'كل التوثيق' }, { value: 'blue', label: 'أزرق' }, { value: 'silver', label: 'فضي' }, { value: 'gold', label: 'ذهبي' }, { value: 'none', label: 'بدون' }]} /></div>
            <div className="min-w-[125px]"><AdminSelect compact title="الاشتراك" value={subFilter} onChange={setSubFilter} options={[{ value: 'all', label: 'كل الاشتراكات' }, { value: 'free', label: 'مجاني' }, { value: 'monthly', label: 'شهري' }, { value: 'yearly', label: 'سنوي' }]} /></div>
            <div className="min-w-[120px]"><AdminSelect compact title="حالة الاشتراك" value={subStatusFilter} onChange={setSubStatusFilter} options={[{ value: 'all', label: 'حالة الاشتراك' }, { value: 'active', label: 'نشط' }, { value: 'expired', label: 'منتهٍ' }, { value: 'cancelled', label: 'ملغي' }, { value: 'pending', label: 'قيد الانتظار' }]} /></div>
            <div className="min-w-[115px]"><AdminSelect compact title="الحالة" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'كل الحالات' }, { value: 'active', label: 'نشط' }, { value: 'restricted', label: 'مقيّد' }, { value: 'suspended', label: 'موقوف مؤقتاً' }, { value: 'banned', label: 'محظور' }]} /></div>
            <div className="min-w-[130px]"><AdminSelect compact title="الترتيب" value={sortBy} onChange={setSortBy} options={[{ value: 'newest', label: 'الأحدث انضماماً' }, { value: 'oldest', label: 'الأقدم' }, { value: 'followers', label: 'الأكثر متابعة' }, { value: 'posts', label: 'الأكثر منشورات' }, { value: 'reports', label: 'الأكثر بلاغات' }, { value: 'activity', label: 'آخر نشاط' }]} /></div>
            <div className="relative">
              <button type="button" onClick={() => setColsOpen((v) => !v)} className="px-3 py-2 rounded bg-[#0B0B0B] border border-[#2F3336] hover:border-white flex items-center gap-1.5 cursor-pointer">
                <Columns3 size={14} className="text-[#FFC500]" /><span>الأعمدة ({visibleCols.length})</span>
              </button>
              {colsOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-black border border-[#2F3336] rounded p-2 z-30 shadow-2xl max-h-64 overflow-y-auto space-y-1">
                  {ALL_COLUMNS.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#111] cursor-pointer text-[11px]">
                      <input type="checkbox" checked={visibleCols.includes(c.id)} onChange={() => setVisibleCols((prev) => prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id])} />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black border border-[#2F3336] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B0B0B] border-b border-[#2F3336] text-[#71767B] text-[11px]">
                {showCol('account') && <th className="p-3 font-bold whitespace-nowrap">الحساب</th>}
                {showCol('kind') && <th className="p-3 font-bold whitespace-nowrap">نوع الحساب</th>}
                {showCol('linked') && <th className="p-3 font-bold whitespace-nowrap">الصفحات المرتبطة</th>}
                {showCol('followers') && <th className="p-3 font-bold whitespace-nowrap">المتابعون</th>}
                {showCol('following') && <th className="p-3 font-bold whitespace-nowrap">يتابع</th>}
                {showCol('posts') && <th className="p-3 font-bold whitespace-nowrap">المنشورات</th>}
                {showCol('comments') && <th className="p-3 font-bold whitespace-nowrap">التعليقات</th>}
                {showCol('likes') && <th className="p-3 font-bold whitespace-nowrap" title="إجمالي الإعجابات على منشورات الحساب">الإعجابات (منشوراته)</th>}
                {showCol('badge') && <th className="p-3 font-bold whitespace-nowrap">التوثيق</th>}
                {showCol('sub') && <th className="p-3 font-bold whitespace-nowrap">الاشتراك</th>}
                {showCol('sub_status') && <th className="p-3 font-bold whitespace-nowrap">حالة الاشتراك</th>}
                {showCol('ads') && <th className="p-3 font-bold whitespace-nowrap">الإعلانات</th>}
                {showCol('reports') && <th className="p-3 font-bold whitespace-nowrap">البلاغات (له/عليه)</th>}
                {showCol('support') && <th className="p-3 font-bold whitespace-nowrap">الدعم</th>}
                {showCol('joined') && <th className="p-3 font-bold whitespace-nowrap">تاريخ الانضمام</th>}
                {showCol('last_act') && <th className="p-3 font-bold whitespace-nowrap">آخر نشاط</th>}
                {showCol('status') && <th className="p-3 font-bold whitespace-nowrap">الحالة</th>}
                {showCol('details') && <th className="p-3 font-bold whitespace-nowrap text-center">التفاصيل</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F3336]/60">
              {loading ? (
                <tr><td colSpan={17} className="p-10 text-center text-[#71767B]">جاري تحميل الحسابات الحقيقية...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={17} className="p-10 text-center text-[#71767B]">لا توجد حسابات مطابقة لمعايير البحث.</td></tr>
              ) : paginated.map((r) => (
                <tr key={r.id} className="hover:bg-[#0B0B0B] transition-colors">
                  {showCol('account') && (
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#111] border border-[#2F3336] overflow-hidden flex items-center justify-center font-black text-[#FFC500] shrink-0">
                          {r.avatar_url ? <img src={r.avatar_url} alt="" className="w-full h-full object-cover" /> : r.full_name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-[140px]">{r.full_name}</div>
                          <div className="text-[11px] text-[#71767B]" dir="ltr">@{r.username}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  {showCol('kind') && <td className="p-3 whitespace-nowrap"><AccountKindPill kind={r.profile_kind} /></td>}
                  {showCol('linked') && (
                    <td className="p-3 whitespace-nowrap">
                      {!r.linked_pages || r.linked_pages.length === 0 ? (
                        <span className="text-[#71767B] text-[11px]">غير مرتبط</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {r.linked_pages.map((lp) => (
                            <span key={`${lp.id}-${lp.relation}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0B0B0B] border border-[#2F3336] text-[10px]">
                              <span className="truncate max-w-[100px] font-bold text-white">{lp.name}</span>
                              <span className={lp.relation === 'owner' ? 'text-[#FFC500]' : 'text-sky-400'}>({lp.relation === 'owner' ? 'مالك' : lp.role || 'مفوض'})</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                  {showCol('followers') && <td className="p-3 font-bold tabular-nums">{r.followers_count}</td>}
                  {showCol('following') && <td className="p-3 tabular-nums text-zinc-300">{r.following_count}</td>}
                  {showCol('posts') && <td className="p-3 tabular-nums">{r.posts_count}</td>}
                  {showCol('comments') && <td className="p-3 tabular-nums text-zinc-300">{r.comments_count}</td>}
                  {showCol('likes') && <td className="p-3 tabular-nums text-[#FFC500]">{r.likes_received_count}</td>}
                  {showCol('badge') && <td className="p-3 whitespace-nowrap"><BadgePill badge={r.badge_type} /></td>}
                  {showCol('sub') && <td className="p-3 whitespace-nowrap"><SubCyclePill cycle={r.subscription_cycle} /></td>}
                  {showCol('sub_status') && <td className="p-3 whitespace-nowrap"><SubStatusPill status={r.subscription_status} /></td>}
                  {showCol('ads') && <td className="p-3 whitespace-nowrap"><AdsCoveragePill coverage={r.ads_coverage} /></td>}
                  {showCol('reports') && <td className="p-3 whitespace-nowrap tabular-nums"><span className="text-zinc-300">{r.reports_submitted_count}</span> / <span className={r.reports_received_count > 0 ? 'text-rose-400 font-bold' : 'text-zinc-500'}>{r.reports_received_count}</span></td>}
                  {showCol('support') && <td className="p-3 whitespace-nowrap tabular-nums">{r.support_tickets_count} {r.support_open_count > 0 && <span className="text-[10px] text-amber-400">({r.support_open_count} مفتوح)</span>}</td>}
                  {showCol('joined') && <td className="p-3 whitespace-nowrap text-[#71767B]">{formatDateAr(r.created_at)}</td>}
                  {showCol('last_act') && <td className="p-3 whitespace-nowrap text-[#71767B]">{formatDateAr(r.last_activity_at)}</td>}
                  {showCol('status') && <td className="p-3 whitespace-nowrap"><AccountStatusPill status={r.moderation_status} /></td>}
                  {showCol('details') && (
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {canEdit && (
                          <button type="button" onClick={() => { setLinkAccountId(r.id); setPageQuery(''); setSelectedPageId(''); setLinkMode('owner'); }} className="px-2.5 py-1.5 rounded bg-[#0B0B0B] border border-[#FFC500]/50 hover:border-[#FFC500] text-[#FFC500] font-black text-[11px] inline-flex items-center gap-1 cursor-pointer">
                            <Link2 size={13} /><span>ربط</span>
                          </button>
                        )}
                        <button type="button" onClick={() => setSelectedAccountId(r.id)} className="px-2.5 py-1.5 rounded bg-[#FFC500] text-black font-black text-[11px] inline-flex items-center gap-1 cursor-pointer hover:opacity-90">
                          <Eye size={13} /><span>التفاصيل</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[#2F3336] flex items-center justify-between text-xs text-[#71767B]">
          <span>إجمالي النتائج: {filtered.length} • صفحة {page} من {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded-lg bg-[#111] border border-[#2F3336] disabled:opacity-40 text-white cursor-pointer"><ChevronRight size={14} /></button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded-lg bg-[#111] border border-[#2F3336] disabled:opacity-40 text-white cursor-pointer"><ChevronLeft size={14} /></button>
          </div>
        </div>
      </div>

      {selectedAccount && <AccountDetailModal account={selectedAccount} canEdit={canEdit} canViewPrivate={canViewPrivate} onClose={() => setSelectedAccountId(null)} onGlobalRefresh={loadData} onToast={showToast} />}
      {(() => {
        const linkAccount = rows.find((x) => x.id === linkAccountId) || null;
        const filteredPages = pagesList.filter((pg) => !pageQuery.trim() || [pg.name, pg.slug, pg.id].some((v) => String(v || '').toLowerCase().includes(pageQuery.trim().toLowerCase()))).slice(0, 40);
        return (
          <AdminSheetModal
            open={Boolean(linkAccount)}
            onClose={() => setLinkAccountId(null)}
            title={`ربط حساب: ${linkAccount?.full_name || ''}`}
            subtitle={linkAccount ? `@${linkAccount.username} • إدارة الارتباط بالصفحات` : ''}
            icon={<Link2 size={16} className="text-[#FFC500]" />}
          >
            {linkAccount && (
              <div className="p-4 space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="text-[11px] font-black text-[#FFC500]">حالة الربط الحالية</div>
                  {(linkAccount.linked_pages || []).length === 0 ? (
                    <div className="p-3 rounded bg-[#0B0B0B] border border-[#2F3336] text-[#71767B]">هذا الحساب غير مرتبط بأي صفحة حالياً.</div>
                  ) : (
                    <div className="divide-y divide-[#2F3336]/60 border border-[#2F3336] rounded bg-[#0B0B0B]">
                      {(linkAccount.linked_pages || []).map((lp: LinkedPageBrief) => (
                        <div key={`${lp.id}-${lp.relation}`} className="p-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap"><span className="font-bold text-white truncate max-w-[180px]">{lp.name}</span><PageStatusPill status={lp.status} /></div>
                            <div className="text-[11px] text-[#71767B] mt-0.5"><span dir="ltr">@{lp.slug || lp.id.slice(0, 6)}</span> • <span className={lp.relation === 'owner' ? 'text-[#FFC500] font-bold' : 'text-sky-400 font-bold'}>{lp.relation === 'owner' ? 'مالك أساسي' : `مسؤول مفوض (${lp.role || 'admin'})`}</span></div>
                          </div>
                          {canEdit && (
                            <AdminButton variant="danger" size="sm" icon={<Unlink size={12} />} onClick={() => setConfirmCfg({
                              open: true, title: 'تأكيد فك ارتباط الحساب بالصفحة',
                              description: lp.relation === 'owner' ? `سيتم فك ارتباط ملكية "${linkAccount.full_name}" عن صفحة "${lp.name}".` : `سيتم إلغاء تفويض "${linkAccount.full_name}" عن صفحة "${lp.name}".`,
                              confirmLabel: 'تأكيد فك الارتباط', variant: 'danger', requireReason: true,
                              onConfirm: async (reason) => {
                                try {
                                  if (lp.relation === 'owner') await unlinkPageOwner({ businessId: lp.id, reason });
                                  else await managePageAdminRpc({ businessId: lp.id, userId: linkAccount.id, operation: 'remove', reason });
                                  setConfirmCfg(null); showSuccess('تم فك ارتباط الحساب بالصفحة بنجاح.'); await loadData();
                                } catch (err) { showError(toArabicErrorMessage(err, 'تعذر فك ارتباط الحساب بالصفحة.')); }
                              },
                            })}>فك الربط</AdminButton>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#2F3336]">
                  <div className="text-[11px] font-black text-white">ربط بصفحة جديدة</div>
                  <AdminSelect title="نوع الارتباط" value={linkMode} onChange={(v) => setLinkMode(v as any)} options={[{ value: 'owner', label: 'ربط كمالك أساسي للصفحة' }, { value: 'admin', label: 'تفويض كمسؤول إدارة' }, { value: 'editor', label: 'تفويض كمحرر' }, { value: 'moderator', label: 'تفويض كمشرف' }]} />
                  <div className="relative"><Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71767B]" /><input value={pageQuery} onChange={(e) => setPageQuery(e.target.value)} placeholder="ابحث باسم الصفحة أو @المعرف..." className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded pr-9 pl-3 text-white outline-none caret-white" /></div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-[#2F3336]/60 border border-[#2F3336] rounded bg-[#0B0B0B]">
                    {filteredPages.length === 0 ? <div className="py-6 text-center text-[#71767B]">لا توجد صفحات مطابقة.</div> : filteredPages.map((pg) => {
                      const isOwnerHere = pg.owner_id === linkAccount.id;
                      const isAdminHere = (linkAccount.linked_pages || []).some((lp) => lp.id === pg.id && lp.relation === 'admin');
                      const isDup = (linkMode === 'owner' && isOwnerHere) || (linkMode !== 'owner' && (isOwnerHere || isAdminHere));
                      const isSel = selectedPageId === pg.id;
                      return (
                        <button key={pg.id} type="button" disabled={isDup} onClick={() => setSelectedPageId(pg.id)} className={`w-full px-3 py-2.5 text-right flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 ${isSel ? 'bg-[#FFC500]/15 text-[#FFC500]' : 'hover:bg-[#141414] text-white'}`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded bg-[#14171C] border border-[#2F3336] overflow-hidden flex items-center justify-center font-black text-[#FFC500] shrink-0">
                              {pg.logo_url ? <img src={pg.logo_url} alt="" className="w-full h-full object-cover" /> : (pg.name?.[0] || 'ص')}
                            </div>
                            <div className="min-w-0"><div className="font-bold truncate">{pg.name}</div><div className="text-[10px] text-[#71767B]" dir="ltr">@{pg.slug || pg.id.slice(0, 8)}</div></div>
                          </div>
                          {isOwnerHere ? <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">مرتبط كمالك</span> : isAdminHere ? <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 font-bold">مرتبط كمفوض</span> : isSel ? <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFC500] text-black font-black">محدد</span> : pg.owner_id ? <span className="text-[10px] text-amber-400">لها مالك حالي</span> : <span className="text-[10px] text-[#71767B]">متاحة</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2F3336]">
                  <AdminButton variant="secondary" onClick={() => setLinkAccountId(null)}>إغلاق</AdminButton>
                  <AdminButton variant="primary" disabled={!selectedPageId} icon={<Link2 size={14} />} onClick={() => {
                    const targetPage = pagesList.find((pg) => pg.id === selectedPageId);
                    if (!targetPage) return;
                    if (linkMode === 'owner') {
                      if (targetPage.owner_id === linkAccount.id) return showError('هذا الحساب مرتبط بالفعل بهذه الصفحة.');
                      const hasOther = Boolean(targetPage.owner_id && targetPage.owner_id !== linkAccount.id);
                      setConfirmCfg({
                        open: true, title: hasOther ? 'تأكيد نقل وربط الصفحة' : 'تأكيد ربط الحساب بالصفحة',
                        description: hasOther ? `صفحة "${targetPage.name}" مرتبطة بمالك آخر، سيتم نقل ملكيتها إلى "${linkAccount.full_name}".` : `سيتم ربط "${linkAccount.full_name}" كمالك رسمي لصفحة "${targetPage.name}".`,
                        confirmLabel: 'تأكيد الربط', variant: 'warning', requireReason: true,
                        onConfirm: async (reason) => { try { await transferPageOwnershipRpc({ businessId: targetPage.id, newOwnerId: linkAccount.id, actionType: hasOther ? 'transfer' : 'admin_assign', reason }); setConfirmCfg(null); setSelectedPageId(''); showSuccess('تم ربط الحساب بالصفحة بنجاح.'); await loadData(); } catch (err) { showError(toArabicErrorMessage(err, 'تعذر ربط الحساب بالصفحة.')); } },
                      });
                    } else {
                      if (targetPage.owner_id === linkAccount.id || (linkAccount.linked_pages || []).some((lp) => lp.id === targetPage.id && lp.relation === 'admin' && lp.role === linkMode)) {
                        return showError('هذا الحساب مرتبط بالفعل بهذه الصفحة.');
                      }
                      setConfirmCfg({
                        open: true, title: 'تأكيد تفويض الحساب لإدارة الصفحة',
                        description: `سيتم تفويض "${linkAccount.full_name}" (${linkMode}) على صفحة "${targetPage.name}".`,
                        confirmLabel: 'تأكيد التفويض', variant: 'warning', requireReason: true,
                        onConfirm: async (reason) => { try { await managePageAdminRpc({ businessId: targetPage.id, userId: linkAccount.id, operation: 'upsert', role: linkMode, reason }); setConfirmCfg(null); setSelectedPageId(''); showSuccess('تم ربط الحساب بالصفحة بنجاح.'); await loadData(); } catch (err) { showError(toArabicErrorMessage(err, 'تعذر تفويض الحساب.')); } },
                      });
                    }
                  }}>متابعة وتأكيد الربط</AdminButton>
                </div>
              </div>
            )}
          </AdminSheetModal>
        );
      })()}

      {confirmCfg && <AdminConfirmDialog open={confirmCfg.open} title={confirmCfg.title} description={confirmCfg.description} confirmLabel={confirmCfg.confirmLabel} variant={confirmCfg.variant} requireReason={confirmCfg.requireReason} onCancel={() => setConfirmCfg(null)} onConfirm={confirmCfg.onConfirm} />}
    </div>
  );
};
