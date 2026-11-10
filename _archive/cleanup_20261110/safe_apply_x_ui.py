import os
import re
import sys
import shutil
import subprocess
from pathlib import Path

# 1. Git Checkpoint (حفظ نقطة استعادة)
def create_git_checkpoint():
    try:
        subprocess.run(['git', 'add', '-A'], check=True, capture_output=True)
        subprocess.run(['git', 'commit', '-m', 'Checkpoint before X UI auto-fix'], check=True, capture_output=True)
        print("✅ Git Checkpoint: تم حفظ نقطة استعادة بنجاح.")
    except subprocess.CalledProcessError:
        print("⚠️ Git Checkpoint: لا توجد تغييرات جديدة لحفظها، أو Git غير مهيأ. سنكمل بالنسخ الاحتياطي العادي.")

# 2. Automatic Backup (نسخة احتياطية)
def backup_file(path):
    backup_path = path.with_suffix(path.suffix + '.safe_bak')
    shutil.copy2(path, backup_path)
    print(f"💾 Backup: نسخة احتياطية محفوظة في {backup_path}")
    return backup_path

# 3. Automatic Rollback (استعادة عند الفشل)
def rollback_file(path, backup_path):
    if backup_path.exists():
        shutil.copy2(backup_path, path)
        print(f"🔄 Automatic Rollback: تم إرجاع الملف {path} إلى النسخة السابقة.")
    else:
        print(f"❌ خطأ فادح: لم يتم العثور على نسخة احتياطية لـ {path}")

# 4. التعديل الذكي
def apply_fix(file_path):
    path = Path(file_path)
    if not path.exists():
        return True
    
    code = path.read_text(encoding='utf-8')
    
    # إضافة الأيقونات المفقودة بأمان
    for icon in ['Bookmark', 'BarChart2', 'Share', 'MessageCircle', 'Repeat2', 'Heart']:
        if f'{icon},' not in code and f'{icon} ' not in code and f'<{icon}' not in code:
            code = re.sub(r'import\s*\{', f'import {{ {icon},', code, count=1)

    # النمط الجديد لشريط التفاعل
    new_bar = r'''<div className="flex items-center justify-between mt-3 w-full max-w-[300px] text-[#71767B]">
  <button onClick={(e) => { e.stopPropagation(); typeof setViewingDetailTweet !== 'undefined' && setViewingDetailTweet(tweet); }} className="flex items-center gap-1 hover:text-[#1D9BF0] transition group">
    <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><MessageCircle size={16} /></div>
    <span className="text-[11px]">{tweet.repliesCount || tweet.replies || 0}</span>
  </button>
  <button onClick={(e) => { e.stopPropagation(); typeof setRepostMenu !== 'undefined' && setRepostMenu(tweet); }} className="flex items-center gap-1 hover:text-[#00BA7C] transition group">
    <div className="p-1.5 rounded-full group-hover:bg-[#00BA7C]/10"><Repeat2 size={16} /></div>
    <span className="text-[11px]">{tweet.retweetsCount || tweet.reposts || 0}</span>
  </button>
  <button onClick={(e) => { e.stopPropagation(); typeof handleLike !== 'undefined' && handleLike(tweet.id); }} className="flex items-center gap-1 transition group hover:text-[#F91880]">
    <div className="p-1.5 rounded-full group-hover:bg-[#F91880]/10"><Heart size={16} /></div>
    <span className="text-[11px]">{tweet.likesCount || tweet.likes || 0}</span>
  </button>
  <button className="flex items-center gap-1 hover:text-[#1D9BF0] transition group">
    <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><BarChart2 size={16} /></div>
    <span className="text-[11px]">{tweet.viewsCount || tweet.views || 0}</span>
  </button>
  <button className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group">
    <Bookmark size={16} />
  </button>
  <button className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group">
    <Share size={16} />
  </button>
</div>'''

    # استبدال أي شريط تفاعل قديم
    pattern = r'<div className="flex items-center justify-between[^>]*>[\s\S]*?<MessageCircle[\s\S]*?</div>'
    code, count = re.subn(pattern, new_bar, code)
    
    if count > 0:
        path.write_text(code, encoding='utf-8')
        print(f"🔧 تم تعديل {count} شريط تفاعل في {path.name}")
        return True
    return True

# تنفيذ السكربت
print("🚀 بدء عملية الحماية والتعديل...")
create_git_checkpoint()

target_files = ['src/pages/CommunityFeedPage.tsx', 'src/pages/AccountPage.tsx']
backups = {}

for f in target_files:
    if Path(f).exists():
        backups[f] = backup_file(Path(f))
        apply_fix(f)

# 5. فحص TypeScript
print("🔍 جاري فحص TypeScript للتأكد من سلامة الكود...")
check = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True)

if check.returncode != 0:
    print("❌ فشل فحص TypeScript! الأخطاء:")
    print(check.stderr[:1000]) # طباعة أول 1000 حرف من الخطأ
    print("🔄 تفعيل Fail-Safe Recovery (Automatic Rollback)...")
    for f, b in backups.items():
        rollback_file(Path(f), b)
    print("🛑 تم إلغاء التعديلات وإرجاع المشروع لحالته السليمة. لم يتم كسر أي شيء.")
else:
    print("🏆 نجح فحص TypeScript! الكود سليم 100%.")
    print("🎉 التعديلات تم تطبيقها وحفظها بنجاح.")

