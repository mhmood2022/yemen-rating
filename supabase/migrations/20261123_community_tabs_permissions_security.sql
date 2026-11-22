-- ============================================================================
-- Yemen Rating: Security Hardening for Community Tabs Permissions & Settings
-- Safe & Idempotent
-- ============================================================================

-- 1. إزالة أي سياسة قديمة غير آمنة على platform_settings إن وجدت
DROP POLICY IF EXISTS "Admins manage community_sections" ON public.platform_settings;

-- 2. تقييد القراءة العامة في platform_settings بحيث لا تكشف أي مفاتيح صلاحيات حساسة
DROP POLICY IF EXISTS "Public read platform_settings" ON public.platform_settings;
CREATE POLICY "Public read platform_settings" ON public.platform_settings
  FOR SELECT USING (key <> 'community_tabs_permissions' OR public.is_admin());

-- 3. جدول مستقل محمي لصلاحيات مشرفي تبويبات المجتمع
CREATE TABLE IF NOT EXISTS public.community_tabs_permissions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_tabs_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tabs_perms_select_self_or_admin" ON public.community_tabs_permissions;
CREATE POLICY "tabs_perms_select_self_or_admin" ON public.community_tabs_permissions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "tabs_perms_admin_manage" ON public.community_tabs_permissions;
CREATE POLICY "tabs_perms_admin_manage" ON public.community_tabs_permissions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
