import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShieldCheck } from 'lucide-react';

export const AdminDashboardShell: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A]">لوحة التحكم المركزية</h2>
          <p className="text-xs text-[#64748B]">مرحلة تأسيس نظام الإدارة (Phase 1 Ready)</p>
        </div>
        <Badge variant="success" size="md">
          <ShieldCheck size={14} className="ml-1" />
          جلسة مشفرة ومحمية
        </Badge>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-[#0B1F3A] mb-2">حالة الاتصال والتحقق</h3>
        <p className="text-xs text-[#64748B] leading-relaxed">
          تم تفعيل التحقق الثلاثي (Supabase Auth + Role Verification + RLS Policies). سيتم بناء صفحات الإدارة المفصلة في المراحل المخصصة لها وفق أمر التنفيذ.
        </p>
      </Card>
    </div>
  );
};
