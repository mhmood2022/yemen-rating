import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccountSummaryRow,
  AccountsDashboardStats,
  PeriodPreset,
} from '../../../types/adminAccountsPages';
import { fetchAccountsDashboardData } from '../../../services/accountsAdminService';
import { getAccess, AccessInfo } from '../../../lib/access';
import { supabase } from '../../../lib/supabase';
import {
  AccountKindPill,
  AccountStatusPill,
  AdsCoveragePill,
  BadgePill,
  formatDateAr,
  PeriodFilterBar,
  StatMiniCard,
  SubCyclePill,
  SubStatusPill,
} from '../../../components/admin/accounts-pages/SharedAdminUI';
import { AccountDetailModal } from './AccountDetailModal';
import {
  Users, UserPlus, UserCheck, UserX, ShieldCheck, CreditCard,
  Clock, Ban, Flag, Search, RefreshCw, Columns3, Eye, ChevronRight, ChevronLeft,
} from 'lucide-react';

const ALL_COLUMNS = [
  { id: 'account', label: 'الحساب' },
  { id: 'kind', label: 'نوع الحساب' },
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
  const [rows, setRows] = useState<AccountSummaryRow[]>([]);
  const [stats, setStats] = useState<AccountsDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessInfo | null>(null);
  const [hasSupabaseSession, setHasSupabaseSession] = useState(true);

  const [period, setPeriod] = useState<PeriodPreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [subStatusFilter, setSubStatusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'followers' | 'posts' | 'reports' | 'activity'>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [visibleCols, setVisibleCols] = useState<string[]>(ALL_COLUMNS.map((c) => c.id));
  const [colsOpen, setColsOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [acc, sessRes, res] = await Promise.all([
        getAccess(),
        supabase.auth.getSession(),
        fetchAccountsDashboardData(period, customFrom, customTo),
      ]);
      setAccess(acc);
      setHasSupabaseSession(Boolean(sessRes.data?.session?.user));
      setRows(res.rows);
      setStats(res.stats);
    } catch (e: any) {
      showToast(e?.message || 'تعذر تحميل بيانات الحسابات', 'error');
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo, showToast]);

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
          <button type="button" onClick={loadData} className="px-3 py-2 rounded-xl bg-black border border-[#2F3336] hover:border-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#FFC500]' : 'text-[#FFC500]'} /><span>تحديث</span>
          </button>
        </div>
      </div>

      {!hasSupabaseSession && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
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
      <div className="bg-black border border-[#2F3336] rounded-2xl p-3.5 space-y-3">
        <div className="flex flex-col lg:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-2.5 text-[#71767B]" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث فوري بالاسم، @اسم_المستخدم، الهاتف، البريد، أو المعرف..."
              className="w-full bg-[#0B0B0B] border border-[#2F3336] focus:border-white rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none caret-white placeholder-[#71767B]" />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <select value={kindFilter} onChange={(e) => { setKindFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none">
              <option value="all">كل الأنواع</option><option value="personal">شخصي</option><option value="business_owner">صاحب منشأة</option><option value="businessman">رجل أعمال</option>
            </select>
            <select value={badgeFilter} onChange={(e) => { setBadgeFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none">
              <option value="all">كل التوثيق</option><option value="blue">أزرق</option><option value="silver">فضي</option><option value="gold">ذهبي</option><option value="none">بدون</option>
            </select>
            <select value={subFilter} onChange={(e) => { setSubFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none">
              <option value="all">كل الاشتراكات</option><option value="free">مجاني</option><option value="monthly">شهري</option><option value="yearly">سنوي</option>
            </select>
            <select value={subStatusFilter} onChange={(e) => { setSubStatusFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none">
              <option value="all">حالة الاشتراك</option><option value="active">نشط</option><option value="expired">منتهٍ</option><option value="cancelled">ملغي</option><option value="pending">قيد الانتظار</option>
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none">
              <option value="all">كل الحالات</option><option value="active">نشط</option><option value="restricted">مقيّد</option><option value="suspended">موقوف مؤقتاً</option><option value="banned">محظور</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-[#0B0B0B] border border-[#2F3336] rounded-xl px-2.5 py-2 text-white outline-none">
              <option value="newest">الأحدث انضماماً</option><option value="oldest">الأقدم</option><option value="followers">الأكثر متابعة</option><option value="posts">الأكثر منشورات</option><option value="reports">الأكثر بلاغات</option><option value="activity">آخر نشاط</option>
            </select>
            <div className="relative">
              <button type="button" onClick={() => setColsOpen((v) => !v)} className="px-3 py-2 rounded-xl bg-[#0B0B0B] border border-[#2F3336] hover:border-white flex items-center gap-1.5 cursor-pointer">
                <Columns3 size={14} className="text-[#FFC500]" /><span>الأعمدة ({visibleCols.length})</span>
              </button>
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
      </div>

      <div className="bg-black border border-[#2F3336] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B0B0B] border-b border-[#2F3336] text-[#71767B] text-[11px]">
                {showCol('account') && <th className="p-3 font-bold whitespace-nowrap">الحساب</th>}
                {showCol('kind') && <th className="p-3 font-bold whitespace-nowrap">نوع الحساب</th>}
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
                      <button type="button" onClick={() => setSelectedAccountId(r.id)} className="px-3 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] inline-flex items-center gap-1 cursor-pointer hover:opacity-90">
                        <Eye size={13} /><span>التفاصيل</span>
                      </button>
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
      {toast && <div className={`fixed bottom-5 left-5 z-[200] px-4 py-2.5 rounded-xl text-xs font-black shadow-2xl border ${toast.type === 'error' ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-black border-[#FFC500] text-[#FFC500]'}`}>{toast.msg}</div>}
    </div>
  );
};
