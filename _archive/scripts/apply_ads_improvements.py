import re

# ==========================================
# 1. تعديل AdGeneratorStudio.tsx (الخروج بعد النشر + إخفاء الشارة الافتراضية)
# ==========================================
with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "r", encoding="utf-8") as f:
    studio = f.read()

# التأكد من استيراد useNavigate
if "useNavigate" not in studio:
    studio = studio.replace(
        "import React,",
        "import { useNavigate } from 'react-router-dom';\nimport React,"
    )

# تفعيل useNavigate داخل المكون
if "const navigate = useNavigate();" not in studio:
    studio = studio.replace(
        "const [isMediaUploading, setIsMediaUploading]",
        "const navigate = useNavigate();\n  const [isMediaUploading, setIsMediaUploading]"
    )

# جعل الشارة معطلة افتراضياً وبدون نص مسبق
studio = studio.replace("const [showBadge, setShowBadge] = useState(true);", "const [showBadge, setShowBadge] = useState(false);")
studio = studio.replace("const [badgeText, setBadgeText] = useState('عرض خاص — يمن ريتنغ');", "const [badgeText, setBadgeText] = useState('');")

# تحويل المستخدم بعد الحفظ والخروج تلقائياً
old_save_action = "setPublishedAlert(true);\n    setTimeout(() => setPublishedAlert(false), 4000);"
new_save_action = """setPublishedAlert(true);
    // إشعار نجاح ثم الخروج تلقائياً لمعرض الإعلانات
    setTimeout(() => {
      setPublishedAlert(false);
      navigate('/admin/ads');
    }, 1500);"""

if old_save_action in studio:
    studio = studio.replace(old_save_action, new_save_action)
elif "setPublishedAlert(true);" in studio:
    studio = re.sub(
        r'setPublishedAlert\(true\);.*?setTimeout\(\(\) => setPublishedAlert\(false\), \d+\);',
        new_save_action,
        studio,
        flags=re.DOTALL
    )

with open("src/pages/admin/ads/AdGeneratorStudio.tsx", "w", encoding="utf-8") as f:
    f.write(studio)
print("✅ 1. تم تحديث AdGeneratorStudio (خروج تلقائي بعد النشر + إخفاء الشارة الافتراضية).")

# ==========================================
# 2. تعديل AdsManager.tsx (رسالة نجاح الحذف + الحذف من السحابة)
# ==========================================
with open("src/pages/admin/ads/AdsManager.tsx", "r", encoding="utf-8") as f:
    manager = f.read()

# استيراد adsDatabaseService إذا لم يكن موجوداً
if "adsDatabaseService" not in manager:
    manager = "import { adsDatabaseService } from '../../../services/adsDatabaseService';\n" + manager

# إضافة state لرسالة نجاح الحذف
if "const [deleteSuccess, setDeleteSuccess]" not in manager:
    manager = re.sub(
        r'(export const AdsManager:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{)',
        r'\1\n  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);',
        manager
    )

# تحديث دالة deleteAd
old_delete = """  const deleteAd = (id: string) => {
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);
    localStorage.setItem('yr_published_ads', JSON.stringify(updated));
  };"""

new_delete = """  const deleteAd = async (id: string) => {
    // 1. حذف محلياً
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);
    try {
      localStorage.setItem('yr_published_ads', JSON.stringify(updated));
    } catch (_) {}

    // 2. حذف من قاعدة بيانات Supabase السحابية
    try {
      await adsDatabaseService.deleteAd(id);
    } catch (e) {
      console.error("Delete from supabase error:", e);
    }

    // 3. عرض رسالة النجاح
    setDeleteSuccess('✅ تم حذف الإعلان بنجاح من قاعدة البيانات ومن المنصة بالكامل!');
    setTimeout(() => setDeleteSuccess(null), 3500);
  };"""

if old_delete in manager:
    manager = manager.replace(old_delete, new_delete)
else:
    manager = re.sub(
        r'const deleteAd = \(id: string\) => \{.*?localStorage\.setItem\(\x27yr_published_ads\x27, JSON\.stringify\(updated\)\);\s*\};',
        new_delete,
        manager,
        flags=re.DOTALL
    )

# إضافة صندوق رسالة النجاح في واجهة AdsManager
success_banner = """      {deleteSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <span>{deleteSuccess}</span>
          <button onClick={() => setDeleteSuccess(null)} className="text-emerald-400 hover:text-white px-2 py-0.5">✕</button>
        </div>
      )}"""

if "{deleteSuccess && (" not in manager:
    manager = manager.replace(
        '<div className="space-y-6 font-[\'Cairo\',sans-serif] pb-16">',
        '<div className="space-y-6 font-[\'Cairo\',sans-serif] pb-16">\n' + success_banner
    )

with open("src/pages/admin/ads/AdsManager.tsx", "w", encoding="utf-8") as f:
    f.write(manager)
print("✅ 2. تم تحديث AdsManager (رسالة نجاح الحذف السحابي والمحلي).")

# ==========================================
# 3. تعديل AdBanner.tsx (منع إظهار الشارة ما لم يفعلها المستخدم صراحة)
# ==========================================
with open("src/components/common/AdBanner.tsx", "r", encoding="utf-8") as f:
    banner = f.read()

# شرط الشارة: لا تظهر إلا إذا كانت showBadge مفعلة والنص غير فارغ
banner = banner.replace(
    "{adData.showBadge && (",
    "{adData.showBadge && adData.badgeText && ("
)

with open("src/components/common/AdBanner.tsx", "w", encoding="utf-8") as f:
    f.write(banner)
print("✅ 3. تم تأمين AdBanner (إلغاء فرض الشارة بدون اختيار المستخدم).")
