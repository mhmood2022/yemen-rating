-- ============================================================
-- YEMEN RATING - 002_MASTER_SPEC.SQL
-- ============================================================

-- 1. جدول الأدوار الـ 11 ونظام الصلاحيات
CREATE TYPE yr_role_type AS ENUM (
    'super_admin',
    'general_admin',
    'support_lead',
    'claims_officer',
    'auctions_manager',
    'realestate_officer',
    'jobs_moderator',
    'ads_manager',
    'financial_auditor',
    'content_reviewer',
    'market_analyst'
);

-- 2. جدول تسجيل العمليات Audit Log
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. حقول إضافية للشركات والتصنيفات
ALTER TABLE IF EXISTS public.categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE IF EXISTS public.companies 
ADD COLUMN IF NOT EXISTS badge_type VARCHAR(20) DEFAULT 'gray' CHECK (badge_type IN ('gold', 'blue', 'gray')),
ADD COLUMN IF NOT EXISTS boost_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- 4. إعدادات المزادات وحماية العمولة (5%)
ALTER TABLE IF EXISTS public.auctions 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'YER',
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS net_seller_amount NUMERIC(15,2);

-- 5. إعدادات العقارات وإخفاء وسائل التواصل
ALTER TABLE IF EXISTS public.real_estate 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'YER',
ADD COLUMN IF NOT EXISTS is_contact_hidden BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_commission_hidden_from_seller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(15,2) DEFAULT 0.00;

-- 6. تفعيل RLS للأمان وحماية العمولات
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to audit logs" 
ON public.admin_audit_logs 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('super_admin', 'general_admin', 'financial_auditor')
    )
);
