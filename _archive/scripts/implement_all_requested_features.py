import re

# ========================================================
# 1. إزالة شارة "عرض خاص" وضبط الحجم وزر الإغلاق في AdBanner.tsx
# ========================================================
with open("src/components/common/AdBanner.tsx", "r", encoding="utf-8") as f:
    banner = f.read()

# إزالة شارة عرض خاص تماماً
banner = re.sub(r'\{adData\.showBadge\s*&&[\s\S]*?\}', '', banner)

# ضبط الأبعاد والحواف بدون قص
banner = re.sub(r'minHeight:\s*[^,\n]+', "minHeight: isFooterSticky ? '54px' : '88px'", banner)
banner = re.sub(r'maxHeight:\s*[^,\n]+', "maxHeight: isFooterSticky ? '68px' : 'none'", banner)
banner = re.sub(r'borderRadius:\s*`\$\{adData\.borderRadius[^}]*\}px`', "borderRadius: '0px'", banner)

# التأكد من عدم قص زر الإجراء
banner = banner.replace("flex items-center justify-between border-t border-white/15", "flex items-center justify-between border-t border-white/10 shrink-0")
banner = banner.replace("flex items-center justify-between border-t border-white/10 mt-0.5", "flex items-center justify-between border-t border-white/10 shrink-0 mt-0.5")

with open("src/components/common/AdBanner.tsx", "w", encoding="utf-8") as f:
    f.write(banner)
print("✅ 1. تم تنظيف AdBanner.tsx (حذف شارة عرض خاص + ضبط الحجم وتحرير الأزرار).")

# ========================================================
# 2. تحديث AdGeneratorStudio.tsx (معاينة بدون قص + خروج بعد النشر + دعم التعديل)
# ========================================================
with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    studio = f.read()

# أ) استيراد useNavigate و useSearchParams لدعم التعديل والخروج
if "useSearchParams" not in studio:
    studio = studio.replace(
        "import React,",
        "import { useNavigate, useSearchParams } from 'react-router-dom';\nimport React,"
    )

# ب) إزالة الشارة الافتراضية نهائياً
studio = studio.replace("const [showBadge, setShowBadge] = useState(true);", "const [showBadge, setShowBadge] = useState(false);")
studio = studio.replace("const [badgeText, setBadgeText] = useState('عرض خاص — يمن ريتنغ');", "const [badgeText, setBadgeText] = useState('');")

# ج) تفعيل كود قراءة إعلان قيد التعديل editId
edit_hook = """  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const [isMediaUploading, setIsMediaUploading] = useState<boolean>(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');

  // تحميل بيانات الإعلان إذا كان المطلوب تعديله
  useEffect(() => {
    if (editId) {
      const loadAdForEdit = async () => {
        try {
          const adsList = await adsDatabaseService.getActiveAds();
          const targetAd = adsList.find(a => String(a.id) === String(editId));
          if (targetAd) {
            if (targetAd.headline) setHeadline(targetAd.headline);
            if (targetAd.description) setDescription(targetAd.description);
            if (targetAd.mediaUrl) setMediaFileUrl(targetAd.mediaUrl);
            if (targetAd.mediaType) setMediaType(targetAd.mediaType);
            if (targetAd.ctaText) setCtaText(targetAd.ctaText);
            if (targetAd.targetUrl) setTargetUrl(targetAd.targetUrl);
            if (targetAd.btnBgColor) setBtnBgColor(targetAd.btnBgColor);
            if (targetAd.btnTextColor) setBtnTextColor(targetAd.btnTextColor);
            if (targetAd.btnShape) setBtnShape(targetAd.btnShape);
            if (targetAd.btnAnimation) setBtnAnimation(targetAd.btnAnimation);
            if (targetAd.currentPrice) setCurrentPrice(targetAd.currentPrice);
            if (targetAd.oldPrice) setOldPrice(targetAd.oldPrice);
            if (targetAd.showPricing !== undefined) setShowPricing(targetAd.showPricing);
          }
        } catch (err) {
          console.error("Error loading ad for edit:", err);
        }
      };
      loadAdForEdit();
    }
  }, [editId]);"""

if "const editId = searchParams.get('editId');" not in studio:
    studio = re.sub(
        r'export const AdGeneratorStudio:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{',
        r'export const AdGeneratorStudio: React.FC = () => {\n' + edit_hook,
        studio
    )

# د) تحديث handleSaveAndPublish لاستخدام نفس ID إذا كان تعديلاً + الخروج التلقائي
old_id_gen = "id: `AD-${Date.now()}`,"
new_id_gen = "id: editId || `AD-${Date.now()}`,"
if old_id_gen in studio:
    studio = studio.replace(old_id_gen, new_id_gen)

exit_action = """    setPublishedAlert(true);
    // إشعار نجاح ثم خروج تلقائي لمعرض الإعلانات
    setTimeout(() => {
      setPublishedAlert(false);
      navigate('/admin/ads');
    }, 1500);"""

if "setTimeout(() => setPublishedAlert(false), 4000);" in studio:
    studio = studio.replace("setPublishedAlert(true);\n    setTimeout(() => setPublishedAlert(false), 4000);", exit_action)

# هـ) تحرير حاوية المعاينة من max-h وشريط الأزرار من الانضغاط
studio = re.sub(r'min-h-\[[^\]]+\]\s*max-h-\[[^\]]+\]', 'min-h-[92px] h-auto', studio)
studio = re.sub(r'min-h-\[160px\]', 'min-h-[92px] h-auto', studio)
studio = studio.replace(
    'className="relative z-20 pt-3 mt-2 flex justify-between items-center border-t border-white/10"',
    'className="relative z-20 pt-2 mt-1.5 flex justify-between items-center border-t border-white/10 shrink-0"'
)

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(studio)
print("✅ 2. تم تحديث AdGeneratorStudio.tsx (معاينة متناسقة + خروج بعد النشر + نظام التعديل).")

# ========================================================
# 3. تحديث AdsManager.tsx (إضافة زر التعديل ✏️ + رسالة نجاح الحذف)
# ========================================================
with open("src/pages/admin/ads/AdsManager.tsx", "r", encoding="utf-8") as f:
    manager = f.read()

# إضافة استيراد useNavigate و Pencil
if "useNavigate" not in manager:
    manager = manager.replace(
        "import React,",
        "import { useNavigate } from 'react-router-dom';\nimport React,"
    )
if "Pencil" not in manager:
    manager = manager.replace("Trash2,", "Trash2, Pencil,")

if "const navigate = useNavigate();" not in manager:
    manager = re.sub(
        r'(export const AdsManager:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{)',
        r'\1\n  const navigate = useNavigate();',
        manager
    )

# إضافة زر التعديل بجانب زر الحذف
edit_btn_jsx = """                    {/* زر تعديل الإعلان */}
                    <button
                      onClick={() => navigate(`/admin/ads/generator?editId=${ad.id}`)}
                      className="p-1.5 rounded-lg bg-[#FFC500]/15 text-[#FFC500] hover:bg-[#FFC500] hover:text-black transition-all"
                      title="تعديل هذا الإعلان"
                    >
                      <Pencil size={15} />
                    </button>"""

# وضع زر التعديل قبل زر الحذف
if "editId=" not in manager:
    manager = manager.replace(
        '<button onClick={() => deleteAd(ad.id)}',
        edit_btn_jsx + '\n                    <button onClick={() => deleteAd(ad.id)}'
    )

with open("src/pages/admin/ads/AdsManager.tsx", "w", encoding="utf-8") as f:
    f.write(manager)
print("✅ 3. تم تحديث AdsManager.tsx (إضافة زر التعديل ✏️ ورسالة الحذف).")
