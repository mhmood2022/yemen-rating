#!/bin/bash
file="src/pages/CommunityFeedPage.tsx"

echo "=========================================="
echo " 🔍 1. كيف يتم عرض الفيديو في التغريدات (لماذا ينجح؟):"
echo "=========================================="
grep -n -C 3 -E "(<video|video_url|videoPlayer)" "$file" | head -n 30

echo -e "\n=========================================="
echo " 🔍 2. كيف يتم عرض الصور في التغريدات في نفس الصفحة:"
echo "=========================================="
grep -n -C 3 -E "(<img.*tweet|<img.*post|tweet\.image|post\.image)" "$file" | head -n 30
