import { getCachedCommunitySections, type CommunitySection } from '../services/sectionsService';

export interface AdPlacement {
  id: string;
  name: string;
  width: number;
  height: number;
}

export type MarketSectionId = string;

export type AdSlotKey = 'all' | 'slot_1' | 'slot_2' | 'header_sponsor';

export const MAX_ACTIVE_SPONSORS_PER_SECTION = 4;

export interface DynamicMarketSectionOption {
  id: string;
  label: string;
  legacyPlacementId: string;
  isBuiltIn?: boolean;
  isDynamic?: boolean;
}

export const MARKET_SECTIONS: DynamicMarketSectionOption[] = [
  { id: 'phones', label: 'سوق الهواتف', legacyPlacementId: '9', isBuiltIn: true },
  { id: 'jobs', label: 'سوق الوظائف', legacyPlacementId: '7', isBuiltIn: true },
  { id: 'realestate', label: 'سوق العقارات', legacyPlacementId: '5', isBuiltIn: true },
  { id: 'auctions', label: 'سوق المزادات', legacyPlacementId: '6', isBuiltIn: true },
  { id: 'community', label: 'المجتمع', legacyPlacementId: '1', isBuiltIn: true },
  { id: 'all', label: 'جميع الأقسام', legacyPlacementId: '10', isBuiltIn: true },
];

export const AD_SLOT_OPTIONS: { id: AdSlotKey; label: string }[] = [
  { id: 'all', label: 'كل وحدات البانر داخل القسم (تدوير تلقائي)' },
  { id: 'slot_1', label: 'الوحدة الإعلانية الأولى (بين المنشورات - أعلى)' },
  { id: 'slot_2', label: 'الوحدة الإعلانية الثانية (بين المنشورات - وسط/أسفل)' },
];

export const SECTION_LABEL_MAP: Record<string, string> = {
  phones: 'سوق الهواتف',
  jobs: 'سوق الوظائف',
  realestate: 'سوق العقارات',
  properties: 'سوق العقارات',
  auctions: 'سوق المزادات',
  community: 'المجتمع',
  businesses: 'دليل المنشآت',
  all: 'جميع الأقسام',
};

export const LEGACY_PLACEMENT_TO_SECTION: Record<string, MarketSectionId> = {
  '1': 'community',
  '2': 'community',
  '5': 'realestate',
  '6': 'auctions',
  '7': 'jobs',
  '9': 'phones',
  '10': 'all',
  home_sponsor: 'all',
};

export const YR_AD_PLACEMENTS: AdPlacement[] = [
  { id: '9', name: 'سوق الهواتف (Phones Market)', width: 850, height: 200 },
  { id: '7', name: 'سوق الوظائف (Jobs Market)', width: 850, height: 200 },
  { id: '5', name: 'سوق العقارات (Real-Estate Market)', width: 850, height: 200 },
  { id: '6', name: 'سوق المزادات (Auctions Market)', width: 850, height: 200 },
  { id: '1', name: 'المجتمع — أعلى الخلاصة (Community)', width: 1200, height: 160 },
  { id: '2', name: 'المجتمع — بين المنشورات (Community In-Feed)', width: 800, height: 250 },
  { id: '3', name: 'دليل المنشآت (Directory)', width: 800, height: 220 },
  { id: '4', name: 'ملفات المنشآت والشركات', width: 1200, height: 160 },
  { id: '8', name: 'البنوك وأسعار الصرف (Banks & Rates)', width: 850, height: 200 },
  { id: '10', name: 'كافة الأقسام / الفوتر العام', width: 1200, height: 90 },
];

export function getDynamicMarketSections(sectionsList?: CommunitySection[]): DynamicMarketSectionOption[] {
  const dynamic = (sectionsList || getCachedCommunitySections()).filter((s) => !s.isArchived);
  const byId = new Map<string, DynamicMarketSectionOption>();

  for (const base of MARKET_SECTIONS) {
    byId.set(base.id, { ...base });
  }

  for (const sec of dynamic) {
    const mappedId = sec.id === 'properties' ? 'realestate' : sec.id;
    const existing = byId.get(mappedId);
    if (existing) {
      byId.set(mappedId, { ...existing, label: sec.label || existing.label });
    } else {
      byId.set(mappedId, {
        id: sec.id,
        label: sec.label,
        legacyPlacementId: '2',
        isBuiltIn: false,
        isDynamic: true,
      });
    }
  }

  // وضع خيار "جميع الأقسام" في النهاية دائماً
  const allOpt = byId.get('all');
  const result = Array.from(byId.values()).filter((x) => x.id !== 'all');
  if (allOpt) result.push(allOpt);
  return result;
}

export function getDynamicSectionLabel(sectionId: string, sectionsList?: CommunitySection[]): string {
  if (SECTION_LABEL_MAP[sectionId]) return SECTION_LABEL_MAP[sectionId];
  const dynamic = sectionsList || getCachedCommunitySections();
  const found = dynamic.find((s) => s.id === sectionId || (sectionId === 'realestate' && s.id === 'properties'));
  return found?.label || sectionId;
}

export function normalizeAdTargetSection(sectionId: string): string {
  return sectionId === 'properties' ? 'realestate' : sectionId;
}
