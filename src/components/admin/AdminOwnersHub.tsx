'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ShieldCheck, Clock, Check, X, AlertTriangle, Building2, 
  Phone, MapPin, User, RefreshCw, Loader2, Sparkles, MessageSquare 
} from 'lucide-react';
import { OwnerRequest } from '../../types/auth';

export const AdminOwnersHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'owners'>('requests');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected' | 'needs_update'>('submitted');

  // نافذة الإجراء (ملاحظات الرفض أو طلب التعديل)
  const [actionModal, setActionModal] = useState<{
    request: OwnerRequest | null;
    type: 'approve' | 'reject' | 'needs_update' | null;
  }>({ request: null, type: null });
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, ownRes] = await Promise.all([
        supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'owner').order('created_at', { ascending: false }),
      ]);
      if (reqRes.data) setRequests(reqRes.data as OwnerRequest[]);
      if (ownRes.data) setOwners(ownRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // تنفيذ القرار الإداري
  const handleExecute = async () => {
    const { request, type } = actionModal;
    if (!request || !type) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (type === 'approve') {
        // محاولة استدعاء الدالة الآمنة أو التحديث المباشر
        const { error: rpcErr } = await supabase.rpc('admin_approve_owner_request', {
          p_request_id: request.id,
          p_admin_id: user?.id,
          p_note: adminNote.trim() || 'تمت الموافقة والاعتماد'
        });

        if (rpcErr) {
          // ترقية يدوية في حال تعذر الـ RPC
          await supabase.from('owner_requests').update({
            status: 'approved',
            admin_notes: adminNote.trim() || 'تمت الموافقة',
            reviewed_at: new Date().toISOString(),
          }).eq('id', request.id);

          await supabase.from('profiles').update({ role: 'owner' }).eq('id', request.user_id);
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

  const pendingCount = requests.filter((r) => r.status === 'submitted' || r.status === 'under_review').length;

  return (
    <div className="font-['Cairo',sans-serif] p-4 sm:p-6 text-white" dir="rtl">
      
      {/* رأس شاشة إدارة الملاك */}
      <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC500]/10 border border-[#FFC500]/30 text-[#FFC500] flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">إدارة صفحات الملاك والطلبات</h1>
            <p className="text-xs text-zinc-400">مراجعة طلبات الترقية للملاك والتحكم بالصلاحيات</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl border border-[#1e293b] bg-[#060913] text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold w-fit cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>تحديث</span>
        </button>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests' ? 'bg-[#FFC500] text-black shadow-sm' : 'bg-[#0a0f1d] border border-[#1e293b] text-zinc-400 hover:text-white'
          }`}
        >
          <Clock size={15} />
          <span>طلبات الترقية</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('owners')}
          className={`py-2 px-4 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'owners' ? 'bg-[#FFC500] text-black shadow-sm' : 'bg-[#0a0f1d] border border-[#1e293b] text-zinc-400 hover:text-white'
          }`}
        >
          <ShieldCheck size={15} />
          <span>الملاك المعتمدون ({owners.length})</span>
        </button>
      </div>

      {/* محتوى طلبات الترقية */}
      {activeTab === 'requests' && (
        <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl overflow-hidden shadow-sm">
          
          {/* فلتر الحالات */}
          <div className="p-3.5 border-b border-[#1e293b] flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'submitted', label: 'الطلبات الجديدة' },
              { id: 'needs_update', label: 'تحتاج تعديل' },
              { id: 'approved', label: 'تمت الموافقة' },
              { id: 'rejected', label: 'المرفوضة' },
              { id: 'all', label: 'كل الطلبات' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  filter === f.id ? 'bg-zinc-800 text-[#FFC500] border border-[#FFC500]/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs font-bold">
              لا توجد طلبات في هذا القسم حالياً.
            </div>
          ) : (
            <div className="divide-y divide-[#1e293b]">
              {filteredRequests.map((req) => (
                <div key={req.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#060913]/40 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{req.business_name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FFC500]/10 text-[#FFC500] text-[10px] font-bold border border-[#FFC500]/20">
                        {req.business_category}
                      </span>
                      <span className="text-[11px] text-zinc-400">{req.city}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-[#FFC500]" />
                        <span dir="ltr">{req.contact_phone}</span>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span>نوع الطلب: {req.request_type === 'new_business' ? 'إضافة منشأة جديدة' : 'مطالبة بملكية منشأة'}</span>
                      <span className="text-zinc-600">•</span>
                      <span>{new Date(req.created_at).toLocaleDateString('ar-YE')}</span>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-zinc-300 bg-[#060913] border border-[#1e293b] p-2 rounded-xl">
                        ملاحظات المالك: {req.notes}
                      </p>
                    )}

                    {req.admin_notes && (
                      <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                        ملاحظة الإدارة المسجلة: {req.admin_notes}
                      </p>
                    )}
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'submitted' || req.status === 'under_review' ? (
                      <>
                        <button
                          onClick={() => setActionModal({ request: req, type: 'approve' })}
                          className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={14} className="stroke-[3]" />
                          <span>قبول واعتماد</span>
                        </button>

                        <button
                          onClick={() => setActionModal({ request: req, type: 'needs_update' })}
                          className="h-9 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#FFC500] border border-[#FFC500]/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle size={14} />
                          <span>طلب تعديل</span>
                        </button>

                        <button
                          onClick={() => setActionModal({ request: req, type: 'reject' })}
                          className="h-9 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <X size={14} />
                          <span>رفض</span>
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        req.status === 'needs_update' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {req.status === 'approved' && 'تمت الموافقة'}
                        {req.status === 'needs_update' && 'طُلب تعديل'}
                        {req.status === 'rejected' && 'مرفوض'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* محتوى الملاك المعتمدين */}
      {activeTab === 'owners' && (
        <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl overflow-hidden p-4 space-y-3">
          <h2 className="text-sm font-black text-white mb-2">قائمة الملاك المسجلين رسمياً ({owners.length})</h2>
          <div className="divide-y divide-[#1e293b]">
            {owners.map((owner) => (
              <div key={owner.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#060913] border border-[#1e293b] text-[#FFC500] flex items-center justify-center font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{owner.full_name || 'مالك بدون اسم'}</h3>
                    <p className="text-[11px] text-zinc-400">{owner.email}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  مالك معتمد
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نافذة تأكيد الإجراء الإداري */}
      {actionModal.request && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl">
            <h3 className="text-sm font-black text-white">
              {actionModal.type === 'approve' && 'تأكيد قبول الطلب وترقية الحساب'}
              {actionModal.type === 'needs_update' && 'طلب تعديلات من المستخدم'}
              {actionModal.type === 'reject' && 'تأكيد رفض الطلب'}
            </h3>

            <p className="text-xs text-zinc-400">
              {actionModal.type === 'approve' && 'سيتم تحويل حساب المستخدم فوراً إلى دور (Owner) ليتمكن من إدارة منشأته.'}
              {actionModal.type === 'needs_update' && 'اكتب ما ينقص الطلب ليظهر في حساب المستخدم ويقوم بتعديله.'}
              {actionModal.type === 'reject' && 'اكتب سبب الرفض ليظهر للمستخدم في حسابه.'}
            </p>

            <textarea
              rows={3}
              placeholder="اكتب ملاحظة الإدارة هنا..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1e293b] text-xs text-white placeholder-zinc-500 focus:border-[#FFC500] focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setActionModal({ request: null, type: null })}
                className="px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-white"
              >
                إلغاء
              </button>

              <button
                onClick={handleExecute}
                disabled={processing}
                className="px-4 py-2 rounded-xl bg-[#FFC500] text-black text-xs font-black hover:bg-[#eab308] disabled:opacity-50"
              >
                {processing ? 'جارٍ التنفيذ...' : 'تأكيد الإجراء'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
