import React, { useState } from 'react';
import { UserCheck, UserX, Check, ChevronDown } from 'lucide-react';
import { VerifiedBadge } from '../../../../../components/common/VerifiedBadge';
import type { ProfileItem, BadgeType } from '../../shared/types';

interface Props {
  user: ProfileItem;
  onToggleBlock: (u: ProfileItem) => void;
  onChangeBadge: (id: string, badge: BadgeType) => void;
}

export const UserCard: React.FC<Props> = ({ user, onToggleBlock, onChangeBadge }) => {
  const [isOpen, setIsOpen] = useState(false);

  let currentBadgeValue = 'none';
  if (user.verification_type === 'blue') currentBadgeValue = 'blue';
  else if (user.verification_type === 'gold') currentBadgeValue = 'gold';
  else if (user.verification_type === 'gray') currentBadgeValue = 'gray';
  else if (user.is_verified) currentBadgeValue = 'blue';

  const options = [
    { value: 'none', label: 'بدون', color: '#9CA3AF' },
    { value: 'blue', label: 'أزرق', color: '#1D9BF0' },
    { value: 'gold', label: 'ذهبي', color: '#FFC500' },
    { value: 'gray', label: 'فضي', color: '#9CA3AF' },
  ];

  const currentOption = options.find(o => o.value === currentBadgeValue) || options[0];

  const handleSelect = (val: string) => {
    setIsOpen(false);
    onChangeBadge(user.id, val === 'none' ? null : (val as BadgeType));
  };

  return (
    <div className="rounded-2xl p-4 flex items-center gap-3 relative" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
      
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm overflow-hidden" style={{ background: '#111111', color: '#FFFFFF' }}>
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
          {currentBadgeValue !== 'none' && (
             <VerifiedBadge type={currentBadgeValue as any} size={16} />
          )}
        </div>
        <p className="text-xs truncate" style={{ color: '#9CA3AF' }} dir="ltr">
          @{user.username || 'user'}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 relative">
        
        {/* زر القائمة المخصصة */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between text-xs rounded-lg px-2 py-1.5 focus:outline-none transition active:opacity-70"
          style={{
            background: '#111111',
            color: '#FFFFFF',
            border: '1px solid #2A2B30',
            minWidth: '80px',
            height: '32px',
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: currentOption.color }} />
            <span>{currentOption.label}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 ml-2" style={{ color: '#9CA3AF' }} />
        </button>

        {/* القائمة المنسدلة المخصصة */}
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div 
              className="absolute top-full mt-1 right-0 z-50 rounded-xl overflow-hidden shadow-2xl"
              style={{ 
                background: '#16171A', 
                border: '1px solid #2A2B30',
                width: '120px'
              }}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs transition active:opacity-60 hover:bg-white/5"
                  style={{ color: '#FFFFFF' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                    <span>{opt.label}</span>
                  </div>
                  {currentBadgeValue === opt.value && (
                    <Check className="w-3.5 h-3.5" style={{ color: '#FFC500' }} />
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => onToggleBlock(user)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition active:opacity-70"
          style={{
            background: user.is_blocked ? '#EF444415' : '#111111',
            border: `1px solid ${user.is_blocked ? '#EF444440' : '#2A2B30'}`,
            color: user.is_blocked ? '#EF4444' : '#9CA3AF',
          }}
        >
          {user.is_blocked ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
