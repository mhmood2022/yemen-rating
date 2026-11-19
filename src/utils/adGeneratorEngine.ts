export interface AdPlacement {
  id: string;
  name: string;
  width: number;
  height: number;
}

export type MarketSectionId =
  | 'phones'
  | 'jobs'
  | 'realestate'
  | 'auctions'
  | 'community'
  | 'all';

export type AdSlotKey = 'all' | 'slot_1' | 'slot_2' | 'header_sponsor';

export const MAX_ACTIVE_SPONSORS_PER_SECTION = 4;

export const MARKET_SECTIONS: {
  id: MarketSectionId;
  label: string;
  legacyPlacementId: string;
}[] = [
  { id: 'phones', label: 'سوق الهواتف', legacyPlacementId: '9' },
  { id: 'jobs', label: 'سوق الوظائف', legacyPlacementId: '7' },
  { id: 'realestate', label: 'سوق العقارات', legacyPlacementId: '5' },
  { id: 'auctions', label: 'سوق المزادات', legacyPlacementId: '6' },
  { id: 'community', label: 'المجتمع', legacyPlacementId: '1' },
  { id: 'all', label: 'جميع الأقسام', legacyPlacementId: '10' },
];

export const AD_SLOT_OPTIONS: { id: AdSlotKey; label: string }[] = [
  { id: 'all', label: 'كل وحدات البانر داخل القسم (تدوير تلقائي)' },
  { id: 'slot_1', label: 'الوحدة الإعلانية الأولى (بين المحتوى - أعلى)' },
  { id: 'slot_2', label: 'الوحدة الإعلانية الثانية (بين المحتوى - وسط/أسفل)' },
];

export const SECTION_LABEL_MAP: Record<string, string> = {
  phones: 'سوق الهواتف',
  jobs: 'سوق الوظائف',
  realestate: 'سوق العقارات',
  auctions: 'سوق المزادات',
  community: 'المجتمع',
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
