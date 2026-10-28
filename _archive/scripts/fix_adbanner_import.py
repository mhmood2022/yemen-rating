with open("src/components/common/AdBanner.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. إضافة استيراد adsDatabaseService المفقود
import_target = "import { PublishedAd } from '../../pages/admin/ads/AdGeneratorStudio';"
import_replacement = """import { PublishedAd } from '../../pages/admin/ads/AdGeneratorStudio';
import { adsDatabaseService } from '../../services/adsDatabaseService';"""

if "import { adsDatabaseService }" not in code:
    code = code.replace(import_target, import_replacement)
    print("✅ 1. تم إضافة استيراد adsDatabaseService بنجاح!")

# 2. تحصين قراءة الذاكرة لجلب أحدث إعلان فوراً
old_fetch = """      const fetchFromDatabase = async () => {
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
      };"""

new_fetch = """      const fetchFromDatabase = async () => {
        try {
          const liveAds = await adsDatabaseService.getActiveAds(placementId);
          // استبعاد أي روابط وهمية قديمة blob
          const validAds = (liveAds || []).filter(a => a.mediaUrl && !a.mediaUrl.startsWith('blob:'));
          if (validAds.length > 0 && isMounted) {
            const liveMatch = validAds[0];
            setAdData(liveMatch);
            try {
              localStorage.setItem('yr_published_ads', JSON.stringify(validAds));
            } catch (_) {}
          }
        } catch (err) {
          console.error("AdBanner database fetch error:", err);
        }
      };"""

if old_fetch in code:
    code = code.replace(old_fetch, new_fetch)
    print("✅ 2. تم تحصين دالة fetchFromDatabase.")

# 3. التأكد من ظهور الفيديو بالطبقة المناسبة
code = code.replace(
    '<video src={adData.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />',
    '<video src={adData.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover relative z-10" />'
)

with open("src/components/common/AdBanner.tsx", "w", encoding="utf-8") as f:
    f.write(code)
print("✅ تم حفظ التعديلات في src/components/common/AdBanner.tsx بنجاح!")
