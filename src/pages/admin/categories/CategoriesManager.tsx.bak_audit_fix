import React, { useState, useEffect } from 'react';
import { FolderTree, Search, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DBCategory {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-6 font-['Cairo',sans-serif] text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FolderTree className="text-[#FFC500]" /> إدارة التصنيفات الرسمية
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            التصنيفات المعتمدة المرتبطة بقاعدة بيانات Supabase وتشمل البنوك، الصرافة، والمحافظ الإلكترونية.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-[#161D2B] border border-[#1F2937] text-xs font-mono font-bold text-[#FFC500]">
          {categories.length} تصنيف معتمد
        </span>
      </div>

      <div className="bg-[#0B0F17] p-3.5 rounded-2xl border border-[#1F2937] flex items-center gap-3">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث باسم التصنيف أو المعرف (slug)..."
          className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">جاري جلب التصنيفات من Supabase...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(cat => (
            <div key={cat.id} className="bg-[#0B0F17] border border-[#1F2937] hover:border-[#FFC500]/40 rounded-2xl p-3.5 flex items-center justify-between transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#161D2B] flex items-center justify-center text-[#FFC500]">
                  <Tag size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{cat.name}</h4>
                  <span className="text-[10px] text-gray-400 font-mono">{cat.slug}</span>
                </div>
              </div>
              <span className="text-[9px] text-gray-500 font-mono">{cat.id.substring(0, 8)}...</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
