import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Gavel, Clock, ArrowRight, Bell, ShieldCheck, User, 
  TrendingUp, AlertTriangle, CheckCircle2, MessageSquare, 
  X, RefreshCw, Send, DollarSign, Eye, Lock
} from 'lucide-react';
import { adminAuctionsService, adminAuditService } from '../../../services/adminService';

export const AuctionLiveMonitor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [newBidAlert, setNewBidAlert] = useState<any | null>(null);
  const [adminActionModal, setAdminActionModal] = useState<'status_change' | 'dispute_resolve' | null>(null);
  const [newStatus, setNewStatus] = useState('active');
  const [actionReason, setActionReason] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  // تحميل بيانات المزاد والمزايدات
  useEffect(() => {
    if (!id) return;

    // محاولة جلب من قاعدة البيانات أولاً
    adminAuctionsService.getAuctionById(id).then(res => {
      if (res.success && res.data) {
        setAuction(res.data);
      } else {
        // بيانات تجريبية مطابقة في حال عدم الاتصال
        setAuction({
          id: id || 'AUC-201',
          title: 'تويوتا لاندكروزر V8 موديل 2022 وكالة بريمي',
          itemType: 'سيارة',
          saleType: 'auction',
          currency: 'YER',
          sellerName: 'معرض النخبة للسيارات',
          sellerPhone: '777123456',
          city: 'صنعاء',
          startingPrice: 32000000,
          minIncrement: 500000,
          currentBid: 34500000,
          bidsCount: 18,
          status: 'active',
          timeLeftSeconds: 14800,
          commissionAmount: 1725000,
          commissionStatus: 'not_due',
          disputeStatus: 'no_dispute',
          startTime: '2026-08-30 10:00',
          endTime: '2026-09-02 18:00'
        });
      }
    });

    adminAuctionsService.getAuctionBids(id).then(res => {
      if (res.success && res.data.length > 0) {
        setBids(res.data);
      } else {
        setBids([
          { id: 'b-1', bidder_code: 'مزايد #9700', bid_amount: 34500000, bid_order: 18, created_at: '2026-09-01 07:58:10', ip_address: '185.220.101.4' },
          { id: 'b-2', bidder_code: 'مزايد #8392', bid_amount: 34000000, bid_order: 17, created_at: '2026-09-01 07:45:22', ip_address: '185.220.101.12' },
          { id: 'b-3', bidder_code: 'مزايد #4110', bid_amount: 33500000, bid_order: 16, created_at: '2026-09-01 06:30:15', ip_address: '82.114.160.8' },
        ]);
      }
    });

    // الاشتراك اللحظي في المزايدات
    const unsubscribe = adminAuctionsService.subscribeToBids(id, (newBid) => {
      setBids(prev => [newBid, ...prev]);
      setAuction((prev: any) => prev ? { ...prev, currentBid: newBid.bid_amount, bidsCount: (prev.bidsCount || 0) + 1 } : prev);
      setNewBidAlert({
        bidder: newBid.bidder_code,
        amount: newBid.bid_amount,
        time: new Date().toLocaleTimeString('ar-YE')
      });
      setTimeout(() => setNewBidAlert(null), 6000);
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  const handleExecuteStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction || !actionReason.trim()) return;

    await adminAuctionsService.updateAuctionStatus(auction.id, newStatus, actionReason, 'المشرف العام');
    setAuction({ ...auction, status: newStatus });
    setAdminActionModal(null);
    setActionReason('');
  };

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const msg = {
      id: `msg-${Date.now()}`,
      senderRole: 'admin',
      senderName: 'إدارة يمن ريتغ',
      text: chatMessage,
      time: 'الآن'
    };
    setMessages(prev => [...prev, msg]);
    setChatMessage('');
  };

  if (!auction) {
    return <div className="p-8 text-center text-white font-['Cairo']">جارٍ تحميل بيانات المراقبة الحية...</div>;
  }

  return (
    <div dir="rtl" className="space-y-5 font-['Cairo',sans-serif] text-white">
      
      {/* تنبيه المزايدة اللحظية الفورية (Live Toast) */}
      {newBidAlert && (
        <div className="p-3.5 bg-[#FFC500] text-black rounded-2xl shadow-2xl flex items-center justify-between font-bold animate-bounce border-2 border-black">
          <div className="flex items-center gap-2">
            <Bell size={20} className="animate-ping" />
            <span>🔔 مزايدة جديدة واردة الآن! المزاد: {auction.id} • المزايد: {newBidAlert.bidder} • المبلغ: {newBidAlert.amount.toLocaleString()} {auction.currency}</span>
          </div>
          <span className="text-xs font-mono">{newBidAlert.time}</span>
        </div>
      )}

      {/* رأس صفحة المراقبة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B0F17] p-4 rounded-2xl border border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-lg shadow-[#FFC500]/20">
            <Gavel size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white leading-none">
                مراقبة المزاد الحي — {auction.title}
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> مراقبة حية نشطة
              </span>
            </div>
            <span className="text-xs text-[#9CA3AF] mt-1 block font-mono">
              معرف المزاد: {auction.id} • البائع: {auction.sellerName} ({auction.sellerPhone}) • المدينة: {auction.city}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminActionModal('status_change')}
            className="px-3.5 py-2 rounded-xl bg-[#DC2626]/20 border border-[#DC2626]/40 text-[#DC2626] hover:bg-[#DC2626] hover:text-white text-xs font-black transition-all cursor-pointer"
          >
            تغيير حالة المزاد / إيقاف
          </button>

          <button
            onClick={() => navigate('/admin/auctions')}
            className="px-3.5 py-2 rounded-xl bg-[#161D2B] border border-[#1F2937] text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>رجوع للمزادات</span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* بطاقات المؤشرات اللحظية الأربعة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937] space-y-1">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">أعلى مزايدة حالية:</span>
          <div className="text-xl sm:text-2xl font-black text-[#FFC500]">
            {auction.currentBid?.toLocaleString()} <span className="text-xs">{auction.currency}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-['Cairo']">الابتدائي: {auction.startingPrice?.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937] space-y-1">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">عمولة يمن ريتغ (5% سرية):</span>
          <div className="text-xl sm:text-2xl font-black text-[#16A34A]">
            {((auction.currentBid || 0) * 0.05).toLocaleString()} <span className="text-xs">{auction.currency}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-['Cairo']">صافي البائع: {((auction.currentBid || 0) * 0.95).toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937] space-y-1">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">إجمالي المزايدات المسجلة:</span>
          <div className="text-xl sm:text-2xl font-black text-white">
            {auction.bidsCount || bids.length} <span className="text-xs font-['Cairo']">مزايدة</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-['Cairo']">الحد الأدنى: +{auction.minIncrement?.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#1F2937] space-y-1">
          <span className="text-[11px] text-[#9CA3AF] font-['Cairo'] block">حالة المزاد والصفقة:</span>
          <div className="text-sm font-black text-white font-['Cairo'] mt-1">
            <span className="px-2.5 py-1 rounded-lg bg-[#FFC500]/15 text-[#FFC500] border border-[#FFC500]/30 inline-block">
              {auction.status === 'active' ? 'مزاد نشط جارٍ' : auction.status}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-['Cairo'] block">النزاع: {auction.disputeStatus === 'no_dispute' ? 'لا يوجد' : 'نزاع مفتوح'}</span>
        </div>
      </div>

      {/* منطقة العرض المزدوجة: سجل المزايدات الحي + المحادثة والإقرارات */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* سجل المزايدات الحي المباشر (7 أعمدة) */}
        <div className="lg:col-span-7 bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[#FFC500]" />
              سجل المزايدات الحي اللحظي (Live Bids Log)
            </h3>
            <span className="text-[10px] text-[#9CA3AF] font-mono">يتم التحديث اللحظي تلقائياً</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
                <tr>
                  <th className="py-2.5 px-3">الترتيب</th>
                  <th className="py-2.5 px-3">رمز المزايد</th>
                  <th className="py-2.5 px-3">مبلغ المزايدة</th>
                  <th className="py-2.5 px-3">التوقيت والتاريخ</th>
                  <th className="py-2.5 px-3">عنوان IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] font-mono">
                {bids.map((b, idx) => (
                  <tr key={b.id || idx} className={`hover:bg-[#161D2B]/50 ${idx === 0 ? 'bg-[#FFC500]/10 font-bold' : ''}`}>
                    <td className="py-2.5 px-3">
                      <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                        idx === 0 ? 'bg-[#FFC500] text-black font-black' : 'bg-[#18181C] text-gray-400'
                      }`}>
                        {b.bid_order || bids.length - idx}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-['Cairo'] text-white">
                      {b.bidder_code} {idx === 0 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 mr-1">المتصدر</span>}
                    </td>
                    <td className="py-2.5 px-3 text-[#FFC500] font-black text-sm">
                      {b.bid_amount?.toLocaleString()} {auction.currency}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 text-[11px]">{b.created_at}</td>
                    <td className="py-2.5 px-3 text-gray-500 text-[10px]">{b.ip_address || '185.220.101.5'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* المراقبة الإدارية والتدخل في المحادثة والخط الزمني (5 أعمدة) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* محادثة الصفقة مع إمكانية إرسال توجيه إداري */}
          <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-[#1F2937] pb-2">
              <MessageSquare size={16} className="text-[#3B82F6]" /> محادثة الصفقة المباشرة
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto p-2.5 bg-[#070A10] rounded-xl border border-[#1F2937] text-xs">
              <div className="p-2 rounded-lg bg-[#161D2B] space-y-0.5">
                <span className="text-[10px] text-gray-400 font-bold block">وساطة يمن ريتغ (النظام)</span>
                <p className="text-gray-200">تم إنشاء هذه المحادثة الخاصة لتوثيق اتفاق الاستلام والتسليم بين البائع والمشتري.</p>
              </div>

              {messages.map(m => (
                <div key={m.id} className="p-2 rounded-lg bg-[#FFC500]/15 border border-[#FFC500]/30 space-y-0.5">
                  <div className="flex justify-between text-[10px] text-[#FFC500] font-bold">
                    <span>{m.senderName} ({m.senderRole})</span>
                    <span className="font-mono">{m.time}</span>
                  </div>
                  <p className="text-white">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendAdminMessage} className="flex gap-1.5">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="إرسال توجيه إداري رسمي في المحادثة..."
                className="flex-1 bg-[#161D2B] border border-[#1F2937] rounded-xl p-2 text-xs text-white outline-none focus:border-[#FFC500]"
              />
              <button type="submit" className="p-2 bg-[#FFC500] text-black rounded-xl font-bold cursor-pointer">
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* الخط الزمني وسجل العمليات */}
          <div className="bg-[#0B0F17] rounded-2xl border border-[#1F2937] p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 border-b border-[#1F2937] pb-1.5">
              <Clock size={14} className="text-[#FFC500]" /> الخط الزمني لتسلسل أحداث المزاد
            </h3>
            <div className="space-y-1 text-xs text-gray-300 font-mono">
              <div className="p-1.5 bg-[#161D2B] rounded-lg">✓ تم إنشاء العرض ونشره بعد إقرار البائع</div>
              <div className="p-1.5 bg-[#161D2B] rounded-lg">✓ بدء المزاد وتسجيل {bids.length} مزايدة موثقة</div>
              <div className="p-1.5 bg-[#161D2B] rounded-lg text-[#FFC500]">⏳ المزاد نشط تحت المراقبة اللحظية</div>
            </div>
          </div>

        </div>
      </div>

      {/* نافذة تغيير حالة المزاد الإدارية مع توثيق السبب */}
      {adminActionModal === 'status_change' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F2937] rounded-2xl w-full max-w-md p-5 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1F2937] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-[#DC2626]" /> تغيير حالة المزاد وتوثيق السبب
              </h3>
              <button onClick={() => setAdminActionModal(null)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleExecuteStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">اختر الحالة الجديدة:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none font-bold"
                >
                  <option value="active">نشط ومتاح للمزايدة (Active)</option>
                  <option value="ended_with_winner">إنهاء المزاد وتحديد الفائز الحالي</option>
                  <option value="cancelled">إلغاء المزاد بالكامل (Cancelled)</option>
                  <option value="disputed">تجميد المزاد وفتح نزاع إداري</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">سبب الإجراء الإداري (يُسجل في الـ Audit Log):</label>
                <textarea
                  rows={3}
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="اكتب سبب تغيير الحالة للتسجيل الأمني..."
                  className="w-full bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2937]">
                <button type="button" onClick={() => setAdminActionModal(null)} className="px-4 py-2 rounded-xl bg-[#161D2B] text-gray-300">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#DC2626] text-white font-bold shadow-md">تأكيد الإجراء وتوثيقه</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
