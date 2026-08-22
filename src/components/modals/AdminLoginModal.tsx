import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import { yrToast } from '../ui/Toast';

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginOpen, closeAdminLogin } = useModal();
  const { loginAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    const result = await loginAdmin(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      yrToast.success('تم تسجيل الدخول بنجاح', 'جارٍ الانتقال إلى لوحة الإدارة...');
      closeAdminLogin();
      window.location.href = '/admin';
    } else {
      setErrorMsg(result.error || 'فشل تسجيل الدخول');
      yrToast.error('فشل الدخول', result.error);
    }
  };

  return (
    <Modal
      isOpen={isAdminLoginOpen}
      onClose={closeAdminLogin}
      title="دخول الإدارة"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <Alert variant="danger">{errorMsg}</Alert>
        )}

        <Input
          label="البريد الإلكتروني"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@yemenrating.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          rightIcon={<Mail size={18} strokeWidth={1.75} />}
        />

        <Input
          label="كلمة المرور"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightIcon={<Lock size={18} strokeWidth={1.75} />}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            تسجيل الدخول
          </Button>
        </div>
      </form>
    </Modal>
  );
};
