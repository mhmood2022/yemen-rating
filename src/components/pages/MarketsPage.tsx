import React, { useState } from 'react';
import { Store, MapPin, Phone, ArrowRight, Layers, Star, ShoppingBag } from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

export const MarketsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const markets = [
    {
      id: 'm-1',
      name: 'سوق الملح التراثي - صنعاء القديمة',
      type: 'سوق شعبي وتراثي متكامل',
      shopsCount: 120,
      city: 'صنعاء',
      location: 'باب اليمن - صنعاء القديمة',
      description: 'أقدم وأشهر أسواق اليمن، يضم أسواق البهارات، الفضة، الجنابي، الأقمشة والمصنوعات الحرفية التقليدية.',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-2',
      name: 'مركز الرويشان التجاري',
      type: 'مول ومجمع تسوق تجاري',
      shopsCount: 85,
      city: 'صنعاء',
      location: 'شارع الزبيري - تقاطع الستين',
      description: 'مجمع تجاري يضم أرقى الماركات للملابس والأحذية، والمجوهرات، والعطور، وصالة ألعاب عائلية.',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'm-3',
      name: 'سوق الحجاز بلازا الدولي',
      type: 'مركز تسوق وترفيه',
      shopsCount: 95,
      city: 'عدن',
      location: 'المنصورة - الشارع العام',
      description: 'أحد أكبر المراكز التجارية الحديثة في عدن، يضم محلات تجارية ومطاعم وسوبرماركت مركزي.',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1567449303078-57ad995bd301?w=800&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div dir="rtl" className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/10">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              دليل الأسواق والمراكز التجارية
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              تصفح أسواق صنعاء وعدن والمحافظات، والمتاجر والمحلات المتواجدة بداخلها
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {markets.map((market) => (
          <div
            key={market.id}
            className="bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/50 rounded-2xl overflow-hidden transition-all flex flex-col group shadow-lg"
          >
            <div className="relative h-48 w-full bg-zinc-800 overflow-hidden">
              <img src={market.image} alt={market.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-xs font-bold text-amber-400 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{market.shopsCount} محل تجاري</span>
              </div>
              {market.isVerified && (
                <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-700 p-1.5 rounded-lg">
                  <VerifiedBadge type="gold" size="sm" />
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                  {market.type}
                </span>
                <h3 className="font-bold text-sm text-white mt-2 group-hover:text-amber-400 transition-colors">
                  {market.name}
                </h3>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{market.location}</span>
                </p>
                <p className="text-xs text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                  {market.description}
                </p>
              </div>

              <button className="w-full py-2 bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-white font-bold text-xs rounded-xl transition-colors mt-2">
                استعراض المحلات والأنشطة بالداخل ←
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
