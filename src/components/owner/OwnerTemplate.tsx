'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  User, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { OwnerProfile, BusinessItem, ReviewItem } from '@/types/owner';
import { OwnerOverview } from './OwnerOverview';
import { OwnerBusinessCard } from './OwnerBusinessCard';
import { OwnerBusinessManagement } from './OwnerBusinessManagement';

interface OwnerTemplateProps {
  owner: OwnerProfile;
  businesses: BusinessItem[];
  reviewsMap?: Record<string, ReviewItem[]>;
  onSaveBusiness: (businessId: string, data: Partial<BusinessItem>) => Promise<boolean>;
  onRefresh?: () => void;
  addBusinessHref?: string;
  subscriptionHref?: string;
}

export const OwnerTemplate: React.FC<OwnerTemplateProps> = ({
  owner,
  businesses,
  reviewsMap = {},
  onSaveBusiness,
  onRefresh,
  addBusinessHref = '/businesses/new',
  subscriptionHref = '/subscriptions',
}) => {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);

  // إذا تم اختيار منشأة، نفتح شاشة الإدارة المصغرة
  if (selectedBusiness) {
    return (
      <div className="font-['Cairo'] min-h-screen bg-zinc-50" dir="rtl">
        <OwnerBusinessManagement
          business={selectedBusiness}
          reviews={reviewsMap[selectedBusiness.id] || []}
          onBack={() => setSelectedBusiness(null)}
          onSaveBusiness={async (updatedData) => {
            const ok = await onSaveBusiness(selectedBusiness.id, updatedData);
            if (ok) {
              setSelectedBusiness((prev) => (prev ? { ...prev, ...updatedData } : null));
            }
            return ok;
          }}
          onNavigateSubscription={() => {
            window.location.href = `${subscriptionHref}?businessId=${selectedBusiness.id}`;
          }}
        />
      </div>
    );
  }

  return (
    <div className="font-['Cairo'] min-h-screen bg-zinc-50 text-zinc-900 pb-20" dir="rtl">
      {/* 1. رأس الصفحة ومعلومات المالك */}
      <div className="bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {owner.avatar_url ? (
                <img
                  src={owner.avatar_url}
                  alt={owner.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  {owner.name ? owner.name.charAt(0) : <User className="w-6 h-6" />}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-900 leading-tight">
                    {owner.name || 'حساب المالك'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                    مالك منشأة
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {owner.email || owner.phone || 'لوحة تحكم وإدارة المنشآت الموحدة'}
                </p>
              </div>
            </div>

            {/* إجراءات سريعة في الهيدر */}
            <div className="flex items-center gap-2.5">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition"
                  title="تحديث البيانات"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              <Link
                href={subscriptionHref}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs sm:text-sm font-bold hover:bg-amber-100 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                الترويج والاشتراكات
              </Link>
              <Link
                href={addBusinessHref}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs sm:text-sm font-bold hover:bg-zinc-800 transition active:scale-95 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة منشأة جديدة
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2. ملخص سريع */}
        <OwnerOverview businesses={businesses} />

        {/* 3. قسم منشآتي */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900">منشآتي</h2>
              <p className="text-xs text-zinc-500">
                جميع المنشآت التابعة لحسابك في جميع التصنيفات
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-600 bg-white px-3 py-1.5 rounded-xl border border-zinc-200">
              {businesses.length} منشأة
            </span>
          </div>

          {/* قائمة المنشآت أو حالة الفراغ */}
          {businesses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-2">
                ليس لديك أي منشأة مسجلة حالياً
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mb-6 leading-relaxed">
                ابدأ بإضافة أول منشأة لك سواء كانت متجراً، شركة، مطعماً، فندقاً أو خدمة لتحصل على تقييمات الزوار وإدارتها من مكان واحد.
              </p>
              <Link
                href={addBusinessHref}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة منشأتك الأولى الآن
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {businesses.map((business) => (
                <OwnerBusinessCard
                  key={business.id}
                  business={business}
                  onManage={(b) => setSelectedBusiness(b)}
                  onPromote={() => {
                    window.location.href = `${subscriptionHref}?businessId=${business.id}`;
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
