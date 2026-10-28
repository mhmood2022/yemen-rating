import React from 'react';
import { UserCheck, UserX } from 'lucide-react';
import { VerifiedBadge } from '../../../../../components/common/VerifiedBadge';
import type { ProfileItem, BadgeType } from '../../shared/types';

interface Props {
  user: ProfileItem;
  onToggleBlock: (u: ProfileItem) => void;
  onChangeBadge: (id: string, badge: BadgeType) => void;
}

export const UserCard: React.FC<Props> = ({ user, onToggleBlock, onChangeBadge }) => {
  let currentBadgeValue = 'none';
  if (user.verification_type === 'blue') currentBadgeValue = 'blue';
  else if (user.verification_type === 'gold') currentBadgeValue = 'gold';
  else if (user.verification_type === 'gray') currentBadgeValue = 'gray';
  else if (user.is_verified) currentBadgeValue = 'blue';

  console.log('👤 UserCard:', { name: user.full_name, verification_type: user.verification_type, is_verified: user.is_verified, currentBadgeValue });

  return (
    <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm overflow-hidden" style={{ background: '#111111', color: '#FFFFFF' }}>
        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : (user.full_name?.[0] || '؟')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>{user.full_name || 'مستخدم'}</p>
          {currentBadgeValue !== 'none' && <VerifiedBadge type={currentBadgeValue as any} size="sm" />}
        </div>
        <p className="text-xs truncate" style={{ color: '#9CA3AF' }} dir="ltr">@{user.username || 'user'}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={currentBadgeValue}
          onChange={(e) => {
            const v = e.target.value;
            onChangeBadge(user.id, v === 'none' ? null : (v as BadgeType));
          }}
          className="text-xs rounded-lg px-2 py-1.5 focus:outline-none"
          style={{ background: '#111111', color: '#FFFFFF', border: '1px solid #2A2B30' }}
        >
          <option value="none">بدون</option>
          <option value="blue">أزرق</option>
          <option value="gold">ذهبي</option>
          <option value="gray">فضي</option>
        </select>
        <button onClick={() => onToggleBlock(user)} className="w-8 h-8 rounded-lg flex items-center justify-center transition active:opacity-70" style={{ background: user.is_blocked ? '#EF444415' : '#111111', border: `1px solid ${user.is_blocked ? '#EF444440' : '#2A2B30'}`, color: user.is_blocked ? '#EF4444' : '#9CA3AF' }}>
          {user.is_blocked ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
