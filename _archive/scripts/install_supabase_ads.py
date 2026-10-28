import os, re

# 1. إنشاء مجلد src/services
os.makedirs("src/services", exist_ok=True)

# 2. إنشاء ملف خدمة جلب الإعلانات من Supabase
service_code = '''import { supabase } from '../lib/supabase';
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
'''

with open("src/services/adsDatabaseService.ts", "w", encoding="utf-8") as f:
    f.write(service_code)
print("✅ 1. تم إنشاء src/services/adsDatabaseService.ts بنجاح!")

# 3. تحديث مكون AdBanner.tsx ليجلب الإعلانات من Supabase تلقائياً
with open("src/components/common/AdBanner.tsx", "r", encoding="utf-8") as f:
    ad_banner = f.read()

# إضافة استيراد الخدمة
if "adsDatabaseService" not in ad_banner:
    ad_banner = ad_banner.replace(
        "import { PublishedAd } from '../../pages/admin/ads/AdGeneratorStudio';",
        "import { PublishedAd } from '../../pages/admin/ads/AdGeneratorStudio';\nimport { adsDatabaseService } from '../../services/adsDatabaseService';"
    )

# تحديث الـ useEffect ليقرأ من Supabase
old_pattern = r'useEffect\(\(\) => \{.*?localStorage\.getItem\(\x27yr_published_ads\x27\);.*?\}, \[placementId\]\);'

new_effect = '''useEffect(() => {
    let isMounted = true;

    // 1. قراءة فورية من الكاش إذا توفر
    const saved = localStorage.getItem('yr_published_ads');
    if (saved) {
      try {
        const adsList: PublishedAd[] = JSON.parse(saved);
        const match = adsList.find(a => a.status === 'active' && String(a.placementId) === String(placementId)) || adsList.find(a => a.status === 'active');
        if (match && isMounted) setAdData(match);
      } catch (e) {
        console.error(e);
      }
    }

    // 2. جلب فوري ومباشر من قاعدة بيانات Supabase (يعمل في التصفح الخفي ولكافة الزوار)
    const fetchFromDatabase = async () => {
      try {
        const liveAds = await adsDatabaseService.getActiveAds(placementId);
        if (liveAds && liveAds.length > 0 && isMounted) {
          const liveMatch = liveAds[0];
          setAdData(liveMatch);
          try {
            localStorage.setItem('yr_published_ads', JSON.stringify(liveAds));
          } catch (_) {}
        }
      } catch (err) {
        console.error("AdBanner database fetch error:", err);
      }
    };

    fetchFromDatabase();

    return () => {
      isMounted = false;
    };
  }, [placementId]);'''

ad_banner = re.sub(old_pattern, new_effect, ad_banner, flags=re.DOTALL)

with open("src/components/common/AdBanner.tsx", "w", encoding="utf-8") as f:
    f.write(ad_banner)
print("✅ 2. تم ربط AdBanner.tsx بـ Supabase بنجاح!")
