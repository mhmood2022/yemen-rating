import React, { useState, useEffect } from 'react';
import { businessService } from '../services/businessService';
import { BusinessEntity } from '../types/database.types';
import { BusinessCard } from '../components/business/BusinessCard';
import { CategoryAdBanner } from '../components/ads/CategoryAdBanner';
import { ClaimOwnershipModal } from '../components/business/ClaimOwnershipModal';

interface Props {
  categorySlug: string;
  categoryTitle: string;
  categoryIcon: string;
  onNavigate: (path: string) => void;
}

export const CategoryCollectivePage: React.FC<Props> = ({
  categorySlug,
  categoryTitle,
  categoryIcon,
  onNavigate,
}) => {
  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimBusiness, setClaimBusiness] = useState<BusinessEntity | null>(null);

  const cities = [
    { id: 'all', label: 'جميع المحافظات' },
    { id: 'صنعاء', label: 'صنعاء' },
    { id: 'عدن', label: 'عدن' },
    { id: 'تعز', label: 'تعز' },
    { id: 'حضرموت', label: 'المكلا / حضرموت' },
    { id: 'إب', label: 'إب' },
    { id: 'الحديدة', label: 'الحديدة' },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await businessService.getBusinesses({
        city: selectedCity,
        search: searchQuery,
      });
      setBusinesses(data);
      setLoading(false);
    }
    loadData();
  }, [categorySlug, selectedCity, searchQuery]);

  // تقسيم المنشآت إلى المستويات الثلاثة الإلزامية
  const tier1Businesses = businesses.filter(b => b.tier_level === 1);
  const tier2Businesses = businesses.filter(b => b.tier_level === 2);
  const tier3Businesses = businesses.filter(b => b.tier_level === 3 || !b.tier_level);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E6E6E6] font-sans pb-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* ترويسة التصنيف وزر العودة */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center text-xl">
              <i className={`fa-solid ${categoryIcon}`}></i>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{categoryTitle}</h1>
              <p className="text-xs text-neutral-400 mt-0.5">الدليل المعتمد والتقييمات الحقيقية</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/')}
            className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span>الرئيسية</span>
          </button>
        </div>

        {/* المساحة الإعلانية الكبيرة العلوية */}
        <CategoryAdBanner categoryTitle={categoryTitle} categorySlug={categorySlug} />

        {/* شريط البحث وفلترة المحافظات */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 mb-8 space-y-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"></i>
            <input
              type="text"
              placeholder={`بحث داخل ${categoryTitle}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121217] border border-[#2A2A2A] rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCity === city.id
                    ? 'bg-[#FFC107] text-neutral-950 shadow-md'
                    : 'bg-[#121217] text-neutral-400 hover:text-white border border-[#2A2A2A]'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-neutral-500">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-amber-400 mb-2"></i>
            <p className="text-xs font-bold">جاري تحميل بيانات {categoryTitle}...</p>
          </div>
        ) : (
          <div className="space-y-10">

            {/* المستوى الأول: الجهات المميزة والموثقة (Tier 1) */}
            {tier1Businesses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-400/20">
                  <h2 className="text-base font-black text-amber-400 flex items-center gap-2">
                    <i className="fa-solid fa-crown text-amber-400 text-sm"></i>
                    <span>الجهات المميزة والموثقة (الأعلى تقييماً)</span>
                  </h2>
                  <span className="text-xs text-neutral-400 font-bold">{tier1Businesses.length} منشأة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tier1Businesses.map((biz) => (
                    <BusinessCard
                      key={biz.id}
                      business={biz}
                      onOpenProfile={(slug) => onNavigate(`/businesses/${slug}`)}
                      onClaimOwnership={(b) => setClaimBusiness(b)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* المستوى الثاني: الجهات الموثقة (Tier 2) */}
            {tier2Businesses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2A2A2A]">
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <i className="fa-solid fa-certificate text-blue-400 text-sm"></i>
                    <span>الجهات الموثقة والمعتمدة</span>
                  </h2>
                  <span className="text-xs text-neutral-400 font-bold">{tier2Businesses.length} منشأة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tier2Businesses.map((biz) => (
                    <BusinessCard
                      key={biz.id}
                      business={biz}
                      onOpenProfile={(slug) => onNavigate(`/businesses/${slug}`)}
                      onClaimOwnership={(b) => setClaimBusiness(b)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* المستوى الثالث: جميع الجهات (Tier 3) */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2A2A2A]">
                <h2 className="text-base font-black text-neutral-300 flex items-center gap-2">
                  <i className="fa-solid fa-layer-group text-neutral-400 text-sm"></i>
                  <span>جميع {categoryTitle} المسجلة في الدليل</span>
                </h2>
                <span className="text-xs text-neutral-400 font-bold">{tier3Businesses.length} منشأة</span>
              </div>

              {tier3Businesses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tier3Businesses.map((biz) => (
                    <BusinessCard
                      key={biz.id}
                      business={biz}
                      onOpenProfile={(slug) => onNavigate(`/businesses/${slug}`)}
                      onClaimOwnership={(b) => setClaimBusiness(b)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-neutral-500 bg-[#141418] rounded-2xl border border-[#222]">
                  <i className="fa-solid fa-folder-open text-2xl mb-2 text-neutral-600"></i>
                  <p className="text-xs">لا توجد منشآت إضافية مطابقة في هذا الفلتر</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* نافذة إثبات الملكية */}
      {claimBusiness && (
        <ClaimOwnershipModal
          businessId={claimBusiness.id}
          businessName={claimBusiness.name}
          isOpen={!!claimBusiness}
          onClose={() => setClaimBusiness(null)}
          onSuccess={() => {
            alert('تم إرسال طلب إثبات الملكية بنجاح وسيتم مراجعته من الإدارة.');
            setClaimBusiness(null);
          }}
        />
      )}
    </div>
  );
};
