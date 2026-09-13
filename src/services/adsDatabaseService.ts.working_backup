import { supabase } from '../lib/supabase';
import { PublishedAd } from '../pages/admin/ads/AdGeneratorStudio';

export const adsDatabaseService = {
  // 1. جلب كل الإعلانات النشطة
  async getActiveAds(placementId?: string): Promise<PublishedAd[]> {
    try {
      let query = supabase
        .from('published_ads')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

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

  // 2. نشر وحفظ الإعلان في قاعدة بيانات Supabase
  async publishAd(ad: PublishedAd): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('published_ads')
        .upsert({
          id: ad.id,
          placement_id: String(ad.placementId || '1'),
          status: ad.status || 'active',
          data: ad,
          views: ad.views || 1,
          clicks: ad.clicks || 0,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("خطأ في رفع الإعلان إلى Supabase:", error);
        return false;
      }
      console.log("✅ تم حفظ الإعلان بنجاح في Supabase:", ad.id);
      return true;
    } catch (err) {
      console.error("Ads publish exception:", err);
      return false;
    }
  },

  // 3. حذف إعلان من Supabase
  async deleteAd(adId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('published_ads').delete().eq('id', adId);
      return !error;
    } catch {
      return false;
    }
  },

  // 4. تسجيل نقرة على الإعلان
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
