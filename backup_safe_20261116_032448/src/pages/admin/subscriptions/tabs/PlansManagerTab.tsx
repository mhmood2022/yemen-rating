import React, { useEffect, useState } from 'react';
import { Package, Edit2, X, Plus, Trash2, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import { VerifiedBadge } from '../../../../components/common/VerifiedBadge';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  badge_type: string;
  is_active: boolean;
}

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

export const PlansManagerTab: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const durationOptions = [
    { label: 'يوم واحد', value: 1 },
    { label: 'أسبوع', value: 7 },
    { label: 'أسبوعين', value: 14 },
    { label: 'شهر', value: 30 },
    { label: '3 أشهر', value: 90 },
    { label: '6 أشهر', value: 180 },
    { label: 'سنة', value: 365 },
  ];

  const currencyOptions = [
    { label: 'ريال يمني (YER)', value: 'YER' },
    { label: 'دولار (USD)', value: 'USD' },
  ];

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
    if (data) {
      setPlans(data.map(p => ({
        ...p,
        features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || [])
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleEditClick = (plan: Plan) => {
    setEditingPlan({ ...plan });
    setEditFeatures(plan.features || []);
    setNewFeature('');
    setCurrencyOpen(false);
    setDurationOpen(false);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setEditFeatures([...editFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setEditFeatures(editFeatures.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    
    if (!editingPlan.name.trim()) {
      showToast('اسم الباقة مطلوب', 'error');
      return;
    }
    if (editingPlan.price <= 0) {
      showToast('السعر يجب أن يكون أكبر من صفر', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // استخدام RPC لتجاوز RLS
      const { error } = await supabase.rpc('update_subscription_plan', {
        plan_id: editingPlan.id,
        p_name: editingPlan.name,
        p_description: editingPlan.description,
        p_price: editingPlan.price,
        p_currency: editingPlan.currency,
        p_duration_days: editingPlan.duration_days,
        p_features: editFeatures,
        p_is_active: editingPlan.is_active
      });

      if (error) throw error;
      
      showToast('تم حفظ التعديلات بنجاح ✅', 'success');
      setEditingPlan(null);
      fetchPlans(); // إعادة جلب البيانات
    } catch (err: any) {
      console.error('❌ Save error:', err);
      showToast('فشل الحفظ: ' + (err.message || 'خطأ غير معروف'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getDurationLabel = (days: number) => {
    const option = durationOptions.find(o => o.value === days);
    return option ? option.label : `${days} يوم`;
  };

  if (loading) return <div className="text-center py-10 text-zinc-500">جاري التحميل...</div>;

  return (
    <div className="space-y-4 relative">
      
      {toast && (
        <div 
          className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[200] p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-down border ${
            toast.type === 'success' 
              ? 'bg-[#0a1f0a] border-green-500/40 text-green-400' 
              : 'bg-[#1f0a0a] border-red-500/40 text-red-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-[#FFC500]" /> إدارة الباقات
      </h2>

      {plans.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">لا توجد باقات مضافة</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="p-4 rounded-xl border border-[#2A2B30] bg-black">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{plan.name}</h3>
                  <VerifiedBadge type={plan.badge_type as any} size={16} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${plan.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {plan.is_active ? 'نشطة' : 'موقوفة'}
                  </span>
                  <button onClick={() => handleEditClick(plan)} className="p-1 text-zinc-400 hover:text-[#FFC500]">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-3">{plan.description}</p>
              <div className="flex flex-col gap-1 mb-3">
                {plan.features.map((f, i) => (
                  <span key={i} className="text-xs text-zinc-300 flex items-center gap-1"><span className="text-green-500">✓</span> {f}</span>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-[#2A2B30] pt-3 text-sm">
                <span className="font-black text-[#FFC500]">{plan.price} {plan.currency}</span>
                <span className="text-zinc-400">{getDurationLabel(plan.duration_days)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => { setEditingPlan(null); setCurrencyOpen(false); setDurationOpen(false); }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl bg-black border border-[#2A2B30] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#2A2B30] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">تعديل الباقة</h3>
                <p className="text-sm text-[#FFC500] font-bold">{editingPlan.name}</p>
              </div>
              <button onClick={() => { setEditingPlan(null); setCurrencyOpen(false); setDurationOpen(false); }} className="p-1 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">اسم الباقة</label>
                <input type="text" value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} className="w-full bg-[#111] border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">الوصف</label>
                <textarea value={editingPlan.description || ''} onChange={e => setEditingPlan({...editingPlan, description: e.target.value})} rows={2} className="w-full bg-[#111] border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">السعر</label>
                  <input type="number" value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: Number(e.target.value)})} className="w-full bg-[#111] border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                </div>
                
                <div className="relative">
                  <label className="text-xs text-zinc-400 block mb-1">العملة</label>
                  <button type="button" onClick={() => setCurrencyOpen(!currencyOpen)} className="w-full flex items-center justify-between bg-[#111] border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none">
                    <span>{currencyOptions.find(o => o.value === editingPlan.currency)?.label || editingPlan.currency}</span>
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </button>
                  {currencyOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
                      <div className="absolute top-full mt-1 right-0 w-full z-50 bg-[#111] border border-[#2A2B30] rounded-lg overflow-hidden shadow-xl">
                        {currencyOptions.map(opt => (
                          <button key={opt.value} type="button" onClick={() => { setEditingPlan({...editingPlan, currency: opt.value}); setCurrencyOpen(false); }} className="w-full text-right px-3 py-2 text-sm text-white hover:bg-white/5 transition">
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="text-xs text-zinc-400 block mb-1">المدة</label>
                <button type="button" onClick={() => setDurationOpen(!durationOpen)} className="w-full flex items-center justify-between bg-[#111] border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none">
                  <span>{durationOptions.find(o => o.value === editingPlan.duration_days)?.label || `${editingPlan.duration_days} يوم`}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>
                {durationOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDurationOpen(false)} />
                    <div className="absolute top-full mt-1 right-0 w-full z-50 bg-[#111] border border-[#2A2B30] rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                      {durationOptions.map(opt => (
                        <button key={opt.value} type="button" onClick={() => { setEditingPlan({...editingPlan, duration_days: opt.value}); setDurationOpen(false); }} className="w-full text-right px-3 py-2 text-sm text-white hover:bg-white/5 transition">
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={editingPlan.is_active} onChange={e => setEditingPlan({...editingPlan, is_active: e.target.checked})} className="accent-[#FFC500] w-4 h-4" />
                <span className="text-sm text-white">الباقة نشطة (تظهر للمستخدمين)</span>
              </div>
              
              <div className="pt-3 border-t border-[#2A2B30]">
                <label className="text-xs text-zinc-400 block mb-2">الميزات</label>
                <div className="space-y-2 mb-2">
                  {editFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input type="text" value={feature} onChange={e => {
                        const newArr = [...editFeatures];
                        newArr[index] = e.target.value;
                        setEditFeatures(newArr);
                      }} className="flex-1 bg-[#111] border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" />
                      <button type="button" onClick={() => handleRemoveFeature(index)} className="p-2 text-red-500 hover:text-red-400 bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)} placeholder="أضف ميزة جديدة..." className="flex-1 bg-[#111] border border-[#2A2B30] rounded-lg p-2 text-white text-sm focus:border-[#FFC500] outline-none" onKeyDown={e => e.key === 'Enter' && handleAddFeature()} />
                  <button type="button" onClick={handleAddFeature} className="px-3 py-2 bg-[#FFC500] text-black font-bold rounded-lg text-sm flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#2A2B30]">
              <button onClick={() => { setEditingPlan(null); setCurrencyOpen(false); setDurationOpen(false); }} className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-white text-xs font-bold active:scale-95 transition">إلغاء</button>
              <button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 py-2.5 rounded-lg bg-[#FFC500] text-black text-xs font-bold disabled:opacity-50 active:scale-95 transition">
                {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
