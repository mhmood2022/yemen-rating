import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Star,
  Briefcase,
  Megaphone,
  ShieldCheck,
  Crown,
  CreditCard,
  MessageCircle,
  Bell,
  Settings,
  Eye,
  X,
} from 'lucide-react';

export type OwnerTab =
  | 'overview'
  | 'editor'
  | 'stats'
  | 'reviews'
  | 'services'
  | 'ads'
  | 'verification'
  | 'subscriptions'
  | 'payments'
  | 'support'
  | 'notifications'
  | 'settings'
  | 'home';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  businessLogo?: string;
}

const MENU_ITEMS: { id: OwnerTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'editor', label: 'إدارة صفحة المنشأة', icon: Building2 },
  { id: 'stats', label: 'الإحصائيات والتحليلات', icon: BarChart3 },
  { id: 'reviews', label: 'التقييمات والمراجعات', icon: Star },
  { id: 'services', label: 'الخدمات والعروض', icon: Briefcase },
  { id: 'ads', label: 'الإعلانات والترويج', icon: Megaphone },
  { id: 'verification', label: 'التوثيق وإثبات الملكية', icon: ShieldCheck },
  { id: 'subscriptions', label: 'الاشتراكات والباقات', icon: Crown },
  { id: 'payments', label: 'المدفوعات والفواتير', icon: CreditCard },
  { id: 'support', label: 'الدعم والتواصل', icon: MessageCircle },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'settings', label: 'إعدادات الحساب والأمان', icon: Settings },
  { id: 'home', label: 'معاينة الصفحة كزائر', icon: Eye },
];

export const OwnerSidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  businessName,
  businessLogo,
}) => {
  return (
    <>
      {/* Overlay للموبايل */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-[70%] max-w-xs sm:w-64 bg-black border-l border-zinc-800 z-[100] flex flex-col transition-transform duration-300 md:relative md:translate-x-0 md:z-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            {businessLogo ? (
              <img src={businessLogo} alt="" className="w-9 h-9 rounded-lg object-cover border border-zinc-800" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-zinc-900 text-[#FFC500] flex items-center justify-center font-black">
                {(businessName || 'م').charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{businessName || 'منشأتي'}</p>
              <p className="text-[10px] text-zinc-500">لوحة المالك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 text-zinc-400 flex items-center justify-center md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-right transition ${
                  isActive
                    ? 'bg-[#FFC500] text-black font-black'
                    : 'text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-black' : 'text-zinc-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 text-center text-[10px] text-zinc-600">
          يمن ريتنج © {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
};
