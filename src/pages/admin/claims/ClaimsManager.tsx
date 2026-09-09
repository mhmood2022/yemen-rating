import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Loader2, Phone, Building2, User } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ClaimRequest {
  id: string;
  companyName: string;
  applicantName: string;
  applicantRole: string;
  phone: string;
  notes: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documentsCount: number;
  entityId?: string;
  entityType?: string;
}

export const ClaimsManager: React.FC = () => {
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const [verifRes, bizRes, businessesRes] = await Promise.all([
        supabase.from('verification_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('business_claims').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('id, name')
      ]);

      const nameMap = new Map<string, string>();
      (businessesRes.data || []).forEach((b: any) => nameMap.set(b.id, b.name));

      const raw = [
        ...(verifRes.data || []).map((r: any) => ({ ...r, _source: 'verification_requests' })),
        ...(bizRes.data || []).map((r: any) => ({ ...r, _source: 'business_claims' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const mapped: ClaimRequest[] = raw.map((r: any) => {
        const entId = r.entity_id || r.business_id;
        const realName = nameMap.get(entId);
        return {
          id: r.id,
          companyName: realName || r.company_name || r.business_name || (r.entity_type === 'bank' ? 'بنك ومصرف' : 'منشأة تجارية'),
          applicantName: r.applicant_name || r.claimant_name || 'مفوض معتمد',
          applicantRole: r.applicant_role || 'ممثل رسمي',
          phone: r.phone || r.claimant_phone || '—',
          notes: r.notes || '',
          submittedAt: new Date(r.created_at).toLocaleDateString('ar-YE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: (r.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',
          documentsCount: 1,
          entityId: entId,
          entityType: r.entity_type || 'business'
        };
      });

      setClaims(mapped);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleDecision = async (id: string, newStatus: 'approved' | 'rejected', entityId?: string) => {
    try {
      setActionLoading(id);
      const dbStatus = newStatus === 'approved' ? 'APPROVED' : 'REJECTED';

      // 1. تحديث حالة الطلب في الجداول
      await Promise.all([
        supabase.from('verification_requests').update({ status: dbStatus, reviewed_at: new Date().toISOString() }).eq('id', id),
        supabase.from('business_claims').update({ status: dbStatus, reviewed_at: new Date().toISOString() }).eq('id', id)
      ]);

      // 2. عند الموافقة: توثيق المنشأة فوراً لإخفاء زر إثبات الملكية ومنح الشارة
      if (newStatus === 'approved' && entityId) {
        const payload = {
          is_verified: true,
          verified_badge_type: 'gold',
          ownership_status: 'VERIFIED',
          is_claimed: true,
          verified_at: new Date().toISOString()
        };

        await supabase.from('businesses').update(payload).eq('id', entityId);
      }

      // تحديث الواجهة فوراً
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Error updating claim decision:', err);
      alert('حدث خطأ أثناء حفظ القرار.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div dir="rtl" className="space-y-4 font-['Cairo',sans-serif]">
      {/* الترويسة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F17] p-4 rounded-xl border border-[#1F2937]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-[#FFC500]" />
            إثبات الملكية والتوثيق (Verification)
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            مراجعة طلبات التوثيق الواردة من المنشآت والبنوك، واعتماد التوثيق الرسمي.
          </p>
        </div>
        <button
          onClick={fetchClaims}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#161D2B] border border-[#1F2937] text-xs font-bold text-gray-200 hover:text-white hover:bg-[#1F2937] transition cursor-pointer flex items-center gap-1.5"
        >
          {loading && <Loader2 className="animate-spin w-3.5 h-3.5 text-[#FFC500]" />}
          <span>تحديث الطلبات</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
          <Loader2 className="animate-spin text-[#FFC500]" size={28} />
          <span className="text-xs font-bold">جاري تحميل طلبات التوثيق...</span>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] py-16 text-center text-gray-400 text-xs">
          لا توجد طلبات إثبات ملكية جديدة حالياً.
        </div>
      ) : (
        <>
          {/* عرض البطاقات المخصص للهاتف (Mobile Cards) */}
          <div className="block lg:hidden space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-[#0B0F17] border border-[#1F2937] rounded-2xl p-4 text-right space-y-3 shadow-xl"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#1F2937] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#FFC500] block mb-0.5">
                      {claim.entityType === 'bank' ? '🏦 بنك ومصرف' : '🏢 منشأة / شركة'}
                    </span>
                    <h3 className="text-base font-black text-white leading-snug">
                      {claim.companyName}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                      claim.status === 'approved'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : claim.status === 'rejected'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                    }`}
                  >
                    {claim.status === 'approved'
                      ? '✓ معتمد وموثق'
                      : claim.status === 'rejected'
                      ? '✕ تم الرفض'
                      : '⏳ قيد المراجعة'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#121620] p-2.5 rounded-xl border border-[#1F2937]/50">
                    <span className="text-[10px] text-gray-400 block mb-0.5">مقدم الطلب:</span>
                    <p className="font-bold text-white truncate">{claim.applicantName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{claim.applicantRole}</p>
                  </div>
                  <div className="bg-[#121620] p-2.5 rounded-xl border border-[#1F2937]/50">
                    <span className="text-[10px] text-gray-400 block mb-0.5">رقم الهاتف:</span>
                    <a
                      href={`tel:${claim.phone}`}
                      className="font-mono font-bold text-[#FFC500] text-xs block hover:underline"
                    >
                      {claim.phone}
                    </a>
                  </div>
                </div>

                {claim.notes && (
                  <div className="bg-[#121620] p-2.5 rounded-xl border border-[#1F2937]/50 text-xs">
                    <span className="text-[10px] text-gray-400 block mb-0.5">الملاحظات والبيانات:</span>
                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{claim.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1">
                  <span>تاريخ التقديم:</span>
                  <span className="font-mono text-zinc-300">{claim.submittedAt}</span>
                </div>

                {claim.status === 'pending' ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1F2937]">
                    <button
                      onClick={() => handleDecision(claim.id, 'approved', claim.entityId)}
                      disabled={actionLoading === claim.id}
                      className="py-2.5 px-3 rounded-xl bg-[#16A34A] hover:bg-emerald-600 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === claim.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle size={15} />}
                      <span>قبول وتوثيق</span>
                    </button>
                    <button
                      onClick={() => handleDecision(claim.id, 'rejected', claim.entityId)}
                      disabled={actionLoading === claim.id}
                      className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 font-black text-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      <span>رفض الطلب</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs font-bold text-gray-400 border-t border-[#1F2937]">
                    {claim.status === 'approved' ? '✅ تم اعتماد هذا التوثيق بنجاح' : '❌ تم رفض هذا الطلب'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* عرض الجدول للشاشات الكبيرة (Desktop Table) */}
          <div className="hidden lg:block bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
                <tr>
                  <th className="py-3.5 px-4">اسم المنشأة / البنك</th>
                  <th className="py-3.5 px-4">مقدم الطلب وصفته</th>
                  <th className="py-3.5 px-4">رقم التواصل</th>
                  <th className="py-3.5 px-4">تاريخ التقديم</th>
                  <th className="py-3.5 px-4 text-center">القرار والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-white">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-[#161D2B]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{claim.companyName}</div>
                      <div className="text-[10px] text-[#FFC500] font-normal">
                        {claim.entityType === 'bank' ? 'بنك ومصرف' : 'منشأة'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold">{claim.applicantName}</div>
                      <div className="text-[10px] text-[#9CA3AF]">{claim.applicantRole}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">{claim.phone}</td>
                    <td className="py-3.5 px-4 text-[#9CA3AF] text-[11px]">{claim.submittedAt}</td>
                    <td className="py-3.5 px-4 text-center">
                      {claim.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDecision(claim.id, 'approved', claim.entityId)}
                            disabled={actionLoading === claim.id}
                            className="px-3 py-1.5 rounded-lg bg-[#16A34A] text-white font-bold text-xs hover:bg-emerald-600 transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle size={13} /> قبول وتوثيق
                          </button>
                          <button
                            onClick={() => handleDecision(claim.id, 'rejected', claim.entityId)}
                            disabled={actionLoading === claim.id}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle size={13} /> رفض
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold ${claim.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {claim.status === 'approved' ? 'معتمد وموثق ✓' : 'مرفوض ✕'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
