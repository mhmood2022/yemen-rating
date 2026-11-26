import { supabase } from '../lib/supabase';

export const YEMEN_GOVERNORATES = [
  'صنعاء', 'أمانة العاصمة', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت',
  'شبوة', 'مأرب', 'الجوف', 'حجة', 'صعدة', 'عمران', 'المحويت', 'ريمة',
  'البيضاء', 'الضالع', 'لحج', 'أبين', 'المهرة', 'سقطرى',
];

export interface UnifiedTaxonomyCategory {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  parent_id: string | null;
  category_level: 'main' | 'sub';
  sort_order: number;
}

export function mapMainSlugToBusinessType(mainSlug?: string | null): string {
  switch (mainSlug) {
    case 'main-finance': return 'BANK';
    case 'main-transport': return 'TRANSPORT';
    case 'main-health': return 'HEALTHCARE';
    case 'main-education': return 'EDUCATION';
    case 'main-tourism': return 'HOTEL';
    case 'main-food': return 'RESTAURANT';
    case 'main-real-estate': return 'REAL_ESTATE';
    case 'main-professional': return 'PROFESSIONAL';
    case 'main-industry':
    case 'main-agriculture': return 'COMPANY';
    case 'main-public-services': return 'TELECOM';
    default: return 'SHOP';
  }
}

export async function fetchUnifiedBusinessTaxonomy(): Promise<{
  mains: UnifiedTaxonomyCategory[];
  subsByParent: Record<string, UnifiedTaxonomyCategory[]>;
  allSubs: UnifiedTaxonomyCategory[];
}> {
  const { data } = await supabase
    .from('categories')
    .select('id, name, short_name, slug, parent_id, category_level, type, sort_order, is_active')
    .neq('is_active', false)
    .in('type', ['business_main', 'entity'])
    .order('sort_order', { ascending: true });

  const rows = (data || []) as any[];
  const mains: UnifiedTaxonomyCategory[] = rows
    .filter((r) => r.category_level === 'main' || !r.parent_id)
    .map((r) => ({ ...r, short_name: r.short_name || r.name, category_level: 'main' }));

  const allSubs: UnifiedTaxonomyCategory[] = rows
    .filter((r) => r.parent_id && r.category_level === 'sub')
    .map((r) => ({ ...r, short_name: r.short_name || r.name, category_level: 'sub' }));

  const subsByParent: Record<string, UnifiedTaxonomyCategory[]> = {};
  for (const sub of allSubs) {
    if (!sub.parent_id) continue;
    if (!subsByParent[sub.parent_id]) subsByParent[sub.parent_id] = [];
    subsByParent[sub.parent_id].push(sub);
  }
  return { mains, subsByParent, allSubs };
}
