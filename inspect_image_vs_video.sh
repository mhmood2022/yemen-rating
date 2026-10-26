#!/bin/bash
file="src/pages/CommunityFeedPage.tsx"

echo "=========================================="
echo " 🔍 1. هل توجد دوال ضغط صور أو تحويل في الملف؟"
echo "=========================================="
grep -n -C 3 -E "(compress|canvas|FileReader|readAsDataURL|imageCompression)" "$file" | head -n 30

echo -e "\n=========================================="
echo " 🔍 2. فحص الأسطر بين اختيار الملف وعملية النشر بدقة (560 إلى 605):"
echo "=========================================="
sed -n '560,605p' "$file"
