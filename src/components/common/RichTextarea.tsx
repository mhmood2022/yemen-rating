import React, { useRef, useEffect } from 'react';
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
        {value ? '\n' : ''} 
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
          color: 'transparent', textShadow: '0 0 0 #FFFFFF',
          caretColor: '#FFC500', outline: 'none', // لون المؤشر (أصفر)
          
        }}
        {...props}
      />
    </div>
  );
};
