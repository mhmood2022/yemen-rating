import React, { useState } from 'react';
import { BusinessItem } from '../../types/database.types';
import { BusinessTabs } from './BusinessTabs';
import { BusinessReviews } from './BusinessReviews';
import { MenuSection } from './sections/MenuSection';
import { CarDealerSection } from './sections/CarDealerSection';
import { RealEstateSection } from './sections/RealEstateSection';
import { WalletFeesSection } from './sections/WalletFeesSection';
import { OverviewSection } from './sections/OverviewSection';

interface Props {
  business: BusinessItem;
  onNavigate: (path: string) => void;
}

export const BusinessProfileEngine: React.FC<Props> = ({ business, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: 'fa-info-circle' },
    { id: 'services', label: 'الخدمات', icon: 'fa-list-check' },
    { id: 'photos', label: 'الصور', icon: 'fa-images' },
    { id: 'reviews', label: 'التقييمات', icon: 'fa-star' },
    { id: 'contact', label: 'اتصل بنا', icon: 'fa-phone' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection business={business} />;
      case 'services':
        return (
          <div className="p-4">
            <h3 className="text-lg font-black text-white mb-3">
              <i className="fa-solid fa-list-check text-[#FFC107] ml-2"></i>
              الخدمات المقدمة
            </h3>
            {(business.services || []).length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {(business.services || []).map((service: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-sm">
                    <i className="fa-solid fa-circle-check text-[#FFC107]"></i>
                    <span className="text-white">{service}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 text-sm">
                <i className="fa-solid fa-box-open text-4xl mb-2 block"></i>
                لا توجد خدمات مسجلة حالياً
              </div>
            )}
          </div>
        );
      case 'photos':
        return (
          <div className="p-4">
            <h3 className="text-lg font-black text-white mb-3">
              <i className="fa-solid fa-images text-[#FFC107] ml-2"></i>
              معرض الصور
            </h3>
            {(business.gallery_urls || []).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {(business.gallery_urls || []).map((url: string, idx: number) => (
                  <img key={idx} src={url} alt={`صورة ${idx + 1}`} className="w-full h-32 object-cover rounded-xl border border-[#2A2A2A]" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                {business.cover_url && (
                  <img src={business.cover_url} alt={business.name} className="w-full h-48 object-cover rounded-xl border border-[#2A2A2A]" />
                )}
                <p className="text-neutral-500 text-sm mt-4">لا توجد صور إضافية حالياً</p>
              </div>
            )}
          </div>
        );
      case 'reviews':
        return <BusinessReviews businessId={business.id} />;
      case 'contact':
        return (
          <div className="p-4 space-y-3">
            <h3 className="text-lg font-black text-white mb-3">
              <i className="fa-solid fa-phone text-[#FFC107] ml-2"></i>
              معلومات الاتصال
            </h3>
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 hover:border-[#FFC107] transition">
                <i className="fa-solid fa-phone text-[#FFC107]"></i>
                <span className="text-white text-sm">{business.phone}</span>
              </a>
            )}
            {business.whatsapp && (
              <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 hover:border-[#25D366] transition">
                <i className="fa-brands fa-whatsapp text-[#25D366]"></i>
                <span className="text-white text-sm">واتساب: {business.whatsapp}</span>
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 hover:border-[#FFC107] transition">
                <i className="fa-solid fa-envelope text-[#FFC107]"></i>
                <span className="text-white text-sm">{business.email}</span>
              </a>
            )}
            {business.website_url && (
              <a href={business.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 hover:border-[#FFC107] transition">
                <i className="fa-solid fa-globe text-[#FFC107]"></i>
                <span className="text-white text-sm truncate">{business.website_url}</span>
              </a>
            )}
            {business.district && (
              <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3">
                <i className="fa-solid fa-location-dot text-[#FFC107]"></i>
                <span className="text-white text-sm">{business.city} - {business.district}</span>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#121217] border-t border-[#20202A]">
      <BusinessTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pb-6">{renderContent()}</div>
    </div>
  );
};
