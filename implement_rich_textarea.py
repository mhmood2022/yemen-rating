import re, shutil, time, os

# 1. إنشاء مكون RichTextarea
os.makedirs('src/components/common', exist_ok=True)
component_code = """import React, { useRef, useEffect } from 'react';
import { HashtagText } from './HashtagText';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextarea = ({ value, onChange, placeholder, className = '' }: Props) => {
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
    <div className={`relative w-full ${className}`} dir="rtl">
      {/* الخلفية التي تعرض النص الملوّن */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-white overflow-hidden"
        aria-hidden="true"
      >
        {value ? <HashtagText text={value} /> : <span className="text-[#71767B] opacity-50">{placeholder}</span>}
        <br />
      </div>

      {/* صندوق الإدخال الشفاف الفعلي */}
      <textarea
        ref={textareaRef}
        className="relative w-full bg-transparent resize-none outline-none overflow-hidden"
        style={{
          color: 'transparent',
          caretColor: '#FFC500',
          WebkitTextFillColor: 'transparent',
          minHeight: '100px',
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder=""
      />
    </div>
  );
};
"""
with open('src/components/common/RichTextarea.tsx', 'w', encoding='utf-8') as f:
    f.write(component_code)

files = ['src/pages/AccountPage.tsx', 'src/pages/CommunityFeedPage.tsx']

for file in files:
    shutil.copy(file, f"{file}.bak_rich_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # استيراد المكون الجديد
    if 'RichTextarea' not in content:
        content = content.replace("import { HashtagText }", "import { RichTextarea } from '../components/common/RichTextarea';\nimport { HashtagText }", 1)

    # استبدال مربعات الكتابة
    # 1. مربع كتابة التغريدة الجديدة
    content = re.sub(r'<textarea[^>]*value=\{newPostText\}[^>]*>(\s*<\/textarea>)?', 
        '<RichTextarea className="text-[17px] leading-[26px]" value={newPostText} onChange={setNewPostText} placeholder="ماذا يجري؟" />', content)

    # 2. مربع تعديل التغريدة
    content = re.sub(r'<textarea[^>]*value=\{editPostText\}[^>]*>(\s*<\/textarea>)?', 
        '<RichTextarea className="text-[17px] leading-[26px]" value={editPostText} onChange={setEditPostText} placeholder="تعديل التغريدة..." />', content)

    # 3. مربع تعديل التغريدة (القديم)
    content = re.sub(r'<textarea[^>]*value=\{editText\}[^>]*>(\s*<\/textarea>)?', 
        '<RichTextarea className="text-[17px] leading-[26px]" value={editText} onChange={setEditText} placeholder="تعديل التغريدة..." />', content)

    # إزالة صندوق المعاينة المكرر الذي أضفناه سابقاً
    content = re.sub(r"\{newPostText && \(\s*<div className=\"p-3 mt-2.*?\)\}", "", content, flags=re.DOTALL)
    content = re.sub(r"\{editPostText && \(\s*<div className=\"p-3 mt-2.*?\)\}", "", content, flags=re.DOTALL)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("✅ تم تفعيل الهاشتاج الملوّن داخل نافذة الكتابة والتعديل.")
