#!/bin/bash
file="src/pages/CommunityFeedPage.tsx"

echo "=========================================="
echo " 🔍 1. تكملة دالة النشر وبناء newTweet (السطور 650 إلى 705):"
echo "=========================================="
sed -n '650,705p' "$file"

echo -e "\n=========================================="
echo " 🔍 2. أين يوجد زر اختيار الصورة في واجهة المستخدم (JSX)؟"
echo "=========================================="
grep -n -C 4 -E "(imageInputRef\.current\.click|onClick.*imageInputRef)" "$file"
