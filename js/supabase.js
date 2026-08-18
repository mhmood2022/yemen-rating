/* ═══════════════════════════════════════════════════════════
   YEMEN RATING — طبقة الاتصال الموحّدة بـ Supabase
   يُستخدم هذا الملف الآن فقط من admin.html، وسيُعتمد لاحقًا
   في بقية الصفحات عند تحويلها من YR_DB إلى Supabase الحقيقي.
═══════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://wkdqeghotlipciqiytuj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4StPj676njVXlDg4UUwaJg_xSqhsIuT';

// كل الصفحات تنتظر هذا الـ Promise قبل أي استعلام، فلا يوجد أبدًا
// سباق بين "الصفحة تُحمّل" و"الاتصال جاهز".
window.YR_SUPABASE_READY = (async () => {
    const module = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    const client = module.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.sb = client;   // متاح عالميًا لكل الصفحات: window.sb أو sb مباشرة
    console.log('✅ Supabase connected');
    return client;
})();

/**
 * دالة مساعدة: استخدمها في بداية أي دالة async تحتاج قاعدة البيانات
 *   const sb = await getSB();
 * تضمن أن الاتصال جاهز قبل الاستمرار، بدل الاعتماد على توقيت DOMContentLoaded.
 */
async function getSB() {
    return window.YR_SUPABASE_READY;
}

/**
 * تسجيل إجراء إداري حسّاس في audit_logs.
 * يُستخدم من admin.html عند كل تعديل/حذف/تغيير حالة.
 */
async function logAdminAction(action, targetTable, targetId, reason = null) {
    try {
        const client = await getSB();
        const { data: { user } } = await client.auth.getUser();
        if (!user) return;
        await client.from('audit_logs').insert({
            admin_id: user.id,
            action,
            target_table: targetTable,
            target_id: String(targetId),
            reason
        });
    } catch (e) {
        console.warn('تعذّر تسجيل الإجراء في audit_logs:', e);
    }
}

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'رابط_مشروعك_الحالي_في_سوبابيز';
const SUPABASE_ANON_KEY = 'مفتاحك_الحالي_في_سوبابيز';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

