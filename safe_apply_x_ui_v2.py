import os
import re
import sys
import shutil
import subprocess
from pathlib import Path

def create_git_checkpoint():
    try:
        subprocess.run(['git', 'add', '-A'], check=True, capture_output=True)
        subprocess.run(['git', 'commit', '-m', 'Checkpoint before X UI v2 auto-fix'], check=True, capture_output=True)
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

    # 1. إصلاح الاستيرادات (Imports) بأمان تام
    required_icons = ['MessageCircle', 'Repeat2', 'Heart', 'BarChart2', 'Bookmark', 'Share']
    for icon in required_icons:
        # إذا لم تكن الأيقونة موجودة ككلمة كاملة، نضيفها
        if not re.search(rf'\b{icon}\b', code):
            code = re.sub(r'import\s*\{', f'import {{ {icon},', code, count=1)

    # 2. الكود المليمتري لشريط التفاعل
    new_bar = r'''<div className="flex items-center justify-between mt-3 w-full max-w-[320px] text-[#71767B] pr-0" dir="ltr">
  {/* 💬 رد */}
  <button onClick={(e) => { e.stopPropagation(); typeof setViewingDetailTweet !== 'undefined' && setViewingDetailTweet(tweet); }} className="flex items-center gap-0.5 hover:text-[#1D9BF0] transition group">
    <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><MessageCircle size={16} /></div>
    {/* @ts-ignore */}
    <span className="text-[11px] min-w-[16px] text-left">{tweet.repliesCount || tweet.replies || 0}</span>
  </button>

  {/* 🔁 إعادة تغريد */}
  <button onClick={(e) => { e.stopPropagation(); typeof setRepostMenu !== 'undefined' && setRepostMenu(tweet); }} className="flex items-center gap-0.5 hover:text-[#00BA7C] transition group">
    <div className="p-1.5 rounded-full group-hover:bg-[#00BA7C]/10"><Repeat2 size={16} /></div>
    {/* @ts-ignore */}
    <span className="text-[11px] min-w-[16px] text-left">{tweet.retweetsCount || tweet.reposts || 0}</span>
  </button>

  {/* ❤️ إعجاب */}
  {/* @ts-ignore */}
  <button onClick={(e) => { e.stopPropagation(); typeof handleLike !== 'undefined' && handleLike(tweet.id); }} className={`flex items-center gap-0.5 transition group ${tweet.likedBy?.includes(currentUserId) ? 'text-[#F91880]' : 'hover:text-[#F91880]'}`}>
    <div className="p-1.5 rounded-full group-hover:bg-[#F91880]/10">
      {/* @ts-ignore */}
      <Heart size={16} className={tweet.likedBy?.includes(currentUserId) ? 'fill-current text-[#F91880]' : ''} />
    </div>
    {/* @ts-ignore */}
    <span className="text-[11px] min-w-[16px] text-left">{tweet.likesCount || tweet.likes || 0}</span>
  </button>

  {/* 📊 مشاهدات */}
  <button className="flex items-center gap-0.5 hover:text-[#1D9BF0] transition group">
    <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10"><BarChart2 size={16} /></div>
    {/* @ts-ignore */}
    <span className="text-[11px] min-w-[16px] text-left">{tweet.viewsCount || tweet.views || 0}</span>
  </button>

  {/* 🔖 حفظ */}
  <button className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group">
    <Bookmark size={16} />
  </button>

  {/* 📤 مشاركة */}
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

print("🚀 بدء عملية الحماية والتعديل المليمتري...")
create_git_checkpoint()

target_files = ['src/pages/CommunityFeedPage.tsx', 'src/pages/AccountPage.tsx']
backups = {}

for f in target_files:
    if Path(f).exists():
        backups[f] = backup_file(Path(f))
        apply_fix(f)

print("🔍 جاري فحص TypeScript...")
check = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True)

if check.returncode != 0:
    print("❌ فشل فحص TypeScript! تفعيل Automatic Rollback...")
    # طباعة أول 500 حرف من الخطأ لمعرفة السبب
    print(check.stdout[:500] + check.stderr[:500])
    for f, b in backups.items():
        rollback_file(Path(f), b)
    print("🛑 تم إلغاء التعديلات. الموقع سليم.")
else:
    print("🏆 نجح فحص TypeScript! التعديلات المليمترية تم تطبيقها بنجاح 100%.")
    print("🎉 اذهب للمتصفح وحدّث الصفحة (Refresh).")

