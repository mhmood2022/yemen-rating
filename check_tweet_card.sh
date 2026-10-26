#!/bin/bash
echo "=== 1. ملفات مكونات التغريدات الحالية (داخل src) ==="
find src -type f \( -iname "*tweet*" -o -iname "*feed*" \) 2>/dev/null

echo -e "\n=== 2. فحص كود TweetCard الفعلي (هل يحتوي على كود لعرض الصور؟) ==="
card_file=$(find src -name "TweetCard.tsx" -o -name "TweetCard.jsx" | head -n 1)
if [ -n "$card_file" ]; then
    echo "الملف الموجود: $card_file"
    echo "--- البحث عن وسوم img أو image داخله ---"
    grep -n -C 2 -E "(tweet\.image|tweet\.media|tweet\.photos|<img)" "$card_file"
else
    echo "لم يتم العثور على TweetCard داخل src"
fi

echo -e "\n=== 3. فحص كود نشر التغريدة (كيف يتم إرسال الصورة عند النشر؟) ==="
create_file=$(find src -iname "*create*tweet*" -o -iname "*tweet*box*" -o -iname "*compose*" | head -n 1)
if [ -n "$create_file" ]; then
    echo "ملف إنشاء التغريدة: $create_file"
    grep -n -C 2 -E "(handle.*submit|publish|post|image|setImage)" "$create_file" | head -n 30
fi
