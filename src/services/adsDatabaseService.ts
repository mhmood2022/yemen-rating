import { supabase } from '../lib/supabase';
import { PublishedAd } from '../pages/admin/ads/AdGeneratorStudio';

export const adsDatabaseService = {
  // جلب كل الإعلانات النشطة من Supabase
  async getActiveAds(placementId?: string): Promise<PublishedAd[]> {
    try {
      let query = supabase
        .from('published_ads')
        .select('*')
        .eq('status', 'active');

      if (placementId) {
        query = query.eq('placement_id', String(placementId));
      }

      const { data, error } = await query;
      if (error) {
        console.error("خطأ في جلب الإعلانات من Supabase:", error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map(item => ({
          ...item.data,
          id: item.id,
          placementId: item.placement_id,
          status: item.status,
          views: item.views || 0,
          clicks: item.clicks || 0,
        }));
      }
      return [];
    } catch (err) {
      console.error("Ads fetch exception:", err);
      return [];
    }
  },

  // تسجيل نقرة
  async recordClick(adId: string) {
    try {
      const { data } = await supabase.from('published_ads').select('clicks').eq('id', adId).single();
      const currentClicks = data?.clicks || 0;
      await supabase.from('published_ads').update({ clicks: currentClicks + 1 }).eq('id', adId);
    } catch (err) {
      console.error("Error recording click:", err);
    }
  }
};
