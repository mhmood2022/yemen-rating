import re, shutil, time

# ---------------------------------------------------------
# 1. تنظيف صفحة الحساب (AccountPage.tsx)
# ---------------------------------------------------------
file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_clean_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# حذف الـ div القديم الذي يسبب تداخل المؤشر
old_overlay_pattern = r'<div\s*aria-hidden="true"[\s\S]*?</div>\s*(?=<RichTextarea)'
content = re.sub(old_overlay_pattern, '', content)

# تنظيف خصائص RichTextarea (إزالة onInput والكلاسات القديمة)
old_richtext_pattern = r'<RichTextarea[\s\S]*?/>'
new_richtext = '''<RichTextarea
                    autoFocus
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="ماذا يحدث؟"
                    style={{ minHeight: '120px' }}
                  />'''
content = re.sub(old_richtext_pattern, new_richtext, content, count=1)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم تنظيف صفحة الحساب وإزالة التداخل.")


# ---------------------------------------------------------
# 2. تنظيف صفحة المجتمع (CommunityFeedPage.tsx)
# ---------------------------------------------------------
file = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file, f"{file}.bak_clean_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# تنظيف أي خصائص قديمة لمربع الكتابة في المجتمع
old_comm_pattern = r'<RichTextarea[\s\S]*?/>'
new_comm_richtext = '''<RichTextarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="أضف تعليقك..."
            style={{ minHeight: '100px' }}
          />'''
content = re.sub(old_comm_pattern, new_comm_richtext, content, count=1)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ تم تنظيف صفحة المجتمع.")


# ---------------------------------------------------------
# 3. إعادة كتابة المكون (RichTextarea.tsx) ليكون مثالياً
# ---------------------------------------------------------
file = 'src/components/common/RichTextarea.tsx'
code = """import React, { useRef, useEffect } from 'react';
import { HashtagText } from './HashtagText';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const RichTextarea = ({ value, onChange, className = '', placeholder, style, ...props }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(120, textareaRef.current.scrollHeight) + 'px';
    }
  }, [value]);

  const handleScroll = () => {
    if (textareaRef.current && bgRef.current) {
      bgRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const sharedStyle: React.CSSProperties = {
    padding: '0',
    fontSize: '17px',
    lineHeight: '26px',
    fontFamily: 'inherit',
    wordBreak: 'break-word',
    ...style,
  };

  return (
    <div className="relative w-full" dir="rtl">
      {/* طبقة الخلفية التي تعرض النص الملوّن (الهاشتاج أصفر) */}
      <div
        ref={bgRef}
        className={`absolute inset-0 pointer-events-none whitespace-pre-wrap overflow-hidden ${className}`}
        aria-hidden="true"
        style={{ ...sharedStyle, color: '#FFFFFF' }}
      >
        {value ? (
          <HashtagText text={value as string} />
        ) : (
          <span className="text-[#71767B] opacity-50">{placeholder}</span>
        )}
        <br />
      </div>

      {/* مربع الإدخال الشفاف مع المؤشر الأصفر */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        placeholder=""
        className={`relative w-full bg-transparent resize-none outline-none overflow-hidden ${className}`}
        style={{
          ...sharedStyle,
          color: 'transparent',
          caretColor: '#FFC500', /* المؤشر النابض أصفر */
          WebkitTextFillColor: 'transparent',
        }}
        {...props}
      />
    </div>
  );
};
"""
with open(file, 'w', encoding='utf-8') as f:
    f.write(code)
print("✅ تم إعادة كتابة مكون RichTextarea بشكل مثالي.")
