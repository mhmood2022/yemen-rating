import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Star,
  Megaphone,
  Bell,
  Crown,
  CreditCard,
  MessageCircle,
  Flag,
  ExternalLink,
  X,
} from 'lucide-react';

export type OwnerTab = 'overview' | 'stats' | 'reviews' | 'ads';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  businessLogo?: string;
  businessSlug?: string;
  onEditBusinessPage: () => void;
  onViewBusinessPage: () => void;
  onOpenNotifications: () => void;
  onOpenSubscriptions: () => void;
  onOpenPayments: () => void;
  onOpenSupport: () => void;
  onOpenReport: () => void;
}

const MENU_ITEMS: { id: OwnerTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'الملخص والإحصائيات', icon: LayoutDashboard },
  { id: 'stats', label: 'التحليلات والرسوم', icon: BarChart3 },
  { id: 'reviews', label: 'التقييمات والردود', icon: Star },
  { id: 'ads', label: 'الاشتراك بالإعلانات', icon: Megaphone },
];

export const OwnerSidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  businessName,
  businessLogo,
  businessSlug,
  onEditBusinessPage,
  onViewBusinessPage,
  onOpenNotifications,
  onOpenSubscriptions,
  onOpenPayments,
  onOpenSupport,
  onOpenReport,
}) => {
  const quickActions = [
    { label: 'تعديل صفحة المنشأة', icon: Building2, onClick: onEditBusinessPage },
    { label: 'الإشعارات', icon: Bell, onClick: onOpenNotifications },
    { label: 'الاشتراكات والباقات', icon: Crown, onClick: onOpenSubscriptions },
    { label: 'المدفوعات والفواتير', icon: CreditCard, onClick: onOpenPayments },
    { label: 'الدعم والتواصل', icon: MessageCircle, onClick: onOpenSupport },
    { label: 'تقديم بلاغ', icon: Flag, onClick: onOpenReport },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-[78%] max-w-xs sm:w-64 bg-black border-l border-[#2F3336] z-[100] flex flex-col transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2F3336] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {businessLogo ? (
              <img
                src={businessLogo}
                alt={businessName || ''}
                className="w-10 h-10 rounded-full object-cover border border-[#2F3336] shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#16181C] border border-[#2F3336] text-[#FFC500] flex items-center justify-center font-black shrink-0">
                {(businessName || 'م').charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate">{businessName || 'منشأتي'}</p>
              <p className="text-[11px] text-[#71767B] truncate" dir="ltr">
                {businessSlug ? `@${businessSlug}` : 'لوحة المالك'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#16181C] border border-[#2F3336] text-zinc-400 flex items-center justify-center md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-bold text-right transition ${
                  isActive
                    ? 'bg-[#FFC500] text-black font-black'
                    : 'text-zinc-300 hover:bg-[#16181C]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-black' : 'text-[#71767B]'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="my-3 border-t border-[#2F3336]" />

          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.label}
                onClick={() => {
                  act.onClick();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-bold text-right text-zinc-300 hover:bg-[#16181C] transition"
              >
                <Icon size={17} className="text-[#FFC500]" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#2F3336]">
          <button
            onClick={() => {
              onViewBusinessPage();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-full border border-[#2F3336] hover:bg-[#16181C] text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <ExternalLink size={14} className="text-[#FFC500]" />
            <span>فتح صفحة المنشأة</span>
          </button>
        </div>

        <div className="p-3 border-t border-[#2F3336] text-center text-[10px] text-[#71767B]">
          يمن ريتنج © {new Date().getFullYear()}
        </div>
      </aside>
    </>
  );
};
