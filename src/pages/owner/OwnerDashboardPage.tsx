import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserProfile, OwnerRequest } from '../../types/auth';
import { AuthModal } from '../../components/auth/AuthModal';
import { OwnerRequestModal } from '../../components/account/OwnerRequestModal';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  Edit3, 
  AlertTriangle,
  LogIn,
  Search,
  ArrowRight
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // المنشآت المعتمدة التي يملكها هذا المستخدم فعلياً في قاعدة البيانات
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  
  // طلبات التوثيق وإضافة المنشآت الجارية الخاصة بهذا المستخدم
  const [myRequests, setMyRequests] = useState<OwnerRequest[]>([]);

  // حالات النوافذ
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newBusinessModalOpen, setNewBusinessModalOpen] = useState(false);

  // جلب البيانات الحقيقية فقط بدون أي بيانات وهمية
  const loadOwnerData = useCallback(async () => {
    setLoading(true);
    try {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // 1. فحص المستخدم المسجل حالياً
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      // 2. جلب الملف الشخصي ورتبة المستخدم (visitor / owner / admin)
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (prof) setProfile(prof as UserProfile);

      // 3. جلب المنشآت المعتمدة المربوطة بحساب هذا المالك (owner_id = user.id)
      const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', currentUser.id);

      setMyBusinesses(businesses || []);

      // 4. جلب طلبات إثبات الملكية وإضافة المنشآت الخاصة بهذا المالك
      const { data: requests } = await supabase
        .from('owner_requests')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      setMyRequests((requests as OwnerRequest[]) || []);

    } catch (err) {
      console.error('Error loading owner dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwnerData();
  }, [loadOwnerData]);

  // دالة تحويل الحالة إلى وسام ولون رسمي
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under_review':
      case 'submitted':
        return {
          label: 'قيد المراجعة',
          color: 'bg-amber-500/10 text-[#FFD000] border-amber-500/30',
          icon: Clock
        };
      case 'needs_update':
        return {
          label: 'يحتاج معلومات إضافية',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          icon: AlertCircle
        };
      case 'approved':
        return {
          label: 'مقبول ومعتمد',
          color: 'bg-emerald-500/10 text-[#10b981] border-emerald-500/30',
          icon: CheckCircle2
        };
      case 'rejected':
        return {
          label: 'مرفوض',
          color: 'bg-rose-500/10 text-[#EF4444] border-rose-500/30',
          icon: XCircle
        };
      case 'cancelled':
        return {
          label: 'ملغى',
          color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          icon: AlertTriangle
        };
      default:
        return {
          label: 'مسودة',
          color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          icon: Clock
        };
    }
  };

  return (
    <div className="min-h-screen text-white p-3.5 sm:p-6 max-w-4xl mx-auto space-y-6" dir="rtl">
      
      {/* 1. الترويسة الرئيسية ومعلومات حساب المالك */}
      <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#162238] border border-[#243354] flex items-center justify-center text-[#FFD000] shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">لوحة تحكم المالك</h1>
                {profile?.role === 'owner' ? (
                  <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> حساب مالك معتمد
                  </span>
                ) : user ? (
                  <span className="bg-slate-700/50 text-slate-300 border border-slate-600/50 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    حساب زائر
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {user ? (
                  <span>المستخدم: <strong className="text-white">{profile?.full_name || user.email}</strong></span>
                ) : (
                  <span>يرجى تسجيل الدخول للوصول إلى منشآتك وإدارتها.</span>
                )}
              </p>
            </div>
          </div>

          {/* أزرار العمليات السريعة */}
          <div className="flex gap-2 w-full sm:w-auto">
            {user ? (
              <>
                <button
                  onClick={() => setNewBusinessModalOpen(true)}
                  className="flex-1 sm:flex-initial bg-[#FFD000] hover:bg-yellow-300 text-black font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>طلب إضافة منشأة جديدة</span>
                </button>

                <Link
                  to="/"
                  className="bg-[#162238] hover:bg-slate-700 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#243354] transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-[#FFD000]" />
                  <span>المطالبة بمنشأة قائمة</span>
                </Link>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto bg-[#FFD000] hover:bg-yellow-300 text-black font-black py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4 stroke-[3]" />
                <span>تسجيل الدخول / إنشاء حساب</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* تنبيه إذا كان المستخدم غير مسجل دخول */}
      {!user && !loading && (
        <div className="bg-[#10172a] border border-amber-500/30 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#FFD000] border border-amber-500/20 mx-auto flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">يجب تسجيل الدخول كمالك أولاً</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            للوصول إلى المنشآت التي تمتلكها أو متابعة طلبات إثبات الملكية التي أرسلتها للإدارة، يرجى تسجيل الدخول إلى حسابك.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="bg-[#FFD000] text-black font-black text-xs py-2.5 px-6 rounded-xl inline-flex items-center gap-2 shadow-lg"
          >
            <span>تسجيل الدخول الآن</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* محتوى اللوحة للمستخدم المسجل */}
      {user && (
        <div className="space-y-6">

          {/* 2. قسم "منشآتي" (My Facilities) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FFD000]" />
                <span>منشآتي المعتمدة ({myBusinesses.length})</span>
              </h2>
            </div>

            {myBusinesses.length === 0 ? (
              <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-8 text-center space-y-3">
                <Building2 className="w-10 h-10 mx-auto text-slate-600" />
                <h3 className="text-sm font-bold text-white">لا توجد منشآت مرتبطة بحسابك حالياً</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  حسابك لا يمتلك أي منشأة معتمدة حتى الآن. يمكنك البحث عن منشأتك في الدليل والمطالبة بملكيتها، أو طلب إضافة منشأة جديدة لمراجعتها من قبل الإدارة.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <Link
                    to="/"
                    className="bg-[#162238] hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs border border-[#243354] inline-flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5 text-[#FFD000]" />
                    <span>البحث عن منشأتي والمطالبة بها</span>
                  </Link>
                  <button
                    onClick={() => setNewBusinessModalOpen(true)}
                    className="bg-[#FFD000] hover:bg-yellow-300 text-black font-black py-2 px-4 rounded-xl text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>طلب إضافة منشأة جديدة</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {myBusinesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#162238] border border-[#243354] flex items-center justify-center overflow-hidden shrink-0">
                          {biz.logo_url ? (
                            <img src={biz.logo_url} alt={biz.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 text-[#FFD000]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-sm sm:text-base leading-tight">{biz.name}</h3>
                          <span className="text-[11px] text-[#FFD000] font-bold block mt-0.5">{biz.city || 'اليمن'}</span>
                        </div>
                      </div>

                      <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> معتمدة
                      </span>
                    </div>

                    <div className="bg-[#162238] border border-[#243354] rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">الهاتف:</span>
                        <span className="text-white font-mono" dir="ltr">{biz.phone || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">العنوان:</span>
                        <span className="text-slate-300 truncate max-w-[200px]">{biz.address || biz.city}</span>
                      </div>
                    </div>

                    {/* زر فتح القالب الإداري الموحد لإدارة هذه المنشأة المصرح له بها فقط */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/admin/companies?edit=${biz.id}`)}
                        className="flex-1 bg-[#FFD000] hover:bg-yellow-300 text-black font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Edit3 className="w-4 h-4 stroke-[2.5]" />
                        <span>إدارة المنشأة وتعديل البيانات</span>
                      </button>

                      <Link
                        to={`/bar/${biz.slug || biz.id}`}
                        className="p-2.5 bg-[#162238] hover:bg-slate-700 text-white rounded-xl border border-[#243354] transition-colors"
                        title="معاينة الصفحة العامة"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. قسم "طلباتي الجارية" (متابعة حالات إثبات الملكية وإضافة المنشآت) */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>متابعة طلبات التوثيق والملكية ({myRequests.length})</span>
            </h2>

            {myRequests.length === 0 ? (
              <div className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-6 text-center text-slate-400 text-xs">
                لا توجد طلبات توثيق معلقة أو مرسلة حالياً.
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => {
                  const badge = getStatusBadge(req.status);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={req.id}
                      className="bg-[#10172a] border border-[#1e293b] rounded-2xl p-4 sm:p-5 space-y-3 shadow-md"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-400">
                              {req.request_type === 'new_business' ? 'طلب إضافة منشأة جديدة' : 'طلب إثبات ملكية منشأة'}
                            </span>
                            <h3 className="text-sm font-bold text-white">{req.business_name}</h3>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            تاريخ الإرسال: {new Date(req.created_at).toLocaleDateString('ar-YE')}
                          </span>
                        </div>

                        {/* وسم الحالة الصريح باللون المخصص */}
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${badge.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {/* رسائل وملاحظات الإدارة للمالك */}
                      {req.admin_notes && (
                        <div className="bg-[#162238] border border-[#243354] rounded-xl p-3 text-xs space-y-1">
                          <span className="font-bold text-[#FFD000] block flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> ملاحظة الإدارة العامة:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{req.admin_notes}</p>
                        </div>
                      )}

                      {/* تنبيه بعدم إتاحة الصلاحية إلا بعد الموافقة */}
                      {req.status !== 'approved' && (
                        <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>صلاحية إدارة المنشأة تفتح تلقائياً فور اعتماد وموافقة الإدارة على طلبك.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* نوافذ النظام الحقيقية */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            setAuthModalOpen(false);
            loadOwnerData();
          }}
        />
      )}

      {newBusinessModalOpen && (
        <OwnerRequestModal
          isOpen={newBusinessModalOpen}
          onClose={() => {
            setNewBusinessModalOpen(false);
            loadOwnerData();
          }}
          userId={user?.id || ''}
          userPhone={profile?.phone || ''}
        />
      )}

    </div>
  );
};

export default OwnerDashboardPage;
