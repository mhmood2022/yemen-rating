import shutil, time

# 1. إعادة كتابة المكون بشكل نظيف تماماً
comp_file = 'src/components/common/RichTextarea.tsx'
shutil.copy(comp_file, f"{comp_file}.bak_perfect_{int(time.time())}")

code = """import React, { useRef, useEffect } from 'react';
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

  // تنسيق موحد للطبقة الخلفية ومربع الإدخال لضمان تطابقهما
  const sharedStyle: React.CSSProperties = {
    padding: '4px 0',
    margin: '0',
    fontSize: '17px',
    lineHeight: '26px',
    fontFamily: 'inherit',
    wordBreak: 'break-word',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div className={`relative w-full ${className}`} dir="rtl">
      {/* طبقة الخلفية التي تعرض النص الملوّن (الهاشتاج أصفر) */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none whitespace-pre-wrap"
        aria-hidden="true"
        style={{ ...sharedStyle, color: '#FFFFFF' }}
      >
        {value ? (
          <HashtagText text={value as string} />
        ) : (
          <span className="text-[#71767B] opacity-70">{placeholder}</span>
        )}
        {/* مسافة إضافية لضمان عدم تداخل النص مع المؤشر */}
        {value ? '\\n' : ''} 
      </div>

      {/* مربع الإدخال الشفاف مع المؤشر الأصفر */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        placeholder=""
        className="relative w-full bg-transparent resize-none outline-none block"
        style={{
          ...sharedStyle,
          color: 'transparent',
          caretColor: '#FFC500', // لون المؤشر (أصفر)
          WebkitTextFillColor: 'transparent',
        }}
        {...props}
      />
    </div>
  );
};
"""
with open(comp_file, 'w', encoding='utf-8') as f:
    f.write(code)
print("✅ 1. تم إعادة كتابة مكون RichTextarea بالكامل.")

# 2. إجبار لون المؤشر الأصفر في ملفات CSS
css_files = ['src/index.css', 'src/styles/globals.css']
for file in css_files:
    shutil.copy(file, f"{file}.bak_css2_{int(time.time())}")
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("caret-color: #FFFFFF !important;", "caret-color: #FFC500 !important;")
    content = content.replace("caret-color: #FFFFFF;", "caret-color: #FFC500;")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("✅ 2. تم التأكيد على لون المؤشر الأصفر في CSS.")

# 3. تنظيف استدعاءات المكون في صفحة المجتمع (إزالة أي ارتفاع إجباري)
file_comm = 'src/pages/CommunityFeedPage.tsx'
shutil.copy(file_comm, f"{file_comm}.bak_clean_{int(time.time())}")
with open(file_comm, 'r', encoding='utf-8') as f:
    content = f.read()

# استبدال أي استدعاء لمربع الاقتباس بشيء نظيف
import re
pattern_quote = r'<RichTextarea\s*value=\{quoteText\}[\s\S]*?/>'
clean_quote = """<RichTextarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="أضف تعليقك..."
          />"""
content = re.sub(pattern_quote, clean_quote, content)

with open(file_comm, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ 3. تم تنظيف مربع الاقتباس في المجتمع.")

# 4. تنظيف مربع صفحة الحساب (إزالة ارتفاع 120 بكسل ليتمدد تلقائياً)
file_acc = 'src/pages/AccountPage.tsx'
shutil.copy(file_acc, f"{file_acc}.bak_clean_{int(time.time())}")
with open(file_acc, 'r', encoding='utf-8') as f:
    content = f.read()

pattern_acc = r'<RichTextarea\s*autoFocus[\s\S]*?/>'
clean_acc = """<RichTextarea
                    autoFocus
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="ماذا يحدث؟"
                  />"""
content = re.sub(pattern_acc, clean_acc, content)

with open(file_acc, 'w', encoding='utf-8') as f:
    f.write(content)
print("✅ 4. تم تنظيف مربع صفحة الحساب.")
