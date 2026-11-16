import React, { useState } from 'react';
import { CreditCard, Package, Users, Building2, Megaphone, Wallet } from 'lucide-react';
import { PendingRequestsTab } from './tabs/PendingRequestsTab';
import { PlansManagerTab } from './tabs/PlansManagerTab';
import { ActiveSubscribersTab } from './tabs/ActiveSubscribersTab';
import { BusinessVerificationTab } from './tabs/BusinessVerificationTab';
import { AdsManagerTab } from './tabs/AdsManagerTab';
import { PaymentMethodsTab } from './tabs/PaymentMethodsTab';

type TabType = 'requests' | 'plans' | 'subscribers' | 'businesses' | 'ads' | 'payments';

export const SubscriptionsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('requests');

  const tabs = [
    { id: 'requests', label: 'طلبات الاشتراك', icon: CreditCard },
    { id: 'plans', label: 'إدارة الباقات', icon: Package },
    { id: 'subscribers', label: 'المشتركون', icon: Users },
    { id: 'businesses', label: 'توثيق المنشآت', icon: Building2 },
    { id: 'ads', label: 'الإعلانات', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-1">إدارة التوثيق والاشتراكات</h1>
          <p className="text-zinc-400 text-sm">إدارة باقات التوثيق، الطلبات، والمشتركين</p>
        </div>

        {/* Tabs Navigation - Horizontal Scrollable */}
        <div 
          className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap shrink-0 ${
                  isActive 
                    ? 'bg-[#FFC500] text-black shadow-lg' 
                    : 'bg-black text-zinc-400 hover:text-white border border-[#2A2B30]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-black border border-[#2A2B30] rounded-2xl p-4">
          {activeTab === 'requests' && <PendingRequestsTab />}
          {activeTab === 'plans' && <PlansManagerTab />}
          {activeTab === 'subscribers' && <ActiveSubscribersTab />}
          {activeTab === 'businesses' && <BusinessVerificationTab />}
          {activeTab === 'ads' && <AdsManagerTab />}
          {activeTab === 'payments' && <PaymentMethodsTab />}
        </div>
      </div>
    </div>
  );
};
