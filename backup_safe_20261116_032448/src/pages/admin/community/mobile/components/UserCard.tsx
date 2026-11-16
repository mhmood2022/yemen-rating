import React, { useState } from 'react';
import { UserCheck, UserX, Check, ChevronDown, Calendar } from 'lucide-react';
import { VerifiedBadge } from '../../../../../components/common/VerifiedBadge';
import { supabase } from '../../../../../lib/supabase';
import type { ProfileItem, BadgeType } from '../../shared/types';

interface Props {
  user: ProfileItem;
  onToggleBlock: (u: ProfileItem) => void;
  onChangeBadge: (id: string, badge: BadgeType) => void;
}

export const UserCard: React.FC<Props> = ({ user, onToggleBlock, onChangeBadge }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isSaving, setIsSaving] = useState(false);

  let currentBadgeValue = 'none';
  if (user.verification_type === 'blue') currentBadgeValue = 'blue';
  else if (user.verification_type === 'gold') currentBadgeValue = 'gold';
  else if (user.verification_type === 'gray') currentBadgeValue = 'gray';
  else if (user.is_verified) currentBadgeValue = 'blue';

  const isOnline = user.last_seen && (new Date().getTime() - new Date(user.last_seen).getTime()) < 5 * 60 * 1000;
  
  const getShortTime = () => {
    if (!user.last_seen) return 'غير متصل';
    const diffMin = Math.floor((new Date().getTime() - new Date(user.last_seen).getTime()) / 60000);
    if (isOnline) return 'متصل الآن';
    if (diffMin < 60) return `غير متصل منذ ${diffMin} د`;
    if (diffMin < 1440) return `غير متصل منذ ${Math.floor(diffMin / 60)} س`;
    return `غير متصل منذ ${Math.floor(diffMin / 1440)} يوم`;
  };

  const options = [
    { value: 'none', label: 'بدون', color: '#FFFFFF' },
    { value: 'blue', label: 'أزرق', color: '#1D9BF0' },
    { value: 'gold', label: 'ذهبي', color: '#FFC500' },
    { value: 'gray', label: 'فضي', color: '#9CA3AF' },
  ];

  const currentOption = options.find(o => o.value === currentBadgeValue) || options[0];

  const handleGrantSubmit = async () => {
    if (!selectedBadge) return;
    setIsSaving(true);
    try {
      // استدعاء دالة RPC الآمنة (تتجاوز RLS)
      const { error } = await supabase.rpc('grant_admin_subscription', {
        target_user_id: user.id,
        badge_type_param: selectedBadge,
        start_date_param: new Date(startDate).toISOString(),
        end_date_param: new Date(endDate).toISOString()
      });

      if (error) throw error;

      onChangeBadge(user.id, selectedBadge);
      setIsGrantModalOpen(false);
    } catch (err: any) {
      console.error('❌ Grant error:', err);
      alert('حدث خطأ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 flex items-center gap-3 relative" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
      
      {/* صورة المستخدم مع نقطة الاتصال */}
      <div className="relative">
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm overflow-hidden" style={{ background: '#111111', color: '#FFFFFF' }}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            user.full_name?.[0] || '؟'
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#22C55E', borderColor: '#000' }} />
        )}
      </div>

      {/* اسم المستخدم والشارة */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>
            {user.full_name || 'مستخدم'}
          </p>
          {currentBadgeValue !== 'none' && (
             <VerifiedBadge type={currentBadgeValue as any} size={16} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs truncate" style={{ color: '#9CA3AF' }} dir="ltr">
            @{user.username || 'user'}
          </p>
          <span className="text-[10px]" style={{ color: isOnline ? '#22C55E' : '#71767B' }}>
            {getShortTime()}
          </span>
        </div>
      </div>

      {/* قائمة اختيار الشارة المخصصة + زر الحظر */}
      <div className="flex items-center gap-1.5 shrink-0 relative">
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between text-xs rounded-lg px-2 py-1.5 focus:outline-none transition active:opacity-70"
          style={{ background: '#111111', color: '#FFFFFF', border: '1px solid #2A2B30', minWidth: '80px', height: '32px' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: currentOption.color }} />
            <span>{currentOption.label}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 ml-2" style={{ color: '#9CA3AF' }} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full mt-1 right-0 z-50 rounded-xl overflow-hidden shadow-2xl" style={{ background: '#16171A', border: '1px solid #2A2B30', width: '120px' }}>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === 'none') {
                      onChangeBadge(user.id, null);
                    } else {
                      setSelectedBadge(opt.value as BadgeType);
                      setIsGrantModalOpen(true);
                    }
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs transition active:opacity-60 hover:bg-white/5"
                  style={{ color: '#FFFFFF' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                    <span>{opt.label}</span>
                  </div>
                  {currentBadgeValue === opt.value && <Check className="w-3.5 h-3.5" style={{ color: '#FFC500' }} />}
                </button>
              ))}
            </div>
          </>
        )}

        <button onClick={() => onToggleBlock(user)} className="w-8 h-8 rounded-lg flex items-center justify-center transition active:opacity-70" style={{ background: user.is_blocked ? '#EF444415' : '#111111', border: `1px solid ${user.is_blocked ? '#EF444440' : '#2A2B30'}`, color: user.is_blocked ? '#EF4444' : '#9CA3AF' }}>
          {user.is_blocked ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
        </button>
      </div>

      {/* نافذة تحديد مدة المنحة الإدارية */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setIsGrantModalOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl" style={{ background: '#111', border: '1px solid #2A2B30' }}>
            <h3 className="text-base font-bold text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-[#FFC500]"/> منح شارة {selectedBadge === 'gold' ? 'ذهبية' : selectedBadge === 'blue' ? 'زرقاء' : 'فضية'}</h3>
            
            <div>
              <label className="text-xs text-zinc-400 block mb-1">تاريخ البدء</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-black border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
            </div>
            
            <div>
              <label className="text-xs text-zinc-400 block mb-1">تاريخ الانتهاء</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-black border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsGrantModalOpen(false)} className="flex-1 py-2 rounded-lg bg-zinc-800 text-white text-xs font-bold">إلغاء</button>
              <button onClick={handleGrantSubmit} disabled={isSaving} className="flex-1 py-2 rounded-lg bg-[#FFC500] text-black text-xs font-bold disabled:opacity-50">
                {isSaving ? 'جاري الحفظ...' : 'تأكيد المنح'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
