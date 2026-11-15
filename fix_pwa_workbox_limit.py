import shutil, time

file = 'vite.config.ts'
shutil.copy(file, f"{file}.bak_pwalimit_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# إضافة إعدادات workbox لرفع الحد الأقصى للملفات
if 'maximumFileSizeToCacheInBytes' not in content:
    content = content.replace(
        "VitePWA({",
        "VitePWA({\n          workbox: {\n            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5 MB\n          },"
    )
    print("✅ تم رفع الحد الأقصى لذاكرة الكاش إلى 5 ميجابايت.")
else:
    print("ℹ️ إعدادات workbox موجودة بالفعل.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
