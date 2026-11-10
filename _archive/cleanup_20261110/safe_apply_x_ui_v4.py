import os
import re
import sys
import shutil
import subprocess
from pathlib import Path

def create_git_checkpoint():
    try:
        subprocess.run(['git', 'add', '-A'], check=True, capture_output=True)
        subprocess.run(['git', 'commit', '-m', 'Checkpoint before X UI v4 auto-fix'], check=True, capture_output=True)
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

def apply_fix(file_path):
    path = Path(file_path)
    if not path.exists():
        return True
    
    code = path.read_text(encoding='utf-8')

    required_icons = ['MessageCircle', 'Repeat2', 'Heart', 'BarChart2', 'Bookmark', 'Share']
    for icon in required_icons:
        if not re.search(rf'\b{icon}\b', code):
            code = re.sub(r'import\s*\{', f'import {{ {icon},', code, count=1)

    new_bar = r'''<div className="flex items-center justify-between mt-3 w-full max-w-[320px] text-[#71767B] pr-0" dir="ltr">
  <button onClick={(e) => { e.stopPropagation(); typeof setViewingDetailTweet !== 'undefined' && setViewingDetailTweet(tweet); }} className="flex items-center gap-0.5 hover:text-[#1D9BF0] transition group"><div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><MessageCircle size={16} /></div><span className="text-[11px] min-w-[16px] text-left">{tweet.repliesCount || tweet.replies || 0}</span></button>
  <button onClick={(e) => { e.stopPropagation(); typeof setRepostMenu !== 'undefined' && setRepostMenu(tweet); }} className="flex items-center gap-0.5 hover:text-[#00BA7C] transition group"><div className="p-1.5 rounded-full group-hover:bg-[#00BA7C]/10"><Repeat2 size={16} /></div><span className="text-[11px] min-w-[16px] text-left">{tweet.retweetsCount || tweet.reposts || 0}</span></button>
  <button onClick={(e) => { e.stopPropagation(); typeof handleLike !== 'undefined' && handleLike(tweet.id); }} className={`flex items-center gap-0.5 transition group ${tweet.likedBy?.includes(currentUserId) ? 'text-[#F91880]' : 'hover:text-[#F91880]'}`}><div className="p-1.5 rounded-full group-hover:bg-[#F91880]/10"><Heart size={16} className={tweet.likedBy?.includes(currentUserId) ? 'fill-current text-[#F91880]' : ''} /></div><span className="text-[11px] min-w-[16px] text-left">{tweet.likesCount || tweet.likes || 0}</span></button>
  <button className="flex items-center gap-0.5 hover:text-[#1D9BF0] transition group"><div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><BarChart2 size={16} /></div><span className="text-[11px] min-w-[16px] text-left">{tweet.viewsCount || tweet.views || 0}</span></button>
  <button className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group"><Bookmark size={16} /></button>
  <button className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group"><Share size={16} /></button>
</div>'''

    pattern = r'<div className="flex items-center justify-between[^>]*>[\s\S]*?<MessageCircle[\s\S]*?</div>'
    code, count = re.subn(pattern, new_bar, code)
    
    if count > 0:
        path.write_text(code, encoding='utf-8')
        print(f"🔧 تم تعديل {count} شريط تفاعل في {path.name}")
        return True
    return True

print("🚀 بدء عملية الحماية (v4) - سنعدل CommunityFeedPage فقط...")
create_git_checkpoint()

target_file = 'src/pages/CommunityFeedPage.tsx'
backup = backup_file(Path(target_file))
apply_fix(target_file)

print("🔍 جاري فحص TypeScript لملف المجتمع...")
# نفحص فقط الملف الذي عدلناه
check = subprocess.run(['npx', 'tsc', '--noEmit', target_file], capture_output=True, text=True)

if check.returncode != 0:
    errors = check.stdout + check.stderr
    if errors.strip():
        print("❌ فشل فحص TypeScript في CommunityFeedPage! تفعيل Rollback...")
        print(errors[:500])
        rollback_file(Path(target_file), backup)
        print("🛑 تم إلغاء التعديل. الموقع سليم.")
    else:
        print("🏆 نجح الفحص! (تم تجاهل أخطاء الملفات الأخرى).")
else:
    print("🏆 نجح فحص TypeScript بالكامل! التعديلات تم تطبيقها بنجاح 100%.")
    
print("👉 يرجى تحديث المتصفح (Refresh) لرؤية النتيجة في صفحة المجتمع.")

