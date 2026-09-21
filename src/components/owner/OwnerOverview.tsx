import React from 'react';
import { Building2, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { BusinessItem } from '@/types/owner';

interface OwnerOverviewProps {
  businesses: BusinessItem[];
}

export const OwnerOverview: React.FC<OwnerOverviewProps> = ({ businesses }) => {
  const total = businesses.length;
  const activeCount = businesses.filter((b) => b.status === 'active').length;
  const featuredCount = businesses.filter((b) => b.is_featured).length;
  const subscribedCount = businesses.filter((b) => b.subscription_status === 'active').length;

  const stats = [
    {
      label: 'إجمالي منشآتي',
      value: total,
      icon: Building2,
      textColor: 'text-zinc-900',
      bgColor: 'bg-zinc-100',
    },
    {
      label: 'المنشآت النشطة',
      value: activeCount,
      icon: CheckCircle2,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'المنشآت المميزة',
      value: featuredCount,
      icon: Sparkles,
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'الاشتراكات الفعالة',
      value: subscribedCount,
      icon: ShieldCheck,
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="font-['Cairo'] grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-black ${stat.textColor}`}>
                {stat.value.toLocaleString('ar-YE')}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
              <IconComponent className={`w-5 h-5 ${stat.textColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
