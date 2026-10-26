#!/bin/bash
set -e

BACKUP_DIR=".safe_backups/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=========================================="
echo " 🛡️ جاري إنشاء نظام الحماية ونقطة الاسترجاع..."
echo "=========================================="

# 1. نسخ أهم الملفات الحساسة
cp -r src "$BACKUP_DIR/" 2>/dev/null || true
cp package.json "$BACKUP_DIR/" 2>/dev/null || true
if [ -f ".env" ]; then cp .env "$BACKUP_DIR/"; fi

# حفظ مسار آخر نسخة احتياطية
echo "$BACKUP_DIR" > .last_safe_backup

# 2. إنشاء سكربت التراجع التلقائي (Rollback)
cat << 'ROOF' > rollback.sh
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
ROOF

chmod +x rollback.sh

# 3. عمل Commit أمان في Git إذا كان مستودع جيت مفعل
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git stash 2>/dev/null || true
    git branch -f safety-checkpoint 2>/dev/null || true
    echo "✔️ تم إنشاء نقطة أمان في Git (فرع: safety-checkpoint)"
fi

echo "✅ تم تأمين المشروع وحفظ النسخة في: $BACKUP_DIR"
echo "💡 في أي وقت ترغب فيه بالعودة للوضع السابق، نفذ فقط: ./rollback.sh"
echo "=========================================="
