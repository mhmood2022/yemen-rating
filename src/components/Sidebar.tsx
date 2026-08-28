import React from 'react';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../data/categories';
import { X, Layers } from 'lucide-react';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategorySlug?: string | null;
  selectedCategory?: string | null;
  activeCategory?: string | null;
  onSelectCategory?: (slug: string) => void;
  onCategorySelect?: (slug: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedCategorySlug,
  selectedCategory,
  activeCategory,
  onSelectCategory,
  onCategorySelect
}) => {
  const currentSlug = selectedCategorySlug || selectedCategory || activeCategory;
  const handleSelect = onSelectCategory || onCategorySelect || (() => {});

  const handleItemClick = (slug: string) => {
    handleSelect(slug);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        dir="rtl"
        className={`
          fixed top-0 bottom-0 right-0 z-50 w-72 bg-zinc-950 border-l border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          lg:static lg:translate-x-0 lg:z-auto lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Drawer Header (Mobile Only) */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 lg:hidden">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <Layers className="w-5 h-5" />
            <span>التصنيفات الرسمية</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Header (Desktop) */}
        <div className="hidden lg:flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">التصنيفات</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {OFFICIAL_CATEGORIES.length}
          </span>
        </div>

        {/* Scrollable Categories List */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {OFFICIAL_CATEGORIES.map((cat: CategoryItem) => {
            const Icon = cat.icon;
            const isActive = currentSlug === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => handleItemClick(cat.slug)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group text-right
                  ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/10'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white border border-transparent'
                  }
                `}
              >
                <div
                  className={`
                    w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                    ${
                      isActive
                        ? 'bg-zinc-950 text-amber-400'
                        : 'bg-zinc-900 text-zinc-400 group-hover:text-amber-400 group-hover:bg-zinc-800 border border-zinc-800/80'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
