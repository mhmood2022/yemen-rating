import { supabase } from '../lib/supabase';

// دالة تحويل لتوحيد أسماء الـ DB مع الواجهة الحالية
const mapBankData = (row: any) => ({
  id: row.id,
  slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
  name: row.name,
  category_label: row.business_type === 'WALLET' ? 'محفظة إلكترونية' : 'بنك ومصرف',
  badge_type: row.verified_badge_type || (row.is_verified ? 'gold' : 'gray'),
  city_name: row.city || 'غير محدد',
  address: row.address,
  logo_url: row.logo_url || 'https://via.placeholder.com/150',
  cover_url: row.cover_url || 'https://via.placeholder.com/800x400',
  short_description: row.description,
  description: row.description,
  phone: row.phone,
  whatsapp: row.whatsapp,
  email: row.email,
  website_url: row.website,
  is_verified: row.is_verified,
  branches_count: row.branches_count || 0,
  rating_summary: {
    average: Number(row.rating) || 0,
    count: Number(row.review_count) || 0,
    distribution: {} // يمكن حسابها لاحقاً
  },
  media: [],
  services: [],
  reviews: [] // سنحملها بشكل منفصل
});

export const bankService = {
  // جلب قائمة البنوك
  async fetchBanks() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .in('business_type', ['BANK', 'WALLET', 'EXCHANGE'])
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching banks:', error);
      return [];
    }
    return data.map(mapBankData);
  },

  // جلب بنك واحد
  async fetchBankBySlug(slug: string) {
    let { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      // محاولة البحث بالاسم كاحتياط
      const { data: nameData } = await supabase
        .from('businesses')
        .select('*')
        .ilike('name', `%${slug.replace(/-/g, ' ')}%`)
        .maybeSingle();
      data = nameData;
    }

    if (error || !data) return null;
    return mapBankData(data);
  },

  // جلب التقييمات
  async fetchReviews(businessId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    return data || [];
  },

  // إضافة تقييم
  async addReview(review: { business_id: string; author_name: string; rating: number; comment: string }) {
    const { error } = await supabase.from('reviews').insert([{
      business_id: review.business_id,
      author_name: review.author_name,
      rating: review.rating,
      comment: review.comment,
      is_approved: true // الموافقة الفورية (يمكن تغييرها لـ false للمراجعة الإدارية)
    }]);
    return { success: !error, error };
  },

  // إثبات الملكية
  async submitOwnershipClaim(claim: { business_id: string; claimant_name: string; claimant_phone: string; notes?: string }) {
    const { error } = await supabase.from('business_claims').insert([{
      business_id: claim.business_id,
      claimant_name: claim.claimant_name,
      claimant_phone: claim.claimant_phone,
      notes: claim.notes,
      status: 'PENDING'
    }]);
    return { success: !error, error };
  }
};
