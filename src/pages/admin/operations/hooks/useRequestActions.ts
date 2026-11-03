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

interface ApplyOptions {
  newStatus?: string;
  reason?: string;
  assignedTo?: string;
  note?: string;
  claimId?: string;       // ← جديد: معرف business_claims
  requestType?: string;   // ← جديد: نوع الطلب
}

export const useRequestActions = () => {
  const [loading, setLoading] = useState(false);

  const apply = async (
    requestId: string,
    action: RequestAction,
    opts: ApplyOptions = {}
  ): Promise<ActionResult> => {
    setLoading(true);
    try {
      // إذا كان الطلب "إثبات ملكية" (claim) → استخدم الدالة المخصصة
      if (opts.requestType === 'claim' && opts.claimId) {
        if (action === 'approve') {
          const { error } = await supabase.rpc('approve_claim_request', {
            p_claim_id: opts.claimId,
            p_reason: opts.reason ?? null,
          });
          if (error) return { ok: false, error: error.message };
          return { ok: true };
        }
        if (action === 'reject') {
          const { error } = await supabase.rpc('reject_claim_request', {
            p_claim_id: opts.claimId,
            p_reason: opts.reason ?? '',
          });
          if (error) return { ok: false, error: error.message };
          return { ok: true };
        }
        // request_info أو غيرها → استخدم apply_request_action
      }

      // المسار العام لأي طلب آخر
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
