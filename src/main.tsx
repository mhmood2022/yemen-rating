import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// مسح أي Service Worker عند بدء تشغيل التطبيق
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.unregister());
  });
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('YR Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', direction: 'rtl', fontFamily: 'Cairo, sans-serif', textAlign: 'center', backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#F5C400', marginBottom: '8px' }}>يمن ريتغ</h2>
          <p style={{ color: '#A1A1AA', fontSize: '13px', marginBottom: '16px' }}>{this.state.error?.message}</p>
          <button
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
              }
              window.location.reload();
            }}
            style={{ padding: '10px 20px', backgroundColor: '#F5C400', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            تحديث ومسح الذاكرة المؤقتة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
