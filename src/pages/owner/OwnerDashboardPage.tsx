import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BusinessItem } from '../../types/business';
import { OwnerOffersManager } from '../../components/owner/OwnerOffersManager';
import { OwnerReviewsManager } from '../../components/owner/OwnerReviewsManager';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { yrToast } from '../../components/ui/Toast';
import {
  Store,
  Eye,
  Phone,
  MessageCircle,
  Star,
  Tag,
  MapPin,
  Clock,
  Layers,
  Wrench,
  Globe,
  Edit,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const OwnerDashboardPage: React.FC<{
  businessId?: string;
  onNavigate: (path: string) => void;
}> = ({ businessId = 't1', onNavigate }) => {
  const { businesses, updateBusiness } = useAdmin();
  const business = businesses.find((b) => b.id === businessId) || businesses[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'offers' | 'reviews'>('overview');
  
  // Operational Edit State
  const [phone, setPhone] = useState(business.phone || '');
  const [whatsapp, setWhatsapp] = useState(business.whatsapp || '');
  const [workingHours, setWorkingHours] = useState(business.workingHours || 'يومياً 08:00 ص - 11:30 م');
  const [address, setAddress] = useState(business.address || '');
  const [description, setDescription] = useState(business.description || '');

  const handleSaveOperationalData = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BusinessItem = {
      ...business,
      phone,
      whatsapp,
      workingHours,
      address,
      description,
    };
    updateBusiness(updated, 'تحديث البيانات التشغيلية وساعات العمل بواسطة المالك');
  };

  const navTabs = [
    { id: 'overview' as const, label: 'لوحة الأداء والزيارات', icon: Eye },
    { id: 'profile' as const, label: 'البيانات وساعات العمل', icon: Store },
    { id: 'offers' as const, label: 'العروض والخصومات', icon: Tag },
    { id: 'reviews' as const, label: 'التقييمات والردود', icon: MessageCircle },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-right">
      {/* Top Banner: Business Name + Verified Badge + Direct View Link */}
      <div className="p-4 sm:p-5 rounded-[14px] bg-[#111111] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-[12px] bg-black overflow-hidden shrink-0 border border-[#222222]">
            <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-[#F5C400]/15 text-[#F5C400]">
                لوحة إدارة النشاط (مالك معتمد)
              </span>
              {business.isVerified && (
                <VerifiedBadge variant={business.verifiedBadgeType || 'gold'} size={15} />
              )}
            </div>
            <h1 className="text-base sm:text-xl font-black text-white">{business.name}</h1>
            <p className="text-xs text-[#A1A1AA]">{business.category} · {business.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate(`/business/${business.id}`)}
            icon={<ExternalLink size={14} />}
            className="text-xs font-bold"
          >
            معاينة الملف العام للجمهور
          </Button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-[12px] bg-[#0A0A0A] border border-[#222222] overflow-x-auto no-scrollbar">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex-1 py-2 px-3 rounded-[9px] text-xs font-black flex items-center justify-center gap-1.5 whitespace-nowrap transition-all select-none',
                isActive
                  ? 'bg-[#F5C400] text-black shadow-md'
                  : 'text-[#A1A1AA] hover:bg-[#141414] hover:text-white'
              )}
            >
              <Icon size={14} strokeWidth={2} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Read-Only Authority Info Card (Score & Verification Protection) */}
          <div className="p-3.5 rounded-[12px] bg-[#F5C400]/10 border border-[#F5C400]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#F5C400] shrink-0" />
              <span className="text-[#A1A1AA]">
                شارات التوثيق ومؤشر الثقة YR Score تُمنح وتُدار حصرياً من قبل إدارة منصة يمن ريتغ لضمان النزاهة.
              </span>
            </div>
            <span className="font-black text-sm text-[#F5C400] shrink-0">{business.yrScore} / 100</span>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <Card className="p-3.5 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1">
              <span className="text-[10px] text-[#71717A] font-bold block">مشاهدات الملف (30 يوم)</span>
              <span className="text-xl font-black text-white block">{business.stats?.views30d?.toLocaleString() || '14,500'}</span>
              <span className="text-[9px] text-[#22C55E]">زيارات حقيقية</span>
            </Card>

            <Card className="p-3.5 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1">
              <span className="text-[10px] text-[#71717A] font-bold block">عمليات البحث الداخلي</span>
              <span className="text-xl font-black text-[#F5C400] block">{business.stats?.searches30d?.toLocaleString() || '5,400'}</span>
              <span className="text-[9px] text-[#A1A1AA]">ضمن دليل يمن ريتغ</span>
            </Card>

            <Card className="p-3.5 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1">
              <span className="text-[10px] text-[#71717A] font-bold block">متوسط تقييم العملاء</span>
              <span className="text-xl font-black text-[#22C55E] block">★ {business.rating.toFixed(1)}</span>
              <span className="text-[9px] text-[#A1A1AA]">{business.reviewCount} تقييم موثق</span>
            </Card>

            <Card className="p-3.5 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1">
              <span className="text-[10px] text-[#71717A] font-bold block">نقرات الاتصال والواتساب</span>
              <span className="text-xl font-black text-white block">+{business.stats?.views7d || '3,200'}</span>
              <span className="text-[9px] text-[#22C55E]">تواصل مباشر</span>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: OPERATIONAL PROFILE EDIT */}
      {activeTab === 'profile' && (
        <Card className="p-4 sm:p-5 bg-[#111111] border border-[#222222] rounded-[14px] space-y-4">
          <h3 className="font-black text-sm sm:text-base text-white pb-2 border-b border-[#1E1E1E]">
            تحديث البيانات التشغيلية ومعلومات الاتصال
          </h3>

          <form onSubmit={handleSaveOperationalData} className="space-y-3.5 text-right">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="رقم الهاتف المباشر للنشاط"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                rightIcon={<Phone size={15} />}
              />

              <Input
                label="رقم الواتساب الرسمي"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                rightIcon={<MessageCircle size={15} />}
              />
            </div>

            <Input
              label="ساعات وأيام العمل"
              placeholder="مثال: السبت إلى الخميس 08:00 ص - 11:00 م"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              rightIcon={<Clock size={15} />}
            />

            <Input
              label="العنوان التفصيلي وموقع المقر"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rightIcon={<MapPin size={15} />}
            />

            <div className="space-y-1">
              <label className="block text-xs font-bold text-white">النبذة والوصف التعريفي</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs bg-[#0A0A0A] text-white border border-[#222222] rounded-[10px] outline-none focus:border-[#F5C400]"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth className="font-bold text-xs h-[42px]">
              حفظ التعديلات ونشرها فوراً في ملفك العام
            </Button>
          </form>
        </Card>
      )}

      {/* Tab 3: OFFERS & DISCOUNTS */}
      {activeTab === 'offers' && <OwnerOffersManager businessId={business.id} />}

      {/* Tab 4: REVIEWS & OFFICIAL REPLIES */}
      {activeTab === 'reviews' && <OwnerReviewsManager business={business} />}
    </div>
  );
};
