import React, { useState } from 'react';
import { Building, MapPin, Phone, ArrowRight, BedDouble, Bath, Maximize2, Tag } from 'lucide-react';
import { VerifiedBadge } from '../common/VerifiedBadge';

export const RealEstatePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale'>('all');

  const properties = [
    {
      id: 'prop-1',
      title: 'شقة عائلية فاخرة سوبر ديلوكس للإيجار',
      type: 'rent',
      typeName: 'للإيجار',
      price: '400 $ / شهرياً',
      city: 'صنعاء',
      location: 'حدة - خلف فندق شيراتون',
      bedrooms: 3,
      bathrooms: 2,
      area: '160 م²',
      phone: '777123456',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'prop-2',
      title: 'فيلا مستقلة مودرن حوش واسع مع مسبح',
      type: 'sale',
      typeName: 'للبيع',
      price: '280,000 $',
      city: 'عدن',
      location: 'إنماء - المرحلة السكنية الأولى',
      bedrooms: 5,
      bathrooms: 4,
      area: '450 م²',
      phone: '733987654',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80'
    },
    {
      id: 'prop-3',
      title: 'عمارة استثمارية 4 أدوار 8 شقق موقع تجاري',
      type: 'sale',
      typeName: 'للبيع',
      price: '450,000 $',
      city: 'صنعاء',
      location: 'بيت بوس - شارع الـ 24',
      bedrooms: 16,
      bathrooms: 8,
      area: '600 م²',
      phone: '771223344',
      isVerified: true,
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80'
    }
  ];

  const filtered = filterType === 'all' ? properties : properties.filter(p => p.type === filterType);

  return (
    <div dir="rtl" className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/10">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              سوق العقارات والمخططات
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              شقق للإيجار، فلل، أراضي، وعمائر استثمارية موثقة في كافة محافظات اليمن
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

      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'all' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          كل العقارات
        </button>
        <button
          onClick={() => setFilterType('rent')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'rent' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          عقارات للإيجار
        </button>
        <button
          onClick={() => setFilterType('sale')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            filterType === 'sale' ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          عقارات للبيع والشراء
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900/70 border border-zinc-800 hover:border-amber-400/50 rounded-2xl overflow-hidden transition-all flex flex-col group shadow-lg"
          >
            <div className="relative h-48 w-full bg-zinc-800 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-xs font-bold text-amber-400">
                {item.price}
              </div>
              <div className={`absolute top-3 left-3 text-[11px] px-2 py-0.5 rounded-md backdrop-blur-md font-bold ${
                item.type === 'rent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {item.typeName}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{item.city} - {item.location}</span>
                </p>

                <div className="flex items-center gap-3 pt-3 mt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-amber-400" /> {item.bedrooms} غرف</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-amber-400" /> {item.bathrooms} حمام</span>
                  <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-amber-400" /> {item.area}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold hover:underline">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{item.phone}</span>
                </a>
                <button className="text-xs bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                  معاينة العقار
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
