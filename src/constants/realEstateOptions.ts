import { YRSelectOption } from '../components/common/YRSelect';

export const NOT_AVAILABLE = 'غير موجود';

export const RE_PROPERTY_TYPES: YRSelectOption[] = [
  { value: 'شقة', label: 'شقة' },
  { value: 'فيلا', label: 'فيلا' },
  { value: 'منزل', label: 'منزل' },
  { value: 'أرض سكنية', label: 'أرض سكنية' },
  { value: 'أرض تجارية', label: 'أرض تجارية' },
  { value: 'بقالة', label: 'بقالة' },
  { value: 'عمارة', label: 'عمارة' },
  { value: 'محل تجاري', label: 'محل تجاري' },
  { value: 'مكتب', label: 'مكتب' },
  { value: 'مستودع', label: 'مستودع' },
  { value: 'مزرعة', label: 'مزرعة' },
  { value: 'استراحة', label: 'استراحة' },
  { value: 'مبنى استثماري', label: 'مبنى استثماري' },
];

export const RE_GOVERNORATES = [
  'صنعاء', 'عدن', 'تعز', 'حضرموت', 'إب', 'الحديدة', 'ذمار', 'مأرب',
  'عمران', 'حجة', 'صعدة', 'البيضاء', 'لحج', 'أبين', 'شبوة',
  'المهرة', 'الضالع', 'المحويت', 'ريمة', 'الجوف', 'سقطرى',
];

const CITIES_BY_GOV: Record<string, string[]> = {
  'صنعاء': ['أمانة العاصمة', 'صنعاء الجديدة', 'همدان', 'بني حشيش', 'سنحان'],
  'عدن': ['عدن', 'المنصورة', 'كريتر', 'خور مكسر', 'الشيخ عثمان', 'البريقة'],
  'تعز': ['تعز', 'التربة', 'المخا', 'الحوبان'],
  'حضرموت': ['المكلا', 'سيئون', 'تريم', 'الشحر', 'شبام'],
  'إب': ['إب', 'جبلة', 'يريم', 'القاعدة'],
  'الحديدة': ['الحديدة', 'باجل', 'زبيد', 'بيت الفقيه'],
  'ذمار': ['ذمار', 'معبر', 'رداع'],
  'مأرب': ['مأرب', 'مأرب الوادي'],
};

const DISTRICTS_BY_GOV: Record<string, string[]> = {
  'صنعاء': ['السبعين', 'حدة', 'الوحدة', 'التحرير', 'شعوب', 'معين', 'الثورة', 'آزال', 'بني الحارث', 'صنعاء القديمة', 'سنحان', 'همدان'],
  'عدن': ['المنصورة', 'الشيخ عثمان', 'دار سعد', 'البريقة', 'التواهي', 'المعلا', 'كريتر', 'خور مكسر'],
  'تعز': ['القاهرة', 'المظفر', 'صالة', 'التعزية', 'الشمايتين', 'المخا'],
  'حضرموت': ['المكلا', 'سيئون', 'تريم', 'الشحر', 'غيل باوزير', 'دوعن'],
  'إب': ['الظهار', 'المشنة', 'جبلة', 'يريم', 'ذي السفال'],
  'الحديدة': ['الحوك', 'الميناء', 'الحالي', 'باجل', 'زبيد'],
};

const NEIGHBORHOODS_BY_GOV: Record<string, string[]> = {
  'صنعاء': ['حدة', 'بيت بوس', 'الأصبحي', 'الستين', 'شملان', 'الروضة', 'الصافية', 'الحصبة', 'سعوان', 'السنينة', 'مذبح', 'عصر', 'دار سلم', 'حي الجامعة', 'الحي السياسي'],
  'عدن': ['إنماء', 'القاهرة', 'عبدالعزيز', 'الريمي', 'الممدارة', 'التقنية', 'القلوعة', 'جولدمور', 'كريتر', 'خور مكسر'],
  'تعز': ['جمال', 'المسبح', 'عصيفرة', 'الحصب', 'التحرير', 'بير باشا', 'الحوبان'],
  'حضرموت': ['فوة', 'الديس', 'الشرج', 'روكب', 'المكلا القديمة', 'السحيل', 'مريمة'],
  'إب': ['الدائري', 'العدين', 'السبل', 'المعاين', 'الصلبة'],
  'الحديدة': ['شارع صنعاء', 'المطراق', 'الربصة', 'الكورنيش', 'السلخانة'],
};

export function getCityOptions(gov: string): YRSelectOption[] {
  const list = CITIES_BY_GOV[gov] || [gov];
  return [
    ...list.map((x) => ({ value: x, label: x })),
    { value: NOT_AVAILABLE, label: NOT_AVAILABLE },
  ];
}

export function getDistrictOptions(gov: string): YRSelectOption[] {
  const list = DISTRICTS_BY_GOV[gov] || ['المديرية المركزية', 'المديرية الشمالية', 'المديرية الجنوبية'];
  return [
    ...list.map((x) => ({ value: x, label: x })),
    { value: NOT_AVAILABLE, label: NOT_AVAILABLE },
  ];
}

export function getNeighborhoodOptions(gov: string): YRSelectOption[] {
  const list = NEIGHBORHOODS_BY_GOV[gov] || ['الحي المركزي', 'الشارع العام', 'حي المطار', 'الحي التجاري', 'الحي السكني'];
  return [
    ...list.map((x) => ({ value: x, label: x })),
    { value: NOT_AVAILABLE, label: NOT_AVAILABLE },
  ];
}

const withNA = (items: string[]): YRSelectOption[] => [
  ...items.map((x) => ({ value: x, label: x })),
  { value: NOT_AVAILABLE, label: NOT_AVAILABLE },
];

export const RE_AREA_OPTIONS = withNA([
  '50', '70', '90', '100', '120', '140', '160', '180', '200', '220', '250', '300',
  '350', '400', '450', '500', '600', '750', '1000', '1500', '2000', '3000', '5000',
]);

export const RE_COUNT_1_20 = withNA(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '15', '20+']);
export const RE_COUNT_1_10 = withNA(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+']);
export const RE_COUNT_1_5 = withNA(['1', '2', '3', '4', '5+']);
export const RE_FLOOR_NUM_OPTIONS = withNA(['أرضي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر فأكثر']);
export const RE_AGE_OPTIONS = withNA(['جديد (أقل من سنة)', '1 - 3 سنوات', '3 - 5 سنوات', '5 - 10 سنوات', 'أكثر من 10 سنوات']);
export const RE_STATUS_OPTIONS = withNA(['جديد', 'مستخدم', 'تحت الإنشاء', 'يحتاج إلى ترميم']);
export const RE_FINISHING_OPTIONS = withNA(['عادي', 'متوسط', 'فاخر', 'سوبر ديلوكس']);
export const RE_CONSTRUCTION_OPTIONS = withNA(['مسلح', 'شعبي', 'حجر', 'طوب', 'أخرى']);

export const RE_ELECTRICITY_OPTIONS = withNA(['حكومي', 'تجاري', 'منظومة شمسية', 'بدون كهرباء']);
export const RE_WATER_OPTIONS = withNA(['شبكة', 'بئر', 'خزان', 'أخرى']);
export const RE_PARKING_OPTIONS = withNA(['متوفر', 'غير متوفر']);
export const RE_GARDEN_OPTIONS = withNA(['متوفرة', 'غير متوفرة']);
export const RE_ELEVATOR_OPTIONS = withNA(['متوفر', 'غير متوفر']);
export const RE_AC_OPTIONS = withNA(['مركزي', 'منفصل', 'غير متوفر']);
export const RE_SEWAGE_OPTIONS = withNA(['شبكة صرف صحي', 'بيارة', 'صرف مشترك']);
export const RE_INTERNET_OPTIONS = withNA(['ألياف بصرية', 'ADSL', '4G / 5G', 'ستارلينك', 'غير متوفر']);

export const RE_STREET_TYPE_OPTIONS = withNA(['رئيسي', 'فرعي', 'ترابي']);
export const RE_STREET_WIDTH_OPTIONS = withNA(['4 متر', '6 متر', '8 متر', '10 متر', '12 متر', '14 متر', '16 متر', '20 متر', '24 متر', '30 متر فأكثر']);
export const RE_FACADES_COUNT_OPTIONS = withNA(['واجهة واحدة', 'واجهتان', 'ثلاث واجهات', 'أربع واجهات']);
export const RE_FACING_DIR_OPTIONS = withNA(['شمال', 'جنوب', 'شرق', 'غرب', 'شمال شرق', 'شمال غرب', 'جنوب شرق', 'جنوب غرب']);
export const RE_LAND_NATURE_OPTIONS = withNA(['مستوية', 'منحدرة']);
export const RE_INSTALLMENT_OPTIONS = withNA(['متاح', 'غير متاح']);

export const RE_OWNERSHIP_OPTIONS = withNA(['ملك حر', 'وقف', 'ورثة', 'أخرى']);
export const RE_DOC_TYPE_OPTIONS = withNA(['بصيرة', 'عقد بيع', 'شهادة ملكية', 'عقد انتفاع', 'أخرى']);
export const RE_DOC_STATUS_OPTIONS = withNA(['مكتملة', 'غير مكتملة']);

export const RE_NEGOTIABLE_OPTIONS = withNA(['نعم', 'لا']);
export const RE_VIEWING_OPTIONS = withNA(['متاحة', 'بموجب موعد']);

export const RE_SHOP_ACTIVITY_OPTIONS = withNA(['بقالة وسوبرماركت', 'ملابس وعطور', 'مطعم وكافيه', 'إلكترونيات وهواتف', 'صيدلية ومستلزمات', 'حلاقة وتجميل', 'ورشة / خدمات', 'تجاري عام']);
export const RE_OFFICE_USE_OPTIONS = withNA(['مكتب إداري', 'مقر شركة / مؤسسة', 'عيادة / مركز', 'مستودع تخزين', 'مستودع تبريد', 'مستودع لوجستي']);

export type RealEstateFieldKey =
  | 'area' | 'rooms' | 'bedrooms' | 'bathrooms' | 'kitchens'
  | 'floorsCount' | 'floorNum' | 'age' | 'propCondition' | 'finishing' | 'construction'
  | 'apartmentsCount' | 'shopsCount' | 'shopActivity' | 'officeUse'
  | 'electricity' | 'water' | 'parking' | 'garden' | 'elevator' | 'ac' | 'sewage' | 'internet'
  | 'streetType' | 'streetWidth' | 'facadesCount' | 'facingDir' | 'landNature' | 'installment'
  | 'ownership' | 'docType' | 'docStatus' | 'negotiable' | 'viewing';

export function getVisibleRealEstateFields(type: string): Set<RealEstateFieldKey> {
  if (type === 'شقة') {
    return new Set([
      'area', 'rooms', 'bedrooms', 'bathrooms', 'kitchens', 'floorNum', 'elevator',
      'age', 'propCondition', 'finishing', 'construction',
      'electricity', 'water', 'parking', 'ac', 'sewage', 'internet',
      'installment', 'ownership', 'docType', 'docStatus', 'negotiable', 'viewing',
    ]);
  }
  if (['فيلا', 'منزل', 'استراحة', 'مزرعة'].includes(type)) {
    return new Set([
      'area', 'floorsCount', 'rooms', 'bedrooms', 'bathrooms', 'kitchens',
      'garden', 'parking', 'age', 'propCondition', 'finishing', 'construction',
      'electricity', 'water', 'ac', 'sewage', 'internet',
      'streetType', 'streetWidth', 'facadesCount', 'facingDir', 'installment',
      'ownership', 'docType', 'docStatus', 'negotiable', 'viewing',
    ]);
  }
  if (['أرض سكنية', 'أرض تجارية'].includes(type)) {
    return new Set([
      'area', 'facadesCount', 'facingDir', 'streetType', 'streetWidth', 'landNature',
      'installment', 'ownership', 'docType', 'docStatus', 'negotiable', 'viewing',
    ]);
  }
  if (['محل تجاري', 'بقالة'].includes(type)) {
    return new Set([
      'area', 'shopActivity', 'floorNum', 'facadesCount', 'facingDir', 'streetType', 'streetWidth',
      'propCondition', 'finishing', 'electricity', 'water', 'ac', 'internet', 'parking',
      'installment', 'ownership', 'docType', 'docStatus', 'negotiable', 'viewing',
    ]);
  }
  if (['عمارة', 'مبنى استثماري'].includes(type)) {
    return new Set([
      'area', 'floorsCount', 'apartmentsCount', 'shopsCount', 'elevator', 'parking',
      'age', 'propCondition', 'finishing', 'construction',
      'electricity', 'water', 'sewage', 'streetType', 'streetWidth', 'facadesCount', 'facingDir',
      'installment', 'ownership', 'docType', 'docStatus', 'negotiable', 'viewing',
    ]);
  }
  // مكتب أو مستودع
  return new Set([
    'area', 'floorNum', 'officeUse', 'bathrooms', 'parking', 'elevator',
    'propCondition', 'finishing', 'electricity', 'water', 'ac', 'sewage', 'internet',
    'streetType', 'streetWidth', 'installment', 'ownership', 'docType', 'docStatus', 'negotiable', 'viewing',
  ]);
}

export function buildPropertyFeatures(entries: Array<[string, string | undefined | null]>): string[] {
  const out: string[] = [];
  for (const [k, v] of entries) {
    const val = (v || '').trim();
    if (!val || val === NOT_AVAILABLE || val === 'غير محدد' || val === 'لا ينطبق') continue;
    out.push(`${k}: ${val}`);
  }
  return out;
}

export function parsePropertyFeatures(features: any): {
  pairs: { label: string; value: string }[];
  mapUrl?: string;
  blueprintImage?: string;
  videoUrl?: string;
} {
  let list = features;
  if (typeof features === 'string') {
    try { list = JSON.parse(features); } catch { list = []; }
  }
  if (!Array.isArray(list)) return { pairs: [] };
  const pairs: { label: string; value: string }[] = [];
  let mapUrl: string | undefined;
  let blueprintImage: string | undefined;
  let videoUrl: string | undefined;

  for (const raw of list) {
    if (typeof raw !== 'string') continue;
    const idx = raw.indexOf(':');
    if (idx === -1) {
      if (raw.trim() && raw.trim() !== NOT_AVAILABLE) pairs.push({ label: 'ميزة', value: raw.trim() });
      continue;
    }
    const label = raw.slice(0, idx).trim();
    const value = raw.slice(idx + 1).trim();
    if (!value || value === NOT_AVAILABLE || value === 'غير محدد' || value === 'لا ينطبق') continue;
    if (label === '__MAP_URL__') { mapUrl = value; continue; }
    if (label === '__BLUEPRINT__') { blueprintImage = value; continue; }
    if (label === '__VIDEO_URL__') { videoUrl = value; continue; }
    pairs.push({ label, value });
  }
  return { pairs, mapUrl, blueprintImage, videoUrl };
}
