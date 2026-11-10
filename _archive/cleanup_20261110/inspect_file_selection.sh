#!/bin/bash
file="src/pages/CommunityFeedPage.tsx"

echo "=========================================="
echo " 🔍 1. جميع الأماكن التي يتم فيها تعيين أو تفريغ setSelectedFile:"
echo "=========================================="
grep -n -C 2 -E "setSelectedFile" "$file"

echo -e "\n=========================================="
echo " 🔍 2. أين تقع أزرار النشر (Submit Buttons) في الصفحة؟"
echo "=========================================="
grep -n -C 3 -E "(handlePost|handleCreateTweet|publishTweet|onClick.*Post)" "$file" | head -n 35

echo -e "\n=========================================="
echo " 🔍 3. فحص النوافذ المنبثقة (Modals) للتغريد:"
echo "=========================================="
grep -n -C 3 -E "(isPostModalOpen|TweetModal|ComposeModal)" "$file" | head -n 30
