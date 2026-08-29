import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';

interface ClaimRequest {
  id: string;
  companyName: string;
  applicantName: string;
  applicantRole: string;
  phone: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documentsCount: number;
}

export const ClaimsManager: React.FC = () => {
  const [claims, setClaims] = useState<ClaimRequest[]>([
    {
      id: 'CLM-501',
      companyName: 'مجموعة بن محفوظ التجارية',
      applicantName: 'أحمد بن محفوظ',
      applicantRole: 'المدير التنفيذي',
      phone: '+967 777 000 111',
      submittedAt: 'اليوم، 10:30 ص',
      status: 'pending',
      documentsCount: 3
    },
    {
      id: 'CLM-502',
      companyName: 'مستشفى النخبة التخصصي',
      applicantName: 'د. خالد العولقي',
      applicantRole: 'المفوض القانوني',
      phone: '+967 733 222 333',
      submittedAt: 'أمس، 04:15 م',
      status: 'pending',
      documentsCount: 2
    }
  ]);

  const handleDecision = (id: string, newStatus: 'approved' | 'rejected') => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="text-[#FFC500]" />
          إثبات الملكية والتوثيق (Verification Requests)
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          مراجعة طلبات التوثيق، فحص المستندات الرسمية، وتوثيق القرارات في سجل الـ Audit Log.
        </p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
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
                    <FileText size={12} /> {claim.documentsCount} ملفات رسمية
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#9CA3AF] text-[11px]">{claim.submittedAt}</td>
                <td className="py-3.5 px-4 text-center">
                  {claim.status === 'pending' ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDecision(claim.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-[#16A34A] text-white font-bold text-[11px] hover:bg-[#16A34A]/90 transition-all flex items-center gap-1"
                      >
                        <CheckCircle size={13} /> قبول وتوثيق
                      </button>
                      <button
                        onClick={() => handleDecision(claim.id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-[#DC2626] text-white font-bold text-[11px] hover:bg-[#DC2626]/90 transition-all flex items-center gap-1"
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
      </div>
    </div>
  );
};
