// ═══════════════════════════════════════════════════════════
// YEMEN RATING - الاتصال بقاعدة بيانات Supabase
// ═══════════════════════════════════════════════════════════

// ⚠️ عدّل هذين السطرين بمفاتيح مشروعك ⚠️
const SUPABASE_URL = 'https://supabase.com/dashboard/org/rylvuznktliydxhqosyo';
const SUPABASE_KEY = 'sb_publishable_tqUut6O2ZVj3OJtYPzSrPQ_Ff5TIaW-';

// ═══ تحميل مكتبة Supabase من CDN ═══
(function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = function() {
        window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase متصل بنجاح');

        // اختبار الاتصال: جلب المدن
        window.sb.from('cities').select('*').then(function(res) {
            if (res.error) {
                console.error('❌ خطأ:', res.error.message);
            } else {
                console.log('✅ تم جلب ' + res.data.length + ' مدينة');
            }
        });
    };
    script.onerror = function() {
        console.error('❌ فشل تحميل مكتبة Supabase');
    };
    document.head.appendChild(script);
})();
