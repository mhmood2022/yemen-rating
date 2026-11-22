import {
  Smartphone,
  Briefcase,
  Building,
  Gavel,
  Store,
  Tag,
  Sparkles,
  Car,
  Utensils,
  Wrench,
  Globe,
  Layers,
  ShoppingBag,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface CommunitySectionItem {
  id: string;
  label: string;
  iconName: string;
  isOpen: boolean;
  isBuiltIn?: boolean;
  description?: string;
  route?: string;
  sortOrder: number;
}

export const SECTION_ICON_OPTIONS: Array<{ name: string; label: string; icon: LucideIcon }> = [
  { name: 'Smartphone', label: 'هواتف', icon: Smartphone },
  { name: 'Briefcase', label: 'وظائف', icon: Briefcase },
  { name: 'Building', label: 'عقارات', icon: Building },
  { name: 'Gavel', label: 'مزادات', icon: Gavel },
  { name: 'Store', label: 'متجر', icon: Store },
  { name: 'ShoppingBag', label: 'تسوق', icon: ShoppingBag },
  { name: 'Car', label: 'سيارات', icon: Car },
  { name: 'Utensils', label: 'مطاعم', icon: Utensils },
  { name: 'Wrench', label: 'خدمات', icon: Wrench },
  { name: 'Tag', label: 'عروض', icon: Tag },
  { name: 'Compass', label: 'استكشاف', icon: Compass },
  { name: 'Globe', label: 'عام', icon: Globe },
  { name: 'Layers', label: 'أقسام', icon: Layers },
  { name: 'Sparkles', label: 'مميز', icon: Sparkles },
];

export const getSectionIconComponent = (iconName?: string): LucideIcon => {
  const found = SECTION_ICON_OPTIONS.find((opt) => opt.name === iconName);
  return found ? found.icon : Layers;
};

export const DEFAULT_COMMUNITY_SECTIONS: CommunitySectionItem[] = [
  { id: 'phones', label: 'سوق الهواتف', iconName: 'Smartphone', isOpen: true, isBuiltIn: true, sortOrder: 1 },
  { id: 'jobs', label: 'الوظائف', iconName: 'Briefcase', isOpen: true, isBuiltIn: true, sortOrder: 2 },
  { id: 'properties', label: 'العقارات', iconName: 'Building', isOpen: true, isBuiltIn: true, sortOrder: 3 },
  { id: 'auctions', label: 'المزادات', iconName: 'Gavel', isOpen: true, isBuiltIn: true, sortOrder: 4 },
];

const SETTINGS_KEY = 'community_sections';
const CACHE_KEY = 'yr_community_sections_v1';
export const SECTIONS_UPDATED_EVENT = 'yr-community-sections-updated';

export const normalizeCommunitySections = (rawList: unknown): CommunitySectionItem[] => {
  const list = Array.isArray(rawList) ? rawList : [];
  const byId = new Map<string, any>();

  for (const item of list) {
    if (item && typeof item === 'object' && typeof item.id === 'string' && item.id.trim()) {
      byId.set(item.id.trim(), item);
    }
  }

  const mergedBuiltIns: CommunitySectionItem[] = DEFAULT_COMMUNITY_SECTIONS.map((def) => {
    const saved = byId.get(def.id);
    if (!saved) return def;
    return {
      ...def,
      label: typeof saved.label === 'string' && saved.label.trim() ? saved.label.trim() : def.label,
      iconName: typeof saved.iconName === 'string' && saved.iconName ? saved.iconName : def.iconName,
      isOpen: typeof saved.isOpen === 'boolean' ? saved.isOpen : true,
      description: typeof saved.description === 'string' ? saved.description : def.description,
      route: typeof saved.route === 'string' ? saved.route : def.route,
      sortOrder: typeof saved.sortOrder === 'number' ? saved.sortOrder : def.sortOrder,
      isBuiltIn: true,
    };
  });

  const builtInIds = new Set(DEFAULT_COMMUNITY_SECTIONS.map((d) => d.id));
  const customSections: CommunitySectionItem[] = [];

  for (const item of list) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string') continue;
    const id = item.id.trim();
    if (!id || builtInIds.has(id)) continue;
    if (typeof item.label !== 'string' || !item.label.trim()) continue;
    customSections.push({
      id,
      label: item.label.trim(),
      iconName: typeof item.iconName === 'string' && item.iconName ? item.iconName : 'Layers',
      isOpen: typeof item.isOpen === 'boolean' ? item.isOpen : true,
      isBuiltIn: false,
      description: typeof item.description === 'string' ? item.description : '',
      route: typeof item.route === 'string' ? item.route : '',
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 100 + customSections.length,
    });
  }

  return [...mergedBuiltIns, ...customSections].sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getCachedCommunitySections = (): CommunitySectionItem[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return DEFAULT_COMMUNITY_SECTIONS;
    return normalizeCommunitySections(JSON.parse(raw));
  } catch {
    return DEFAULT_COMMUNITY_SECTIONS;
  }
};

const writeLocalCache = (sections: CommunitySectionItem[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(sections));
  } catch {}
};

export const fetchCommunitySections = async (): Promise<CommunitySectionItem[]> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (!error && data?.value) {
      const parsed = JSON.parse(data.value);
      const normalized = normalizeCommunitySections(parsed);
      writeLocalCache(normalized);
      return normalized;
    }
  } catch (err) {
    console.error('Error fetching community sections:', err);
  }
  return getCachedCommunitySections();
};

export const saveCommunitySections = async (
  sections: CommunitySectionItem[]
): Promise<{ ok: boolean; sections: CommunitySectionItem[]; error?: string }> => {
  const normalized = normalizeCommunitySections(
    sections.map((s, idx) => ({ ...s, sortOrder: idx + 1 }))
  );

  writeLocalCache(normalized);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SECTIONS_UPDATED_EVENT, { detail: normalized }));
  }

  try {
    const { error } = await supabase.from('platform_settings').upsert(
      {
        key: SETTINGS_KEY,
        value: JSON.stringify(normalized),
        description: 'أقسام المجتمع وإعدادات الفتح والإغلاق',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      return { ok: false, sections: normalized, error: error.message };
    }
    return { ok: true, sections: normalized };
  } catch (err: any) {
    return { ok: false, sections: normalized, error: err?.message || 'تعذر الحفظ في قاعدة البيانات' };
  }
};

export const subscribeCommunitySections = (
  onChange: (sections: CommunitySectionItem[]) => void
): (() => void) => {
  const handleCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent<CommunitySectionItem[]>).detail;
    if (Array.isArray(detail)) {
      onChange(normalizeCommunitySections(detail));
    } else {
      onChange(getCachedCommunitySections());
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === CACHE_KEY && e.newValue) {
      try {
        onChange(normalizeCommunitySections(JSON.parse(e.newValue)));
      } catch {}
    }
  };

  window.addEventListener(SECTIONS_UPDATED_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorage);

  const channel = supabase
    .channel('community-sections-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'platform_settings',
        filter: `key=eq.${SETTINGS_KEY}`,
      },
      (payload: any) => {
        const val = payload?.new?.value;
        if (typeof val === 'string') {
          try {
            const normalized = normalizeCommunitySections(JSON.parse(val));
            writeLocalCache(normalized);
            onChange(normalized);
            return;
          } catch {}
        }
        fetchCommunitySections().then(onChange);
      }
    )
    .subscribe();

  return () => {
    window.removeEventListener(SECTIONS_UPDATED_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    supabase.removeChannel(channel);
  };
};
