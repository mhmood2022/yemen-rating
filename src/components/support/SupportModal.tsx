import React, { useState, useEffect } from 'react';
import { X, Send, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { timeAgo } from '../../pages/admin/community/shared/types'; // استخدمنا دالة الوقت الموجودة

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { id: string; name: string } | null;
}

export const SupportModal: React.FC<Props> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const [myMessages, setMyMessages] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // جلب رسائل المستخدم عند فتح تبويب "رسائلي"
  useEffect(() => {
    if (isOpen && activeTab === 'history' && currentUser?.id) {
      const fetchMessages = async () => {
        setLoadingHistory(true);
        const { data } = await supabase
          .from('user_support_messages')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        setMyMessages(data || []);
        setLoadingHistory(false);
      };
      fetchMessages();
    }
  }, [isOpen, activeTab, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from('user_support_messages').insert({
        user_id: currentUser?.id || null,
        user_name: currentUser?.name || 'مستخدم',
        message: message.trim(),
        status: 'PENDING',
      });
      if (error) throw error;
      setSent(true);
      setMessage('');
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('تعذر إرسال الرسالة، حاول مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col"
        style={{ background: '#000000', border: '1px solid #2A2B30', maxHeight: '85vh' }}
      >
        {/* الترويسة */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#2A2B30' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFC50020', border: '1px solid #FFC50040' }}>
              <MessageCircle className="w-4 h-4" style={{ color: '#FFC500' }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>الدعم الفني</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1F2024' }}>
            <X className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          </button>
        </div>

        {/* التبويبات */}
        <div className="flex bg-[#111] rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('new')} 
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'new' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'}`}
          >
            رسالة جديدة
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'history' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'}`}
          >
            رسائل الدعم
          </button>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'new' ? (
            sent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-base font-bold" style={{ color: '#22C55E' }}>تم إرسال رسالتك بنجاح</p>
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>سيتم الرد عليك في أقرب وقت</p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <p className="text-sm" style={{ color: '#D1D5DB' }}>
                  اكتب رسالتك أو استفسارك وسيتم الرد عليك من فريق الإدارة.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  rows={5}
                  className="w-full bg-black border rounded-xl p-3 text-sm focus:outline-none focus:border-[#FFC500] resize-none"
                  style={{ color: '#FFFFFF', borderColor: '#2A2B30' }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={sending || !message.trim()}
                  className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition active:opacity-70"
                  style={{ background: '#FFC500', color: '#000' }}
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </div>
            )
          ) : (
            <div className="space-y-3 pt-2">
              {loadingHistory ? (
                <p className="text-center text-sm" style={{ color: '#9CA3AF' }}>جاري التحميل...</p>
              ) : myMessages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>لم تقم بإرسال أي رسائل سابقة.</p>
                </div>
              ) : (
                myMessages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-xl" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white">رسالتك:</span>
                      <span className="text-[10px] text-zinc-500">{timeAgo(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-zinc-200">{msg.message}</p>
                    
                    {msg.reply ? (
                      <div className="mt-3 p-3 rounded-lg" style={{ background: '#0A0A0B', border: '1px solid #2A2B30' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FFC50020', border: '1px solid #FFC50040' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#FFC500' }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: '#FFC500' }}>فريق الدعم - يمن ريتنج</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: '#D1D5DB' }}>{msg.reply}</p>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1 text-xs text-[#FFC500]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>قيد المراجعة...</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
