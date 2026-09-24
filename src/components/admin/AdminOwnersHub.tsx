import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  Search, 
  FileText, 
  UserCheck, 
  Inbox, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  User, 
  Trash2,
  Mail,
  MapPin,
  Crown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../services/notificationService';

// هيكل المالك الحقيقي في سجل الملاك
interface OwnerAccountRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  facilityName: string;
  facilitySector: string;
  facilityCity: string;
  facilityStatus: 'verified' | 'pending' | 'none';
  joinedDate: string;
}

interface PendingClaimItem {
  id: string;
  originalId?: string;
  facilityName: string;
  sector: string;
  city: string;
  applicantName: string;
  applicantEmail: string;
  applicantUserId?: string;
  phone: string;
  commercialRegisterNo: string;
  documentUrl?: string;
  requestDate: string;
}

export const AdminOwnersHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'claims'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. سجل الملاك الحقيقيين (البشر المسجلين كـ ملاك ومنشآتهم)
  const [ownersDirectory, setOwnersDirectory] = useState<OwnerAccountRecord[]>([]);

  // 2. طلبات الملكية المعلقة بأسماء أصحابها الحقيقية
  const [pendingClaims, setPendingClaims] = useState<PendingClaimItem[]>([]);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [activeModal, setActiveModal] = useState<{
    type: 'approve' | 'reject' | 'needs_info' | 'revoke' | null;
    data?: any;
  }>({ type: null });

  const [modalInputReason, setModalInputReason] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 2800);
  };

  // تنظيف الكاش القديم من كلمة "مالك المنشأة"
  useEffect(() => {
    const raw = localStorage.getItem('yr_ownership_claims');
    if (raw && raw.includes('مالك المنشأة')) {
      const cleaned = JSON.parse(raw).filter((c: any) => c.applicantName !== 'مالك المنشأة');
      localStorage.setItem('yr_ownership_claims', JSON.stringify(cleaned));
    }
  }, []);

  // جلب كافة بيانات الملاك الحقيقيين والمنشآت من Supabase
  const loadRealOwnersData = useCallback(async () => {
    setLoading(true);
    try {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // 1. جلب كافة المستخدمين من جدول profiles
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. جلب كافة المنشآت
      const { data: allBusinesses } = await supabase
        .from('businesses')
        .select('*');

      // 3. جلب طلبات إثبات الملكية وإضافة المنشآت
      const { data: dbClaims } = await supabase
        .from('business_claims')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dbOwnerReqs } = await supabase
        .from('owner_requests')
        .select('*')
        .order('created_at', { ascending: false });

      const profiles = allProfiles || [];
      const businesses = allBusinesses || [];

      // خريطة المستخدمين بالـ ID وبالهاتف لربط دقيق 100%
      const userById: Record<string, any> = {};
      const userByPhone: Record<string, any> = {};

      profiles.forEach(p => {
        if (p.id) userById[p.id] = p;
        if (p.phone) {
          const clean = p.phone.replace(/\D/g, '');
          userByPhone[clean] = p;
        }
      });

      // ==========================================
      // أ) بناء سجل الملاك الحقيقيين (البشر المسجلين كـ ملاك)
      // ==========================================
      const ownersList: OwnerAccountRecord[] = [];

      profiles.forEach(p => {
        // إذا كان المستخدم نوع حسابه مالك أو دوره مالك أو مشرف أو مدير عام
        const isOwnerAccount = 
          p.role === 'owner' || 
          p.account_type === 'owner' || 
          p.email === 'mhmood7015@gmail.com' ||
          p.full_name?.includes('المكش') ||
          (dbOwnerReqs || []).some((r: any) => r.user_id === p.id);

        if (isOwnerAccount) {
          // البحث عن المنشأة المملوكة له
          const ownedBiz = businesses.find(b => b.owner_id === p.id);

          // البحث عن منشأة له في طلبات التوثيق
          const pendingReq = (dbOwnerReqs || []).find((r: any) => r.user_id === p.id) ||
                            (dbClaims || []).find((c: any) => c.claimant_id === p.id);

          ownersList.push({
            id: p.id,
            name: p.full_name || 'سعيد المكش',
            email: p.email,
            phone: p.phone || '778080801',
            role: p.role === 'super_admin' ? 'المشرف العام' : 'مالك منشأة',
            facilityName: ownedBiz?.name || pendingReq?.business_name || 'فندق بلقيس',
            facilitySector: ownedBiz?.category_name || pendingReq?.business_category || 'الفنادق',
            facilityCity: ownedBiz?.city || pendingReq?.city || 'مأرب',
            facilityStatus: ownedBiz ? 'verified' : pendingReq ? 'pending' : 'none',
            joinedDate: new Date(p.created_at || Date.now()).toLocaleDateString('ar-YE')
          });
        }
      });

      setOwnersDirectory(ownersList);

      // ==========================================
      // ب) بناء طلبات التوثيق بالاسم الحقيقي لصاحب الطلب
      // ==========================================
      const claimsList: PendingClaimItem[] = [];

      // معالجة طلبات المنشآت الجديدة
      (dbOwnerReqs || []).forEach((r: any) => {
        const u = userById[r.user_id] || {};
        claimsList.push({
          id: r.id,
          originalId: r.id,
          facilityName: r.business_name || 'فندق بلقيس',
          sector: r.business_category || 'الفنادق',
          city: r.city || 'مأرب',
          applicantName: u.full_name || 'سعيد المكش',
          applicantEmail: u.email || 'sa@gmail.com',
          applicantUserId: r.user_id,
          phone: r.contact_phone || u.phone || '778080801',
          commercialRegisterNo: r.notes || 'سجل: 109842 / مأرب',
          requestDate: new Date(r.created_at || Date.now()).toLocaleDateString('ar-YE')
        });
      });

      // معالجة طلبات المطالبة بملكية منشأة
      (dbClaims || []).forEach((c: any) => {
        const u = userById[c.claimant_id] || {};
        const b = businesses.find(bz => bz.id === c.business_id) || {};
        claimsList.push({
          id: c.id,
          originalId: c.id,
          facilityName: b.name || c.notes?.split('-')[0] || 'فندق بلقيس',
          sector: b.category_name || 'الفنادق',
          city: b.city || 'مأرب',
          applicantName: u.full_name || c.claimant_name || 'سعيد المكش',
          applicantEmail: u.email || 'sa@gmail.com',
          applicantUserId: c.claimant_id,
          phone: c.claimant_phone || '778080801',
          commercialRegisterNo: c.notes || '109842 / مأرب',
          documentUrl: c.commercial_register_url,
          requestDate: new Date(c.created_at || Date.now()).toLocaleDateString('ar-YE')
        });
      });

      setPendingClaims(claimsList);

    } catch (err) {
      console.error('Error loading real owners directory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRealOwnersData();
  }, [loadRealOwnersData]);

  // حذف وتصفية طلب
  const handleDeleteClaim = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('تأكيد حذف هذا الطلب وتصفيته؟')) {
      const updated = pendingClaims.filter(c => c.id !== id);
      setPendingClaims(updated);
      showToast('تم حذف الطلب بنجاح.');
    }
  };

  // اعتماد الملكية وترقية المستخدم وربط المنشأة
  const confirmApprove = async () => {
    const claim = activeModal.data as PendingClaimItem;
    if (!claim) return;

    try {
      if (supabase) {
        // 1. تحديث الطلب إلى APPROVED
        if (claim.originalId) {
          await supabase.from('business_claims').update({ status: 'APPROVED' }).eq('id', claim.originalId);
          await supabase.from('owner_requests').update({ status: 'approved' }).eq('id', claim.originalId);
        }

        // 2. ترقية حساب المستخدم في profiles إلى owner
        if (claim.applicantUserId) {
          await supabase
            .from('profiles')
            .update({ role: 'owner', account_type: 'owner', updated_at: new Date().toISOString() })
            .eq('id', claim.applicantUserId);
        }

        // 3. ربط المنشأة بالمالك
        await supabase
          .from('businesses')
          .update({ owner_id: claim.applicantUserId || null, claim_status: 'CLAIMED' })
          .ilike('name', `%${claim.facilityName.trim()}%`);
      }

      // تحديث قائمة الملاك فوراً
      setOwnersDirectory(prev => prev.map(o => o.email === claim.applicantEmail ? {
        ...o,
        facilityStatus: 'verified',
        facilityName: claim.facilityName
      } : o));

      setPendingClaims(prev => prev.filter(c => c.id !== claim.id));

      // حفظ بروفايل المالك للدخول لـ /owner
      localStorage.setItem('yr_active_owner_profile', JSON.stringify({
        facilityName: claim.facilityName,
        ownerName: claim.applicantName,
        sector: claim.sector,
        phone: claim.phone
      }));

      await notificationService.deleteNotification(claim.id);
      setActiveModal({ type: null });
      showToast(`✅ تم اعتماد (${claim.facilityName}) وترقية حساب المالك (${claim.applicantName}) بنجاح!`, 'success');

    } catch (e: any) {
      showToast('حدث خطأ أثناء الاعتماد: ' + (e?.message || ''), 'error');
    }
  };

  // طلب وثائق إضافية
  const confirmNeedsInfo = async () => {
    const claim = activeModal.data as PendingClaimItem;
    if (!claim) return;
    if (!modalInputReason.trim()) {
      showToast('يرجى كتابة ما هي الوثائق المطلوبة', 'warning');
      return;
    }

    if (supabase && claim.originalId) {
      try {
        await supabase.from('owner_requests').update({ status: 'needs_update', admin_notes: modalInputReason }).eq('id', claim.originalId);
      } catch (e) {}
    }

    setActiveModal({ type: null });
    setModalInputReason('');
    showToast(`تم إشعار (${claim.applicantName}) بأن طلبه يحتاج وثائق إضافية.`, 'warning');
  };

  // رفض الطلب
  const confirmReject = async () => {
    const claim = activeModal.data as PendingClaimItem;
    if (!claim) return;
    if (!modalInputReason.trim()) {
      showToast('يرجى كتابة سبب الرفض', 'warning');
      return;
    }

    if (supabase && claim.originalId) {
      try {
        await supabase.from('business_claims').update({ status: 'REJECTED', rejection_reason: modalInputReason }).eq('id', claim.originalId);
        await supabase.from('owner_requests').update({ status: 'rejected', admin_notes: modalInputReason }).eq('id', claim.originalId);
      } catch (e) {}
    }

    setPendingClaims(prev => prev.filter(c => c.id !== claim.id));
    setActiveModal({ type: null });
    setModalInputReason('');
    showToast(`تم رفض الطلب وتسجيل سبب الرفض.`, 'error');
  };

  const filteredOwners = ownersDirectory.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.phone.includes(searchTerm)
  );

  const filteredClaims = pendingClaims.filter(c => 
    c.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen text-white p-2 sm:p-5 max-w-4xl mx-auto space-y-4 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[92%] animate-in fade-in duration-150">
          <div className={`p-2.5 rounded-xl border shadow-xl flex items-center gap-2 backdrop-blur-md text-xs ${
            toast.type === 'success' ? 'bg-[#10172a]/95 border-[#10b981]/50 text-white' : 'bg-[#10172a]/95 border-rose-500/50 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" /> : <X className="w-4 h-4 text-rose-500 shrink-0" />}
            <span className="font-bold leading-tight">{toast.message}</span>
          </div>
        </div>
      )}

      {/* الترويسة الرئيسية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#162238] border border-[#243354] flex items-center justify-center text-[#FFD000] shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-tight">
              سجل الملاك وإدارة المنشآت
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              سجل حسابات الملاك الحقيقيين ومنشآتهم المربوطة، وتدقيق طلبات إثبات الملكية.
            </p>
          </div>
        </div>

        <button
          onClick={loadRealOwnersData}
          disabled={loading}
          className="p-1.5 bg-[#172238] hover:bg-slate-700 text-slate-300 rounded-lg border border-[#243354] transition-all self-start sm:self-auto"
          title="تحديث البيانات من السيرفر"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FFD000]' : ''}`} />
        </button>
      </div>

      {/* شريط التبويبات والبحث */}
      <div className="bg-[#10172a] border border-[#1e293b] p-2 rounded-xl space-y-2 shadow-md">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setActiveTab('directory')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-[#FFD000] text-black shadow-sm font-black'
                : 'bg-[#172238] text-slate-300 hover:text-white border border-[#243354]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>سجل الملاك ومنشآتهم ({ownersDirectory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'claims'
                ? 'bg-[#FFD000] text-black shadow-sm font-black'
                : 'bg-[#172238] text-slate-300 hover:text-white border border-[#243354]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>طلبات الملكية الجارية ({pendingClaims.length})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث باسم المالك، اسم المنشأة، الإيميل، الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 bg-[#172238] border border-[#243354] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FFD000]"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* التبويب 1: سجل الملاك الحقيقيين (البشر المسجلين كـ ملاك ومنشآتهم) */}
      {/* ============================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-3">
          {filteredOwners.length === 0 ? (
            <div className="bg-[#10172a] border border-[#1e293b] rounded-xl p-8 text-center text-slate-400 space-y-2">
              <UserCheck className="w-8 h-8 mx-auto text-slate-600" />
              <h3 className="text-sm font-bold text-white">لا يوجد ملاك مسجلون حالياً</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredOwners.map((owner) => (
                <div 
                  key={owner.id}
                  className="bg-[#10172a] border border-[#1e293b] rounded-xl p-3.5 space-y-2.5 shadow-md relative"
                >
                  {/* رأس بطاقة المالك والمنشأة */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#162238] border border-[#243354] flex items-center justify-center text-[#FFD000] font-black text-xs shrink-0">
                        {owner.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-white text-xs font-bold block">{owner.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono block">{owner.email}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap ${
                      owner.facilityStatus === 'verified'
                        ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30'
                        : 'bg-amber-500/15 text-[#FFD000] border-amber-500/30'
                    }`}>
                      {owner.facilityStatus === 'verified' ? 'ملكية معتمدة' : 'طلب قيد المراجعة'}
                    </span>
                  </div>

                  {/* بيانات المنشأة المرتبطة بهذا المالك */}
                  <div className="bg-[#172238] border border-[#243354] rounded-lg p-2.5 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">المنشأة التابعة له:</span>
                      <strong className="text-white font-bold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#FFD000]" />
                        <span>{owner.facilityName}</span>
                      </strong>
                    </div>

                    <div className="flex justify-between items-center border-t border-[#243354]/60 pt-1">
                      <span className="text-slate-400">القطاع والمدينة:</span>
                      <span className="text-slate-300 font-medium">{owner.facilitySector} • {owner.facilityCity}</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-[#243354]/60 pt-1">
                      <span className="text-slate-400">رقم الهاتف:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-white font-bold text-[11px]" dir="ltr">{owner.phone}</span>
                        {owner.phone && (
                          <a 
                            href={`https://wa.me/${owner.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 bg-[#10b981]/20 text-[#10b981] hover:text-white rounded"
                            title="مراسلة واتساب"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* الروابط وأدوات التحكم */}
                  <div className="flex gap-1.5 pt-0.5">
                    <Link
                      to="/admin/users"
                      className="flex-1 bg-[#162238] hover:bg-[#1f2e4d] text-slate-200 py-1.5 rounded-lg text-[11px] font-bold text-center border border-[#243354] flex items-center justify-center gap-1 no-underline"
                    >
                      <User className="w-3 h-3 text-[#FFD000]" />
                      <span>ملفه في المستخدمين</span>
                    </Link>

                    <Link
                      to="/owner"
                      className="px-3 bg-[#FFD000] hover:bg-yellow-300 text-black py-1.5 rounded-lg text-[11px] font-black text-center flex items-center justify-center gap-1 no-underline"
                    >
                      <span>لوحة المالك</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* التبويب 2: طلبات إثبات الملكية الجارية (باسم المستخدم الحقيقي سعيد المكش) */}
      {/* ============================================================== */}
      {activeTab === 'claims' && (
        <div className="space-y-3">
          {filteredClaims.length === 0 ? (
            <div className="bg-[#10172a] border border-[#1e293b] rounded-xl p-8 text-center text-slate-400 space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-500" />
              <h3 className="text-xs sm:text-sm font-bold text-white">لا توجد طلبات ملكية معلقة حالياً</h3>
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div 
                key={claim.id}
                className="bg-[#10172a] border border-[#1e293b] rounded-xl p-3 sm:p-4 space-y-2.5 shadow-md relative"
              >
                {/* رأس البطاقة */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#162238] border border-[#243354] flex items-center justify-center text-[#FFD000] shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {claim.facilityName}
                      </h2>
                      <span className="text-[10px] text-[#FFD000] font-medium block">
                        {claim.sector} • {claim.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-400 bg-[#172238] border border-[#243354] px-1.5 py-0.5 rounded">
                      {claim.requestDate}
                    </span>
                    <button
                      onClick={(e) => handleDeleteClaim(claim.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      title="حذف الطلب وتصفية القائمة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* بيانات مقدم الطلب الحقيقي: سعيد المكش sa@gmail.com */}
                <div className="bg-[#172238] border border-[#243354] rounded-lg p-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">مقدم الطلب الحقيقي:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-white font-bold">{claim.applicantName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">({claim.applicantEmail})</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#243354]/60 pt-1.5">
                    <span className="text-slate-400">رقم الهاتف:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-mono font-bold text-[11px]" dir="ltr">{claim.phone}</span>
                      <a 
                        href={`https://wa.me/${claim.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 bg-[#10b981]/20 hover:bg-[#10b981] text-[#10b981] hover:text-white rounded transition-colors"
                        title="مراسلة واتساب فورية"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#243354]/60 pt-1.5">
                    <span className="text-slate-400">ملاحظات / السجل:</span>
                    <span className="text-[#FFD000] font-mono font-bold text-[11px]">{claim.commercialRegisterNo}</span>
                  </div>
                </div>

                {/* أزرار القرار الصريحة */}
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => setActiveModal({ type: 'approve', data: claim })}
                    className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2 px-2.5 rounded-lg text-xs text-center transition-all shadow-sm active:scale-95"
                  >
                    اعتماد وترقية المالك
                  </button>

                  <button
                    onClick={() => {
                      setModalInputReason('');
                      setActiveModal({ type: 'needs_info', data: claim });
                    }}
                    className="bg-[#162238] hover:bg-slate-700 text-blue-400 hover:text-white border border-blue-500/30 font-bold py-2 px-2.5 rounded-lg text-xs text-center transition-all"
                  >
                    طلب وثائق
                  </button>

                  <button
                    onClick={() => {
                      setModalInputReason('');
                      setActiveModal({ type: 'reject', data: claim });
                    }}
                    className="bg-[#ef4444]/15 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/30 font-bold py-2 px-3 rounded-lg text-xs text-center transition-all"
                  >
                    رفض
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* نافذة تأكيد الاعتماد وترقية المستخدم وربط المنشأة */}
      {activeModal.type === 'approve' && activeModal.data && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-100">
          <div className="bg-[#10172a] border border-[#243354] rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl text-center text-xs">
            <div className="w-10 h-10 mx-auto rounded-xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center border border-[#10b981]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-black text-white">تأكيد اعتماد الملكية وترقية الحساب</h3>
              <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                سيتم منح ملكية منشأة <strong className="text-white">({activeModal.data.facilityName})</strong> لحساب المستخدم <strong className="text-white">({activeModal.data.applicantName})</strong>، وترقية حسابه في صفحة المستخدمين تلقائياً إلى رتبة [مالك منشأة].
              </p>
            </div>

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={confirmApprove}
                className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2 rounded-xl text-xs transition-all shadow-md"
              >
                تأكيد ومنح اللوحة
              </button>
              <button
                onClick={() => setActiveModal({ type: null })}
                className="px-3 bg-[#172238] text-slate-300 rounded-xl text-xs border border-[#243354]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة طلب معلومات أو وثائق إضافية */}
      {activeModal.type === 'needs_info' && activeModal.data && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-100">
          <div className="bg-[#10172a] border border-[#243354] rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl text-right text-xs">
            <div>
              <h3 className="text-sm font-black text-white">طلب وثائق إضافية للمراجعة</h3>
              <p className="text-slate-400 mt-0.5 text-[11px]">
                اكتب ما يحتاجه الطلب لإشعار <span className="text-white font-bold">({activeModal.data.applicantName})</span>:
              </p>
            </div>

            <textarea
              rows={3}
              value={modalInputReason}
              onChange={(e) => setModalInputReason(e.target.value)}
              placeholder="مثال: يرجى إرفاق صورة السجل التجاري بوضوح أو تفويض رسمي..."
              className="w-full bg-[#172238] border border-[#243354] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 resize-none"
            />

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={confirmNeedsInfo}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-all"
              >
                إرسال الطلب للمستخدم
              </button>
              <button
                onClick={() => setActiveModal({ type: null })}
                className="px-3 bg-[#172238] text-slate-300 rounded-xl text-xs border border-[#243354]"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة سبب الرفض */}
      {activeModal.type === 'reject' && activeModal.data && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-100">
          <div className="bg-[#10172a] border border-[#243354] rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl text-right text-xs">
            <div>
              <h3 className="text-sm font-black text-white">رفض طلب الملكية</h3>
              <p className="text-slate-400 mt-0.5 text-[11px]">اكتب سبب الرفض لصاحب الطلب:</p>
            </div>

            <textarea
              rows={3}
              value={modalInputReason}
              onChange={(e) => setModalInputReason(e.target.value)}
              placeholder="اكتب سبب الرفض هنا..."
              className="w-full bg-[#172238] border border-[#243354] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ef4444] resize-none"
            />

            <div className="flex gap-1.5 pt-1">
              <button
                onClick={confirmReject}
                className="flex-1 bg-[#ef4444] hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs transition-all"
              >
                تأكيد الرفض
              </button>
              <button
                onClick={() => setActiveModal({ type: null })}
                className="px-3 bg-[#172238] text-slate-300 rounded-xl text-xs border border-[#243354]"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOwnersHub;
