#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import shutil, sys
from datetime import datetime

FILE = "src/pages/admin/users/UsersRolesManager.tsx"
backup = f"{FILE}.bak_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
shutil.copy(FILE, backup)
print(f"✅ نسخة احتياطية: {backup}")

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()
original = content

# 1) useEffect لجلب الصلاحيات
TOAST_LINE = "const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });"
LOAD_EFFECT = TOAST_LINE + """

  // 🔄 جلب صلاحيات الأدوار من Supabase عند فتح الصفحة
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('role_id, permissions!inner(key)');
        if (error) {
          console.warn('role_permissions fetch:', error.message);
          return;
        }
        const map: Record<string, string[]> = {};
        (data || []).forEach((row: any) => {
          const key = row.permissions?.key;
          if (!key) return;
          if (!map[row.role_id]) map[row.role_id] = [];
          map[row.role_id].push(key);
        });
        setRolePermissions((prev) => ({ ...prev, ...map }));
      } catch (e) {
        console.warn('role_permissions exception:', e);
      }
    })();
  }, []);"""

if TOAST_LINE in content:
    content = content.replace(TOAST_LINE, LOAD_EFFECT, 1)
    print("✅ [1/5] useEffect")
else:
    print("⚠️  [1/5] لم أجد toast")

# 2) togglePermissionForRole
OLD_TOGGLE = "const togglePermissionForRole = (_id: string) => readOnlyRoles();"
NEW_TOGGLE = """const togglePermissionForRole = (permId: string) => {
    setRolePermissions((prev) => {
      const current = prev[selectedRoleKey] || [];
      const next = current.includes(permId)
        ? current.filter((p) => p !== permId)
        : [...current, permId];
      return { ...prev, [selectedRoleKey]: next };
    });
  };"""

if OLD_TOGGLE in content:
    content = content.replace(OLD_TOGGLE, NEW_TOGGLE, 1)
    print("✅ [2/5] toggle")
else:
    print("⚠️  [2/5] لم أجد toggle")

# 3) grant
OLD_GRANT = """const handleGrantAllPermissions = () => {
    try {
      if (typeof setRolePermissions === "function") {
        const allIds = SYSTEM_PERMISSIONS.map((p: any) => p.id);
        setRolePermissions((prev: any) => ({ ...prev, [selectedRoleKey]: allIds }));
        showToast("تم تحديد جميع الصلاحيات");
        return;
      }
    } catch (_) {}
    readOnlyRoles();
  };"""
NEW_GRANT = """const handleGrantAllPermissions = () => {
    const allIds = SYSTEM_PERMISSIONS.map((p: any) => p.id);
    setRolePermissions((prev) => ({ ...prev, [selectedRoleKey]: allIds }));
    showToast("تم تحديد جميع الصلاحيات (لم تُحفظ بعد)", "success");
  };"""

if OLD_GRANT in content:
    content = content.replace(OLD_GRANT, NEW_GRANT, 1)
    print("✅ [3/5] grant")
else:
    print("⚠️  [3/5] لم أجد grant")

# 4) revoke + save
OLD_REVOKE = """const handleRevokeAllPermissions = () => {
    try {
      if (typeof setRolePermissions === "function") {
        setRolePermissions((prev: any) => ({ ...prev, [selectedRoleKey]: [] }));
        showToast("تم سحب جميع الصلاحيات");
        return;
      }
    } catch (_) {}
    readOnlyRoles();
  };"""
NEW_REVOKE = """const handleRevokeAllPermissions = () => {
    setRolePermissions((prev) => ({ ...prev, [selectedRoleKey]: [] }));
    showToast("تم سحب جميع الصلاحيات (لم تُحفظ بعد)", "success");
  };

  // 💾 حفظ صلاحيات الدور في Supabase
  const handleSaveRolePermissions = async () => {
    if (isSavingRolePerms || !supabase) return;
    setIsSavingRolePerms(true);
    try {
      const permKeys = rolePermissions[selectedRoleKey] || [];
      const roleLabel = rolesList[selectedRoleKey]?.label || selectedRoleKey;
      let permRows: { id: string; key: string }[] = [];
      if (permKeys.length > 0) {
        const { data, error } = await supabase
          .from('permissions')
          .select('id, key')
          .in('key', permKeys);
        if (error) throw error;
        permRows = data || [];
      }
      const { error: delErr } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', selectedRoleKey);
      if (delErr) throw delErr;
      if (permRows.length > 0) {
        const { error: insErr } = await supabase
          .from('role_permissions')
          .insert(permRows.map((p) => ({
            role_id: selectedRoleKey,
            permission_id: p.id,
          })));
        if (insErr) throw insErr;
      }
      showToast(`✅ تم حفظ ${permKeys.length} صلاحية لـ "${roleLabel}"`, 'success');
    } catch (e: any) {
      console.error('Save error:', e);
      showToast(`❌ فشل الحفظ: ${e.message || 'خطأ'}`, 'error');
    } finally {
      setIsSavingRolePerms(false);
    }
  };"""

if OLD_REVOKE in content:
    content = content.replace(OLD_REVOKE, NEW_REVOKE, 1)
    print("✅ [4/5] revoke + save")
else:
    print("⚠️  [4/5] لم أجد revoke")

# حفظ
if content == original:
    print("\n❌ لم يحدث أي تعديل!")
    sys.exit(1)
with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)
print(f"\n✅ تم الحفظ: {FILE}")
