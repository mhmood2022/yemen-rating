#!/bin/bash
file="src/pages/CommunityFeedPage.tsx"

echo "=== 1. فحص حقول الصورة واختيار الملف (input type=file) ==="
grep -n -C 3 -E 'type="file"' "$file"

echo -e "\n=== 2. فحص الدالة المسؤولة عن معالجة الصورة المرفوعة (handleImage / onChange) ==="
grep -n -C 4 -E '(handleImage|onImageChange|fileReader|readAsDataURL|upload)' "$file" | head -n 35

echo -e "\n=== 3. فحص كائن التغريدة الجديد عند الإرسال (New Tweet Object) ==="
grep -n -C 5 -E '(newTweet|createTweet|addTweet|content.*image|text.*image)' "$file" | head -n 35
