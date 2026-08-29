import { AdminMasterPage } from './components/admin/AdminMasterPage';
export function App() {
  const isAdmin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('admin') === 'YR2026_SANAA';
  if (isAdmin) {
    return <AdminMasterPage onBack={() => { window.history.replaceState({}, '', '/'); window.location.href='/'; }} />;
  }
  return (
    <div dir="rtl" style={{background:'#0d0d0d', color:'#fff', minHeight:'100vh', padding:20, fontFamily:'system-ui'}}>
      <h1 style={{color:'#f5c400'}}>منصة تقييم اليمن - الرئيسية</h1>
      <p style={{color:'#aaa', marginTop:10}}>الموقع يعمل. للإدارة ادخل:</p>
      <code style={{background:'#18181b', padding:'8px 12px', borderRadius:8, display:'inline-block', marginTop:10}}>?admin=YR2026_SANAA</code>
    </div>
  );
}
