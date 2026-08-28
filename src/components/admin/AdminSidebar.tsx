import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Store,
  Building,
  Briefcase,
  Gavel,
  Users,
  TrendingUp,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  activeSection,
  onSelectSection
}) => {
  const adminMenuItems = [
    { id: 'overview', name: 'لوحة التحكم العامة', icon: LayoutDashboard },
    { id: 'categories', name: 'إدارة التصنيفات', icon: Layers },
    { id: 'listings', name: 'إدارة المتاجر والأنشطة', icon: Store },
    { id: 'real-estate', name: 'إدارة العقارات', icon: Building },
    { id: 'jobs', name: 'إدارة الوظائف', icon: Briefcase },
    { id: 'auctions', name: 'إدارة المزادات', icon: Gavel },
    { id: 'exchange-rates', name: 'أسعار الصرف والبنوك', icon: TrendingUp },
    { id: 'users', name: 'إدارة المستخدمين', icon: Users },
    { id: 'settings', name: 'إعدادات المنصة', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    onSelectSection(id);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        dir="rtl"
        className={`
          fixed top-0 bottom-0 right-0 z-50 w-64 bg-zinc-950 border-l border-zinc-800 flex flex-col transition-transform duration-300
          lg:static lg:translate-x-0 lg:z-auto lg:h-screen lg:sticky lg:top-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-zinc-950 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">لوحة الإدارة</h2>
              <span className="text-[10px] text-amber-400">Yemen Rating Pro</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all text-right
                  ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/10'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
