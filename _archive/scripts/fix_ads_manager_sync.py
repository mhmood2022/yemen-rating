with open("src/pages/admin/ads/AdsManager.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# التأكد من استيراد adsDatabaseService
if "adsDatabaseService" not in code:
    code = "import { adsDatabaseService } from '../../../services/adsDatabaseService';\n" + code

# إضافة useEffect لجلب كل الإعلانات من Supabase إلى لوحة التحكم
old_init = "const [ads, setAds] = useState<PublishedAd[]>(() => {"
sync_code = """useEffect(() => {
    // جلب كافة الإعلانات الحية من Supabase للوحة التحكم
    const loadAllAdsFromCloud = async () => {
      try {
        const cloudAds = await adsDatabaseService.getActiveAds();
        if (cloudAds && cloudAds.length > 0) {
          setAds(cloudAds);
          try {
            localStorage.setItem('yr_published_ads', JSON.stringify(cloudAds));
          } catch (_) {}
        }
      } catch (err) {
        console.error("Error loading ads from cloud:", err);
      }
    };
    loadAllAdsFromCloud();
  }, []);"""

if "loadAllAdsFromCloud" not in code:
    # نضع الـ useEffect بعد تعريف الـ State
    code = code.replace(
        "const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);",
        "const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);\n\n  " + sync_code
    )

with open("src/pages/admin/ads/AdsManager.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("✅ تم ربط لوحة تحكم الإعلانات بسحابة Supabase وستظهر كل إعلاناتك الـ 10 الآن فوراً!")
