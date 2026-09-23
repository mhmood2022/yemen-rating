import React, { useState, useEffect } from 'react';
import { FolderTree, Search, Plus, Trash2, Tag, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DBCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sort_order?: number;
  created_at?: string;
}

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setErrorMessage('يرجى كتابة اسم التصنيف بالعربية');
      return;
    }

    const slug = newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, '-');
    setSaving(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{
          name: newCatName.trim(),
          slug: slug,
          icon: 'fa-tag'
        }]);

      if (error) throw error;

      setNewCatName('');
      setNewCatSlug('');
      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      setErrorMessage(err?.message || 'تعذر إضافة التصنيف، يرجى المحاولة لاحقاً');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: DBCategory) => {
    if (!window.confirm(`هل أنت متأكد من حذف التصنيف "${cat.name}"؟`)) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', cat.id);
      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (err: any) {
      alert('تعذر حذف التصنيف: ' + (err?.message || 'قد يكون مرتبطاً بمنشآت حالية'));
    }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-6 font-['Cairo',sans-serif] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1F2937]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FolderTree className="text-[#FFC500]" /> إدارة التصنيفات الرسمية
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            إدارة كافة أصناف المنشآت والأنشطة في المنصة وقاعدة بيانات Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 rounded-xl bg-[#161D2B] border border-[#1F2937] text-xs font-mono font-bold text-[#FFC500]">
            {categories.length} تصنيف
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#FFC500] hover:bg-[#e6b200] text-black font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow-md"
          >
            <Plus size={16} /> إضافة تصنيف جديد
          </button>
        </div>
      </div>

      {/* Search */}
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

      {/* Grid */}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  title="حذف التصنيف"
                  className="p-1.5 text-zinc-500 hover:text-red-400 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F172A] border border-[#1F2937] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <h3 className="font-black text-sm text-white">إضافة تصنيف رسمي جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold">اسم التصنيف (بالعربية) *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="مثال: فنادق ومنتجعات، أندية رياضية..."
                  className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none focus:border-[#FFC500]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">المعرف الرابطي بالإنجليزية (Slug) - اختياري</label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="مثال: hotels, gym, resorts"
                  className="w-full p-2.5 bg-[#161D2B] border border-[#1F2937] rounded-xl text-white outline-none font-mono text-[11px] focus:border-[#FFC500]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#161D2B] text-gray-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#FFC500] hover:bg-[#e6b200] text-black font-black flex items-center gap-1.5"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ التصنيف'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
