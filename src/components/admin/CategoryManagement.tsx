import React, { useState } from 'react';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../../data/categories';
import { Edit2, Eye, EyeOff, Search, MoveUp, MoveDown, Layers } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(OFFICIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const filteredCategories = categories
    .filter(cat => cat.name.includes(searchQuery) || cat.slug.includes(searchQuery))
    .sort((a, b) => a.order - b.order);

  const toggleCategoryStatus = (id: string) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, isActive: !cat.isActive } : cat))
    );
  };

  const moveOrder = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    const temp = newCategories[index].order;
    newCategories[index].order = newCategories[targetIndex].order;
    newCategories[targetIndex].order = temp;

    setCategories(newCategories);
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            إدارة التصنيفات الرسمية
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            التحكم في الـ 34 تصنيفاً المعتمدة، ترتيب ظهورها، وحالة التفعيل للموقع العام
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700">
            الإجمالي: <strong className="text-amber-400">{categories.length}</strong>
          </div>
          <div className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700">
            النشطة: <strong className="text-emerald-400">{categories.filter(c => c.isActive).length}</strong>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="ابحث عن تصنيف بالاسم أو الـ Slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pr-10 pl-4 py-2 text-xs md:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 text-xs font-semibold">
                <th className="py-3 px-4">الترتيب</th>
                <th className="py-3 px-4">الأيقونة</th>
                <th className="py-3 px-4">اسم التصنيف</th>
                <th className="py-3 px-4">Slug الموحد</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs md:text-sm">
              {filteredCategories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <tr key={cat.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5">{cat.order}</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveOrder(index, 'up')}
                            disabled={index === 0}
                            className="text-zinc-400 hover:text-amber-400 disabled:opacity-20"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveOrder(index, 'down')}
                            disabled={index === filteredCategories.length - 1}
                            className="text-zinc-400 hover:text-amber-400 disabled:opacity-20"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-7 h-7 rounded bg-zinc-800 flex items-center justify-center text-amber-400 border border-zinc-700/60">
                        <Icon className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{cat.name}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400 text-xs">{cat.slug}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          cat.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {cat.isActive ? 'مفعل' : 'معطل'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleCategoryStatus(cat.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            cat.isActive
                              ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                              : 'border-amber-400/30 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                          }`}
                          title={cat.isActive ? 'تعطيل التصنيف' : 'تفعيل التصنيف'}
                        >
                          {cat.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="p-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                          title="تعديل الاسم أو الوصف"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingCategory && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-white">تعديل التصنيف: {editingCategory.name}</h3>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">اسم التصنيف</label>
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">الـ Slug الموحد</label>
              <input
                type="text"
                value={editingCategory.slug}
                disabled
                className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-lg px-3 py-2 text-sm text-zinc-400 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setCategories(prev =>
                    prev.map(c => (c.id === editingCategory.id ? editingCategory : c))
                  );
                  setEditingCategory(null);
                }}
                className="px-4 py-2 rounded-lg text-xs bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
