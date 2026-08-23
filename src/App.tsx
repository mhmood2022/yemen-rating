import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider } from './context/AdminContext';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardShell } from './pages/AdminDashboardShell';
import { HomePage } from './pages/HomePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { BanksAndWalletsPage } from './pages/BanksAndWalletsPage';
import { PricesPage } from './pages/PricesPage';
import { TrendPage } from './pages/TrendPage';
import { MoreMenuPage } from './pages/MoreMenuPage';
import { PhoneMarketPage } from './pages/PhoneMarketPage';
import { JobsPage } from './pages/JobsPage';
import { CategoryHubPage } from './pages/categories/CategoryHubPage';

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

    // الصفحات الجماعية للتصنيفات الرسمية
    if (pathname === '/restaurants') {
      return <AppLayout onNavigate={navigate}><CategoryHubPage categoryTitle="المطاعم" categorySlug="restaurants" onNavigate={navigate} /></AppLayout>;
    }
    if (pathname === '/hotels') {
      return <AppLayout onNavigate={navigate}><CategoryHubPage categoryTitle="الفنادق" categorySlug="hotels" onNavigate={navigate} /></AppLayout>;
    }
    if (pathname === '/companies') {
      return <AppLayout onNavigate={navigate}><CategoryHubPage categoryTitle="الشركات" categorySlug="companies" onNavigate={navigate} /></AppLayout>;
    }
    if (pathname === '/healthcare') {
      return <AppLayout onNavigate={navigate}><CategoryHubPage categoryTitle="الصحة" categorySlug="healthcare" onNavigate={navigate} /></AppLayout>;
    }
    if (pathname === '/cars') {
      return <AppLayout onNavigate={navigate}><CategoryHubPage categoryTitle="السيارات" categorySlug="cars" onNavigate={navigate} /></AppLayout>;
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

    if (pathname === '/jobs') {
      return (
        <AppLayout onNavigate={navigate}>
          <JobsPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/trend') {
      return (
        <AppLayout onNavigate={navigate}>
          <TrendPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/prices') {
      return (
        <AppLayout onNavigate={navigate}>
          <PricesPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/phones') {
      return (
        <AppLayout onNavigate={navigate}>
          <PhoneMarketPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/more') {
      return (
        <AppLayout onNavigate={navigate}>
          <MoreMenuPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/banks-wallets' || pathname === '/banks' || pathname === '/wallets') {
      const initialType = pathname === '/banks' ? 'bank' : pathname === '/wallets' ? 'wallet' : 'all';
      return (
        <AppLayout onNavigate={navigate}>
          <BanksAndWalletsPage initialType={initialType} onNavigate={navigate} />
        </AppLayout>
      );
    }

    return (
      <AppLayout onNavigate={navigate}>
        <HomePage onNavigate={navigate} />
      </AppLayout>
    );
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <ModalProvider>
            <ToastProvider />
            {renderContent()}
          </ModalProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
