import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PagesDashboardStats, PageSummaryRow, PeriodPreset } from '../../../types/adminAccountsPages';
import { exportPagesToCsv, fetchPagesDashboardData } from '../../../services/pagesAdminService';
import { getAccess, AccessInfo } from '../../../lib/access';
import { supabase } from '../../../lib/supabase';
import { AdsCoveragePill, BadgePill, formatDateAr, PageKindPill, PageStatusPill, PeriodFilterBar, StatMiniCard, SubCyclePill, SubStatusPill } from '../../../components/admin/accounts-pages/SharedAdminUI';
import { PageDetailModal } from './PageDetailModal';
import { Building2, PlusCircle, CheckCircle2, ShieldCheck, CreditCard, Clock, Megaphone, EyeOff, Flag, Search, RefreshCw, Columns3, Eye, Download, Star, Users, ChevronRight, ChevronLeft } from 'lucide-react';
const ALL_COLUMNS = [
  { id: 'page', label: 'الصفحة' }, { id: 'kind', label: 'النوع' }, { id: 'slug', label: 'الرابط' },
  { id: 'owner', label: 'المالك' }, { id: 'admins', label: 'المسؤولون' }, { id: 'followers', label: 'المتابعون' },
  { id: 'posts', label: 'المنشورات' }, { id: 'reviews', label: 'التقييمات' }, { id: 'avg', label: 'المتوسط' },
  { id: 'comments', label: 'التعليقات' }, { id: 'interactions', label: 'التفاعلات' }, { id: 'badge', label: 'التوثيق' },
  { id: 'sub', label: 'الاشتراك' }, { id: 'sub_status', label: 'حالة الاشتراك' }, { id: 'ads', label: 'الإعلانات' },
  { id: 'reports', label: 'البلاغات' }, { id: 'support', label: 'الدعم' }, { id: 'created', label: 'الإنشاء' },
  { id: 'updated', label: 'التحديث' }, { id: 'status', label: 'الحالة' }, { id: 'details', label: 'التفاصيل' },
] as const;

export const PagesManager: React.FC = () => {
  const [rows, setRows] = useState<PageSummaryRow[]>([]);
  const [stats, setStats] = useState<PagesDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessInfo | null>(null);
  const [hasSupabaseSession, setHasSupabaseSession] = useState(true);
  const [includeLegacy, setIncludeLegacy] = useState(false);
  const [period, setPeriod] = useState<PeriodPreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'followers' | 'rating' | 'posts' | 'reports'>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS.map((c) => c.id));
  const [colsOpen, setColsOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 4500);
  }, []);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, sessRes, res] = await Promise.all([
        getAccess(), supabase.auth.getSession(),
        fetchPagesDashboardData(period, includeLegacy, customFrom, customTo),
      ]);
      setAccess(acc); setHasSupabaseSession(Boolean(sessRes.data?.session?.user));
      setRows(res.rows); setStats(res.stats);
    } catch (e: any) { showToast(e?.message || 'تعذر التحميل', 'error'); }
    finally { setLoading(false); }
  }, [period, includeLegacy, customFrom, customTo, showToast]);
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
          <PeriodFilterBar period={period} onPeriodChange={setPeriod} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} />
          <button type="button" onClick={() => exportPagesToCsv(filtered)} className="px-3 py-2 rounded-xl bg-black border border-[#2F3336] text-xs font-bold flex items-center gap-1.5 cursor-pointer"><Download size={14} className="text-[#FFC500]" /><span>تصدير CSV</span></button>
          <button type="button" onClick={loadData} className="px-3 py-2 rounded-xl bg-black border border-[#2F3336] text-xs font-bold flex items-center gap-1.5 cursor-pointer"><RefreshCw size={14} className={loading ? 'animate-spin text-[#FFC500]' : 'text-[#FFC500]'} /><span>تحديث</span></button>
        </div>
      </div>
      {!hasSupabaseSession && <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">ملاحظة: لتنفيذ التعديلات المحمية على الخادم، يلزم دخول المشرف عبر Google.</div>}
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
          <div className="bg-black border border-[#2F3336] rounded-2xl p-3.5 space-y-2">
            <div className="text-xs font-black text-white flex items-center gap-1.5"><Users size={14} className="text-[#FFC500]" /> الصفحات الأعلى متابعة</div>
            {stats.topFollowed.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد بيانات</p> : stats.topFollowed.map((p) => (
              <button key={p.id} type="button" onClick={() => setSelectedPageId(p.id)} className="w-full flex items-center justify-between text-xs p-2 rounded-xl bg-[#0B0B0B] border border-[#2F3336] cursor-pointer"><span className="font-bold truncate">{p.name}</span><span className="text-[#FFC500] font-black">{p.followers_count} متابع</span></button>
            ))}
          </div>
          <div className="bg-black border border-[#2F3336] rounded-2xl p-3.5 space-y-2">
            <div className="text-xs font-black text-white flex items-center gap-1.5"><Star size={14} className="text-[#FFC500]" /> الصفحات الأعلى تقييماً</div>
            {stats.topRated.length === 0 ? <p className="text-xs text-[#71767B]">لا توجد تقييمات</p> : stats.topRated.map((p) => (
              <button key={p.id} type="button" onClick={() => setSelectedPageId(p.id)} className="w-full flex items-center justify-between text-xs p-2 rounded-xl bg-[#0B0B0B] border border-[#2F3336] cursor-pointer"><span className="font-bold truncate">{p.name}</span><span className="text-[#FFC500] font-black">{p.avg_rating} ★ ({p.reviews_count})</span></button>
            ))}
          </div>
        </div>
      )}
      <div className="bg-black border border-[#2F3336] rounded-2xl p-3.5 flex flex-col lg:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-2.5 text-[#71767B]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="بحث باسم الصفحة، الرابط، المالك، المدينة..." className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none caret-white placeholder-[#71767B]" />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#0B0B0B] border border-[#2F3336] cursor-pointer"><input type="checkbox" checked={includeLegacy} onChange={(e) => setIncludeLegacy(e.target.checked)} /><span>تضمين القديمة</span></label>
          <select value={kindFilter} onChange={(e) => { setKindFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none"><option value="all">كل الأنواع</option><option value="business">منشأة</option><option value="company">شركة</option><option value="businessman">رجل أعمال</option></select>
          <select value={badgeFilter} onChange={(e) => { setBadgeFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none"><option value="all">كل التوثيق</option><option value="gold">ذهبي</option><option value="silver">فضي</option><option value="none">بدون</option></select>
          <select value={subFilter} onChange={(e) => { setSubFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none"><option value="all">كل الاشتراكات</option><option value="free">مجاني</option><option value="monthly">شهري</option><option value="yearly">سنوي</option></select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none"><option value="all">كل الحالات</option><option value="active">نشطة</option><option value="pending">معلقة</option><option value="hidden">مخفية</option><option value="suspended">موقوفة</option></select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none"><option value="newest">الأحدث إنشاءً</option><option value="followers">الأكثر متابعة</option><option value="rating">الأعلى تقييماً</option><option value="posts">الأكثر منشورات</option><option value="reports">الأكثر بلاغات</option></select>
          <div className="relative">
            <button type="button" onClick={() => setColsOpen((v) => !v)} className="px-3 py-2 rounded-xl bg-[#0B0B0B] border border-[#2F3336] hover:border-white flex items-center gap-1.5 cursor-pointer"><Columns3 size={14} className="text-[#FFC500]" /><span>الأعمدة ({visibleCols.length})</span></button>
            {colsOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-black border border-[#2F3336] rounded-xl p-2 z-30 shadow-2xl max-h-64 overflow-y-auto space-y-1">
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

      <div className="bg-black border border-[#2F3336] rounded-2xl overflow-hidden">
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
                        <div className="w-8 h-8 rounded-xl bg-[#111] border border-[#2F3336] overflow-hidden flex items-center justify-center font-black text-[#FFC500] shrink-0">
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
                      <button type="button" onClick={() => setSelectedPageId(r.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#111] border border-[#2F3336] hover:border-white text-xs font-bold text-[#FFC500] cursor-pointer">
                        <Eye size={13} /><span>عرض</span>
                      </button>
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

      {toast && (
        <div className={`fixed bottom-5 left-5 z-[150] px-4 py-2.5 rounded-xl border text-xs font-bold shadow-2xl ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-200' : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};
