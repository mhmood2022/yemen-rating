import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { UserProfile, UserRole, UserStatus, AccountType } from '../../../types/auth';
import { getAccess, AccessInfo } from '../../../lib/access';
import { SYSTEM_PERMISSIONS, ROLE_PERMISSIONS_MAP as INITIAL_PERMS, ROLE_PERMISSIONS_MAP, ROLE_DETAILS as INITIAL_ROLES } from '../../../constants/permissions';
import { 
  Users, 
  Shield, 
  Search, 
  RefreshCw, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  X, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal, 
  ChevronDown,
  Plus,
  RotateCcw,
  Save,
  Check,
  Building2,
  Megaphone,
  Settings,
  Crown,
  CheckSquare,
  Square,
  Edit3
} from 'lucide-react';


// مكون منسدل داكن مصغر وخفيف للهاتف
const CustomDarkSelect: React.FC<{
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full text-right" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2.5 py-2 bg-[#162238] border border-[#243354] hover:border-[#FFD000]/60 rounded-xl text-xs text-white outline-none transition-all"
      >
        <span className="truncate">{selectedOption?.label || placeholder || value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-[#FFD000]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-[#10172a] border border-[#243354] rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                opt.value === value
                  ? 'bg-[#FFD000] text-black font-black'
                  : 'text-slate-300 hover:bg-[#162238] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const UsersRolesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [access, setAccess] = useState<AccessInfo | null>(null);
  useEffect(() => { getAccess().then(setAccess); }, []);
  
  // شريط البحث والفلاتر
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccountType, setFilterAccountType] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // الترقيم
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ملف المستخدم المختار للتعديل
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editingRole, setEditingRole] = useState<UserRole>('visitor');
  const [editingStatus, setEditingStatus] = useState<UserStatus>('active');
  const [editingAccountType, setEditingAccountType] = useState<AccountType>('visitor');
  const [isUpdating, setIsUpdating] = useState(false);

  // مصفوفة الأدوار والصلاحيات
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(INITIAL_PERMS);

  const [rolesList] = useState<Record<string, { label: string; desc: string; color: string }>>(INITIAL_ROLES);

  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('super_admin');
  const [isSavingRolePerms, setIsSavingRolePerms] = useState(false);

  // نافذة إضافة دور جديد
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleKey, setNewRoleKey] = useState('');
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // التنبيهات
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 2500);
  };

  // جلب المستخدمين الحقيقيين من Supabase
  const fetchRealUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // جلب المنشآت المملوكة للملاك الحقيقيين
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id, name, owner_id')
        .not('owner_id', 'is', null);

      const bizMap = (businesses || []).reduce((acc: Record<string, string>, b: any) => {
        acc[b.owner_id] = b.name;
        return acc;
      }, {} as Record<string, string>);

      const { data: authInfo } = await supabase.rpc('admin_users_auth_info');
      const authMap = new Map<string, any>((authInfo || []).map((a: any) => [a.id, a]));
      const enriched = (data || []).map((u: any) => ({
        ...u,
        status: String(u.status || 'active').toLowerCase(),
        last_sign_in_at: authMap.get(u.id)?.last_sign_in_at ?? null,
        owned_business_name: bizMap[u.id] || null,
      }));

      setUsers(enriched);
    } catch (err: any) {
      console.error('Error fetching real users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealUsers();
  }, [fetchRealUsers]);

  // فتح ملف المستخدم
  const handleOpenUser = (u: UserProfile) => {
    setSelectedUser(u);
    setEditName(u.full_name || '');
    setEditPhone(u.phone || '');
    setEditEmail(u.email || '');
    setEditingRole(u.role || 'visitor');
    setEditingStatus(u.status || 'active');
    setEditingAccountType(u.account_type || (u.role === 'owner' ? 'owner' : 'visitor'));
  };

  // ترقية سريعة فورية للمدير العام
  const handleQuickSuperAdmin = () => {
    setEditingRole('super_admin');
    setEditingAccountType('owner');
    setEditingStatus('active');
    showToast('تم تعيين المشرف العام. اضغط حفظ لتأكيدها.');
  };

  // حفظ التعديلات الحقيقية
  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      const patch: Record<string, any> = {
        full_name: editName.trim(),
        phone: editPhone.trim(),
        role: editingRole,
        status: editingStatus,
        account_type: editingAccountType,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('profiles').update(patch).eq('id', selectedUser.id).select('id');
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('ليست لديك صلاحية تعديل هذا الحساب');
      const merged = { ...selectedUser, ...patch };
      setUsers(prev => prev.map(u => (u.id === selectedUser.id ? { ...u, ...merged } : u)));
      setSelectedUser(merged as any);
      showToast('تم الحفظ بنجاح');
    } catch (err: any) {
      showToast('تعذر الحفظ: ' + (err?.message || ''), 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // تبديل صلاحية
  const readOnlyRoles = () => showToast('الأدوار والصلاحيات ثابتة ومطبّقة في قاعدة البيانات، ولا تُعدَّل من هنا', 'error');
  const togglePermissionForRole = (_id: string) => readOnlyRoles();
  
  
  
  
  
  // مسميات الأوسمة المختصرة الأنيقة للهواتف
  const getShortRoleBadge = (role: string) => {
    switch(role) {
      case 'super_admin': return { label: 'المشرف العام', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'admin': return { label: 'مسؤول إدارة', color: 'bg-amber-500/15 text-[#FFD000] border-amber-500/30' };
      case 'staff': return { label: 'موظف إشراف', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'owner': return { label: 'مالك منشأة', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      default: return { label: 'زائر', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phone?.includes(searchTerm));

      if (!matchesSearch) return false;

      if (filterAccountType !== 'all') {
        const userAccType = u.account_type || (u.role === 'owner' ? 'owner' : 'visitor');
        if (userAccType !== filterAccountType) return false;
      }

      if (filterRole !== 'all' && u.role !== filterRole) return false;
      if (filterStatus !== 'all' && u.status !== filterStatus) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      return (a.full_name || '').localeCompare(b.full_name || '');
    });
  }, [users, searchTerm, filterAccountType, filterRole, filterStatus, sortBy]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  return (
    <div className="space-y-4 font-['Cairo',sans-serif] text-white p-1.5 sm:p-4 max-w-7xl mx-auto" dir="rtl">
      
      {/* التنبيهات المنسدلة */}
      {toast.show && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[92%] animate-in fade-in duration-150">
          <div className={`p-2.5 rounded-xl border shadow-xl flex items-center gap-2 backdrop-blur-md text-xs ${
            toast.type === 'success' ? 'bg-[#10172a]/95 border-[#10b981]/50 text-white' : 'bg-[#10172a]/95 border-rose-500/50 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" /> : <X className="w-4 h-4 text-rose-500 shrink-0" />}
            <span className="font-bold leading-tight">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* الترويسة الرئيسية المصغرة المتناسقة مع الهاتف */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#162238] border border-[#243354] flex items-center justify-center text-[#FFD000] shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-tight">
              إدارة المستخدمين والأدوار
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              الحسابات المسجلة فعلياً وضبط الأدوار والصلاحيات.
            </p>
          </div>
        </div>

        {/* أزرار التبديل المصغرة */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <div className="bg-[#10172a] border border-[#1e293b] p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-[#FFD000] text-black font-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>المستخدمون ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'roles' ? 'bg-[#FFD000] text-black font-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>الأدوار والصلاحيات</span>
            </button>
          </div>

          <button
            onClick={fetchRealUsers}
            disabled={loading}
            className="p-2 bg-[#162238] hover:bg-slate-700 text-slate-300 rounded-xl border border-[#243354] transition-all"
            title="تحديث"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFD000]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* التبويب 1: قائمة المستخدمين الحقيقية المصغرة */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          
          {/* شريط الفرز والبحث المصغر */}
          <div className="bg-[#10172a] border border-[#1e293b] p-3 rounded-xl space-y-2 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              
              <div className="relative lg:col-span-2">
                <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، البريد، الهاتف..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pr-8 pl-3 py-2 bg-[#162238] border border-[#243354] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFD000]"
                />
              </div>

              <CustomDarkSelect
                value={filterAccountType}
                onChange={val => { setFilterAccountType(val); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'كافة الحسابات' },
                  { value: 'visitor', label: 'حساب زائر' },
                  { value: 'owner', label: 'حساب مالك' },
                ]}
              />

              <CustomDarkSelect
                value={filterRole}
                onChange={val => { setFilterRole(val); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'كافة الأدوار' },
                  ...Object.entries(rolesList).map(([k, v]) => ({ value: k, label: v.label }))
                ]}
              />

              <CustomDarkSelect
                value={sortBy}
                onChange={val => setSortBy(val as any)}
                options={[
                  { value: 'newest', label: 'الأحدث تسجيلاً' },
                  { value: 'oldest', label: 'الأقدم تسجيلاً' },
                  { value: 'name', label: 'أبجدياً بالاسم' },
                ]}
              />
            </div>
          </div>

          {/* الجدول المصغر المتجاوب مع الهاتف */}
          <div className="bg-[#10172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-md">
            {loading ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FFD000]" />
                <p className="text-xs">جارٍ جلب الحسابات...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <h3 className="text-sm font-bold text-white">لم يتم العثور على مستخدمين</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#162238] text-slate-400 border-b border-[#243354] text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">المستخدم</th>
                      <th className="py-2.5 px-2 font-bold text-center">نوع الحساب</th>
                      <th className="py-2.5 px-2 font-bold text-center">الدور</th>
                      <th className="py-2.5 px-2 font-bold text-center">الحالة</th>
                      <th className="py-2.5 px-2 font-bold">الهاتف</th>
                      <th className="py-2.5 px-2 font-bold text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {paginatedUsers.map((u) => {
                      const accountType = u.account_type || (u.role === 'owner' ? 'owner' : 'visitor');
                      const roleMeta = getShortRoleBadge(u.role || 'visitor');
                      const isMainAdmin = u.email === 'mhmood7015@gmail.com';
                      
                      return (
                        <tr 
                          key={u.id}
                          className="hover:bg-[#162238]/60 transition-colors cursor-pointer"
                          onClick={() => handleOpenUser(u)}
                        >
                          {/* المستخدم */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#162238] border border-[#243354] flex items-center justify-center text-[#FFD000] font-black text-xs shrink-0">
                                {isMainAdmin ? (
                                  <Crown className="w-4 h-4 text-[#FFD000]" />
                                ) : (
                                  (u.full_name?.charAt(0) || u.email?.charAt(0) || 'م').toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <strong className="font-bold text-white text-xs truncate block max-w-[130px]">
                                    {u.full_name || 'مستخدم مسجل'}
                                  </strong>
                                  {isMainAdmin && (
                                    <span className="bg-[#FFD000]/15 text-[#FFD000] border border-[#FFD000]/30 text-[9px] font-bold px-1 rounded whitespace-nowrap">
                                      المدير
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[130px]">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* نوع الحساب في سطر واحد بدون انكسار */}
                          <td className="py-2.5 px-2 text-center">
                            <span className={`whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold border ${
                              accountType === 'owner' 
                                ? 'bg-[#FFD000]/10 text-[#FFD000] border-[#FFD000]/30' 
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {accountType === 'owner' ? 'مالك' : 'زائر'}
                            </span>
                          </td>

                          {/* الدور في سطر واحد رشيق */}
                          <td className="py-2.5 px-2 text-center">
                            <span className={`whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta.color}`}>
                              {roleMeta.label}
                            </span>
                          </td>

                          {/* الحالة */}
                          <td className="py-2.5 px-2 text-center">
                            <span className={`whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'active' 
                                ? 'bg-emerald-500/15 text-[#10b981] border border-emerald-500/30' 
                                : u.status === 'suspended'
                                ? 'bg-amber-500/15 text-[#FFD000] border border-amber-500/30'
                                : 'bg-rose-500/15 text-[#EF4444] border border-rose-500/30'
                            }`}>
                              {u.status === 'active' ? 'نشط' : u.status === 'suspended' ? 'معلق' : 'معطل'}
                            </span>
                          </td>

                          {/* الهاتف */}
                          <td className="py-2.5 px-2 font-mono text-[10px] text-slate-300 whitespace-nowrap" dir="ltr">
                            {u.phone || '—'}
                          </td>

                          {/* زر الإدارة */}
                          <td className="py-2.5 px-2 text-center" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenUser(u)}
                              className="px-2 py-1 bg-[#162238] hover:bg-[#FFD000] hover:text-black text-slate-200 border border-[#243354] rounded text-[11px] font-bold transition-all whitespace-nowrap"
                            >
                              إدارة ←
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* شريط الترقيم المصغر */}
            {totalPages > 1 && (
              <div className="p-2.5 bg-[#162238] border-t border-[#243354] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  صفحة <strong className="text-white">{currentPage}</strong> من {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 bg-[#10172a] disabled:opacity-30 rounded text-white border border-[#243354]"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1 bg-[#10172a] disabled:opacity-30 rounded text-white border border-[#243354]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* التبويب 2: إدارة الأدوار والصلاحيات المصغر */}
      {/* ============================================================== */}
      {activeTab === 'roles' && (
        <div className="space-y-3">
          <div className="bg-[#10172a] border border-[#1e293b] p-3 rounded-xl space-y-3 shadow-md">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
              <h2 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#FFD000]" />
                <span>محرر الصلاحيات المركزي</span>
              </h2>

              <button
                onClick={readOnlyRoles}
                className="bg-[#FFD000] text-black font-black py-1.5 px-3 rounded-lg text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>دور جديد</span>
              </button>
            </div>

            {/* أزرار الأدوار المصغرة */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {Object.entries(rolesList).map(([rKey, rMeta]) => {
                const isSelected = selectedRoleKey === rKey;
                const count = users.filter(u => u.role === rKey).length;
                const permsCount = (rolePermissions[rKey] || []).length;

                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => setSelectedRoleKey(rKey)}
                    className={`p-2 rounded-xl border text-right transition-all shrink-0 w-36 space-y-1 ${
                      isSelected
                        ? 'bg-[#162238] border-[#FFD000]'
                        : 'bg-[#10172a] border-[#243354] text-slate-400'
                    }`}
                  >
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block ${rMeta.color}`}>
                      {rMeta.label}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      {permsCount} صلاحية • {count} مستخدم
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* محرر الصلاحيات المصغر */}
          <div className="bg-[#10172a] border border-[#1e293b] p-3 sm:p-4 rounded-xl space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#162238] border border-[#243354] p-2.5 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400">تعديل صلاحيات:</span>
                <strong className="text-white text-xs font-black mr-1">{rolesList[selectedRoleKey]?.label}</strong>
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={handleGrantAllPermissions}
                  className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>منح الكل</span>
                </button>

                <button
                  type="button"
                  onClick={handleRevokeAllPermissions}
                  className="px-2 py-1 bg-rose-600/20 text-rose-400 rounded text-[10px] font-bold border border-rose-500/30 flex items-center gap-1"
                >
                  <Square className="w-3 h-3" />
                  <span>سحب الكل</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingRolePerms}
                  onClick={handleSaveRolePermissions}
                  className="px-3 py-1 bg-[#FFD000] text-black rounded text-[11px] font-black flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  <span>حفظ الصلاحيات</span>
                </button>
              </div>
            </div>

            {/* الأقسام الأربعة المصغرة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                { domain: 'users', title: 'المستخدمون والحسابات', icon: Users },
                { domain: 'facilities', title: 'دليل المنشآت والأنشطة', icon: Building2 },
                { domain: 'ads', title: 'الإعلانات والترويج (YR Ads)', icon: Megaphone },
                { domain: 'settings', title: 'إعدادات النظام والمالية', icon: Settings },
              ].map(sec => (
                <div key={sec.domain} className="bg-[#162238] border border-[#243354] rounded-xl p-3 space-y-2">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-[#243354] pb-1.5">
                    <sec.icon className="w-3.5 h-3.5 text-[#FFD000]" />
                    <span>{sec.title}</span>
                  </h3>
                  <div className="space-y-1.5">
                    {SYSTEM_PERMISSIONS.filter(p => p.domain === sec.domain).map(p => {
                      const isEnabled = (rolePermissions[selectedRoleKey] || []).includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => togglePermissionForRole(p.id)}
                          className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer text-xs ${
                            isEnabled ? 'bg-[#10172a] border-[#10b981]/50 text-white' : 'bg-[#10172a]/60 border-[#243354]/60 text-slate-400'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-[11px] block">{p.name}</span>
                            <span className="text-[9px] text-slate-400 block">{p.description}</span>
                          </div>
                          <div className={`w-8 h-4 rounded-full relative flex items-center px-0.5 shrink-0 ${
                            isEnabled ? 'bg-[#10b981]' : 'bg-slate-700'
                          }`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                              isEnabled ? '-translate-x-3.5' : 'translate-x-0'
                            }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* نافذة إنشاء دور جديد مصغرة */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#0B0F17] border border-[#243354] rounded-2xl w-full max-w-sm p-4 space-y-3 text-right text-xs">
            <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
              <h3 className="font-bold text-white">إنشاء دور إداري جديد</h3>
              <button onClick={() => setIsNewRoleModalOpen(false)} className="text-slate-400 p-1"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateNewRole} className="space-y-2">
              <div>
                <label className="text-slate-400 block mb-0.5">معرف الدور بالإنجليزية:</label>
                <input
                  type="text"
                  value={newRoleKey}
                  onChange={e => setNewRoleKey(e.target.value)}
                  placeholder="supervisor"
                  className="w-full bg-[#162238] border border-[#243354] rounded-lg p-2 text-white font-mono text-left"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-0.5">اسم الدور بالعربية:</label>
                <input
                  type="text"
                  value={newRoleLabel}
                  onChange={e => setNewRoleLabel(e.target.value)}
                  placeholder="مشرف مناطق"
                  className="w-full bg-[#162238] border border-[#243354] rounded-lg p-2 text-white"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-[#FFD000] text-black font-black py-2 rounded-lg text-xs">إنشاء الدور</button>
                <button type="button" onClick={() => setIsNewRoleModalOpen(false)} className="px-3 bg-[#162238] text-slate-300 rounded-lg text-xs">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة ملف المستخدم المصغرة المريحة للهاتف */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-100"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-[#0B0F17] border border-[#243354] rounded-2xl w-full max-w-sm p-4 space-y-3 text-right shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* الترويسة */}
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#162238] border border-[#243354] flex items-center justify-center text-[#FFD000] font-black text-xs shrink-0">
                  {selectedUser.email === 'mhmood7015@gmail.com' ? <Crown className="w-5 h-5 text-[#FFD000]" /> : (editName?.charAt(0) || 'م')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white truncate">{editName || 'مستخدم'}</h3>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">{selectedUser.email}</span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 p-1"><X size={16} /></button>
            </div>

            {/* تمييز حساب المدير العام */}
            {selectedUser.email === 'mhmood7015@gmail.com' && (
              <div className="bg-amber-500/10 border border-[#FFD000]/40 p-2 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#FFD000]" />
                  <span className="text-[11px] font-bold text-white">حساب المدير العام</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickSuperAdmin}
                  className="bg-[#FFD000] text-black font-black px-2.5 py-1 rounded text-[10px]"
                >
                  تعيين كمشرف عام
                </button>
              </div>
            )}

            {/* الحقول المصغرة */}
            <div className="space-y-2 bg-[#10172a] border border-[#1e293b] p-3 rounded-xl text-xs">
              <div>
                <label className="text-slate-400 block mb-0.5 text-[11px]">الاسم الكامل:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#162238] border border-[#243354] rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 text-[11px]">رقم الهاتف:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full bg-[#162238] border border-[#243354] rounded-lg p-2 text-white font-mono text-xs"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="text-slate-400 block mb-0.5 text-[11px]">نوع الحساب:</label>
                  <CustomDarkSelect
                    value={editingAccountType}
                    onChange={val => setEditingAccountType(val as AccountType)}
                    options={[
                      { value: 'visitor', label: 'حساب زائر' },
                      { value: 'owner', label: 'حساب مالك' },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-0.5 text-[11px]">الدور الإداري:</label>
                  <CustomDarkSelect
                    value={editingRole}
                    onChange={val => setEditingRole(val as UserRole)}
                    options={Object.entries(rolesList).map(([k, v]) => ({ value: k, label: v.label }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">حالة الحساب:</label>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  {[
                    { key: 'active', label: 'نشط', color: 'border-emerald-500 text-emerald-400' },
                    { key: 'suspended', label: 'معلق', color: 'border-amber-500 text-[#FFD000]' },
                    { key: 'disabled', label: 'معطل', color: 'border-rose-500 text-rose-400' },
                  ].map(st => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setEditingStatus(st.key as UserStatus)}
                      className={`py-1.5 px-1 rounded-lg font-bold border ${
                        editingStatus === st.key ? `bg-[#162238] ${st.color} border-2` : 'bg-[#10172a] text-slate-500 border-[#1e293b]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex gap-1.5 pt-1 border-t border-[#1e293b]">
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveUserChanges}
                className="flex-1 bg-[#FFD000] text-black font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md"
              >
                {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>حفظ في السيرفر</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-3 bg-[#162238] text-slate-300 font-bold py-2 rounded-xl text-xs border border-[#243354]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersRolesManager;
