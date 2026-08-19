// ═══ Supabase Init + Jobs Integration ═══
(function(){
    if (typeof window.supabase === 'undefined') return;
    
    const SUPABASE_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE';
    
    // إنشاء client فقط إذا كان sb-init.js على صفحة تحتاجه
    const needsSupabase = ['jobs.html', 'register.html'].some(p => location.pathname.includes(p));
    if (!needsSupabase) return;
    
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.yrSupabase = sb;
    
    console.log('✅ Supabase client initialized on', location.pathname);
    
    // ═══ في jobs.html: استبدال مستمع applyForm ═══
    if (location.pathname.includes('jobs.html')) {
        document.addEventListener('DOMContentLoaded', function(){
            const form = document.getElementById('applyForm');
            if (!form) return;
            
            // إزالة المستمع القديم (localStorage فقط)
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            // إضافة مستمع جديد (Supabase + localStorage fallback)
            newForm.addEventListener('submit', async function(e){
                e.preventDefault();
                const f = e.target;
                const data = {
                    name: f.querySelector('input[type=text]').value,
                    phone: f.querySelector('input[type=tel]').value,
                    email: f.querySelector('input[type=email]').value,
                    exp: f.querySelector('select').value,
                    message: f.querySelector('textarea').value
                };
                
                const jobId = window._curJobId || null;
                const jobTitle = window._curJobTitle || 'وظيفة';
                const user = JSON.parse(localStorage.getItem('yr_session') || 'null');
                
                // محاولة Supabase أولاً
                let success = false;
                try {
                    const { data: inserted, error } = await sb
                        .from('applications')
                        .insert({
                            job_id: jobId,
                            user_id: user?.userId || null,
                            applicant_name: data.name,
                            applicant_phone: data.phone,
                            applicant_email: data.email,
                            experience: data.exp,
                            message: data.message,
                            status: 'PENDING'
                        })
                        .select()
                        .single();
                    
                    if (!error && inserted) {
                        success = true;
                        // Audit log
                        await sb.from('audit_logs').insert({
                            user_id: user?.userId || null,
                            action: 'JOB_APPLICATION_SUBMITTED',
                            entity: 'applications',
                            entity_id: inserted.id,
                            new_value: { jobTitle, applicantName: data.name }
                        }).then(r => { if (r.error) console.warn('Audit log failed:', r.error); });
                    } else {
                        console.warn('Supabase insert error:', error);
                    }
                } catch (err) {
                    console.warn('Supabase exception:', err);
                }
                
                // Fallback إلى localStorage (دائماً كـ backup)
                const apps = JSON.parse(localStorage.getItem('yr_applications') || '[]');
                apps.push({
                    id: Date.now(),
                    jobId: jobId,
                    jobTitle: jobTitle,
                    ...data,
                    status: 'PENDING',
                    date: new Date().toLocaleString('ar-YE'),
                    source: success ? 'supabase' : 'local'
                });
                localStorage.setItem('yr_applications', JSON.stringify(apps));
                
                // إغلاق النموذج + إظهار رسالة نجاح
                if (typeof closeModals === 'function') closeModals();
                if (typeof showToast === 'function') {
                    showToast(success 
                        ? '✅ تم استلام طلبك! سيُراجع من الإدارة ثم يُحوَّل للجهة الناشرة'
                        : '✅ تم استلام طلبك محلياً (تعذر الاتصال بالخادم)');
                }
                f.reset();
            });
        });
    }
})();
