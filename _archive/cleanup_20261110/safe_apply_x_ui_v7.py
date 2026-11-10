import os
import re
import sys
import shutil
import subprocess
from pathlib import Path

def create_git_checkpoint():
    try:
        subprocess.run(['git', 'add', '-A'], check=True, capture_output=True)
        subprocess.run(['git', 'commit', '-m', 'Checkpoint before X UI v7 surgical fix'], check=True, capture_output=True)
        print("✅ Git Checkpoint: تم حفظ نقطة استعادة.")
    except subprocess.CalledProcessError:
        pass

def backup_file(path):
    backup_path = path.with_suffix(path.suffix + '.safe_bak')
    shutil.copy2(path, backup_path)
    print(f"💾 Backup: {backup_path.name}")
    return backup_path

def rollback_file(path, backup_path):
    if backup_path.exists():
        shutil.copy2(backup_path, path)
        print(f"🔄 Rollback: تم إرجاع {path.name}.")

def apply_surgical_fix(file_path):
    path = Path(file_path)
    if not path.exists():
        return True
    
    code = path.read_text(encoding='utf-8')

    # 1. التأكد من استيراد XActionBar في البداية بشكل نظيف
    if 'XActionBar' not in code:
        code = "import { XActionBar } from '../components/feed/XActionBar';\n" + code
        print("📥 تمت إضافة استيراد XActionBar.")

    # 2. الاستبدال الجراحي الدقيق (يعتمد على متغير tweet.likes لتحديد الشريط)
    # هذا النمط يبحث عن div يبدأ بـ flex justify-between ويحتوي بداخله على tweet.likes
    old_tweet_bar_regex = r'<div[^>]*className="[^"]*flex items-center justify-between[^"]*"[^>]*>[\s\S]*?\{tweet\.(likes|reposts|replies)[\s\S]*?<\/div>'

    replacement = '''<XActionBar 
                                tweet={tweet} 
                                currentUserId={currentUserId}
                                onReply={(t) => typeof setViewingDetailTweet !== 'undefined' && setViewingDetailTweet(t)}
                                onRepost={(t) => typeof setRepostMenu !== 'undefined' && setRepostMenu(t)}
                                onLike={(t) => typeof handleLike !== 'undefined' && handleLike(t.id)}
                              />'''

    # تطبيق الاستبدال على أول تطابق فقط (count=1) داخل حلقة التغريدات
    code, count = re.subn(old_tweet_bar_regex, replacement, code, count=1)

    if count > 0:
        path.write_text(code, encoding='utf-8')
        print(f"🔧 نجاح: تم استبدال الشريط بدقة جراحية في {path.name}")
        return True
    else:
        print(f"⚠️ لم يتم العثور على شريط tweet.likes في {path.name}.")
        return False

print("🚀 بدء التطبيق الجراحي (v7)...")
create_git_checkpoint()

target_file = 'src/pages/CommunityFeedPage.tsx'
backup = backup_file(Path(target_file))
success = apply_surgical_fix(target_file)

if success:
    print("🔍 جاري فحص TypeScript...")
    # نفحص فقط الملف الذي عدلناه لتجنب أخطاء الملفات الأخرى
    check = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True)
    
    if check.returncode != 0:
        errors = check.stdout + check.stderr
        # تجاهل أخطاء AuthContext والملفات التي لم نعدلها
        relevant_errors = [line for line in errors.split('\n') if ('CommunityFeedPage' in line or 'XActionBar' in line) and line.strip() != '']
        
        if relevant_errors:
            print("❌ فشل فحص TypeScript في الملفات المعدلة! تفعيل Rollback...")
            print('\n'.join(relevant_errors[:5]))
            rollback_file(Path(target_file), backup)
            print("🛑 تم إلغاء التعديل. الموقع سليم.")
        else:
            print("🏆 نجح الفحص! (تم تجاهل أخطاء الملفات القديمة).")
    else:
        print("🏆 نجح فحص TypeScript بالكامل! التعديل الجراحي تم بنجاح 100%.")
else:
    print("🛑 لم يتم إجراء أي تعديل.")

print("👉 يرجى تحديث المتصفح (Refresh) لرؤية النتيجة.")
