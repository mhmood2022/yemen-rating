import React, { useEffect, useState } from 'react';
import { Shield, History, Save, RefreshCw, Check } from 'lucide-react';
import {
  fetchStaffTabPermissions,
  saveStaffTabPermissions,
  fetchTabAuditLogs,
  type StaffTabPermissionEntry,
  type TabModulePermissions,
  type TabAuditLog,
} from '../../../services/communityTabsAdminService';

interface TabPermissionsAuditPanelProps {
  canManagePermissions: boolean;
}

const PERM_LABELS: Array<{ key: keyof TabModulePermissions; label: string }> = [
  { key: 'manageTabs', label: 'إدارة التبويبات' },
  { key: 'manageContent', label: 'إدارة المحتوى' },
  { key: 'manageForms', label: 'النماذج والقوائم' },
  { key: 'manageAds', label: 'إدارة الإعلانات' },
  { key: 'viewAnalytics', label: 'مشاهدة الإحصائيات' },
  { key: 'managePermissions', label: 'إدارة الصلاحيات' },
];

export const TabPermissionsAuditPanel: React.FC<TabPermissionsAuditPanelProps> = ({
  canManagePermissions,
}) => {
  const [staffList, setStaffList] = useState<StaffTabPermissionEntry[]>([]);
  const [logs, setLogs] = useState<TabAuditLog[]>([]);
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, staffData] = await Promise.all([
        fetchTabAuditLogs(80),
        canManagePermissions ? fetchStaffTabPermissions() : Promise.resolve([]),
      ]);
      setLogs(logsData);
      setStaffList(staffData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [canManagePermissions]);

  const toggleStaffPerm = (userId: string, key: keyof TabModulePermissions) => {
    setStaffList((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? { ...u, permissions: { ...u.permissions, [key]: !u.permissions[key] } }
          : u
      )
    );
  };

  const handleSaveUser = async (entry: StaffTabPermissionEntry) => {
    setSavingUserId(entry.userId);
    const res = await saveStaffTabPermissions(entry.userId, entry.permissions, entry.fullName);
    setSavingUserId(null);
    setStatusMsg(res.ok ? `تم حفظ صلاحيات "${entry.fullName}" بنجاح.` : res.error || 'تعذر الحفظ');
    setTimeout(() => setStatusMsg(null), 3500);
    await loadData();
  };

  const filteredLogs = logs.filter((l) => (moduleFilter === 'all' ? true : l.module === moduleFilter));

  return (
    <div className="space-y-5">
      {statusMsg && (
        <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check size={14} />
          <span>{statusMsg}</span>
        </div>
      )}

      {canManagePermissions && (
        <div className="bg-[#0B0F17] border border-[#2F3336] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#FFC500]" />
              <h3 className="text-xs sm:text-sm font-black text-white">صلاحيات المشرفين على تبويبات المجتمع</h3>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="p-1.5 rounded-lg bg-black border border-[#2F3336] text-zinc-400 hover:text-white cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {staffList.length === 0 ? (
            <p className="text-xs text-[#71767B] py-4">لا يوجد مشرفون مسجلون حالياً في جدول الحسابات.</p>
          ) : (
            <div className="space-y-2.5">
              {staffList.map((entry) => {
                const isTopAdmin = entry.role === 'super_admin' || entry.role === 'admin';
                return (
                  <div key={entry.userId} className="bg-black border border-[#2F3336] rounded-xl p-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-white">{entry.fullName}</div>
                        <div className="text-[10px] text-[#71767B] font-mono">
                          {entry.email} · {entry.role}
                        </div>
                      </div>
                      {isTopAdmin ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#FFC500]/15 text-[#FFC500] text-[10px] font-black">
                          صلاحيات كاملة تلقائياً
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={savingUserId === entry.userId}
                          onClick={() => handleSaveUser(entry)}
                          className="px-3 py-1.5 rounded-full bg-[#FFC500] text-black text-[11px] font-black flex items-center gap-1 cursor-pointer"
                        >
                          <Save size={12} />
                          <span>{savingUserId === entry.userId ? 'جارِ الحفظ...' : 'حفظ الصلاحيات'}</span>
                        </button>
                      )}
                    </div>

                    {!isTopAdmin && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PERM_LABELS.map((p) => {
                          const active = entry.permissions[p.key];
                          return (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => toggleStaffPerm(entry.userId, p.key)}
                              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-between cursor-pointer ${
                                active
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                  : 'border-[#2F3336] bg-[#0B0F17] text-[#71767B]'
                              }`}
                            >
                              <span>{p.label}</span>
                              {active && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* سجل العمليات الإدارية */}
      <div className="bg-[#0B0F17] border border-[#2F3336] rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#FFC500]" />
            <h3 className="text-xs sm:text-sm font-black text-white">سجل العمليات الإدارية للتبويبات</h3>
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-black border border-[#2F3336] focus:border-white rounded-xl px-3 py-1.5 text-xs text-white outline-none"
          >
            <option value="all">كل الوحدات</option>
            <option value="tabs">إدارة التبويبات</option>
            <option value="content">إدارة المحتوى</option>
            <option value="forms">النماذج والقوائم</option>
            <option value="ads">الإعلانات</option>
            <option value="permissions">الصلاحيات</option>
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="text-xs text-[#71767B] py-6 text-center">لا توجد عمليات مسجلة بعد.</p>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-black border border-[#2F3336] flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{log.action}</div>
                  <div className="text-[10px] text-[#71767B]">
                    بواسطة: <span className="text-zinc-300 font-semibold">{log.actor_name}</span>
                    {log.section_id ? ` · القسم: ${log.section_id}` : ''}
                    {` · الوحدة: ${log.module}`}
                  </div>
                </div>
                <div className="text-[10px] text-[#71767B] font-mono">
                  {new Date(log.created_at).toLocaleString('ar-YE')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
