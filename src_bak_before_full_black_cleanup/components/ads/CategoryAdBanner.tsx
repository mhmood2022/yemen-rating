import React from 'react';

interface Props {
  categoryTitle: string;
  categorySlug: string;
}

export const CategoryAdBanner: React.FC<Props> = ({ categoryTitle }) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#22222E] bg-gradient-to-l from-[#181822] via-[#14141C] to-[#0A0A0D] p-5 md:p-6 mb-8 text-white font-sans" dir="rtl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
            <i className="fa-solid fa-rectangle-ad text-[10px]"></i>
            <span>مساحة إعلانية مميزة • {categoryTitle}</span>
          </div>
          <h2 className="text-base md:text-lg font-black text-white">
            هل تمتلك نشاطاً في قطاع {categoryTitle}؟ أعلن هنا وتصدّر النتائج
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            احصل على آلاف المشاهدات والعملاء المؤكدين يومياً عبر منصة يمن ريتغ الرائدة.
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/admin.html'}
          className="bg-[#FFB800] hover:bg-[#E5A600] text-black font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/10 transition active:scale-95 whitespace-nowrap"
        >
          <i className="fa-solid fa-bullhorn text-xs"></i>
          <span>احجز هذه المساحة الآن</span>
        </button>
      </div>

      <div className="absolute top-0 left-0 w-64 h-full bg-amber-400/5 blur-3xl pointer-events-none" />
    </div>
  );
};
