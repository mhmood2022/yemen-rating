import React, { useState } from 'react';
import { BusinessItem } from '../../types/business';
import { OverviewSection } from './sections/OverviewSection';
import { WalletFeesSection } from './sections/WalletFeesSection';
import { MenuSection } from './sections/MenuSection';
import { RealEstateSection } from './sections/RealEstateSection';
import { CarDealerSection } from './sections/CarDealerSection';
import { Card } from '../ui/Card';
import { YrVerifiedBadge } from './YrVerifiedBadge';
import {
  Building2,
  Utensils,
  DollarSign,
  Coins,
  Wrench,
  MapPin,
  Star,
  Home,
  Car,
  Clock,
  Phone,
  Globe,
  Share2,
  Plus,
  User,
  CheckCircle2,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { yrToast } from '../ui/Toast';

export const BusinessProfileEngine: React.FC<{
  business: BusinessItem;
  onNavigate?: (path: string) => void;
}> = ({ business, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<string>('main');

  // بناء التبويبات ديناميكياً فقط عند توفر البيانات (قاعدة منع الأقسام الفارغة)
  const tabs = [
    { id: 'main', label: 'الرئيسية ونظرة عامة', icon: Building2 },
    ...(business.businessType === 'WALLET' && business.walletFees ? [{ id: 'fees', label: 'رسوم التحويل', icon: DollarSign }] : []),
    ...(business.businessType === 'RESTAURANT' && business.menuItems ? [{ id: 'menu', label: 'قائمة الطعام', icon: Utensils }] : []),
    ...(business.businessType === 'REAL_ESTATE' && business.realEstateListings ? [{ id: 'properties', label: 'العقارات المعروضة', icon: Home }] : []),
    ...(business.businessType === 'CAR_DEALER' && business.carListings ? [{ id: 'cars', label: 'السيارات المتاحة', icon: Car }] : []),
    ...(business.exchangeRates ? [{ id: 'exchange', label: 'أسعار الصرف', icon: Coins }] : []),
    ...(business.branches && business.branches.length > 0 ? [{ id: 'branches', label: 'الفروع', icon: MapPin }] : []),
    { id: 'reviews', label: 'التقييمات', icon: Star },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Dynamic Tab Strip */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] dark:border-[#222222] pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] text-xs font-black transition-all whitespace-nowrap select-none',
                isActive
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-black shadow-sm'
                  : 'text-[#64748B] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414] hover:text-[#0B1F3A] dark:hover:text-white'
              )}
            >
              <Icon size={14} strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2-Column Responsive Layout: Content on Right + Sticky Sidebar on Left (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Column (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Overview Tab */}
          {activeTab === 'main' && (
            <div className="space-y-5">
              <OverviewSection business={business} />

              {/* Exchange Rates if Bank */}
              {business.exchangeRates && (
                <Card className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
                    <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#F5C400] font-black text-xs sm:text-sm">
                      <Coins size={16} strokeWidth={2} />
                      <span>أسعار الصرف المعتمدة لدى {business.name}</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] dark:text-[#71717A]">سوق صنعاء</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {business.exchangeRates.map((r, idx) => (
                      <div key={idx} className="p-2.5 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#1E1E1E] flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0B1F3A] dark:text-white">{r.currency}</span>
                        <div className="text-left font-black">
                          <span className="text-[#16A34A] dark:text-[#22C55E] block">{r.buy.toLocaleString()} شراء</span>
                          <span className="text-[#0B1F3A] dark:text-white block">{r.sell.toLocaleString()} بيع</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('/prices')}
                    className="w-full py-2 rounded-[9px] border border-[#E2E8F0] dark:border-[#222222] bg-[#F7F8FA] dark:bg-[#141414] text-[#0B1F3A] dark:text-[#F5C400] text-xs font-bold flex items-center justify-center gap-1.5 hover:border-[#F5C400]/50 transition-colors"
                  >
                    <ArrowLeftRight size={13} strokeWidth={2} />
                    <span>مقارنة الأسعار مع السوق العام</span>
                  </button>
                </Card>
              )}

              {/* Wallet Section if Wallet */}
              {business.businessType === 'WALLET' && (
                <WalletFeesSection business={business} />
              )}

              {/* Menu Section if Restaurant */}
              {business.businessType === 'RESTAURANT' && (
                <MenuSection business={business} />
              )}

              {/* Real Estate Section if Real Estate */}
              {business.businessType === 'REAL_ESTATE' && (
                <RealEstateSection business={business} />
              )}

              {/* Car Dealer Section if Cars */}
              {business.businessType === 'CAR_DEALER' && (
                <CarDealerSection business={business} />
              )}
            </div>
          )}

          {/* Specialized Standalone Tabs */}
          {activeTab === 'fees' && <WalletFeesSection business={business} />}
          {activeTab === 'menu' && <MenuSection business={business} />}
          {activeTab === 'properties' && <RealEstateSection business={business} />}
          {activeTab === 'cars' && <CarDealerSection business={business} />}

          {/* Branches Section */}
          {activeTab === 'branches' && business.branches && (
            <Card className="p-4 sm:p-5 space-y-3">
              <h3 className="font-black text-xs sm:text-sm text-[#0B1F3A] dark:text-white pb-2 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
                شبكة الفروع المعتمدة
              </h3>
              <div className="space-y-2">
                {business.branches.map((b, idx) => (
                  <div key={idx} className="p-3 rounded-[9px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#1E1E1E] text-xs flex items-start gap-2">
                    <span className="font-extrabold text-[#F5C400] shrink-0">{b.city}:</span>
                    <span className="text-[#475569] dark:text-[#A1A1AA] leading-relaxed">{b.address}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Reviews Section */}
          {(activeTab === 'reviews' || activeTab === 'main') && (
            <Card className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-[#0B1F3A] dark:text-white">
                  <Star size={16} className="text-[#F5C400] fill-[#F5C400]" />
                  <span>تقييمات وآراء العملاء</span>
                </div>
                <span className="text-xs font-black text-[#F5C400]">
                  {business.rating.toFixed(1)} / 5 ({business.reviewCount} تقييم)
                </span>
              </div>

              {business.reviews && business.reviews.length > 0 ? (
                <div className="space-y-2.5">
                  {business.reviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-[10px] bg-[#F7F8FA] dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#1E1E1E] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0B1F3A] dark:text-white">{rev.authorName}</span>
                        <span className="text-[10px] text-[#94A3B8] dark:text-[#71717A]">{rev.date}</span>
                      </div>
                      <p className="text-xs text-[#475569] dark:text-[#A1A1AA]">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] text-center py-3">لا توجد تقييمات مسجلة حتى الآن.</p>
              )}

              <button
                type="button"
                onClick={() => yrToast.info('تم فتح نموذج إضافة التقييم')}
                className="w-full py-2.5 rounded-[10px] bg-[#F5C400] text-black font-black text-xs flex items-center justify-center gap-1.5 hover:bg-[#DDAF00] active:scale-95 transition-all shadow-sm"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>إضافة تقييمك وتجربتك</span>
              </button>
            </Card>
          )}
        </div>

        {/* Sidebar Info Column (4 cols on desktop - Desktop Sticky Panel) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          {/* Verified Guarantee Card */}
          <Card className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#A1A1AA]">حالة التوثيق</span>
              {business.isVerified ? (
                <YrVerifiedBadge text={business.verifiedBadgeText || 'موثّق ✓'} size="sm" />
              ) : (
                <span className="text-xs font-bold text-[#94A3B8]">غير موثق</span>
              )}
            </div>

            <div className="p-3 rounded-[9px] bg-[#F7F8FA] dark:bg-[#070707] border border-[#E2E8F0] dark:border-[#1C1C1C] flex items-center justify-between text-xs">
              <span className="text-[#64748B] dark:text-[#A1A1AA]">مؤشر الثقة YR:</span>
              <span className="font-black text-sm text-[#F5C400]">{business.yrScore} / 100</span>
            </div>
          </Card>

          {/* Contact Details Card */}
          <Card className="p-4 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-2.5 text-xs">
            <h4 className="font-bold text-[#0B1F3A] dark:text-white pb-1.5 border-b border-[#F1F5F9] dark:border-[#1E1E1E]">
              معلومات التواصل وساعات العمل
            </h4>

            {business.phone && (
              <div className="flex items-center justify-between text-[#475569] dark:text-[#A1A1AA]">
                <span className="flex items-center gap-1.5"><Phone size={13} className="text-[#F5C400]" /> الهاتف:</span>
                <span dir="ltr" className="font-bold text-[#0B1F3A] dark:text-white">{business.phone}</span>
              </div>
            )}

            {business.workingHours && (
              <div className="flex items-center justify-between text-[#475569] dark:text-[#A1A1AA]">
                <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#F5C400]" /> ساعات العمل:</span>
                <span className="font-bold text-[#0B1F3A] dark:text-white">{business.workingHours}</span>
              </div>
            )}

            {business.website && (
              <div className="flex items-center justify-between text-[#475569] dark:text-[#A1A1AA]">
                <span className="flex items-center gap-1.5"><Globe size={13} className="text-[#F5C400]" /> الموقع:</span>
                <a href={business.website} target="_blank" rel="noreferrer" className="text-[#F5C400] font-bold hover:underline">زيارة الرابط</a>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
