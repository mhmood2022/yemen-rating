import React, { useEffect, useState } from 'react';
import { Wallet, Plus, Edit2, Trash2, X, Upload, Eye, EyeOff, CheckCircle2, AlertTriangle, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_url: string | null;
  qr_code_url: string | null;
  phone_number: string | null;
  wallet_number: string | null;
  point_number: string | null;
  account_number: string | null;
  iban: string | null;
  account_name: string | null;
  bank_name: string | null;
  instructions: string | null;
  is_active: boolean;
  display_order: number;
}

const EMPTY_METHOD: PaymentMethod = {
  id: '',
  name: '',
  type: 'wallet',
  icon_url: null,
  qr_code_url: null,
  phone_number: null,
  wallet_number: null,
  point_number: null,
  account_number: null,
  iban: null,
  account_name: null,
  bank_name: null,
  instructions: null,
  is_active: true,
  display_order: 0,
};

type FilterType = 'all' | 'active' | 'hidden';

interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}

const CustomDropdown: React.FC<DropdownProps> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm hover:border-[#FFC500] transition"
      >
        <span>{current?.label || 'اختر...'}</span>
        <ChevronDown className={`w-4 h-4 text-[#FFC500] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 inset-x-0 z-50 bg-black rounded-lg overflow-hidden shadow-2xl border border-[#2A2B30]">
            {options.map(opt => {
              const isActive = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full text-right px-3 py-2.5 text-sm transition"
                  style={{
                    background: isActive ? '#FFC500' : 'transparent',
                    color: isActive ? '#000' : '#FFF',
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const PaymentMethodsTab: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_payment_methods');
      if (error) throw error;
      setMethods(data || []);
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      showToast('تعذر جلب طرق الدفع: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleFileUpload = async (file: File, field: 'icon_url' | 'qr_code_url') => {
    if (!editing) return;
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${field}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-methods')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-methods')
        .getPublicUrl(fileName);

      setEditing({ ...editing, [field]: urlData.publicUrl });
      showToast('تم رفع الصورة بنجاح', 'success');
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      showToast('تعذر رفع الصورة: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      showToast('اسم الطريقة مطلوب', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('manage_payment_method', {
        p_id: editing.id || null,
        p_name: editing.name,
        p_type: editing.type,
        p_icon_url: editing.icon_url,
        p_qr_code_url: editing.qr_code_url,
        p_phone_number: editing.phone_number,
        p_wallet_number: editing.wallet_number,
        p_point_number: editing.point_number,
        p_account_number: editing.account_number,
        p_iban: editing.iban,
        p_account_name: editing.account_name,
        p_bank_name: editing.bank_name,
        p_instructions: editing.instructions,
        p_is_active: editing.is_active,
        p_display_order: editing.display_order
      });

      if (error) throw error;

      showToast(editing.id ? 'تم التحديث بنجاح ✅' : 'تمت الإضافة بنجاح ✅', 'success');
      setEditing(null);
      fetchMethods();
    } catch (err: any) {
      console.error('❌ Save error:', err);
      showToast('تعذر الحفظ: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الطريقة نهائياً؟')) return;
    try {
      const { error } = await supabase.rpc('delete_payment_method', { p_id: id });
      if (error) throw error;
      showToast('تم الحذف بنجاح', 'success');
      fetchMethods();
    } catch (err: any) {
      showToast('تعذر الحذف: ' + err.message, 'error');
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      const { error } = await supabase.rpc('toggle_payment_method', {
        p_id: method.id,
        p_is_active: !method.is_active,
      });
      if (error) throw error;
      showToast(
        method.is_active ? 'تم إخفاء الطريقة من الزبناء' : 'تم تفعيل الطريقة للزبناء',
        'success'
      );
      fetchMethods();
    } catch (err: any) {
      showToast('تعذر التحديث', 'error');
    }
  };

  // الفلترة
  const filteredMethods = methods.filter(m => {
    if (filter === 'active') return m.is_active;
    if (filter === 'hidden') return !m.is_active;
    return true;
  });

  const counts = {
    all: methods.length,
    active: methods.filter(m => m.is_active).length,
    hidden: methods.filter(m => !m.is_active).length,
  };

  if (loading) return <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>;

  return (
    <div className="space-y-4 relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[200] p-4 rounded-xl shadow-2xl flex items-center gap-3 border animate-slide-down ${
            toast.type === 'success'
              ? 'bg-[#0a1f0a] border-green-500/40 text-green-400'
              : 'bg-[#1f0a0a] border-red-500/40 text-red-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#FFC500]" /> طرق الدفع
        </h2>
        <button
          onClick={() => setEditing({ ...EMPTY_METHOD })}
          className="px-4 py-2 rounded-lg bg-[#FFC500] text-black text-xs font-bold flex items-center gap-1 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" /> إضافة طريقة
        </button>
      </div>

      {/* فلاتر (الكل / نشطة / مخفية) */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            filter === 'all' ? 'bg-[#FFC500] text-black' : 'bg-[#111] text-zinc-400 border border-[#2A2B30]'
          }`}
        >
          الكل ({counts.all})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            filter === 'active' ? 'bg-green-500 text-white' : 'bg-[#111] text-zinc-400 border border-[#2A2B30]'
          }`}
        >
          نشطة ({counts.active})
        </button>
        <button
          onClick={() => setFilter('hidden')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
            filter === 'hidden' ? 'bg-red-500 text-white' : 'bg-[#111] text-zinc-400 border border-[#2A2B30]'
          }`}
        >
          مخفية ({counts.hidden})
        </button>
      </div>

      {/* List */}
      {filteredMethods.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 bg-black border border-[#2A2B30] rounded-xl">
          {filter === 'active' ? 'لا توجد طرق دفع نشطة.' : filter === 'hidden' ? 'لا توجد طرق دفع مخفية.' : 'لا توجد طرق دفع مضافة.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {filteredMethods.map(method => (
            <div 
              key={method.id} 
              className="p-3 rounded-xl border bg-black"
              style={{ borderColor: method.is_active ? '#2A2B30' : '#EF444440' }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-[#111] flex items-center justify-center overflow-hidden shrink-0 border border-[#2A2B30]">
                  {method.icon_url ? (
                    <img src={method.icon_url} alt={method.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Wallet className="w-6 h-6 text-zinc-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-white truncate">{method.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      method.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {method.is_active ? 'نشطة' : 'مخفية'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {method.type === 'wallet' ? 'محفظة إلكترونية' : method.type === 'bank' ? 'حساب بنكي' : 'باي بال'}
                  </p>
                  {method.phone_number && <p className="text-xs text-zinc-400 mt-1" dir="ltr">📞 {method.phone_number}</p>}
                  {method.account_number && <p className="text-xs text-zinc-400 mt-1" dir="ltr">🏦 {method.account_number}</p>}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button 
                    onClick={() => handleToggleActive(method)} 
                    className={`p-1.5 relative ${method.is_active ? 'text-zinc-400 hover:text-[#FFC500]' : 'text-red-400 hover:text-red-300'}`}
                    title={method.is_active ? 'إخفاء من الزبناء' : 'تفعيل للزبناء'}
                  >
                    <Eye className="w-4 h-4" />
                    {!method.is_active && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-5 h-0.5 bg-red-400 rotate-45 transform origin-center" />
                      </span>
                    )}
                  </button>
                  <button onClick={() => setEditing(method)} className="p-1.5 text-zinc-400 hover:text-[#FFC500]" title="تعديل">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذه الطريقة نهائياً؟')) {
                        handleDelete(method.id);
                      }
                    }} 
                    className="p-1.5 text-zinc-400 hover:text-red-500" 
                    title="حذف نهائي"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl p-5 space-y-4 bg-black border border-[#2A2B30] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#2A2B30] pb-3">
              <h3 className="text-base font-bold text-white">
                {editing.id ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة'}
              </h3>
              <button onClick={() => setEditing(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#FFC500] font-bold block mb-1">اسم الطريقة <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    placeholder="مثال: محفظة جيب"
                    className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#FFC500] font-bold block mb-1">النوع <span className="text-red-500">*</span></label>
                  <CustomDropdown
                    value={editing.type}
                    options={[
                      { value: 'wallet', label: 'محفظة إلكترونية' },
                      { value: 'bank', label: 'حساب بنكي' },
                      { value: 'paypal', label: 'باي بال (PayPal)' },
                    ]}
                    onChange={(v) => setEditing({ ...editing, type: v })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#FFC500] font-bold block mb-1">الأيقونة</label>
                  <label className="block cursor-pointer">
                    <div className="w-full h-24 rounded-lg bg-[#111] border border-dashed border-[#71767B] flex flex-col items-center justify-center text-zinc-500 hover:border-[#FFC500] transition">
                      {editing.icon_url ? (
                        <img src={editing.icon_url} alt="" className="w-full h-full object-contain p-2" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-xs">اختر أيقونة</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'icon_url')}
                    />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-[#FFC500] font-bold block mb-1">الباركود (QR)</label>
                  <label className="block cursor-pointer">
                    <div className="w-full h-24 rounded-lg bg-[#111] border border-dashed border-[#71767B] flex flex-col items-center justify-center text-zinc-500 hover:border-[#FFC500] transition">
                      {editing.qr_code_url ? (
                        <img src={editing.qr_code_url} alt="" className="w-full h-full object-contain p-2" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-xs">اختر صورة QR</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'qr_code_url')}
                    />
                  </label>
                </div>
              </div>

              <div className="border-t border-[#2A2B30] pt-3">
                <p className="text-xs text-zinc-500 mb-2">الحقول التي تُملأ تظهر للمستخدم.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#FFC500] font-bold block mb-1">رقم الهاتف</label>
                    <input type="text" value={editing.phone_number || ''} onChange={e => setEditing({ ...editing, phone_number: e.target.value || null })} placeholder="770 XXX XXXX" className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs text-[#FFC500] font-bold block mb-1">رقم المحفظة</label>
                    <input type="text" value={editing.wallet_number || ''} onChange={e => setEditing({ ...editing, wallet_number: e.target.value || null })} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs text-[#FFC500] font-bold block mb-1">رقم النقطة</label>
                    <input type="text" value={editing.point_number || ''} onChange={e => setEditing({ ...editing, point_number: e.target.value || null })} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs text-[#FFC500] font-bold block mb-1">رقم الحساب البنكي</label>
                    <input type="text" value={editing.account_number || ''} onChange={e => setEditing({ ...editing, account_number: e.target.value || null })} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs text-[#FFC500] font-bold block mb-1">IBAN (دولي)</label>
                    <input type="text" value={editing.iban || ''} onChange={e => setEditing({ ...editing, iban: e.target.value || null })} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="text-xs text-[#FFC500] font-bold block mb-1">اسم المستفيد</label>
                    <input type="text" value={editing.account_name || ''} onChange={e => setEditing({ ...editing, account_name: e.target.value || null })} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-[#FFC500] font-bold block mb-1">اسم البنك (للبنوك فقط)</label>
                    <input type="text" value={editing.bank_name || ''} onChange={e => setEditing({ ...editing, bank_name: e.target.value || null })} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-[#FFC500] font-bold block mb-1">ترتيب العرض</label>
                    <input type="number" value={editing.display_order} onChange={e => setEditing({ ...editing, display_order: Number(e.target.value) })} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#FFC500] font-bold block mb-1">تعليمات للمستخدم</label>
                <textarea value={editing.instructions || ''} onChange={e => setEditing({ ...editing, instructions: e.target.value || null })} rows={2} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} className="accent-[#FFC500] w-4 h-4" />
                <span className="text-sm text-white">نشطة (تظهر للزبناء)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#2A2B30]">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-lg bg-zinc-900 text-white text-xs font-bold border border-[#71767B] active:scale-95 transition">إلغاء</button>
              <button onClick={handleSave} disabled={isSaving || isUploading} className="flex-1 py-2.5 rounded-lg bg-[#FFC500] text-black text-xs font-bold disabled:opacity-50 active:scale-95 transition">
                {isSaving ? 'جاري الحفظ...' : isUploading ? 'جاري الرفع...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
