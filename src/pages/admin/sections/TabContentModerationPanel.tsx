import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  RefreshCw,
  EyeOff,
  Eye,
  Pin,
  Star,
  Trash2,
  ShieldBan,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { CommunitySection } from '../../../services/sectionsService';
import {
  fetchUnifiedTabContent,
  moderateUnifiedContentItem,
  toggleUserPostingRestriction,
  type UnifiedTabContentItem,
} from '../../../services/communityTabsAdminService';

interface TabContentModerationPanelProps {
  sections: CommunitySection[];
  initialSectionFilter?: string;
  onGoToSection: (sectionId: string) => void;
}

export const TabContentModerationPanel: React.FC<TabContentModerationPanelProps> = ({
  sections,
  initialSectionFilter = 'all',
  onGoToSection,
}) => {
  const [items, setItems] = useState<UnifiedTabContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState(initialSectionFilter);
  const [kindFilter, setKindFilter] = useState<'all' | 'free' | 'specialized'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reported' | 'hidden' | 'pinned' | 'featured'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<UnifiedTabContentItem | null>(null);

  useEffect(() => {
    setSectionFilter(initialSectionFilter || 'all');
  }, [initialSectionFilter]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await fetchUnifiedTabContent(sections, { limit: 120 });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [sections.length]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleModerate = async (
    item: UnifiedTabContentItem,
    action: 'hide' | 'restore' | 'pin' | 'unpin' | 'feature' | 'unfeature' | 'delete' | 'set_status',
    status?: string,
    reason?: string
  ) => {
    setBusyId(item.id);
    const res = await moderateUnifiedContentItem({ item, action, status, reason });
    setBusyId(null);
    if (!res.ok) {
      showToast('error', res.error || 'تعذر تنفيذ الإجراء');
      return;
    }
    showToast('success', 'تم تنفيذ الإجراء وتسجيله في سجل العمليات.');
    await loadContent();
  };

  const handleToggleUserBan = async (item: UnifiedTabContentItem) => {
    if (!item.authorId) return;
    const allowPost = !item.authorCanPost;
    setBusyId(item.id);
    const res = await toggleUserPostingRestriction({
      userId: item.authorId,
      allowPost,
      reason: allowPost ? 'إعادة صلاحية النشر' : 'إيقاف صلاحية النشر من الرقابة المركزية',
      sectionId: item.sectionId,
    });
    setBusyId(null);
    if (!res.ok) {
      showToast('error', res.error || 'تعذر تحديث صلاحية المستخدم');
      return;
    }
    showToast('success', allowPost ? 'تمت إعادة صلاحية النشر للمستخدم.' : 'تم إيقاف صلاحية النشر عن المستخدم.');
    await loadContent();
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (sectionFilter !== 'all') {
        const normFilter = sectionFilter === 'realestate' ? 'properties' : sectionFilter;
        if (item.sectionId !== normFilter) return false;
      }
      if (kindFilter !== 'all' && item.contentKind !== kindFilter) return false;
      if (statusFilter === 'reported' && item.reportsCount === 0) return false;
      if (statusFilter === 'hidden' && !item.isHidden) return false;
      if (statusFilter === 'pinned' && !item.isPinned) return false;
      if (statusFilter === 'featured' && !item.isFeatured) return false;
      if (q) {
        const hay = `${item.title} ${item.body} ${item.authorName} ${item.authorUsername} ${item.sectionLabel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, sectionFilter, kindFilter, statusFilter, searchQuery]);

  const counts = useMemo(() => ({
    total: items.length,
    free: items.filter((i) => i.contentKind === 'free').length,
    specialized: items.filter((i) => i.contentKind === 'specialized').length,
    reported: items.filter((i) => i.reportsCount > 0).length,
    hidden: items.filter((i) => i.isHidden).length,
  }), [items]);

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* مؤشرات سريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: 'إجمالي المحتوى', val: counts.total, color: 'text-white' },
          { label: 'تغريدات مجانية', val: counts.free, color: 'text-sky-400' },
          { label: 'إعلانات متخصصة', val: counts.specialized, color: 'text-[#FFC500]' },
          { label: 'عليها بلاغات', val: counts.reported, color: 'text-rose-400' },
          { label: 'مخفية', val: counts.hidden, color: 'text-zinc-400' },
        ].map((st) => (
          <div key={st.label} className="bg-[#0B0F17] border border-[#2F3336] rounded-xl p-2.5">
            <div className="text-[10px] text-[#71767B] font-bold">{st.label}</div>
            <div className={`text-base font-black mt-0.5 ${st.color}`}>{st.val}</div>
          </div>
        ))}
      </div>

      {/* شريط التصفية */}
      <div className="bg-[#0B0F17] border border-[#2F3336] rounded-2xl p-3 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71767B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان، المحتوى، أو اسم صاحب المنشور..."
              className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-[#71767B] outline-none"
            />
          </div>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="all">جميع التبويبات</option>
            <option value="community">المجتمع العام</option>
            {sections.filter((s) => !s.isArchived).map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as any)}
            className="bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="all">كل الأنواع (مجاني + مدفوع)</option>
            <option value="free">تغريدات عادية مجانية</option>
            <option value="specialized">إعلانات متخصصة مدفوعة</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="all">كل الحالات</option>
            <option value="reported">عليها بلاغات فقط</option>
            <option value="hidden">المخفية فقط</option>
            <option value="pinned">المثبتة فقط</option>
            <option value="featured">المميزة فقط</option>
          </select>

          <button
            type="button"
            onClick={loadContent}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-black border border-[#2F3336] hover:border-white text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* قائمة المحتوى */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#71767B] bg-[#0B0F17] border border-[#2F3336] rounded-2xl">
          جارِ تحميل المحتوى الموحد من جميع التبويبات...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#71767B] bg-[#0B0F17] border border-[#2F3336] rounded-2xl">
          لا توجد منشورات مطابقة للفلاتر المحددة.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isBusy = busyId === item.id;
            return (
              <div
                key={`${item.sourceTable}:${item.id}`}
                className={`bg-[#0B0F17] border rounded-2xl p-3.5 space-y-2.5 transition ${
                  item.isHidden ? 'border-red-500/30 opacity-80' : 'border-[#2F3336]'
                }`}
              >
                {/* الترويسة: الشارات وصاحب المنشور */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onGoToSection(item.sectionId)}
                      className="px-2 py-0.5 rounded-full bg-[#FFC500]/15 text-[#FFC500] border border-[#FFC500]/30 text-[10px] font-black flex items-center gap-1 hover:bg-[#FFC500] hover:text-black transition cursor-pointer"
                      title="الانتقال إلى إعدادات هذا القسم"
                    >
                      <span>{item.sectionLabel}</span>
                      <ExternalLink size={10} />
                    </button>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        item.contentKind === 'specialized'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                          : 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
                      }`}
                    >
                      {item.contentKind === 'specialized' ? <Sparkles size={10} /> : <MessageSquare size={10} />}
                      <span>{item.contentKind === 'specialized' ? 'إعلان متخصص مدفوع' : 'تغريدة مجانية'}</span>
                    </span>

                    {item.isPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        مثبت
                      </span>
                    )}
                    {item.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        مميز
                      </span>
                    )}
                    {item.isHidden && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold">
                        مخفي
                      </span>
                    )}
                    {item.reportsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black flex items-center gap-1">
                        <AlertTriangle size={10} />
                        <span>{item.reportsCount} بلاغ</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-[#71767B] font-mono">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('ar-YE') : ''}
                  </div>
                </div>

                {/* المحتوى */}
                <div className="flex items-start gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover border border-[#2F3336] shrink-0 bg-black"
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs font-black text-white line-clamp-1">{item.title}</div>
                    {item.body && (
                      <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">{item.body}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#71767B]">
                      <span>
                        بواسطة: <strong className="text-white">{item.authorName}</strong> (@{item.authorUsername})
                      </span>
                      {!item.authorCanPost && (
                        <span className="text-red-400 font-bold">· النشر موقوف عن هذا المستخدم</span>
                      )}
                      {item.city && <span>· {item.city}</span>}
                      {item.price !== null && item.price !== undefined && (
                        <span className="text-[#FFC500] font-bold">
                          · {Number(item.price).toLocaleString()} {item.currency || 'YER'}
                        </span>
                      )}
                      <span>· مشاهدات: {item.viewsCount}</span>
                      <span>· تفاعلات: {item.interactionsCount}</span>
                    </div>
                  </div>
                </div>

                {/* شريط إجراءات الرقابة */}
                <div className="pt-2 border-t border-[#2F3336]/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        handleModerate(
                          item,
                          item.isHidden ? 'restore' : 'hide',
                          undefined,
                          item.isHidden ? undefined : 'مخفي من الرقابة المركزية'
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                        item.isHidden
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-black text-zinc-300 border-[#2F3336] hover:border-white'
                      }`}
                    >
                      {item.isHidden ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{item.isHidden ? 'إعادة إظهار' : 'إخفاء'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleModerate(item, item.isPinned ? 'unpin' : 'pin')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                        item.isPinned
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-black text-zinc-300 border-[#2F3336] hover:border-white'
                      }`}
                    >
                      <Pin size={11} />
                      <span>{item.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleModerate(item, item.isFeatured ? 'unfeature' : 'feature')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                        item.isFeatured
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-black text-zinc-300 border-[#2F3336] hover:border-white'
                      }`}
                    >
                      <Star size={11} />
                      <span>{item.isFeatured ? 'إلغاء التمييز' : 'تمييز'}</span>
                    </button>

                    <select
                      disabled={isBusy}
                      value={item.status}
                      onChange={(e) => handleModerate(item, 'set_status', e.target.value)}
                      className="bg-black border border-[#2F3336] focus:border-white rounded-lg px-2 py-1 text-[10px] text-white outline-none"
                      title="تغيير حالة المنشور"
                    >
                      <option value="active">نشط (active)</option>
                      <option value="pending">قيد المراجعة (pending)</option>
                      <option value="hidden">مخفي (hidden)</option>
                      <option value="rejected">مرفوض (rejected)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.authorId && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggleUserBan(item)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                          item.authorCanPost
                            ? 'bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {item.authorCanPost ? <ShieldBan size={11} /> : <ShieldCheck size={11} />}
                        <span>{item.authorCanPost ? 'إيقاف نشر المستخدم' : 'إعادة النشر للمستخدم'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setConfirmDeleteItem(item)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white flex items-center gap-1 cursor-pointer transition"
                    >
                      <Trash2 size={11} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDeleteItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setConfirmDeleteItem(null)}
        >
          <div
            className="w-full max-w-sm bg-black border border-[#2F3336] rounded-2xl p-5 space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-black text-red-400 flex items-center gap-2">
              <Trash2 size={16} />
              <span>تأكيد حذف المحتوى المخالف</span>
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              هل تريد حذف <strong className="text-white">"{confirmDeleteItem.title}"</strong> نهائياً من تبويب{' '}
              <span className="text-[#FFC500]">{confirmDeleteItem.sectionLabel}</span>؟
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteItem(null)}
                className="px-4 py-1.5 rounded-full border border-[#2F3336] text-xs font-bold text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmDeleteItem;
                  setConfirmDeleteItem(null);
                  await handleModerate(target, 'delete');
                }}
                className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black cursor-pointer"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
