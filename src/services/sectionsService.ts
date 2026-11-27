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
  Truck,
  Bus,
  Package,
  Wifi,
  Utensils,
  Hospital,
  Pill,
  School,
  GraduationCap,
  Waves,
  Scissors,
  Hotel,
  Award,
  type LucideIcon,
} from 'lucide-react';

export type SpecializedCardStyle = 'showcase' | 'phone' | 'property' | 'job' | 'auction' | 'custom';

export interface CommunitySection {
  id: string;
  label: string;
  iconName: string;
  isOpen: boolean;
  isBuiltIn: boolean;
  sortOrder: number;
  parentId?: string | null;
  description?: string;
  targetRoute?: string;
  // الإعدادات المتطورة المستقلة لكل تبويب
  isVisiblePublic?: boolean;
  allowPosting?: boolean;
  allowFreeTweets?: boolean;
  allowSpecializedAds?: boolean;
  allowSponsorAndBanners?: boolean;
  allowHeaderSponsor?: boolean;
  allowSlot1Banner?: boolean;
  allowSlot2Banner?: boolean;
  specializedCardStyle?: SpecializedCardStyle;
  requireApproval?: boolean;
  isArchived?: boolean;
}

export const SECTIONS_SETTING_KEY = 'community_sections';
export const SECTIONS_STORAGE_KEY = 'yr_community_sections';
export const SECTIONS_UPDATED_EVENT = 'yr-sections-updated';

const DEFAULT_CARD_STYLE_MAP: Record<string, SpecializedCardStyle> = {
  phones: 'phone',
  jobs: 'job',
  properties: 'property',
  auctions: 'auction',
};

export const DEFAULT_COMMUNITY_SECTIONS: CommunitySection[] = [
  {
    id: 'phones',
    label: 'سوق الهواتف',
    iconName: 'Smartphone',
    isOpen: true,
    isBuiltIn: true,
    sortOrder: 1,
    parentId: null,
    description: 'عروض الهواتف والأجهزة الذكية في اليمن',
    isVisiblePublic: true,
    allowPosting: true,
    allowFreeTweets: true,
    allowSpecializedAds: true,
    allowSponsorAndBanners: true,
    allowHeaderSponsor: true,
    allowSlot1Banner: true,
    allowSlot2Banner: true,
    specializedCardStyle: 'phone',
  },
  {
    id: 'jobs',
    label: 'الوظائف',
    iconName: 'Briefcase',
    isOpen: true,
    isBuiltIn: true,
    sortOrder: 2,
    parentId: null,
    description: 'فرص العمل والتوظيف في الشركات والمنشآت',
    isVisiblePublic: true,
    allowPosting: true,
    allowFreeTweets: true,
    allowSpecializedAds: true,
    allowSponsorAndBanners: true,
    allowHeaderSponsor: true,
    allowSlot1Banner: true,
    allowSlot2Banner: true,
    specializedCardStyle: 'job',
  },
  {
    id: 'properties',
    label: 'العقارات',
    iconName: 'Building',
    isOpen: true,
    isBuiltIn: true,
    sortOrder: 3,
    parentId: null,
    description: 'عقارات للبيع والإيجار والاستثمار العقاري',
    isVisiblePublic: true,
    allowPosting: true,
    allowFreeTweets: true,
    allowSpecializedAds: true,
    allowSponsorAndBanners: true,
    allowHeaderSponsor: true,
    allowSlot1Banner: true,
    allowSlot2Banner: true,
    specializedCardStyle: 'property',
  },
  {
    id: 'auctions',
    label: 'المزادات',
    iconName: 'Gavel',
    isOpen: true,
    isBuiltIn: true,
    sortOrder: 4,
    parentId: null,
    description: 'المزادات العلنية والصفقات المباشرة',
    isVisiblePublic: true,
    allowPosting: true,
    allowFreeTweets: true,
    allowSpecializedAds: true,
    allowSponsorAndBanners: true,
    allowHeaderSponsor: true,
    allowSlot1Banner: true,
    allowSlot2Banner: true,
    specializedCardStyle: 'auction',
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
  Truck,
  Bus,
  Package,
  Wifi,
  Utensils,
  Hospital,
  Pill,
  School,
  GraduationCap,
  Waves,
  Scissors,
  Hotel,
  Award,
};

export const SECTION_ICON_OPTIONS: Array<{ name: string; label: string }> = [
  { name: 'Smartphone', label: 'هواتف' },
  { name: 'Briefcase', label: 'وظائف' },
  { name: 'Building', label: 'عقارات' },
  { name: 'Gavel', label: 'مزادات' },
  { name: 'Car', label: 'سيارات' },
  { name: 'Bus', label: 'نقل' },
  { name: 'Truck', label: 'نقل ثقيل' },
  { name: 'Package', label: 'شحن' },
  { name: 'Wifi', label: 'اتصالات' },
  { name: 'Utensils', label: 'مطاعم' },
  { name: 'Hospital', label: 'مستشفيات' },
  { name: 'Pill', label: 'صيدليات' },
  { name: 'School', label: 'مدارس' },
  { name: 'GraduationCap', label: 'جامعات' },
  { name: 'Waves', label: 'حمام بخار' },
  { name: 'Sparkles', label: 'كوافير' },
  { name: 'Scissors', label: 'حلاقة' },
  { name: 'Hotel', label: 'فنادق' },
  { name: 'Award', label: 'أعلى تقييم' },
  { name: 'Store', label: 'متاجر' },
  { name: 'Coins', label: 'ذهب وصرف' },
  { name: 'ShoppingBag', label: 'تسوق' },
  { name: 'Tag', label: 'عروض' },
  { name: 'HeartHandshake', label: 'خدمات' },
  { name: 'Wrench', label: 'صيانة' },
  { name: 'Megaphone', label: 'إعلانات' },
  { name: 'Compass', label: 'استكشاف' },
  { name: 'Globe', label: 'عام' },
  { name: 'Layers', label: 'أقسام' },
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
    .filter((item): item is Partial<CommunitySection> =>
      Boolean(item && typeof item === 'object' && typeof (item as any).id === 'string' && typeof (item as any).label === 'string')
    )
    .map((item, idx) => {
      const id = String(item.id).trim();
      const isOpen = typeof item.isOpen === 'boolean' ? item.isOpen : true;
      const isVisiblePublic = typeof item.isVisiblePublic === 'boolean' ? item.isVisiblePublic : isOpen;
      return {
        id,
        label: String(item.label).trim(),
        iconName: typeof item.iconName === 'string' && SECTION_ICON_MAP[item.iconName] ? item.iconName : 'Layers',
        isOpen,
        isBuiltIn: Boolean(item.isBuiltIn),
        sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : idx + 1,
        parentId: typeof item.parentId === 'string' && item.parentId.trim() ? item.parentId.trim() : null,
        description: typeof item.description === 'string' ? item.description : '',
        targetRoute: typeof item.targetRoute === 'string' ? item.targetRoute : '',
        isVisiblePublic,
        allowPosting: typeof item.allowPosting === 'boolean' ? item.allowPosting : true,
        allowFreeTweets: typeof item.allowFreeTweets === 'boolean' ? item.allowFreeTweets : true,
        allowSpecializedAds: typeof item.allowSpecializedAds === 'boolean' ? item.allowSpecializedAds : true,
        allowSponsorAndBanners: typeof item.allowSponsorAndBanners === 'boolean' ? item.allowSponsorAndBanners : true,
        allowHeaderSponsor: typeof item.allowHeaderSponsor === 'boolean' ? item.allowHeaderSponsor : true,
        allowSlot1Banner: typeof item.allowSlot1Banner === 'boolean' ? item.allowSlot1Banner : true,
        allowSlot2Banner: typeof item.allowSlot2Banner === 'boolean' ? item.allowSlot2Banner : true,
        specializedCardStyle: item.specializedCardStyle || DEFAULT_CARD_STYLE_MAP[id] || 'custom',
        requireApproval: Boolean(item.requireApproval),
        isArchived: Boolean(item.isArchived),
      };
    });

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

export function getSectionConfigById(sectionId: string, list?: CommunitySection[]): CommunitySection | undefined {
  const sections = list || getCachedCommunitySections();
  const normalizedId = sectionId === 'realestate' ? 'properties' : sectionId;
  return sections.find((s) => s.id === normalizedId || s.id === sectionId);
}

export function resolveAdSectionId(sectionId: string): string {
  if (sectionId === 'properties') return 'realestate';
  return sectionId;
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
        window.dispatchEvent(new CustomEvent(SECTIONS_UPDATED_EVENT, { detail: parsed }));
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
    isVisiblePublic: typeof s.isVisiblePublic === 'boolean' ? s.isVisiblePublic : s.isOpen,
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
          description: 'أقسام المجتمع وإعداداتها المستقلة ومفاتيح النشر والإعلانات',
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
