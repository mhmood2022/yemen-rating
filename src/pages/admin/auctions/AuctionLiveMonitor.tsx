import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Gavel, Clock, ArrowRight, ShieldCheck, 
  TrendingUp, AlertTriangle, RefreshCw, X, MessageSquare
} from 'lucide-react';
import { adminAuctionsService } from '../../../services/adminService';

export const AuctionLiveMonitor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<any | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('active');
  const [statusReason, setStatusReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [aucRes, bidsRes] = await Promise.all([
        adminAuctionsService.getAuctionById(id),
        adminAuctionsService.getAuctionBids(id)
      ]);

      setAuction(aucRes.data || null);
      setBids(bidsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (id) {
      const sub = adminAuctionsService.subscribeToBids(id, (newBid) => {
        setBids((prev) => [newBid, ...prev]);
        setAuction((prev: any) => prev ? { ...prev, current_bid: newBid.bid_amount } : prev);
      });
      return () => {
        sub.unsubscribe();
      };
    }
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const res = await adminAuctionsService.updateAuctionStatus(id, targetStatus, statusReason);
      if (res.success) {
        showToast('تم تحديث حالة المزاد بنجاح وتوثيقها في سجل التدقيق');
        setStatusModalOpen(false);
        loadData();
      } else {
        showToast(res.error || 'فشل تحديث الحالة');
      }
    } catch (err: any) {
      showToast(err.message);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex items-center justify-center font-['Cairo'] text-white">
        <div className="w-10 h-10 rounded-full border-2 border-[#F5C400] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!auction) {
    return (
      <div dir="rtl" className="max-w-md mx-auto my-12 p-6 text-center bg-[#0A0F1D] border border-slate-800 rounded-2xl text-white font-['Cairo']">
        <AlertTriangle size={36} className="text-[#F5C400] mx-auto mb-2" />
        <h2 className="text-base font-bold">المزاد غير موجود في قاعدة البيانات</h2>
        <button onClick={() => navigate('/admin/auctions')} className="mt-3 px-4 py-2 bg-[#F5C400] text-black font-black text-xs rounded-xl cursor-pointer">
          العودة لإدارة المزادات
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-['Cairo'] text-white">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#F5C400] text-black px-6 py-2.5 rounded-xl font-black text-xs shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* شريط الإجراءات والرجوع */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0A0F1D] border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/auctions')}
            className="p-2 bg-[#060A13] border border-slate-800 rounded-xl text-[#F5C400] hover:text-white cursor-pointer"
          >
            <ArrowRight size={16} />
          </button>
          <div>
            <span className="text-xs text-slate-400 font-mono">رقم المزاد: #{auction.id?.slice(0, 8)}</span>
            <h1 className="text-lg font-black text-white">{auction.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetStatus(auction.status);
              setStatusModalOpen(true);
            }}
            className="px-4 py-2 bg-[#F5C400] text-black font-black text-xs rounded-xl hover:bg-[#DDAF00] cursor-pointer"
          >
            تغيير الحالة الإدارية
          </button>
          <button onClick={loadData} className="p-2 bg-[#060A13] border border-slate-800 rounded-xl text-slate-300">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* المؤشرات اللحظية الحقيقية للمزاد المختار */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0A0F1D] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block font-bold">السعر الحالي الحقيقي</span>
          <span className="text-xl font-black text-[#F5C400] font-mono mt-1 block">
            {Number(auction.current_bid || auction.starting_price || 0).toLocaleString()} {auction.currency || 'SAR'}
          </span>
        </div>

        <div className="bg-[#0A0F1D] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block font-bold">عدد المزايدات المسجلة</span>
          <span className="text-xl font-black text-white font-mono mt-1 block">{bids.length}</span>
        </div>

        <div className="bg-[#0A0F1D] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block font-bold">حالة المزاد</span>
          <span className="text-sm font-bold text-emerald-400 mt-1 block">{auction.status}</span>
        </div>

        <div className="bg-[#0A0F1D] border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block font-bold">تأمين المشاركة</span>
          <span className="text-sm font-bold text-slate-300 mt-1 block">
            {auction.deposit_required ? `${Number(auction.deposit_amount).toLocaleString()} ${auction.currency}` : 'غير مشروط'}
          </span>
        </div>
      </div>

      {/* سجل المزايدات اللحظي الحقيقي */}
      <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-black text-white">سجل المزايدات اللحظي (Realtime Live Bids Log)</h2>
        {bids.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-bold">لا توجد مزايدات مسجلة حتى الآن لهذا المعروض</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 font-bold bg-[#060A13]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">المزايد</th>
                  <th className="p-3">مبلغ السومة</th>
                  <th className="p-3">التوقيت الفعلي</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {bids.map((b, idx) => (
                  <tr key={b.id || idx} className="hover:bg-[#060A13]/50">
                    <td className="p-3">{b.bid_order || bids.length - idx}</td>
                    <td className="p-3 font-bold text-white font-sans">{b.bidder_code || 'مزايد'}</td>
                    <td className="p-3 font-black text-[#F5C400]">{Number(b.bid_amount).toLocaleString()} {auction.currency}</td>
                    <td className="p-3 text-slate-400">{new Date(b.created_at).toLocaleTimeString('ar-YE')}</td>
                    <td className="p-3 text-emerald-400">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* مودال تغيير الحالة الإدارية */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black">تغيير حالة المزاد وتوثيق السبب</h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300 font-bold">الحالة الجديدة *</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="active">active (نشط)</option>
                  <option value="ended">ended (منتهي)</option>
                  <option value="pending_seller_approval">pending_seller_approval (بانتظار اعتماد البائع)</option>
                  <option value="sold">sold (مباع)</option>
                  <option value="unsold">unsold (غير مباع)</option>
                  <option value="cancelled">cancelled (ملغي)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-300 font-bold">سبب الإجراء الإداري *</label>
                <textarea
                  required
                  rows={2}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="اكتب سبب تغيير الحالة لتوثيقه في Audit Log..."
                  className="w-full bg-[#060A13] border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setStatusModalOpen(false)} className="px-4 py-2 bg-[#060A13] rounded-xl text-slate-300">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-[#F5C400] text-black font-black rounded-xl">تأكيد التغيير</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
