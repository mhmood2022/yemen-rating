import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { NavLink, useLocation } from 'react-router-dom';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import {
  LayoutDashboard,
  FolderTree,
  ShieldCheck,
  Store,
  Gavel,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  Building2, Briefcase, Home, ShieldAlert, MessageSquare,
  ChevronDown,
  ChevronUp,
  Star,
  CreditCard,
  Wallet,
  FileText,
  Inbox,
  LayoutGrid,
  ClipboardList,
  Tag,
} from 'lucide-react';

const ADMIN_OPERATIONS = [
  { id: 'dashboard', label: 'لوحة التحكم الرئيسية', icon: LayoutDashboard, path: '/admin' },
  { id: 'accounts_mgmt', label: 'إدارة الحسابات', icon: Users, path: '/admin/accounts' },
  { id: 'pages_mgmt', label: 'إدارة الصفحات (X)', icon: Building2, path: '/admin/pages' },
  { id: 'all_companies', label: 'كافة المنشآت والأنشطة', icon: Building2, path: '/admin/companies' },
  { id: 'subscriptions', label: 'إدارة التوثيق والاشتراكات', icon: CreditCard, path: '/admin/subscriptions' },
  { id: 'operations', label: 'مركز العمليات والإدارة', icon: Inbox, path: '/admin/operations' },
  { id: 'payments', label: 'إدارة المدفوعات والمالية', icon: Wallet, path: '/admin/payments' },
  { id: 'community', label: 'المجتمع والتغريدات (X)', icon: MessageSquare, path: '/admin/community' },
  { id: 'sections', label: 'إدارة الأقسام والتبويبات', icon: LayoutGrid, path: '/admin/sections' },
  { id: 'real-estate', label: 'العقارات والاستثمار', icon: Home, path: '/admin/real-estate' },
  { id: 'jobs', label: 'الوظائف الشاغرة', icon: Briefcase, path: '/admin/jobs' },
  { id: 'ratings', label: 'التحكم بالتقييمات والنسب', icon: Star, path: '/admin/ratings' },
  { id: 'categories', label: 'إدارة التصنيفات الرسمية', icon: FolderTree, path: '/admin/categories' },
  { id: 'ads', label: 'الإعلانات و YR Ads', icon: Megaphone, path: '/admin/ads' },
  { id: 'ad_orders', label: 'طلبات الاشتراكات الإعلانية', icon: ClipboardList, path: '/admin/ads?tab=orders' },
  { id: 'ad_pricing', label: 'أسعار وباقات الإعلانات', icon: Tag, path: '/admin/ads?tab=pricing' },
  { id: 'auctions', label: 'المزادات والعمولات', icon: Gavel, path: '/admin/auctions' },
  { id: 'markets', label: 'الأسواق ومؤشرات الأسعار', icon: Store, path: '/admin/markets' },
  { id: 'users', label: 'المستخدمون والأدوار', icon: Users, path: '/admin/users' },
  { id: 'analytics', label: 'التقارير والمالية', icon: BarChart3, path: '/admin/analytics' },
  { id: 'settings', label: 'السجل والإعدادات', icon: Settings, path: '/admin/settings' },
];
export const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [sectorsOpen, setSectorsOpen] = useState(true);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      try {
        const [adOrdRes, subRes, proofRes, notifRes, supportRes] = await Promise.allSettled([
          supabase
            .from('ad_subscription_orders')
            .select('id', { count: 'exact', head: true })
            .in('status', ['pending_review', 'pending_payment']),
          supabase
            .from('subscriptions')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'PENDING'),
          supabase
            .from('payment_proofs')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'PENDING'),
          supabase
            .from('admin_notifications')
            .select('id', { count: 'exact', head: true })
            .eq('is_read', false),
          supabase
            .from('user_support_messages')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'PENDING'),
        ]);

        const getCnt = (r: PromiseSettledResult<any>) =>
          r.status === 'fulfilled' ? Number(r.value?.count || 0) : 0;

        const adOrders = getCnt(adOrdRes);
        const subs = getCnt(subRes);
        const proofs = getCnt(proofRes);
        const notifs = getCnt(notifRes);
        const supports = getCnt(supportRes);
        const total = adOrders + subs + proofs + notifs + supports;

        if (!active) return;
        setBadgeCounts({
          dashboard: total,
          ad_orders: adOrders,
          ads: adOrders,
          subscriptions: subs,
          payments: proofs,
          operations: notifs + supports,
        });
      } catch {}
    };

    fetchCounts();
    const timer = setInterval(fetchCounts, 20000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [location.pathname, location.search]);

  // توجيه كل تصنيف إلى شاشته المتخصصة بدقة
  const getCategoryPath = (slug: string) => {
    switch (slug) {
      case 'banks':
        return '/admin/companies?category=banks';
      case 'jobs':
        return '/admin/jobs';
      case 'real-estate':
        return '/admin/real-estate';
      case 'phones':
        return '/admin/phones';
      case 'cleaning-companies':
        return '/admin/cleaning';
      case 'exchange-rates':
        return '/admin/gold-currency';
      default:
        return `/admin/companies?category=${slug}`;
    }
  };

  const isCategoryActive = (slug: string) => {
    const directPath = getCategoryPath(slug);
    if (directPath.includes('?category=')) {
      return location.pathname === '/admin/companies' && location.search.includes(`category=${slug}`);
    }
    return location.pathname === directPath;
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black z-40 lg:hidden "
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-[290px] bg-black border-l border-[#2F3336] z-50 flex flex-col transition-transform duration-300 ease-in-out font-['Cairo',sans-serif] ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* الترويسة */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#2F3336] bg-[#111111] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFC500] flex items-center justify-center font-black text-black text-base shadow-md">
              YR
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-wide">YEMEN RATING</h1>
              <p className="text-[#9CA3AF] text-[10px]">مركز الإدارة والتحكم الموحد</p>
            </div>
          </div>
        </div>

        {/* جسم القائمة */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {/* 1. أدوات الإدارة العامة */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              أدوات الإدارة والعمليات
            </p>
            {ADMIN_OPERATIONS.map((item) => {
                const Icon = item.icon;
                const isActive = item.path.includes('?')
                  ? `${location.pathname}${location.search}` === item.path
                  : location.pathname === item.path &&
                    (!location.search || (item.path !== '/admin/companies' && item.path !== '/admin/ads'));
                const count = badgeCounts[item.id] || 0;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#FFC500] text-black shadow-md shadow-yellow-500/10'
                        : 'text-gray-300 hover:text-white hover:bg-[#111111]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Icon size={16} className={isActive ? 'text-black' : 'text-[#FFC500]'} />
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-black" />
                      )}
                    </div>
                    <span className={`flex-1 truncate ${isActive ? 'text-black font-bold' : 'text-gray-300'}`}>
                      {item.label}
                    </span>
                    {count > 0 && (
                      <span className="px-1.5 min-w-[20px] h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow">
                        {count > 99 ? '+99' : count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </div>

          {/* 2. قطاعات وتصنيفات الموقع الرسمي الـ 34 */}
          <div className="pt-2 border-t border-[#2F3336]/80 space-y-1">
            <button
              type="button"
              onClick={() => setSectorsOpen(!sectorsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-black text-[#FFC500] hover:text-yellow-300"
            >
              <span>القطاعات والتصنيفات الرسمية (34)</span>
              {sectorsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {sectorsOpen && (
              <div className="space-y-0.5 max-h-[340px] overflow-y-auto pr-1">
                {OFFICIAL_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const active = isCategoryActive(cat.slug);
                  const path = getCategoryPath(cat.slug);

                  return (
                    <NavLink
                      key={cat.id}
                      to={path}
                      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#FFC500] text-black font-bold shadow-md'
                          : 'text-gray-300 hover:bg-[#111111] hover:text-white'
                      }`}
                    >
                      <Icon size={15} className="shrink-0 text-[#FFC500]" />
                      <span className={`truncate flex-1 ${location.pathname.includes(cat.slug) ? "text-black font-bold" : "text-gray-300"}`}>{cat.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* تذييل القائمة */}
        <div className="p-3 border-t border-[#2F3336] bg-black shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#111111]">
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
