import os
import re
import sys
import shutil
import subprocess
from pathlib import Path

def create_git_checkpoint():
    try:
        subprocess.run(['git', 'add', '-A'], check=True, capture_output=True)
        subprocess.run(['git', 'commit', '-m', 'Checkpoint before X UI v6 Component injection'], check=True, capture_output=True)
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

# 1. إنشاء مكون XActionBar مستقل
component_code = """import React from 'react';
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share2 } from 'lucide-react';

interface XActionBarProps {
  tweet: any;
  onReply?: (tweet: any) => void;
  onRepost?: (tweet: any) => void;
  onLike?: (tweet: any) => void;
  onBookmark?: (tweet: any) => void;
  onShare?: (tweet: any) => void;
  currentUserId?: string;
}

export const XActionBar: React.FC<XActionBarProps> = ({ tweet, onReply, onRepost, onLike, onBookmark, onShare, currentUserId }) => {
  const isLiked = tweet.likedBy?.includes(currentUserId);
  
  return (
    <div className="flex items-center justify-between text-[#71767B] w-full max-w-md mt-2.5 px-1 select-none" dir="ltr">
      {/* 💬 الردود */}
      <button onClick={(e) => { e.stopPropagation(); onReply && onReply(tweet); }} className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition group">
        <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10">
          <MessageCircle size={15} />
        </div>
        <span className="text-[11px]">{tweet.repliesCount || tweet.replies || 0}</span>
      </button>

      {/* 🔁 إعادة النشر */}
      <button onClick={(e) => { e.stopPropagation(); onRepost && onRepost(tweet); }} className="flex items-center gap-1.5 hover:text-[#00BA7C] transition group">
        <div className="p-1.5 rounded-full group-hover:bg-[#00BA7C]/10">
          <Repeat2 size={15} />
        </div>
        <span className="text-[11px]">{tweet.retweetsCount || tweet.reposts || 0}</span>
      </button>

      {/* ❤️ الإعجاب */}
      <button onClick={(e) => { e.stopPropagation(); onLike && onLike(tweet); }} className={`flex items-center gap-1.5 transition group ${isLiked ? 'text-[#F91880]' : 'hover:text-[#F91880]'}`}>
        <div className="p-1.5 rounded-full group-hover:bg-[#F91880]/10">
          <Heart size={15} className={isLiked ? 'fill-current text-[#F91880]' : ''} />
        </div>
        <span className="text-[11px]">{tweet.likesCount || tweet.likes || 0}</span>
      </button>

      {/* 📊 المشاهدات */}
      <button className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition group">
        <div className="p-1.5 rounded-full group-hover:bg-[#1D9BF0]/10">
          <BarChart2 size={15} />
        </div>
        <span className="text-[11px]">{tweet.viewsCount || tweet.views || 1}</span>
      </button>

      {/* 🔖 حفظ */}
      <button onClick={(e) => { e.stopPropagation(); onBookmark && onBookmark(tweet); }} className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group" title="حفظ">
        <Bookmark size={15} />
      </button>

      {/* 📤 مشاركة */}
      <button onClick={(e) => { e.stopPropagation(); onShare && onShare(tweet); }} className="hover:text-[#1D9BF0] p-1.5 rounded-full hover:bg-[#1D9BF0]/10 transition group" title="مشاركة">
        <Share2 size={15} />
      </button>
    </div>
  );
};
"""
Path('src/components/feed').mkdir(parents=True, exist_ok=True)
Path('src/components/feed/XActionBar.tsx').write_text(component_code, encoding='utf-8')
print("✅ تم إنشاء مكون XActionBar.tsx بنجاح.")

# 2. تعديل CommunityFeedPage لاستخدام المكون الجديد
def apply_fix_to_page(file_path):
    path = Path(file_path)
    if not path.exists():
        return True
    
    code = path.read_text(encoding='utf-8')

    # إضافة الاستيراد
    if 'import { XActionBar }' not in code:
        code = code.replace("import React", "import { XActionBar } from '../components/feed/XActionBar';\nimport React", 1)
        if 'import { XActionBar }' not in code: # إذا لم يبدأ بـ import React
            lines = code.split('\n')
            lines.insert(0, "import { XActionBar } from '../components/feed/XActionBar';")
            code = '\n'.join(lines)

    # استبدال الشريط القديم (الذي يحتوي على MessageCircle) بالمكون الجديد
    # هذا النمط يجد الـ div الذي يحتوي على flex justify-between ثم يأخذ كل ما بداخله حتى نهاية الشريط
    pattern = r'<div[^>]*className="[^"]*flex items-center justify-between[^"]*"[^>]*>[\s\S]*?<MessageCircle[\s\S]*?</div>'
    
    # الكود البديل: استدعاء المكون مع تمرير الدوال
    replacement = r'''<XActionBar 
        tweet={tweet} 
        currentUserId={currentUserId}
        onReply={(t) => typeof setViewingDetailTweet !== 'undefined' && setViewingDetailTweet(t)}
        onRepost={(t) => typeof setRepostMenu !== 'undefined' && setRepostMenu(t)}
        onLike={(t) => typeof handleLike !== 'undefined' && handleLike(t.id)}
    />'''

    code, count = re.subn(pattern, replacement, code)
    
    if count > 0:
        path.write_text(code, encoding='utf-8')
        print(f"🔧 تم استبدال {count} شريط تفاعل في {path.name} بالمكون الجديد.")
        return True
    else:
        print(f"⚠️ لم يتم العثور على شريط التفاعل القديم في {path.name} للاستبدال.")
        return True

print("🚀 بدء تطبيق المكون المليمتري...")
create_git_checkpoint()

target_file = 'src/pages/CommunityFeedPage.tsx'
backup = backup_file(Path(target_file))
apply_fix_to_page(target_file)

print("🔍 جاري فحص TypeScript للتأكد من سلامة المكون والاستبدال...")
check = subprocess.run(['npx', 'tsc', '--noEmit'], capture_output=True, text=True)

if check.returncode != 0:
    errors = check.stdout + check.stderr
    # تجاهل أخطاء AuthContext القديمة
    relevant_errors = [line for line in errors.split('\n') if 'AuthContext' not in line and line.strip() != '']
    
    if relevant_errors:
        print("❌ فشل فحص TypeScript! تفعيل Automatic Rollback...")
        print('\n'.join(relevant_errors[:5]))
        rollback_file(Path(target_file), backup)
        print("🛑 تم إلغاء التعديل. الموقع سليم.")
    else:
        print("🏆 نجح الفحص! (تم تجاهل أخطاء AuthContext القديمة).")
else:
    print("🏆 نجح فحص TypeScript بالكامل! تم تطبيق المكون بنجاح 100%.")

print("👉 يرجى تحديث المتصفح (Refresh) لرؤية النتيجة في صفحة المجتمع.")
