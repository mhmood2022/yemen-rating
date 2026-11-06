import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Maximize2 } from 'lucide-react';

interface ReplyBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  myAvatar: string;
  myName: string;
  isSubmitting?: boolean;
  onImageSelect?: (file: File) => void;
  onOpenFullModal?: () => void;
}

export const ReplyBar: React.FC<ReplyBarProps> = ({
  value,
  onChange,
  onSubmit,
  myAvatar,
  myName,
  isSubmitting = false,
  onImageSelect,
  onOpenFullModal,
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

  const showExpanded = isFocused || value.length > 0;
  const maxLen = 280;

  return (
    <div className="border-t border-[#2F3336]/60 bg-black px-3 py-2 shrink-0 transition-all select-none">
      <form onSubmit={onSubmit} className="w-full">
        {!showExpanded ? (
          /* الحالة 1: الشريط مغلق */
          <div 
            onClick={() => setIsFocused(true)}
            className="flex items-center justify-between w-full h-11 px-3 bg-[#000000] border border-[#2F3336] rounded-full cursor-pointer hover:border-[#536471] transition"
          >
            {/* جهة اليمين */}
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-[#2F3336]">
                {myAvatar ? (
                  <img src={myAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-white flex items-center justify-center h-full">
                    {myName ? myName[0] : '؟'}
                  </span>
                )}
              </div>
              <span className="text-[#71767B] text-[14px]">نشر ردّك</span>
            </div>

            {/* جهة اليسار: أيقونات متساوية ولون رمادي باهت */}
            <div className="flex items-center gap-2 text-[#71767B]" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                onClick={handleImageClick} 
                className="hover:text-white transition p-1.5 rounded-full hover:bg-white/5 flex items-center justify-center"
                title="إضافة صورة"
              >
                <ImageIcon size={19} />
              </button>

              <div 
                className="w-[22px] h-[19px] border border-[#71767B] rounded flex items-center justify-center text-[9px] font-bold text-[#71767B] hover:border-white hover:text-white transition cursor-pointer"
                title="GIF"
              >
                GIF
              </div>

              <button 
                type="button" 
                onClick={onOpenFullModal}
                className="hover:text-white transition p-1.5 rounded-full hover:bg-white/5 flex items-center justify-center"
                title="تكبير"
              >
                <Maximize2 size={17} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        ) : (
          /* الحالة 2: الشريط مفتوح */
          <div className="w-full flex flex-col pt-1">
            <div className="flex items-start gap-2.5 w-full">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-[#2F3336] mt-1">
                {myAvatar ? (
                  <img src={myAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white flex items-center justify-center h-full">
                    {myName ? myName[0] : '؟'}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <textarea
                  autoFocus
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={() => {
                    if (value.length === 0) setIsFocused(false);
                  }}
                  placeholder="نشر ردّك"
                  maxLength={maxLen}
                  rows={2}
                  className="w-full bg-transparent text-[#E7E9EA] text-[15px] placeholder-[#71767B] focus:outline-none focus:ring-0 focus:border-none border-none outline-none caret-[#FFC500] animate-pulse-caret resize-none pt-1.5 leading-snug"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2F3336]/40">
              {/* أيقونات الوسائط بلون رمادي متساوي ومربوط بالاستوديو */}
              <div className="flex items-center gap-2 text-[#71767B]">
                <button 
                  type="button" 
                  onClick={handleImageClick} 
                  className="hover:text-white transition p-1.5 rounded-full hover:bg-white/5"
                  title="إضافة صورة"
                >
                  <ImageIcon size={19} />
                </button>
                <div 
                  className="w-[22px] h-[19px] border border-[#71767B] rounded flex items-center justify-center text-[9px] font-bold text-[#71767B] hover:border-white hover:text-white transition cursor-pointer"
                  title="GIF"
                >
                  GIF
                </div>
                <button 
                  type="button" 
                  onClick={onOpenFullModal}
                  className="hover:text-white transition p-1.5 rounded-full hover:bg-white/5"
                  title="تكبير"
                >
                  <Maximize2 size={17} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* زر الرد الأصفر الأصلي */}
              <button
                type="submit"
                disabled={!value.trim() || value.length > maxLen || isSubmitting}
                className="px-5 py-1.5 bg-[#FFC500] text-black font-black text-[13px] rounded-full hover:bg-[#E5B200] transition disabled:opacity-40 shrink-0 shadow-md"
              >
                {isSubmitting ? '...' : 'الردّ'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
