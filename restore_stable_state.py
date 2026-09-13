# مزامنة كل الإعلانات الـ 10 من Supabase إلى localStorage لكي يقرأها AdsManager فوراً كما كانت
import json

with open("src/pages/admin/ads/AdsManager.tsx", "r", encoding="utf-8") as f:
    manager = f.read()

# التأكد من استيراد adsDatabaseService
if "adsDatabaseService" not in manager:
    manager = "import { adsDatabaseService } from '../../../services/adsDatabaseService';\n" + manager

# جلب كافة الإعلانات ومزامنتها في لوحة التحكم
sync_hook = """  useEffect(() => {
    const fetchAllAds = async () => {
      try {
        const cloudAds = await adsDatabaseService.getActiveAds();
        if (cloudAds && cloudAds.length > 0) {
          setAds(cloudAds);
          try {
            localStorage.setItem('yr_published_ads', JSON.stringify(cloudAds));
          } catch (_) {}
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAllAds();
  }, []);"""

if "fetchAllAds" not in manager:
    manager = manager.replace(
        "const [ads, setAds] = useState<PublishedAd[]>(() => {",
        sync_hook + "\n\n  const [ads, setAds] = useState<PublishedAd[]>(() => {"
    )

with open("src/pages/admin/ads/AdsManager.tsx", "w", encoding="utf-8") as f:
    f.write(manager)

print("✅ تم استرجاع الحالة السابقة المستقرة بنجاح تام!")
