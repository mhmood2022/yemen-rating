import React from 'react';

export const AuctionsManager: React.FC = () => {
  const auctions = [
    { id: 'AUC-101', title: 'معدة ثقيلة كتربلر 2022', currency: 'SAR', currentBid: 120000, commissionRate: 5.0, status: 'active', seller: 'شركة المقاولات' },
    { id: 'AUC-102', title: 'سيارة لاندكروزر VXR 2023', currency: 'USD', currentBid: 68000, commissionRate: 5.0, status: 'ended', seller: 'معرض النخبة' },
    { id: 'AUC-103', title: 'أرض تجارية شارع الستين', currency: 'YER', currentBid: 85000000, commissionRate: 5.0, status: 'active', seller: 'العقارية الأولى' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">إدارة المزادات وعمولة الـ 5%</h2>
        <p className="text-[#9CA3AF] text-xs">نسبة العمولة (5%) ومستحقات صاحب المزاد مرئية للإدارة وصاحب المزاد فقط ومحمية بـ RLS.</p>
      </div>

      <div className="bg-[#0B0F17] rounded-xl border border-[#1F2937] overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937]">
            <tr>
              <th className="py-3.5 px-4">المزاد</th>
              <th className="py-3.5 px-4">العملة</th>
              <th className="py-3.5 px-4">السعر</th>
              <th className="py-3.5 px-4 text-[#FFC500]">عمولة YR (5%)</th>
              <th className="py-3.5 px-4 text-[#16A34A]">صافي البائع</th>
              <th className="py-3.5 px-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937] text-white">
            {auctions.map((auc) => {
              const commission = auc.currentBid * (auc.commissionRate / 100);
              const netAmount = auc.currentBid - commission;
              return (
                <tr key={auc.id} className="hover:bg-[#161D2B]/50">
                  <td className="py-3.5 px-4 font-bold">{auc.title}</td>
                  <td className="py-3.5 px-4 font-bold text-[#FFC500]">{auc.currency}</td>
                  <td className="py-3.5 px-4 font-mono">{auc.currentBid.toLocaleString()} {auc.currency}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#FFC500]">{commission.toLocaleString()} {auc.currency}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#16A34A]">{netAmount.toLocaleString()} {auc.currency}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      auc.status === 'active' ? 'bg-[#16A34A]/20 text-[#16A34A]' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {auc.status === 'active' ? 'نشط' : 'مكتمل'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
