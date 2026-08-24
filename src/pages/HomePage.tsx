import React, { useState } from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');

  const categories = [
    { slug: 'restaurants', name: 'مطاعم ومقاهي', icon: 'fa-utensils', count: '438' },
    { slug: 'hotels', name: 'فنادق وسياحة', icon: 'fa-hotel', count: '142' },
    { slug: 'banks', name: 'بنوك ومصارف', icon: 'fa-building-columns', count: '24' },
    { slug: 'exchanges', name: 'شركات صرافة', icon: 'fa-money-bill-transfer', count: '86' },
    { slug: 'wallets', name: 'محافظ إلكترونية', icon: 'fa-wallet', count: '12' },
    { slug: 'companies', name: 'شركات ومؤسسات', icon: 'fa-building', count: '1,248' },
    { slug: 'transport', name: 'سيارات ونقل', icon: 'fa-car', count: '95' },
    { slug: 'shops', name: 'متاجر وتسوق', icon: 'fa-bag-shopping', count: '310' },
    { slug: 'health', name: 'صحة ومستشفيات', icon: 'fa-hospital', count: '180' },
    { slug: 'services', name: 'خدمات عامة', icon: 'fa-wrench', count: '240' },
    { slug: 'education', name: 'تعليم وجامعات', icon: 'fa-graduation-cap', count: '75' },
    { slug: 'entertainment', name: 'سياحة وترفيه', icon: 'fa-umbrella-beach', count: '60' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E6E6E6] font-sans pb-20" dir="rtl">
      
      {/* 1. الترويسة الرئيسية والبحث */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        
        {/* شريط البحث الموحد */}
        <div className="relative mb-2">
          <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"></i>
          <input
            type="text"
            placeholder="ابحث عن نشاط أو شركة أو بنك أو خدمة..."
            onClick={() => onNavigate('/directory')}
            readOnly
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl pr-10 pl-4 py-3 text-xs text-white placeholder-neutral-400 cursor-pointer shadow-md focus:border-amber-400 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4 font-bold">
          <i className="fa-solid fa-location-dot text-amber-400"></i>
          <span>اليمن، صنعاء وعدن وجميع المحافظات</span>
        </div>

        {/* 2. البانر الترويجي (اكتشف الأفضل) */}
        <div className="relative h-44 rounded-2xl overflow-hidden border border-[#2A2A2A] bg-gradient-to-l from-black/90 via-black/40 to-transparent p-5 flex flex-col justify-between mb-6 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800"
            alt="Yemen Rating"
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
          <div>
            <h2 className="text-lg font-black text-white">اكتشف الأفضل في اليمن</h2>
            <p className="text-xs text-neutral-300 max-w-xs mt-1 leading-relaxed">
              دليل شامل وموثق لجميع الشركات، البنوك، الفنادق، والخدمات مع تقييمات حقيقية من المجتمع.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('/directory')}
              className="bg-[#FFC107] hover:bg-[#FFB300] text-neutral-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-400/20 active:scale-95 transition"
            >
              <span>استكشف الدليل الكامل</span>
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
            </button>

            <div className="flex gap-1">
              <span className="w-4 h-1.5 rounded-full bg-[#FFC107]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* 3. شبكة التصنيفات الـ 12 الكاملة */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-black text-white">التصنيفات والقطاعات الرئيسية</h3>
          <button onClick={() => onNavigate('/directory')} className="text-xs text-amber-400 font-bold hover:underline">
            عرض الكل (12)
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5 mb-6">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => onNavigate(`/${cat.slug}`)}
              className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#FFC107] p-2.5 rounded-2xl text-center cursor-pointer transition group hover:-translate-y-0.5"
            >
              <div className="w-9 h-9 rounded-xl bg-[#141414] text-amber-400 group-hover:bg-[#FFC107] group-hover:text-black flex items-center justify-center mx-auto mb-1.5 transition text-sm">
                <i className={`fa-solid ${cat.icon}`}></i>
              </div>
              <div className="text-[11px] font-bold text-neutral-200 group-hover:text-white line-clamp-1">{cat.name}</div>
              <div className="text-[9px] text-neutral-500">{cat.count}</div>
            </div>
          ))}
        </div>

        {/* 4. ويدجت أسعار الصرف المباشرة (صنعاء / عدن) */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 mb-6 shadow-md">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-coins text-amber-400 text-sm"></i>
              <span className="text-xs font-black text-white">أسعار العملات والذهب المباشرة</span>
            </div>
            <div className="flex bg-[#121217] p-0.5 rounded-lg border border-[#2A2A2A] text-[10px]">
              <button
                onClick={() => setActiveMarket('sanaa')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${activeMarket === 'sanaa' ? 'bg-[#FFC107] text-black font-black' : 'text-neutral-400'}`}
              >
                صنعاء
              </button>
              <button
                onClick={() => setActiveMarket('aden')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${activeMarket === 'aden' ? 'bg-[#FFC107] text-black font-black' : 'text-neutral-400'}`}
              >
                عدن
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#141414] border border-[#262626] p-2 rounded-xl">
              <div className="text-[10px] text-neutral-400 font-bold mb-0.5">الدولار (USD)</div>
              <div className="text-xs font-black text-amber-400">{activeMarket === 'sanaa' ? '535 / 532' : '1,540 / 1,530'}</div>
              <div className="text-[9px] text-neutral-500">ريال يمني</div>
            </div>
            <div className="bg-[#141414] border border-[#262626] p-2 rounded-xl">
              <div className="text-[10px] text-neutral-400 font-bold mb-0.5">السعودي (SAR)</div>
              <div className="text-xs font-black text-amber-400">{activeMarket === 'sanaa' ? '140.5 / 139.8' : '410 / 408'}</div>
              <div className="text-[9px] text-neutral-500">ريال يمني</div>
            </div>
            <div className="bg-[#141414] border border-[#262626] p-2 rounded-xl">
              <div className="text-[10px] text-neutral-400 font-bold mb-0.5">ذهب عيار 21</div>
              <div className="text-xs font-black text-emerald-400">{activeMarket === 'sanaa' ? '32,000' : '92,000'}</div>
              <div className="text-[9px] text-neutral-500">ريال / جرام</div>
            </div>
          </div>
        </div>

        {/* 5. الترند الآن والأنشطة الأعلى تقييماً */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <i className="fa-solid fa-fire text-orange-500 text-xs"></i>
            <span>الترند والأعلى تقييماً اليوم</span>
          </h3>
          <button onClick={() => onNavigate('/trend')} className="text-xs text-amber-400 font-bold hover:underline">
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div
            onClick={() => onNavigate('/restaurants')}
            className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-amber-400 rounded-xl overflow-hidden cursor-pointer group"
          >
            <div className="h-20 bg-neutral-800 relative">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300"
                alt="مطعم حضرموت"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-black text-amber-400 flex items-center gap-0.5">
                <i className="fa-solid fa-star text-[8px]"></i> 4.7
              </span>
            </div>
            <div className="p-2">
              <div className="text-[11px] font-bold text-white line-clamp-1">مطعم حضرموت</div>
              <div className="text-[9px] text-neutral-400">مطاعم • صنعاء</div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('/banks')}
            className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-amber-400 rounded-xl overflow-hidden cursor-pointer group"
          >
            <div className="h-20 bg-neutral-800 relative">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=300"
                alt="بنك الكريمي"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-black text-amber-400 flex items-center gap-0.5">
                <i className="fa-solid fa-star text-[8px]"></i> 4.8
              </span>
            </div>
            <div className="p-2">
              <div className="text-[11px] font-bold text-white line-clamp-1">بنك الكريمي</div>
              <div className="text-[9px] text-neutral-400">بنوك • صنعاء</div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('/shops')}
            className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-amber-400 rounded-xl overflow-hidden cursor-pointer group"
          >
            <div className="h-20 bg-neutral-800 relative">
              <img
                src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300"
                alt="هايبر بلس"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-black text-amber-400 flex items-center gap-0.5">
                <i className="fa-solid fa-star text-[8px]"></i> 4.6
              </span>
            </div>
            <div className="p-2">
              <div className="text-[11px] font-bold text-white line-clamp-1">هايبر بلس</div>
              <div className="text-[9px] text-neutral-400">متاجر • عدن</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
