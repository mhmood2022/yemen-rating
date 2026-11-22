import React, { useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ListChecks,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { CommunitySection } from '../../../services/sectionsService';
import {
  fetchTabFormSchema,
  saveTabFormField,
  reorderTabFormFields,
  deleteTabFormFieldSafe,
  saveTabFieldOption,
  reorderTabFieldOptions,
  deleteTabFieldOption,
  type TabFormField,
  type TabFieldType,
  type TabFieldOption,
} from '../../../services/communityTabsAdminService';

interface TabFormsBuilderPanelProps {
  sections: CommunitySection[];
  selectedSectionId: string;
  onSelectSectionId: (id: string) => void;
}

const FIELD_TYPES: Array<{ value: TabFieldType; label: string }> = [
  { value: 'text', label: 'نص قصير (text)' },
  { value: 'number', label: 'رقم (number)' },
  { value: 'select', label: 'قائمة منسدلة (select)' },
  { value: 'textarea', label: 'نص طويل (textarea)' },
  { value: 'boolean', label: 'نعم / لا (boolean)' },
  { value: 'date', label: 'تاريخ (date)' },
  { value: 'tel', label: 'هاتف (tel)' },
  { value: 'url', label: 'رابط (url)' },
];

export const TabFormsBuilderPanel: React.FC<TabFormsBuilderPanelProps> = ({
  sections,
  selectedSectionId,
  onSelectSectionId,
}) => {
  const activeSections = sections.filter((s) => !s.isArchived);
  const [fields, setFields] = useState<TabFormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // نافذة إضافة/تعديل حقل
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<TabFormField | null>(null);
  const [fLabel, setFLabel] = useState('');
  const [fKey, setFKey] = useState('');
  const [fType, setFType] = useState<TabFieldType>('text');
  const [fPlaceholder, setFPlaceholder] = useState('');
  const [fRequired, setFRequired] = useState(false);
  const [fVisible, setFVisible] = useState(true);
  const [fActive, setFActive] = useState(true);
  const [fCardDisplay, setFCardDisplay] = useState(true);

  // إضافة/تعديل خيار قائمة منسدلة
  const [newOptLabel, setNewOptLabel] = useState('');
  const [newOptValue, setNewOptValue] = useState('');
  const [editingOpt, setEditingOpt] = useState<TabFieldOption | null>(null);

  const loadSchema = async () => {
    if (!selectedSectionId) return;
    setLoading(true);
    try {
      const data = await fetchTabFormSchema(selectedSectionId);
      setFields(data);
      if (selectedFieldId && !data.some((f) => f.id === selectedFieldId)) {
        setSelectedFieldId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchema();
  }, [selectedSectionId]);

  const showNotice = (type: 'success' | 'warning' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const openAddField = () => {
    setEditingField(null);
    setFLabel('');
    setFKey('');
    setFType('text');
    setFPlaceholder('');
    setFRequired(false);
    setFVisible(true);
    setFActive(true);
    setFCardDisplay(true);
    setIsFieldModalOpen(true);
  };

  const openEditField = (field: TabFormField) => {
    setEditingField(field);
    setFLabel(field.label);
    setFKey(field.field_key);
    setFType(field.field_type);
    setFPlaceholder(field.placeholder || '');
    setFRequired(field.is_required);
    setFVisible(field.is_visible);
    setFActive(field.is_active);
    setFCardDisplay(field.card_display);
    setIsFieldModalOpen(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fLabel.trim()) {
      showNotice('error', 'يرجى إدخال اسم الحقل.');
      return;
    }
    const res = await saveTabFormField({
      id: editingField?.id,
      section_id: selectedSectionId,
      field_key: fKey || fLabel,
      label: fLabel,
      field_type: fType,
      placeholder: fPlaceholder,
      is_required: fRequired,
      is_visible: fVisible,
      is_active: fActive,
      card_display: fCardDisplay,
      sort_order: editingField ? editingField.sort_order : fields.length + 1,
    });
    if (!res.ok) {
      showNotice('error', res.error || 'تعذر حفظ الحقل');
      return;
    }
    setIsFieldModalOpen(false);
    showNotice('success', editingField ? 'تم تحديث الحقل بنجاح.' : 'تمت إضافة الحقل للنموذج.');
    await loadSchema();
  };

  const moveField = async (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const copy = [...fields];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setFields(copy);
    await reorderTabFormFields(selectedSectionId, copy.map((f) => f.id));
  };

  const handleDeleteField = async (field: TabFormField) => {
    const res = await deleteTabFormFieldSafe(field);
    if (!res.ok) {
      showNotice('error', res.error || 'تعذر حذف الحقل');
      return;
    }
    if (res.archivedOnly) {
      showNotice('warning', `تم تعطيل الحقل "${field.label}" وإخفاؤه فقط لحماية الإعلانات والبيانات التاريخية.`);
    } else {
      showNotice('success', `تم حذف الحقل "${field.label}" نهائياً.`);
    }
    await loadSchema();
  };

  const selectedSelectField = fields.find((f) => f.id === selectedFieldId && f.field_type === 'select') || null;

  const handleSaveOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSelectField || !newOptLabel.trim()) return;
    const res = await saveTabFieldOption({
      id: editingOpt?.id,
      field_id: selectedSelectField.id,
      section_id: selectedSectionId,
      option_value: newOptValue.trim() || newOptLabel.trim(),
      option_label: newOptLabel.trim(),
      sort_order: editingOpt ? editingOpt.sort_order : selectedSelectField.options.length + 1,
      is_active: editingOpt ? editingOpt.is_active : true,
    });
    if (!res.ok) {
      showNotice('error', res.error || 'تعذر حفظ الخيار');
      return;
    }
    setNewOptLabel('');
    setNewOptValue('');
    setEditingOpt(null);
    await loadSchema();
  };

  const handleToggleOption = async (opt: TabFieldOption) => {
    await saveTabFieldOption({
      id: opt.id,
      field_id: opt.field_id,
      section_id: selectedSectionId,
      option_value: opt.option_value,
      option_label: opt.option_label,
      sort_order: opt.sort_order,
      is_active: !opt.is_active,
    });
    await loadSchema();
  };

  const moveOption = async (idx: number, dir: -1 | 1) => {
    if (!selectedSelectField) return;
    const opts = [...selectedSelectField.options];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= opts.length) return;
    const [moved] = opts.splice(idx, 1);
    opts.splice(targetIdx, 0, moved);
    await reorderTabFieldOptions(selectedSectionId, opts.map((o) => o.id));
    await loadSchema();
  };

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : notice.type === 'warning'
              ? 'bg-[#FFC500]/10 border-[#FFC500]/30 text-[#FFC500]'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* اختيار التبويب المستقل */}
      <div className="bg-[#0B0F17] border border-[#2F3336] rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs font-bold text-[#71767B]">
            اختر التبويب لإدارة نموذجه وحقوله المستقلة (لا تتداخل القوائم بين الأقسام):
          </div>
          <button
            type="button"
            onClick={openAddField}
            className="px-3.5 py-1.5 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black text-xs font-black flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>إضافة حقل جديد</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {activeSections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setSelectedFieldId(null);
                onSelectSectionId(sec.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                selectedSectionId === sec.id
                  ? 'bg-[#FFC500] text-black border-[#FFC500]'
                  : 'bg-black text-zinc-300 border-[#2F3336] hover:border-white/50'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* الشبكة الرئيسية: الحقول + إدارة خيارات القائمة المنسدلة */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className={selectedSelectField ? 'lg:col-span-7 space-y-2' : 'lg:col-span-12 space-y-2'}>
          {loading ? (
            <div className="py-12 text-center text-xs text-[#71767B] bg-[#0B0F17] border border-[#2F3336] rounded-2xl">
              جارِ تحميل حقول النموذج...
            </div>
          ) : fields.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71767B] bg-[#0B0F17] border border-[#2F3336] rounded-2xl space-y-2">
              <p className="text-white font-bold">لا توجد حقول مخصصة لهذا التبويب بعد</p>
              <p>اضغط على "إضافة حقل جديد" لبناء نموذج الإدخال الخاص بهذا القسم.</p>
            </div>
          ) : (
            fields.map((field, idx) => (
              <div
                key={field.id}
                className={`bg-[#0B0F17] border rounded-2xl p-3 flex items-center justify-between gap-2 transition ${
                  selectedFieldId === field.id ? 'border-[#FFC500]' : 'border-[#2F3336]'
                } ${!field.is_active ? 'opacity-60' : ''}`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-black text-white">{field.label}</span>
                    <span className="text-[10px] font-mono text-[#71767B]">({field.field_key})</span>
                    <span className="px-2 py-0.5 rounded-full bg-black border border-[#2F3336] text-[10px] text-zinc-300">
                      {field.field_type}
                    </span>
                    {field.is_required && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-bold">
                        إجباري
                      </span>
                    )}
                    {!field.is_visible && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-700/40 text-zinc-400 text-[10px] font-bold flex items-center gap-1">
                        <EyeOff size={10} /> مخفي
                      </span>
                    )}
                    {field.card_display && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                        يظهر بالبطاقة
                      </span>
                    )}
                    {field.is_system && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] flex items-center gap-0.5">
                        <Lock size={9} /> أساسي
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {field.field_type === 'select' && (
                    <button
                      type="button"
                      onClick={() => setSelectedFieldId(selectedFieldId === field.id ? null : field.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                        selectedFieldId === field.id
                          ? 'bg-[#FFC500] text-black border-[#FFC500]'
                          : 'bg-black text-[#FFC500] border-[#FFC500]/30 hover:bg-[#FFC500]/10'
                      }`}
                    >
                      <ListChecks size={12} />
                      <span>الخيارات ({field.options.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveField(idx, -1)}
                    className="p-1.5 rounded-lg bg-black border border-[#2F3336] text-zinc-300 disabled:opacity-30 cursor-pointer"
                    title="رفع لأعلى"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === fields.length - 1}
                    onClick={() => moveField(idx, 1)}
                    className="p-1.5 rounded-lg bg-black border border-[#2F3336] text-zinc-300 disabled:opacity-30 cursor-pointer"
                    title="إنزال لأسفل"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditField(field)}
                    className="p-1.5 rounded-lg bg-black border border-[#2F3336] text-zinc-300 hover:text-[#FFC500] cursor-pointer"
                    title="تعديل الحقل"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteField(field)}
                    className="p-1.5 rounded-lg bg-black border border-[#2F3336] text-rose-400 hover:bg-red-600 hover:text-white cursor-pointer"
                    title={field.is_system ? 'تعطيل آمن' : 'حذف / تعطيل آمن'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* إدارة خيارات القائمة المنسدلة */}
        {selectedSelectField && (
          <div className="lg:col-span-5 bg-[#0B0F17] border border-[#FFC500]/40 rounded-2xl p-4 space-y-3 h-fit">
            <div className="flex items-center justify-between border-b border-[#2F3336] pb-2">
              <div>
                <h4 className="text-xs font-black text-white">خيارات القائمة: {selectedSelectField.label}</h4>
                <p className="text-[10px] text-[#71767B]">مستقلة لهذا الحقل والتبويب فقط</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFieldId(null)}
                className="p-1 text-[#71767B] hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveOption} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newOptLabel}
                onChange={(e) => setNewOptLabel(e.target.value)}
                placeholder={editingOpt ? 'تعديل نص الخيار...' : 'أضف خياراً جديداً...'}
                className="flex-1 bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black cursor-pointer shrink-0"
              >
                {editingOpt ? 'حفظ' : 'إضافة'}
              </button>
              {editingOpt && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingOpt(null);
                    setNewOptLabel('');
                    setNewOptValue('');
                  }}
                  className="p-2 rounded-xl border border-[#2F3336] text-xs text-zinc-400 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </form>

            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {selectedSelectField.options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={`p-2 rounded-xl bg-black border border-[#2F3336] flex items-center justify-between gap-2 ${
                    !opt.is_active ? 'opacity-50' : ''
                  }`}
                >
                  <span className="text-xs font-bold text-white truncate">{opt.option_label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveOption(idx, -1)}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === selectedSelectField.options.length - 1}
                      onClick={() => moveOption(idx, 1)}
                      className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleOption(opt)}
                      className={`p-1 rounded cursor-pointer ${opt.is_active ? 'text-emerald-400' : 'text-zinc-500'}`}
                      title={opt.is_active ? 'إيقاف الخيار' : 'تفعيل الخيار'}
                    >
                      {opt.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingOpt(opt);
                        setNewOptLabel(opt.option_label);
                        setNewOptValue(opt.option_value);
                      }}
                      className="p-1 text-zinc-400 hover:text-[#FFC500] cursor-pointer"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteTabFieldOption(opt.id, selectedSectionId, opt.option_label);
                        await loadSchema();
                      }}
                      className="p-1 text-rose-400 hover:text-red-300 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* نافذة إضافة / تعديل حقل */}
      {isFieldModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsFieldModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-black border border-[#2F3336] rounded-2xl overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#2F3336] flex items-center justify-between">
              <h3 className="text-sm font-black">{editingField ? 'تعديل حقل النموذج' : 'إضافة حقل جديد للنموذج'}</h3>
              <button type="button" onClick={() => setIsFieldModalOpen(false)} className="text-[#71767B] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveField} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">عنوان الحقل الظاهر للمستخدم *</label>
                <input
                  type="text"
                  value={fLabel}
                  onChange={(e) => setFLabel(e.target.value)}
                  placeholder="مثال: سعة البطارية، المساحة، المؤهل..."
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              {!editingField && (
                <div>
                  <label className="block text-xs font-bold mb-1">المفتاح البرمجي (إنجليزي اختياري)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={fKey}
                    onChange={(e) => setFKey(e.target.value)}
                    placeholder="example: storage_gb"
                    className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">نوع الحقل</label>
                <select
                  value={fType}
                  onChange={(e) => setFType(e.target.value as TabFieldType)}
                  className="w-full bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">نص تلميحي داخل الحقل (Placeholder)</label>
                <input
                  type="text"
                  value={fPlaceholder}
                  onChange={(e) => setFPlaceholder(e.target.value)}
                  placeholder="مثال: اختر النوع..."
                  className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                {[
                  { label: 'حقل إجباري', val: fRequired, set: setFRequired },
                  { label: 'ظاهر للمستخدم', val: fVisible, set: setFVisible },
                  { label: 'مفعّل في النموذج', val: fActive, set: setFActive },
                  { label: 'يظهر في بطاقة الإعلان', val: fCardDisplay, set: setFCardDisplay },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => opt.set(!opt.val)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer ${
                      opt.val ? 'border-[#FFC500]/50 bg-[#FFC500]/10 text-white' : 'border-[#2F3336] text-[#71767B]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.val && <Check size={13} className="text-[#FFC500]" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2F3336]">
                <button
                  type="button"
                  onClick={() => setIsFieldModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#2F3336] text-xs font-bold text-white cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FFC500] text-black text-xs font-black cursor-pointer"
                >
                  حفظ الحقل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
