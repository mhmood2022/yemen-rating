import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { AdminRequest, RequestMessage, RequestStatusHistory, RequestAttachment } from '../types';

export interface RequestUserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
  username?: string;
  is_verified?: boolean;
  verification_type?: string;
}

export const useRequestDetails = (requestId: string | null) => {
  const [request, setRequest] = useState<AdminRequest | null>(null);
  const [userProfile, setUserProfile] = useState<RequestUserProfile | null>(null);
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [history, setHistory] = useState<RequestStatusHistory[]>([]);
  const [attachments, setAttachments] = useState<RequestAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const { data: req } = await supabase
        .from('admin_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (req) {
        // جلب بيانات المستخدم من profiles
        let profileId: string | null = req.user_id || null;
        
        // إذا لم يوجد user_id، جرب metadata
        if (!profileId && req.metadata) {
          profileId = (req.metadata as any).claimant_profile_id || null;
        }
        
        // إذا لم يوجد، جرب target_id (إن كان يشير لمستخدم)
        if (!profileId && req.target_type === 'profile' && req.target_id) {
          profileId = req.target_id;
        }

        let prof: RequestUserProfile | null = null;
        if (profileId) {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, phone, email, username, is_verified, verification_type')
            .eq('id', profileId)
            .single();
          prof = (data as RequestUserProfile) || null;
        }

        setUserProfile(prof);
        setRequest({
          ...req,
          user_name: prof?.full_name || (prof as any)?.username || undefined,
          user_avatar: prof?.avatar_url || undefined,
        } as AdminRequest);
      }

      const { data: msgs } = await supabase
        .from('request_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      setMessages(msgs || []);

      const { data: hist } = await supabase
        .from('request_status_history')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      setHistory(hist || []);

      const { data: att } = await supabase
        .from('request_attachments')
        .select('*')
        .eq('request_id', requestId);
      setAttachments(att || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => { load(); }, [load]);

  return { request, userProfile, messages, history, attachments, loading, reload: load };
};
