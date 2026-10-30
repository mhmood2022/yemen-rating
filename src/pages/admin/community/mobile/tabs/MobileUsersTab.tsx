import React, { useMemo, useState } from 'react';
import { Users, ShieldOff } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { UserCard } from '../components/UserCard';
import { FilterChips } from '../../shared/FilterChips';
import { EmptyState } from '../../shared/EmptyState';
import { SkeletonCard } from '../../shared/SkeletonCard';
import { useToast } from '../../shared/Toast';
import type { ProfileItem, BadgeType } from '../../shared/types';

interface Props {
  searchQuery?: string;
}

type F = 'all' | 'verified' | 'unverified' | 'blocked' | 'online';

export const MobileUsersTab: React.FC<Props> = ({ searchQuery = '' }) => {
  const { users, loading, error, reload, toggleBlock, updateBadge } = useUsers();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<F>('all');

  const filtered = useMemo(() => {
    let list = users;
    if (filter === 'verified') list = list.filter(u => u.verification_type || u.is_verified);
    else if (filter === 'unverified') list = list.filter(u => !u.verification_type && !u.is_verified);
    else if (filter === 'blocked' || filter === 'banned') list = list.filter(u => u.is_blocked);
    else if (filter === 'online') list = list.filter(u => u.last_seen && (new Date().getTime() - new Date(u.last_seen).getTime()) < 5 * 60 * 1000);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, filter, searchQuery]);

  const counts = useMemo(() => ({
    all: users.length,
    verified: users.filter(u => u.verification_type || u.is_verified).length,
    blocked: users.filter(u => u.is_blocked).length,
    online: users.filter(u => u.last_seen && (new Date().getTime() - new Date(u.last_seen).getTime()) < 5 * 60 * 1000).length,
  }), [users]);

  const handleToggleBlock = async (u: ProfileItem) => {
    try {
      await toggleBlock(u);
      showToast(u.is_blocked ? 'تم رفع الحظر' : 'تم حظر المستخدم', 'success');
    } catch {
      showToast('تعذر التحديث', 'error');
    }
  };

  const handleBadge = async (id: string, badge: BadgeType) => {
    try {
      await updateBadge(id, badge);
      showToast('تم تحديث الشارة', 'success');
    } catch {
      showToast('تعذر تحديث الشارة', 'error');
    }
  };

  return (
    <div className="space-y-3">
      <FilterChips
        chips={[
          { id: 'all', label: 'الكل', count: counts.all },
          { id: 'verified', label: 'موثق', count: counts.verified },
          { id: 'online', label: 'متصل الآن', count: counts.online },
          { id: 'unverified', label: 'غير موثق' },
          { id: 'blocked', label: 'محظور', count: counts.blocked },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as F)}
      />

      {loading ? (
        <SkeletonCard variant="user" count={4} />
      ) : error ? (
        <EmptyState
          icon={Users}
          title="تعذر التحميل"
          description={error}
          actionLabel="إعادة المحاولة"
          onAction={reload}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={filter === 'blocked' ? ShieldOff : Users}
          title={filter === 'blocked' ? 'لا يوجد مستخدمون محظورون' : 'لا يوجد مستخدمون'}
          description={filter === 'blocked' ? 'كل المستخدمين نشطون' : 'جرّب تغيير الفلتر'}
        />
      ) : (
        filtered.map((u) => (
          <UserCard key={u.id} user={u} onToggleBlock={handleToggleBlock} onChangeBadge={handleBadge} />
        ))
      )}
    </div>
  );
};
