import React from 'react';
import { OFFICIAL_CATEGORIES } from '../data/categories';
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
  onCategorySelect,
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

      {/* Sidebar Container */}
      <aside
        dir="rtl"
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-zinc-950 border-l border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:z-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5 text-yellow-500">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-100 leading-tight">التصنيفات الرسمية</h2>
              <span className="text-[11px] text-zinc-400">دليل تقييم اليمن</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {OFFICIAL_CATEGORIES.filter((c) => c.isActive).map((cat) => {
            const Icon = cat.icon;
            const isActive = currentSlug === cat.slug;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleItemClick(cat.slug)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-right group ${
                  isActive
                    ? 'bg-yellow-500 text-zinc-950 font-bold shadow-md shadow-yellow-500/10'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-yellow-400 border border-transparent hover:border-zinc-800/60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-zinc-950/15 text-zinc-950'
                      : 'bg-zinc-900 text-zinc-400 group-hover:text-yellow-400 group-hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate flex-1">{cat.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
