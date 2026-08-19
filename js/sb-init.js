// ═══ Supabase Integration - Non-Invasive ═══
// يعمل بالتوازي مع السكربت الأصلي - لا يستبدل أي شيء
(function(){
    if (typeof window.supabase === 'undefined') return;
    
    var sb = window.supabase.createClient(
        'https://wkdqeghotlipciqiytuj.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZHFlZ2hvdGxpcGNpcWl5dHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MDM4NzEsImV4cCI6MjEwMjQ3OTg3MX0.ahqq5okKMXMxuI-8sArjxcVIpPDRmX20mhscs8BaCTE'
    );
    
    // نستمع على document بمرحلة capture - نقرأ القيم قبل reset
    document.addEventListener('submit', function(e){
        var form = e.target;
        if (!form || form.id !== 'applyForm') return;
        
        // قراءة القيم فوراً (قبل أن يعمل المستمع الأصلي)
        var data = {
            name: (form.querySelector('input[type=text]') || {}).value || '',
            phone: (form.querySelector('input[type=tel]') || {}).value || '',
            email: (form.querySelector('input[type=email]') || {}).value || '',
            exp: (form.querySelector('select') || {}).value || '',
            message: (form.querySelector('textarea') || {}).value || ''
        };
        var jobId = window._curJobId || null;
        var user = JSON.parse(localStorage.getItem('yr_session') || 'null');
        
        // حفظ في Supabase (بالتوازي مع localStorage الأصلي)
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
            if (res.error) {
                console.warn('Supabase:', res.error.message);
            } else {
                sb.from('audit_logs').insert({
                    user_id: (user && user.userId) ? user.userId : null,
                    action: 'JOB_APPLICATION_SUBMITTED',
                    entity: 'applications',
                    new_value: { applicantName: data.name }
                });
            }
        }).catch(function(err){
            console.warn('Supabase exception:', err);
        });
    }, true); // capture phase = قبل المستمع الأصلي
})();
