import os, re, shutil, time

# 1. إنشاء مكون RichTextarea
os.makedirs('src/components/common', exist_ok=True)
component_code = """import React, { useRef, useEffect } from 'react';
import { HashtagText } from './HashtagText';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const RichTextarea = ({ value, onChange, className = '', placeholder, style, ...props }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleScroll = () => {
    if (textareaRef.current && bgRef.current) {
      bgRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="relative w-full" dir="rtl">
      {/* طبقة الخلفية لعرض النص الملوّن */}
      <div
        ref={bgRef}
        className={`absolute inset-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden ${className}`}
        aria-hidden="true"
        style={{ ...style, color: '#FFFFFF' }}
      >
        {value ? (
          <HashtagText text={value as string} />
        ) : (
          <span className="text-[#71767B] opacity-50">{placeholder}</span>
        )}
        <br />
      </div>

      {/* مربع الإدخال الشفاف الفعلي مع مؤشر أصفر */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        placeholder=""
        className={`relative w-full bg-transparent resize-none outline-none overflow-hidden ${className}`}
        style={{
          ...style,
          color: 'transparent',
          caretColor: '#FFC500', // المؤشر النابض أصفر
          WebkitTextFillColor: 'transparent',
        }}
        {...props}
      />
    </div>
  );
};
"""
with open('src/components/common/RichTextarea.tsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_richtext_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # استبدال <textarea بـ <RichTextarea
    content = content.replace('<textarea', '<RichTextarea')
    # استبدال </textarea> بـ />
    content = content.replace('</textarea>', '/>')
    # إصلاح أي >/> 
    content = content.replace('>/>', '/>')

    # إضافة الاستيراد
    if "import { RichTextarea }" not in content:
        content = content.replace("import { HashtagText }", "import { RichTextarea } from '../components/common/RichTextarea';\nimport { HashtagText }", 1)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم تركيب RichTextarea بنجاح (مؤشر أصفر + هاشتاج ملون).")
