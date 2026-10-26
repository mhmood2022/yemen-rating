#!/bin/bash

echo "=========================================="
echo "   🔍 بدء فحص مشكلة رفع وظهور الصور"
echo "=========================================="

echo -e "\n1️⃣ [نوع المشروع والملفات الأساسية]:"
if [ -f "package.json" ]; then echo "✔️ مشروع Node.js / Next.js / React"; fi
if [ -f "artisan" ]; then echo "✔️ مشروع Laravel (PHP)"; fi
if [ -f "requirements.txt" ] || [ -f "manage.py" ]; then echo "✔️ مشروع Python / Django / Flask"; fi

echo -e "\n2️⃣ [فحص مجلدات التخزين والرفع المعتادة ومطابقتها]:"
dirs=("public/uploads" "uploads" "storage/app/public" "public/storage" "static/uploads" "media")
for d in "${dirs[@]}"; do
    if [ -d "$d" ]; then
        echo "📂 مجلد موجود: $d"
        echo "   الصلاحيات: $(ls -ld $d | awk '{print $1, $3, $4}')"
        echo "   عدد الملفات داخله: $(ls -1 "$d" 2>/dev/null | wc -l)"
    fi
done

echo -e "\n3️⃣ [البحث عن آخر 5 صور تم رفعها في المشروع]:"
find . -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.jpeg" -o -iname "*.webp" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/vendor/*" -printf "%T@ %Tc %p\n" 2>/dev/null | sort -n | tail -n 5 | awk '{print $6, $7, $8, $9, $10}'

echo -e "\n4️⃣ [فحص الروابط الثابتة ومسارات التخزين في الكود]:"
echo "- مسارات الرفع المكتوبة في الكود:"
grep -rnE "(uploadDir|multer|diskStorage|storage_path|move_uploaded_file|MEDIA_URL)" --exclude-dir={node_modules,vendor,.git,.next,build} . 2>/dev/null | head -n 10

echo -e "\n5️⃣ [فحص إعدادات خدمة الملفات الثابتة (Static Files)]:"
if [ -f "package.json" ]; then
    grep -rnE "express.static" --exclude-dir={node_modules,.git} . 2>/dev/null
fi
if [ -f "artisan" ]; then
    if [ -L "public/storage" ]; then
        echo "✔️ رابط Laravel التخزيني (Symlink) موجود."
    else
        echo "❌ تنبيه: رابط storage غير موجود! (قد تحتاج لتشغيل: php artisan storage:link)"
    fi
fi

echo -e "\n6️⃣ [فحص ملف البيئة .env لرابط السيرفر الأساسي APP_URL]:"
if [ -f ".env" ]; then
    grep -E "(APP_URL|BASE_URL|HOST|PORT|SERVER_URL)" .env
fi

echo -e "\n=========================================="
echo "   ✅ انتهى الفحص!"
echo "=========================================="
