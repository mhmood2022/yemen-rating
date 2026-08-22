import React from 'react';
import { useModal } from '../../context/ModalContext';

export const Footer: React.FC = () => {
  const { openAdminLogin } = useModal();

  return (
    <footer className="w-full bg-white border-t border-[#E2E8F0] py-6 px-4 lg:px-8 text-center text-xs text-[#64748B] mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2 font-bold text-[#0B1F3A] text-sm">
          <span>يمن ريتغ</span>
          <span className="text-[#94A3B8]">—</span>
          <span>Yemen Rating</span>
        </div>

        <p className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={openAdminLogin}
            className="hover:text-[#0B1F3A] transition-colors font-bold cursor-pointer inline-flex items-center px-1"
            title="دخول الإدارة"
            aria-label="دخول الإدارة"
          >
            ©
          </button>
          <span>2026 يمن ريتغ — جميع الحقوق محفوظة</span>
        </p>
      </div>
    </footer>
  );
};
