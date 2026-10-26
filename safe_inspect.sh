#!/bin/bash
file="src/pages/CommunityFeedPage.tsx"

echo "=========================================="
echo " 🔍 فحص ربط رابط الصورة (Mapping) في الكود"
echo "=========================================="

echo -e "\n1️⃣ [كيف يتم تجهيز التغريدة من قاعدة البيانات للعرض على الشاشة؟]:"
grep -n -C 5 -E "(imageUrl|image_url|videoUrl|video_url)" "$file" | head -n 45

echo -e "\n2️⃣ [كيف يتم إرسال الصورة عند نشر تغريدة جديدة إلى Supabase؟]:"
grep -n -C 8 -E "supabase\s*\.from\('posts'\)\s*\.insert" "$file"

echo "=========================================="
