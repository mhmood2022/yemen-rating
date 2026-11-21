import { supabase } from '../lib/supabase';
import {
  Smartphone,
  Briefcase,
  Building,
  Gavel,
  Store,
  Car,
  Coins,
  Sparkles,
  Tag,
  ShoppingBag,
  Compass,
  Layers,
  Megaphone,
  Globe,
  HeartHandshake,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export interface CommunitySection {
  id: string;
  label: string;
  iconName: string;
  isOpen: boolean;
  isBuiltIn: boolean;
  sortOrder: number;
  description?: string;
  targetRoute?: string;
}

export const SECTIONS_SETTING_KEY = 'community_sections';
export const SECTIONS_STORAGE_KEY = 'yr_community_sections';
export const SECTIONS_UPDATED_EVENT = 'yr-sections-updated';

export const DEFAULT_COMMUNITY_SECTIONS: CommunitySection[] = [
  {
    id: 'phones',
    label: 'سوق الهواتف',
    iconName: 'Smartphone',
    isOpen: true,
    isBuiltIn: true,
    sortOrder: 1,
    description: 'عروض الهواتف والأجهزة الذكية في اليمن',
  },
  {
    id: 'jobs',
    label: 'الوظائف',
    iconName: 'Briefcase',
    isOpen: true,
    isBuiltIn: true,
    sortOrder: 2,
    description: 'فرص العمل والتوظيف في الشركات والمنشآت',
  },
  {
    id: 'properties',
    label: 'العقارات',
    iconName: 'Building',
    isOpen: true,
    isBuiltIn: true,
    sortOrder: 3,
    description: 'عقارات للبيع والإيجار والاستثمار العقاري',
  },
  {
    id: 'auctions',
    label: 'المزادات',
    iconName: 'Gavel',
    isOpen: true,
    isBuiltIn: true,
    sortOrder: 4,
    description: 'المزادات العلنية والصفقات المباشرة',
  },
];

export const SECTION_ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  Briefcase,
  Building,
  Gavel,
  Store,
  Car,
  Coins,
  Sparkles,
  Tag,
  ShoppingBag,
  Compass,
  Layers,
  Megaphone,
  Globe,
  HeartHandshake,
  Wrench,
};

export const SECTION_ICON_OPTIONS: Array<{ name: string; label: string }> = [
  { name: 'Smartphone', label: 'هواتف' },
  { name: 'Briefcase', label: 'وظائف' },
  { name: 'Building', label: 'عقارات' },
  { name: 'Gavel', label: 'مزادات' },
  { name: 'Store', label: 'متاجر' },
  { name: 'Car', label: 'سيارات' },
  { name: 'Coins', label: 'ذهب وصرف' },
  { name: 'ShoppingBag', label: 'تسوق' },
  { name: 'Tag', label: 'عروض' },
  { name: 'Sparkles', label: 'مميز' },
  { name: 'Compass', label: 'استكشاف' },
  { name: 'Layers', label: 'أقسام' },
  { name: 'Megaphone', label: 'إعلانات' },
  { name: 'Globe', label: 'عام' },
  { name: 'HeartHandshake', label: 'خدمات' },
  { name: 'Wrench', label: 'صيانة' },
];

export function getSectionIcon(iconName?: string): LucideIcon {
  if (!iconName) return Layers;
  return SECTION_ICON_MAP[iconName] || Layers;
}

export function normalizeSections(raw: unknown): CommunitySection[] {
  if (!Array.isArray(raw)) {
    return DEFAULT_COMMUNITY_SECTIONS.map((s) => ({ ...s }));
  }

  const valid: CommunitySection[] = raw
    .filter((item): item is Partial<CommunitySection> => Boolean(item && typeof item === 'object' && typeof (item as any).id === 'string' && typeof (item as any).label === 'string'))
    .map((item, idx) => ({
      id: String(item.id).trim(),
      label: String(item.label).trim(),
      iconName: typeof item.iconName === 'string' && SECTION_ICON_MAP[item.iconName] ? item.iconName : 'Layers',
      isOpen: typeof item.isOpen === 'boolean' ? item.isOpen : true,
      isBuiltIn: Boolean(item.isBuiltIn),
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : idx + 1,
      description: typeof item.description === 'string' ? item.description : '',
      targetRoute: typeof item.targetRoute === 'string' ? item.targetRoute : '',
    }));

  if (valid.length === 0) {
    return DEFAULT_COMMUNITY_SECTIONS.map((s) => ({ ...s }));
  }

  const byId = new Map(valid.map((s) => [s.id, s]));
  for (const def of DEFAULT_COMMUNITY_SECTIONS) {
    if (!byId.has(def.id)) {
      valid.push({ ...def });
    }
  }

  return valid.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCachedCommunitySections(): CommunitySection[] {
  try {
    const raw = localStorage.getItem(SECTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_COMMUNITY_SECTIONS.map((s) => ({ ...s }));
    return normalizeSections(JSON.parse(raw));
  } catch {
    return DEFAULT_COMMUNITY_SECTIONS.map((s) => ({ ...s }));
  }
}

export async function fetchCommunitySections(): Promise<CommunitySection[]> {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', SECTIONS_SETTING_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      const parsed = normalizeSections(JSON.parse(data.value));
      try {
        localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(parsed));
      } catch {}
      return parsed;
    }
  } catch {}
  return getCachedCommunitySections();
}

export async function saveCommunitySections(
  sections: CommunitySection[]
): Promise<{ ok: boolean; syncedToCloud: boolean; rlsBlocked?: boolean; error?: string }> {
  const reordered = sections.map((s, idx) => ({
    ...s,
    sortOrder: idx + 1,
  }));
  const normalized = normalizeSections(reordered);

  try {
    localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(SECTIONS_UPDATED_EVENT, { detail: normalized }));
  } catch {}

  try {
    const { error } = await supabase
      .from('platform_settings')
      .upsert(
        {
          key: SECTIONS_SETTING_KEY,
          value: JSON.stringify(normalized),
          description: 'أقسام المجتمع الظاهرة بعد تبويبي لك ومتابعة وحالة فتحها وإغلاقها',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      const isRls = error.code === '42501' || /row-level security|permission/i.test(error.message || '');
      return {
        ok: true,
        syncedToCloud: false,
        rlsBlocked: isRls,
        error: error.message,
      };
    }

    return { ok: true, syncedToCloud: true };
  } catch (err: any) {
    return {
      ok: true,
      syncedToCloud: false,
      error: err?.message || 'تعذر المزامنة السحابية',
    };
  }
}
