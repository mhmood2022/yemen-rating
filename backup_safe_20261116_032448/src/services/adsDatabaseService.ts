
// فحص صلاحية تاريخ الإعلان برمجياً
export const isAdCurrentlyValid = (adData: any): boolean => {
  if (!adData) return false;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. فحص تاريخ البدء (إذا كان محدداً ولم يأتِ بعد -> لا يظهر)
  const startDate = adData.startDate || adData.start_date;
  if (startDate && startDate > todayStr) {
    return false;
  }

  // 2. فحص تاريخ الانتهاء (إذا كان محدداً ومضى وقته -> لا يظهر)
  const endDate = adData.endDate || adData.end_date || adData.contractExpiry || adData.contract_expiry;
  if (endDate && endDate < todayStr) {
    return false;
  }

  return true;
};

import { supabase } from '../lib/supabase';
import { PublishedAd } from '../pages/admin/ads/AdGeneratorStudio';

export const adsDatabaseService = {
  // جلب إعلان محدد بدقة بواسطة ID (سواء نشط أو متوقف)
  async getAdById(adId: string): Promise<PublishedAd | null> {
    try {
      const { data, error } = await supabase
        .from("published_ads")
        .select("*")
        .eq("id", adId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        ...data.data,
        id: data.id,
        placementId: data.placement_id,
        status: data.status,
        views: data.views || 0,
        clicks: data.clicks || 0,
      };
    } catch (err) {
      console.error("Error fetching ad by id:", err);
      return null;
    }
  },

  // 1. جلب كل الإعلانات النشطة
  async getActiveAds(placementId?: string): Promise<PublishedAd[]> {
    try {
      let query = supabase
        .from("published_ads")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (placementId) {
        query = query.eq("placement_id", String(placementId));
      }

      const { data, error } = await query;
      if (error) {
        console.error("خطأ في جلب الإعلانات من Supabase:", error);
        return [];
      }

      if (data && data.length > 0) {
        // فلترة صارمة: فحص الحالة النشطة وتاريخ البدء والانتهاء الحقيقي
        return data
          .filter(item => {
            const adInfo = item.data || {};
            return isAdCurrentlyValid(adInfo);
          })
          .map(item => ({
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
  
  // تحديث حالة الإعلان في Supabase مباشرة (نشط / متوقف)
  async updateAdStatus(adId: string, status: "active" | "paused"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("published_ads")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", adId);

      if (error) {
        console.error("خطأ في تحديث حالة الإعلان في Supabase:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("فشل تحديث حالة الإعلان:", err);
      return false;
    }
  },

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
