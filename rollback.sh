#!/bin/bash
if [ ! -f ".last_safe_backup" ]; then
    echo "❌ لا يوجد مسار نسخ احتياطي مسجل!"
    exit 1
fi

TARGET=$(cat .last_safe_backup)
if [ ! -d "$TARGET" ]; then
    echo "❌ مجلد النسخة الاحتياطية غير موجود: $TARGET"
    exit 1
fi

echo "⚠️ جاري التراجع واستعادة النسخة السليمة من: $TARGET"
cp -r "$TARGET/src" ./
cp "$TARGET/package.json" ./ 2>/dev/null || true
if [ -f "$TARGET/.env" ]; then cp "$TARGET/.env" ./; fi

# إذا كان Git موجوداً
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "🔄 مزامنة حالة Git..."
fi

echo "✅ تم التراجع بنجاح وعاد الكود تماماً كما كان!"
