#!/bin/bash
file="src/pages/CommunityFeedPage.tsx"

echo "=========================================="
echo " 🔍 فحص نافذة كتابة ونشر التغريدة في الجوال:"
echo "=========================================="
# عرض الأسطر حول زر النشر والأيقونات داخل الـ Modal
sed -n '1940,2075p' "$file" | grep -n -C 3 -E "(handlePostTweet|onClick|textarea|input|tweetImage)"
