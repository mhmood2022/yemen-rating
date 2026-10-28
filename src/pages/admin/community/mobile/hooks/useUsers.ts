import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabase';
import type { ProfileItem, BadgeType } from '../../shared/types';

export const useUsers = () => {
  const [users, setUsers] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, verification_type, is_verified, is_blocked, created_at')
        .limit(300);
      if (err) throw err;
      setUsers((data || []) as ProfileItem[]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'تعذر تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = async (user: ProfileItem) => {
    const newBlocked = !user.is_blocked;
    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: newBlocked })
      .eq('id', user.id);
    if (error) throw error;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_blocked: newBlocked } : u));
  };

  const updateBadge = async (userId: string, badge: BadgeType) => {
    const isVerified = badge !== null;
    const { error } = await supabase
      .from('profiles')
      .update({ verification_type: badge, is_verified: isVerified })
      .eq('id', userId);
    if (error) throw error;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verification_type: badge, is_verified: isVerified } : u));
  };

  return { users, loading, error, reload: load, toggleBlock, updateBadge };
};
