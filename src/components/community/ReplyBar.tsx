import React, { useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ReplyBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  myAvatar: string;
  myName: string;
  isSubmitting?: boolean;
  onImageSelect?: (file: File) => void;
}

export const ReplyBar: React.FC<ReplyBarProps> = ({
  value,
  onChange,
  onSubmit,
  myAvatar,
  myName,
  isSubmitting = false,
  onImageSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  // إظهار التصميم الكبير إذا كان الحقل في حالة تركيز أو يحتوي على نص
  const showExpanded = isFocused || value.length > 0;

  return (
    <div className="p-3 border-t border-[#2F3336] bg-black shrink-0">
      <form onSubmit={onSubmit} className="flex items-start gap-2">
        {/* صورة المستخدم (الأفاتار) */}
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-[#2F3336] overflow-hidden shrink-0 flex items-center justify-center mt-1">
          {myAvatar ? (
            <img src={myAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold">{myName ? myName[0] : '؟'}</span>
          )}
        </div>

        {/* حقل الإدخال (بدون حدود صفراء) */}
        <div className={`flex-1 bg-[#111111] rounded-2xl p-2.5 transition-all ${showExpanded ? 'border border-[#2F3336]' : 'border border-transparent'}`}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="انشر ردّك..."
            maxLength={280}
            rows={showExpanded ? 3 : 1}
            className="w-full bg-transparent text-white text-sm placeholder-[#71767B] focus:outline-none resize-none"
            style={{ minHeight: showExpanded ? '60px' : '24px' }}
          />
          
          {/* الأيقونات السفلية (تظهر عند التركيز أو الكتابة) */}
          {showExpanded && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2F3336]/50">
              <div className="flex items-center gap-3 text-[#FFC500]">
                <button 
                  type="button" 
                  onClick={handleImageClick}
                  className="hover:bg-[#FFC500]/10 p-1.5 rounded-full transition" 
                  title="إضافة صورة"
                >
                  <ImageIcon size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <span className={`text-[10px] font-mono ${value.length > 280 ? 'text-rose-500' : value.length > 260 ? 'text-amber-400' : 'text-[#71767B]'}`}>
                {280 - value.length}
              </span>
            </div>
          )}
        </div>

        {/* زر الرد */}
        <button
          type="submit"
          disabled={!value.trim() || value.length > 280 || isSubmitting}
          className="px-4 py-2 bg-[#FFC500] text-black font-bold text-xs rounded-full hover:bg-[#E5B200] transition disabled:opacity-40 shrink-0 mt-1"
        >
          {isSubmitting ? '...' : 'ردّ'}
        </button>
      </form>
    </div>
  );
};
