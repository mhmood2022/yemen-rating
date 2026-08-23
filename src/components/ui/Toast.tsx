import React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

export const ToastProvider: React.FC = () => {
  return (
    <SonnerToaster
      position="top-center"
      dir="rtl"
      theme="system"
      toastOptions={{
        style: {
          fontFamily: 'var(--yr-font)',
          borderRadius: '10px',
          padding: '14px',
          border: '1px solid var(--yr-border)',
          background: 'var(--yr-card)',
          color: 'var(--yr-text-primary)',
        },
      }}
    />
  );
};

export const yrToast = {
  success: (msg: string, description?: string) =>
    sonnerToast.success(msg, { description }),
  error: (msg: string, description?: string) =>
    sonnerToast.error(msg, { description }),
  warning: (msg: string, description?: string) =>
    sonnerToast.warning(msg, { description }),
  info: (msg: string, description?: string) =>
    sonnerToast.info(msg, { description }),
};
