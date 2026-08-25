import { supabase } from '../lib/supabase';
import { BusinessItem, DbBusiness } from '../types/database.types';

const mapBusiness = (db: DbBusiness): BusinessItem => ({
  id: db.id,
  slug: db.slug || db.id,
  name: db.name,
  category: db.categories?.slug || 'services',
  categoryName: db.categories?.name || db.sub_category || 'خدمات',
  city: db.city || 'صنعاء',
  district: db.address || '',
  phone: db.phone || '',
  whatsapp: db.whatsapp || '',
  email: db.email || undefined,
  website_url: db.website_url || undefined,
  logo_url: db.logo_url || undefined,
  cover_url: db.cover_url || undefined,
  gallery_urls: db.gallery_urls || [],
  yr_score: Number(db.yr_score) || 0,
  rating: Number(db.rating) || 0,
  reviews_count: db.review_count || 0,
  badge_type: db.badge_type || 'gray',
  is_verified: db.is_verified || false,
  claim_status: db.claim_status || 'UNCLAIMED',
  description: db.description || '',
  latitude: db.latitude,
  longitude: db.longitude,
  services: Array.isArray(db.sections_config?.services) ? db.sections_config.services : [],
  quote_text: db.description ? db.description.slice(0, 120) + (db.description.length > 120 ? '...' : '') : 'لا يوجد وصف',
});

export async function getBusinesses(filters?: {
  category?: string;
  city?: string;
  query?: string;
  limit?: number;
}): Promise<BusinessItem[]> {
  let q = supabase
    .from('businesses')
    .select('*, categories(id, slug, name, icon)')
    .eq('status', 'active')
    .order('yr_score', { ascending: false })
    .limit(filters?.limit || 50);

  if (filters?.category) {
    q = q.eq('categories.slug', filters.category);
  }
  if (filters?.city) {
    q = q.eq('city', filters.city);
  }
  if (filters?.query) {
    q = q.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }

  const { data, error } = await q;
  if (error) { console.error('getBusinesses error:', error); return []; }
  return (data || []).map((r: any) => mapBusiness(r as DbBusiness));
}

export async function getBusinessBySlug(slug: string): Promise<BusinessItem | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*, categories(id, slug, name, icon)')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapBusiness(data as DbBusiness);
}

export async function getCategories(): Promise<{ slug: string; name: string; icon: string; count: number }[]> {
  const { data: cats } = await supabase.from('categories').select('id, slug, name, icon, sort_order').order('sort_order');
  const { data: biz } = await supabase.from('businesses').select('category_id').eq('status', 'active');
  const counts: Record<string, number> = {};
  const idToSlug: Record<string, string> = {};
  (biz || []).forEach(b => { counts[b.category_id] = (counts[b.category_id] || 0) + 1; });
  (cats || []).forEach(c => { idToSlug[c.id] = c.slug; });
  return (cats || []).map(c => ({ slug: c.slug, name: c.name, icon: c.icon || 'fa-building', count: counts[c.id] || 0 }));
}

// --- خدمات التواصل والـ Leads والإعلانات الجديدة ---

export async function sendLeadRequest(leadData: any) {
  try {
    const { data, error } = await supabase.from('yr_leads').insert([leadData]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error sending lead request:', err);
    return { success: false, error: err };
  }
}

export async function sendMessageToBusiness(messageData: any) {
  try {
    const { data, error } = await supabase.from('yr_messages').insert([messageData]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error sending message:', err);
    return { success: false, error: err };
  }
}

export async function trackBusinessEvent(businessId: string, eventType: 'view' | 'phone' | 'direction' | 'website') {
  try {
    const today = new Date().toISOString().split('T')[0];
    const updateField = eventType === 'phone' ? 'phone_clicks' 
      : eventType === 'direction' ? 'directions_clicks'
      : eventType === 'website' ? 'website_clicks' : 'views_count';

    const { data, error } = await supabase.rpc('increment_business_metric', {
      b_id: businessId,
      metric_field: updateField,
      p_date: today
    });
    return { success: !error };
  } catch (err) {
    return { success: false };
  }
}

// --- دالة جلب الأنشطة التجارية لـ Local Discovery ---
export async function fetchBusinesses() {
  try {
    const { data, error } = await supabase.from('businesses').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching businesses:', err);
    return [];
  }
}
