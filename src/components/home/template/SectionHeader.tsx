import React from "react";
import { ChevronLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  countBadge?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  countBadge,
  actionText = "عرض الكل",
  actionHref,
  onActionClick,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-6 bg-amber-400 rounded-full inline-block shadow-sm shadow-amber-400/30" />
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {countBadge && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold border border-amber-200/60 dark:border-amber-800/50">
            {countBadge}
          </span>
        )}
      </div>
      {actionHref ? (
        <a
          href={actionHref}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60"
        >
          <span>{actionText}</span>
          <ChevronLeft className="w-4 h-4" />
        </a>
      ) : onActionClick ? (
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60"
        >
          <span>{actionText}</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
};
