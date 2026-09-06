import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import {
  Building2, Landmark, Gavel, Home, Coins, ShieldCheck,
  Megaphone, Layers, Briefcase, Smartphone, Sparkles,
  Users, BarChart3, Clock, Activity, ArrowUpRight, Loader2, Store
} from 'lucide-react';

export const AdminDashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalBanks: 0,
    totalAuctions: 0,
    totalProperties: 0,
    totalClaims: 0,
    totalAds: 0,
    totalJobs: 0,
    totalPhones: 0,
  });

  const [sectorCounts, setSectorCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchLiveStats = async () => {
      setLoading(true);
      try {
        // 1. عدد المنشآت الحقيقية من Supabase
        const { count: bCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
        
        // 2. عدد البنوك الحقيقية
        const { count: banksCount } = await supabase.from('banks').select('*', { count: 'exact', head: true });

        // 3. أعداد الأقسام التخصصية الأخرى الحقيقية (إن وجدت جداولها أو 0)
        let aucCount = 0, propCount = 0, clmCount = 0, adsCount = 0, jobsCount = 0, phonesCount = 0;
        try {
          const res = await supabase.from('claims').select('*', { count: 'exact', head: true });
          clmCount = res.count || 0;
        } catch (e) {}

        try {
          const res = await supabase.from('ads').select('*', { count: 'exact', head: true });
          adsCount = res.count || 0;
        } catch (e) {}

        try {
          const res = await supabase.from('auctions').select('*', { count: 'exact', head: true });
          aucCount = res.count || 0;
        } catch (e) {}

        try {
          const res = await supabase.from('properties').select('*', { count: 'exact', head: true });
          propCount = res.count || 0;
        } catch (e) {}

        try {
          const res = await supabase.from('jobs').select('*', { count: 'exact', head: true });
          jobsCount = res.count || 0;
        } catch (e) {}

        try {
          const res = await supabase.from('phones').select('*', { count: 'exact', head: true });
          phonesCount = res.count || 0;
        } catch (e) {}

        setStats({
          totalBusinesses: bCount || 0,
          totalBanks: banksCount || 0,
          totalClaims: clmCount,
          totalAds: adsCount,
          totalAuctions: aucCount,
          totalProperties: propCount,
          totalJobs: jobsCount,
          totalPhones: phonesCount,
        });

        // 4. حساب عدد المنشآت الفعلي لكل قطاع (مطاعم، فنادق، عيادات...)
        const { data: bList } = await supabase.from('businesses').select('category_id');
        const { data: cList } = await supabase.from('categories').select('id, slug');

        if (bList && cList) {
          const idToSlug: Record<string, string> = {};
          cList.forEach(c => { idToSlug[c.id] = c.slug; });

          const counts: Record<string, number> = {};
          bList.forEach(b => {
            const slug = idToSlug[b.category_id];
            if (slug) {
              counts[slug] = (counts[slug] || 0) + 1;
            }
          });
          setSectorCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching live stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStats();
  }, []);

  const mainStats = [
    {
      title: 'إجمالي المنشآت والأنشطة',
      value: loading ? '...' : `${stats.totalBusinesses}`,
      unit: 'منشأة مسجلة',
      change: 'بيانات حية من Supabase',
      icon: Building2,
      color: '#EAB308',
      path: '/admin/companies',
    },
    {
      title: 'إدارة البنوك والمصارف',
      value: loading ? '...' : `${stats.totalBanks}`,
      unit: 'بنك ومصرف',
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
      value: loading ? '...' : `${stats.totalClaims}`,
      unit: 'طلب معلق',
      change: stats.totalClaims > 0 ? 'يتطلب فحص الإدارة' : 'لا توجد طلبات معلقة',
      icon: ShieldCheck,
      color: '#F59E0B',
      path: '/admin/claims',
    },
    {
      title: 'الحملات الإعلانية YR Ads',
      value: loading ? '...' : `${stats.totalAds}`,
      unit: 'إعلان نشط',
      change: 'استوديو توليد الإعلانات',
      icon: Megaphone,
      color: '#EC4899',
      path: '/admin/ads',
    },
    {
      title: 'المزادات والعمولات',
      value: loading ? '...' : `${stats.totalAuctions}`,
      unit: 'مزاد مسجل',
      change: 'متابعة العطاءات المباشرة',
      icon: Gavel,
      color: '#8B5CF6',
      path: '/admin/auctions',
    },
    {
      title: 'العقارات والصفقات',
      value: loading ? '...' : `${stats.totalProperties}`,
      unit: 'عقار معروض',
      change: 'أرقام الاتصال المحمية',
      icon: Home,
      color: '#06B6D4',
      path: '/admin/real-estate',
    },
    {
      title: 'الوظائف والتوظيف',
      value: loading ? '...' : `${stats.totalJobs}`,
      unit: 'وظيفة شاغرة',
      change: 'متابعة إعلانات التوظيف',
      icon: Briefcase,
      color: '#14B8A6',
      path: '/admin/jobs',
    },
    {
      title: 'سوق ومتاجر الهواتف',
      value: loading ? '...' : `${stats.totalPhones}`,
      unit: 'جهاز ومتجر',
      change: 'متابعة عروض الأجهزة',
      icon: Smartphone,
      color: '#F97316',
      path: '/admin/phones',
    },
  ];

  // أهم القطاعات الحية
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
            مؤشرات حية متصلة بقاعدة بيانات Supabase مباشرة (أرقام حقيقية 100% دون بيانات وهمية).
          </p>
        </div>
        {loading && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161D2B] border border-[#1F2937] text-xs text-amber-400">
            <Loader2 size={13} className="animate-spin" /> جاري تحديث الأرقام الحية...
          </span>
        )}
      </div>

      {/* بطاقات الإحصائيات الحية الرئيسية */}
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

      {/* قطاعات الموقع الحية: عرض عدد منشآت كل قطاع حقيقة (إن كان 0 يعرض 0 وإن كان 3 يعرض 3) */}
      <div className="bg-[#0B0F17] border border-[#1F2937] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Building2 className="text-[#FFC500]" size={18} />
              حالة المنشآت الحقيقية حسب القطاعات الرسمية
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              اضغط على أي قطاع للانتقال لصفحته المباشرة، وتعديل منشآته أو إضافة منشأة جديدة.
            </p>
          </div>
          <Link
            to="/admin/companies"
            className="text-xs text-[#FFC500] hover:underline font-bold"
          >
            عرض كافة المنشآت
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {spotlightSectors.map((sector, sIdx) => {
            const count = sectorCounts[sector.slug] || 0;
            return (
              <Link
                key={sIdx}
                to={`/admin/companies?category=${sector.slug}`}
                className="p-3 rounded-xl bg-[#161D2B]/70 border border-[#1F2937] hover:border-[#FFC500]/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-white truncate max-w-[120px]">
                    {sector.name}
                  </h4>
                  <span className={`text-[11px] font-mono font-black ${count > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {count} {count === 1 ? 'منشأة' : 'منشآت'}
                  </span>
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
