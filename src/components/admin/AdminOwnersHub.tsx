'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  History, 
  Search, 
  Filter,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { BusinessItem, OwnerRequest } from '@/types/owner';

interface AuditLogItem {
  id: string;
  owner_id: string;
  business_id?: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export const AdminOwnersHub: React.FC = () => {
  const [supabase] = useState(() => createClientComponentClient());
  const [activeTab, setActiveTab] = useState<'requests' | 'owners' | 'logs'>('requests');
  const [loading, setLoading] = useState(true);

  // البيانات الحقيقية
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  // فلترة الطلبات
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // نافذة الإجراءات والملاحظات
  const [actionModal, setActionModal] = useState<{
    request: OwnerRequest | null;
    actionType: 'approve' | 'reject' | 'changes_requested' | null;
  }>({ request: null, actionType: null });
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // جلب البيانات
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, bizRes, logRes] = await Promise.all([
        supabase.from('owner_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').not('owner_id', 'is', null).order('created_at', { ascending: false }),
        supabase.from('owner_audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (reqRes.data) setRequests(reqRes.data as OwnerRequest[]);
      if (bizRes.data) setBusinesses(bizRes.data as BusinessItem[]);
      if (logRes.data) setLogs(logRes.data as AuditLogItem[]);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // تنفيذ قرار الإدارة على الطلب
  const handleExecuteDecision = async () => {
    const { request, actionType } = actionModal;
    if (!request || !actionType) return;

    setProcessing(true);
    try {
      const targetStatus = actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'changes_requested';

      // 1. تحديث حالة الطلب
      await supabase
        .from('owner_requests')
        .update({
          status: targetStatus,
          admin_notes: adminNotes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      // 2. إذا تمت الموافقة، نقوم بتطبيق التغيير الفعلي على جدول المنشآت
      if (actionType === 'approve') {
        if (request.request_type === 'new_business') {
          // إضافة المنشأة الجديدة كمنشأة معتمدة
          await supabase.from('businesses').insert({
            name: request.requested_data.name,
            category: request.requested_data.category || 'عام',
            city: request.requested_data.city || 'صنعاء',
            phone: request.requested_data.phone,
            description: request.requested_data.description || '',
            owner_id: request.owner_id,
            status: 'active',
            is_claimed: true,
            created_at: new Date().toISOString(),
          });
        } else if (request.request_type === 'claim_business' && request.business_id) {
          // ربط المنشأة بالمالك وتوثيق الملكية
          await supabase.from('businesses').update({
            owner_id: request.owner_id,
            is_claimed: true,
          }).eq('id', request.business_id);
        } else if (request.request_type === 'promotion_request' && request.business_id) {
          // تمييز المنشأة
          await supabase.from('businesses').update({
            is_featured: true,
          }).eq('id', request.business_id);
        }
      }

      // إغلاق النافذة وتحديث البيانات
      setActionModal({ request: null, actionType: null });
      setAdminNotes('');
      await fetchData();
    } catch (err) {
      console.error('Decision execution failed:', err);
      alert('حدث خطأ أثناء تنفيذ الإجراء.');
    } finally {
      setProcessing(false);
    }
  };

  // فك ارتباط منشأة بمالك
  const handleUnlinkOwner = async (businessId: string, businessName: string) => {
    if (!confirm(`هل أنت متأكد من فك ارتباط منشأة "${businessName}" بمالكها؟`)) return;
    try {
      await supabase.from('businesses').update({
        owner_id: null,
        is_claimed: false,
      }).eq('id', businessId);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (requestFilter !== 'all' && r.status !== requestFilter) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="font-['Cairo'] min-h-screen bg-zinc-50/70 p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* رأس قسم صفحات الملاك في الإدارة */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900">
              إدارة صفحات الملاك
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            مركز مراجعة طلبات الملاك، المنشآت الموثقة، ومراقبة النشاط في يمن ريتنغ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* التبويبات الرئيسية */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white p-1.5 rounded-2xl border border-zinc-200/80 inline-flex gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            طلبات الملاك
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[11px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('owners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'owners'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            المنشآت المربوطة بملاك ({businesses.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <History className="w-4 h-4" />
            سجل نشاط الملاك (Audit Log)
          </button>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto">
        
        {/* 1. تبويب طلبات الملاك */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            {/* شريط الفلترة */}
            <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setRequestFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      requestFilter === filter
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {filter === 'all' && 'الكل'}
                    {filter === 'pending' && 'قيد المراجعة'}
                    {filter === 'approved' && 'تمت الموافقة'}
                    {filter === 'rejected' && 'المرفوضة'}
                  </button>
                ))}
              </div>

              <span className="text-xs text-zinc-500 font-bold">
                إجمالي الطلبات المعروضة: {filteredRequests.length}
              </span>
            </div>

            {/* قائمة الطلبات */}
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs font-bold">
                لا توجد طلبات تطابق الفلتر المحدد حالياً.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/50 transition">
                    
                    {/* معلومات الطلب */}
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-zinc-100 text-zinc-800">
                          {req.request_type === 'new_business' && 'طلب إضافة منشأة جديدة'}
                          {req.request_type === 'claim_business' && 'طلب مطالبة بمنشأة'}
                          {req.request_type === 'promotion_request' && 'طلب ترويج / تمييز'}
                          {req.request_type === 'edit_business' && 'طلب تعديل بيانات'}
                        </span>

                        <span className="text-xs text-zinc-400">
                          {new Date(req.created_at).toLocaleDateString('ar-YE', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* تفاصيل البيانات المطلوبة */}
                      <div className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                        {req.request_type === 'new_business' && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div><span className="text-zinc-400">الاسم:</span> <strong className="text-zinc-900">{req.requested_data.name}</strong></div>
                            <div><span className="text-zinc-400">التصنيف:</span> <strong>{req.requested_data.category}</strong></div>
                            <div><span className="text-zinc-400">المدينة:</span> <strong>{req.requested_data.city}</strong></div>
                            <div><span className="text-zinc-400">الهاتف:</span> <strong dir="ltr">{req.requested_data.phone}</strong></div>
                            {req.requested_data.description && (
                              <div className="col-span-full"><span className="text-zinc-400">الوصف:</span> {req.requested_data.description}</div>
                            )}
                          </div>
                        )}

                        {req.request_type === 'claim_business' && (
                          <div>
                            <p><span className="text-zinc-400">المنشأة المطالب بها:</span> <strong className="text-zinc-900">{req.requested_data.claimed_business_name}</strong></p>
                            <p className="mt-1"><span className="text-zinc-400">هاتف المالك:</span> <strong dir="ltr">{req.requested_data.contact_phone}</strong></p>
                            {req.requested_data.proof_details && (
                              <p className="mt-1"><span className="text-zinc-400">إثبات الملكية:</span> {req.requested_data.proof_details}</p>
                            )}
                          </div>
                        )}

                        {req.request_type === 'promotion_request' && (
                          <div>
                            <p><span className="text-zinc-400">المنشأة:</span> <strong>{req.requested_data.business_name}</strong></p>
                            <p><span className="text-zinc-400">الباقة:</span> {req.requested_data.plan_requested || 'الباقة المميزة'}</p>
                          </div>
                        )}
                      </div>

                      {req.admin_notes && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                          ملاحظة الإدارة المسجلة: {req.admin_notes}
                        </p>
                      )}
                    </div>

                    {/* إجراءات الإدارة */}
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => setActionModal({ request: req, actionType: 'approve' })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            قبول واعتماد
                          </button>

                          <button
                            onClick={() => setActionModal({ request: req, actionType: 'changes_requested' })}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            طلب تعديل
                          </button>

                          <button
                            onClick={() => setActionModal({ request: req, actionType: 'reject' })}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            رفض
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {req.status === 'approved' && 'تمت الموافقة'}
                          {req.status === 'rejected' && 'تم الرفض'}
                          {req.status === 'changes_requested' && 'طُلب تعديل'}
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. تبويب المنشآت المربوطة بالملاك */}
        {activeTab === 'owners' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900">
                جميع المنشآت المرتبطة بملاك رسميين في يمن ريتنغ ({businesses.length})
              </h2>
            </div>

            {businesses.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs font-bold">
                لا توجد أي منشأة مربوطة بمالك حالياً في قاعدة البيانات.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {businesses.map((biz) => (
                  <div key={biz.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                        {biz.cover_url || biz.logo_url ? (
                          <img src={biz.cover_url || biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-zinc-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-900">{biz.name}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[11px] font-bold text-zinc-700">
                            {biz.category}
                          </span>
                          <span className="text-[11px] text-zinc-500">{biz.city}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          معرّف المالك (Owner UUID): <code className="text-[10px] text-zinc-600 bg-zinc-100 px-1 rounded">{biz.owner_id}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/businesses/${biz.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        الصفحة العامة
                      </a>

                      <button
                        onClick={() => handleUnlinkOwner(biz.id, biz.name)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition"
                      >
                        فك الارتباط
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. تبويب سجل نشاط الملاك (Audit Log) */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">سجل تدقيق نشاط الملاك المباشر</h2>
                <p className="text-xs text-zinc-500">مراقبة حية لكل التعديلات والطلبات التي قام بها الملاك</p>
              </div>
              <span className="text-xs font-bold bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-lg">
                آخر {logs.length} عملية
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs font-bold">
                لا توجد سجلات نشاط مسجلة حتى الآن.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-zinc-900 block sm:inline ml-2">
                        {log.action === 'update_safe_data' && 'تعديل بيانات منشأة'}
                        {log.action === 'submit_request_new_business' && 'إرسال طلب إضافة منشأة'}
                        {log.action === 'submit_request_claim_business' && 'إرسال طلب مطالبة'}
                        {log.action === 'submit_request_promotion_request' && 'إرسال طلب ترويج'}
                        {log.action === 'reply_to_review' && 'الرد على تقييم عميل'}
                        {!['update_safe_data', 'submit_request_new_business', 'submit_request_claim_business', 'submit_request_promotion_request', 'reply_to_review'].includes(log.action) && log.action}
                      </span>
                      <span className="text-zinc-500 text-[11px]">
                        بواسطة المالك: <code className="bg-zinc-100 px-1 rounded">{log.owner_id.slice(0, 8)}...</code>
                      </span>
                    </div>

                    <span className="text-zinc-400 text-[11px] shrink-0">
                      {new Date(log.created_at).toLocaleString('ar-YE')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* نافذة تأكيد قرار الإدارة (قبول / رفض / طلب تعديل) */}
      {actionModal.request && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-zinc-900">
              {actionModal.actionType === 'approve' && 'تأكيد قبول الطلب والاعتماد'}
              {actionModal.actionType === 'reject' && 'رفض الطلب'}
              {actionModal.actionType === 'changes_requested' && 'طلب تعديلات من المالك'}
            </h3>

            <p className="text-xs text-zinc-600">
              {actionModal.actionType === 'approve' && 'عند الموافقة، سيتم تطبيق التغيير فوراً ونشر/ربط المنشأة في دليل يمن ريتنغ.'}
              {actionModal.actionType === 'reject' && 'يرجى كتابة سبب الرفض ليظهر للمالك في شاشة متابعة طلباته.'}
              {actionModal.actionType === 'changes_requested' && 'اكتب التفاصيل المطلوب تعديلها ليقوم المالك بتحديث طلبه.'}
            </p>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                ملاحظات الإدارة للمالك {actionModal.actionType !== 'approve' && '*'}
              </label>
              <textarea
                rows={3}
                placeholder="اكتب ملاحظتك هنا..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal({ request: null, actionType: null })}
                disabled={processing}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleExecuteDecision}
                disabled={processing}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition disabled:opacity-50 ${
                  actionModal.actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  actionModal.actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                  'bg-amber-600 hover:bg-amber-700'
                }`}
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
