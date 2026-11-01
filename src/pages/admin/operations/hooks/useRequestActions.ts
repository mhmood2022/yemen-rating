import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';

export type RequestAction =
  | 'approve'
  | 'reject'
  | 'close'
  | 'assign'
  | 'note'
  | 'request_info';

interface ActionResult {
  ok: boolean;
  error?: string;
}

export const useRequestActions = () => {
  const [loading, setLoading] = useState(false);

  const apply = async (
    requestId: string,
    action: RequestAction,
    opts: {
      newStatus?: string;
      reason?: string;
      assignedTo?: string;
      note?: string;
    } = {}
  ): Promise<ActionResult> => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('apply_request_action', {
        p_request_id: requestId,
        p_action: action,
        p_new_status: opts.newStatus ?? null,
        p_reason: opts.reason ?? null,
        p_assigned_to: opts.assignedTo ?? null,
        p_note: opts.note ?? null,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'خطأ غير معروف' };
    } finally {
      setLoading(false);
    }
  };

  return { apply, loading };
};
