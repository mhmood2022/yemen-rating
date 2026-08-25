import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('🚀 بدء تحميل التصنيفات...');
      const { data, error } = await supabase
        .from('categories')
        .select('slug, name, icon, sort_order')
        .order('sort_order');

      if (error) {
        console.error('❌ خطأ:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log('✅ التصنيفات المحملة:', data?.length);
      setCategories(data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('❌ خطأ غير متوقع:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#FFC107] mb-4"></i>
          <p className="text-neutral-400 text-sm">جاري تحميل التصنيفات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <i className="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
          <p className="text-red-400 text-sm mb-2">حدث خطأ:</p>
          <p className="text-neutral-400 text-xs">{error}</p>
          <button 
            onClick={loadCategories}
            className="mt-4 bg-[#FFC107] text-black px-4 py-2 rounded-xl text-sm font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E6E6E6] font-sans pb-20" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 pt-4">

        {/* العنوان */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-[#FFC107] mb-2">يمن ريتغ</h1>
          <p className="text-neutral-400 text-sm">دليلك الشامل للأنشطة والخدمات في اليمن</p>
        </div>

        {/* شبكة التصنيفات */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-white">التصنيفات الرئيسية</h2>
          <span className="text-xs text-[#FFC107] font-bold">{categories.length} تصنيفاً</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => onNavigate(`/${cat.slug}`)}
              className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#FFC107] p-4 rounded-2xl text-center cursor-pointer transition group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[#141414] text-[#FFC107] group-hover:bg-[#FFC107] group-hover:text-black flex items-center justify-center mx-auto mb-2 transition text-xl">
                <i className={`fa-solid ${cat.icon}`}></i>
              </div>
              <div className="text-sm font-bold text-white mb-1">{cat.name}</div>
              <div className="text-xs text-neutral-500">{cat.slug}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
