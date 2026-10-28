import React, { useMemo, useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { ToastProvider } from '../shared/Toast';
import { MobileReportsTab } from './tabs/MobileReportsTab';
import { MobilePostsTab } from './tabs/MobilePostsTab';
import { MobileUsersTab } from './tabs/MobileUsersTab';
import { MobileStorageTab } from './tabs/MobileStorageTab';
import { MobileLogsTab } from './tabs/MobileLogsTab';
import type { CommunityTab } from '../shared/types';

interface Props {
  reportsCount?: number;
}

const TAB_TITLES: Record<CommunityTab, { title: string; subtitle: string }> = {
  reports: { title: 'ادارة البلاغات', subtitle: 'مراجعة البلاغات ومعالجتها' },
  posts: { title: 'ادارة التغريدات', subtitle: 'استعراض وادارة المحتوى' },
  users: { title: 'ادارة المستخدمين', subtitle: 'المغردون والتوثيق' },
  storage: { title: 'مراقبة التخزين', subtitle: 'استهلاك Supabase' },
  logs: { title: 'سجل الاجراءات', subtitle: 'كل اجراء اداري' },
};

export const MobileCommunityView: React.FC<Props> = ({ reportsCount = 0 }) => {
  const [activeTab, setActiveTab] = useState<CommunityTab>('reports');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const meta = useMemo(() => TAB_TITLES[activeTab], [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <ToastProvider>
      <div
        className="min-h-screen pb-20"
        dir="rtl"
        style={{ background: 'var(--yr-bg-black)', color: 'var(--yr-text-primary)' }}
      >
        <MobileHeader
          title={meta.title}
          subtitle={meta.subtitle}
          searchValue={search}
          onSearchChange={setSearch}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showSearch={activeTab !== 'storage' && activeTab !== 'logs'}
        />

        <main className="px-4 py-4">
          {activeTab === 'reports' && <MobileReportsTab searchQuery={search} />}
          {activeTab === 'posts' && <MobilePostsTab searchQuery={search} />}
          {activeTab === 'users' && <MobileUsersTab searchQuery={search} />}
          {activeTab === 'storage' && <MobileStorageTab />}
          {activeTab === 'logs' && <MobileLogsTab />}
        </main>

        <MobileBottomNav
          active={activeTab}
          onChange={setActiveTab}
          reportsCount={reportsCount}
        />
      </div>
    </ToastProvider>
  );
};
