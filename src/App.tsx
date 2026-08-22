import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider, yrToast } from './components/ui/Toast';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardShell } from './pages/AdminDashboardShell';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { SearchInput } from './components/ui/SearchInput';
import { Alert } from './components/ui/Alert';

export const App: React.FC = () => {
  const pathname = window.location.pathname;

  return (
    <AuthProvider>
      <ModalProvider>
        <ToastProvider />
        {pathname.startsWith('/admin') ? (
          <AdminLayout>
            <AdminDashboardShell />
          </AdminLayout>
        ) : (
          <AppLayout>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-[#0B1F3A]">يمن ريتغ — Yemen Rating (YR)</h1>
                  <p className="text-xs text-[#64748B]">
                    الدليل الاقتصادي الرقمي لليمن — مرحلة تأسيس Design System و App Shell (Phase 1)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="yellow" size="md">YR Phase 1</Badge>
                  <Badge variant="primary" size="md">Design System Active</Badge>
                </div>
              </div>

              <Alert variant="info" title="حالة النظام">
                تم تجهيز كافة مقومات الهوية البصرية، ونظام النوافذ، وعناصر التنقل لشاشات الهاتف وسطح المكتب بدون المساس بقاعدة البيانات الحالية.
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <h2 className="text-sm font-bold text-[#0B1F3A] mb-3">تجربة مكونات الأزرار والـ Toast</h2>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => yrToast.success('تم تأكيد العملية بنجاح!')}
                    >
                      زر رئيسي (Toast نجاح)
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => yrToast.warning('تنبيه: راجع البيانات')}
                    >
                      زر مميز
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => yrToast.info('معلومة: الخط الرسمي Cairo')}
                    >
                      زر إطار
                    </Button>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-bold text-[#0B1F3A] mb-3">حقول البحث والإدخال الموحدة</h2>
                  <SearchInput placeholder="ابحث في يمن ريتغ..." />
                </Card>
              </div>
            </div>
          </AppLayout>
        )}
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
