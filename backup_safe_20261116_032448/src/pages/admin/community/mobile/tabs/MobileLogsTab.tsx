import React, { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { EmptyState } from '../../shared/EmptyState';
import type { AuditLogItem } from '../../shared/types';
import { timeAgo } from '../../shared/types';

export const MobileLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('yr_moderation_logs') || '[]');
      setLogs(stored);
    } catch { setLogs([]); }
  }, []);

  return (
    <div className="space-y-3">
      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="لا توجد إجراءات" description="ستظهر هنا كل الإجراءات الإدارية" />
      ) : (
        logs.map((log) => (
          <div key={log.id} className="rounded-2xl p-4 space-y-2" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#FFC500', background: '#FFC50015', border: '1px solid #FFC50040' }}>{log.action_type}</span>
              <span className="text-[11px]" style={{ color: '#9CA3AF' }}>{timeAgo(log.created_at)}</span>
            </div>
            <p className="text-sm" style={{ color: '#FFFFFF' }}>{log.details}</p>
            <p className="text-[11px]" style={{ color: '#9CA3AF' }}>بواسطة: {log.admin_name}</p>
          </div>
        ))
      )}
    </div>
  );
};
