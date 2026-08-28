import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider } from './context/AdminContext';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';
import { CategoryCollectivePage } from './pages/CategoryCollectivePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { JobsPage } from './pages/JobsPage';
import { PricesPage } from './pages/PricesPage';
import { TrendPage } from './pages/TrendPage';
import { MoreMenuPage } from './pages/MoreMenuPage';

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

  const categoryMap: Record<string, { slug: string; title: string; icon: string }> = {
    '/restaurants': { slug: 'restaurants', title: 'المطاعم والكافيهات', icon: 'fa-utensils' },
    '/hotels': { slug: 'hotels', title: 'الفنادق والإقامة والسياحة', icon: 'fa-hotel' },
    '/banks': { slug: 'banks', title: 'البنوك والمصارف', icon: 'fa-building-columns' },
    '/exchanges': { slug: 'exchanges', title: 'شركات الصرافة والتحويلات', icon: 'fa-money-bill-transfer' },
    '/wallets': { slug: 'wallets', title: 'المحافظ والخدمات المالية', icon: 'fa-wallet' },
    '/companies': { slug: 'companies', title: 'الشركات والمؤسسات', icon: 'fa-building' },
    '/transport': { slug: 'transport', title: 'السيارات والنقل البري', icon: 'fa-car' },
    '/shops': { slug: 'shops', title: 'المتاجر ومراكز التسوق', icon: 'fa-bag-shopping' },
    '/health': { slug: 'health', title: 'الصحة والمستشفيات', icon: 'fa-hospital' },
    '/services': { slug: 'services', title: 'الخدمات العامة', icon: 'fa-wrench' },
    '/education': { slug: 'education', title: 'التعليم والجامعات', icon: 'fa-graduation-cap' },
    '/entertainment': { slug: 'entertainment', title: 'السياحة والترفيه', icon: 'fa-umbrella-beach' },
  };

  const renderContent = () => {
    // 1. التوجيه للصفحات الجماعية للتصنيفات
    if (categoryMap[pathname]) {
      const cat = categoryMap[pathname];
      return (
        <AppLayout onNavigate={navigate}>
          <CategoryCollectivePage
            categorySlug={cat.slug}
            categoryTitle={cat.title}
            categoryIcon={cat.icon}
            onNavigate={navigate}
          />
        </AppLayout>
      );
    }

    if (pathname === '/directory') {
      return (
        <AppLayout onNavigate={navigate}>
          <DirectoryPage onNavigate={navigate} />
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

    if (pathname === '/prices') {
      return (
        <AppLayout onNavigate={navigate}>
          <PricesPage onNavigate={navigate} />
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

    if (pathname === '/more') {
      return (
        <AppLayout onNavigate={navigate}>
          <MoreMenuPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    // الصفحة الرئيسية الافتراضية
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
            {renderContent()}
          </ModalProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
