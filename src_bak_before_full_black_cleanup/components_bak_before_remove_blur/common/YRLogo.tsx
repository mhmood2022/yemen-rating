import React from 'react';

export const YRLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const iconHeight = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : 'h-8 sm:h-9';

  return (
    <div dir="rtl" className={`flex items-center gap-2 select-none ${className}`}>
      
      {/* 1. درع النجمة الذهبية وشريط الانحناء في المقدمة (يمين) */}
      <svg 
        viewBox="0 0 120 120" 
        className={`${iconHeight} w-auto shrink-0 drop-shadow-md`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* الدرع الخارجي الأبيض */}
        <path 
          d="M60 10L98 26V58C98 82 60 106 60 106C60 106 22 82 22 58V26L60 10Z" 
          fill="#070A10" 
          stroke="#FFFFFF" 
          strokeWidth="4" 
          strokeLinejoin="round" 
        />
        {/* إطار الدرع الداخلي */}
        <path 
          d="M60 18L92 31V57C92 76 60 96 60 96C60 96 28 76 28 57V31L60 18Z" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />
        {/* النجمة الذهبية الخماسية */}
        <path 
          d="M60 32L65.5 46H81L68.5 55.5L73.5 70L60 61L46.5 70L51.5 55.5L39 46H54.5L60 32Z" 
          fill="#FFC500" 
          stroke="#FFC500" 
          strokeWidth="1.5" 
          strokeLinejoin="round" 
        />
        {/* شريط الانحناء الذهبي المحيط بأسفل الدرع */}
        <path 
          d="M10 65C10 88 36 108 60 110C84 108 110 88 110 64C104 80 82 98 60 100C38 98 16 80 10 65Z" 
          fill="#FFC500" 
        />
      </svg>

      {/* 2. النصوص الرسمية: يمن ريتغ (ذهبي) + YEMENRATING (أبيض) */}
      <div className="flex flex-col items-start justify-center leading-none text-right">
        <span className="text-[#FFC500] font-black text-sm sm:text-base tracking-wide font-['Cairo']">
          يمن ريتغ
        </span>
        <span className="text-white font-black text-[9px] sm:text-[10px] tracking-widest font-sans uppercase mt-0.5">
          YEMENRATING
        </span>
      </div>

    </div>
  );
};
