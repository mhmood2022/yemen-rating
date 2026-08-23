import React, { useState } from 'react';
import { BusinessItem } from '../../types/business';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { yrToast } from '../ui/Toast';
import { ShieldCheck, User, Phone, FileText, UploadCloud, AlertCircle } from 'lucide-react';

interface BusinessClaimModalProps {
  business: BusinessItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitClaim: (businessId: string, claimData: any) => void;
}

export const BusinessClaimModal: React.FC<BusinessClaimModalProps> = ({
  business,
  isOpen,
  onClose,
  onSubmitClaim,
}) => {
  const [claimantName, setClaimantName] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [commercialRegNumber, setCommercialRegNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!business) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimantName.trim() || !claimantPhone.trim()) {
      yrToast.error('يرجى كتابة الاسم ورقم الهاتف للتواصل');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitClaim(business.id, {
        claimantName,
        claimantPhone,
        nationalId,
        commercialRegNumber,
        notes,
      });
      yrToast.success(
        'تم استلام طلب إثبات الملكية بنجاح!',
        'سيقوم فريق إدارة يمن ريتغ بمراجعة السجل التجاري والتواصل معك لتفعيل صلاحيات المالك.'
      );
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إثبات ملكية: ${business.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
        {/* Notice Card */}
        <div className="p-3 rounded-[10px] bg-[#F5C400]/10 border border-[#F5C400]/30 text-xs text-[#A1A1AA] leading-relaxed flex items-start gap-2">
          <ShieldCheck size={16} className="text-[#F5C400] shrink-0 mt-0.5" />
          <span>
            هذه المنشأة غير مستلمة حتى الآن. إذا كنت المالك القانوني أو المفوض الرسمي، يرجى تقديم البيانات أدناه لمراجعتها من قبل إدارة المنصة وتفعيل لوحة إدارة نشاطك.
          </span>
        </div>

        <Input
          label="اسم المالك / المفوض القانوني الكامل"
          placeholder="الاسم الثلاثي أو الرباعي كما في الهوية"
          required
          value={claimantName}
          onChange={(e) => setClaimantName(e.target.value)}
          rightIcon={<User size={16} />}
        />

        <Input
          label="رقم الهاتف والواتساب للتواصل المباشر"
          type="tel"
          placeholder="77XXXXXXX"
          required
          value={claimantPhone}
          onChange={(e) => setClaimantPhone(e.target.value)}
          rightIcon={<Phone size={16} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Input
            label="رقم الهوية الوطنية / جواز السفر"
            placeholder="الرقم الوطني"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
          />

          <Input
            label="رقم السجل التجاري / الترخيص (إن وجد)"
            placeholder="رقم السجل التجاري"
            value={commercialRegNumber}
            onChange={(e) => setCommercialRegNumber(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#0B1F3A] dark:text-white">
            ملاحظات أو مستندات إضافية
          </label>
          <textarea
            rows={2}
            placeholder="أية معلومات إضافية تثبت صلتك بالنشاط..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 text-xs bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white border border-[#CBD5E1] dark:border-[#222222] rounded-[10px] outline-none focus:border-[#F5C400]"
          />
        </div>

        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#222222] flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            className="font-bold text-xs h-[42px]"
          >
            {isSubmitting ? 'جارٍ إرسال الطلب...' : 'إرسال طلب إثبات الملكية للإدارة'}
          </Button>

          <Button type="button" variant="outline" onClick={onClose} className="h-[42px]">
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
};
