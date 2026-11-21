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

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdxRef = useRef<number | null>(null);
  const dragOverIdxRef = useRef<number | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIconName, setNewIconName] = useState('Store');
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

    if (sections.some((s) => s.label === label)) {
      setFormError('يوجد قسم بنفس الاسم بالفعل.');
      return;
    }

    const newSection: CommunitySection = {
      id,
      label,
      iconName: newIconName,
      isOpen: true,
      isBuiltIn: false,
      sortOrder: sections.length + 1,
      description: newDescription.trim(),
      targetRoute: newTargetRoute.trim(),
    };

    const next = [...sections, newSection];
    setNewLabel('');
    setNewDescription('');
    setNewIconName('Store');
    setNewTargetRoute('');
    setFormError('');
    setIsAddOpen(false);
    await persistSections(next, `تمت إضافة قسم "${label}"`);
  };

  const handleDeleteSection = async (section: CommunitySection) => {
    if (section.isBuiltIn) return;
    if (!window.confirm(`هل تريد حذف القسم "${section.label}" نهائياً؟`)) return;
    const next = sections.filter((s) => s.id !== section.id);
    await persistSections(next, `تم حذف قسم "${section.label}"`);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(RLS_FIX_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {}
  };

  const openCount = sections.filter((s) => s.isOpen).length;
  const closedCount = sections.length - openCount;

  return (
    <div dir="rtl" className="min-h-screen bg-[#000000] text-white font-['Cairo',sans-serif] max-w-2xl mx-auto pb-16">
      {/* ترويسة مخصصة للهاتف والكمبيوتر بدون قص النص */}
      <div className="sticky top-16 z-20 bg-[#000000]/95 backdrop-blur-md border-b border-[#2F3336] px-3.5 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full border border-[#2F3336] flex items-center justify-center shrink-0">
            <LayoutGrid size={17} className="text-[#FFC500]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-white leading-tight">إدارة الأقسام</h1>
            <p className="text-[11px] text-[#71767B] leading-tight mt-0.5">
              {openCount} مفتوح · {closedCount} مغلق · اسحب للترتيب
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={loadSections}
            disabled={loading || saving}
            className="w-9 h-9 rounded-full border border-[#2F3336] text-[#71767B] hover:text-white flex items-center justify-center transition cursor-pointer"
            title="تحديث"
            aria-label="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => {
              setFormError('');
              setIsAddOpen(true);
            }}
            className="w-9 h-9 sm:w-auto sm:px-3.5 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="إضافة قسم جديد"
            aria-label="إضافة قسم جديد"
          >
            <Plus size={18} className="stroke-[2.6]" />
            <span className="hidden sm:inline">إضافة قسم</span>
          </button>
        </div>
      </div>

      {cloudStatus && (
        <div
          className={`mx-3.5 mt-3 p-3 rounded-2xl border text-xs leading-relaxed ${
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
            <div className="mt-2.5 pt-2.5 border-t border-[#2F3336] space-y-2">
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

      {/* معاينة شريط المجتمع */}
      <div className="px-3.5 py-2.5 border-b border-[#2F3336] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-[#71767B] shrink-0 ml-1">المجتمع:</span>
        <span className="px-2.5 py-1 rounded-full border border-[#2F3336] text-[11px] font-bold text-white shrink-0">
          لك
        </span>
        <span className="px-2.5 py-1 rounded-full border border-[#2F3336] text-[11px] font-bold text-[#71767B] shrink-0">
          متابعة
        </span>
        {sections
          .filter((s) => s.isOpen)
          .map((s) => {
            const Icon = getSectionIcon(s.iconName);
            return (
              <span
                key={s.id}
                className="px-2.5 py-1 rounded-full border border-[#2F3336] text-[11px] font-bold text-white flex items-center gap-1 shrink-0"
              >
                <Icon size={12} className="text-[#FFC500]" />
                <span>{s.label}</span>
              </span>
            );
          })}
      </div>

      {/* قائمة الأقسام فقط — بتصميم أندرويد متجاوب للهاتف */}
      <div className="divide-y divide-[#2F3336]">
        {sections.map((section, index) => {
          const Icon = getSectionIcon(section.iconName);
          const isDragging = draggingIdx === index;
          const isDropTarget = dragOverIdx === index && draggingIdx !== null && draggingIdx !== index;

          return (
            <div
              key={section.id}
              data-section-index={index}
              draggable
              onDragStart={() => {
                dragIdxRef.current = index;
                setDraggingIdx(index);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverIdxRef.current !== index) {
                  dragOverIdxRef.current = index;
                  setDragOverIdx(index);
                }
              }}
              onDrop={async (e) => {
                e.preventDefault();
                const from = dragIdxRef.current;
                dragIdxRef.current = null;
                dragOverIdxRef.current = null;
                setDraggingIdx(null);
                setDragOverIdx(null);
                if (from !== null && from !== index) {
                  await commitReorder(from, index);
                }
              }}
              onDragEnd={() => {
                dragIdxRef.current = null;
                dragOverIdxRef.current = null;
                setDraggingIdx(null);
                setDragOverIdx(null);
              }}
              className={`px-3.5 py-3.5 flex items-center justify-between gap-3 transition select-none ${
                isDragging ? 'opacity-50 bg-white/[0.04]' : 'hover:bg-white/[0.02]'
              } ${isDropTarget ? 'border-t-2 border-t-[#FFC500]' : ''}`}
            >
              {/* اليمين: مقبض السحب + الأيقونة + اسم القسم */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onTouchStart={() => handleTouchStart(index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="p-1.5 -mr-1 text-[#71767B] hover:text-white touch-none cursor-grab active:cursor-grabbing shrink-0"
                  title="اسحب لإعادة الترتيب"
                  aria-label="اسحب لإعادة الترتيب"
                >
                  <GripVertical size={18} />
                </button>

                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition ${
                    section.isOpen
                      ? 'border-[#2F3336]'
                      : 'border-[#2F3336]/60 opacity-50'
                  }`}
                >
                  <Icon size={18} className={section.isOpen ? 'text-[#FFC500]' : 'text-[#71767B]'} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-bold truncate ${
                        section.isOpen ? 'text-white' : 'text-[#71767B] line-through'
                      }`}
                    >
                      {section.label}
                    </h3>
                    <span className="text-[10px] font-mono text-[#71767B] shrink-0">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#71767B]">
                    <span className={section.isOpen ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                      {section.isOpen ? 'مفتوح' : 'مغلق'}
                    </span>
                    <span>·</span>
                    <span>{section.isBuiltIn ? 'أساسي' : 'مضاف'}</span>
                  </div>
                </div>
              </div>

              {/* اليسار: زر حذف للمضاف + سويتش أندرويد للفتح والإغلاق */}
              <div className="flex items-center gap-2.5 shrink-0">
                {!section.isBuiltIn && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSection(section)}
                    disabled={saving}
                    className="w-8 h-8 rounded-full border border-[#2F3336] text-[#71767B] hover:text-red-400 hover:border-red-500/40 flex items-center justify-center transition cursor-pointer"
                    title="حذف القسم"
                    aria-label="حذف القسم"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <button
                  type="button"
                  role="switch"
                  aria-checked={section.isOpen}
                  aria-label={section.isOpen ? `إغلاق ${section.label}` : `فتح ${section.label}`}
                  onClick={() => handleToggleSection(section.id)}
                  disabled={saving}
                  dir="ltr"
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 cursor-pointer ${
                    section.isOpen
                      ? 'bg-[#FFC500] border-[#FFC500]'
                      : 'bg-[#16181C] border-[#2F3336]'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full shadow transition-transform duration-200 ${
                      section.isOpen
                        ? 'translate-x-6 bg-black'
                        : 'translate-x-1 bg-[#71767B]'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* نافذة إضافة قسم جديد (+) */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-[#000000] border-t sm:border border-[#2F3336] rounded-t-3xl sm:rounded-2xl overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#2F3336] mx-auto mt-2.5 sm:hidden" />
            <div className="px-4 py-3.5 border-b border-[#2F3336] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-[#FFC500]" />
                <h2 className="text-sm font-black">إضافة قسم جديد</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-[#71767B] hover:text-white cursor-pointer"
                aria-label="إغلاق"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  اسم القسم *
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="مثال: حراج السيارات أو الذهب"
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
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
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
