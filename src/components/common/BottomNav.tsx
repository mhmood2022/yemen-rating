import React from 'react';
import { Home, Compass, Plus, Heart, Grid } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  onNavigate,
  onOpenAddModal
}) => {
  return (
    <div
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-lg border-t border-[#262626] h-16 px-4 flex items-center justify-between max-w-lg mx-auto shadow-2xl lg:hidden"
    >
      {/* الرئيسية */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center flex-1 transition-colors ${
          currentPage === 'home' ? 'text-[#f5c400] font-bold' : 'text-[#888] hover:text-zinc-300'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">الرئيسية</span>
      </button>

      {/* الدليل */}
      <button
        onClick={() => onNavigate('markets')}
        className={`flex flex-col items-center justify-center flex-1 transition-colors ${
          currentPage === 'markets' ? 'text-[#f5c400] font-bold' : 'text-[#888] hover:text-zinc-300'
        }`}
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">الدليل</span>
      </button>

      {/* زر أضف نشاط (+) المركزي المرتفع */}
      <div className="flex-1 flex justify-center -mt-6">
        <button
          onClick={onOpenAddModal}
          className="w-12 h-12 rounded-full bg-[#f5c400] text-zinc-950 flex items-center justify-center shadow-lg shadow-[#f5c400]/30 hover:scale-105 active:scale-95 transition-transform"
          aria-label="أضف نشاط"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* المفضلة */}
      <button
        onClick={() => onNavigate('favorites')}
        className={`flex flex-col items-center justify-center flex-1 transition-colors ${
          currentPage === 'favorites' ? 'text-[#f5c400] font-bold' : 'text-[#888] hover:text-zinc-300'
        }`}
      >
        <Heart className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">المفضلة</span>
      </button>

      {/* المزيد */}
      <button
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center justify-center flex-1 transition-colors ${
          currentPage === 'profile' ? 'text-[#f5c400] font-bold' : 'text-[#888] hover:text-zinc-300'
        }`}
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">المزيد</span>
      </button>
    </div>
  );
};
