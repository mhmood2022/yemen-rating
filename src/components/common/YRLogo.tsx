import React from 'react';

export const YRLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-12' : 'h-9 sm:h-10';

  return (
    <div dir="rtl" className={`flex items-center gap-2 select-none ${className}`}>
      {/* 1. النصوص الرسمية: يمن ريتغ (ذهبي) + YEMENRATING (أبيض) */}
      <div className="flex flex-col items-start justify-center leading-none text-right">
        <span className="text-[#FFC500] font-black text-sm sm:text-base tracking-wide font-['Cairo']">
          يمن ريتغ
        </span>
        <span className="text-white font-black text-[9px] sm:text-[10px] tracking-widest font-sans uppercase mt-0.5">
          YEMENRATING
        </span>
      </div>

      {/* 2. درع النجمة الذهبية الرسمي المطابق للصورة تماماً */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${heightClass} w-auto shrink-0 drop-shadow-md`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* خلفية الدرع السوداء */}
        <path 
          d="M50 12L78 24V50C78 68 50 86 50 86C50 86 22 68 22 50V24L50 12Z" 
          fill="#070A10" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinejoin="round"
        />
        {/* إطار الدرع الداخلي الأبيض */}
        <path 
          d="M50 17L73 27V49C73 64 50 79 50 79C50 79 27 64 27 49V27L50 17Z" 
          stroke="#FFFFFF" 
          strokeWidth="2" 
          strokeLinejoin="round"
        />
        {/* النجمة الذهبية المركزية */}
        <path 
          d="M50 29L54.5 40.5H67L57 48L61 60L50 52.5L39 60L43 48L33 40.5H45.5L50 29Z" 
          fill="#FFC500" 
          stroke="#FFC500" 
          strokeWidth="1" 
          strokeLinejoin="round"
        />
        {/* شريط الانحناء الذهبي المحيط بالدرع */}
        <path 
          d="M14 55C14 74 34 88 50 90C68 88 86 74 88 54C84 66 68 80 50 82C34 80 18 66 14 55Z" 
          fill="#FFC500" 
        />
      </svg>
    </div>
  );
};
