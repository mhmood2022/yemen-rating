import React, { useEffect, useState } from 'react';
import { Percent, Plus, Edit2, Trash2, X, Eye, EyeOff, CheckCircle2, AlertTriangle, Gift, ChevronDown } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface CommissionRule {
  id: string;
  service_type: string;
  name: string;
  payer: string;
  calculation_type: string;
  percentage: number | null;
  fixed_amount: number | null;
  seller_percentage: number | null;
  buyer_percentage: number | null;
  seller_fixed_amount: number | null;
  buyer_fixed_amount: number | null;
  currency: string;
  min_amount: number | null;
  max_amount: number | null;
  show_to_seller: boolean;
  show_to_buyer: boolean;
  is_active: boolean;
  display_order: number;
}

const EMPTY_RULE: CommissionRule = {
  id: '',
  service_type: 'auction',
  name: '',
  payer: 'both',
  calculation_type: 'percentage',
  percentage: 0,
  fixed_amount: 0,
  seller_percentage: 10,
  buyer_percentage: 5,
  seller_fixed_amount: 0,
  buyer_fixed_amount: 0,
  currency: 'YER',
  min_amount: null,
  max_amount: null,
  show_to_seller: true,
  show_to_buyer: true,
  is_active: true,
  display_order: 0,
};

const SERVICE_LABELS: Record<string, string> = {
  auction: 'المزادات',
  property_sale: 'بيع العقارات',
  property_rent: 'إيجار العقارات',
  job_placement: 'التوظيف',
};

const SERVICE_OPTIONS = [
  { value: 'auction', label: 'المزادات' },
  { value: 'property_sale', label: 'بيع العقارات' },
  { value: 'property_rent', label: 'إيجار العقارات' },
  { value: 'job_placement', label: 'التوظيف' },
];

const PAYER_OPTIONS = [
  { value: 'both', label: 'الطرفان (بائع + مشتري)' },
  { value: 'seller', label: 'البائع فقط' },
  { value: 'buyer', label: 'المشتري فقط' },
  { value: 'none', label: 'مجانية (لا أحد)' },
];

const CALC_OPTIONS = [
  { value: 'percentage', label: 'نسبة مئوية (%)' },
  { value: 'fixed', label: 'مبلغ ثابت' },
];

const CURRENCY_OPTIONS = [
  { value: 'YER', label: 'ريال يمني (YER)' },
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
];

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

export const CommissionRulesTab: React.FC = () => {
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CommissionRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('commission_rules')
        .select('*')
        .order('service_type', { ascending: true });
      if (error) throw error;
      setRules(data || []);
    } catch (err: any) {
      showToast('تعذر جلب القواعد: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      showToast('اسم القاعدة مطلوب', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('manage_commission_rule', {
        p_id: editing.id || null,
        p_service_type: editing.service_type,
        p_name: editing.name,
        p_payer: editing.payer,
        p_calculation_type: editing.calculation_type,
        p_percentage: editing.percentage || 0,
        p_fixed_amount: editing.fixed_amount || 0,
        p_seller_percentage: editing.seller_percentage || 0,
        p_buyer_percentage: editing.buyer_percentage || 0,
        p_seller_fixed_amount: editing.seller_fixed_amount || 0,
        p_buyer_fixed_amount: editing.buyer_fixed_amount || 0,
        p_currency: editing.currency,
        p_min_amount: editing.min_amount,
        p_max_amount: editing.max_amount,
        p_show_to_seller: editing.show_to_seller,
        p_show_to_buyer: editing.show_to_buyer,
        p_is_active: editing.is_active,
        p_display_order: editing.display_order,
      });

      if (error) throw error;

      showToast(editing.id ? 'تم التحديث ✅' : 'تمت الإضافة ✅', 'success');
      setEditing(null);
      fetchRules();
    } catch (err: any) {
      showToast('تعذر الحفظ: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) return;
    try {
      const { error } = await supabase.rpc('delete_commission_rule', { p_id: id });
      if (error) throw error;
      showToast('تم الحذف بنجاح', 'success');
      fetchRules();
    } catch (err: any) {
      showToast('تعذر الحذف: ' + err.message, 'error');
    }
  };

  const handleToggleActive = async (rule: CommissionRule) => {
    try {
      const { error } = await supabase.rpc('toggle_commission_rule', {
        p_id: rule.id,
        p_is_active: !rule.is_active,
      });
      if (error) throw error;
      fetchRules();
    } catch (err: any) {
      showToast('تعذر التحديث', 'error');
    }
  };

  const handleMakeFree = async (rule: CommissionRule) => {
    if (!confirm('هل تريد جعل هذه العمولة مجانية (0%)؟')) return;
    try {
      const { error } = await supabase.rpc('manage_commission_rule', {
        p_id: rule.id,
        p_service_type: rule.service_type,
        p_name: rule.name + ' (مجانية)',
        p_payer: 'none',
        p_calculation_type: 'percentage',
        p_percentage: 0,
        p_fixed_amount: 0,
        p_seller_percentage: 0,
        p_buyer_percentage: 0,
        p_seller_fixed_amount: 0,
        p_buyer_fixed_amount: 0,
        p_currency: rule.currency,
        p_min_amount: null,
        p_max_amount: null,
        p_show_to_seller: false,
        p_show_to_buyer: false,
        p_is_active: true,
        p_display_order: rule.display_order,
      });
      if (error) throw error;
      showToast('تم جعل العمولة مجانية', 'success');
      fetchRules();
    } catch (err: any) {
      showToast('تعذر التحديث: ' + err.message, 'error');
    }
  };

  const getCommissionText = (rule: CommissionRule) => {
    if (rule.payer === 'none') return 'مجانية';
    if (rule.calculation_type === 'fixed') {
      if (rule.payer === 'both') return `${rule.seller_fixed_amount || 0} + ${rule.buyer_fixed_amount || 0} ${rule.currency}`;
      return `${rule.fixed_amount || 0} ${rule.currency}`;
    }
    if (rule.payer === 'both') {
      return `البائع: ${rule.seller_percentage || 0}% · المشتري: ${rule.buyer_percentage || 0}%`;
    }
    if (rule.payer === 'seller') return `البائع: ${rule.seller_percentage || 0}% (${rule.currency})`;
    if (rule.payer === 'buyer') return `المشتري: ${rule.buyer_percentage || 0}% (${rule.currency})`;
    return 'غير محدد';
  };

  if (loading) return <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>;

  return (
    <div className="space-y-4 relative">
      {toast && (
        <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[200] p-4 rounded-xl shadow-2xl flex items-center gap-3 border animate-slide-down ${
          toast.type === 'success'
            ? 'bg-[#0a1f0a] border-green-500/40 text-green-400'
            : 'bg-[#1f0a0a] border-red-500/40 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Percent className="w-5 h-5 text-[#FFC500]" /> قواعد العمولات
        </h2>
        <button
          onClick={() => setEditing({ ...EMPTY_RULE })}
          className="px-4 py-2 rounded-lg bg-[#FFC500] text-black text-xs font-bold flex items-center gap-1 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" /> إضافة قاعدة
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 bg-black border border-[#2A2B30] rounded-xl">
          لا توجد قواعد عمولات مضافة.
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 rounded-xl border border-[#2A2B30] bg-black">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white truncate">{rule.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      rule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {rule.is_active ? 'نشطة' : 'موقوفة'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">{SERVICE_LABELS[rule.service_type] || rule.service_type}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-[#FFC500]/10 text-[#FFC500] font-bold">
                      {getCommissionText(rule)}
                    </span>
                    {rule.show_to_seller && <span className="text-green-400">👁️ للبائع</span>}
                    {rule.show_to_buyer && <span className="text-blue-400">👁️ للمشتري</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => handleToggleActive(rule)} className="p-1.5 text-zinc-400 hover:text-[#FFC500]" title={rule.is_active ? 'إيقاف' : 'تفعيل'}>
                    {rule.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditing(rule)} className="p-1.5 text-zinc-400 hover:text-[#FFC500]" title="تعديل">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-zinc-400 hover:text-red-500" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#2A2B30] flex gap-2">
                <button
                  onClick={() => handleMakeFree(rule)}
                  disabled={rule.payer === 'none'}
                  className="flex-1 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30"
                >
                  <Gift className="w-3.5 h-3.5" /> جعلها مجانية
                </button>
                <button
                  onClick={() => setEditing(rule)}
                  className="flex-1 py-1.5 rounded-lg bg-[#FFC500]/10 text-[#FFC500] border border-[#FFC500]/30 text-xs font-bold"
                >
                  تعديل النسب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div onClick={e => e.stopPropagation()} className="relative w-full max-w-lg rounded-2xl p-5 space-y-4 bg-black border border-[#2A2B30] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2A2B30] pb-3">
              <h3 className="text-base font-bold text-white">{editing.id ? 'تعديل القاعدة' : 'قاعدة جديدة'}</h3>
              <button onClick={() => setEditing(null)} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#FFC500] font-bold block mb-1">الخدمة</label>
                <CustomDropdown
                  value={editing.service_type}
                  options={SERVICE_OPTIONS}
                  onChange={(v) => setEditing({...editing, service_type: v})}
                />
              </div>
              <div>
                <label className="text-xs text-[#FFC500] font-bold block mb-1">اسم القاعدة</label>
                <input type="text" value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#FFC500] font-bold block mb-1">من يدفع؟</label>
                <CustomDropdown
                  value={editing.payer}
                  options={PAYER_OPTIONS}
                  onChange={(v) => setEditing({...editing, payer: v})}
                />
              </div>
              <div>
                <label className="text-xs text-[#FFC500] font-bold block mb-1">طريقة الحساب</label>
                <CustomDropdown
                  value={editing.calculation_type}
                  options={CALC_OPTIONS}
                  onChange={(v) => setEditing({...editing, calculation_type: v})}
                />
              </div>
              <div>
                <label className="text-xs text-[#FFC500] font-bold block mb-1">العملة</label>
                <CustomDropdown
                  value={editing.currency}
                  options={CURRENCY_OPTIONS}
                  onChange={(v) => setEditing({...editing, currency: v})}
                />
              </div>

              {editing.calculation_type === 'percentage' && (
                <>
                  {editing.payer !== 'buyer' && (
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">نسبة البائع (%)</label>
                      <input type="number" step="0.01" value={editing.seller_percentage || 0} onChange={e => setEditing({...editing, seller_percentage: Number(e.target.value)})} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                    </div>
                  )}
                  {editing.payer !== 'seller' && (
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">نسبة المشتري (%)</label>
                      <input type="number" step="0.01" value={editing.buyer_percentage || 0} onChange={e => setEditing({...editing, buyer_percentage: Number(e.target.value)})} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                    </div>
                  )}
                </>
              )}

              {editing.calculation_type === 'fixed' && (
                <>
                  {editing.payer !== 'buyer' && (
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">مبلغ ثابت للبائع</label>
                      <input type="number" value={editing.seller_fixed_amount || 0} onChange={e => setEditing({...editing, seller_fixed_amount: Number(e.target.value)})} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                    </div>
                  )}
                  {editing.payer !== 'seller' && (
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">مبلغ ثابت للمشتري</label>
                      <input type="number" value={editing.buyer_fixed_amount || 0} onChange={e => setEditing({...editing, buyer_fixed_amount: Number(e.target.value)})} className="w-full bg-black border border-[#71767B] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-white">
                  <input type="checkbox" checked={editing.show_to_seller} onChange={e => setEditing({...editing, show_to_seller: e.target.checked})} className="accent-[#FFC500]" />
                  إظهار للبائع
                </label>
                <label className="flex items-center gap-2 text-xs text-white">
                  <input type="checkbox" checked={editing.show_to_buyer} onChange={e => setEditing({...editing, show_to_buyer: e.target.checked})} className="accent-[#FFC500]" />
                  إظهار للمشتري
                </label>
                <label className="flex items-center gap-2 text-xs text-white">
                  <input type="checkbox" checked={editing.is_active} onChange={e => setEditing({...editing, is_active: e.target.checked})} className="accent-[#FFC500]" />
                  نشطة
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#2A2B30]">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-lg bg-zinc-900 text-white text-xs font-bold border border-[#71767B]">إلغاء</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 rounded-lg bg-[#FFC500] text-black text-xs font-bold disabled:opacity-50">
                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
