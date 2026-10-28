import React, { useEffect, useMemo, useState } from 'react';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { ToastProvider } from '../shared/Toast';
import { MobileReportsTab } from './tabs/MobileReportsTab';
import { MobilePostsTab } from './tabs/MobilePostsTab';
import { MobileCommentsTab } from './tabs/MobileCommentsTab';
import { MobileUsersTab } from './tabs/MobileUsersTab';
import { MobileStorageTab } from './tabs/MobileStorageTab';
import { MobileLogsTab } from './tabs/MobileLogsTab';
import { supabase } from './supabase';
import type { CommunityTab } from '../shared/types';

interface Props {
  reportsCount?: number;
}

const TAB_TITLES: Record<CommunityTab, { title: string; subtitle: string }> = {
  reports: { title: 'إدارة البلاغات', subtitle: 'مراجعة البلاغات ومعالجتها' },
  posts: { title: 'إدارة التغريدات', subtitle: 'استعراض وإدارة المحتوى' },
  comments: { title: 'إدارة التعليقات', subtitle: 'الردود على التغريدات' },
  users: { title: 'إدارة المستخدمين', subtitle: 'المغردون والتوثيق' },
  storage: { title: 'مراقبة التخزين', subtitle: 'استهلاك Supabase' },
  logs: { title: 'سجل الإجراءات', subtitle: 'كل إجراء إداري' },
};

export const MobileCommunityView: React.FC<Props> = ({ reportsCount: initialReportsCount = 0 }) => {
  const [activeTab, setActiveTab] = useState<CommunityTab>('reports');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reportsCount, setReportsCount] = useState(initialReportsCount);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  const meta = useMemo(() => TAB_TITLES[activeTab], [activeTab]);

  // 1. جلب عدد البلاغات المعلقة + Realtime
  useEffect(() => {
    const fetchReportsCount = async () => {
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');
      setReportsCount(count || 0);
    };
    fetchReportsCount();

    // Realtime: تحديث تلقائي عند وصول بلاغ جديد
    const channel = supabase
      .channel('reports-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchReportsCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. Pull-to-Refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY > 0 && window.scrollY === 0) {
      const distance = Math.max(0, e.touches[0].clientY - pullStartY);
      setPullDistance(Math.min(distance, 80));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 50) {
      setRefreshing(true);
      await new Promise(r => setTimeout(r, 800));
      setRefreshing(false);
      window.location.reload();
    }
    setPullStartY(0);
    setPullDistance(0);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <ToastProvider>
      <div
        className="min-h-screen pb-20"
        dir="rtl"
        style={{ background: 'var(--yr-bg-black)', color: 'var(--yr-text-primary)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* مؤشر Pull-to-Refresh */}
        {pullDistance > 0 && (
          <div
            className="fixed top-0 inset-x-0 flex items-center justify-center text-xs z-50"
            style={{
              height: pullDistance,
              background: 'var(--yr-surface-elevated)',
              color: 'var(--yr-accent-gold)',
              transition: 'height 0.2s',
            }}
          >
            {pullDistance > 50 ? '↑ اترك للتحديث' : '↓ اسحب للتحديث'}
          </div>
        )}

        {refreshing && (
          <div
            className="fixed top-0 inset-x-0 h-10 flex items-center justify-center text-xs z-50"
            style={{ background: 'var(--yr-surface-elevated)', color: 'var(--yr-accent-gold)' }}
          >
            جاري التحديث...
          </div>
        )}

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
          {activeTab === 'comments' && <MobileCommentsTab searchQuery={search} />}
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
