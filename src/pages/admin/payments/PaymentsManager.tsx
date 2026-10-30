import React, { useState } from 'react';
import { Wallet, Receipt } from 'lucide-react';
import { PaymentMethodsTab } from '../subscriptions/tabs/PaymentMethodsTab';
import { PaymentProofsTab } from './PaymentProofsTab';

type TabType = 'methods' | 'proofs';

export const PaymentsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('methods');

  const tabs = [
    { id: 'methods', label: 'طرق الدفع (المحافظ والبنوك)', icon: Wallet },
    { id: 'proofs', label: 'سندات الدفع والاشتراكات', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-1">إدارة المدفوعات والمالية</h1>
          <p className="text-zinc-400 text-sm">إدارة المحافظ الإلكترونية، الحسابات البنكية، ومراجعة السندات</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-[#111] rounded-xl border border-[#2A2B30]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition ${
                  isActive ? 'bg-[#FFC500] text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-black border border-[#2A2B30] rounded-2xl p-4">
          {activeTab === 'methods' && <PaymentMethodsTab />}
          {activeTab === 'proofs' && <PaymentProofsTab />}
        </div>
      </div>
    </div>
  );
};
