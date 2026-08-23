import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { CurrencyPriceItem } from '../../types/prices';

interface PriceEditorModalProps {
  item: CurrencyPriceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, buy: number, sell: number, change: 'up' | 'down' | 'stable') => void;
}

export const PriceEditorModal: React.FC<PriceEditorModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [change, setChange] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (item) {
      setBuyPrice(item.buyPrice);
      setSellPrice(item.sellPrice);
      setChange(item.change);
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, Number(buyPrice), Number(sellPrice), change);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل سعر: ${item.currencyName} (${item.market === 'sanaa' ? 'سوق صنعاء' : 'سوق عدن'})`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
        <Input
          label="سعر الشراء (ريال يمني)"
          type="number"
          step="any"
          required
          value={buyPrice}
          onChange={(e) => setBuyPrice(parseFloat(e.target.value))}
        />

        <Input
          label="سعر البيع (ريال يمني)"
          type="number"
          step="any"
          required
          value={sellPrice}
          onChange={(e) => setSellPrice(parseFloat(e.target.value))}
        />

        <Select
          label="مؤشر حركة السعر"
          value={change}
          options={[
            { label: 'مستقر (ثابت)', value: 'stable' },
            { label: 'صاعد (ارتفاع)', value: 'up' },
            { label: 'هابط (انخفاض)', value: 'down' },
          ]}
          onChange={(val) => setChange(val as any)}
        />

        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#222222] flex items-center gap-2">
          <Button type="submit" variant="primary" fullWidth className="font-bold">
            حفظ وتحديث السعر
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
