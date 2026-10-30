import React, { useState } from 'react';
import { Wallet, Receipt, Percent } from 'lucide-react';
import { PaymentMethodsTab } from '../subscriptions/tabs/PaymentMethodsTab';
import { PaymentProofsTab } from './PaymentProofsTab';
import { CommissionRulesTab } from './CommissionRulesTab';

type TabType = 'methods' | 'proofs' | 'commissions';

export const PaymentsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('methods');

  const tabs = [
    { id: 'methods', label: 'طرق الدفع', icon: Wallet },
    { id: 'proofs', label: 'سندات الدفع', icon: Receipt },
    { id: 'commissions', label: 'قواعد العمولات', icon: Percent },
  ];

  return (
    <div className="min-h-screen bg-black text-white" dir="rtl">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-black mb-1">إدارة المدفوعات والمالية</h1>
        <p className="text-zinc-400 text-sm">إدارة المحافظ الإلكترونية، الحسابات البنكية، ومراجعة السندات</p>
      </div>

      {/* Tabs Navigation - Horizontal Scrollable */}
      <div
        className="flex gap-2 px-4 py-2 overflow-x-auto"
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

      {/* Content - Full Width */}
      <div className="w-full px-2 pb-4">
        <div className="bg-black border border-[#2A2B30] rounded-2xl p-2 w-full">
          {activeTab === 'methods' && <PaymentMethodsTab />}
          {activeTab === 'proofs' && <PaymentProofsTab />}
          {activeTab === 'commissions' && <CommissionRulesTab />}
        </div>
      </div>
    </div>
  );
};
