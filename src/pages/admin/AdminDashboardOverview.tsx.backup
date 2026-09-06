import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Gavel,
  Home,
  Coins,
  ShieldCheck,
  Megaphone,
  Layers,
  Briefcase,
  Smartphone,
  Sparkles,
  Users,
  BarChart3,
  Cpu,
  Settings,
  ArrowUpRight,
  Clock,
  Activity,
  ShieldAlert
} from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
  // 1. الإحصائيات الرئيسية الشاملة
  const mainStats = [
    { title: 'إجمالي المنشآت والشركات', value: '1,420', change: '+12% هذا الشهر', icon: Building2, color: '#EAB308', path: '/admin/companies' },
    { title: 'التصنيفات الرسمية المعتمدة', value: '34 تصنيف', change: '100% نشطة ومفعلة', icon: Layers, color: '#3B82F6', path: '/admin/categories' },
    { title: 'المزادات والصفقات النشطة', value: '28 مزاد', change: '5% عمولة محتسبة', icon: Gavel, color: '#10B981', path: '/admin/auctions' },
    { title: 'العقارات المعروضة', value: '315 عقار', change: 'أرقام الاتصال محمية', icon: Home, color: '#8B5CF6', path: '/admin/real-estate' },
    { title: 'طلبات التوثيق وإثبات الملكية', value: '14 معلق', change: 'يتطلب مراجعة فورية', icon: ShieldCheck, color: '#F59E0B', path: '/admin/claims' },
    { title: 'الحملات الإعلانية YR Ads', value: '42 حملة', change: '10 مواضع إعلانية نشطة', icon: Megaphone, color: '#EC4899', path: '/admin/ads' },
    { title: 'الوظائف الشاغرة المعروضة', value: '89 وظيفة', change: '12 شركة توظف حالياً', icon: Briefcase, color: '#06B6D4', path: '/admin/jobs' },
    { title: 'سوق ومتاجر الهواتف', value: '64 متجر', change: '180 جهاز معروض', icon: Smartphone, color: '#14B8A6', path: '/admin/phones' },
    { title: 'أسعار الصرف والذهب', value: 'مُحدّث لحظياً', change: 'صنعاء وعدن (YER/SAR/USD)', icon: Coins, color: '#EAB308', path: '/admin/gold-currency' },
  ];

  // 2. الوصول السريع لكافة وحدات الإدارة الـ 16
  const quickModules = [
    { label: 'الشركات والأنشطة', icon: Building2, path: '/admin/companies', desc: 'إدارة وتعديل المنشآت' },
    { label: 'التصنيفات الـ 34', icon: Layers, path: '/admin/categories', desc: 'تفعيل وترتيب التصنيفات' },
    { label: 'إثبات الملكية', icon: ShieldCheck, path: '/admin/claims', desc: 'مراجعة طلبات التوثيق' },
    { label: 'الأسواق والأسعار', icon: Activity, path: '/admin/markets', desc: 'مؤشرات السلع اليومية' },
    { label: 'المزادات والعمولات', icon: Gavel, path: '/admin/auctions', desc: 'متابعة العطاءات والعمولة' },
    { label: 'الإعلانات و YR Ads', icon: Megaphone, path: '/admin/ads', desc: 'استوديو توليد الإعلانات' },
    { label: 'الوظائف والتوظيف', icon: Briefcase, path: '/admin/jobs', desc: 'متابعة إعلانات العمل' },
    { label: 'العقارات والصفقات', icon: Home, path: '/admin/real-estate', desc: 'إدارة العروض العقارية' },
    { label: 'سوق الهواتف', icon: Smartphone, path: '/admin/phones', desc: 'إدارة الأجهزة والمتاجر' },
    { label: 'خدمات المنصة', icon: Sparkles, path: '/admin/cleaning', desc: 'إدارة الخدمات والطلبات' },
    { label: 'المستخدمون والأدوار', icon: Users, path: '/admin/users', desc: 'صلاحيات المشرفين' },
    { label: 'التقارير والمالية', icon: BarChart3, path: '/admin/analytics', desc: 'الإيرادات ومعدلات النمو' },
    { label: 'الذهب والبنوك', icon: Coins, path: '/admin/gold-currency', desc: 'تحديث أسعار العملات' },
    { label: 'المطابقة YR AI', icon: Cpu, path: '/admin/matching', desc: 'خوارزميات التوصية الذكية' },
    { label: 'سجل التدقيق', icon: Clock, path: '/admin/settings', desc: 'Audit Logs والعمليات' },
    { label: 'إعدادات النظام', icon: Settings, path: '/admin/settings', desc: 'إعدادات المنصة والأمان' },
  ];

  // 3. قائمة العمليات الأخيرة والمهام العاجلة
  const pendingActions = [
    { id: 1, type: 'claim', title: 'طلب توثيق: مستشفى الأمل التخصصي', time: 'منذ 15 دقيقة', badge: 'توثيق منشأة' },
    { id: 2, type: 'ad', title: 'حملة إعلانية جديدة: عروض بنك الكريمي', time: 'منذ 35 دقيقة', badge: 'YR Ads' },
    { id: 3, type: 'auction', title: 'انتهاء مزاد: عقار تجاري في حي الأصبحي', time: 'منذ ساعة', badge: 'عمولة 5%' },
    { id: 4, type: 'rate', title: 'تحديث مؤشر أسعار الصرف المسائي', time: 'منذ ساعتين', badge: 'الصرف والذهب' },
  ];

  return (
    <div dir="rtl" className="space-y-8 text-zinc-100">
      {/* رأس الصفحة مع شريط الحالة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/70 border border-zinc-800/80 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2.5 text-yellow-400">
            <Activity className="w-5 h-5" />
            <h1 className="text-xl sm:text-2xl font-black text-white">مركز التحكم الإداري الشامل</h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">مؤشرات الأداء المباشرة وإدارة كافة وحدات منصة Yemen Rating</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            النظام يعمل بكفاءة عالية
          </span>
        </div>
      </div>

      {/* 1. شبكة كروت الإحصائيات الحية */}
      <div>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">المؤشرات العامة للأنشطة والخدمات</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link
                key={i}
                to={stat.path}
                className="group p-5 rounded-2xl bg-zinc-950 border border-zinc-800/90 hover:border-yellow-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/5 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-xs font-semibold">{stat.title}</p>
                    <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight group-hover:text-yellow-400 transition-colors">
                      {stat.value}
                    </h3>
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <Icon size={24} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-900 text-xs">
                  <span className="font-medium text-yellow-500/90">{stat.change}</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. شبكة الوصول السريع لجميع الـ 16 وحدة إدارية */}
      <div>
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">جميع الوحدات والخدمات الإدارية (16 وحدة)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickModules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <Link
                key={idx}
                to={module.path}
                className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/70 hover:border-yellow-500/40 hover:bg-zinc-900 transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-yellow-500 group-hover:text-zinc-950 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-200 group-hover:text-yellow-400 transition-colors truncate">
                    {module.label}
                  </h4>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{module.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. الإجراءات والعمليات المعلقة + شريط أمان النظام */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمليات المعلقة */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <h3 className="font-bold text-sm text-white">آخر الأنشطة والمهام الإدارية</h3>
            </div>
            <span className="text-xs text-zinc-500">تحديث فوري</span>
          </div>

          <div className="space-y-3">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{action.title}</p>
                    <span className="text-[11px] text-zinc-500">{action.time}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-yellow-400 border border-zinc-700/60">
                  {action.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* كارت الأمان و RLS */}
        <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-emerald-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">حماية البيانات والصلاحيات</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              نظام الأمان وصلاحيات المشرفين (Admin RLS) مفعل. جميع العمليات الحساسة وتعديلات الأسعار والتوثيق مسجلة في سجل التدقيق المباشر.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs text-zinc-500">سجل التدقيق الأمني</span>
            <Link
              to="/admin/settings"
              className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition"
            >
              عرض السجلات <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
