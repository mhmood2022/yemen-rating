import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../../components/ui/Card';
import { ShieldCheck, Clock, Activity } from 'lucide-react';

export const AdminAuditLogsView: React.FC = () => {
  const { auditLogs } = useAdmin();

  return (
    <div className="space-y-4 text-right">
      <div className="pb-3 border-b border-[#222222]">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Activity size={18} strokeWidth={2} className="text-[#F5C400]" />
          <span>سجل العمليات الإدارية الموثق (Audit Logs)</span>
        </h2>
        <p className="text-xs text-[#A1A1AA]">
          توثيق كامل لكافة عمليات المشرفين (تغيير الشارات، تحديث الأسعار، نشر الإعلانات، وحذف البيانات).
        </p>
      </div>

      <div className="space-y-2.5">
        {auditLogs.map((log) => (
          <Card key={log.id} className="p-3.5 bg-[#111111] border border-[#222222] rounded-[12px] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck size={15} className="text-[#F5C400]" />
                <span>{log.action} · {log.targetName}</span>
              </div>
              <span className="text-[10px] text-[#71717A] flex items-center gap-1 font-mono">
                <Clock size={11} />
                <span>{log.timestamp}</span>
              </span>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed pr-6">
              {log.details}
            </p>

            <div className="pr-6 pt-1 text-[10px] text-[#71717A]">
              المشرف المسؤول: <strong className="text-white">{log.adminName}</strong> ({log.adminEmail})
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
