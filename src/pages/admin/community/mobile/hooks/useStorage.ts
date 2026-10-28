import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabase';
import type { StorageStats } from '../../shared/types';

const QUOTA_BYTES = 1024 * 1024 * 1024;

export const useStorage = () => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: posts, error: err } = await supabase
        .from('posts')
        .select('id, image_url, video_url, created_at');
      if (err) throw err;

      const all = posts || [];
      const images = all.filter((p: any) => p.image_url);
      const videos = all.filter((p: any) => p.video_url);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dailyUploads = all.filter(
        (p: any) => new Date(p.created_at) >= today
      ).length;

      const estimatedBytes =
        images.length * 200 * 1024 + videos.length * 2 * 1024 * 1024;

      setStats({
        imagesCount: images.length,
        videosCount: videos.length,
        totalBytes: estimatedBytes,
        dailyUploads,
        quotaBytes: QUOTA_BYTES,
      });
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل الاحصائيات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, reload: load };
};
