import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BusinessItem } from '../../types/business';

interface VerificationModalProps {
  business: BusinessItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, badge: 'gold' | 'blue' | 'gray', reason: string) => void;
}

export const VerificationManagerModal: React.FC<VerificationModalProps> = ({
  business,
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<'gold' | 'blue' | 'gray'>('gold');
  const [reason, setReason] = useState('اعتماد وتوثيق السجل التجاري الرسمي');

  useEffect(() => {
    if (business) {
      setSelectedBadge(business.verifiedBadgeType || 'gold');
    }
  }, [business]);

  if (!business) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(business.id, selectedBadge, reason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إدارة وتوثيق شارة: ${business.name}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#0B1F3A] dark:text-white">
            اختر نوع الشارة المعتمدة:
          </label>

          <div className="grid grid-cols-3 gap-2">
            {/* Gold Badge Option */}
            <button
              type="button"
              onClick={() => setSelectedBadge('gold')}
              className={`p-3 rounded-[10px] border flex flex-col items-center gap-1.5 transition-all select-none ${selectedBadge === 'gold' ? 'border-[#F5C400] bg-[#F5C400]/15' : 'border-[#222222] bg-[#0A0A0A]'}`}
            >
              <VerifiedBadge variant="gold" size={24} />
              <span className="text-[11px] font-bold text-white">ذهبي</span>
              <span className="text-[9px] text-[#A1A1AA]">شركات وبنوك</span>
            </button>

            {/* Blue Badge Option */}
            <button
              type="button"
              onClick={() => setSelectedBadge('blue')}
              className={`p-3 rounded-[10px] border flex flex-col items-center gap-1.5 transition-all select-none ${selectedBadge === 'blue' ? 'border-[#1D9BF0] bg-[#1D9BF0]/15' : 'border-[#222222] bg-[#0A0A0A]'}`}
            >
              <VerifiedBadge variant="blue" size={24} />
              <span className="text-[11px] font-bold text-white">أزرق</span>
              <span className="text-[9px] text-[#A1A1AA]">محافظ وتقنية</span>
            </button>

            {/* Gray Badge Option */}
            <button
              type="button"
              onClick={() => setSelectedBadge('gray')}
              className={`p-3 rounded-[10px] border flex flex-col items-center gap-1.5 transition-all select-none ${selectedBadge === 'gray' ? 'border-[#8E8E93] bg-[#8E8E93]/15' : 'border-[#222222] bg-[#0A0A0A]'}`}
            >
              <VerifiedBadge variant="gray" size={24} />
              <span className="text-[11px] font-bold text-white">رمادي</span>
              <span className="text-[9px] text-[#A1A1AA]">جهات رسمية</span>
            </button>
          </div>
        </div>

        <Input
          label="سبب منح / تعديل الشارة (للتوثيق الإداري)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#222222] flex items-center gap-2">
          <Button type="submit" variant="primary" fullWidth className="font-bold">
            حفظ وتأكيد الشارة
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
