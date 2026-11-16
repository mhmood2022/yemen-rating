import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../../../lib/supabase'; // المسار الصحيح

export interface SupportMessage {
  id: string;
  user_name: string;
  message: string;
  status: string;
  reply: string | null;
  created_at: string;
}

export const useSupport = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('📥 محاولة جلب الرسائل من Supabase...');
    
    try {
      const { data, error: err } = await supabase
        .from('user_support_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (err) {
        console.error('❌ خطأ Supabase:', err);
        throw err;
      }
      
      console.log('✅ تم جلب البيانات:', data);
      setMessages(data || []);
    } catch (err: any) {
      console.error('❌ فشل الجلب:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    load(); 
  }, [load]);

  const replyToMessage = async (id: string, replyText: string) => {
    const { error } = await supabase
      .from('user_support_messages')
      .update({ reply: replyText, status: 'RESOLVED', replied_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, reply: replyText, status: 'RESOLVED' } : m));
  };

  return { messages, loading, error, reload: load, replyToMessage };
};
