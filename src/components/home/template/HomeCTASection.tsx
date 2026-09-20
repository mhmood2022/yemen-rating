import React from "react";
import { Building2, PlusCircle, CheckCircle2 } from "lucide-react";

interface HomeCTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onAddBusinessClick?: () => void;
}

export const HomeCTASection: React.FC<HomeCTASectionProps> = ({
  title = "هل أنت صاحب منشأة أو نشاط تجاري؟",
  description = "انضم إلى مجتمع يمن ريتنج، أضف منشأتك الآن مجاناً، وعزز وصولك لآلاف العملاء في جميع محافظات اليمن.",
  buttonText = "أضف منشأتك الآن",
  onAddBusinessClick,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/70 p-6 sm:p-8 md:p-10 shadow-xl my-8">
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
        <div className="max-w-xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>بوابة أصحاب الأعمال</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              ظهور في الدليل الموحد
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              استقبال تقييمات وآراء العملاء
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              إدارة العروض والخدمات
            </span>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onAddBusinessClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-400/20 hover:shadow-amber-400/30 transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5 text-slate-950" />
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
