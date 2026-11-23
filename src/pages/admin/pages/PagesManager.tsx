import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PageKind, PagesDashboardStats, PageSummaryRow, PeriodPreset } from '../../../types/adminAccountsPages';
import {
  createAdminBusinessPage,
  exportPagesToCsv,
  fetchPagesDashboardData,
  moderatePageRpc,
  transferPageOwnershipRpc,
  unlinkPageOwner,
} from '../../../services/pagesAdminService';
import { getAccess, AccessInfo } from '../../../lib/access';
import { supabase } from '../../../lib/supabase';
import { AdsCoveragePill, BadgePill, formatDateAr, PageKindPill, PageStatusPill, PeriodFilterBar, StatMiniCard, SubCyclePill, SubStatusPill } from '../../../components/admin/accounts-pages/SharedAdminUI';
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
import { PageDetailModal } from './PageDetailModal';
import { Building2, PlusCircle, CheckCircle2, ShieldCheck, CreditCard, Clock, Megaphone, EyeOff, Flag, Search, RefreshCw, Columns3, Eye, Download, Star, Users, ChevronRight, ChevronLeft, Plus, Pencil, Link2, Unlink, Power, PowerOff } from 'lucide-react';
const ALL_COLUMNS = [
  { id: 'page', label: 'الصفحة' }, { id: 'kind', label: 'النوع' }, { id: 'slug', label: 'الرابط' },
  { id: 'owner', label: 'المالك' }, { id: 'admins', label: 'المسؤولون' }, { id: 'followers', label: 'المتابعون' },
  { id: 'posts', label: 'المنشورات' }, { id: 'reviews', label: 'التقييمات' }, { id: 'avg', label: 'المتوسط' },
  { id: 'comments', label: 'التعليقات' }, { id: 'interactions', label: 'التفاعلات' }, { id: 'badge', label: 'التوثيق' },
  { id: 'sub', label: 'الاشتراك' }, { id: 'sub_status', label: 'حالة الاشتراك' }, { id: 'ads', label: 'الإعلانات' },
  { id: 'reports', label: 'البلاغات' }, { id: 'support', label: 'الدعم' }, { id: 'created', label: 'الإنشاء' },
  { id: 'updated', label: 'التحديث' }, { id: 'status', label: 'الحالة' }, { id: 'details', label: 'التفاصيل' },
] as const;

interface AccountCandidate { id: string; full_name: string; username: string; avatar_url: string | null; }
const CREATE_DRAFT_KEY = 'yr_admin_create_page_draft_v1';

export const PagesManager: React.FC = () => {
  const { showSuccess, showError, showWarning } = useAdminFeedback();
  const [rows, setRows] = useState<PageSummaryRow[]>([]);
  const [stats, setStats] = useState<PagesDashboardStats | null>(null);
  const [accounts, setAccounts] = useState<AccountCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessInfo | null>(null);
  const [hasSupabaseSession, setHasSupabaseSession] = useState(true);
  const [view, patchView] = useSectionViewState(
    'yr_admin_pages_view_v3',
    {
      includeLegacy: false,
      period: '30d' as PeriodPreset,
      customFrom: '',
      customTo: '',
      search: '',
      kindFilter: 'all',
      badgeFilter: 'all',
      subFilter: 'all',
      statusFilter: 'all',
      sortBy: 'newest' as 'newest' | 'followers' | 'rating' | 'posts' | 'reports',
      page: 1,
    },
    { ready: !loading }
  );
  const { includeLegacy, period, customFrom, customTo, search, kindFilter, badgeFilter, subFilter, statusFilter, sortBy, page } = view;
  const setIncludeLegacy = (v: boolean) => patchView({ includeLegacy: v, page: 1 });
  const setPeriod = (v: PeriodPreset) => patchView({ period: v, page: 1 });
  const setCustomFrom = (v: string) => patchView({ customFrom: v });
  const setCustomTo = (v: string) => patchView({ customTo: v });
  const setSearch = (v: string) => patchView({ search: v, page: 1 });
  const setKindFilter = (v: string) => patchView({ kindFilter: v, page: 1 });
  const setBadgeFilter = (v: string) => patchView({ badgeFilter: v, page: 1 });
  const setSubFilter = (v: string) => patchView({ subFilter: v, page: 1 });
  const setStatusFilter = (v: string) => patchView({ statusFilter: v, page: 1 });
  const setSortBy = (v: any) => patchView({ sortBy: v });
  const setPage = (updater: number | ((prev: number) => number)) => {
    const next = typeof updater === 'function' ? updater(page) : updater;
    patchView({ page: next });
  };
  const pageSize = 15;
  const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS.map((c) => c.id));
  const [colsOpen, setColsOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  useBackClose(colsOpen, () => setColsOpen(false));

  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createDraft, setCreateDraft] = useState<{
    name: string; slug: string; pageKind: PageKind; city: string; phone: string; description: string; ownerId: string;
  }>(() => {
    try { const raw = sessionStorage.getItem(CREATE_DRAFT_KEY); if (raw) return JSON.parse(raw); } catch {}
    return { name: '', slug: '', pageKind: 'business', city: 'صنعاء', phone: '', description: '', ownerId: '' };
  });
  useEffect(() => { try { sessionStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(createDraft)); } catch {} }, [createDraft]);

  const [editTarget, setEditTarget] = useState<PageSummaryRow | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', slug: '', pageKind: 'business' as PageKind, city: '', phone: '', description: '' });

  const [linkTarget, setLinkTarget] = useState<PageSummaryRow | null>(null);
  const [accountQuery, setAccountQuery] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');

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
      const [acc, sessRes, res, profRes] = await Promise.all([
        getAccess(), supabase.auth.getSession(),
        fetchPagesDashboardData(period, includeLegacy, customFrom, customTo),
        supabase.from('profiles').select('id, full_name, username, avatar_url').order('created_at', { ascending: false }),
      ]);
      setAccess(acc); setHasSupabaseSession(Boolean(sessRes.data?.session?.user));
      setRows(res.rows); setStats(res.stats);
      setAccounts((profRes.data || []) as AccountCandidate[]);
    } catch (e: any) { showError(toArabicErrorMessage(e, 'تعذر تحميل الصفحات'), () => loadData()); }
    finally { setLoading(false); }
  }, [period, includeLegacy, customFrom, customTo, showError]);
  useEffect(() => { loadData(); }, [loadData]);
  const canEdit = Boolean(access && (access.role === 'super_admin' || access.role === 'admin' || access.can('facilities.edit')));
  const canViewPrivate = Boolean(access && (access.role === 'super_admin' || access.role === 'admin' || access.can('users.edit')));
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && ![r.name, r.slug, r.owner_name, r.owner_username, r.city, r.id].some((v) => String(v || '').toLowerCase().includes(q))) return false;
      if (kindFilter !== 'all' && r.page_kind !== kindFilter) return false;
      if (badgeFilter !== 'all' && r.badge_type !== badgeFilter) return false;
      if (subFilter !== 'all' && r.subscription_cycle !== subFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'followers') return b.followers_count - a.followers_count;
      if (sortBy === 'rating') return b.avg_rating - a.avg_rating || b.reviews_count - a.reviews_count;
      if (sortBy === 'posts') return b.posts_count - a.posts_count;
      if (sortBy === 'reports') return b.reports_received_count - a.reports_received_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [rows, search, kindFilter, badgeFilter, subFilter, statusFilter, sortBy]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);
  const selectedPage = useMemo(() => rows.find((r) => r.id === selectedPageId) || null, [rows, selectedPageId]);
  const showCol = (id: string) => visibleCols.includes(id);
  return (
    <div dir="rtl" className="space-y-5 text-white font-['Cairo',sans-serif]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2"><Building2 className="text-[#FFC500]" size={22} /> إدارة الصفحات العامة (X)</h1>
          <p className="text-xs text-[#71767B] mt-0.5">إدارة صفحات المنشآت والشركات ورجال الأعمال المرتبطة بالحسابات الشخصية</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button type="button" onClick={() => setCreateOpen(true)} className="px-3.5 py-2 rounded-lg bg-[#FFC500] hover:bg-[#e6b100] text-black text-xs font-black flex items-center gap-1.5 cursor-pointer">
              <Plus size={15} /><span>إنشاء صفحة جديدة</span>
            </button>
          )}
          <PeriodFilterBar period={period} onPeriodChange={setPeriod} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} />
          <button type="button" onClick={() => exportPagesToCsv(filtered)} className="px-3 py-2 rounded bg-black border border-[#2F3336] text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Download size={14} className="text-[#FFC500]" /><span>تصدير CSV</span></button>
          <button type="button" onClick={loadData} className="px-3 py-2 rounded bg-black border border-[#2F3336] text-xs font-bold flex items-center gap-1.5 cursor-pointer"><RefreshCw size={14} className={loading ? 'animate-spin text-[#FFC500]' : 'text-[#FFC500]'} /><span>تحديث</span></button>
        </div>
      </div>
      {!hasSupabaseSession && <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">ملاحظة: لتنفيذ التعديلات المحمية على الخادم، يلزم دخول المشرف عبر Google.</div>}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2.5">
          <StatMiniCard label="إجمالي الصفحات" value={stats.total} icon={<Building2 size={15} />} />
          <StatMiniCard label="الصفحات الجديدة" value={stats.newInPeriod} icon={<PlusCircle size={15} />} growthPct={stats.growthPct} />
          <StatMiniCard label="النشطة" value={stats.active} icon={<CheckCircle2 size={15} />} accent="text-emerald-400" />
          <StatMiniCard label="الموثقة" value={stats.verified} icon={<ShieldCheck size={15} />} accent="text-[#FFC500]" />
          <StatMiniCard label="المشتركة" value={stats.subscribed} icon={<CreditCard size={15} />} accent="text-sky-400" />
          <StatMiniCard label="اشتراكات منتهية" value={stats.expiredSubscriptions} icon={<Clock size={15} />} accent="text-amber-400" />
          <StatMiniCard label="إعلانات نشطة" value={stats.withActiveAds} icon={<Megaphone size={15} />} accent="text-purple-400" />
          <StatMiniCard label="موقوفة/مخفية" value={stats.suspendedOrHidden} icon={<EyeOff size={15} />} accent="text-rose-400" />
          <StatMiniCard label="لديها بلاغات" value={stats.withReports} icon={<Flag size={15} />} accent="text-rose-300" />
        </div>
      )}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-black border border-[#2F3336] rounded p-3.5 space-y-2">
            <div className="text-xs font-black text-white flex items-center gap-1.5"><Users size={14} className="text-[#FFC500]" /> الصفحات الأعلى متابعة</div>
            {stats.topFollowed.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد بيانات</p> : stats.topFollowed.map((p) => (
              <button key={p.id} type="button" onClick={() => setSelectedPageId(p.id)} className="w-full flex items-center justify-between text-xs p-2 rounded bg-[#0B0B0B] border border-[#2F3336] cursor-pointer"><span className="font-bold truncate">{p.name}</span><span className="text-[#FFC500] font-black">{p.followers_count} متابع</span></button>
            ))}
          </div>
          <div className="bg-black border border-[#2F3336] rounded p-3.5 space-y-2">
            <div className="text-xs font-black text-white flex items-center gap-1.5"><Star size={14} className="text-[#FFC500]" /> الصفحات الأعلى تقييماً</div>
            {stats.topRated.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد تقييمات</p> : stats.topRated.map((p) => (
              <button key={p.id} type="button" onClick={() => setSelectedPageId(p.id)} className="w-full flex items-center justify-between text-xs p-2 rounded bg-[#0B0B0B] border border-[#2F3336] cursor-pointer"><span className="font-bold truncate">{p.name}</span><span className="text-[#FFC500] font-black">{p.avg_rating} ★ ({p.reviews_count})</span></button>
            ))}
          </div>
        </div>
      )}
      <div className="bg-black border border-[#2F3336] rounded p-3.5 flex flex-col lg:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-2.5 text-[#71767B]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="بحث باسم الصفحة، الرابط، المالك، المدينة..." className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded pr-9 pl-3 py-2 text-xs text-white outline-none caret-white placeholder-[#71767B]" />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded bg-[#0B0B0B] border border-[#2F3336] cursor-pointer"><input type="checkbox" checked={includeLegacy} onChange={(e) => setIncludeLegacy(e.target.checked)} /><span>تضمين القديمة</span></label>
          <div className="min-w-[115px]"><AdminSelect compact title="النوع" value={kindFilter} onChange={setKindFilter} options={[{ value: 'all', label: 'كل الأنواع' }, { value: 'business', label: 'منشأة' }, { value: 'company', label: 'شركة' }, { value: 'businessman', label: 'رجل أعمال' }]} /></div>
          <div className="min-w-[115px]"><AdminSelect compact title="التوثيق" value={badgeFilter} onChange={setBadgeFilter} options={[{ value: 'all', label: 'كل التوثيق' }, { value: 'gold', label: 'ذهبي' }, { value: 'silver', label: 'فضي' }, { value: 'blue', label: 'أزرق' }, { value: 'none', label: 'بدون' }]} /></div>
          <div className="min-w-[125px]"><AdminSelect compact title="الاشتراك" value={subFilter} onChange={setSubFilter} options={[{ value: 'all', label: 'كل الاشتراكات' }, { value: 'free', label: 'مجاني' }, { value: 'monthly', label: 'شهري' }, { value: 'yearly', label: 'سنوي' }]} /></div>
          <div className="min-w-[115px]"><AdminSelect compact title="الحالة" value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'كل الحالات' }, { value: 'active', label: 'نشطة' }, { value: 'pending', label: 'معلقة' }, { value: 'hidden', label: 'مخفية' }, { value: 'suspended', label: 'موقوفة' }]} /></div>
          <div className="min-w-[130px]"><AdminSelect compact title="الترتيب" value={sortBy} onChange={setSortBy} options={[{ value: 'newest', label: 'الأحدث إنشاءً' }, { value: 'followers', label: 'الأكثر متابعة' }, { value: 'rating', label: 'الأعلى تقييماً' }, { value: 'posts', label: 'الأكثر منشورات' }, { value: 'reports', label: 'الأكثر بلاغات' }]} /></div>
          <div className="relative">
            <button type="button" onClick={() => setColsOpen((v) => !v)} className="px-3 py-2 rounded bg-[#0B0B0B] border border-[#2F3336] hover:border-white flex items-center gap-1.5 cursor-pointer"><Columns3 size={14} className="text-[#FFC500]" /><span>الأعمدة ({visibleCols.length})</span></button>
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

      <div className="bg-black border border-[#2F3336] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B0B0B] border-b border-[#2F3336] text-[#71767B] text-[11px]">
                {showCol('page') && <th className="p-3 font-bold whitespace-nowrap">الصفحة</th>}
                {showCol('kind') && <th className="p-3 font-bold whitespace-nowrap">النوع</th>}
                {showCol('slug') && <th className="p-3 font-bold whitespace-nowrap">الرابط</th>}
                {showCol('owner') && <th className="p-3 font-bold whitespace-nowrap">المالك</th>}
                {showCol('admins') && <th className="p-3 font-bold whitespace-nowrap">المسؤولون</th>}
                {showCol('followers') && <th className="p-3 font-bold whitespace-nowrap">المتابعون</th>}
                {showCol('posts') && <th className="p-3 font-bold whitespace-nowrap">المنشورات</th>}
                {showCol('reviews') && <th className="p-3 font-bold whitespace-nowrap">التقييمات</th>}
                {showCol('avg') && <th className="p-3 font-bold whitespace-nowrap">المتوسط</th>}
                {showCol('comments') && <th className="p-3 font-bold whitespace-nowrap">التعليقات</th>}
                {showCol('interactions') && <th className="p-3 font-bold whitespace-nowrap">التفاعلات</th>}
                {showCol('badge') && <th className="p-3 font-bold whitespace-nowrap">التوثيق</th>}
                {showCol('sub') && <th className="p-3 font-bold whitespace-nowrap">الاشتراك</th>}
                {showCol('sub_status') && <th className="p-3 font-bold whitespace-nowrap">حالة الاشتراك</th>}
                {showCol('ads') && <th className="p-3 font-bold whitespace-nowrap">الإعلانات</th>}
                {showCol('reports') && <th className="p-3 font-bold whitespace-nowrap">البلاغات</th>}
                {showCol('support') && <th className="p-3 font-bold whitespace-nowrap">الدعم</th>}
                {showCol('created') && <th className="p-3 font-bold whitespace-nowrap">الإنشاء</th>}
                {showCol('updated') && <th className="p-3 font-bold whitespace-nowrap">التحديث</th>}
                {showCol('status') && <th className="p-3 font-bold whitespace-nowrap">الحالة</th>}
                {showCol('details') && <th className="p-3 font-bold whitespace-nowrap text-center">التفاصيل</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F3336]/60">
              {loading ? (
                <tr><td colSpan={Math.max(1, visibleCols.length)} className="p-10 text-center text-[#71767B]">جاري تحميل الصفحات...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={Math.max(1, visibleCols.length)} className="p-10 text-center text-[#71767B]">لا توجد صفحات مطابقة لمعايير البحث.</td></tr>
              ) : paginated.map((r) => (
                <tr key={r.id} className="hover:bg-[#0B0B0B] transition-colors">
                  {showCol('page') && (
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#111] border border-[#2F3336] overflow-hidden flex items-center justify-center font-black text-[#FFC500] shrink-0">
                          {r.logo_url ? <img src={r.logo_url} alt="" className="w-full h-full object-cover" /> : (r.name?.[0] || 'ص')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-[160px] flex items-center gap-1.5">
                            <span className="truncate">{r.name}</span>
                            {!r.is_x_page && <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-[#2F3336] text-zinc-400">قديمة</span>}
                          </div>
                          <div className="text-[11px] text-[#71767B] truncate max-w-[160px]">{[r.category_name, r.city].filter(Boolean).join(' • ') || '—'}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  {showCol('kind') && <td className="p-3 whitespace-nowrap"><PageKindPill kind={r.page_kind} /></td>}
                  {showCol('slug') && <td className="p-3 whitespace-nowrap text-[#71767B]" dir="ltr">@{r.slug || r.id.slice(0, 8)}</td>}
                  {showCol('owner') && (
                    <td className="p-3 whitespace-nowrap">
                      {r.owner_name ? (
                        <div>
                          <div className="font-bold text-white truncate max-w-[130px]">{r.owner_name}</div>
                          {r.owner_username && <div className="text-[11px] text-[#71767B]" dir="ltr">@{r.owner_username}</div>}
                        </div>
                      ) : <span className="text-[#71767B]">غير مملوكة</span>}
                    </td>
                  )}
                  {showCol('admins') && (
                    <td className="p-3 whitespace-nowrap tabular-nums" title={r.admins_preview?.map((a) => `${a.full_name} (${a.role})`).join(', ') || ''}>
                      {r.admins_count}
                    </td>
                  )}
                  {showCol('followers') && <td className="p-3 font-bold tabular-nums">{r.followers_count}</td>}
                  {showCol('posts') && <td className="p-3 tabular-nums">{r.posts_count}</td>}
                  {showCol('reviews') && <td className="p-3 tabular-nums">{r.reviews_count}</td>}
                  {showCol('avg') && (
                    <td className="p-3 whitespace-nowrap tabular-nums">
                      <span className="inline-flex items-center gap-1 font-bold text-[#FFC500]">
                        <Star size={12} className="fill-[#FFC500]" />
                        {Number(r.avg_rating || 0).toFixed(1)}
                      </span>
                    </td>
                  )}
                  {showCol('comments') && <td className="p-3 tabular-nums text-zinc-300">{r.comments_count}</td>}
                  {showCol('interactions') && <td className="p-3 tabular-nums text-[#FFC500]">{r.interactions_count}</td>}
                  {showCol('badge') && <td className="p-3 whitespace-nowrap"><BadgePill badge={r.badge_type} /></td>}
                  {showCol('sub') && <td className="p-3 whitespace-nowrap"><SubCyclePill cycle={r.subscription_cycle} /></td>}
                  {showCol('sub_status') && <td className="p-3 whitespace-nowrap"><SubStatusPill status={r.subscription_status} /></td>}
                  {showCol('ads') && (
                    <td className="p-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <AdsCoveragePill coverage={r.ads_coverage} />
                        {r.active_ads_count > 0 && <span className="text-[10px] text-zinc-400 tabular-nums">({r.active_ads_count})</span>}
                      </div>
                    </td>
                  )}
                  {showCol('reports') && (
                    <td className="p-3 whitespace-nowrap tabular-nums">
                      <span className="text-zinc-300">{r.reports_submitted_count}</span> / <span className={r.reports_received_count > 0 ? 'text-rose-400 font-bold' : 'text-zinc-500'}>{r.reports_received_count}</span>
                    </td>
                  )}
                  {showCol('support') && (
                    <td className="p-3 whitespace-nowrap tabular-nums">
                      {r.support_tickets_count} {r.support_open_count > 0 && <span className="text-[10px] text-amber-400">({r.support_open_count} مفتوح)</span>}
                    </td>
                  )}
                  {showCol('created') && <td className="p-3 whitespace-nowrap text-[#71767B]">{formatDateAr(r.created_at)}</td>}
                  {showCol('updated') && <td className="p-3 whitespace-nowrap text-[#71767B]">{formatDateAr(r.updated_at)}</td>}
                  {showCol('status') && <td className="p-3 whitespace-nowrap"><PageStatusPill status={r.status} /></td>}
                  {showCol('details') && (
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" onClick={() => setSelectedPageId(r.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFC500] text-black text-xs font-black cursor-pointer">
                          <Eye size={13} /><span>التفاصيل</span>
                        </button>
                        {canEdit && (
                          <>
                            <button type="button" onClick={() => { setEditTarget(r); setEditForm({ name: r.name, slug: r.slug, pageKind: r.page_kind, city: r.city || '', phone: canViewPrivate ? (r.phone || '') : '', description: r.description || '' }); }} title="تعديل بيانات الصفحة" className="p-1.5 rounded-lg bg-[#0B0B0B] border border-[#2F3336] hover:border-white text-zinc-200 cursor-pointer">
                              <Pencil size={13} />
                            </button>
                            <button type="button" onClick={() => { setLinkTarget(r); setAccountQuery(''); setSelectedOwnerId(''); }} title="ربط بحساب" className="p-1.5 rounded-lg bg-[#0B0B0B] border border-[#2F3336] hover:border-[#FFC500] text-[#FFC500] cursor-pointer">
                              <Link2 size={13} />
                            </button>
                            {r.owner_id && (
                              <button type="button" onClick={() => setConfirmCfg({
                                open: true, title: 'تأكيد إلغاء ربط الصفحة', description: `سيتم إلغاء ارتباط صفحة "${r.name}" بالحساب (${r.owner_name || 'المالك الحالي'}).`, confirmLabel: 'إلغاء الربط', variant: 'danger', requireReason: true,
                                onConfirm: async (reason) => { try { await unlinkPageOwner({ businessId: r.id, reason }); setConfirmCfg(null); showSuccess('تم إلغاء ربط الصفحة بالحساب بنجاح.'); await loadData(); } catch (err) { showError(toArabicErrorMessage(err, 'تعذر إلغاء الربط.')); } },
                              })} title="إلغاء الربط" className="p-1.5 rounded-lg bg-[#0B0B0B] border border-[#2F3336] hover:border-amber-400 text-amber-400 cursor-pointer">
                                <Unlink size={13} />
                              </button>
                            )}
                            <button type="button" onClick={() => {
                              const active = r.status === 'active';
                              setConfirmCfg({
                                open: true, title: active ? 'تأكيد إيقاف الصفحة' : 'تأكيد تفعيل الصفحة',
                                description: active ? `سيتم إيقاف صفحة "${r.name}" مؤقتاً.` : `سيتم إعادة تفعيل صفحة "${r.name}".`,
                                confirmLabel: active ? 'إيقاف الصفحة' : 'تفعيل الصفحة', variant: active ? 'danger' : 'warning', requireReason: true,
                                onConfirm: async (reason) => { try { await moderatePageRpc({ businessId: r.id, action: active ? 'suspend' : 'activate', reason }); setConfirmCfg(null); showSuccess(active ? 'تم إيقاف الصفحة بنجاح.' : 'تم تفعيل الصفحة بنجاح.'); await loadData(); } catch (err) { showError(toArabicErrorMessage(err, 'تعذر تحديث حالة الصفحة.')); } },
                              });
                            }} title={r.status === 'active' ? 'إيقاف الصفحة' : 'تفعيل الصفحة'} className={`p-1.5 rounded-lg bg-[#0B0B0B] border border-[#2F3336] cursor-pointer ${r.status === 'active' ? 'text-rose-400 hover:border-rose-400' : 'text-emerald-400 hover:border-emerald-400'}`}>
                              {r.status === 'active' ? <PowerOff size={13} /> : <Power size={13} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#2F3336] bg-[#0B0B0B] text-xs text-[#71767B]">
          <div>عرض {paginated.length} من أصل {filtered.length} صفحة</div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-lg bg-black border border-[#2F3336] disabled:opacity-40 text-white cursor-pointer"><ChevronRight size={15} /></button>
            <span className="text-white font-bold tabular-nums">{page} / {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-1.5 rounded-lg bg-black border border-[#2F3336] disabled:opacity-40 text-white cursor-pointer"><ChevronLeft size={15} /></button>
          </div>
        </div>
      </div>

      {selectedPage && (
        <PageDetailModal
          page={selectedPage}
          canEdit={canEdit}
          canViewPrivate={canViewPrivate}
          onClose={() => setSelectedPageId(null)}
          onGlobalRefresh={loadData}
          onToast={showToast}
        />
      )}

      <AdminSheetModal open={createOpen} onClose={() => setCreateOpen(false)} title="إنشاء صفحة جديدة" subtitle="إضافة صفحة منشأة أو شركة أو رجل أعمال" icon={<Building2 size={17} className="text-[#FFC500]" />}>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!canEdit) return showError('لا تملك الصلاحية لتنفيذ هذه العملية.');
          if (!createDraft.name.trim()) return showWarning('يرجى إدخال اسم الصفحة.');
          setCreateBusy(true);
          try {
            await createAdminBusinessPage(createDraft);
            setCreateDraft({ name: '', slug: '', pageKind: 'business', city: 'صنعاء', phone: '', description: '', ownerId: '' });
            try { sessionStorage.removeItem(CREATE_DRAFT_KEY); } catch {}
            setCreateOpen(false);
            showSuccess('تم إنشاء الصفحة بنجاح.');
            await loadData();
          } catch (err) { showError(toArabicErrorMessage(err, 'تعذر إنشاء الصفحة، يرجى المحاولة مرة أخرى.')); }
          finally { setCreateBusy(false); }
        }} className="p-4 space-y-3 text-xs">
          <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">اسم الصفحة *</label><input required value={createDraft.name} onChange={(e) => setCreateDraft({ ...createDraft, name: e.target.value })} placeholder="مثال: شركة النخبة للتجارة" className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 text-white outline-none caret-white" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">المعرف (@slug)</label><input dir="ltr" value={createDraft.slug} onChange={(e) => setCreateDraft({ ...createDraft, slug: e.target.value })} placeholder="nokhba_trade" className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 text-white outline-none caret-white" /></div>
            <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">نوع الصفحة *</label><AdminSelect title="نوع الصفحة" value={createDraft.pageKind} onChange={(v) => setCreateDraft({ ...createDraft, pageKind: v as PageKind })} options={[{ value: 'business', label: 'منشأة' }, { value: 'company', label: 'شركة' }, { value: 'businessman', label: 'رجل أعمال' }]} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">المدينة</label><input value={createDraft.city} onChange={(e) => setCreateDraft({ ...createDraft, city: e.target.value })} className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 text-white outline-none caret-white" /></div>
            <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">الهاتف</label><input dir="ltr" value={createDraft.phone} onChange={(e) => setCreateDraft({ ...createDraft, phone: e.target.value })} className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 text-white outline-none caret-white" /></div>
          </div>
          <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">الحساب المالك المرتبط (اختياري)</label><AdminSelect searchable title="اختر الحساب المالك" value={createDraft.ownerId} onChange={(v) => setCreateDraft({ ...createDraft, ownerId: v })} options={[{ value: '', label: 'بدون ربط حالياً' }, ...accounts.map((a) => ({ value: a.id, label: a.full_name, hint: `@${a.username}`, avatarUrl: a.avatar_url }))]} /></div>
          <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">الوصف</label><textarea rows={3} value={createDraft.description} onChange={(e) => setCreateDraft({ ...createDraft, description: e.target.value })} className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg p-3 text-white outline-none caret-white resize-none" /></div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2F3336]">
            <AdminButton variant="secondary" onClick={() => setCreateOpen(false)}>إلغاء</AdminButton>
            <AdminButton type="submit" variant="primary" loading={createBusy} icon={<Plus size={15} />}>إنشاء الصفحة</AdminButton>
          </div>
        </form>
      </AdminSheetModal>

      <AdminSheetModal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title={`تعديل: ${editTarget?.name || ''}`} icon={<Pencil size={16} className="text-[#FFC500]" />}>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!editTarget || !canEdit) return;
          setEditBusy(true);
          try {
            await moderatePageRpc({ businessId: editTarget.id, action: 'edit_info', reason: 'تعديل من إدارة الصفحات', name: editForm.name.trim(), slug: editForm.slug.trim(), city: editForm.city.trim(), phone: canViewPrivate && editForm.phone.trim() ? editForm.phone.trim() : undefined, description: editForm.description.trim(), pageKind: editForm.pageKind });
            setEditTarget(null); showSuccess('تم تحديث بيانات الصفحة بنجاح.'); await loadData();
          } catch (err) { showError(toArabicErrorMessage(err, 'تعذر حفظ التغييرات.')); }
          finally { setEditBusy(false); }
        }} className="p-4 space-y-3 text-xs">
          <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">اسم الصفحة *</label><input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 text-white outline-none caret-white" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">المعرف (@slug)</label><input dir="ltr" value={editForm.slug} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 text-white outline-none caret-white" /></div>
            <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">نوع الصفحة</label><AdminSelect title="نوع الصفحة" value={editForm.pageKind} onChange={(v) => setEditForm({ ...editForm, pageKind: v as PageKind })} options={[{ value: 'business', label: 'منشأة' }, { value: 'company', label: 'شركة' }, { value: 'businessman', label: 'رجل أعمال' }]} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">المدينة</label><input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 text-white outline-none caret-white" /></div>
            {canViewPrivate && <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">الهاتف</label><input dir="ltr" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg px-3 text-white outline-none caret-white" /></div>}
          </div>
          <div><label className="block text-[11px] font-bold text-[#71767B] mb-1">الوصف</label><textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg p-3 text-white outline-none caret-white resize-none" /></div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2F3336]"><AdminButton variant="secondary" onClick={() => setEditTarget(null)}>إلغاء</AdminButton><AdminButton type="submit" variant="primary" loading={editBusy}>حفظ التعديلات</AdminButton></div>
        </form>
      </AdminSheetModal>

      <AdminSheetModal open={Boolean(linkTarget)} onClose={() => setLinkTarget(null)} title={`ربط "${linkTarget?.name || ''}" بحساب`} subtitle={linkTarget?.owner_name ? `المالك الحالي: ${linkTarget.owner_name}` : 'غير مرتبطة بحساب حالياً'} icon={<Link2 size={16} className="text-[#FFC500]" />}>
        <div className="p-4 space-y-3 text-xs">
          <div className="relative"><Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71767B]" /><input value={accountQuery} onChange={(e) => setAccountQuery(e.target.value)} placeholder="ابحث بالاسم أو @اسم_المستخدم..." className="w-full h-10 bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-lg pr-9 pl-3 text-white outline-none caret-white" /></div>
          <div className="max-h-64 overflow-y-auto divide-y divide-[#2F3336]/60 border border-[#2F3336] rounded-lg bg-[#0B0B0B]">
            {accounts.filter((a) => !accountQuery.trim() || [a.full_name, a.username, a.id].some((v) => String(v || '').toLowerCase().includes(accountQuery.trim().toLowerCase()))).slice(0, 40).map((acc) => {
              const isCur = linkTarget?.owner_id === acc.id;
              const isSel = selectedOwnerId === acc.id;
              return (
                <button key={acc.id} type="button" disabled={isCur} onClick={() => setSelectedOwnerId(acc.id)} className={`w-full px-3 py-2.5 text-right flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 ${isSel ? 'bg-[#FFC500]/15 text-[#FFC500]' : 'hover:bg-[#141414] text-white'}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-[#14171C] border border-[#2F3336] overflow-hidden flex items-center justify-center font-black text-[#FFC500] shrink-0">
                      {acc.avatar_url ? <img src={acc.avatar_url} alt="" className="w-full h-full object-cover" /> : (acc.full_name?.[0] || 'م')}
                    </div>
                    <div className="min-w-0"><div className="font-bold truncate">{acc.full_name}</div><div className="text-[11px] text-[#71767B]" dir="ltr">@{acc.username}</div></div>
                  </div>
                  {isCur ? <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">المالك الحالي</span> : isSel ? <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFC500] text-black font-black">محدد</span> : null}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2F3336]">
            <AdminButton variant="secondary" onClick={() => setLinkTarget(null)}>إلغاء</AdminButton>
            <AdminButton variant="primary" disabled={!selectedOwnerId} onClick={() => {
              if (!linkTarget || !selectedOwnerId) return;
              if (linkTarget.owner_id === selectedOwnerId) return showWarning('هذه الصفحة مرتبطة بهذا الحساب بالفعل.');
              const accObj = accounts.find((a) => a.id === selectedOwnerId);
              const hasPrev = Boolean(linkTarget.owner_id);
              setConfirmCfg({
                open: true, title: hasPrev ? 'تأكيد تغيير الحساب المرتبط' : 'تأكيد ربط الصفحة بالحساب',
                description: hasPrev ? `سيتم نقل ملكية "${linkTarget.name}" إلى "${accObj?.full_name || ''}".` : `سيتم ربط "${linkTarget.name}" بالحساب "${accObj?.full_name || ''}".`,
                confirmLabel: 'تأكيد الربط', variant: 'warning', requireReason: true,
                onConfirm: async (reason) => { try { await transferPageOwnershipRpc({ businessId: linkTarget.id, newOwnerId: selectedOwnerId, actionType: hasPrev ? 'transfer' : 'admin_assign', reason }); setConfirmCfg(null); setLinkTarget(null); showSuccess('تم ربط الصفحة بالحساب بنجاح.'); await loadData(); } catch (err) { showError(toArabicErrorMessage(err, 'تعذر الربط.')); } },
              });
            }} icon={<Link2 size={14} />}>متابعة وتأكيد الربط</AdminButton>
          </div>
        </div>
      </AdminSheetModal>

      {confirmCfg && <AdminConfirmDialog open={confirmCfg.open} title={confirmCfg.title} description={confirmCfg.description} confirmLabel={confirmCfg.confirmLabel} variant={confirmCfg.variant} requireReason={confirmCfg.requireReason} onCancel={() => setConfirmCfg(null)} onConfirm={confirmCfg.onConfirm} />}
    </div>
  );
};
