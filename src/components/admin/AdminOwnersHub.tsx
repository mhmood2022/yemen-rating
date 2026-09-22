'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, Clock, Check, X, AlertTriangle, Building2, 
  Phone, MapPin, RefreshCw, Sparkles, Image as ImageIcon, Globe, Navigation, MessageCircle 
} from 'lucide-react';
import { OwnerRequest } from '../../types/auth';

export const AdminOwnersHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'owners'>('requests');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected' | 'needs_update'>('submitted');

  const [actionModal, setActionModal] = useState<{
    request: any | null;
    type: 'approve' | 'reject' | 'needs_update' | null;
  }>({ request: null, type: null });
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const mapToBusinessType = (cat: string) => {
    if (!cat) return 'COMPANY';
    if (cat.includes('نقل')) return 'TRANSPORT';
    if (cat.includes('بنك') || cat.includes('صرافة')) return 'BANK';
    if (cat.includes('فندق') || cat.includes('شاليه')) return 'HOTEL';
    if (cat.includes('مطعم') || cat.includes('كافيه')) return 'RESTAURANT';
    if (cat.includes('مستشف') || cat.includes('صيدل') || cat.includes('عياد')) return 'HEALTHCARE';
    if (cat.includes('سيار')) return 'CAR_DEALER';
    if (cat.includes('عقار')) return 'REAL_ESTATE';
    if (cat.includes('مدرس') || cat.includes('جامع')) return 'EDUCATION';
    if (cat.includes('اتصال') || cat.includes('هاتف')) return 'TELECOM';
    return 'COMPANY';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, ownRes] = await Promise.all([
        supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'owner').order('created_at', { ascending: false }),
      ]);
      if (reqRes.data) setRequests(reqRes.data);
      if (ownRes.data) setOwners(ownRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // الاعتماد الكامل ونقل الشعار والغلاف وقنوات الاتصال لجدول المنشآت
  const handleExecute = async () => {
    const { request, type } = actionModal;
    if (!request || !type) return;

    setProcessing(true);
    try {
      if (type === 'approve') {
        // 1. تحديث حالة الطلب
        await supabase.from('owner_requests').update({
          status: 'approved',
          admin_notes: adminNote.trim() || 'تمت الموافقة والاعتماد رسمياً',
          reviewed_at: new Date().toISOString(),
        }).eq('id', request.id);

        // 2. ترقية الحساب
        await supabase.from('profiles').update({ role: 'owner' }).eq('id', request.user_id);

        // 3. إدراج أو تحديث المنشأة بجميع بياناتها الكاملة
        const richBusinessData = {
          name: request.business_name.trim(),
          business_type: mapToBusinessType(request.business_category || ''),
          city: request.city || 'صنعاء',
          phone: request.contact_phone,
          whatsapp: request.whatsapp || null,
          email: request.email || null,
          website: request.website || null,
          map_url: request.map_url || null,
          logo_url: request.logo_url || null,
          cover_url: request.cover_url || null,
          working_hours: request.working_hours || null,
          description: request.notes || null,
          owner_id: request.user_id,
          tier: 'VERIFIED',
          is_claimed: true,
          status: 'active',
        };

        const { data: existing } = await supabase
          .from('businesses')
          .select('id')
          .ilike('name', `%${request.business_name.trim()}%`)
          .limit(1)
          .maybeSingle();

        if (existing?.id) {
          await supabase.from('businesses').update(richBusinessData).eq('id', existing.id);
        } else {
          await supabase.from('businesses').insert(richBusinessData);
        }
      } else {
        const targetStatus = type === 'reject' ? 'rejected' : 'needs_update';
        await supabase.from('owner_requests').update({
          status: targetStatus,
          admin_notes: adminNote.trim() || null,
          reviewed_at: new Date().toISOString(),
        }).eq('id', request.id);
      }

      setActionModal({ request: null, type: null });
      setAdminNote('');
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تنفيذ الإجراء.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="font-['Cairo',sans-serif] p-4 sm:p-6 text-white" dir="rtl">
      
      {/* رأس إدارة الملاك */}
      <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 mb-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFC500]/10 border border-[#FFC500]/30 text-[#FFC500] flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white">إدارة طلبات الملاك والملفات الكاملة</h1>
            <p className="text-xs text-zinc-400">مراجعة الشعارات، الأغلفة، قنوات الاتصال والخرائط واعتماد المنشآت</p>
          </div>
        </div>

        <button onClick={fetchData} className="p-2 rounded-xl border border-[#1e293b] text-zinc-400 hover:text-white">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2 px-4 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'requests' ? 'bg-[#FFC500] text-black' : 'bg-[#0a0f1d] border border-[#1e293b] text-zinc-400'
          }`}
        >
          طلبات المنشآت الواردة ({requests.filter(r => r.status === 'submitted').length})
        </button>
        <button
          onClick={() => setActiveTab('owners')}
          className={`py-2 px-4 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'owners' ? 'bg-[#FFC500] text-black' : 'bg-[#0a0f1d] border border-[#1e293b] text-zinc-400'
          }`}
        >
          الملاك المعتمدون ({owners.length})
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-3 border-b border-[#1e293b] flex gap-1 overflow-x-auto">
            {['submitted', 'needs_update', 'approved', 'rejected', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st as any)}
                className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition ${
                  filter === st ? 'bg-zinc-800 text-[#FFC500]' : 'text-zinc-400'
                }`}
              >
                {st === 'submitted' && 'الجديدة'}
                {st === 'needs_update' && 'تحتاج تعديل'}
                {st === 'approved' && 'المعتمدة'}
                {st === 'rejected' && 'المرفوضة'}
                {st === 'all' && 'الكل'}
              </button>
            ))}
          </div>

          <div className="divide-y divide-[#1e293b]">
            {filteredRequests.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {req.logo_url ? (
                      <img src={req.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#1e293b]" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#060913] border border-[#1e293b] text-[#FFC500] flex items-center justify-center font-bold">
                        <Building2 size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-black text-white">{req.business_name}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="text-[#FFC500]">{req.business_category}</span>
                        <span>•</span>
                        <span>{req.city}</span>
                        <span>•</span>
                        <span>{new Date(req.created_at).toLocaleDateString('ar-YE')}</span>
                      </div>
                    </div>
                  </div>

                  {/* أزرار الإدارة */}
                  <div className="flex items-center gap-2">
                    {req.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => setActionModal({ request: req, type: 'approve' })}
                          className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={14} className="stroke-[3]" />
                          <span>قبول واعتماد</span>
                        </button>
                        <button
                          onClick={() => setActionModal({ request: req, type: 'needs_update' })}
                          className="h-9 px-3 rounded-xl bg-amber-500/10 text-[#FFC500] border border-[#FFC500]/30 text-xs font-bold"
                        >
                          طلب تعديل
                        </button>
                        <button
                          onClick={() => setActionModal({ request: req, type: 'reject' })}
                          className="h-9 px-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold"
                        >
                          رفض
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* التفاصيل الكاملة المرفقة (شعار، غلاف، خريطة، قنوات) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3 rounded-2xl bg-[#060913] border border-[#1e293b] text-zinc-300">
                  <div><span className="text-zinc-500">الهاتف:</span> <strong className="text-white" dir="ltr">{req.contact_phone}</strong></div>
                  <div><span className="text-zinc-500">الواتساب:</span> <strong className="text-white" dir="ltr">{req.whatsapp || 'غير محدد'}</strong></div>
                  <div><span className="text-zinc-500">الدوام:</span> <span>{req.working_hours || 'غير محدد'}</span></div>
                  <div>
                    {req.map_url ? (
                      <a href={req.map_url} target="_blank" rel="noreferrer" className="text-[#FFC500] underline flex items-center gap-1">
                        <Navigation size={12} />
                        <span>رابط الخريطة</span>
                      </a>
                    ) : (
                      <span className="text-zinc-500">لا يوجد موقع خريطة</span>
                    )}
                  </div>
                  {req.offers && (
                    <div className="col-span-full pt-1 border-t border-zinc-800">
                      <span className="text-[#FFC500] font-bold">العروض الخاصة:</span> {req.offers}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نافذة الإجراء */}
      {actionModal.request && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <h3 className="text-sm font-black text-white">
              {actionModal.type === 'approve' && 'اعتماد المنشأة ونقل بياناتها للدليل'}
              {actionModal.type === 'needs_update' && 'طلب تعديلات من المالك'}
              {actionModal.type === 'reject' && 'رفض الطلب'}
            </h3>
            <textarea
              rows={3}
              placeholder="اكتب ملاحظة للإدارة تظهر في حساب المالك..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1e293b] text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setActionModal({ request: null, type: null })} className="px-3 text-xs text-zinc-400">إلغاء</button>
              <button onClick={handleExecute} disabled={processing} className="px-4 py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs">
                {processing ? 'جارٍ التنفيذ...' : 'تأكيد القرار'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
