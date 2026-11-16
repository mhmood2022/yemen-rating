import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { AdminRequest, RequestType, RequestStatus } from '../types';

interface Filters {
  type?: RequestType | 'all';
  status?: RequestStatus | 'all';
  search?: string;
}

export const useInbox = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = useCallback(async (filters: Filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // استخدام RPC لتجاوز RLS
      const { data, error: err } = await supabase.rpc('get_admin_requests');
      if (err) throw err;

      let filtered = data || [];

      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter((r: any) => r.type === filters.type);
      }
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((r: any) => r.status === filters.status);
      }
      if (filters.search?.trim()) {
        const q = filters.search.trim().toLowerCase();
        filtered = filtered.filter((r: any) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.reference_number?.toLowerCase().includes(q)
        );
      }

      setRequests(filtered as AdminRequest[]);

      // حساب العدادات
      const typeCounts: Record<string, number> = {};
      const statusCounts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      });
      setCounts({ ...typeCounts, ...statusCounts, total: data?.length || 0 });

    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { requests, counts, loading, error, reload: load };
};
