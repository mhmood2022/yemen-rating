import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { AdItem } from '../../data/mockData';

interface AdBannerProps {
  ad: AdItem;
  type?: 'hero' | 'in-feed' | 'sidebar';
}

export const AdBanner: React.FC<AdBannerProps> = ({ ad, type = 'in-feed' }) => {
  if (type === 'hero') {
    return (
      <div dir="rtl" className="relative w-full rounded-2xl overflow-hidden border border-amber-400/30 bg-zinc-900 shadow-xl group">
        <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          
          <div className="absolute top-3 right-3 bg-amber-400 text-zinc-950 text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" />
            <span>{ad.badgeText}</span>
          </div>

          <div className="absolute bottom-4 right-4 left-4 max-w-2xl space-y-2">
            <h3 className="text-base sm:text-xl font-bold text-white drop-shadow-md">{ad.title}</h3>
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2">{ad.description}</p>
            <a
              href={ad.targetUrl}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-lg transition-colors mt-2"
            >
              <span>{ad.linkText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-amber-400/40 transition-colors">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-zinc-800 text-amber-400 px-1.5 py-0.5 rounded border border-zinc-700 font-semibold">{ad.badgeText}</span>
            <h4 className="text-xs sm:text-sm font-bold text-white">{ad.title}</h4>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-1">{ad.description}</p>
        </div>
      </div>

      <a
        href={ad.targetUrl}
        className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
      >
        <span>{ad.linkText}</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
