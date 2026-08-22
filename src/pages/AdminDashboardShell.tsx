import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { AdminAdsView } from './admin/AdminAdsView';
import { AdminAuditLogsView } from './admin/AdminAuditLogsView';
import { PriceEditorModal } from '../components/admin/PriceEditorModal';
import { VerificationManagerModal } from '../components/admin/VerificationManagerModal';
import { Card } from '../components/ui/Card';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { Button } from '../components/ui/Button';
import { CurrencyPriceItem } from '../types/prices';
import { BusinessItem } from '../types/business';
import {
  LayoutDashboard,
  Building2,
  Coins,
  Megaphone,
  Briefcase,
  Activity,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminDashboardShell: React.FC = () => {
  const {
    businesses,
    currencies,
    jobs,
    ads,
    users,
    updateCurrencyPrice,
    changeBadge,
    deleteBusiness,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'businesses' | 'prices' | 'ads' | 'jobs' | 'audit' | 'users'
  >('overview');

  const [editingPrice, setEditingPrice] = useState<CurrencyPriceItem | null>(null);
  const [verifyingBiz, setVerifyingBiz] = useState<BusinessItem | null>(null);

  const navTabs = [
    { id: 'overview' as const, label: 'لوحة المؤشرات', icon: LayoutDashboard },
    { id: 'businesses' as const, label: `الأنشطة (${businesses.length})`, icon: Building2 },
    { id: 'prices' as const, label: 'أسعار الصرف والذهب', icon: Coins },
    { id: 'ads' as const, label: `إعلانات YR Ads (${ads.length})`, icon: Megaphone },
    { id: 'jobs' as const, label: `الوظائف (${jobs.length})`, icon: Briefcase },
    { id: 'audit' as const, label: 'سجل العمليات', icon: Activity },
  ];

  return (
    <div className="space-y-6 text-right">
      {/* Admin Module Navigation Tabs using UI Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-[#222222]">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              icon={<Icon size={15} strokeWidth={2} />}
              className="text-xs font-black whitespace-nowrap"
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* 1. OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <Card className="p-4 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1">
              <span className="text-[11px] text-[#A1A1AA] font-bold block">إجمالي الأنشطة المعتمدة</span>
              <span className="text-xl font-black text-white block">{businesses.length}</span>
              <span className="text-[10px] text-[#22C55E] block">+12 هذا الشهر</span>
            </Card>

            <Card className="p-4 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1">
              <span className="text-[11px] text-[#A1A1AA] font-bold block">الحملات الإعلانية النشطة</span>
              <span className="text-xl font-black text-[#F5C400] block">{ads.filter((a) => a.status === 'published').length}</span>
              <span className="text-[10px] text-[#A1A1AA] block">{ads.length} إجمالي الإعلانات</span>
            </Card>

            <Card className="p-4 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1">
              <span className="text-[11px] text-[#A1A1AA] font-bold block">الشواغر الوظيفية المتاحة</span>
              <span className="text-xl font-black text-white block">{jobs.length}</span>
              <span className="text-[10px] text-[#22C55E] block">مطابقة ذكية AI</span>
            </Card>

            <Card className="p-4 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1">
              <span className="text-[11px] text-[#A1A1AA] font-bold block">المشرفون والمسؤولون</span>
              <span className="text-xl font-black text-white block">{users.length}</span>
              <span className="text-[10px] text-[#22C55E] block">جلسات نشطة</span>
            </Card>
          </div>

          {/* Quick Price Update Strip */}
          <Card className="p-5 bg-[#111111] border border-[#222222] rounded-[14px] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Coins size={16} className="text-[#F5C400]" />
                <span>التحديث السريع لأسعار الصرف (صنعاء وعدن)</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('prices')}
                className="text-xs text-[#F5C400] font-bold"
              >
                إدارة الأسعار الكاملة
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currencies.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-[10px] bg-[#0A0A0A] border border-[#1E1E1E] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-white block">{c.currencyName}</span>
                    <span className="text-[10px] text-[#71717A]">{c.market === 'sanaa' ? 'سوق صنعاء' : 'سوق عدن'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[#22C55E]">{c.buyPrice} / {c.sellPrice}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPrice(c)}
                      icon={<Edit size={13} />}
                      className="h-8 px-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 2. BUSINESSES MANAGEMENT */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-white">إدارة وتوثيق الأنشطة</h3>
            <span className="text-xs text-[#A1A1AA]">{businesses.length} نشاط مسجل</span>
          </div>

          <div className="space-y-2.5">
            {businesses.map((biz) => (
              <Card
                key={biz.id}
                className="p-3.5 bg-[#111111] border border-[#222222] rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-[8px] bg-black overflow-hidden shrink-0">
                    <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-xs sm:text-sm text-white truncate">{biz.name}</h4>
                      {biz.isVerified && (
                        <VerifiedBadge variant={biz.verifiedBadgeType || 'gold'} size={14} />
                      )}
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] truncate">{biz.category} · {biz.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVerifyingBiz(biz)}
                    className="text-xs text-[#F5C400] font-bold"
                  >
                    إدارة الشارة
                  </Button>

                  <a
                    href={`/business/${biz.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink size={14} />}
                      title="معاينة الصفحة"
                      className="h-8 px-2.5"
                    />
                  </a>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteBusiness(biz.id)}
                    icon={<Trash2 size={14} />}
                    title="حذف النشاط"
                    className="h-8 px-2.5"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. PRICES MANAGEMENT */}
      {activeTab === 'prices' && (
        <div className="space-y-4">
          <h3 className="font-black text-base text-white">تحديث وإدارة أسعار الصرف</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currencies.map((c) => (
              <Card key={c.id} className="p-4 bg-[#111111] border border-[#222222] rounded-[12px] flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-white">{c.currencyName}</h4>
                  <span className="text-xs text-[#F5C400] font-bold">{c.market === 'sanaa' ? 'سوق صنعاء' : 'سوق عدن'}</span>
                  <span className="text-[10px] text-[#71717A] block mt-1">آخر تحديث: {c.lastUpdated}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-xs font-black text-[#22C55E] block">شراء: {c.buyPrice}</span>
                    <span className="text-xs font-black text-white block">بيع: {c.sellPrice}</span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingPrice(c)}
                    className="font-bold"
                  >
                    تعديل السعر
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. YR ADS CONTROL CENTER */}
      {activeTab === 'ads' && <AdminAdsView />}

      {/* 5. AUDIT LOGS */}
      {activeTab === 'audit' && <AdminAuditLogsView />}

      {/* Modals */}
      <PriceEditorModal
        item={editingPrice}
        isOpen={Boolean(editingPrice)}
        onClose={() => setEditingPrice(null)}
        onSave={updateCurrencyPrice}
      />

      <VerificationManagerModal
        business={verifyingBiz}
        isOpen={Boolean(verifyingBiz)}
        onClose={() => setVerifyingBiz(null)}
        onSave={changeBadge}
      />
    </div>
  );
};
