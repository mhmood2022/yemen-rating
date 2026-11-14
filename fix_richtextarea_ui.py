import shutil, time

file = 'src/components/common/RichTextarea.tsx'
shutil.copy(file, f"{file}.bak_{int(time.time())}")

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
    padding: '12px',
    fontSize: '17px',
    lineHeight: '26px',
    fontFamily: 'inherit',
    minHeight: '120px',
    wordBreak: 'break-word',
    ...style,
  };

  return (
    <div className="relative w-full" dir="rtl">
      {/* طبقة الخلفية لعرض النص الملوّن */}
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

      {/* مربع الإدخال الشفاف الفعلي مع مؤشر أصفر */}
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
          caretColor: '#FFC500', // لون المؤشر الأصفر
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

print("✅ تم إصلاح المكون: المؤشر أصبح أصفر، وتم ضبط المسافات ليظهر في مكانه الصحيح.")
