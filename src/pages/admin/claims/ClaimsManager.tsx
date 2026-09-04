import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ClaimRequest {
  id: string;
  companyName: string;
  applicantName: string;
  applicantRole: string;
  phone: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documentsCount: number;
  entityId?: string;
  entityType?: string;
}

export const ClaimsManager: React.FC = () => {
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data: requests, error } = await supabase
        .from('business_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (requests && requests.length > 0) {
        // جلب أسماء البنوك لربط الاسم بمعرف المنشأة
        const { data: banks } = await supabase.from('businesses').select('id, name');
        const bankMap = new Map((banks || []).map(b => [b.id, b.name]));

        const mapped: ClaimRequest[] = requests.map((r: any) => ({
          id: r.id,
          companyName: bankMap.get(r.entity_id) || r.notes || (r.entity_type === 'bank' ? 'بنك' : 'منشأة'),
          applicantName: r.applicant_name || 'مفوض معتمد',
          applicantRole: r.applicant_role || 'ممثل رسمي',
          phone: r.phone || '—',
          submittedAt: new Date(r.created_at).toLocaleDateString('ar-YE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: (r.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',
          documentsCount: 1,
          entityId: r.entity_id,
          entityType: r.entity_type
        }));
        setClaims(mapped);
      } else {
        setClaims([]);
      }
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
      const dbStatus = newStatus === 'approved' ? 'APPROVED' : 'REJECTED';

      // 1. تحديث حالة الطلب في verification_requests
      await supabase
        .from('business_claims')
        .update({ status: dbStatus, reviewed_at: new Date().toISOString() })
        .eq('id', id);

      // 2. إذا تمت الموافقة، توثيق البنك فوراً في جدول banks وجعل شارة التوثيق ذهبية
      if (newStatus === 'approved' && entityId) {
        await supabase
          .from('businesses')
          .update({ is_verified: true, verified_badge_type: 'gold', ownership_status: 'VERIFIED', verified_at: new Date().toISOString() })
          .eq('id', entityId);
      }

      // تحديث الواجهة فوراً
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Error updating claim decision:', err);
      alert('حدث خطأ أثناء تحديث القرار.');
    }
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="text-[#FFC500]" />
            إثبات الملكية والتوثيق (Verification Requests)
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            مراجعة طلبات التوثيق الواردة من المنشآت والبنوك، واعتماد الشارة الرسمية عبر Supabase.
          </p>
        </div>
        <button
          onClick={fetchClaims}
          className="px-3 py-1.5 rounded-lg bg-[#161D2B] border border-[#1F2937] text-xs text-gray-300 hover:text-white"
        >
          تحديث الطلبات
        </button>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="animate-spin text-[#FFC500]" size={24} />
            <span className="text-xs">جاري جلب الطلبات من قاعدة البيانات...</span>
          </div>
        ) : claims.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            لا توجد طلبات إثبات ملكية جديدة حالياً.
          </div>
        ) : (
          <table className="w-full text-right text-xs">
            <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
              <tr>
                <th className="py-3.5 px-4">اسم المنشأة</th>
                <th className="py-3.5 px-4">مقدم الطلب وصفته</th>
                <th className="py-3.5 px-4">المستندات المرفقة</th>
                <th className="py-3.5 px-4">تاريخ التقديم</th>
                <th className="py-3.5 px-4 text-center">القرار والإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-white">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-[#161D2B]/50">
                  <td className="py-3.5 px-4 font-bold text-white">{claim.companyName}</td>
                  <td className="py-3.5 px-4">
                    <div>{claim.applicantName}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{claim.applicantRole} • {claim.phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#161D2B] text-[#FFC500] font-mono text-[11px]">
                      <FileText size={12} /> {claim.documentsCount} ملف رسمي
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#9CA3AF] text-[11px]">{claim.submittedAt}</td>
                  <td className="py-3.5 px-4 text-center">
                    {claim.status === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDecision(claim.id, 'approved', claim.entityId)}
                          className="px-2.5 py-1 rounded-lg bg-[#16A34A] text-white font-bold text-[11px] hover:bg-[#16A34A]/90 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle size={13} /> قبول وتوثيق
                        </button>
                        <button
                          onClick={() => handleDecision(claim.id, 'rejected', claim.entityId)}
                          className="px-2.5 py-1 rounded-lg bg-[#DC2626] text-white font-bold text-[11px] hover:bg-[#DC2626]/90 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle size={13} /> رفض
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        claim.status === 'approved' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-[#DC2626]/20 text-[#DC2626]'
                      }`}>
                        {claim.status === 'approved' ? 'تم التوثيق رسمياً' : 'تم الرفض'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
