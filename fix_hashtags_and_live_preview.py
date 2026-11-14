import re, shutil, time, os

# 1. إنشاء مكون HashtagText المشترك
os.makedirs('src/components/common', exist_ok=True)
hashtag_component = """import React from 'react';
import { Link } from 'react-router-dom';

export const HashtagText = ({ text, className = "" }: { text: string, className?: string }) => {
  if (!text) return null;
  const parts = text.split(/(#[^\\s#]+)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <Link key={i} to={`/search?q=${encodeURIComponent(part)}`} className="text-[#FFC500] hover:underline" onClick={(e) => e.stopPropagation()}>
            {part}
          </Link>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};
"""
with open('src/components/common/HashtagText.tsx', 'w', encoding='utf-8') as f:
    f.write(hashtag_component)

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_finalhashtag_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 2. حذف دالة الهاشتاج التالفة السابقة
    content = re.sub(r"const renderHashtags = \(text: string\) => \{[\s\S]*?\n  \};\n", "", content)

    # 3. إضافة استيراد المكون الجديد
    if 'import { HashtagText }' not in content:
        content = content.replace("import React", "import { HashtagText } from '../components/common/HashtagText';\nimport React", 1)

    # 4. استبدال عرض النصوص العادية بالمكون الجديد في كل الأماكن
    content = content.replace("{post.text}", "<HashtagText text={post.text} />")
    content = content.replace("{post.original.text}", "<HashtagText text={post.original.text} />")
    content = content.replace("{post.quote_text}", "<HashtagText text={post.quote_text} />")
    content = content.replace("{quoteOriginal.text}", "<HashtagText text={quoteOriginal.text} />")
    content = content.replace("{c.text}", "<HashtagText text={c.text} />")
    content = content.replace("{reply.text}", "<HashtagText text={reply.text} />")
    
    content = content.replace("{tweet.text}", "<HashtagText text={tweet.text} />")
    content = content.replace("{tweet.original.text}", "<HashtagText text={tweet.original.text} />")
    content = content.replace("{tweet.quote_text}", "<HashtagText text={tweet.quote_text} />")

    # 5. إضافة معاينة حية (Live Preview) تحت مربع كتابة التغريدة
    if file.endswith('CommunityFeedPage.tsx') and 'HashtagText text={newPostText}' not in content:
        # نبحث عن نهاية حقل النص (textarea)
        textarea_end_pattern = r"(</textarea>)"
        preview_ui = """</textarea>
        {newPostText && (
          <div className="p-3 mt-2 rounded-xl bg-white/5 border border-white/10 text-[15px] text-white break-words whitespace-pre-wrap">
            <HashtagText text={newPostText} />
          </div>
        )}"""
        content = re.sub(textarea_end_pattern, preview_ui, content, count=1)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم إصلاح الهاشتاج في كل الأماكن، وإضافة معاينة حية أثناء الكتابة.")
