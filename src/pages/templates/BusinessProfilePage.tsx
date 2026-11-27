import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (typeof window === 'undefined' || !slug) return;
      try {
        const { data } = await supabase.from('businesses').select('is_hidden, status, owner_id').eq('slug', slug).maybeSingle();
        if (!active) return;
        if (data?.is_hidden || String(data?.status || '').toLowerCase() === 'hidden') {
          const { data: { session } } = await supabase.auth.getSession();
          const uid = session?.user?.id || '';
          let ok = Boolean(uid && data?.owner_id === uid);
          if (!ok && uid) {
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
            const r = String((prof as any)?.role || '').toLowerCase();
            ok = Boolean((prof as any)?.is_admin || ['admin', 'super_admin', 'moderator'].includes(r));
          }
          if (!ok) { setIsHidden(true); return; }
        }
      } catch {}
      if (active) window.location.replace('/bank.html?slug=' + slug);
    })();
    return () => { active = false; };
  }, [slug]);

  if (isHidden) {
    return (
      <div dir="rtl" className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center font-['Tahoma',sans-serif]">
        <p className="text-base font-bold text-zinc-200">هذه المنشأة غير متاحة للعرض حالياً</p>
        <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">تم إيقاف عرض هذه المنشأة مؤقتاً في الدليل ونتائج البحث، وقد تكون قيد المراجعة الإدارية.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-6 px-5 py-2 rounded-full border border-[#2F3336] hover:bg-white/10 text-xs font-bold text-white transition cursor-pointer">العودة</button>
      </div>
    );
  }

  return <div className="min-h-screen bg-black flex items-center justify-center text-white font-['Tahoma',sans-serif]">جاري تحميل صفحة المنشأة...</div>;
};
