import React, { useState } from 'react';
import { Inbox, ClipboardList, Archive, Settings, DollarSign, Menu } from 'lucide-react';
import { InboxTab } from './tabs/InboxTab';
import { RequestDetailsSheet } from './components/RequestDetailsSheet';
import type { AdminRequest } from './types';

type TabType = 'inbox' | 'all' | 'finance' | 'archive' | 'settings';

export const OperationsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);

  const tabs = [
    { id: 'inbox', label: 'صندوق الوارد', icon: Inbox },
    { id: 'all', label: 'كل الطلبات', icon: ClipboardList },
    { id: 'finance', label: 'المالية', icon: DollarSign },
    { id: 'archive', label: 'الأرشيف', icon: Archive },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" dir="rtl">
      {/* Header الاحترافي */}
      <div className="sticky top-0 z-20 bg-black border-b border-[#2A2B30]">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-xl font-bold">مركز العمليات والإدارة</h1>
              <p className="text-xs text-zinc-400 mt-0.5">إدارة جميع الطلبات والبلاغات والمعاملات من مكان واحد</p>
            </div>
          </div>
        </div>

        {/* Tabs الأفقية */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabType)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition active:opacity-70"
                style={{
                  background: isActive ? '#FFC500' : '#111',
                  color: isActive ? '#000' : '#9CA3AF',
                  border: isActive ? '1px solid #FFC500' : '1px solid #2A2B30',
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* المحتوى */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'inbox' && (
          <div className="h-full">
            <InboxTab onRequestClick={(r) => setSelectedRequest(r)} />
          </div>
        )}

        {activeTab !== 'inbox' && (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-sm">تبويب "{tabs.find(t => t.id === activeTab)?.label}" قيد التطوير</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet لتفاصيل الطلب */}
      {selectedRequest && (
        <RequestDetailsSheet
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};
