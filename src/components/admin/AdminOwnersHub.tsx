import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

interface OwnershipClaim {
  id: string;
  facilityName: string;
  sector: string;
  applicantName: string;
  phone: string;
  commercialRegisterNo: string;
  documentUrl?: string;
  requestDate: string;
}

interface VerifiedOwner {
  id: string;
  facilityName: string;
  sector: string;
  ownerName: string;
  phone: string;
  approvedDate: string;
}

const STORAGE_CLAIMS_KEY = 'yr_ownership_claims';
const STORAGE_OWNERS_KEY = 'yr_verified_owners';

export const AdminOwnersHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // حالة النوافذ والتنبيهات المخصصة
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [activeModal, setActiveModal] = useState<{
    type: 'approve' | 'reject' | 'revoke' | null;
    data?: any;
  }>({ type: null });

  const [rejectReason, setRejectReason] = useState('');

  // عرض الإشعار التلقائي
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 2800);
  };

  const [claims, setClaims] = useState<OwnershipClaim[]>(() => {
    const saved = localStorage.getItem(STORAGE_CLAIMS_KEY);
    return saved ? JSON.parse(saved) : [
      {
        id: 'claim_1',
        facilityName: 'فندق بلقيس الدولي',
        sector: 'الفنادق',
        applicantName: 'محمد عبدالله السنيدار',
        phone: '+967770000111',
        commercialRegisterNo: '109842 / صنعاء',
        documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        requestDate: 'اليوم 10:30 ص'
      },
      {
        id: 'claim_2',
        facilityName: 'مستشفى الأمل التخصصي',
        sector: 'المستشفيات',
        applicantName: 'د. خالد عبدالملك',
        phone: '+967771222333',
        commercialRegisterNo: '55412 / عدن',
        documentUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
        requestDate: 'أمس 04:15 م'
      }
    ];
  });

  const [verifiedOwners, setVerifiedOwners] = useState<VerifiedOwner[]>(() => {
    const saved = localStorage.getItem(STORAGE_OWNERS_KEY);
    return saved ? JSON.parse(saved) : [
      {
        id: 'owner_1',
        facilityName: 'مطعم الشيباني الحديث',
        sector: 'المطاعم والأغذية',
        ownerName: 'علي بن أحمد الشيباني',
        phone: '+967773444555',
        approvedDate: '2025-01-10'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_CLAIMS_KEY, JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem(STORAGE_OWNERS_KEY, JSON.stringify(verifiedOwners));
  }, [verifiedOwners]);

  // تنفيذ الموافقة بعد تأكيد النافذة
  const confirmApprove = () => {
    const claim = activeModal.data as OwnershipClaim;
    if (!claim) return;

    const newOwner: VerifiedOwner = {
      id: `owner_${Date.now()}`,
      facilityName: claim.facilityName,
      sector: claim.sector,
      ownerName: claim.applicantName,
      phone: claim.phone,
      approvedDate: new Date().toLocaleDateString('ar-YE')
    };

    setVerifiedOwners([newOwner, ...verifiedOwners]);
    setClaims(claims.filter(c => c.id !== claim.id));

    localStorage.setItem('yr_active_owner_profile', JSON.stringify({
      facilityName: claim.facilityName,
      ownerName: claim.applicantName,
      sector: claim.sector,
      phone: claim.phone
    }));

    setActiveModal({ type: null });
    showToast(`تم اعتماد (${claim.facilityName}) ومنح الصلاحية بنجاح!`, 'success');
  };

  // تنفيذ الرفض بعد كتابة السبب
  const confirmReject = () => {
    const claim = activeModal.data as OwnershipClaim;
    if (!claim) return;

    if (!rejectReason.trim()) {
      showToast('يرجى كتابة سبب الرفض', 'warning');
      return;
    }

    setClaims(claims.filter(c => c.id !== claim.id));
    setActiveModal({ type: null });
    setRejectReason('');
    showToast(`تم رفض الطلب وإرسال السبب لمقدم الطلب.`, 'error');
  };

  // تنفيذ سحب الصلاحية بعد التأكيد
  const confirmRevoke = () => {
    const owner = activeModal.data as VerifiedOwner;
    if (!owner) return;

    setVerifiedOwners(verifiedOwners.filter(o => o.id !== owner.id));
    setActiveModal({ type: null });
    showToast(`تم سحب ملكية (${owner.facilityName}) بنجاح.`, 'warning');
  };

  const filteredClaims = claims.filter(c => 
    c.facilityName?.includes(searchTerm) || 
    c.applicantName?.includes(searchTerm) ||
    c.phone?.includes(searchTerm)
  );

  const filteredOwners = verifiedOwners.filter(o => 
    o.facilityName?.includes(searchTerm) || 
    o.ownerName?.includes(searchTerm) || 
    o.phone?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen text-white p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 relative" dir="rtl">
      
      {/* 1. إشعار النجاح / الخطأ المنسدل بالأعلى (Custom Toast) */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`p-3.5 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-[#10172a]/95 border-[#10b981]/50 text-white shadow-emerald-950/40' 
              : toast.type === 'error'
              ? 'bg-[#10172a]/95 border-[#ef4444]/50 text-white shadow-red-950/40'
              : 'bg-[#10172a]/95 border-[#f59e0b]/50 text-white shadow-amber-950/40'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />}
            {toast.type === 'error' && <X className="w-5 h-5 text-[#ef4444] shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#f59e0b] shrink-0" />}
            <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}

      {/* 2. العنوان المصغر والأنيق */}
      <div className="flex items-center gap-3 pb-1 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-[#172238] border border-[#243354] flex items-center justify-center text-[#f59e0b] shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-black text-white leading-tight">
            إدارة الملاك وطلبات التوثيق
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            مراجعة وثائق إثبات الملكية واعتماد الصلاحيات الرسمية للمنشآت.
          </p>
        </div>
      </div>

      {/* 3. بطاقات الإحصائيات المصغرة */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#10172a] border border-[#1e293b] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-[#ef4444]">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-slate-300 font-medium">طلبات الانتظار</span>
          </div>
          <span className="text-lg font-black text-[#ef4444] font-mono leading-none">
            {claims.length}
          </span>
        </div>

        <div className="bg-[#10172a] border border-[#1e293b] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-slate-300 font-medium">الملاك المعتمدون</span>
          </div>
          <span className="text-lg font-black text-[#10b981] font-mono leading-none">
            {verifiedOwners.length}
          </span>
        </div>
      </div>

      {/* 4. شريط التبويبات والبحث */}
      <div className="bg-[#10172a] border border-[#1e293b] p-3 rounded-xl space-y-2.5 shadow-lg">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
              activeTab === 'pending'
                ? 'bg-[#f59e0b] text-[#0a0f1d] shadow-sm'
                : 'bg-[#172238] text-slate-300 hover:text-white border border-[#243354]'
            }`}
          >
            طلبات الملكية المعلقة ({claims.length})
          </button>

          <button
            onClick={() => setActiveTab('verified')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
              activeTab === 'verified'
                ? 'bg-[#f59e0b] text-[#0a0f1d] shadow-sm'
                : 'bg-[#172238] text-slate-300 hover:text-white border border-[#243354]'
            }`}
          >
            الملاك المعتمدون ({verifiedOwners.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute right-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم، المنشأة، الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-[#172238] border border-[#243354] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#f59e0b]"
          />
        </div>
      </div>

      {/* 5. بطاقات طلبات إثبات الملكية */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {filteredClaims.length === 0 ? (
            <div className="bg-[#10172a] border border-[#1e293b] rounded-xl p-8 text-center space-y-2">
              <Inbox className="w-10 h-10 mx-auto text-slate-500" />
              <h3 className="text-sm font-bold text-white">لا توجد طلبات إثبات ملكية معلقة</h3>
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div 
                key={claim.id}
                className="bg-[#10172a] border border-[#1e293b] rounded-xl p-3.5 sm:p-4 space-y-3 shadow-md"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#172238] border border-[#243354] flex items-center justify-center text-[#f59e0b] shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                        {claim.facilityName}
                      </h2>
                      <span className="text-[11px] text-[#f59e0b] font-medium block">
                        {claim.sector}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-[#172238] border border-[#243354] px-2 py-0.5 rounded">
                    {claim.requestDate}
                  </span>
                </div>

                <div className="bg-[#172238] border border-[#243354] rounded-lg p-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">مقدم الطلب:</span>
                    <strong className="text-white font-bold">{claim.applicantName}</strong>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#243354]/60 pt-1.5">
                    <span className="text-slate-400">رقم الهاتف:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono font-bold" dir="ltr">{claim.phone}</span>
                      <a 
                        href={`https://wa.me/${claim.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 bg-[#10b981]/20 hover:bg-[#10b981] text-[#10b981] hover:text-white rounded transition-colors"
                        title="واتساب مباشر"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#243354]/60 pt-1.5">
                    <span className="text-slate-400">رقم السجل التجاري:</span>
                    <span className="text-[#f59e0b] font-mono font-bold">{claim.commercialRegisterNo}</span>
                  </div>
                </div>

                {claim.documentUrl && (
                  <a
                    href={claim.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 bg-[#172238] hover:bg-[#1c2a47] border border-[#243354] rounded-lg text-xs text-slate-200 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <FileText className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>معاينة وثيقة إثبات الملكية / السجل</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}

                {/* أزرار الإجراءات بدون أيقونات */}
                <div className="flex gap-2 pt-0.5">
                  <button
                    onClick={() => setActiveModal({ type: 'approve', data: claim })}
                    className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2.5 px-3 rounded-lg text-xs text-center transition-all shadow-sm active:scale-[0.98]"
                  >
                    اعتماد ومنح لوحة المالك
                  </button>

                  <button
                    onClick={() => {
                      setRejectReason('');
                      setActiveModal({ type: 'reject', data: claim });
                    }}
                    className="bg-[#ef4444]/15 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/30 font-bold py-2.5 px-5 rounded-lg text-xs text-center transition-all active:scale-[0.98]"
                  >
                    رفض
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* 6. قسم الملاك المعتمدين */}
      {activeTab === 'verified' && (
        <div className="space-y-3">
          {filteredOwners.length === 0 ? (
            <div className="bg-[#10172a] border border-[#1e293b] rounded-xl p-8 text-center text-slate-400">
              <p className="text-xs font-bold text-white">لا يوجد ملاك معتمدون حالياً</p>
            </div>
          ) : (
            filteredOwners.map((owner) => (
              <div 
                key={owner.id}
                className="bg-[#10172a] border border-[#1e293b] rounded-xl p-3.5 space-y-2.5 shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                      {owner.facilityName}
                    </h2>
                    <span className="text-[11px] text-[#f59e0b] font-medium block">{owner.sector}</span>
                  </div>
                  <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-bold px-2 py-0.5 rounded">
                    مالك معتمد
                  </span>
                </div>

                <div className="bg-[#172238] border border-[#243354] rounded-lg p-2.5 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">المالك:</span>
                    <strong className="text-white font-bold">{owner.ownerName}</strong>
                  </div>
                  <div className="flex justify-between border-t border-[#243354]/60 pt-1.5">
                    <span className="text-slate-400">الهاتف:</span>
                    <span className="font-mono text-white font-bold" dir="ltr">{owner.phone}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#243354]/60 pt-1.5">
                    <span className="text-slate-400">تاريخ التوثيق:</span>
                    <span className="font-mono text-slate-400">{owner.approvedDate}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-0.5">
                  <a
                    href={`https://wa.me/${owner.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-[#172238] hover:bg-[#1f2e4d] text-white py-2 rounded-lg text-xs font-bold text-center transition-colors border border-[#243354]"
                  >
                    مراسلة واتساب
                  </a>

                  <button
                    onClick={() => setActiveModal({ type: 'revoke', data: owner })}
                    className="px-3 bg-[#ef4444]/15 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444]/30 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    سحب الصلاحية
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* نوافذ التأكيد المخصصة الفخمة (بنفس الستايل الكحلي) */}
      {/* ======================================================== */}

      {/* نافذة تأكيد الاعتماد */}
      {activeModal.type === 'approve' && activeModal.data && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#10172a] border border-[#243354] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center border border-[#10b981]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">تأكيد اعتماد الملكية</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                هل أنت متأكد من منح صلاحية إدارة <strong className="text-white">({activeModal.data.facilityName})</strong> لـ <strong className="text-white">({activeModal.data.applicantName})</strong>؟
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmApprove}
                className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                تأكيد ومنح اللوحة
              </button>
              <button
                onClick={() => setActiveModal({ type: null })}
                className="px-4 bg-[#172238] hover:bg-[#1e2c48] text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all border border-[#243354]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة سبب الرفض المخصصة */}
      {activeModal.type === 'reject' && activeModal.data && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#10172a] border border-[#243354] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-right">
            <div>
              <h3 className="text-base font-black text-white">رفض طلب الملكية</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                يرجى كتابة سبب الرفض لإبلاغ <span className="text-white font-bold">({activeModal.data.applicantName})</span>:
              </p>
            </div>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="مثال: صورة السجل التجاري غير واضحة، أو المنشأة مسجلة باسم شخص آخر..."
              className="w-full bg-[#172238] border border-[#243354] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ef4444] resize-none"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={confirmReject}
                className="flex-1 bg-[#ef4444] hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-red-500/20"
              >
                تأكيد الرفض
              </button>
              <button
                onClick={() => setActiveModal({ type: null })}
                className="px-4 bg-[#172238] hover:bg-[#1e2c48] text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all border border-[#243354]"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد سحب الصلاحية */}
      {activeModal.type === 'revoke' && activeModal.data && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#10172a] border border-[#243354] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#ef4444]/15 text-[#ef4444] flex items-center justify-center border border-[#ef4444]/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">تحذير سحب الصلاحية</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                هل أنت متأكد من سحب ملكية <strong className="text-white">({activeModal.data.facilityName})</strong> من <strong className="text-white">({activeModal.data.ownerName})</strong>؟
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={confirmRevoke}
                className="flex-1 bg-[#ef4444] hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-red-500/20"
              >
                نعم، اسحب الصلاحية
              </button>
              <button
                onClick={() => setActiveModal({ type: null })}
                className="px-4 bg-[#172238] hover:bg-[#1e2c48] text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all border border-[#243354]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOwnersHub;
