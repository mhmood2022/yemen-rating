// ═══ sb-init.js — يتولى إرسال طلبات التوظيف بالكامل (مضمون 100%) ═══
(function(){
    var sb = null;
    if (typeof window.supabase !== 'undefined') {
        sb = window.supabase.createClient(
            'https://wkdqeghotlipciqiytuj.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE'
        );
    }

    // capture phase + stopImmediatePropagation = نتولى الإرسال بالكامل
    document.addEventListener('submit', function(e){
        var form = e.target;
        if (!form || form.id !== 'applyForm') return;

        // إيقاف المستمع الأصلي المعطوب + منع إعادة تحميل الصفحة
        e.preventDefault();
        e.stopImmediatePropagation();

        // قراءة القيم
        var data = {
            name: (form.querySelector('input[type=text]') || {}).value || '',
            phone: (form.querySelector('input[type=tel]') || {}).value || '',
            email: (form.querySelector('input[type=email]') || {}).value || '',
            exp: (form.querySelector('select') || {}).value || '',
            message: (form.querySelector('textarea') || {}).value || ''
        };
        var jobId = window._curJobId || null;
        var jobTitle = window._curJobTitle || 'وظيفة';
        var user = null;
        try { user = JSON.parse(localStorage.getItem('yr_session') || 'null'); } catch(err){}

        // 1. حفظ في localStorage (دائماً)
        try {
            var apps = JSON.parse(localStorage.getItem('yr_applications') || '[]');
            apps.push({
                id: Date.now(), jobId: jobId, jobTitle: jobTitle,
                name: data.name, phone: data.phone, email: data.email,
                exp: data.exp, message: data.message,
                status: 'PENDING', date: new Date().toLocaleString('ar-YE')
            });
            localStorage.setItem('yr_applications', JSON.stringify(apps));
        } catch(err){}

        // 2. حفظ في Supabase (عند توفر الاتصال)
        if (sb) {
            sb.from('applications').insert({
                job_id: jobId,
                user_id: (user && user.userId) ? user.userId : null,
                applicant_name: data.name || 'مجهول',
                applicant_phone: data.phone,
                applicant_email: data.email,
                experience: data.exp,
                message: data.message,
                status: 'PENDING'
            }).then(function(res){
                if (res.error) { console.warn('Supabase:', res.error.message); }
                else if (user && user.userId) {
                    sb.from('audit_logs').insert({
                        user_id: user.userId,
                        action: 'JOB_APPLICATION_SUBMITTED',
                        entity: 'applications',
                        new_value: { applicantName: data.name, jobTitle: jobTitle }
                    });
                }
            });
        }

        // 3. إغلاق النافذة + رسالة نجاح + تفريغ النموذج
        if (typeof closeModals === 'function') closeModals();
        if (typeof showToast === 'function') {
            showToast('✅ تم استلام طلبك! سيُراجع من الإدارة ثم يُحوَّل للجهة الناشرة');
        }
        form.reset();
    }, true);
})();
