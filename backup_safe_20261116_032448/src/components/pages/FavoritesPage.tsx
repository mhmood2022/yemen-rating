import React from 'react';
import { Heart, ArrowRight, Star, MapPin, Phone } from 'lucide-react';
import { SAMPLE_BUSINESSES } from '../../data/mockData';
import { VerifiedBadge } from '../common/VerifiedBadge';

export const FavoritesPage: React.FC<{ onBack: () => void; onSelectBusiness: (b: any) => void }> = ({ onBack, onSelectBusiness }) => {
  const favorites = SAMPLE_BUSINESSES.slice(0, 2);

  return (
    <div dir="rtl" className="space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 fill-zinc-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">المحفوظات والمفضلة</h1>
            <p className="text-xs text-zinc-400">الأنشطة والمنشآت التي قمت بحفظها للرجوع إليها سريعاً</p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
        >
          <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />
          <span>رجوع</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favorites.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectBusiness(item)}
            className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 rounded-2xl p-4 flex gap-4 transition-all cursor-pointer group shadow-md"
          >
            <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
              <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-yellow-400 truncate">{item.name}</h3>
                  {item.isVerified && <VerifiedBadge type={item.badgeType} size="sm" />}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{item.address}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {item.rating}
                </span>
                <span className="text-yellow-400 font-semibold text-[11px]">عرض المنشأة ←</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
