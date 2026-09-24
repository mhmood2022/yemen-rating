import { supabase } from './supabase';

export type Role = 'visitor' | 'owner' | 'staff' | 'admin' | 'super_admin';

// مرآة لدالة has_permission في القاعدة. للواجهة فقط؛ الحماية الفعلية في RLS + Trigger.
const PERMS: Record<Role, string[] | '*'> = {
  super_admin: '*',
  admin: ['users.view', 'users.edit', 'roles.view'],
  staff: ['users.view'],
  owner: [],
  visitor: [],
};

export interface AccessInfo {
  userId: string | null;
  email: string | null;
  role: Role;
  active: boolean;
  isStaff: boolean;
  can: (permission: string) => boolean;
}

const empty: AccessInfo = {
  userId: null, email: null, role: 'visitor', active: false, isStaff: false, can: () => false,
};

export async function getAccess(): Promise<AccessInfo> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return empty;

    const { data: p } = await supabase
      .from('profiles')
      .select('role,status,is_blocked')
      .eq('id', session.user.id)
      .maybeSingle();

    const role = ((p?.role as Role) || 'visitor');
    const active = String(p?.status || '').toLowerCase() === 'active' && !p?.is_blocked;
    const isStaff = active && ['staff', 'admin', 'super_admin'].includes(role);
    const list = PERMS[role] ?? [];

    return {
      userId: session.user.id,
      email: session.user.email ?? null,
      role, active, isStaff,
      can: (k) => active && (list === '*' || list.includes(k)),
    };
  } catch {
    return empty;
  }
}
