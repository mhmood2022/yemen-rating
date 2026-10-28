import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { CommentItem, ProfileItem } from '../../shared/types';

export const useComments = () => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. جلب التعليقات فقط
      const { data: commentsData, error: err } = await supabase
        .from('post_comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (err) throw err;

      // 2. جلب البروفايلات المرتبطة
      const userIds = [...new Set((commentsData || []).map(c => c.user_id).filter(Boolean))];
      const profilesMap = new Map<string, ProfileItem>();
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, verification_type, is_verified')
          .in('id', userIds);
        (profilesData || []).forEach(p => profilesMap.set(p.id, p as ProfileItem));
      }

      // 3. دمج البيانات
      const formatted: CommentItem[] = (commentsData || []).map((c: any) => {
        const prof = profilesMap.get(c.user_id);
        return {
          id: c.id,
          post_id: c.post_id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          authorName: prof?.full_name || 'مستخدم',
          authorUsername: prof?.username || 'user',
          authorAvatar: prof?.avatar_url || '',
          authorBadge: (prof?.verification_type as any) || (prof?.is_verified ? 'blue' : null),
        };
      });
      setComments(formatted);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('post_comments').delete().eq('id', id);
    if (error) throw error;
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return { comments, loading, error, reload: load, deleteComment };
};
