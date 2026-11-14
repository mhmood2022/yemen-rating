import shutil, time

# ---------------------------------------------------------
# 1. إصلاح صفحة الحساب (AccountPage.tsx) - استبدال نصي دقيق
# ---------------------------------------------------------
file = 'src/pages/AccountPage.tsx'
shutil.copy(file, f"{file}.bak_exact_{int(time.time())}")
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# البلوك التالف الذي أرسلته لي بالضبط
broken_block = """                  <RichTextarea
                    autoFocus
                    value={newPostText}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    onChange={(e) => {
                      setNewPostText(e.target.value);
                      const t = e.currentTarget;
                      t.style.height = 'auto';
                      t.style.height = Math.max(120, t.scrollHeight) + 'px';
                    }}
                    placeholder="ماذا يحدث؟"
                    className="clean-tweet-textarea relative z-10 w-full bg-transparent text-white text-[17px] leading-[26px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-0 p-0 resize-none overflow-hidden caret-[#FFC500]"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', wordBreak: 'break-word', overflowWrap: 'break-word', minHeight: '120px' }}
                  />"""

clean_block = """                  <RichTextarea
                    autoFocus
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="ماذا يحدث؟"
                  />"""

if broken_block in content:
    content = content.replace(broken_block, clean_block)
    print("✅ تم تنظيف مربع الكتابة في صفحة الحساب بنجاح.")
else:
    print("⚠️ لم يتم العثور على البلوك التالف في صفحة الحساب بدقة.")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

# ---------------------------------------------------------
# 2. إعادة كتابة مكون RichTextarea.tsx لضمان المؤشر الأصفر
# ---------------------------------------------------------
comp_file = 'src/components/common/RichTextarea.tsx'
comp_code = """import React, { useRef, useEffect } from 'react';
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
    minHeight: '120px',
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
          caretColor: '#FFC500', // لون المؤشر النابض (أصفر)
          WebkitTextFillColor: 'transparent',
        }}
        {...props}
      />
    </div>
  );
};
"""
with open(comp_file, 'w', encoding='utf-8') as f:
    f.write(comp_code)
print("✅ تم تحديث مكون RichTextarea لضمان المؤشر الأصفر.")
