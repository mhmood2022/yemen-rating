import React, { useState } from 'react';
import { Settings, ShieldAlert, History, Key, Lock } from 'lucide-react';

export const SettingsAuditManager: React.FC = () => {
  const [auditLogs] = useState([
    { id: 'LOG-881', admin: 'أحمد الوصابي (Super Admin)', action: 'تغيير شارة إلى GOLD', target: 'مجموعة بن محفوظ', ip: '185.220.101.5', time: 'منذ 5 دقائق' },
    { id: 'LOG-882', admin: 'سامي المنصوري (Auctions Mgr)', action: 'احتساب عمولة مزاد 5%', target: 'AUC-101 (كتربلر)', ip: '185.220.101.12', time: 'منذ 35 دقيقة' },
    { id: 'LOG-883', admin: 'فاطمة باحاج (Claims Officer)', action: 'قبول طلب توثيق رسمي', target: 'مستشفى النخبة', ip: '82.114.160.4', time: 'اليوم، 11:20 ص' },
    { id: 'LOG-884', admin: 'عمر القاضي (Auditor)', action: 'مراجعة أرقام العمولات العقارية', target: 'PROP-202 (عدن)', ip: '82.114.160.9', time: 'أمس، 05:40 م' },
  ]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <History className="text-[#FFC500]" />
          سجل العمليات الأمني (Audit Log & System Settings)
        </h2>
        <p className="text-[#9CA3AF] text-xs mt-1">
          تسجيل جميع الإجراءات الإدارية الحساسة (العمولات، الشارات، الصلاحيات، التوثيق) مع حفظ التوقيت وعنوان الـ IP.
        </p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
            <tr>
              <th className="py-3.5 px-4">الإداري المنفذ</th>
              <th className="py-3.5 px-4">نوع الإجراء والعملية</th>
              <th className="py-3.5 px-4">العنصر المتأثر</th>
              <th className="py-3.5 px-4">عنوان IP</th>
              <th className="py-3.5 px-4">التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] text-white">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#161D2B]/50">
                <td className="py-3.5 px-4 font-bold text-white">{log.admin}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-[#FFC500]/10 text-[#FFC500] font-bold text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#D1D5DB] font-semibold">{log.target}</td>
                <td className="py-3.5 px-4 font-mono text-[#9CA3AF] text-[11px]">{log.ip}</td>
                <td className="py-3.5 px-4 text-[#9CA3AF] text-[11px]">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
