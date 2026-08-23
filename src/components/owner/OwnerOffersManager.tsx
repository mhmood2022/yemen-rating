import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Tag, Plus, Trash2, CheckCircle2, Percent } from 'lucide-react';
import { yrToast } from '../ui/Toast';

export interface BusinessOffer {
  id: string;
  title: string;
  discountPercent?: string;
  discountCode?: string;
  validUntil: string;
  description: string;
}

export const OwnerOffersManager: React.FC<{ businessId: string }> = () => {
  const [offers, setOffers] = useState<BusinessOffer[]>([
    {
      id: 'off_1',
      title: 'خصم 15% على جميع الوجبات العائلية',
      discountPercent: '15%',
      discountCode: 'YR2026',
      validUntil: '2026-09-30',
      description: 'يسري العرض لعملاء منصة يمن ريتغ عند الدفع الإلكتروني أو نقداً'
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [validUntil, setValidUntil] = useState('2026-09-30');
  const [description, setDescription] = useState('');

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      yrToast.error('يرجى كتابة عنوان العرض');
      return;
    }
    const newOffer: BusinessOffer = {
      id: `off_${Date.now()}`,
      title: title.trim(),
      discountPercent: discountPercent.trim() || undefined,
      discountCode: discountCode.trim().toUpperCase() || undefined,
      validUntil,
      description: description.trim()
    };
    setOffers([newOffer, ...offers]);
    setIsAdding(false);
    setTitle('');
    setDiscountPercent('');
    setDiscountCode('');
    setDescription('');
    yrToast.success('تم نشر العرض الترويجي بنجاح!');
  };

  const handleDeleteOffer = (id: string) => {
    setOffers(offers.filter((o) => o.id !== id));
    yrToast.warning('تم حذف العرض الترويجي');
  };

  return (
    <Card className="p-4 sm:p-5 bg-[#111111] border border-[#222222] rounded-[14px] space-y-4 text-right">
      <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
        <div>
          <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
            <Tag size={16} className="text-[#F5C400]" />
            <span>العروض والخصومات الخاصة بنشاطك ({offers.length})</span>
          </h3>
          <p className="text-[11px] text-[#A1A1AA]">
            انشر عروض حصرية وأكواد تخفيض لجذب المزيد من الزوار والعملاء.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          icon={<Plus size={14} strokeWidth={2.5} />}
          className="text-xs font-bold"
        >
          {isAdding ? 'إلغاء' : 'إضافة عرض جديد'}
        </Button>
      </div>

      {/* Add Offer Form */}
      {isAdding && (
        <form onSubmit={handleAddOffer} className="p-3.5 rounded-[10px] bg-[#0A0A0A] border border-[#222222] space-y-3 animate-in fade-in duration-200">
          <Input
            label="عنوان العرض أو الخصم"
            placeholder="مثال: خصم 20% على طلبات التوصيل"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              label="نسبة الخصم (إن وجدت)"
              placeholder="مثال: 20%"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
            />

            <Input
              label="كود الخصم (إن وجد)"
              placeholder="مثال: YEMEN20"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />

            <Input
              label="تاريخ انتهاء العرض"
              type="date"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-white">تفاصيل وشروط العرض</label>
            <textarea
              rows={2}
              placeholder="شروط الاستفادة من العرض..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#111111] text-white border border-[#222222] rounded-[8px] outline-none focus:border-[#F5C400]"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth className="font-bold text-xs h-[38px]">
            نشر العرض فوراً لرواد المنصة
          </Button>
        </form>
      )}

      {/* Offers List */}
      <div className="space-y-2.5">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="p-3 rounded-[10px] bg-[#0A0A0A] border border-[#1E1E1E] flex items-start justify-between gap-3"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white truncate">{offer.title}</span>
                {offer.discountPercent && (
                  <span className="px-2 py-0.2 rounded bg-[#EF4444]/15 text-[#EF4444] text-[10px] font-black">
                    {offer.discountPercent}
                  </span>
                )}
                {offer.discountCode && (
                  <span className="px-2 py-0.2 rounded bg-[#F5C400]/15 text-[#F5C400] text-[10px] font-mono font-bold">
                    كود: {offer.discountCode}
                  </span>
                )}
              </div>
              {offer.description && (
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed line-clamp-1">{offer.description}</p>
              )}
              <span className="text-[10px] text-[#71717A] block">صالح حتى: {offer.validUntil}</span>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteOffer(offer.id)}
              icon={<Trash2 size={13} />}
              className="h-8 px-2 shrink-0"
              title="حذف العرض"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
