with open("src/components/common/AdBanner.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# إلغاء خاصية الاستعارة وجعل كل موضع صارماً 100%
old_fetch_logic = """      try {
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
      }"""

new_strict_fetch = """      try {
        // جلب حصري وصارم للموضع المطلوب فقط بدون استعارة من مواضع أخرى
        const liveAds = await adsDatabaseService.getActiveAds(placementId);
        const validAds = (liveAds || []).filter(a => 
          String(a.placementId) === String(placementId) && 
          a.mediaUrl && 
          !a.mediaUrl.startsWith('blob:')
        );

        if (validAds.length > 0 && isMounted) {
          setAdData(validAds[0]);
        } else if (isMounted) {
          // إذا لم يوجد إعلان لهذا الموضع بالذات، يبقى فارغاً ومخفياً تماماً
          setAdData(null);
        }
      } catch (err) {
        console.error("AdBanner fetch error:", err);
      }"""

# فحص واستبدال
import re
code = re.sub(
    r'const fetchFromDatabase = async \(\) => \{.*?fetchFromDatabase\(\);',
    f'const fetchFromDatabase = async () => {{\n{new_strict_fetch}\n    }};\n\n    fetchFromDatabase();',
    code,
    flags=re.DOTALL
)

with open("src/components/common/AdBanner.tsx", "w", encoding="utf-8") as f:
    f.write(code)
print("✅ 2. تم ضبط العرض ليكون صارماً: كل موضع يعرض إعلانه فقط أو يختفي.")
