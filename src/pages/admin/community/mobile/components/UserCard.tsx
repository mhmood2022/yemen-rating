import React from 'react';
import { UserCheck, UserX } from 'lucide-react';
import type { ProfileItem, BadgeType } from '../../shared/types';

interface Props {
  user: ProfileItem;
  onToggleBlock: (u: ProfileItem) => void;
  onChangeBadge: (id: string, badge: BadgeType) => void;
}

export const UserCard: React.FC<Props> = ({ user, onToggleBlock, onChangeBadge }) => {
  const currentBadge: BadgeType =
    (user.verification_type as BadgeType) || (user.is_verified ? 'blue' : null);

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{
        background: '#000000',
        border: '1px solid #2A2B30',
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
        style={{ background: '#111111', color: '#FFFFFF' }}
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          user.full_name?.[0] || '؟'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>
            {user.full_name || 'مستخدم'}
          </p>
          {currentBadge && (
            <span
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{
                background: currentBadge === 'gold' ? '#FFC500' : '#1D9BF0',
                color: '#000',
              }}
            >
              ✓
            </span>
          )}
        </div>
        <p className="text-xs truncate" style={{ color: '#8E8E93' }} dir="ltr">
          @{user.username || 'user'}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={currentBadge || 'none'}
          onChange={(e) => {
            const v = e.target.value;
            onChangeBadge(user.id, v === 'none' ? null : (v as BadgeType));
          }}
          className="text-xs rounded-lg px-2 py-1.5 focus:outline-none"
          style={{
            background: '#111111',
            color: '#FFFFFF',
            border: '1px solid #2A2B30',
          }}
        >
          <option value="none">بدون</option>
          <option value="blue">أزرق</option>
          <option value="gold">ذهبي</option>
        </select>

        <button
          onClick={() => onToggleBlock(user)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition active:opacity-70"
          style={{
            background: user.is_blocked ? '#EF444415' : '#111111',
            border: `1px solid ${user.is_blocked ? '#EF444440' : '#2A2B30'}`,
            color: user.is_blocked ? '#EF4444' : '#8E8E93',
          }}
        >
          {user.is_blocked ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
