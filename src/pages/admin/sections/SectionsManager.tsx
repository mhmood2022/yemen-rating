import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  X,
  Trash2,
  Check,
  AlertTriangle,
  Copy,
  RefreshCw,
  LayoutGrid,
  GripVertical,
  CornerDownLeft,
} from 'lucide-react';
import {
  CommunitySection,
  SECTION_ICON_OPTIONS,
  fetchCommunitySections,
  getCachedCommunitySections,
  getSectionIcon,
  saveCommunitySections,
} from '../../../services/sectionsService';

const RLS_FIX_SQL = `ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read platform_settings" ON public.platform_settings;
CREATE POLICY "Public read platform_settings" ON public.platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage community_sections" ON public.platform_settings;
CREATE POLICY "Admins manage community_sections" ON public.platform_settings FOR ALL USING (key = 'community_sections') WITH CHECK (key = 'community_sections');`;

export const SectionsManager: React.FC = () => {
  const [sections, setSections] = useState<CommunitySection[]>(() => getCachedCommunitySections());
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    showSql?: boolean;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [pendingDeleteSection, setPendingDeleteSection] = useState<CommunitySection | null>(null);

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdxRef = useRef<number | null>(null);
  const dragOverIdxRef = useRef<number | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIconName, setNewIconName] = useState('Store');
  const [newParentId, setNewParentId] = useState<string>('');
  const [newTargetRoute, setNewTargetRoute] = useState('');
  const [formError, setFormError] = useState('');

  const loadSections = async () => {
    setLoading(true);
    try {
      const data = await fetchCommunitySections();
      setSections(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const persistSections = async (next: CommunitySection[], successText: string) => {
    setSections(next);
    setSaving(true);
    const res = await saveCommunitySections(next);
    setSaving(false);

    if (res.syncedToCloud) {
      setCloudStatus({
        type: 'success',
        message: `${successText} — تمت المزامنة مع السحابة.`,
      });
    } else if (res.rlsBlocked) {
      setCloudStatus({
        type: 'warning',
        message: `${successText} محلياً، والمزامنة السحابية للجميع تتطلب تفعيل سياسة الحفظ (RLS) في Supabase.`,
        showSql: true,
      });
    } else {
      setCloudStatus({
        type: 'warning',
        message: `${successText} محلياً (${res.error || 'تعذر الحفظ السحابي'}).`,
      });
    }
  };

  const handleToggleSection = async (sectionId: string) => {
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return;
    const nextState = !target.isOpen;
    const next = sections.map((s) =>
      s.id === sectionId ? { ...s, isOpen: nextState } : s
    );
    await persistSections(
      next,
      nextState ? `تم فتح قسم "${target.label}"` : `تم إغلاق قسم "${target.label}"`
    );
  };

  const commitReorder = async (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= sections.length || toIdx >= sections.length) {
      return;
    }
    const copy = [...sections];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    const reordered = copy.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    await persistSections(reordered, `تم ترتيب قسم "${moved.label}"`);
  };

  const handleTouchStart = (index: number) => {
    dragIdxRef.current = index;
    dragOverIdxRef.current = index;
    setDraggingIdx(index);
    setDragOverIdx(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragIdxRef.current === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const el = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('[data-section-index]') as HTMLElement | null;
    if (!el) return;
    const targetIdx = Number(el.dataset.sectionIndex);
    if (!Number.isNaN(targetIdx) && targetIdx !== dragOverIdxRef.current) {
      dragOverIdxRef.current = targetIdx;
      setDragOverIdx(targetIdx);
    }
  };

  const handleTouchEnd = async () => {
    const from = dragIdxRef.current;
    const to = dragOverIdxRef.current;
    dragIdxRef.current = null;
    dragOverIdxRef.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
    if (from !== null && to !== null && from !== to) {
      await commitReorder(from, to);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) {
      setFormError('يرجى إدخال اسم القسم.');
      return;
    }

    const baseSlug = label
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const id = `sec-${Date.now().toString(36)}${baseSlug ? `-${baseSlug.slice(0, 18)}` : ''}`;

    const parentIdVal = newParentId.trim() || null;
    if (sections.some((s) => s.label === label && (s.parentId || null) === parentIdVal)) {
      setFormError('يوجد قسم بنفس الاسم في هذا المستوى بالفعل.');
      return;
    }

    const newSection: CommunitySection = {
      id,
      label,
      iconName: newIconName,
      isOpen: true,
      isBuiltIn: false,
      sortOrder: sections.length + 1,
      parentId: parentIdVal,
      description: newDescription.trim(),
      targetRoute: newTargetRoute.trim(),
    };

    const next = [...sections, newSection];
    setNewLabel('');
    setNewDescription('');
    setNewIconName('Store');
    setNewParentId('');
    setNewTargetRoute('');
    setFormError('');
    setIsAddOpen(false);
    await persistSections(next, `تمت إضافة قسم "${label}"`);
  };

  const handleSelectForDelete = (section: CommunitySection) => {
    if (!isDeleteMode) return;
    if (section.isBuiltIn) {
      setCloudStatus({
        type: 'warning',
        message: `قسم "${section.label}" أساسي ولا يمكن حذفه، يمكنك إغلاقه من زر التبديل.`,
      });
      return;
    }
    setPendingDeleteSection(section);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteSection) return;
    const target = pendingDeleteSection;
    setPendingDeleteSection(null);
    setIsDeleteMode(false);
    const next = sections.filter((s) => s.id !== target.id && s.parentId !== target.id);
    await persistSections(next, `تم حذف قسم "${target.label}"`);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(RLS_FIX_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {}
  };

  const topLevelSections = sections.filter((s) => !s.parentId);
  const openCount = sections.filter((s) => s.isOpen).length;
  const closedCount = sections.length - openCount;

  // ترتيب العرض: القسم الرئيسي ثم أقسامه الفرعية تحته مباشرة مع الحفاظ على فهرسه الحقيقي للسحب
  const orderedDisplayEntries: Array<{ section: CommunitySection; realIndex: number; isChild: boolean; parentLabel?: string }> = [];
  sections.forEach((sec, idx) => {
    if (!sec.parentId) {
      orderedDisplayEntries.push({ section: sec, realIndex: idx, isChild: false });
      sections.forEach((child, cIdx) => {
        if (child.parentId === sec.id) {
          orderedDisplayEntries.push({
            section: child,
            realIndex: cIdx,
            isChild: true,
            parentLabel: sec.label,
          });
        }
      });
    }
  });
  // أي أقسام فرعية يتيمة (احتياط)
  sections.forEach((sec, idx) => {
    if (sec.parentId && !sections.some((p) => p.id === sec.parentId)) {
      orderedDisplayEntries.push({ section: sec, realIndex: idx, isChild: true });
    }
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[#000000] text-white font-['Cairo',sans-serif] max-w-2xl mx-auto pb-16">
      <div className="sticky top-16 z-20 bg-[#000000]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <LayoutGrid size={19} className="text-[#FFC500] shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base font-black text-white leading-tight">إدارة الأقسام</h1>
            <p className="text-[11px] text-[#71767B] leading-tight mt-0.5">
              {openCount} مفتوح · {closedCount} مغلق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loadSections}
            disabled={loading || saving}
            className="p-1.5 text-[#71767B] hover:text-white transition cursor-pointer"
            title="تحديث"
            aria-label="تحديث"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsDeleteMode((prev) => !prev);
              setPendingDeleteSection(null);
            }}
            className={`p-1.5 transition cursor-pointer ${
              isDeleteMode ? 'text-red-500' : 'text-[#71767B] hover:text-red-400'
            }`}
            title="حذف قسم"
            aria-label="حذف قسم"
          >
            <Trash2 size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsDeleteMode(false);
              setFormError('');
              setNewParentId('');
              setIsAddOpen(true);
            }}
            className="p-1.5 text-[#FFC500] hover:text-white transition active:scale-95 cursor-pointer"
            title="إضافة قسم جديد"
            aria-label="إضافة قسم جديد"
          >
            <Plus size={22} className="stroke-[2.6]" />
          </button>
        </div>
      </div>

      {isDeleteMode && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-2 text-xs">
          <span className="text-red-300 font-bold">
            حدد القسم المضاف الذي تريد حذفه بالضغط عليه
          </span>
          <button
            type="button"
            onClick={() => {
              setIsDeleteMode(false);
              setPendingDeleteSection(null);
            }}
            className="text-white font-bold px-2 py-0.5 cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      )}

      {cloudStatus && (
        <div
          className={`mx-4 mb-2 p-3 rounded-2xl border text-xs leading-relaxed ${
            cloudStatus.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
              : 'border-[#FFC500]/30 bg-[#FFC500]/5 text-zinc-200'
          }`}
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2">
              {cloudStatus.type === 'success' ? (
                <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={15} className="text-[#FFC500] shrink-0 mt-0.5" />
              )}
              <span>{cloudStatus.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setCloudStatus(null)}
              className="text-[#71767B] hover:text-white shrink-0 cursor-pointer"
              aria-label="إغلاق التنبيه"
            >
              <X size={14} />
            </button>
          </div>

          {cloudStatus.showSql && (
            <div className="mt-2.5 pt-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#71767B]">
                  SQL للمزامنة السحابية (مرة واحدة في Supabase):
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded-full bg-[#FFC500] text-black font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Copy size={12} />
                  <span>{copiedSql ? 'تم النسخ' : 'نسخ SQL'}</span>
                </button>
              </div>
              <pre
                dir="ltr"
                className="p-2 rounded-xl bg-black border border-[#2F3336] text-[10px] text-zinc-300 overflow-x-auto select-all"
              >
                {RLS_FIX_SQL}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[11px] text-[#71767B] shrink-0">المجتمع:</span>
        <span className="font-bold text-white shrink-0">لك</span>
        <span className="font-bold text-[#71767B] shrink-0">متابعة</span>
        {topLevelSections
          .filter((s) => s.isOpen)
          .map((s) => {
            const Icon = getSectionIcon(s.iconName);
            return (
              <span
                key={s.id}
                className="font-bold text-white flex items-center gap-1 shrink-0"
              >
                <Icon size={13} className="text-[#FFC500]" />
                <span>{s.label}</span>
              </span>
            );
          })}
      </div>

      <div className="px-2 py-1 space-y-1">
        {orderedDisplayEntries.map(({ section, realIndex, isChild, parentLabel }) => {
          const Icon = getSectionIcon(section.iconName);
          const isDragging = draggingIdx === realIndex;
          const isDropTarget = dragOverIdx === realIndex && draggingIdx !== null && draggingIdx !== realIndex;
          const isSelectedForDelete = pendingDeleteSection?.id === section.id;
          const canSelectToDelete = isDeleteMode && !section.isBuiltIn;

          return (
            <div
              key={section.id}
              data-section-index={realIndex}
              draggable={!isDeleteMode}
              onClick={() => {
                if (isDeleteMode) handleSelectForDelete(section);
              }}
              onDragStart={() => {
                dragIdxRef.current = realIndex;
                setDraggingIdx(realIndex);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverIdxRef.current !== realIndex) {
                  dragOverIdxRef.current = realIndex;
                  setDragOverIdx(realIndex);
                }
              }}
              onDrop={async (e) => {
                e.preventDefault();
                const from = dragIdxRef.current;
                dragIdxRef.current = null;
                dragOverIdxRef.current = null;
                setDraggingIdx(null);
                setDragOverIdx(null);
                if (from !== null && from !== realIndex) {
                  await commitReorder(from, realIndex);
                }
              }}
              onDragEnd={() => {
                dragIdxRef.current = null;
                dragOverIdxRef.current = null;
                setDraggingIdx(null);
                setDragOverIdx(null);
              }}
              className={`py-3 rounded-xl flex items-center justify-between gap-3 transition select-none ${
                isChild ? 'pr-8 pl-2.5' : 'px-2.5'
              } ${
                isDragging ? 'opacity-50 bg-white/[0.04]' : 'hover:bg-white/[0.03]'
              } ${isDropTarget ? 'ring-1 ring-[#FFC500]' : ''} ${
                isSelectedForDelete
                  ? 'bg-red-500/15 ring-1 ring-red-500'
                  : canSelectToDelete
                    ? 'cursor-pointer ring-1 ring-red-500/30'
                    : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onTouchStart={() => handleTouchStart(realIndex)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-[#71767B] hover:text-white touch-none cursor-grab active:cursor-grabbing shrink-0"
                  title="اسحب لإعادة الترتيب"
                  aria-label="اسحب لإعادة الترتيب"
                >
                  <GripVertical size={17} />
                </button>

                {isChild && (
                  <CornerDownLeft size={13} className="text-[#71767B] shrink-0" />
                )}

                <Icon
                  size={isChild ? 17 : 19}
                  className={`shrink-0 ${
                    section.isOpen ? 'text-[#FFC500]' : 'text-[#71767B] opacity-60'
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-bold truncate ${
                        section.isOpen ? 'text-white' : 'text-[#71767B] line-through'
                      }`}
                    >
                      {section.label}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#71767B] truncate">
                    <span className={section.isOpen ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                      {section.isOpen ? 'مفتوح' : 'مغلق'}
                    </span>
                    {' · '}
                    <span>
                      {isChild
                        ? `فرعي تحت ${parentLabel || 'قسم'}`
                        : section.isBuiltIn
                          ? 'أساسي'
                          : 'مضاف'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!isChild && !isDeleteMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormError('');
                      setNewParentId(section.id);
                      setIsAddOpen(true);
                    }}
                    className="p-1 text-[#71767B] hover:text-[#FFC500] transition cursor-pointer"
                    title={`إضافة قسم فرعي تحت ${section.label}`}
                    aria-label={`إضافة قسم فرعي تحت ${section.label}`}
                  >
                    <Plus size={16} />
                  </button>
                )}

                <button
                  type="button"
                  role="switch"
                  aria-checked={section.isOpen}
                  aria-label={section.isOpen ? `إغلاق ${section.label}` : `فتح ${section.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSection(section.id);
                  }}
                  disabled={saving}
                  dir="ltr"
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                    section.isOpen ? 'bg-emerald-600' : 'bg-red-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      section.isOpen ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pendingDeleteSection && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPendingDeleteSection(null)}
        >
          <div
            className="w-full max-w-sm bg-[#000000] border border-[#2F3336] rounded-2xl p-5 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-red-400">
              <Trash2 size={18} />
              <h3 className="text-sm font-black text-white">تأكيد حذف القسم</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              هل أنت متأكد من حذف قسم <span className="text-white font-bold">"{pendingDeleteSection.label}"</span> نهائياً؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingDeleteSection(null)}
                className="px-4 py-2 rounded-full border border-[#2F3336] text-xs font-bold text-white hover:border-white transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black transition cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-[#000000] border-t sm:border border-[#2F3336] rounded-t-3xl sm:rounded-2xl overflow-hidden text-white max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#2F3336] mx-auto mt-2.5 sm:hidden shrink-0" />
            <div className="px-4 py-3.5 border-b border-[#2F3336] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-[#FFC500]" />
                <h2 className="text-sm font-black">
                  {newParentId ? 'إضافة قسم فرعي' : 'إضافة قسم جديد'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-[#71767B] hover:text-white cursor-pointer"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  مستوى القسم
                </label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition"
                >
                  <option value="">قسم رئيسي (في شريط المجتمع الرئيسي)</option>
                  {topLevelSections.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      قسم فرعي تحت: {parent.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  اسم القسم *
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="مثال: شركات النقل، مطاعم، فنادق..."
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#71767B] outline-none transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  وصف مختصر (اختياري)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="وصف يظهر للمستخدمين داخل القسم"
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#71767B] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  مسار صفحة مرتبط (اختياري)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={newTargetRoute}
                  onChange={(e) => setNewTargetRoute(e.target.value)}
                  placeholder="/businesses أو /prices أو /banks"
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#71767B] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  أيقونة القسم
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto">
                  {SECTION_ICON_OPTIONS.map((opt) => {
                    const Icon = getSectionIcon(opt.name);
                    const selected = newIconName === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setNewIconName(opt.name)}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          selected
                            ? 'border-white text-white bg-white/5'
                            : 'border-[#2F3336] text-[#71767B] hover:text-white'
                        }`}
                      >
                        <Icon size={16} className={selected ? 'text-[#FFC500]' : ''} />
                        <span className="truncate w-full text-center">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-400 font-bold">{formError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2F3336]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#2F3336] text-xs font-bold text-white hover:border-white transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-xs font-black transition cursor-pointer"
                >
                  إضافة وفتح القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
