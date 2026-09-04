import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, FolderTree, ShieldCheck, 
  Store, Gavel, Megaphone, Briefcase, 
  Home, Smartphone, Sparkles, Users, 
  BarChart3, Coins, Cpu, Settings
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'لوحة التحكم الرئيسية', icon: LayoutDashboard, path: '/admin' },
  { id: 'companies', label: 'الشركات والأنشطة', icon: Building2, path: '/admin/companies' },
  { id: 'banks', label: 'إدارة البنوك والمصارف', icon: Landmark, path: '/admin/banks' },
  { id: 'categories', label: 'التصنيفات الهرمية', icon: FolderTree, path: '/admin/categories' },
  { id: 'claims', label: 'إثبات الملكية والتوثيق', icon: ShieldCheck, path: '/admin/claims' },
  { id: 'markets', label: 'الأسواق والأسعار', icon: Store, path: '/admin/markets' },
  { id: 'auctions', label: 'المزادات والعمولات', icon: Gavel, path: '/admin/auctions' },
  { id: 'ads', label: 'الإعلانات و YR Ads', icon: Megaphone, path: '/admin/ads' },
  { id: 'jobs', label: 'الوظائف والتوظيف', icon: Briefcase, path: '/admin/jobs' },
  { id: 'realestate', label: 'العقارات والصفقات', icon: Home, path: '/admin/real-estate' },
  { id: 'phones', label: 'سوق الهواتف', icon: Smartphone, path: '/admin/phones' },
  { id: 'cleaning', label: 'خدمات التنظيف', icon: Sparkles, path: '/admin/cleaning' },
  { id: 'users', label: 'المستخدمون والأدوار', icon: Users, path: '/admin/users' },
  { id: 'analytics', label: 'التقارير والمالية', icon: BarChart3, path: '/admin/analytics' },
  { id: 'gold', label: 'الذهب والعملات والبنوك', icon: Coins, path: '/admin/gold-currency' },
  { id: 'matching', label: 'المطابقة الذكية YR AI', icon: Cpu, path: '/admin/matching' },
  { id: 'settings', label: 'السجل والإعدادات', icon: Settings, path: '/admin/settings' },
];

export const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside 
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#0B0F17] border-l border-[#1F2937] z-50 flex flex-col transition-transform duration-300 ease-in-out font-['Cairo',sans-serif] ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1F2937] bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFC500] flex items-center justify-center font-bold text-black text-lg">
              YR
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-wide">YEMEN RATING</h1>
              <p className="text-[#9CA3AF] text-[10px]">مركز الإدارة والتحكم</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FFC500] text-black font-bold'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#161D2B]'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1F2937] bg-[#0E131F]">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#161D2B]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">الوضع الآمن (RLS نشط)</p>
              <p className="text-[#9CA3AF] text-[10px]">11 Roles RBAC</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
