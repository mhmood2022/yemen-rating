import React, { useState } from 'react';
import { MessageCircle, Send, CheckCircle2, X } from 'lucide-react';
import { useSupport } from '../hooks/useSupport';
import { SkeletonCard } from '../../shared/SkeletonCard';
import { EmptyState } from '../../shared/EmptyState';
import { useToast } from '../../shared/Toast';
import { timeAgo } from '../../shared/types';

export const MobileSupportTab: React.FC = () => {
  const { messages, loading, error, reload, replyToMessage } = useSupport();
  const { showToast } = useToast();
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  console.log('🎧 SupportTab rendered:', { loading, error, count: messages.length, messages });

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await replyToMessage(id, replyText);
      showToast('تم إرسال الرد بنجاح', 'success');
      setReplyText('');
      setReplyingTo(null);
    } catch {
      showToast('تعذر إرسال الرد', 'error');
    }
  };

  if (loading) return <SkeletonCard variant="simple" count={4} />;
  
  if (error) {
    return (
      <div className="rounded-2xl p-4" style={{ background: '#000', border: '1px solid #EF4444' }}>
        <p style={{ color: '#EF4444' }}>خطأ: {error}</p>
        <button onClick={reload} className="mt-2 px-4 py-2 rounded-lg text-sm font-bold" style={{ background: '#FFC500', color: '#000' }}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState 
        icon={MessageCircle} 
        title="لا توجد رسائل دعم" 
        description="لم يتواصل أي مستخدم مع الدعم بعد" 
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs p-2 rounded-lg text-center" style={{ background: '#111', color: '#FFC500' }}>
        عدد الرسائل: {messages.length}
      </div>
      
      {messages.map((msg) => (
        <div key={msg.id} className="rounded-2xl p-4 space-y-2" style={{ background: '#000', border: '1px solid #2A2B30' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{msg.user_name || 'مستخدم'}</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>{timeAgo(msg.created_at)}</span>
          </div>
          
          <p className="text-sm p-2 rounded-lg" style={{ color: '#D1D5DB', background: '#111' }}>
            {msg.message}
          </p>
          
          {msg.reply ? (
            <div className="p-2 rounded-lg flex items-start gap-2" style={{ background: '#22C55E15', border: '1px solid #22C55E40' }}>
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#22C55E' }} />
              <div>
                <span className="font-bold block text-xs" style={{ color: '#22C55E' }}>الرد:</span>
                <span className="text-sm" style={{ color: '#D1D5DB' }}>{msg.reply}</span>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              {replyingTo === msg.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب الرد هنا..."
                    className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={{ background: '#111', border: '1px solid #2A2B30', color: '#FFFFFF' }}
                    autoFocus
                  />
                  <button onClick={() => handleReply(msg.id)} className="p-2 rounded-lg" style={{ background: '#22C55E' }}>
                    <Send className="w-4 h-4" style={{ color: '#FFF' }} />
                  </button>
                  <button onClick={() => setReplyingTo(null)} className="p-2 rounded-lg" style={{ background: '#1F2024' }}>
                    <X className="w-4 h-4" style={{ color: '#FFF' }} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setReplyingTo(msg.id)} 
                  className="text-xs font-bold flex items-center gap-1 py-1"
                  style={{ color: '#FFC500' }}
                >
                  <MessageCircle className="w-4 h-4" /> إضافة رد
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
