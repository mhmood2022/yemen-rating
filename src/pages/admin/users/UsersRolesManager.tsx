import React, { useState } from 'react';
import { Users, Shield, UserCheck, UserX, KeyRound } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  status: 'active' | 'suspended';
  lastActive: string;
}

const ROLES_11 = [
  { key: 'super_admin', label: 'المشرف العام (Super Admin)' },
  { key: 'general_admin', label: 'مدير عام النظام (General Admin)' },
  { key: 'support_lead', label: 'مسؤول الدعم الفني (Support Lead)' },
  { key: 'claims_officer', label: 'مسؤول التوثيق والملكية (Claims Officer)' },
  { key: 'auctions_manager', label: 'مدير المزادات (Auctions Manager)' },
  { key: 'realestate_officer', label: 'مسؤول العقارات (Real Estate Officer)' },
  { key: 'jobs_moderator', label: 'مشرف الوظائف (Jobs Moderator)' },
  { key: 'ads_manager', label: 'مدير الإعلانات YR Ads (Ads Manager)' },
  { key: 'financial_auditor', label: 'المراجع المالي (Financial Auditor)' },
  { key: 'content_reviewer', label: 'مراجع المحتوى والتقييمات (Content Reviewer)' },
  { key: 'market_analyst', label: 'محلل الأسواق والصرف (Market Analyst)' },
];

export const UsersRolesManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 'usr-1', name: 'أحمد الوصابي', email: 'ahmed@yemenrating.com', role: 'super_admin', roleLabel: 'المشرف العام', status: 'active', lastActive: 'الآن' },
    { id: 'usr-2', name: 'سامي المنصوري', email: 'sami@yemenrating.com', role: 'auctions_manager', roleLabel: 'مدير المزادات', status: 'active', lastActive: 'منذ 15 دقيقة' },
    { id: 'usr-3', name: 'فاطمة باحاج', email: 'fatima@yemenrating.com', role: 'claims_officer', roleLabel: 'مسؤول التوثيق والملكية', status: 'active', lastActive: 'منذ ساعتين' },
    { id: 'usr-4', name: 'عمر القاضي', email: 'omar@yemenrating.com', role: 'financial_auditor', roleLabel: 'المراجع المالي', status: 'active', lastActive: 'أمس' },
  ]);

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  return (
    <div className="space-y-6 font-['Cairo',sans-serif]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-[#FFC500]" />
            المستخدمون وإدارة الأدوار الـ 11 (11 Roles RBAC)
          </h2>
          <p className="text-[#9CA3AF] text-xs mt-1">
            التحكم في صلاحيات الوصول، الأدوار الإدارية المعتمدة، وتجميد أو تفعيل الحسابات.
          </p>
        </div>
      </div>

      {/* شريط الأدوار المعتمدة */}
      <div className="bg-[#0B0F17] p-4 rounded-xl border border-[#1F2937]">
        <h3 className="text-xs font-bold text-[#FFC500] mb-2 flex items-center gap-1.5">
          <KeyRound size={14} /> نظام الصلاحيات المعتمد (11 Role):
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {ROLES_11.map(r => (
            <span key={r.key} className="px-2 py-1 rounded bg-[#161D2B] text-[10px] text-[#D1D5DB] border border-[#1F2937]">
              {r.label}
            </span>
          ))}
        </div>
      </div>

      {/* جدول الإداريين والمستخدمين */}
      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
            <tr>
              <th className="py-3.5 px-4">المستخدم والبريد</th>
              <th className="py-3.5 px-4">الدور المعين (Role)</th>
              <th className="py-3.5 px-4">آخر نشاط</th>
              <th className="py-3.5 px-4 text-center">حالة الحساب</th>
              <th className="py-3.5 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] text-white">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#161D2B]/50">
                <td className="py-3.5 px-4">
                  <div className="font-bold">{u.name}</div>
                  <div className="text-[10px] text-[#9CA3AF] font-mono">{u.email}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-[#FFC500]/15 text-[#FFC500] font-bold text-[10px]">
                    {u.roleLabel}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[#9CA3AF] text-[11px]">{u.lastActive}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    u.status === 'active' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-[#DC2626]/20 text-[#DC2626]'
                  }`}>
                    {u.status === 'active' ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      u.status === 'active' 
                        ? 'bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20' 
                        : 'bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20'
                    }`}
                  >
                    {u.status === 'active' ? 'تعطيل الصلاحية' : 'تفعيل'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
