import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Bell, Search, MapPin, X, ChevronLeft, 
  ExternalLink, ChevronDown
} from 'lucide-react';
import { PLATFORM_NAVIGATION } from '../../config/navigationConfig';
import { YEMEN_CITIES } from '../../config/citiesConfig';
import { searchService, TypedSearchResult, SearchResultType } from '../../services/searchService';
import { YRBadge } from '../common/YRBadge';
import { YRLogo } from '../common/YRLogo';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('كل المحافظات');
  const [selectedType, setSelectedType] = useState<SearchResultType | 'all'>('all');
  
  const navigate = useNavigate();
  const location = useLocation();

  const searchResults = React.useMemo(() => {
    return searchService.search(searchQuery, selectedCity, selectedType);
  }, [searchQuery, selectedCity, selectedType]);

  const handleSelectResult = (result: TypedSearchResult) => {
    setIsSearchModalOpen(false);
    navigate(result.path);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-zinc-100 flex flex-col font-['Cairo',sans-serif]">
      
      {/* 1. الهيدر الموحد الثابت في الأعلى */}
      <header className="sticky top-0 z-40 bg-[#070A10]/98 backdrop-blur-xl border-b border-[#1F2937] shadow-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
          
          {/* اليمين: زر القائمة الجانبية (☰) + الشعار الرسمي المعتمد */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 rounded-xl bg-[#121215] border border-[#222226] text-white hover:text-[#FFC500] hover:border-[#FFC500]/40 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="القائمة"
            >
              <Menu size={20} />
            </button>

            <div onClick={() => navigate('/')} className="cursor-pointer">
              <YRLogo />
            </div>
          </div>

          {/* اليسار: جرس الإشعارات */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-9 h-9 rounded-xl bg-[#121215] border border-[#222226] text-zinc-300 hover:text-[#FFC500] flex items-center justify-center relative transition-all active:scale-95 cursor-pointer"
              title="الإشعارات"
            >
              <Bell size={17} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-black flex items-center justify-center border-2 border-[#070A10]">
                3
              </span>
            </button>
          </div>

        </div>

        {/* 2. شريط البحث المستقل الموضوع تحت الهيدر مباشرة */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-2.5 pt-1">
          <div 
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center bg-[#121215] border border-[#242428] hover:border-[#FFC500]/40 rounded-2xl p-2 px-3.5 shadow-lg cursor-pointer transition-all"
          >
            <Search size={16} className="text-[#8E8E93] ml-2 shrink-0" />
            <span className="flex-1 text-xs text-zinc-400 font-medium truncate">
              ابحث عن بنك، شركة، عقار، مزاد، وظيفة...
            </span>
            <div className="flex items-center gap-1 border-r border-[#27272A] pr-2.5 mr-1 text-[#D1D5DB]">
              <MapPin size={13} className="text-[#FFC500]" />
              <span className="text-[11px] font-bold whitespace-nowrap">{selectedCity}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. القائمة الجانبية الموحدة المفتوحة من اليمين */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
        />
      )}

      <aside className={`fixed top-0 right-0 h-full w-[280px] sm:w-[300px] bg-[#0B0F17] border-l border-[#1F2937] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1F2937] bg-[#111827]">
          <YRLogo size="sm" />
          <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
          {PLATFORM_NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FFC500] text-black shadow-md shadow-[#FFC500]/15'
                    : 'text-zinc-300 hover:bg-[#161D2B] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-black' : 'text-[#FFC500]'} />
                  <span>{item.name}</span>
                </div>
                <ChevronLeft size={14} className="opacity-40" />
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* 4. نافذة البحث العام المصنف عند الضغط */}
      {isSearchModalOpen && (
        <div 
          onClick={() => setIsSearchModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 select-none"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-[#0F0F12] border border-[#222226] rounded-2xl w-full max-w-2xl p-4 sm:p-5 space-y-3.5 shadow-2xl max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center bg-[#18181C] border border-[#27272A] focus-within:border-[#FFC500] rounded-xl px-3 py-2">
              <Search size={18} className="text-[#FFC500] ml-2 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، المسمى، المدينة، أو التصنيف..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-zinc-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#222226] pb-2.5">
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'bank', label: 'بنوك ومحافظ' },
                  { id: 'business', label: 'شركات' },
                  { id: 'job', label: 'وظائف' },
                  { id: 'property', label: 'عقارات' },
                  { id: 'auction', label: 'مزادات' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      selectedType === tab.id ? 'bg-[#FFC500] text-black' : 'bg-[#18181C] text-zinc-400 border border-[#27272A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-[#18181C] border border-[#27272A] rounded-lg px-2.5 py-1 text-[11px] font-bold text-zinc-300 outline-none cursor-pointer"
              >
                {YEMEN_CITIES.map(c => (
                  <option key={c.id} value={c.name_ar}>{c.name_ar}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-0.5">
              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  لا توجد نتائج مطابقة لبحثك.
                </div>
              ) : (
                searchResults.map(res => (
                  <div
                    key={res.id}
                    onClick={() => handleSelectResult(res)}
                    className="p-3 bg-[#141417] hover:bg-[#1C1C22] border border-[#222226] hover:border-[#FFC500]/40 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {res.imageUrl ? (
                        <img src={res.imageUrl} alt={res.title} className="w-10 h-10 rounded-lg object-cover border border-[#27272A] shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#18181C] text-[#FFC500] flex items-center justify-center font-bold text-xs shrink-0">
                          {res.typeLabel.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[9px] font-bold text-[#FFC500] font-mono shrink-0">
                            [{res.typeLabel}]
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{res.title}</h4>
                          {res.badgeType && <YRBadge type={res.badgeType} size={14} />}
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{res.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      {res.price && <b className="text-xs text-[#FFC500] block">{res.price}</b>}
                      {res.city && <span className="text-[9.5px] text-zinc-500 flex items-center gap-0.5"><MapPin size={10} /> {res.city}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-left border-t border-[#222226] pt-2">
              <button onClick={() => setIsSearchModalOpen(false)} className="px-4 py-1.5 bg-[#18181C] text-zinc-400 text-xs font-bold rounded-lg hover:text-white">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. المحتوى الرئيسي */}
      <main className="flex-1 pb-16">
        {children}
      </main>

    </div>
  );
};
