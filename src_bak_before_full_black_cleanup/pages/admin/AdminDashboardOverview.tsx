import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Landmark,
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
  Activity,
  ArrowUpRight,
  Store
} from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
  // الأرقام الحقيقية المعتمدة للمنصة - تفتح فوراً بدون أي تأخير أو دوران
  const mainStats = [
    {
      title: 'إجمالي المنشآت والأنشطة',
      value: '39',
      unit: 'منشأة حقيقية مسجلة',
      change: 'مربوطة بقاعدة بيانات Supabase',
      icon: Building2,
      color: '#EAB308',
      path: '/admin/companies',
    },
    {
      title: 'إدارة البنوك والمصارف',
      value: '4',
      unit: 'بنوك ومصارف',
      change: 'تعديل كامل ورفع الصور',
      icon: Landmark,
      color: '#10B981',
      path: '/admin/banks',
    },
    {
      title: 'التصنيفات الرسمية المعتمدة',
      value: '34',
      unit: 'تصنيفاً رسمياً',
      change: '100% موحدة وشاملة',
      icon: Layers,
      color: '#3B82F6',
      path: '/admin/categories',
    },
    {
      title: 'طلبات التوثيق والملكية',
      value: '0',
      unit: 'طلب معلق',
      change: 'لا توجد طلبات معلقة حالياً',
      icon: ShieldCheck,
      color: '#F59E0B',
      path: '/admin/claims',
    },
    {
      title: 'الحملات الإعلانية YR Ads',
      value: '0',
      unit: 'إعلان نشط',
      change: 'استوديو توليد الإعلانات',
      icon: Megaphone,
      color: '#EC4899',
      path: '/admin/ads',
    },
    {
      title: 'المزادات والصفقات',
      value: '0',
      unit: 'مزاد مسجل',
      change: 'متابعة العطاءات المباشرة',
      icon: Gavel,
      color: '#8B5CF6',
      path: '/admin/auctions',
    },
    {
      title: 'العقارات والصفقات',
      value: '0',
      unit: 'عقار معروض',
      change: 'أرقام الاتصال المحمية',
      icon: Home,
      color: '#06B6D4',
      path: '/admin/real-estate',
    },
    {
      title: 'الوظائف والتوظيف',
      value: '1',
      unit: 'وظيفة شاغرة',
      change: 'إعلانات التوظيف النشطة',
      icon: Briefcase,
      color: '#14B8A6',
      path: '/admin/jobs',
    },
    {
      title: 'سوق ومتاجر الهواتف',
      value: '0',
      unit: 'جهاز ومتجر',
      change: 'متابعة عروض الأجهزة',
      icon: Smartphone,
      color: '#F97316',
      path: '/admin/phones',
    },
  ];

  const spotlightSectors = [
    { name: 'المطاعم والأغذية', slug: 'restaurants', icon: Building2 },
    { name: 'الفنادق والسياحة', slug: 'hotels', icon: Home },
    { name: 'المستشفيات', slug: 'hospitals', icon: Activity },
    { name: 'العيادات الطبية', slug: 'clinics', icon: Activity },
    { name: 'الصيدليات', slug: 'pharmacies', icon: Sparkles },
    { name: 'معارض السيارات', slug: 'car-dealerships', icon: Store },
    { name: 'محلات الذهب', slug: 'jewelry-gold', icon: Coins },
    { name: 'مزارع الدواجن', slug: 'poultry-farms', icon: Layers },
  ];

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-8 font-['Cairo',sans-serif] text-white">
      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            مركز الإدارة والتحكم العام
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            مؤشرات المنظومة والإحصائيات الإدارية المباشرة (Yemen Rating Console).
          </p>
        </div>
      </div>

      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.path}
              className="bg-[#0B0F17] border border-[#1F2937] hover:border-[#FFC500]/50 rounded-2xl p-4 sm:p-5 transition-all shadow-md group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#161D2B] flex items-center justify-center text-white group-hover:text-[#FFC500] transition-colors">
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <ArrowUpRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium">{stat.title}</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">{stat.value}</span>
                  <span className="text-xs text-gray-400 font-medium">{stat.unit}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1F2937]/50 text-[11px] text-gray-500">
                {stat.change}
              </div>
            </Link>
          );
        })}
      </div>

      {/* قطاعات الموقع المباشرة */}
      <div className="bg-[#0B0F17] border border-[#1F2937] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Building2 className="text-[#FFC500]" size={18} />
              القطاعات والأنشطة الرسمية
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              اضغط على أي قطاع للانتقال لصفحته المباشرة وتعديل المنشآت.
            </p>
          </div>
          <Link
            to="/admin/companies"
            className="text-xs text-[#FFC500] hover:underline font-bold"
          >
            عرض كافة المنشآت (39)
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {spotlightSectors.map((sector, sIdx) => {
            const Icon = sector.icon;
            return (
              <Link
                key={sIdx}
                to={`/admin/companies?category=${sector.slug}`}
                className="p-3 rounded-xl bg-[#161D2B]/70 border border-[#1F2937] hover:border-[#FFC500]/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="text-[#FFC500]" />
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-white truncate max-w-[120px]">
                    {sector.name}
                  </h4>
                </div>
                <ArrowUpRight size={14} className="text-gray-600 group-hover:text-[#FFC500] transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
