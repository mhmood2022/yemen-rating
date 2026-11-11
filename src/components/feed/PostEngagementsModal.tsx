import React, { useEffect, useState } from 'react';
import { ArrowRight, Repeat2, MessageCircle, BadgeCheck, X } from 'lucide-react';
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
        const cleanId = post.id.toString().replace('repost-', '');
        
        // جلب كل التفاعلات من جدول إعادة النشر
        const { data: repostData, error } = await supabase
          .from('post_reposts')
          .select('user_id, quote_text, created_at')
          .eq('post_id', cleanId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const all = repostData || [];
        
        // فصل الاقتباسات عن إعادة النشر العادية
        const quotesData = all.filter(r => r.quote_text && r.quote_text.trim() !== '');
        const plainReposts = all.filter(r => !r.quote_text || r.quote_text.trim() === '');

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

        // ربط البيانات
        setReposts(plainReposts.map(r => ({ ...r, profile: profilesMap[r.user_id] })));
        setQuotes(quotesData.map(r => ({ ...r, profile: profilesMap[r.user_id] })));
      } catch (e) {
        console.error('Error fetching engagements:', e);
      }
      setLoading(false);
    };
    fetchEngagements();
  }, [post]);

  const currentList = activeTab === 'reposts' ? reposts : quotes;

  return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col" dir="rtl">
      
      {/* الهيدر */}
      <div className="flex items-center gap-6 p-4 border-b border-[#2F3336] sticky top-0 bg-black/90 backdrop-blur-md z-10">
        <button onClick={onClose} className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
          <ArrowRight size={20} />
        </button>
        <h2 className="text-white font-bold text-[18px]">مشاركات المنشور</h2>
      </div>

      {/* التبويبات */}
      <div className="flex border-b border-[#2F3336] sticky top-[65px] bg-black/90 backdrop-blur-md z-10">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex-1 py-4 text-center font-bold text-[15px] transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'quotes' ? 'text-white' : 'text-[#71767B] hover:bg-white/5'}`}
        >
          <MessageCircle size={18} />
          الاقتباسات {quotes.length > 0 ? <span className="text-[#71767B] font-normal text-[13px]">{quotes.length}</span> : <span className="text-[#71767B] text-lg leading-none">.</span>}
          {activeTab === 'quotes' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC500] rounded-full mx-auto w-16"></div>}
        </button>
        <button
          onClick={() => setActiveTab('reposts')}
          className={`flex-1 py-4 text-center font-bold text-[15px] transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'reposts' ? 'text-white' : 'text-[#71767B] hover:bg-white/5'}`}
        >
          <Repeat2 size={18} />
          أعيد النشر من قبل {reposts.length > 0 ? <span className="text-[#71767B] font-normal text-[13px]">{reposts.length}</span> : <span className="text-[#71767B] text-lg leading-none">.</span>}
          {activeTab === 'reposts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC500] rounded-full mx-auto w-16"></div>}
        </button>
      </div>

      {/* القائمة */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#FFC500] border-t-transparent rounded-full animate-spin"></div></div>
        ) : currentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 px-8 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#71767B] flex items-center justify-center mb-4">
              {activeTab === 'quotes' ? <MessageCircle size={32} className="text-[#71767B]" /> : <Repeat2 size={32} className="text-[#71767B]" />}
            </div>
            <h3 className="text-white font-extrabold text-[24px] mb-2">
              {activeTab === 'quotes' ? 'لا توجد اقتباسات حتى الآن' : 'لا يوجد من أعاد النشر بعد'}
            </h3>
            <p className="text-[#71767B] text-[14px] leading-relaxed">
              {activeTab === 'quotes' 
                ? 'أضف رأيك عند مشاركة منشور شخص آخر وسيظهر هنا.' 
                : 'عندما يقوم شخص ما بإعادة نشر هذا المنشور، سيظهر هنا.'}
            </p>
          </div>
        ) : (
          currentList.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between p-4 border-b border-[#2F3336] hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex gap-3">
                <img 
                  src={item.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.profile?.full_name || 'User')}&background=random`} 
                  className="w-10 h-10 rounded-full object-cover shrink-0" 
                  alt="" 
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-[15px] hover:underline">{item.profile?.full_name || 'مستخدم'}</span>
                    {(item.profile?.is_verified || item.profile?.verification_type) && (
                      <BadgeCheck size={16} className="text-[#FFC500]" fill="currentColor" color="black" />
                    )}
                  </div>
                  <span className="text-[#71767B] text-[14px]">@{item.profile?.username || 'user'}</span>
                  
                  {/* عرض نص الاقتباس إذا كنا في تبويب الاقتباسات */}
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
