import { supabase } from '../lib/supabase';
import { getAccess } from '../lib/access';
import type { CommunitySection } from './sectionsService';
import { adsDatabaseService, isAdCurrentlyValid, type ExtendedAdRecord } from './adsDatabaseService';

export type UnifiedContentSource =
  | 'posts'
  | 'jobs'
  | 'properties'
  | 'auctions'
  | 'community_tab_listings';

export interface UnifiedTabContentItem {
  id: string;
  sourceTable: UnifiedContentSource;
  sectionId: string;
  sectionLabel: string;
  contentKind: 'free' | 'specialized';
  title: string;
  body: string;
  authorId: string | null;
  authorName: string;
  authorUsername: string;
  authorCanPost: boolean;
  price?: number | null;
  currency?: string | null;
  city?: string | null;
  status: string;
  isHidden: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  moderationReason?: string | null;
  viewsCount: number;
  interactionsCount: number;
  reportsCount: number;
  createdAt: string;
  imageUrl?: string | null;
  metadata?: Record<string, any>;
}

export type TabFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'textarea'
  | 'boolean'
  | 'date'
  | 'tel'
  | 'url';

export interface TabFieldOption {
  id: string;
  field_id: string;
  section_id: string;
  option_value: string;
  option_label: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface TabFormField {
  id: string;
  section_id: string;
  field_key: string;
  label: string;
  field_type: TabFieldType;
  placeholder?: string | null;
  is_required: boolean;
  is_visible: boolean;
  is_active: boolean;
  card_display: boolean;
  sort_order: number;
  is_system: boolean;
  created_at?: string;
  options: TabFieldOption[];
}

export interface TabAuditLog {
  id: string;
  actor_id?: string | null;
  actor_name: string;
  actor_email?: string | null;
  module: 'tabs' | 'content' | 'forms' | 'ads' | 'permissions';
  action: string;
  section_id?: string | null;
  target_id?: string | null;
  details?: Record<string, any>;
  created_at: string;
}

export interface TabModulePermissions {
  manageTabs: boolean;
  manageContent: boolean;
  manageForms: boolean;
  manageAds: boolean;
  viewAnalytics: boolean;
  managePermissions: boolean;
}

export interface StaffTabPermissionEntry {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  permissions: TabModulePermissions;
}

export interface TabAnalyticsRow {
  sectionId: string;
  label: string;
  totalPosts: number;
  freePosts: number;
  specializedPosts: number;
  views: number;
  interactions: number;
  activeAds: number;
  reportsCount: number;
}

export interface UnifiedTabsAnalytics {
  totalPosts: number;
  freePosts: number;
  specializedPosts: number;
  totalViews: number;
  totalInteractions: number;
  activeAdsCount: number;
  pendingReportsCount: number;
  perTab: TabAnalyticsRow[];
}

const PERMISSIONS_TABLE = 'community_tabs_permissions';

export const DEFAULT_FULL_PERMISSIONS: TabModulePermissions = {
  manageTabs: true,
  manageContent: true,
  manageForms: true,
  manageAds: true,
  viewAnalytics: true,
  managePermissions: true,
};

export const DEFAULT_LIMITED_PERMISSIONS: TabModulePermissions = {
  manageTabs: false,
  manageContent: true,
  manageForms: false,
  manageAds: false,
  viewAnalytics: true,
  managePermissions: false,
};

function normalizeSectionIdForMatch(sectionId: string): string {
  return sectionId === 'realestate' ? 'properties' : sectionId;
}

function inferPostSectionId(post: any, sections: CommunitySection[]): string {
  if (post.section_id) return normalizeSectionIdForMatch(String(post.section_id));
  const text = String(post.content || '').toLowerCase();
  for (const sec of sections) {
    const lbl = sec.label.toLowerCase();
    const tag = lbl.replace(/\s+/g, '_');
    if (text.includes(`#${lbl}`) || text.includes(`#${tag}`)) {
      return sec.id;
    }
  }
  return 'community';
}

// 1. تسجيل سجل العمليات الإدارية
export async function logTabAdminAction(params: {
  module: TabAuditLog['module'];
  action: string;
  sectionId?: string | null;
  targetId?: string | null;
  details?: Record<string, any>;
}): Promise<void> {
  try {
    const acc = await getAccess();
    let actorName = acc.email || 'مشرف النظام';
    let actorEmail = acc.email || null;
    if (acc.userId) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', acc.userId)
        .maybeSingle();
      if (prof?.full_name) actorName = prof.full_name;
      if (prof?.email) actorEmail = prof.email;
    }

    await supabase.from('community_tabs_audit_logs').insert({
      actor_id: acc.userId || null,
      actor_name: actorName,
      actor_email: actorEmail,
      module: params.module,
      action: params.action,
      section_id: params.sectionId || null,
      target_id: params.targetId || null,
      details: params.details || {},
    });
  } catch {
    // عدم تعطيل العملية الإدارية إذا تعذر التسجيل
  }
}

export async function fetchTabAuditLogs(limit = 60): Promise<TabAuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('community_tabs_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as TabAuditLog[];
  } catch {
    return [];
  }
}

// 2. فحص البيانات التاريخية لقسم قبل الحذف الآمن
export async function checkSectionHistoricalUsage(sectionId: string): Promise<{
  postsCount: number;
  listingsCount: number;
  fieldsCount: number;
  total: number;
}> {
  const norm = normalizeSectionIdForMatch(sectionId);
  const [postsRes, listingsRes, fieldsRes] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('section_id', norm),
    supabase.from('community_tab_listings').select('id', { count: 'exact', head: true }).eq('section_id', norm),
    supabase.from('community_tab_fields').select('id', { count: 'exact', head: true }).eq('section_id', norm),
  ]);

  const postsCount = postsRes.count || 0;
  const listingsCount = listingsRes.count || 0;
  const fieldsCount = fieldsRes.count || 0;
  return {
    postsCount,
    listingsCount,
    fieldsCount,
    total: postsCount + listingsCount + fieldsCount,
  };
}

// 3. إدارة المحتوى المركزي عبر جميع التبويبات
export async function fetchUnifiedTabContent(
  sections: CommunitySection[],
  options?: { sectionFilter?: string; kindFilter?: 'all' | 'free' | 'specialized'; limit?: number }
): Promise<UnifiedTabContentItem[]> {
  const secLabelMap = new Map<string, string>([
    ['community', 'المجتمع العام'],
    ['phones', 'سوق الهواتف'],
    ['jobs', 'الوظائف'],
    ['properties', 'العقارات'],
    ['auctions', 'المزادات'],
  ]);
  sections.forEach((s) => secLabelMap.set(s.id, s.label));

  const perTableLimit = Math.min(options?.limit || 100, 150);

  const [postsRes, jobsRes, propsRes, auctionsRes, tabListingsRes, profilesRes, reportsRes] =
    await Promise.allSettled([
      supabase.from('posts').select('*').is('parent_id', null).order('created_at', { ascending: false }).limit(perTableLimit),
      supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(perTableLimit),
      supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(perTableLimit),
      supabase.from('auctions').select('*').order('created_at', { ascending: false }).limit(perTableLimit),
      supabase.from('community_tab_listings').select('*').order('created_at', { ascending: false }).limit(perTableLimit),
      supabase.from('profiles').select('id, full_name, username, can_post, email'),
      supabase.from('reports').select('id, reported_item_id, status'),
    ]);

  const val = <T,>(res: PromiseSettledResult<{ data: T | null }>, fallback: T): T =>
    res.status === 'fulfilled' && res.value?.data ? res.value.data : fallback;

  const posts = val<any[]>(postsRes as any, []);
  const jobs = val<any[]>(jobsRes as any, []);
  const props = val<any[]>(propsRes as any, []);
  const auctions = val<any[]>(auctionsRes as any, []);
  const tabListings = val<any[]>(tabListingsRes as any, []);
  const profiles = val<any[]>(profilesRes as any, []);
  const reports = val<any[]>(reportsRes as any, []);

  const profileMap = new Map<string, any>();
  profiles.forEach((p) => profileMap.set(p.id, p));

  const reportsCountMap = new Map<string, number>();
  reports.forEach((r) => {
    if (r.reported_item_id) {
      reportsCountMap.set(r.reported_item_id, (reportsCountMap.get(r.reported_item_id) || 0) + 1);
    }
  });

  const items: UnifiedTabContentItem[] = [];

  posts.forEach((p) => {
    const prof = profileMap.get(p.user_id);
    const secId = inferPostSectionId(p, sections);
    const kind = p.post_kind === 'specialized' ? 'specialized' : 'free';
    items.push({
      id: p.id,
      sourceTable: 'posts',
      sectionId: secId,
      sectionLabel: secLabelMap.get(secId) || secId,
      contentKind: kind,
      title: String(p.content || '').slice(0, 70) || 'تغريدة بدون نص',
      body: p.content || '',
      authorId: p.user_id || null,
      authorName: prof?.full_name || 'مستخدم',
      authorUsername: prof?.username || 'user',
      authorCanPost: prof?.can_post !== false,
      status: p.status || (p.is_hidden ? 'hidden' : 'active'),
      isHidden: Boolean(p.is_hidden),
      isPinned: Boolean(p.is_pinned),
      isFeatured: Boolean(p.is_featured),
      viewsCount: Number(p.views_count || 0),
      interactionsCount: Number(p.likes_count || 0) + Number(p.comments_count || 0) + Number(p.reposts_count || 0),
      reportsCount: reportsCountMap.get(p.id) || 0,
      createdAt: p.created_at,
      imageUrl: p.image_url || null,
      metadata: p.metadata || {},
    });
  });

  jobs.forEach((j) => {
    const uid = j.entity_id || j.company_id || null;
    const prof = uid ? profileMap.get(uid) : null;
    items.push({
      id: j.id,
      sourceTable: 'jobs',
      sectionId: 'jobs',
      sectionLabel: secLabelMap.get('jobs') || 'الوظائف',
      contentKind: 'specialized',
      title: j.title || 'وظيفة',
      body: j.description || j.requirements || '',
      authorId: uid,
      authorName: prof?.full_name || 'جهة توظيف',
      authorUsername: prof?.username || 'employer',
      authorCanPost: prof ? prof.can_post !== false : true,
      city: j.city || null,
      status: j.status || 'active',
      isHidden: Boolean(j.is_hidden),
      isPinned: Boolean(j.is_pinned),
      isFeatured: Boolean(j.is_featured),
      moderationReason: j.moderation_reason || null,
      viewsCount: Number(j.views_count || 0),
      interactionsCount: 0,
      reportsCount: reportsCountMap.get(j.id) || 0,
      createdAt: j.created_at,
    });
  });

  props.forEach((pr) => {
    const uid = pr.owner_user_id || null;
    const prof = uid ? profileMap.get(uid) : null;
    items.push({
      id: pr.id,
      sourceTable: 'properties',
      sectionId: 'properties',
      sectionLabel: secLabelMap.get('properties') || 'العقارات',
      contentKind: 'specialized',
      title: pr.title || 'عقار',
      body: `${pr.property_type || ''} · ${pr.listing_type || ''} · ${pr.city || ''}`,
      authorId: uid,
      authorName: prof?.full_name || 'معلن عقاري',
      authorUsername: prof?.username || 'owner',
      authorCanPost: prof ? prof.can_post !== false : true,
      price: pr.price ?? null,
      currency: pr.currency || 'YER',
      city: pr.city || null,
      status: pr.status || 'active',
      isHidden: Boolean(pr.is_hidden),
      isPinned: Boolean(pr.is_pinned),
      isFeatured: Boolean(pr.is_featured),
      moderationReason: pr.moderation_reason || null,
      viewsCount: Number(pr.views_count || 0),
      interactionsCount: Number(pr.inquiries_count || 0),
      reportsCount: reportsCountMap.get(pr.id) || 0,
      createdAt: pr.created_at,
      imageUrl: Array.isArray(pr.image_urls) ? pr.image_urls[0] : null,
    });
  });

  auctions.forEach((a) => {
    const uid = a.seller_id || null;
    const prof = uid ? profileMap.get(uid) : null;
    items.push({
      id: a.id,
      sourceTable: 'auctions',
      sectionId: 'auctions',
      sectionLabel: secLabelMap.get('auctions') || 'المزادات',
      contentKind: 'specialized',
      title: a.title || 'مزاد',
      body: a.description || '',
      authorId: uid,
      authorName: a.seller_name || prof?.full_name || 'بائع',
      authorUsername: prof?.username || 'seller',
      authorCanPost: prof ? prof.can_post !== false : true,
      price: a.current_bid ?? a.starting_price ?? null,
      currency: a.currency || 'YER',
      city: a.city || null,
      status: a.status || 'active',
      isHidden: Boolean(a.is_hidden),
      isPinned: Boolean(a.is_pinned),
      isFeatured: Boolean(a.is_featured),
      moderationReason: a.moderation_reason || null,
      viewsCount: 0,
      interactionsCount: 0,
      reportsCount: reportsCountMap.get(a.id) || 0,
      createdAt: a.created_at,
      imageUrl: Array.isArray(a.images) ? a.images[0] : null,
    });
  });

  tabListings.forEach((tl) => {
    const prof = tl.user_id ? profileMap.get(tl.user_id) : null;
    const secId = normalizeSectionIdForMatch(tl.section_id);
    items.push({
      id: tl.id,
      sourceTable: 'community_tab_listings',
      sectionId: secId,
      sectionLabel: secLabelMap.get(secId) || secId,
      contentKind: 'specialized',
      title: tl.title || 'إعلان متخصص',
      body: tl.description || '',
      authorId: tl.user_id || null,
      authorName: prof?.full_name || 'معلن',
      authorUsername: prof?.username || 'user',
      authorCanPost: prof ? prof.can_post !== false : true,
      price: tl.price ?? null,
      currency: tl.currency || 'YER',
      city: tl.city || null,
      status: tl.status || 'active',
      isHidden: Boolean(tl.is_hidden),
      isPinned: Boolean(tl.is_pinned),
      isFeatured: Boolean(tl.is_featured),
      moderationReason: tl.moderation_reason || null,
      viewsCount: Number(tl.views_count || 0),
      interactionsCount: Number(tl.likes_count || 0),
      reportsCount: reportsCountMap.get(tl.id) || 0,
      createdAt: tl.created_at,
      imageUrl: Array.isArray(tl.images) ? tl.images[0] : null,
      metadata: tl.field_values || {},
    });
  });

  items.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return items.filter((item) => {
    if (options?.sectionFilter && options.sectionFilter !== 'all') {
      if (item.sectionId !== normalizeSectionIdForMatch(options.sectionFilter)) return false;
    }
    if (options?.kindFilter && options.kindFilter !== 'all') {
      if (item.contentKind !== options.kindFilter) return false;
    }
    return true;
  });
}

export async function moderateUnifiedContentItem(params: {
  item: UnifiedTabContentItem;
  action: 'hide' | 'restore' | 'pin' | 'unpin' | 'feature' | 'unfeature' | 'delete' | 'set_status';
  status?: string;
  reason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { item, action, status, reason } = params;
  const table = item.sourceTable;

  try {
    if (action === 'delete') {
      const { error } = await supabase.from(table).delete().eq('id', item.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const updates: Record<string, any> = {};
      if (action === 'hide') {
        updates.is_hidden = true;
        if (table !== 'posts' && reason) updates.moderation_reason = reason;
        if (table === 'community_tab_listings') updates.status = 'hidden';
      } else if (action === 'restore') {
        updates.is_hidden = false;
        if (table !== 'posts') updates.moderation_reason = null;
        if (table === 'community_tab_listings' || table === 'posts') updates.status = 'active';
      } else if (action === 'pin') {
        updates.is_pinned = true;
        if (table === 'posts') updates.pinned_at = new Date().toISOString();
      } else if (action === 'unpin') {
        updates.is_pinned = false;
        if (table === 'posts') updates.pinned_at = null;
      } else if (action === 'feature') {
        updates.is_featured = true;
      } else if (action === 'unfeature') {
        updates.is_featured = false;
      } else if (action === 'set_status' && status) {
        updates.status = status;
        updates.is_hidden = status === 'hidden' || status === 'rejected';
      }

      const { error } = await supabase.from(table).update(updates).eq('id', item.id);
      if (error) return { ok: false, error: error.message };
    }

    await logTabAdminAction({
      module: 'content',
      action: `${action} (${table})`,
      sectionId: item.sectionId,
      targetId: item.id,
      details: { title: item.title, reason: reason || null, status: status || null },
    });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'تعذر تنفيذ الإجراء' };
  }
}

export async function toggleUserPostingRestriction(params: {
  userId: string;
  allowPost: boolean;
  reason: string;
  sectionId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        can_post: params.allowPost,
        moderation_status: params.allowPost ? 'active' : 'restricted',
        restriction_reason: params.allowPost ? null : params.reason || 'إيقاف النشر من إدارة التبويبات',
      })
      .eq('id', params.userId);

    if (error) return { ok: false, error: error.message };

    await logTabAdminAction({
      module: 'content',
      action: params.allowPost ? 'إعادة تفعيل صلاحية النشر للمستخدم' : 'إيقاف صلاحية النشر عن المستخدم',
      sectionId: params.sectionId || null,
      targetId: params.userId,
      details: { reason: params.reason },
    });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'تعذر تحديث صلاحية المستخدم' };
  }
}

// 4. إدارة نماذج الإدخال والقوائم المنسدلة المستقلة لكل تبويب
export async function fetchTabFormSchema(sectionId: string): Promise<TabFormField[]> {
  const norm = normalizeSectionIdForMatch(sectionId);
  try {
    const [fieldsRes, optsRes] = await Promise.all([
      supabase
        .from('community_tab_fields')
        .select('*')
        .eq('section_id', norm)
        .order('sort_order', { ascending: true }),
      supabase
        .from('community_tab_field_options')
        .select('*')
        .eq('section_id', norm)
        .order('sort_order', { ascending: true }),
    ]);

    if (fieldsRes.error || !fieldsRes.data) return [];
    const optionsByField = new Map<string, TabFieldOption[]>();
    (optsRes.data || []).forEach((opt: any) => {
      const arr = optionsByField.get(opt.field_id) || [];
      arr.push(opt as TabFieldOption);
      optionsByField.set(opt.field_id, arr);
    });

    return fieldsRes.data.map((f: any) => ({
      ...(f as TabFormField),
      options: optionsByField.get(f.id) || [],
    }));
  } catch {
    return [];
  }
}

export async function saveTabFormField(params: {
  id?: string;
  section_id: string;
  field_key: string;
  label: string;
  field_type: TabFieldType;
  placeholder?: string;
  is_required: boolean;
  is_visible: boolean;
  is_active: boolean;
  card_display: boolean;
  sort_order: number;
}): Promise<{ ok: boolean; field?: TabFormField; error?: string }> {
  const normSection = normalizeSectionIdForMatch(params.section_id);
  const cleanKey = params.field_key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || `field_${Date.now().toString(36)}`;

  try {
    if (params.id) {
      const { data, error } = await supabase
        .from('community_tab_fields')
        .update({
          label: params.label.trim(),
          field_type: params.field_type,
          placeholder: params.placeholder?.trim() || null,
          is_required: params.is_required,
          is_visible: params.is_visible,
          is_active: params.is_active,
          card_display: params.card_display,
          sort_order: params.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) return { ok: false, error: error.message };
      await logTabAdminAction({
        module: 'forms',
        action: `تعديل حقل النموذج "${params.label}"`,
        sectionId: normSection,
        targetId: params.id,
      });
      return { ok: true, field: { ...(data as any), options: [] } };
    }

    const { data, error } = await supabase
      .from('community_tab_fields')
      .insert({
        section_id: normSection,
        field_key: cleanKey,
        label: params.label.trim(),
        field_type: params.field_type,
        placeholder: params.placeholder?.trim() || null,
        is_required: params.is_required,
        is_visible: params.is_visible,
        is_active: params.is_active,
        card_display: params.card_display,
        sort_order: params.sort_order,
        is_system: false,
      })
      .select()
      .single();

    if (error) return { ok: false, error: error.message };
    await logTabAdminAction({
      module: 'forms',
      action: `إضافة حقل نموذج جديد "${params.label}"`,
      sectionId: normSection,
      targetId: data?.id,
    });
    return { ok: true, field: { ...(data as any), options: [] } };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'تعذر حفظ الحقل' };
  }
}

export async function reorderTabFormFields(sectionId: string, orderedFieldIds: string[]): Promise<boolean> {
  try {
    await Promise.all(
      orderedFieldIds.map((id, idx) =>
        supabase
          .from('community_tab_fields')
          .update({ sort_order: idx + 1, updated_at: new Date().toISOString() })
          .eq('id', id)
      )
    );
    await logTabAdminAction({
      module: 'forms',
      action: 'إعادة ترتيب حقول النموذج',
      sectionId: normalizeSectionIdForMatch(sectionId),
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteTabFormFieldSafe(field: TabFormField): Promise<{
  ok: boolean;
  archivedOnly?: boolean;
  error?: string;
}> {
  try {
    const { count } = await supabase
      .from('community_tab_listings')
      .select('id', { count: 'exact', head: true })
      .eq('section_id', field.section_id);

    if (field.is_system || (count && count > 0)) {
      const { error } = await supabase
        .from('community_tab_fields')
        .update({ is_active: false, is_visible: false, updated_at: new Date().toISOString() })
        .eq('id', field.id);
      if (error) return { ok: false, error: error.message };

      await logTabAdminAction({
        module: 'forms',
        action: `تعطيل حقل "${field.label}" لحماية البيانات السابقة`,
        sectionId: field.section_id,
        targetId: field.id,
      });
      return { ok: true, archivedOnly: true };
    }

    const { error } = await supabase.from('community_tab_fields').delete().eq('id', field.id);
    if (error) return { ok: false, error: error.message };

    await logTabAdminAction({
      module: 'forms',
      action: `حذف حقل "${field.label}"`,
      sectionId: field.section_id,
      targetId: field.id,
    });
    return { ok: true, archivedOnly: false };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'تعذر حذف الحقل' };
  }
}

export async function saveTabFieldOption(params: {
  id?: string;
  field_id: string;
  section_id: string;
  option_value: string;
  option_label: string;
  sort_order: number;
  is_active: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const normSection = normalizeSectionIdForMatch(params.section_id);
  try {
    if (params.id) {
      const { error } = await supabase
        .from('community_tab_field_options')
        .update({
          option_value: params.option_value.trim(),
          option_label: params.option_label.trim(),
          sort_order: params.sort_order,
          is_active: params.is_active,
        })
        .eq('id', params.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from('community_tab_field_options').insert({
        field_id: params.field_id,
        section_id: normSection,
        option_value: (params.option_value || params.option_label).trim(),
        option_label: params.option_label.trim(),
        sort_order: params.sort_order,
        is_active: params.is_active,
      });
      if (error) return { ok: false, error: error.message };
    }

    await logTabAdminAction({
      module: 'forms',
      action: params.id ? `تعديل خيار قائمة "${params.option_label}"` : `إضافة خيار قائمة "${params.option_label}"`,
      sectionId: normSection,
      targetId: params.field_id,
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'تعذر حفظ الخيار' };
  }
}

export async function reorderTabFieldOptions(sectionId: string, orderedOptionIds: string[]): Promise<boolean> {
  try {
    await Promise.all(
      orderedOptionIds.map((id, idx) =>
        supabase
          .from('community_tab_field_options')
          .update({ sort_order: idx + 1 })
          .eq('id', id)
      )
    );
    await logTabAdminAction({
      module: 'forms',
      action: 'ترتيب خيارات القائمة المنسدلة',
      sectionId: normalizeSectionIdForMatch(sectionId),
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteTabFieldOption(optionId: string, sectionId: string, label: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('community_tab_field_options').delete().eq('id', optionId);
    if (error) return false;
    await logTabAdminAction({
      module: 'forms',
      action: `حذف خيار القائمة "${label}"`,
      sectionId: normalizeSectionIdForMatch(sectionId),
      targetId: optionId,
    });
    return true;
  } catch {
    return false;
  }
}

// 5. الإعلانات المتخصصة للتبويبات المستقبلية
export async function fetchTabListings(sectionId: string): Promise<any[]> {
  const norm = normalizeSectionIdForMatch(sectionId);
  try {
    const { data, error } = await supabase
      .from('community_tab_listings')
      .select('*')
      .eq('section_id', norm)
      .eq('is_hidden', false)
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(60);
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function createTabSpecializedListing(params: {
  sectionId: string;
  userId: string;
  businessId?: string | null;
  title: string;
  description?: string;
  price?: number | null;
  currency?: string;
  city?: string;
  phone?: string;
  images?: string[];
  fieldValues: Record<string, any>;
  formSnapshot: Array<{ key: string; label: string; type: string }>;
}): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('community_tab_listings')
      .insert({
        section_id: normalizeSectionIdForMatch(params.sectionId),
        user_id: params.userId,
        business_id: params.businessId || null,
        title: params.title.trim(),
        description: params.description?.trim() || null,
        price: params.price ?? null,
        currency: params.currency || 'YER',
        city: params.city?.trim() || null,
        phone: params.phone?.trim() || null,
        images: params.images || [],
        field_values: params.fieldValues || {},
        form_snapshot: params.formSnapshot || [],
        status: 'active',
      })
      .select()
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'تعذر نشر الإعلان المتخصص' };
  }
}

// 6. الإحصائيات الفعلية المرتبطة بالتبويبات (بدون أرقام وهمية)
export async function fetchUnifiedTabsAnalytics(
  sections: CommunitySection[],
  options?: { sectionId?: string; periodDays?: '7' | '30' | '90' | 'all' }
): Promise<UnifiedTabsAnalytics> {
  const days = options?.periodDays || '30';
  const cutoffMs = days === 'all' ? 0 : Date.now() - Number(days) * 86400000;
  const inRange = (dt?: string | null) => {
    if (!cutoffMs) return true;
    if (!dt) return false;
    return new Date(dt).getTime() >= cutoffMs;
  };

  const [postsRes, jobsRes, propsRes, auctionsRes, listingsRes, adsList, reportsRes] =
    await Promise.all([
      supabase.from('posts').select('id, section_id, content, post_kind, views_count, likes_count, comments_count, reposts_count, created_at').is('parent_id', null),
      supabase.from('jobs').select('id, views_count, created_at'),
      supabase.from('properties').select('id, views_count, inquiries_count, created_at'),
      supabase.from('auctions').select('id, created_at'),
      supabase.from('community_tab_listings').select('id, section_id, views_count, likes_count, created_at'),
      adsDatabaseService.getAllAds(),
      supabase.from('reports').select('id, reported_item_id, status, created_at'),
    ]);

  const posts = (postsRes.data || []).filter((p: any) => inRange(p.created_at));
  const jobs = (jobsRes.data || []).filter((j: any) => inRange(j.created_at));
  const props = (propsRes.data || []).filter((p: any) => inRange(p.created_at));
  const auctions = (auctionsRes.data || []).filter((a: any) => inRange(a.created_at));
  const listings = (listingsRes.data || []).filter((l: any) => inRange(l.created_at));
  const reports = (reportsRes.data || []).filter((r: any) => inRange(r.created_at));

  const activeAds = (adsList || []).filter((a: ExtendedAdRecord) => a.status === 'active' && isAdCurrentlyValid(a));

  const tabsPool: Array<{ id: string; label: string }> = [
    { id: 'community', label: 'المجتمع العام' },
    ...sections.filter((s) => !s.isArchived).map((s) => ({ id: s.id, label: s.label })),
  ];

  const rowMap = new Map<string, TabAnalyticsRow>();
  tabsPool.forEach((t) => {
    rowMap.set(t.id, {
      sectionId: t.id,
      label: t.label,
      totalPosts: 0,
      freePosts: 0,
      specializedPosts: 0,
      views: 0,
      interactions: 0,
      activeAds: 0,
      reportsCount: 0,
    });
  });

  const ensureRow = (id: string) => {
    if (!rowMap.has(id)) {
      rowMap.set(id, {
        sectionId: id,
        label: id,
        totalPosts: 0,
        freePosts: 0,
        specializedPosts: 0,
        views: 0,
        interactions: 0,
        activeAds: 0,
        reportsCount: 0,
      });
    }
    return rowMap.get(id)!;
  };

  posts.forEach((p: any) => {
    const sid = inferPostSectionId(p, sections);
    const row = ensureRow(sid);
    row.totalPosts += 1;
    if (p.post_kind === 'specialized') row.specializedPosts += 1;
    else row.freePosts += 1;
    row.views += Number(p.views_count || 0);
    row.interactions += Number(p.likes_count || 0) + Number(p.comments_count || 0) + Number(p.reposts_count || 0);
  });

  jobs.forEach((j: any) => {
    const row = ensureRow('jobs');
    row.totalPosts += 1;
    row.specializedPosts += 1;
    row.views += Number(j.views_count || 0);
  });

  props.forEach((pr: any) => {
    const row = ensureRow('properties');
    row.totalPosts += 1;
    row.specializedPosts += 1;
    row.views += Number(pr.views_count || 0);
    row.interactions += Number(pr.inquiries_count || 0);
  });

  auctions.forEach(() => {
    const row = ensureRow('auctions');
    row.totalPosts += 1;
    row.specializedPosts += 1;
  });

  listings.forEach((tl: any) => {
    const sid = normalizeSectionIdForMatch(tl.section_id);
    const row = ensureRow(sid);
    row.totalPosts += 1;
    row.specializedPosts += 1;
    row.views += Number(tl.views_count || 0);
    row.interactions += Number(tl.likes_count || 0);
  });

  rowMap.forEach((row) => {
    const adSecId = row.sectionId === 'properties' ? 'realestate' : row.sectionId;
    row.activeAds = activeAds.filter((a) => {
      const secs = a.targetSections || ['all'];
      return secs.includes('all') || secs.includes(row.sectionId) || secs.includes(adSecId);
    }).length;
  });

  const targetSecFilter =
    options?.sectionId && options.sectionId !== 'all'
      ? normalizeSectionIdForMatch(options.sectionId)
      : null;

  const perTab = Array.from(rowMap.values()).filter((r) =>
    targetSecFilter ? r.sectionId === targetSecFilter : true
  );

  const totalPosts = perTab.reduce((acc, r) => acc + r.totalPosts, 0);
  const freePosts = perTab.reduce((acc, r) => acc + r.freePosts, 0);
  const specializedPosts = perTab.reduce((acc, r) => acc + r.specializedPosts, 0);
  const totalViews = perTab.reduce((acc, r) => acc + r.views, 0);
  const totalInteractions = perTab.reduce((acc, r) => acc + r.interactions, 0);
  const activeAdsCount = targetSecFilter
    ? perTab.reduce((acc, r) => acc + r.activeAds, 0)
    : activeAds.length;
  const pendingReportsCount = reports.filter((r: any) => String(r.status || '').toUpperCase() === 'PENDING').length;

  return {
    totalPosts,
    freePosts,
    specializedPosts,
    totalViews,
    totalInteractions,
    activeAdsCount,
    pendingReportsCount,
    perTab,
  };
}

// 7. صلاحيات المشرفين على تبويبات المجتمع (جدول محمي بـ RLS)
export async function getCurrentTabModulePermissions(): Promise<{
  role: string;
  permissions: TabModulePermissions;
}> {
  const acc = await getAccess();
  if (acc.role === 'super_admin' || acc.role === 'admin') {
    return { role: acc.role, permissions: { ...DEFAULT_FULL_PERMISSIONS } };
  }

  if (acc.userId) {
    try {
      const { data } = await supabase
        .from(PERMISSIONS_TABLE)
        .select('permissions')
        .eq('user_id', acc.userId)
        .maybeSingle();
      if (data?.permissions && typeof data.permissions === 'object') {
        return {
          role: acc.role,
          permissions: { ...DEFAULT_LIMITED_PERMISSIONS, ...(data.permissions as Partial<TabModulePermissions>) },
        };
      }
    } catch {}
    return { role: acc.role, permissions: { ...DEFAULT_LIMITED_PERMISSIONS } };
  }

  // وضع الفحص المحلي للمشرف العام فقط عند عدم وجود جلسة مستخدم
  try {
    const rawSess = localStorage.getItem('yr_admin_session');
    if (rawSess) {
      const parsed = JSON.parse(rawSess);
      if (parsed?.authenticated) {
        return { role: parsed.role || 'admin', permissions: { ...DEFAULT_FULL_PERMISSIONS } };
      }
    }
  } catch {}

  return { role: acc.role, permissions: { ...DEFAULT_LIMITED_PERMISSIONS } };
}

export async function fetchStaffTabPermissions(): Promise<StaffTabPermissionEntry[]> {
  try {
    const [profilesRes, permsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .in('role', ['super_admin', 'admin', 'staff'])
        .order('role', { ascending: true }),
      supabase.from(PERMISSIONS_TABLE).select('user_id, permissions'),
    ]);

    const savedMap = new Map<string, Partial<TabModulePermissions>>();
    (permsRes.data || []).forEach((row: any) => {
      if (row?.user_id && row?.permissions) {
        savedMap.set(row.user_id, row.permissions as Partial<TabModulePermissions>);
      }
    });

    return (profilesRes.data || []).map((u: any) => ({
      userId: u.id,
      email: u.email || '',
      fullName: u.full_name || u.email || 'مشرف',
      role: u.role || 'staff',
      permissions:
        u.role === 'super_admin' || u.role === 'admin'
          ? { ...DEFAULT_FULL_PERMISSIONS }
          : { ...DEFAULT_LIMITED_PERMISSIONS, ...(savedMap.get(u.id) || {}) },
    }));
  } catch {
    return [];
  }
}

export async function saveStaffTabPermissions(
  userId: string,
  permissions: TabModulePermissions,
  staffLabel: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const acc = await getAccess();
    const { error } = await supabase.from(PERMISSIONS_TABLE).upsert(
      {
        user_id: userId,
        permissions,
        updated_by: acc.userId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (error) return { ok: false, error: error.message };

    await logTabAdminAction({
      module: 'permissions',
      action: `تحديث صلاحيات المشرف "${staffLabel}"`,
      targetId: userId,
      details: permissions,
    });
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'تعذر حفظ الصلاحيات' };
  }
}
