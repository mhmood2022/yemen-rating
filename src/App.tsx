import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OFFICIAL_CATEGORIES, CategoryItem } from './data/categories';
import { 
  Star, 
  MapPin, 
  Phone, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Building2,
  Sparkles
} from 'lucide-react';

export function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('الكل');

  const cities = ['الكل', 'صنعاء', 'عدن', 'تعز', 'حضرموت', 'الحديدة', 'مأرب', 'إب'];

  // Current category data
  const currentCategory = OFFICIAL_CATEGORIES.find(c => c.slug === selectedCategorySlug);

  // Sample listing generator based on category
  const sampleListings = [
    {
      id: '1',
      name: currentCategory ? `${currentCategory.name} - المركز الرئيسي` : 'بنك الكريمي للتمويل الأصغر الإسلامي',
      categorySlug: selectedCategorySlug || 'banks',
      rating: 4.8,
      reviewsCount: 342,
      city: 'صنعاء',
      address: 'شارع الزبيري - تقاطع حدة',
      phone: '777000111',
      isOpen: true,
      verified: true,
      image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: '2',
      name: currentCategory ? `${currentCategory.name} - فرع المنصورة` : 'مطعم وكافيه رويال ستار',
      categorySlug: selectedCategorySlug || 'restaurants',
      rating: 4.6,
      reviewsCount: 189,
      city: 'عدن',
      address: 'المنصورة - ريمي - بجانب الشارع العام',
      phone: '733000222',
      isOpen: true,
      verified: true,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: '3',
      name: currentCategory ? `${currentCategory.name} - المعرض الحديث` : 'شركة سبأفون للاتصالات',
      categorySlug: selectedCategorySlug || 'telecom',
      rating: 4.5,
      reviewsCount: 120,
      city: 'تعز',
      address: 'شارع جمال - وسط المدينة',
      phone: '711000333',
      isOpen: false,
      verified: true,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-amber-400 selection:text-zinc-950">
      
      {/* 1. Main Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onNavigateHome={() => {
          setSelectedCategorySlug(null);
          setSearchQuery('');
        }}
        onSearch={(q) => setSearchQuery(q)}
      />

      {/* 2. Body Container: Sidebar + Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex">
        
        {/* Public Sidebar (26 Categories) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedCategorySlug={selectedCategorySlug}
          onSelectCategory={(slug) => {
            setSelectedCategorySlug(slug);
            setIsSidebarOpen(false);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* View A: Home Page View (When no category is selected) */}
          {!selectedCategorySlug ? (
            <>
              {/* Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8">
                <div className="relative z-10 max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>الدليل الوطني الشامل لتقييم الخدمات في اليمن</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                    اكتشف، قيّم، وتصفح أفضل الخدمات والأنشطة في مدينتك
                  </h1>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    منصة يمن ريتينغ تجمع لك 26 تصنيفاً شاملاً من البنوك وأسعار الصرف، والمطاعم، والعقارات، والخدمات مع تقييمات حقيقية وتواصل مباشر.
                  </p>
                </div>
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-xs text-zinc-400 flex items-center gap-1 flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> المحافظة:
                </span>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`text-xs px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                      selectedCity === city
                        ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400'
                        : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* 26 Categories Grid on Home Screen */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-5 bg-amber-400 rounded-sm"></span>
                    التصنيفات الرسمية (26 تصنيفاً)
                  </h2>
                  <span className="text-xs text-zinc-500">اضغط على أي تصنيف للاستعراض</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                  {OFFICIAL_CATEGORIES.map((cat: CategoryItem) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategorySlug(cat.slug)}
                        className="flex flex-col items-start p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-400/50 hover:bg-zinc-900 transition-all group text-right shadow-sm"
                      >
                        <div className="w-9 h-9 rounded-lg bg-zinc-800 group-hover:bg-amber-400 text-zinc-300 group-hover:text-zinc-950 flex items-center justify-center transition-colors mb-2.5">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-xs sm:text-sm text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {cat.slug}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* View B: Specific Category Details & Listings View */
            <div className="space-y-6">
              
              {/* Category Breadcrumb & Title */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  {currentCategory && (
                    <div className="w-12 h-12 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/10">
                      <currentCategory.icon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      {currentCategory?.name || 'التصنيف'}
                    </h1>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      دليل الأنشطة والخدمات المعتمدة في تصنيف {currentCategory?.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCategorySlug(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  <span>العودة للرئيسية</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Category Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col group"
                  >
                    <div className="relative h-44 w-full bg-zinc-800 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-zinc-800 text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.rating}</span>
                        <span className="text-zinc-500 text-[10px]">({item.reviewsCount})</span>
                      </div>
                      <div className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] px-2 py-0.5 rounded-md backdrop-blur-md font-medium">
                        مفتوح الآن
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h3>
                          {item.verified && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          {item.city} - {item.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                        <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          {item.phone}
                        </span>
                        <button className="text-xs bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                          التفاصيل والتقييم
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}

export default App;
