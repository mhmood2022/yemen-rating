import React, { useEffect, useState } from 'react';
import { ArrowRight, Repeat2, MessageCircle, BadgeCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PostEngagementsModal({ post, onClose }: { post: any, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'reposts' | 'quotes'>('reposts');
  const [reposts, setReposts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!post) return;
    const fetchEngagements = async () => {
      setLoading(true);
      try {
        // جلب كل الإعادات
        const { data: repostData } = await supabase
          .from('post_reposts')
          .select('user_id, quote_text, created_at')
          .eq('post_id', post.id)
          .order('created_at', { ascending: false });

        const all = repostData || [];
        const plainReposts = all.filter(r => !r.quote_text);
        const quotesData = all.filter(r => r.quote_text);

        // جلب بيانات المستخدمين
        const userIds = [...new Set(all.map(r => r.user_id))];
        let profilesMap: any = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, verification_type, is_verified')
            .in('id', userIds);
          profiles?.forEach(p => profilesMap[p.id] = p);
        }

        setReposts(plainReposts.map(r => ({ ...r, profile: profilesMap[r.user_id] })));
        setQuotes(quotesData.map(r => ({ ...r, profile: profilesMap[r.user_id] })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchEngagements();
  }, [post]);

  const currentList = activeTab === 'reposts' ? reposts : quotes;

  return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center gap-6 p-4 border-b border-[#2F3336]">
        <button onClick={onClose} className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
          <ArrowRight size={20} />
        </button>
        <div>
          <h2 className="text-white font-bold text-[18px]">مشاركات المنشور</h2>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex border-b border-[#2F3336]">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex-1 py-4 text-center font-bold text-[15px] transition-colors relative ${activeTab === 'quotes' ? 'text-white' : 'text-[#71767B] hover:bg-white/5'}`}
        >
          الاقتباسات {quotes.length > 0 && <span className="text-[#71767B] font-normal mr-1">{quotes.length}</span>}
          {activeTab === 'quotes' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC500] rounded-full mx-auto w-14"></div>}
        </button>
        <button
          onClick={() => setActiveTab('reposts')}
          className={`flex-1 py-4 text-center font-bold text-[15px] transition-colors relative ${activeTab === 'reposts' ? 'text-white' : 'text-[#71767B] hover:bg-white/5'}`}
        >
          أعيد النشر من قبل {reposts.length > 0 && <span className="text-[#71767B] font-normal mr-1">{reposts.length}</span>}
          {activeTab === 'reposts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC500] rounded-full mx-auto w-14"></div>}
        </button>
      </div>

      {/* القائمة */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center text-[#71767B] py-10">جاري التحميل...</div>
        ) : currentList.length === 0 ? (
          <div className="text-center text-[#71767B] py-10">لا توجد مشاركات بعد.</div>
        ) : (
          currentList.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between p-4 border-b border-[#2F3336] hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex gap-3">
                <img src={item.profile?.avatar_url || `https://ui-avatars.com/api/?name=${item.profile?.full_name || 'User'}`} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-[15px]">{item.profile?.full_name || 'مستخدم'}</span>
                    {(item.profile?.is_verified || item.profile?.verification_type) && <BadgeCheck size={16} className="text-[#FFC500]" fill="currentColor" color="black" />}
                  </div>
                  <span className="text-[#71767B] text-[14px]">@{item.profile?.username || 'user'}</span>
                  {activeTab === 'quotes' && item.quote_text && (
                    <p className="text-white text-[14px] mt-2 bg-[#16181C] p-3 rounded-xl border border-[#2F3336]">{item.quote_text}</p>
                  )}
                </div>
              </div>
              <button className="bg-white text-black font-bold text-[14px] px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors shrink-0">
                متابعة
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
