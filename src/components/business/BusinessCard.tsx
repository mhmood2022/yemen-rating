import React from 'react';
import { BusinessItem } from '../../types/database.types';

interface Props {
  business: BusinessItem;
  rank?: number;
  onOpenProfile: (b: BusinessItem) => void;
  onOpenQuote: (b: BusinessItem) => void;
  onToggleCompare: (id: string) => void;
  isCompared: boolean;
}

export const BusinessCard: React.FC<Props> = ({
  business,
  rank,
  onOpenProfile,
  onOpenQuote,
  onToggleCompare,
  isCompared
}) => {
  const badgeColor = business.badge_type === 'gold' ? '#FFB800' : business.badge_type === 'blue' ? '#29A6FF' : '#8E8E93';

  return (
    <div
      onClick={() => onOpenProfile(business)}
      className="bg-[#14141C] border border-[#22222E] hover:border-amber-400/40 rounded-2xl overflow-hidden transition duration-200 cursor-pointer flex flex-col md:grid md:grid-cols-[240px_1fr] group shadow-lg hover:-translate-y-0.5"
      dir="rtl"
    >
      <div className="relative h-48 md:h-full min-h-[190px] bg-black">
        <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        {rank && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/85 border border-amber-400 text-amber-400 font-black text-xs flex items-center justify-center shadow">
            #{rank}
          </div>
        )}
      </div>

      <div className="p-4 md:p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-black text-white group-hover:text-amber-400 transition flex items-center gap-1.5 line-clamp-1">
              <span>{business.name}</span>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill={badgeColor} d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.02-2.9-1.08-3.99s-2.6-1.54-3.99-1.08C14.32 2.28 13.08 1.4 11.65 1.4s-2.67.88-3.34 2.19c-1.39-.46-2.9-.02-3.99 1.08s-1.54 2.6-1.08 3.99C1.88 9.33 1 10.57 1 12s.88 2.67 2.19 3.34c-.46 1.39-.02 2.9 1.08 3.99s2.6 1.54 3.99 1.08c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.02 3.99-1.08s1.54-2.6 1.08-3.99c1.31-.67 2.19-1.91 2.19-3.34z"/>
                <path fill="#FFFFFF" d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4-6.7 6.7z"/>
              </svg>
            </h3>
            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-black px-2 py-0.5 rounded-md flex-shrink-0">
              YR {business.yr_score}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <i className="fa-solid fa-star text-[10px]"></i>
              <span>{business.rating}</span>
            </span>
            <span className="text-neutral-400">({business.reviews_count} تقييم)</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400">{business.categoryName}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-amber-400 font-bold">{business.price_range}</span>
          </div>

          <div className="text-xs text-neutral-400 mb-2.5 flex items-center gap-1.5">
            <i className="fa-solid fa-location-dot text-amber-400 text-xs"></i>
            <span>{business.city} - {business.district}</span>
          </div>

          {business.quote_text && (
            <p className="text-xs text-neutral-400 leading-relaxed border-r-2 border-amber-400 pr-2.5 mb-3 italic line-clamp-2">
              "{business.quote_text}"
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#22222E] flex flex-wrap items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <a href={`tel:${business.phone}`} className="px-3 py-1.5 rounded-lg bg-[#1A1A24] border border-[#22222E] hover:border-amber-400 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition">
              <i className="fa-solid fa-phone text-amber-400 text-xs"></i>
              <span>اتصال</span>
            </a>
            <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-[#1A1A24] border border-[#22222E] hover:border-emerald-500 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition">
              <i className="fa-brands fa-whatsapp text-xs"></i>
              <span>واتساب</span>
            </a>
            <button
              onClick={() => onToggleCompare(business.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition ${isCompared ? 'bg-amber-400 text-black border-amber-400 font-black' : 'bg-[#1A1A24] border-[#22222E] text-neutral-200 hover:border-amber-400'}`}
            >
              <i className="fa-solid fa-scale-balanced text-xs"></i>
              <span>{isCompared ? 'مقارن' : 'مقارنة'}</span>
            </button>
          </div>

          <button
            onClick={() => onOpenQuote(business)}
            className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-black font-black text-xs flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <span>طلب عرض سعر</span>
            <i className="fa-solid fa-file-invoice-dollar text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
