import React from "react";
import { Star, MapPin, Eye, ArrowUpLeft } from "lucide-react";
import { BaseCardData } from "../../../data/homeTemplateMockData";

interface VerticalContentCardProps {
  item: BaseCardData;
  onCardClick?: (item: BaseCardData) => void;
}

export const VerticalContentCard: React.FC<VerticalContentCardProps> = ({ item, onCardClick }) => {
  const badgeStyle = {
    gold: "bg-amber-500/90 text-slate-950 font-bold border-amber-300/40 shadow-sm shadow-amber-500/20",
    emerald: "bg-emerald-600/90 text-white font-medium border-emerald-400/30",
    blue: "bg-sky-600/90 text-white font-medium border-sky-400/30",
    rose: "bg-rose-600/90 text-white font-bold border-rose-400/30 animate-pulse",
  }[item.badgeColor || "gold"];

  const handleClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick(item);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400/50 dark:hover:border-amber-400/40 transition-all duration-300 cursor-pointer"
    >
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />
        {item.badge && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full backdrop-blur-md border ${badgeStyle}`}>
              {item.badge}
            </span>
          </div>
        )}
        {item.category && (
          <div className="absolute bottom-2.5 right-3 z-10">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-200 backdrop-blur-sm border border-slate-700/50">
              {item.category}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3.5 sm:p-4 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-2 text-slate-500 dark:text-slate-400">
            {typeof item.rating === "number" ? (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.rating.toFixed(1)}
                </span>
                {item.reviewsCount && (
                  <span className="text-[11px] text-slate-400">
                    ({item.reviewsCount})
                  </span>
                )}
              </div>
            ) : (
              <span />
            )}
            {typeof item.viewsCount === "number" && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.viewsCount.toLocaleString()}</span>
              </div>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
            {item.title}
          </h3>

          {item.subtitle && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {item.subtitle}
            </p>
          )}

          {item.metaInfo && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {item.metaInfo.label}:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.metaInfo.value}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 mt-auto">
          {item.location && (
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[55%]">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mr-auto">
            {item.price && (
              <span className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400">
                {item.price}
              </span>
            )}
            <span className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors">
              <ArrowUpLeft className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
