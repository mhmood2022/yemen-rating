import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../../../lib/supabase';
import type { ReportItem, PostItem, ProfileItem } from '../../shared/types';

export interface ReporterInfo {
  name: string;
  avatar: string;
  username: string;
  verification_type?: string | null;
}

export const useReports = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportersMap, setReportersMap] = useState<Map<string, ReporterInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: reportsData, error: reportsErr } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (reportsErr) throw reportsErr;

      const postIds = (reportsData || [])
        .filter(r => (r.reported_item_type || '').toLowerCase() === 'post')
        .map(r => r.reported_item_id)
        .filter(Boolean);

      const userIds = new Set<string>();
      (reportsData || []).forEach(r => {
        if (r.reported_user_id) userIds.add(r.reported_user_id);
        if (r.reporter_id) userIds.add(r.reporter_id);
        if ((r.reported_item_type || '').toLowerCase() === 'user' && r.reported_item_id) {
          userIds.add(r.reported_item_id);
        }
      });

      const postsMap = new Map<string, PostItem>();
      if (postIds.length > 0) {
        const { data: postsData } = await supabase.from('posts').select('*').in('id', postIds);
        (postsData || []).forEach(p => postsMap.set(p.id, p as PostItem));
      }

      const profilesMap = new Map<string, ProfileItem>();
      if (userIds.size > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, verification_type, is_verified, is_blocked, created_at')
          .in('id', Array.from(userIds));
        (profilesData || []).forEach(p => profilesMap.set(p.id, p as ProfileItem));
      }

      const reporters = new Map<string, ReporterInfo>();
      (reportsData || []).forEach(r => {
        if (!r.reporter_id) return;
        const prof = profilesMap.get(r.reporter_id);
        reporters.set(r.reporter_id, {
          name: prof?.full_name || r.reporter_name || 'مستخدم',
          avatar: prof?.avatar_url || '',
          username: prof?.username || '',
          verification_type: prof?.verification_type || (prof?.is_verified ? 'blue' : null),
        });
      });
      setReportersMap(reporters);

      const linked: ReportItem[] = (reportsData || []).map(r => {
        const itemType = (r.reported_item_type || '').toLowerCase();
        const isAccount = itemType === 'account' || itemType === 'user';
        const isPost = itemType === 'post';
        
        const targetUser = isAccount 
          ? profilesMap.get(r.reported_item_id) 
          : (r.reported_user_id ? profilesMap.get(r.reported_user_id) : null);
        const targetPost = isPost ? postsMap.get(r.reported_item_id) : null;

        return {
          ...r,
          reporter_name: reporters.get(r.reporter_id)?.name || r.reporter_name || 'مجهول',
          reported_item_type: isAccount ? 'user' : (itemType as any),
          targetPost: targetPost || undefined,
          targetUser: targetUser || undefined,
        };
      });

      setReports(linked);
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل البلاغات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: ReportItem['status']) => {
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) throw error;
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
    setReports(prev => prev.map(r => r.targetPost?.id === postId ? { ...r, targetPost: undefined } : r));
  };

  const blockUser = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ is_blocked: true }).eq('id', userId);
    if (error) throw error;
  };

  return { reports, reportersMap, loading, error, reload: load, updateStatus, deletePost, blockUser };
};
