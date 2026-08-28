import React from 'react';
import { Star, MapPin, Phone, ArrowRight, Frown } from 'lucide-react';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import { BusinessItem } from '../../data/mockData';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface CategoryListingProps {
  categorySlug: string;
  businesses: BusinessItem[];
  selectedGov: string;
  selectedCity: string;
  onSelectBusiness: (business: BusinessItem) => void;
  onBackHome: () => void;
}

export const CategoryListing: React.FC<CategoryListingProps> = ({
  categorySlug,
  businesses,
  selectedGov,
  selectedCity,
  onSelectBusiness,
  onBackHome
}) => {
  const category = OFFICIAL_CATEGORIES.find(c => c.slug === categorySlug);
  const Icon = category?.icon;

  const filtered = businesses.filter(b => {
    const matchesCategory = b.categorySlug === categorySlug;
    const matchesGov = selectedGov === 'all' || b.governorateId === selectedGov;
    const matchesCity = selectedCity === 'all' || b.cityId === selectedCity;
    return matchesCategory && matchesGov && matchesCity;
  });

  return (
    <div dir="rtl" className="space-y-6">
      
      {/* Category Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/10">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              {category?.name || 'التصنيف'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              دليل الأنشطة والمنشآت المعتمدة مع التقييمات الحقيقية
            </p>
          </div>
        </div>

        <button
          onClick={onBackHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <span>العودة للرئيسية</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Results Count */}
      <div className="text-xs text-zinc-400">
        تم العثور على <strong className="text-amber-400">{filtered.length}</strong> منشأة مطابقة
      </div>

      {/* Listings Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBusiness(item)}
              className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col group cursor-pointer shadow-lg"
            >
              <div className="relative h-44 w-full bg-zinc-800 overflow-hidden">
                <img
                  src={item.coverImage}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-xs font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{item.rating}</span>
                  <span className="text-zinc-500 text-[10px]">({item.reviewsCount})</span>
                </div>
                {item.isVerified && (
                  <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-700/80 p-1.5 rounded-lg">
                    <VerifiedBadge type={item.badgeType} size="sm" />
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    {item.isVerified && (
                      <VerifiedBadge type={item.badgeType} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    {item.address}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    {item.phone}
                  </span>
                  <span className="text-xs text-amber-400 group-hover:underline font-medium">
                    التفاصيل ←
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-3">
          <Frown className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">لا توجد منشآت مطابقة حالياً</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            لم نجد أي منشأة في هذا التصنيف ضمن المحافظة أو المدينة المحددة. جرب تغيير المحافظة من شريط البحث.
          </p>
        </div>
      )}

    </div>
  );
};
