import React from "react";
import { Star, Shield } from "lucide-react";

export const YemenRatingLogo: React.FC<{ isDark?: boolean; className?: string }> = ({ className = "" }) => {
  return (
    <div className={"flex items-center gap-2.5 select-none " + className}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#E4EBE4] border border-[#FFC500]/30 shadow-sm">
        <Shield className="w-6 h-6 text-[#FFC500]" fill="#FFC500" fillOpacity={0.15} strokeWidth={2.2} />
        <Star className="w-3 h-3 text-[#FFC500] absolute" fill="#FFC500" />
      </div>
      <div className="flex flex-col text-right leading-none">
        <span className="font-["'Cairo'"] font-black text-base tracking-tight text-[#FFC500]">
          يمن ريتنغ
        </span>
        <span className="font-inter font-bold text-[10px] tracking-[0.18em] text-[#001E00] mt-0.5">
          YEMENRATING
        </span>
      </div>
    </div>
  );
};

export const GreenStarRating: React.FC<{ rating: number; maxStars?: number; size?: number }> = ({ 
  rating, 
  maxStars = 5,
  size = 14
}) => {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: maxStars }).map((_, idx) => {
        const isFilled = idx < Math.round(rating);
        return (
          <Star
            key={idx}
            size={size}
            className={isFilled ? "text-[#FFC500]" : "text-[#E4EBE4]"}
            fill={isFilled ? "#FFC500" : "currentColor"}
          />
        );
      })}
    </div>
  );
};
