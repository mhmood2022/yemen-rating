import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardShell } from './pages/AdminDashboardShell';
import { HomePage } from './pages/HomePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname + window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const url = new URL(window.location.origin + currentPath);
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  const renderContent = () => {
    if (pathname.startsWith('/admin')) {
      return (
        <AdminLayout>
          <AdminDashboardShell />
        </AdminLayout>
      );
    }

    if (pathname.startsWith('/business/')) {
      const id = pathname.replace('/business/', '');
      return (
        <AppLayout onNavigate={navigate}>
          <BusinessProfilePage businessId={id} onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/directory') {
      const categoryParam = searchParams.get('category') || '';
      const queryParam = searchParams.get('q') || '';
      return (
        <AppLayout onNavigate={navigate}>
          <DirectoryPage
            initialCategory={categoryParam}
            initialQuery={queryParam}
            onNavigate={navigate}
          />
        </AppLayout>
      );
    }

    // Default: Home Page
    return (
      <AppLayout onNavigate={navigate}>
        <HomePage onNavigate={navigate} />
      </AppLayout>
    );
  };

  return (
    <AuthProvider>
      <ModalProvider>
        <ToastProvider />
        {renderContent()}
      </ModalProvider>
    </AuthProvider>
  );
};

export default App;
