import React, { useState, useEffect } from 'react';
import { X, Gavel, ShieldCheck, Phone, MessageCircle, Clock, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getMyBusinessPage } from '../../services/businessPageService';
import { toWaLink, formatXTimeAgo } from '../common/XMarketUI';

interface Props { auction: any | null; onClose: () => void; onSuccess: (msg: string) => void; }

export const XAuctionBidModal: React.FC<Props> = ({ auction, onClose, onSuccess }) => {
  const [bids, setBids] = useState<any[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [bidderPhone, setBidderPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [liveTop, setLiveTop] = useState(0);
  const [timer, setTimer] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  const fmtAmt = (v: string) => {
    const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
    return d ? d.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };

  useEffect(() => {
    if (!auction) return;
    setMsg('');
    const base = Number(auction.current_bid || auction.starting_price || 0);
    const inc = Number(auction.min_increment || 1000);
    setBidAmount(fmtAmt(String(base + inc)));
    supabase.from('auction_bids').select('*').eq('auction_id', auction.id).order('amount', { ascending: false }).limit(5)
      .then(({ data }) => {
        if (data) {
          setBids(data);
          const top = data.length > 0 ? Math.max(base, Number(data[0].amount)) : base;
          setBidAmount(fmtAmt(String(top + inc)));
        }
      });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const uid = session?.user?.id;
      if (!uid) return;
      const [{ data: prof }, biz] = await Promise.all([supabase.from('profiles').select('full_name, phone').eq('id', uid).maybeSingle(), getMyBusinessPage(uid)]);
      const name = biz?.name || prof?.full_name || '';
      const ph = (biz?.phone || prof?.phone || '').replace(/\D/g, '').slice(-9);
      if (name) setBidderName((prev) => prev || name);
      if (ph) setBidderPhone((prev) => prev || ph);
    }).catch(() => {});
  }, [auction?.id]);

  useEffect(() => {
    if (!auction) return;
    setLiveTop(Number(auction.current_bid || auction.starting_price || 0));
    const calc = () => {
      const target = auction.end_date ? new Date(auction.end_date).getTime() : (new Date(auction.created_at || Date.now()).getTime() + 3 * 86400000);
      const diff = target - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
      return { days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60), isEnded: false };
    };
    setTimer(calc());
    const t = setInterval(() => setTimer(calc()), 1000);
    const ch = supabase.channel(`x_auc_${auction.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auction_bids', filter: `auction_id=eq.${auction.id}` }, (payload) => {
        const nb = payload.new as any;
        if (nb) { setBids((prev) => [nb, ...prev.slice(0, 9)]); setLiveTop((prev) => Math.max(prev, Number(nb.amount || 0))); }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'auctions', filter: `id=eq.${auction.id}` }, (payload) => {
        const na = payload.new as any;
        if (na?.current_bid) setLiveTop((prev) => Math.max(prev, Number(na.current_bid)));
      }).subscribe();
    return () => { clearInterval(t); supabase.removeChannel(ch); };
  }, [auction?.id]);

  if (!auction) return null;
  const isDirect = auction.sale_type === 'fixed_price' || auction.sale_type === 'direct';
  const isEnded = timer.isEnded || ['completed', 'ended', 'sold', 'closed'].includes((auction.status || '').toLowerCase()) ||
    (auction.end_date && new Date(auction.end_date).getTime() <= Date.now());
  const topBid = Math.max(liveTop, Number(auction.current_bid || auction.starting_price || 0), bids[0] ? Number(bids[0].amount) : 0);
  const minInc = Number(auction.min_increment || 1000);
  const curr = auction.currency || 'SAR';

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');
    if (!bidderName.trim() || bidderPhone.replace(/\D/g, '').length < 9) { setMsg('يرجى إدخال اسمك ورقم هاتفك (9 أرقام)'); return; }
    const val = parseFloat(bidAmount.replace(/,/g, ''));
    if (isNaN(val) || val < topBid + minInc) { setMsg(`أقل مبلغ مسموح به: ${(topBid + minInc).toLocaleString()} ${curr}`); return; }
    try {
      setSubmitting(true);
      const { error } = await supabase.from('auction_bids').insert([{ auction_id: auction.id, bidder_name: bidderName.trim(), bidder_phone: bidderPhone.trim(), amount: val, created_at: new Date().toISOString() }]);
      if (error) throw error;
      await supabase.from('auctions').update({ current_bid: val }).eq('id', auction.id);
      onSuccess(`تم تسجيل مزايدتك بمبلغ ${val.toLocaleString()} ${curr}`); onClose();
    } catch (err: any) { setMsg(err?.message || 'تعذر تسجيل المزايدة'); } finally { setSubmitting(false); }
  };
  return (
    <div dir="rtl" className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-black border-t sm:border border-[#2F3336] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl text-white">
        <div className="w-10 h-1 rounded-full bg-[#2F3336] mx-auto mt-2.5 sm:hidden" />
        <div className="px-4 py-3 border-b border-[#2F3336] flex items-center gap-2">
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer"><X size={18} /></button>
          <h3 className="text-[14px] font-black truncate flex items-center gap-1.5"><Gavel size={15} className="text-[#FFC500] shrink-0" /><span>{auction.title}</span></h3>
        </div>
        <div className="p-4 space-y-3 text-xs max-h-[78vh] overflow-y-auto">
          <div className="p-3 rounded-xl bg-zinc-950 border border-[#2F3336] flex items-center justify-between">
            <div><span className="text-[10.5px] text-[#71767B] block">{isDirect ? 'سعر البيع المباشر' : 'أعلى مزايدة حالياً'}</span><span className="text-lg font-black text-[#FFC500] font-mono">{topBid.toLocaleString()} {curr}</span></div>
            {!isDirect && <div className="text-left"><span className="text-[10.5px] text-[#71767B] block">أقل زيادة</span><span className="text-xs font-bold text-white font-mono">+{minInc.toLocaleString()} {curr}</span></div>}
          </div>
          {!isDirect && !isEnded && (
            <div className="grid grid-cols-4 gap-1.5 text-center p-2 rounded-xl bg-zinc-950 border border-[#2F3336] font-mono">
              {[{ v: timer.days, l: 'يوم' }, { v: timer.hours, l: 'ساعة' }, { v: timer.minutes, l: 'دقيقة' }, { v: timer.seconds, l: 'ثانية' }].map((x) => (
                <div key={x.l} className="bg-black rounded-lg py-1.5 border border-[#2F3336]/60"><div className="text-sm font-black text-white">{String(x.v).padStart(2, '0')}</div><div className="text-[9.5px] text-[#71767B] font-sans">{x.l}</div></div>
              ))}
            </div>
          )}
          {bids[0] && (
            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[11.5px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Trophy size={13} /> المتصدر الحالي: {bids[0].bidder_name || 'مزايد'}</span>
              <span className="text-white font-mono font-bold">{Number(bids[0].amount).toLocaleString()} {curr}</span>
            </div>
          )}
          {msg && <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">{msg}</div>}
          {isEnded ? <div className="p-3 rounded-xl bg-zinc-950 border border-[#2F3336] text-center text-[#71767B] font-bold">انتهى هذا المزاد</div> : isDirect ? (
            <div className="flex items-center gap-2">
              {auction.seller_phone && <a href={toWaLink(auction.seller_phone, `مرحباً، أرغب بشراء ${auction.title}`)} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-full bg-[#00BA7C] text-black font-black flex items-center justify-center gap-1.5"><MessageCircle size={15} /><span>شراء عبر واتساب</span></a>}
              {auction.seller_phone && <a href={`tel:${auction.seller_phone}`} className="flex-1 py-2.5 rounded-full bg-white text-black font-black flex items-center justify-center gap-1.5"><Phone size={15} /><span>اتصال</span></a>}
            </div>
          ) : (
            <form onSubmit={handleBid} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required value={bidderName} onChange={(e) => setBidderName(e.target.value)} placeholder="الاسم..." className="bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2 text-white outline-none" />
                <input type="tel" required value={bidderPhone} onChange={(e) => setBidderPhone(e.target.value)} placeholder="رقم الهاتف (9 أرقام)" className="bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2 text-white font-mono outline-none" />
              </div>
              <div className="flex gap-1.5">{[1, 2, 5].map((m) => <button key={m} type="button" onClick={() => setBidAmount(fmtAmt(String(topBid + minInc * m)))} className="flex-1 py-1.5 rounded-full border border-[#2F3336] hover:border-white text-white font-mono text-[11px] font-bold cursor-pointer">+{(minInc * m).toLocaleString()}</button>)}</div>
              <input type="text" inputMode="numeric" required value={bidAmount} onChange={(e) => setBidAmount(fmtAmt(e.target.value))} className="w-full bg-black border border-[#2F3336] focus:border-white caret-white rounded-xl p-2.5 text-white font-mono text-sm font-black outline-none" />
              <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-full bg-[#FFC500] hover:bg-[#e6b100] text-black font-black text-sm flex items-center justify-center gap-1.5 cursor-pointer"><Gavel size={15} /><span>{submitting ? 'جاري التوثيق...' : 'تأكيد المزايدة'}</span></button>
            </form>
          )}
          {bids.length > 0 && (
            <div className="pt-2 border-t border-[#2F3336] space-y-1.5">
              <div className="text-[11px] font-bold text-[#71767B] flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-400" /><span>آخر المزايدات</span></div>
              {bids.map((b, i) => <div key={b.id || i} className="flex items-center justify-between text-[11.5px] py-1 px-2 rounded-lg bg-zinc-950"><span className="text-white font-bold">{b.bidder_name || 'مزايد'} · <span className="text-[#71767B] font-normal">{formatXTimeAgo(b.created_at)}</span></span><span className="text-[#FFC500] font-mono font-bold">{Number(b.amount).toLocaleString()} {curr}</span></div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
