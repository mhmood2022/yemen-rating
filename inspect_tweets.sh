#!/bin/bash
echo "=========================================="
echo " 🔍 فحص كود نشر التغريدات والصور"
echo "=========================================="

echo -e "\n1️⃣ [ملفات الواجهة أو الباك إند التي تتعامل مع التغريدات/المجتمع]:"
find . -type f \( -iname "*tweet*" -o -iname "*post*" -o -iname "*community*" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*"

echo -e "\n2️⃣ [كيف يتم إرسال البيانات عند الضغط على نشر؟]:"
grep -rnE "(FormData|append\(|JSON.stringify|image.*tweet|tweet.*image)" --exclude-dir={node_modules,.git,.next,build} --include=\*.{js,ts,jsx,tsx} . | head -n 20

echo -e "\n3️⃣ [فحص السحابة أو خدمة الرفع (مثل Cloudinary)]:"
grep -rnE "(CLOUDINARY|AWS|S3|IMGBB|upload_preset)" --exclude-dir={node_modules,.git} . 2>/dev/null | head -n 10

echo -e "\n4️⃣ [فحص كود عرض التغريدة (هل يتم طلب الصورة؟)]:"
grep -rnE "(<img|image|photo).*(tweet|post)" --exclude-dir={node_modules,.git,.next} --include=\*.{js,ts,jsx,tsx} . | head -n 10

echo -e "\n=========================================="
