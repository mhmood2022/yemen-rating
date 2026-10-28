import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabase';
import type { PostItem, ProfileItem } from '../../shared/types';

export const usePosts = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(200);
      if (err) throw err;

      const userIds = [...new Set((data || []).map(p => p.user_id).filter(Boolean))];
      const profilesMap = new Map<string, ProfileItem>();
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, verification_type, is_verified')
          .in('id', userIds);
        (profs || []).forEach(p => profilesMap.set(p.id, p as ProfileItem));
      }

      const formatted: PostItem[] = (data || []).map(p => {
        const prof = profilesMap.get(p.user_id);
        const badge: any = prof?.verification_type || (prof?.is_verified ? 'blue' : null);
        return {
          ...p,
          content: p.content || '',
          authorName: prof?.full_name || `مستخدم ${String(p.user_id).slice(0, 6)}`,
          authorUsername: prof?.username || 'user',
          authorAvatar: prof?.avatar_url || '',
          authorBadge: badge,
          is_hidden: p.is_hidden || p.status === 'hidden',
          is_pinned: p.is_pinned || false,
        };
      });
      setPosts(formatted);
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل التغريدات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleHide = async (post: PostItem) => {
    const newHidden = !post.is_hidden;
    const { error } = await supabase
      .from('posts')
      .update({ is_hidden: newHidden, status: newHidden ? 'hidden' : 'active' })
      .eq('id', post.id);
    if (error) throw error;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_hidden: newHidden } : p));
  };

  const togglePin = async (post: PostItem) => {
    const newPinned = !post.is_pinned;
    // إلغاء تثبيت أي تغريدة أخرى لنفس المستخدم
    if (newPinned) {
      await supabase
        .from('posts')
        .update({ is_pinned: false, pinned_at: null })
        .eq('user_id', post.user_id)
        .eq('is_pinned', true);
    }
    const { error } = await supabase
      .from('posts')
      .update({ is_pinned: newPinned, pinned_at: newPinned ? new Date().toISOString() : null })
      .eq('id', post.id);
    if (error) throw error;
    setPosts(prev => prev.map(p => {
      if (p.user_id === post.user_id && newPinned && p.id !== post.id) {
        return { ...p, is_pinned: false };
      }
      return p.id === post.id ? { ...p, is_pinned: newPinned } : p;
    }));
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return { posts, loading, error, reload: load, toggleHide, togglePin, deletePost };
};
