import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Plus,
  X,
  Trash2,
  Check,
  AlertTriangle,
  RefreshCw,
  LayoutGrid,
  GripVertical,
  CornerDownLeft,
  SlidersHorizontal,
  MessageSquare,
  ListChecks,
  BarChart3,
  Shield,
  Megaphone,
  Sparkles,
  Archive,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  type LucideIcon,
} from 'lucide-react';
import {
  CommunitySection,
  SECTION_ICON_OPTIONS,
  SpecializedCardStyle,
  fetchCommunitySections,
  getCachedCommunitySections,
  getSectionIcon,
  saveCommunitySections,
} from '../../../services/sectionsService';
import {
  checkSectionHistoricalUsage,
  getCurrentTabModulePermissions,
  logTabAdminAction,
  DEFAULT_FULL_PERMISSIONS,
  type TabModulePermissions,
} from '../../../services/communityTabsAdminService';
import { TabContentModerationPanel } from './TabContentModerationPanel';
import { TabFormsBuilderPanel } from './TabFormsBuilderPanel';
import { TabAnalyticsPanel } from './TabAnalyticsPanel';
import { TabPermissionsAuditPanel } from './TabPermissionsAuditPanel';

type AdminMainTab = 'tabs' | 'content' | 'forms' | 'analytics' | 'permissions';

const CARD_STYLE_OPTIONS: Array<{ value: SpecializedCardStyle; label: string }> = [
  { value: 'phone', label: 'بطاقة هواتف' },
  { value: 'property', label: 'بطاقة عقارات' },
  { value: 'job', label: 'بطاقة وظائف' },
  { value: 'auction', label: 'بطاقة مزادات' },
  { value: 'custom', label: 'بطاقة مخصصة (من حقول النموذج)' },
];

export const SectionsManager: React.FC = () => {
  const [mainTab, setMainTab] = useState<AdminMainTab>('tabs');
  const [focusedSectionId, setFocusedSectionId] = useState<string>('');
  const [permissions, setPermissions] = useState<TabModulePermissions>(DEFAULT_FULL_PERMISSIONS);
  const [userRole, setUserRole] = useState<string>('admin');

  const [sections, setSections] = useState<CommunitySection[]>(() => getCachedCommunitySections());
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [pendingDeleteSection, setPendingDeleteSection] = useState<CommunitySection | null>(null);
  const [deleteUsageInfo, setDeleteUsageInfo] = useState<{
    loading: boolean;
    postsCount: number;
    listingsCount: number;
    fieldsCount: number;
    total: number;
  }>({ loading: false, postsCount: 0, listingsCount: 0, fieldsCount: 0, total: 0 });

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdxRef = useRef<number | null>(null);
  const dragOverIdxRef = useRef<number | null>(null);

  // نافذة الإضافة الجديدة
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIconName, setNewIconName] = useState('Store');
  const [newParentId, setNewParentId] = useState<string>('');
  const [newTargetRoute, setNewTargetRoute] = useState('');
  const [newCardStyle, setNewCardStyle] = useState<SpecializedCardStyle>('custom');
  const [newAllowFreeTweets, setNewAllowFreeTweets] = useState(true);
  const [newAllowSpecializedAds, setNewAllowSpecializedAds] = useState(true);
  const [newAllowSponsorAndBanners, setNewAllowSponsorAndBanners] = useState(true);
  const [formError, setFormError] = useState('');

  // نافذة تعديل وإعدادات التبويب المستقلة
  const [editingSection, setEditingSection] = useState<CommunitySection | null>(null);

  const loadSections = async () => {
    setLoading(true);
    try {
      const [data, permRes] = await Promise.all([
        fetchCommunitySections(),
        getCurrentTabModulePermissions(),
      ]);
      setSections(data);
      setPermissions(permRes.permissions);
      setUserRole(permRes.role);

      // اختيار أول تبويب مسموح للمشرف تلقائياً
      if (!permRes.permissions.manageTabs) {
        if (permRes.permissions.manageContent) setMainTab('content');
        else if (permRes.permissions.manageForms) setMainTab('forms');
        else if (permRes.permissions.viewAnalytics) setMainTab('analytics');
        else setMainTab('permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const persistSections = async (
    next: CommunitySection[],
    successText: string,
    auditAction?: { action: string; sectionId?: string; details?: Record<string, any> }
  ) => {
    setSections(next);
    setSaving(true);
    const res = await saveCommunitySections(next);
    setSaving(false);

    if (res.syncedToCloud) {
      setCloudStatus({
        type: 'success',
        message: `${successText} — تمت المزامنة مع السحابة.`,
      });
      if (auditAction) {
        await logTabAdminAction({
          module: 'tabs',
          action: auditAction.action,
          sectionId: auditAction.sectionId || null,
          details: auditAction.details || {},
        });
      }
    } else if (res.rlsBlocked) {
      setCloudStatus({
        type: 'warning',
        message: `${successText} محلياً، وتعذر الحفظ السحابي لعدم توفر صلاحية مشرف نشطة في الجلسة (سجّل الدخول بحساب الإدارة).`,
      });
    } else {
      setCloudStatus({
        type: 'warning',
        message: `${successText} محلياً (${res.error || 'تعذر الحفظ السحابي'}).`,
      });
    }
  };

  const handleToggleSection = async (sectionId: string) => {
    if (!permissions.manageTabs) return;
    const target = sections.find((s) => s.id === sectionId);
    if (!target) return;
    const nextState = !target.isOpen;
    const next = sections.map((s) =>
      s.id === sectionId ? { ...s, isOpen: nextState, isVisiblePublic: nextState } : s
    );
    await persistSections(
      next,
      nextState ? `تم فتح قسم "${target.label}"` : `تم إغلاق قسم "${target.label}"`,
      {
        action: nextState ? `تفعيل قسم "${target.label}"` : `إيقاف قسم "${target.label}"`,
        sectionId,
        details: { isOpen: nextState },
      }
    );
  };

  const commitReorder = async (fromIdx: number, toIdx: number) => {
    if (!permissions.manageTabs) return;
    if (
      fromIdx === toIdx ||
      fromIdx < 0 ||
      toIdx < 0 ||
      fromIdx >= sections.length ||
      toIdx >= sections.length
    ) {
      return;
    }
    const copy = [...sections];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    const reordered = copy.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    await persistSections(reordered, `تم ترتيب قسم "${moved.label}"`, {
      action: `إعادة ترتيب قسم "${moved.label}"`,
      sectionId: moved.id,
      details: { fromIdx, toIdx },
    });
  };

  const handleTouchStart = (index: number) => {
    if (!permissions.manageTabs) return;
    dragIdxRef.current = index;
    dragOverIdxRef.current = index;
    setDraggingIdx(index);
    setDragOverIdx(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragIdxRef.current === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const el = document
      .elementFromPoint(touch.clientX, touch.clientY)
      ?.closest('[data-section-index]') as HTMLElement | null;
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
    if (!permissions.manageTabs) return;
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
    if (sections.some((s) => !s.isArchived && s.label === label && (s.parentId || null) === parentIdVal)) {
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
      isVisiblePublic: true,
      allowPosting: true,
      allowFreeTweets: newAllowFreeTweets,
      allowSpecializedAds: newAllowSpecializedAds,
      allowSponsorAndBanners: newAllowSponsorAndBanners,
      allowHeaderSponsor: newAllowSponsorAndBanners,
      allowSlot1Banner: newAllowSponsorAndBanners,
      allowSlot2Banner: newAllowSponsorAndBanners,
      specializedCardStyle: newCardStyle,
      requireApproval: false,
      isArchived: false,
    };

    const next = [...sections, newSection];
    setNewLabel('');
    setNewDescription('');
    setNewIconName('Store');
    setNewParentId('');
    setNewTargetRoute('');
    setNewCardStyle('custom');
    setNewAllowFreeTweets(true);
    setNewAllowSpecializedAds(true);
    setNewAllowSponsorAndBanners(true);
    setFormError('');
    setIsAddOpen(false);
    await persistSections(next, `تمت إضافة قسم "${label}"`, {
      action: `إضافة تبويب جديد "${label}"`,
      sectionId: id,
      details: { parentId: parentIdVal, cardStyle: newCardStyle },
    });
  };

  const handleSaveEditedSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !permissions.manageTabs) return;
    if (!editingSection.label.trim()) return;

    const updatedSection: CommunitySection = {
      ...editingSection,
      label: editingSection.label.trim(),
      description: (editingSection.description || '').trim(),
      targetRoute: (editingSection.targetRoute || '').trim(),
    };

    const next = sections.map((s) => (s.id === updatedSection.id ? updatedSection : s));
    setEditingSection(null);
    await persistSections(next, `تم حفظ إعدادات "${updatedSection.label}"`, {
      action: `تحديث إعدادات قسم "${updatedSection.label}"`,
      sectionId: updatedSection.id,
      details: {
        isOpen: updatedSection.isOpen,
        isVisiblePublic: updatedSection.isVisiblePublic,
        allowPosting: updatedSection.allowPosting,
        allowFreeTweets: updatedSection.allowFreeTweets,
        allowSpecializedAds: updatedSection.allowSpecializedAds,
        allowSponsorAndBanners: updatedSection.allowSponsorAndBanners,
        allowHeaderSponsor: updatedSection.allowHeaderSponsor,
        allowSlot1Banner: updatedSection.allowSlot1Banner,
        allowSlot2Banner: updatedSection.allowSlot2Banner,
        specializedCardStyle: updatedSection.specializedCardStyle,
      },
    });
  };

  const handleSelectForDelete = async (section: CommunitySection) => {
    if (!isDeleteMode || !permissions.manageTabs) return;
    if (section.isBuiltIn) {
      setCloudStatus({
        type: 'warning',
        message: `قسم "${section.label}" أساسي ولا يمكن حذفه، يمكنك إغلاقه أو إخفاؤه من الإعدادات.`,
      });
      return;
    }
    setPendingDeleteSection(section);
    setDeleteUsageInfo({ loading: true, postsCount: 0, listingsCount: 0, fieldsCount: 0, total: 0 });
    try {
      const usage = await checkSectionHistoricalUsage(section.id);
      setDeleteUsageInfo({ loading: false, ...usage });
    } catch {
      setDeleteUsageInfo({ loading: false, postsCount: 0, listingsCount: 0, fieldsCount: 0, total: 0 });
    }
  };

  const handleArchiveSection = async (section: CommunitySection) => {
    setPendingDeleteSection(null);
    setIsDeleteMode(false);
    const next = sections.map((s) =>
      s.id === section.id || s.parentId === section.id
        ? { ...s, isArchived: true, isOpen: false, isVisiblePublic: false }
        : s
    );
    await persistSections(next, `تمت أرشفة قسم "${section.label}" مع حفظ بياناته التاريخية`, {
      action: `أرشفة قسم "${section.label}" بأمان`,
      sectionId: section.id,
    });
  };

  const handleRestoreArchived = async (section: CommunitySection) => {
    const next = sections.map((s) =>
      s.id === section.id ? { ...s, isArchived: false, isOpen: true, isVisiblePublic: true } : s
    );
    await persistSections(next, `تمت استعادة قسم "${section.label}"`, {
      action: `استعادة قسم "${section.label}" من الأرشيف`,
      sectionId: section.id,
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteSection || !permissions.manageTabs) return;
    const target = pendingDeleteSection;
    if (deleteUsageInfo.total > 0) {
      await handleArchiveSection(target);
      return;
    }
    setPendingDeleteSection(null);
    setIsDeleteMode(false);
    const next = sections.filter((s) => s.id !== target.id && s.parentId !== target.id);
    await persistSections(next, `تم حذف قسم "${target.label}"`, {
      action: `حذف نهائي لقسم فارغ "${target.label}"`,
      sectionId: target.id,
    });
  };

  const activeSections = sections.filter((s) => !s.isArchived);
  const archivedSections = sections.filter((s) => s.isArchived);
  const topLevelSections = activeSections.filter((s) => !s.parentId);
  const openCount = activeSections.filter((s) => s.isOpen).length;
  const visiblePublicCount = activeSections.filter((s) => s.isOpen && s.isVisiblePublic !== false).length;
  const postingEnabledCount = activeSections.filter((s) => s.isOpen && s.allowPosting !== false).length;

  const orderedDisplayEntries: Array<{
    section: CommunitySection;
    realIndex: number;
    isChild: boolean;
    parentLabel?: string;
  }> = [];

  sections.forEach((sec, idx) => {
    if (sec.isArchived) return;
    if (!sec.parentId) {
      orderedDisplayEntries.push({ section: sec, realIndex: idx, isChild: false });
      sections.forEach((child, cIdx) => {
        if (!child.isArchived && child.parentId === sec.id) {
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
  sections.forEach((sec, idx) => {
    if (!sec.isArchived && sec.parentId && !activeSections.some((p) => p.id === sec.parentId)) {
      orderedDisplayEntries.push({ section: sec, realIndex: idx, isChild: true });
    }
  });

  const navTabs: Array<{
    id: AdminMainTab;
    label: string;
    icon: LucideIcon;
    allowed: boolean;
  }> = [
    { id: 'tabs', label: 'التبويبات والإعدادات', icon: LayoutGrid, allowed: permissions.manageTabs },
    { id: 'content', label: 'المحتوى المركزي', icon: MessageSquare, allowed: permissions.manageContent },
    { id: 'forms', label: 'النماذج والقوائم', icon: ListChecks, allowed: permissions.manageForms },
    { id: 'analytics', label: 'الإحصائيات', icon: BarChart3, allowed: permissions.viewAnalytics },
    { id: 'permissions', label: 'الصلاحيات والسجل', icon: Shield, allowed: true },
  ];

  const jumpToSectionForms = (sectionId: string) => {
    setFocusedSectionId(sectionId);
    setMainTab('forms');
  };

  const jumpToSectionContent = (sectionId: string) => {
    setFocusedSectionId(sectionId);
    setMainTab('content');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#000000] text-white font-['Cairo',sans-serif] max-w-5xl mx-auto pb-20">
      {/* الترويسة الموحدة */}
      <div className="sticky top-16 z-20 bg-[#000000]/95 backdrop-blur-md border-b border-[#2F3336]">
        <div className="px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FFC500]/10 border border-[#FFC500]/30 flex items-center justify-center shrink-0">
              <LayoutGrid size={18} className="text-[#FFC500]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                إدارة تبويبات المجتمع والأقسام
              </h1>
              <p className="text-[11px] text-[#71767B] leading-tight mt-0.5 truncate">
                {visiblePublicCount} ظاهر للموقع · {postingEnabledCount} يقبل النشر · الدور: {userRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {permissions.manageAds && (
              <>
                <NavLink
                  to="/admin/sponsor"
                  className="px-2.5 py-1.5 rounded-full bg-[#0B0F17] border border-[#2F3336] hover:border-white/40 text-[11px] font-bold text-[#FFC500] flex items-center gap-1 transition"
                >
                  <Sparkles size={13} />
                  <span>الراعي</span>
                </NavLink>
                <NavLink
                  to="/admin/ads"
                  className="px-2.5 py-1.5 rounded-full bg-[#0B0F17] border border-[#2F3336] hover:border-white/40 text-[11px] font-bold text-zinc-200 flex items-center gap-1 transition"
                >
                  <Megaphone size={13} className="text-[#FFC500]" />
                  <span>البانرات</span>
                </NavLink>
              </>
            )}

            <button
              type="button"
              onClick={loadSections}
              disabled={loading || saving}
              className="p-2 rounded-full border border-[#2F3336] text-[#71767B] hover:text-white transition cursor-pointer"
              title="تحديث"
              aria-label="تحديث"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            {mainTab === 'tabs' && permissions.manageTabs && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteMode((prev) => !prev);
                    setPendingDeleteSection(null);
                  }}
                  className={`p-2 rounded-full border transition cursor-pointer ${
                    isDeleteMode
                      ? 'border-red-500 text-red-400 bg-red-500/10'
                      : 'border-[#2F3336] text-[#71767B] hover:text-red-400'
                  }`}
                  title="حذف / أرشفة قسم"
                  aria-label="حذف / أرشفة قسم"
                >
                  <Trash2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteMode(false);
                    setFormError('');
                    setNewParentId('');
                    setIsAddOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black font-black text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
                >
                  <Plus size={15} className="stroke-[2.5]" />
                  <span>تبويب جديد</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* شريط التبويبات الداخلية على نمط X */}
        <div className="px-3 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navTabs
            .filter((t) => t.allowed)
            .map((tab) => {
              const Icon = tab.icon;
              const active = mainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMainTab(tab.id)}
                  className={`relative px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                    active ? 'text-white' : 'text-[#71767B] hover:text-zinc-200'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-[#FFC500]' : ''} />
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-0 right-3 left-3 h-0.5 rounded-full bg-[#FFC500]" />
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* تنبيه حالة الحفظ */}
      {cloudStatus && (
        <div
          className={`mx-4 mt-3 p-3 rounded-2xl border text-xs flex items-start justify-between gap-2.5 ${
            cloudStatus.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
              : 'border-[#FFC500]/30 bg-[#FFC500]/5 text-zinc-200'
          }`}
        >
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
      )}

      {/* محتوى التبويب 1: التبويبات والإعدادات */}
      {mainTab === 'tabs' && permissions.manageTabs && (
        <div className="p-3 sm:p-4 space-y-4">
          {/* بطاقات ملخص سريعة */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#0B0F17] border border-[#2F3336] rounded-xl p-3">
              <div className="text-[11px] text-[#71767B] font-bold">إجمالي التبويبات</div>
              <div className="text-lg font-black text-white mt-0.5">{activeSections.length}</div>
            </div>
            <div className="bg-[#0B0F17] border border-[#2F3336] rounded-xl p-3">
              <div className="text-[11px] text-[#71767B] font-bold">مفتوح ونشط</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">{openCount}</div>
            </div>
            <div className="bg-[#0B0F17] border border-[#2F3336] rounded-xl p-3">
              <div className="text-[11px] text-[#71767B] font-bold">ظاهر للجمهور</div>
              <div className="text-lg font-black text-[#FFC500] mt-0.5">{visiblePublicCount}</div>
            </div>
            <div className="bg-[#0B0F17] border border-[#2F3336] rounded-xl p-3">
              <div className="text-[11px] text-[#71767B] font-bold">مؤرشف</div>
              <div className="text-lg font-black text-zinc-400 mt-0.5">{archivedSections.length}</div>
            </div>
          </div>

          {isDeleteMode && (
            <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-2 text-xs">
              <span className="text-red-300 font-bold">
                اضغط على القسم المضاف الذي تريد حذفه أو أرشفته بأمان
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteMode(false);
                  setPendingDeleteSection(null);
                }}
                className="text-white font-bold px-2.5 py-1 rounded-full bg-white/10 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          )}

          {/* معاينة شريط المجتمع العام */}
          <div className="px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2F3336] flex items-center gap-3 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] text-[#71767B] shrink-0">شريط الموقع العام:</span>
            <span className="font-bold text-white shrink-0">لك</span>
            <span className="font-bold text-[#71767B] shrink-0">متابعة</span>
            {topLevelSections
              .filter((s) => s.isOpen && s.isVisiblePublic !== false)
              .map((s) => {
                const Icon = getSectionIcon(s.iconName);
                return (
                  <span key={s.id} className="font-bold text-white flex items-center gap-1 shrink-0">
                    <Icon size={13} className="text-[#FFC500]" />
                    <span>{s.label}</span>
                  </span>
                );
              })}
          </div>

          {/* قائمة الأقسام مع السحب والإفلات */}
          <div className="space-y-1.5">
            {orderedDisplayEntries.map(({ section, realIndex, isChild, parentLabel }) => {
              const Icon = getSectionIcon(section.iconName);
              const isDragging = draggingIdx === realIndex;
              const isDropTarget =
                dragOverIdx === realIndex && draggingIdx !== null && draggingIdx !== realIndex;
              const isSelectedForDelete = pendingDeleteSection?.id === section.id;
              const canSelectToDelete = isDeleteMode && !section.isBuiltIn;

              const visiblePublic = section.isVisiblePublic !== false;
              const allowPosting = section.allowPosting !== false;
              const allowFree = section.allowFreeTweets !== false;
              const allowSpec = section.allowSpecializedAds !== false;
              const allowAds = section.allowSponsorAndBanners !== false;

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
                  className={`p-3 rounded-2xl border border-[#2F3336] bg-[#0B0F17] flex items-center justify-between gap-2.5 transition select-none ${
                    isChild ? 'mr-6' : ''
                  } ${isDragging ? 'opacity-50' : 'hover:border-white/25'} ${
                    isDropTarget ? 'ring-1 ring-[#FFC500]' : ''
                  } ${
                    isSelectedForDelete
                      ? 'bg-red-500/15 border-red-500'
                      : canSelectToDelete
                        ? 'cursor-pointer border-red-500/40'
                        : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onTouchStart={() => handleTouchStart(realIndex)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-[#71767B] hover:text-white touch-none cursor-grab active:cursor-grabbing shrink-0"
                      title="اسحب لإعادة الترتيب"
                    >
                      <GripVertical size={16} />
                    </button>

                    {isChild && <CornerDownLeft size={13} className="text-[#71767B] shrink-0" />}

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        section.isOpen ? 'bg-[#FFC500]/10 text-[#FFC500]' : 'bg-white/5 text-[#71767B]'
                      }`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm font-black truncate ${
                            section.isOpen ? 'text-white' : 'text-[#71767B] line-through'
                          }`}
                        >
                          {section.label}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#71767B]">
                          {isChild ? `فرعي تحت ${parentLabel || 'قسم'}` : section.isBuiltIn ? 'أساسي' : 'مضاف'}
                        </span>
                        {!visiblePublic && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 flex items-center gap-1">
                            <EyeOff size={10} /> مخفي عاماً
                          </span>
                        )}
                        {!allowPosting && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 flex items-center gap-1">
                            <Lock size={10} /> النشر مغلق
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[10px] text-[#71767B]">
                        <span className={allowFree ? 'text-emerald-400' : 'text-zinc-600 line-through'}>
                          تغريدات مجانية
                        </span>
                        <span>·</span>
                        <span className={allowSpec ? 'text-emerald-400' : 'text-zinc-600 line-through'}>
                          إعلانات متخصصة
                        </span>
                        <span>·</span>
                        <span className={allowAds ? 'text-[#FFC500]' : 'text-zinc-600 line-through'}>
                          راعي وبانرات
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* إجراءات التبويب */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {permissions.manageForms && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToSectionForms(section.id);
                        }}
                        className="hidden sm:inline-flex p-1.5 rounded-lg border border-[#2F3336] text-[#71767B] hover:text-white transition cursor-pointer"
                        title="إدارة نموذج الإدخال والقوائم"
                      >
                        <ListChecks size={15} />
                      </button>
                    )}

                    {permissions.manageContent && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToSectionContent(section.id);
                        }}
                        className="hidden sm:inline-flex p-1.5 rounded-lg border border-[#2F3336] text-[#71767B] hover:text-white transition cursor-pointer"
                        title="عرض محتوى القسم"
                      >
                        <MessageSquare size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSection({ ...section });
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-[#2F3336] hover:border-[#FFC500]/50 text-xs font-bold text-zinc-200 hover:text-[#FFC500] flex items-center gap-1 transition cursor-pointer"
                      title="إعدادات وتعديل التبويب"
                    >
                      <SlidersHorizontal size={13} />
                      <span className="hidden md:inline">إعدادات</span>
                    </button>

                    {!isChild && !isDeleteMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormError('');
                          setNewParentId(section.id);
                          setIsAddOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-[#2F3336] text-[#71767B] hover:text-[#FFC500] transition cursor-pointer"
                        title={`إضافة قسم فرعي تحت ${section.label}`}
                      >
                        <Plus size={14} />
                      </button>
                    )}

                    <button
                      type="button"
                      role="switch"
                      aria-checked={section.isOpen}
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

          {/* الأقسام المؤرشفة */}
          {archivedSections.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className="text-xs font-bold text-[#71767B] hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Archive size={14} />
                <span>الأقسام المؤرشفة ({archivedSections.length})</span>
              </button>
              {showArchived && (
                <div className="mt-2 space-y-1.5">
                  {archivedSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-3 rounded-xl border border-[#2F3336] bg-[#0B0F17]/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-zinc-300">{sec.label}</span>
                        <span className="text-[11px] text-[#71767B] mr-2">محفوظ مع بياناته التاريخية</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreArchived(sec)}
                        className="px-3 py-1 rounded-full bg-[#FFC500]/15 text-[#FFC500] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>استعادة</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* التبويب 2: إدارة المحتوى المركزي */}
      {mainTab === 'content' && permissions.manageContent && (
        <div className="p-3 sm:p-4">
          <TabContentModerationPanel
            sections={sections}
            initialSectionFilter={focusedSectionId || 'all'}
            onGoToSection={(secId) => {
              const target = sections.find((s) => s.id === secId || (secId === 'realestate' && s.id === 'properties'));
              setMainTab('tabs');
              if (target) setEditingSection({ ...target });
            }}
          />
        </div>
      )}

      {/* التبويب 3: إدارة النماذج والقوائم */}
      {mainTab === 'forms' && permissions.manageForms && (
        <div className="p-3 sm:p-4">
          <TabFormsBuilderPanel
            sections={sections}
            selectedSectionId={focusedSectionId || activeSections[0]?.id || 'phones'}
            onSelectSectionId={setFocusedSectionId}
          />
        </div>
      )}

      {/* التبويب 4: الإحصائيات الفعلية */}
      {mainTab === 'analytics' && permissions.viewAnalytics && (
        <div className="p-3 sm:p-4">
          <TabAnalyticsPanel sections={sections} />
        </div>
      )}

      {/* التبويب 5: الصلاحيات وسجل العمليات */}
      {mainTab === 'permissions' && (
        <div className="p-3 sm:p-4">
          <TabPermissionsAuditPanel canManagePermissions={permissions.managePermissions} />
        </div>
      )}

      {/* نافذة الحذف / الأرشفة الآمنة */}
      {pendingDeleteSection && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPendingDeleteSection(null)}
        >
          <div
            className="w-full max-w-md bg-[#000000] border border-[#2F3336] rounded-2xl p-5 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-black text-white">حذف أو أرشفة القسم بأمان</h3>
            </div>

            {deleteUsageInfo.loading ? (
              <p className="text-xs text-[#71767B]">جاري فحص البيانات التاريخية المرتبطة بالقسم...</p>
            ) : deleteUsageInfo.total > 0 ? (
              <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                <p>
                  القسم <span className="text-white font-bold">"{pendingDeleteSection.label}"</span> مرتبط ببيانات تاريخية:
                </p>
                <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2F3336] text-[11px] space-y-1">
                  <div>التغريدات المرتبطة: <strong className="text-white">{deleteUsageInfo.postsCount}</strong></div>
                  <div>الإعلانات المتخصصة: <strong className="text-white">{deleteUsageInfo.listingsCount}</strong></div>
                  <div>حقول النموذج: <strong className="text-white">{deleteUsageInfo.fieldsCount}</strong></div>
                </div>
                <p className="text-amber-300">
                  لحماية البيانات والمنشورات التاريخية من الضياع، سيتم <strong>أرشفة القسم وإخفاؤه</strong> بدلاً من الحذف النهائي.
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-300 leading-relaxed">
                لا توجد منشورات أو حقول مرتبطة بقسم <span className="text-white font-bold">"{pendingDeleteSection.label}"</span>. يمكنك حذفه نهائياً أو أرشفته.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingDeleteSection(null)}
                className="px-4 py-2 rounded-full border border-[#2F3336] text-xs font-bold text-white hover:border-white transition cursor-pointer"
              >
                إلغاء
              </button>
              {deleteUsageInfo.total === 0 && (
                <button
                  type="button"
                  onClick={() => handleArchiveSection(pendingDeleteSection)}
                  className="px-4 py-2 rounded-full border border-[#2F3336] text-xs font-bold text-[#FFC500] hover:border-[#FFC500] transition cursor-pointer"
                >
                  أرشفة فقط
                </button>
              )}
              <button
                type="button"
                disabled={deleteUsageInfo.loading}
                onClick={handleConfirmDelete}
                className={`px-4 py-2 rounded-full text-white text-xs font-black transition cursor-pointer ${
                  deleteUsageInfo.total > 0 ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleteUsageInfo.total > 0 ? 'أرشفة وإخفاء آمن' : 'تأكيد الحذف النهائي'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إعدادات وتعديل التبويب المستقلة */}
      {editingSection && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setEditingSection(null)}
        >
          <div
            className="w-full sm:max-w-lg bg-[#000000] border-t sm:border border-[#2F3336] rounded-t-3xl sm:rounded-2xl overflow-hidden text-white max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3.5 border-b border-[#2F3336] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={17} className="text-[#FFC500]" />
                <h2 className="text-sm font-black">إعدادات تبويب: {editingSection.label}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="p-1 text-[#71767B] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSection} className="p-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">اسم التبويب *</label>
                  <input
                    type="text"
                    value={editingSection.label}
                    onChange={(e) => setEditingSection({ ...editingSection, label: e.target.value })}
                    className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1">نمط بطاقة الإعلان المتخصص</label>
                  <select
                    value={editingSection.specializedCardStyle || 'custom'}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        specializedCardStyle: e.target.value as SpecializedCardStyle,
                      })
                    }
                    className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {CARD_STYLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">الوصف المختصر</label>
                <input
                  type="text"
                  value={editingSection.description || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">مسار مرتبط (اختياري)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingSection.targetRoute || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, targetRoute: e.target.value })}
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">أيقونة القسم</label>
                <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto">
                  {SECTION_ICON_OPTIONS.map((opt) => {
                    const Icon = getSectionIcon(opt.name);
                    const selected = editingSection.iconName === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setEditingSection({ ...editingSection, iconName: opt.name })}
                        className={`p-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 cursor-pointer ${
                          selected
                            ? 'border-white text-white bg-white/5'
                            : 'border-[#2F3336] text-[#71767B] hover:text-white'
                        }`}
                      >
                        <Icon size={14} className={selected ? 'text-[#FFC500]' : ''} />
                        <span className="truncate w-full text-center">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* مفاتيح التشغيل المستقلة */}
              <div className="p-3 rounded-2xl bg-[#0B0F17] border border-[#2F3336] space-y-2.5">
                <div className="text-xs font-black text-[#FFC500]">إعدادات التشغيل والظهور المستقلة</div>

                {[
                  {
                    key: 'isOpen',
                    label: 'تفعيل القسم إدارياً',
                    val: editingSection.isOpen,
                    icon: Check,
                  },
                  {
                    key: 'isVisiblePublic',
                    label: 'الظهور في الموقع العام',
                    val: editingSection.isVisiblePublic !== false,
                    icon: editingSection.isVisiblePublic !== false ? Eye : EyeOff,
                  },
                  {
                    key: 'allowPosting',
                    label: 'السماح بالنشر داخل هذا القسم',
                    val: editingSection.allowPosting !== false,
                    icon: editingSection.allowPosting !== false ? Unlock : Lock,
                  },
                  {
                    key: 'allowFreeTweets',
                    label: 'السماح بالتغريدات العادية المجانية',
                    val: editingSection.allowFreeTweets !== false,
                    icon: MessageSquare,
                  },
                  {
                    key: 'allowSpecializedAds',
                    label: 'السماح بالإعلانات المتخصصة المدفوعة',
                    val: editingSection.allowSpecializedAds !== false,
                    icon: Sparkles,
                  },
                  {
                    key: 'allowSponsorAndBanners',
                    label: 'السماح بإعلانات الراعي والبانرات',
                    val: editingSection.allowSponsorAndBanners !== false,
                    icon: Megaphone,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <label
                      key={item.key}
                      className="flex items-center justify-between gap-2 py-1 text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-zinc-200 font-bold">
                        <Icon size={14} className="text-[#FFC500]" />
                        {item.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={item.val}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#FFC500] cursor-pointer"
                      />
                    </label>
                  );
                })}

                {editingSection.allowSponsorAndBanners !== false && (
                  <div className="pr-5 pt-2 border-t border-[#2F3336] space-y-2">
                    <div className="text-[11px] font-bold text-[#71767B]">
                      التحكم المستقل في المواضع الإعلانية الـ 3:
                    </div>
                    {[
                      {
                        key: 'allowHeaderSponsor',
                        label: '1. إعلان الراعي الرئيسي أعلى التبويب',
                        val: editingSection.allowHeaderSponsor !== false,
                      },
                      {
                        key: 'allowSlot1Banner',
                        label: '2. وحدة البانر الأولى بين المنشورات',
                        val: editingSection.allowSlot1Banner !== false,
                      },
                      {
                        key: 'allowSlot2Banner',
                        label: '3. وحدة البانر الثانية بين المنشورات',
                        val: editingSection.allowSlot2Banner !== false,
                      },
                    ].map((slotItem) => (
                      <label
                        key={slotItem.key}
                        className="flex items-center justify-between gap-2 text-[11px] text-zinc-300 cursor-pointer"
                      >
                        <span>{slotItem.label}</span>
                        <input
                          type="checkbox"
                          checked={slotItem.val}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              [slotItem.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-[#FFC500] cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* اختصارات سريعة للتبويب */}
              <div className="flex items-center gap-2 flex-wrap">
                {permissions.manageForms && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = editingSection.id;
                      setEditingSection(null);
                      jumpToSectionForms(id);
                    }}
                    className="px-3 py-1.5 rounded-full border border-[#2F3336] text-[11px] font-bold text-zinc-200 hover:border-white cursor-pointer"
                  >
                    إدارة نموذج هذا التبويب
                  </button>
                )}
                {permissions.manageContent && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = editingSection.id;
                      setEditingSection(null);
                      jumpToSectionContent(id);
                    }}
                    className="px-3 py-1.5 rounded-full border border-[#2F3336] text-[11px] font-bold text-zinc-200 hover:border-white cursor-pointer"
                  >
                    مراقبة منشورات التبويب
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2F3336]">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 rounded-full border border-[#2F3336] text-xs font-bold text-white hover:border-white cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-xs font-black cursor-pointer"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة قسم / تبويب مستقبلي جديد */}
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
                  {newParentId ? 'إضافة قسم فرعي' : 'إضافة تبويب مجتمع جديد'}
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

            <form onSubmit={handleAddSection} className="p-4 space-y-3.5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-white mb-1">مستوى القسم</label>
                <select
                  value={newParentId}
                  onChange={(e) => setNewParentId(e.target.value)}
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
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
                <label className="block text-xs font-bold text-white mb-1">اسم القسم *</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="مثال: سيارات، إلكترونيات، خدمات..."
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white placeholder-[#71767B] outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">نمط بطاقة الإعلان المتخصص</label>
                <select
                  value={newCardStyle}
                  onChange={(e) => setNewCardStyle(e.target.value as SpecializedCardStyle)}
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {CARD_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">وصف مختصر (اختياري)</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="وصف يظهر للمستخدمين داخل القسم"
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white placeholder-[#71767B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">مسار صفحة مرتبط (اختياري)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newTargetRoute}
                  onChange={(e) => setNewTargetRoute(e.target.value)}
                  placeholder="/businesses أو /prices"
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white placeholder-[#71767B] outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2F3336] space-y-2 text-xs">
                <div className="font-bold text-[#FFC500]">أنواع النشر والإعلانات المسموحة:</div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>التغريدات العادية المجانية</span>
                  <input
                    type="checkbox"
                    checked={newAllowFreeTweets}
                    onChange={(e) => setNewAllowFreeTweets(e.target.checked)}
                    className="accent-[#FFC500]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>الإعلانات المتخصصة المدفوعة</span>
                  <input
                    type="checkbox"
                    checked={newAllowSpecializedAds}
                    onChange={(e) => setNewAllowSpecializedAds(e.target.checked)}
                    className="accent-[#FFC500]"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>إعلانات الراعي والبانرات</span>
                  <input
                    type="checkbox"
                    checked={newAllowSponsorAndBanners}
                    onChange={(e) => setNewAllowSponsorAndBanners(e.target.checked)}
                    className="accent-[#FFC500]"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">أيقونة القسم</label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
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

              {formError && <p className="text-xs text-red-400 font-bold">{formError}</p>}

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
                  إضافة وفتح التبويب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
