export function AdminMasterPage({ onBack }: { onBack: () => void }) {
  return (
    <div style={{background:'#0f0f0f', color:'white', minHeight:'100vh', padding:20, direction:'rtl'}}>
      <h1 style={{color:'#f5c400'}}>✅ الإدارة تعمل</h1>
      <p>124 شركة - 8 بانتظار - 1240 مستخدم</p>
      <button onClick={onBack} style={{marginTop:20, padding:12, background:'#333', color:'#fff', border:'none', borderRadius:8}}>عودة</button>
    </div>
  );
}
