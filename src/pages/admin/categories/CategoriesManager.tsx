import React, { useState } from 'react';
import { FolderTree, Plus, ChevronRight, Folder, FolderPlus } from 'lucide-react';

interface CategoryNode {
  id: string;
  name: string;
  parentId: string | null;
  itemsCount: number;
  isActive: boolean;
  children?: CategoryNode[];
}

export const CategoriesManager: React.FC = () => {
  const [categories] = useState<CategoryNode[]>([
    {
      id: 'cat-1',
      name: 'العقارات والإنشاءات',
      parentId: null,
      itemsCount: 420,
      isActive: true,
      children: [
        { id: 'sub-101', name: 'شقق للبيع والإيجار', parentId: 'cat-1', itemsCount: 190, isActive: true },
        { id: 'sub-102', name: 'أراضي ومزارع استثمارية', parentId: 'cat-1', itemsCount: 140, isActive: true },
        { id: 'sub-103', name: 'عمائر وفلل تجارية', parentId: 'cat-1', itemsCount: 90, isActive: true },
      ]
    },
    {
      id: 'cat-2',
      name: 'سوق الهواتف والإلكترونيات',
      parentId: null,
      itemsCount: 890,
      isActive: true,
      children: [
        { id: 'sub-201', name: 'هواتف جديدة ومستعملة', parentId: 'cat-2', itemsCount: 650, isActive: true },
        { id: 'sub-202', name: 'قطع غيار وصيانة', parentId: 'cat-2', itemsCount: 240, isActive: true },
      ]
    },
    {
      id: 'cat-3',
      name: 'المزادات والمعدات الثقيلة',
      parentId: null,
      itemsCount: 75,
      isActive: true,
      children: [
        { id: 'sub-301', name: 'سيارات ومعدات', parentId: 'cat-3', itemsCount: 45, isActive: true },
        { id: 'sub-302', name: 'معدات صناعية ومولدات', parentId: 'cat-3', itemsCount: 30, isActive: true },
      ]
    }
  ]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderTree className="text-[#FFC500]" />
            التصنيفات الهرمية (Parent / Child)
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            إدارة شجرة التصنيفات المعتمدة باستخدام parent_id وتنظيم الفروع بدقة.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((parent) => (
          <div key={parent.id} className="bg-[#0B0F17] rounded-xl border border-[#1F2937] p-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFC500]/15 text-[#FFC500] flex items-center justify-center font-bold">
                  <Folder size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{parent.name}</h3>
                  <span className="text-[10px] text-[#9CA3AF] font-mono">{parent.itemsCount} منشأة مسجلة</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded bg-[#16A34A]/15 text-[#16A34A] text-[10px] font-bold">
                تصنيف رئيسي نشط
              </span>
            </div>

            {/* الفروع التابعة (Child Subcategories) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mr-6">
              {parent.children?.map((sub) => (
                <div key={sub.id} className="p-2.5 rounded-lg bg-[#161D2B] border border-[#1F2937] flex items-center justify-between">
                  <span className="text-xs text-[#D1D5DB] font-semibold flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-[#FFC500]" />
                    {sub.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#9CA3AF]">{sub.itemsCount} عنصر</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
