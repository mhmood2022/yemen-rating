-- ============================================================================
-- Yemen Rating: Accounts Management & X-like Pages Management Migration
-- Safe & Idempotent (Zero data loss, Zero legacy claim dependency)
-- ============================================================================

-- 1. توسيع جدول profiles دون كسر قيود profiles_account_type_chk / profiles_status_chk
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_kind text DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS can_post boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS can_interact boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS suspended_until timestamptz,
  ADD COLUMN IF NOT EXISTS restriction_reason text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_reason text,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_profile_kind_chk') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_profile_kind_chk
      CHECK (profile_kind IN ('personal', 'business_owner', 'businessman'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_moderation_status_chk') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_moderation_status_chk
      CHECK (moderation_status IN ('active', 'restricted', 'suspended', 'banned'));
  END IF;
END $$;

-- مزامنة أولية آمنة للحسابات الحالية
UPDATE public.profiles p
SET profile_kind = 'business_owner'
WHERE p.profile_kind = 'personal'
  AND (
    p.account_type = 'owner'
    OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.owner_id = p.id)
  );

UPDATE public.profiles
SET moderation_status = CASE
  WHEN COALESCE(is_blocked, false) = true THEN 'banned'
  WHEN status = 'suspended' THEN 'suspended'
  WHEN status = 'disabled' THEN 'banned'
  ELSE COALESCE(moderation_status, 'active')
END
WHERE moderation_status IS NULL OR moderation_status = 'active';

-- 2. توسيع جدول businesses لصفحات النظام الجديد الشبيهة بـ X (مع عزل الصفحات القديمة)
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_x_page boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS page_kind text DEFAULT 'business',
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_page_kind_chk') THEN
    ALTER TABLE public.businesses
      ADD CONSTRAINT businesses_page_kind_chk
      CHECK (page_kind IN ('business', 'company', 'businessman'));
  END IF;
END $$;

-- تمييز الصفحات الجديدة المربوطة بحسابات شخصية فقط (دون الصفحات القديمة غير المربوطة)
UPDATE public.businesses
SET is_x_page = true
WHERE owner_id IS NOT NULL AND is_x_page = false;

UPDATE public.businesses
SET page_kind = CASE
  WHEN business_type = 'COMPANY' THEN 'company'
  ELSE COALESCE(page_kind, 'business')
END
WHERE page_kind IS NULL;

-- 3. توسيع جدول reviews لإخفاء التقييمات المخالفة مع توثيق السبب دون تعديل التقييم نفسه
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_reason text,
  ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

-- 4. حقول ربط اختيارية للاشتراكات والإعلانات بالصفحات والحسابات
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_cycle text;

ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL;

ALTER TABLE public.published_ads
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL;

-- 5. جدول المسؤولين المفوضين لإدارة الصفحات
CREATE TABLE IF NOT EXISTS public.page_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'moderator')),
  permissions jsonb NOT NULL DEFAULT '{"can_post": true, "can_reply_reviews": true, "can_edit_info": false, "can_manage_ads": false}'::jsonb,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);

-- 6. سجل تغييرات ملكية الصفحات (نقل الملكية / تعيين / معالجة فقدان المالك)
CREATE TABLE IF NOT EXISTS public.page_ownership_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  previous_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  new_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('initial', 'transfer', 'admin_assign', 'owner_lost_recovery', 'owner_removed')),
  reason text NOT NULL,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.page_ownership_history (business_id, previous_owner_id, new_owner_id, action_type, reason, performed_by_email)
SELECT b.id, NULL, b.owner_id, 'initial', 'تسجيل المالك الأساسي الأولي للصفحة', 'system'
FROM public.businesses b
WHERE b.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.page_ownership_history h WHERE h.business_id = b.id
  );

-- 7. طلبات نقل الملكية / استعادة صفحة مفقود مالكها (تخضع لاعتماد الإدارة فقط)
CREATE TABLE IF NOT EXISTS public.page_transfer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_kind text NOT NULL DEFAULT 'transfer' CHECK (request_kind IN ('transfer', 'owner_recovery')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. سجل التدقيق الإداري غير القابل للتعديل أو الحذف من المستخدم العادي
CREATE TABLE IF NOT EXISTS public.admin_moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text NOT NULL,
  actor_email text,
  target_type text NOT NULL CHECK (target_type IN ('account', 'page', 'post', 'review', 'ad', 'subscription', 'report', 'support')),
  target_id text NOT NULL,
  target_name text,
  action_type text NOT NULL,
  reason text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_mod_logs_target ON public.admin_moderation_logs(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_admins_business ON public.page_admins(business_id);
CREATE INDEX IF NOT EXISTS idx_page_admins_user ON public.page_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_page_ownership_history_biz ON public.page_ownership_history(business_id, created_at DESC);

-- 9. تفعيل RLS على الجداول الجديدة
ALTER TABLE public.page_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_moderation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "page_admins_admin_all" ON public.page_admins;
CREATE POLICY "page_admins_admin_all" ON public.page_admins
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "page_admins_read_related" ON public.page_admins;
CREATE POLICY "page_admins_read_related" ON public.page_admins
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "page_ownership_history_admin_select" ON public.page_ownership_history;
CREATE POLICY "page_ownership_history_admin_select" ON public.page_ownership_history
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "page_ownership_history_admin_insert" ON public.page_ownership_history;
CREATE POLICY "page_ownership_history_admin_insert" ON public.page_ownership_history
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "page_transfer_requests_admin_all" ON public.page_transfer_requests;
CREATE POLICY "page_transfer_requests_admin_all" ON public.page_transfer_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_moderation_logs_admin_select" ON public.admin_moderation_logs;
CREATE POLICY "admin_moderation_logs_admin_select" ON public.admin_moderation_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin_moderation_logs_admin_insert" ON public.admin_moderation_logs;
CREATE POLICY "admin_moderation_logs_admin_insert" ON public.admin_moderation_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================================
-- 10. دوال RPC محمية على الخادم للإجراءات الإدارية الحساسة
-- ============================================================================

CREATE OR REPLACE FUNCTION public._assert_admin_actor()
RETURNS TABLE(actor_uid uuid, actor_name text, actor_email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_name text;
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'غير مصرح: هذه العملية تتطلب صلاحيات مشرف معتمد عبر جلسة Supabase النشطة';
  END IF;

  SELECT p.email, p.full_name INTO v_email, v_name
  FROM public.profiles p WHERE p.id = v_uid;

  actor_uid := v_uid;
  actor_email := COALESCE(v_email, auth.jwt() ->> 'email', 'admin');
  actor_name := COALESCE(v_name, actor_email, 'مشرف النظام');
  RETURN NEXT;
END;
$$;

-- أ) تحديث ومراقبة الحساب الشخصي
CREATE OR REPLACE FUNCTION public.admin_moderate_account(
  p_user_id uuid,
  p_action text,
  p_reason text,
  p_profile_kind text DEFAULT NULL,
  p_full_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_suspended_until timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_old public.profiles%ROWTYPE;
  v_new public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب كتابة سبب الإجراء الإداري';
  END IF;

  SELECT * INTO v_old FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الحساب غير موجود'; END IF;

  IF p_action = 'edit_info' THEN
    UPDATE public.profiles SET
      full_name = COALESCE(NULLIF(trim(p_full_name), ''), full_name),
      phone = COALESCE(p_phone, phone),
      city = COALESCE(p_city, city),
      bio = COALESCE(p_bio, bio),
      profile_kind = COALESCE(p_profile_kind, profile_kind),
      updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_action = 'change_kind' THEN
    UPDATE public.profiles SET
      profile_kind = p_profile_kind,
      account_type = CASE WHEN p_profile_kind IN ('business_owner', 'businessman') THEN 'owner' ELSE account_type END,
      updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_action = 'restrict_posting' THEN
    UPDATE public.profiles SET
      moderation_status = 'restricted',
      can_post = false,
      restriction_reason = trim(p_reason),
      updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_action = 'restrict_interactions' THEN
    UPDATE public.profiles SET
      moderation_status = 'restricted',
      can_interact = false,
      restriction_reason = trim(p_reason),
      updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_action = 'suspend' THEN
    UPDATE public.profiles SET
      moderation_status = 'suspended',
      status = 'suspended',
      can_post = false,
      can_interact = false,
      suspended_until = p_suspended_until,
      restriction_reason = trim(p_reason),
      updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_action = 'ban' THEN
    UPDATE public.profiles SET
      moderation_status = 'banned',
      status = 'disabled',
      is_blocked = true,
      can_post = false,
      can_interact = false,
      restriction_reason = trim(p_reason),
      updated_at = now()
    WHERE id = p_user_id;
  ELSIF p_action IN ('activate', 'unban', 'lift_suspension', 'warn') THEN
    IF p_action <> 'warn' THEN
      UPDATE public.profiles SET
        moderation_status = 'active',
        status = 'active',
        is_blocked = false,
        can_post = true,
        can_interact = true,
        suspended_until = NULL,
        restriction_reason = NULL,
        updated_at = now()
      WHERE id = p_user_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'نوع إجراء غير معروف: %', p_action;
  END IF;

  SELECT * INTO v_new FROM public.profiles WHERE id = p_user_id;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, old_value, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'account', p_user_id::text, COALESCE(v_new.full_name, v_new.username),
    p_action, trim(p_reason),
    jsonb_build_object('moderation_status', v_old.moderation_status, 'status', v_old.status, 'is_blocked', v_old.is_blocked, 'can_post', v_old.can_post, 'can_interact', v_old.can_interact, 'profile_kind', v_old.profile_kind),
    jsonb_build_object('moderation_status', v_new.moderation_status, 'status', v_new.status, 'is_blocked', v_new.is_blocked, 'can_post', v_new.can_post, 'can_interact', v_new.can_interact, 'profile_kind', v_new.profile_kind)
  );

  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, old_value, new_value)
  VALUES (
    v_actor.actor_uid, p_action, 'profiles', p_user_id::text,
    jsonb_build_object('status', v_old.moderation_status),
    jsonb_build_object('status', v_new.moderation_status, 'reason', trim(p_reason))
  );

  RETURN to_jsonb(v_new);
END;
$$;

-- ب) توثيق الحساب الشخصي (منح / سحب / تجديد)
CREATE OR REPLACE FUNCTION public.admin_verify_account(
  p_user_id uuid,
  p_badge_type text,
  p_reason text,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_old public.profiles%ROWTYPE;
  v_new public.profiles%ROWTYPE;
  v_is_verified boolean := (p_badge_type IS NOT NULL AND p_badge_type <> 'none');
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب إدخال سبب منح أو سحب التوثيق';
  END IF;

  SELECT * INTO v_old FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الحساب غير موجود'; END IF;

  UPDATE public.profiles SET
    is_verified = v_is_verified,
    verification_type = CASE WHEN v_is_verified THEN p_badge_type ELSE NULL END,
    verified_at = CASE WHEN v_is_verified THEN now() ELSE NULL END,
    verification_expires_at = CASE WHEN v_is_verified THEN p_expires_at ELSE NULL END,
    verification_reason = trim(p_reason),
    verified_by = v_actor.actor_uid,
    updated_at = now()
  WHERE id = p_user_id;

  SELECT * INTO v_new FROM public.profiles WHERE id = p_user_id;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, old_value, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'account', p_user_id::text, COALESCE(v_new.full_name, v_new.username),
    CASE WHEN v_is_verified THEN 'grant_verification' ELSE 'revoke_verification' END,
    trim(p_reason),
    jsonb_build_object('is_verified', v_old.is_verified, 'verification_type', v_old.verification_type),
    jsonb_build_object('is_verified', v_new.is_verified, 'verification_type', v_new.verification_type, 'expires_at', p_expires_at)
  );

  RETURN to_jsonb(v_new);
END;
$$;

-- ج) إدارة ومراقبة الصفحة العامة
CREATE OR REPLACE FUNCTION public.admin_moderate_page(
  p_business_id uuid,
  p_action text,
  p_reason text,
  p_name text DEFAULT NULL,
  p_slug text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_page_kind text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_old public.businesses%ROWTYPE;
  v_new public.businesses%ROWTYPE;
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب كتابة سبب الإجراء الإداري';
  END IF;

  SELECT * INTO v_old FROM public.businesses WHERE id = p_business_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الصفحة غير موجودة'; END IF;

  IF p_action = 'edit_info' THEN
    UPDATE public.businesses SET
      name = COALESCE(NULLIF(trim(p_name), ''), name),
      slug = COALESCE(NULLIF(trim(p_slug), ''), slug),
      city = COALESCE(p_city, city),
      phone = COALESCE(p_phone, phone),
      description = COALESCE(p_description, description),
      page_kind = COALESCE(p_page_kind, page_kind),
      updated_at = now()
    WHERE id = p_business_id;
  ELSIF p_action = 'hide' THEN
    UPDATE public.businesses SET is_hidden = true, status = 'hidden', updated_at = now() WHERE id = p_business_id;
  ELSIF p_action = 'unhide' THEN
    UPDATE public.businesses SET is_hidden = false, status = 'active', is_active = true, updated_at = now() WHERE id = p_business_id;
  ELSIF p_action = 'suspend' THEN
    UPDATE public.businesses SET is_active = false, status = 'suspended', suspension_reason = trim(p_reason), updated_at = now() WHERE id = p_business_id;
  ELSIF p_action = 'pending' THEN
    UPDATE public.businesses SET status = 'pending', updated_at = now() WHERE id = p_business_id;
  ELSIF p_action = 'activate' THEN
    UPDATE public.businesses SET is_active = true, is_hidden = false, status = 'active', suspension_reason = NULL, updated_at = now() WHERE id = p_business_id;
  ELSE
    RAISE EXCEPTION 'إجراء غير معروف: %', p_action;
  END IF;

  SELECT * INTO v_new FROM public.businesses WHERE id = p_business_id;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, old_value, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'page', p_business_id::text, v_new.name,
    p_action, trim(p_reason),
    jsonb_build_object('status', v_old.status, 'is_active', v_old.is_active, 'is_hidden', v_old.is_hidden, 'page_kind', v_old.page_kind),
    jsonb_build_object('status', v_new.status, 'is_active', v_new.is_active, 'is_hidden', v_new.is_hidden, 'page_kind', v_new.page_kind)
  );

  RETURN to_jsonb(v_new);
END;
$$;

-- د) توثيق الصفحة (ذهبي للمنشآت / فضي لرجال الأعمال / بدون)
CREATE OR REPLACE FUNCTION public.admin_verify_page(
  p_business_id uuid,
  p_badge_type text,
  p_reason text,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_old public.businesses%ROWTYPE;
  v_new public.businesses%ROWTYPE;
  v_is_verified boolean := (p_badge_type IS NOT NULL AND p_badge_type <> 'none');
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب كتابة سبب منح أو سحب توثيق الصفحة';
  END IF;

  SELECT * INTO v_old FROM public.businesses WHERE id = p_business_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الصفحة غير موجودة'; END IF;

  UPDATE public.businesses SET
    is_verified = v_is_verified,
    badge_type = CASE WHEN v_is_verified THEN p_badge_type ELSE 'none' END,
    verified_at = CASE WHEN v_is_verified THEN now() ELSE NULL END,
    verification_expires_at = CASE WHEN v_is_verified THEN p_expires_at ELSE NULL END,
    verification_reason = trim(p_reason),
    verified_by_user_id = v_actor.actor_uid,
    updated_at = now()
  WHERE id = p_business_id;

  SELECT * INTO v_new FROM public.businesses WHERE id = p_business_id;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, old_value, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'page', p_business_id::text, v_new.name,
    CASE WHEN v_is_verified THEN 'grant_page_verification' ELSE 'revoke_page_verification' END,
    trim(p_reason),
    jsonb_build_object('is_verified', v_old.is_verified, 'badge_type', v_old.badge_type),
    jsonb_build_object('is_verified', v_new.is_verified, 'badge_type', v_new.badge_type, 'expires_at', p_expires_at)
  );

  RETURN to_jsonb(v_new);
END;
$$;

-- هـ) نقل ملكية الصفحة أو استعادتها عند فقدان المالك
CREATE OR REPLACE FUNCTION public.admin_transfer_page_ownership(
  p_business_id uuid,
  p_new_owner_id uuid,
  p_action_type text,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_old_biz public.businesses%ROWTYPE;
  v_new_biz public.businesses%ROWTYPE;
  v_prev_owner uuid;
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب كتابة سبب نقل أو تعيين الملكية';
  END IF;

  SELECT * INTO v_old_biz FROM public.businesses WHERE id = p_business_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الصفحة غير موجودة'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_new_owner_id) THEN
    RAISE EXCEPTION 'الحساب الشخصي الجديد غير موجود';
  END IF;

  v_prev_owner := v_old_biz.owner_id;

  UPDATE public.businesses SET
    owner_id = p_new_owner_id,
    is_x_page = true,
    updated_at = now()
  WHERE id = p_business_id;

  UPDATE public.profiles SET
    account_type = 'owner',
    profile_kind = CASE WHEN profile_kind = 'personal' THEN 'business_owner' ELSE profile_kind END,
    updated_at = now()
  WHERE id = p_new_owner_id;

  INSERT INTO public.page_ownership_history (
    business_id, previous_owner_id, new_owner_id, action_type, reason, performed_by, performed_by_email
  ) VALUES (
    p_business_id, v_prev_owner, p_new_owner_id, p_action_type, trim(p_reason), v_actor.actor_uid, v_actor.actor_email
  );

  SELECT * INTO v_new_biz FROM public.businesses WHERE id = p_business_id;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, old_value, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'page', p_business_id::text, v_new_biz.name,
    'ownership_' || p_action_type, trim(p_reason),
    jsonb_build_object('owner_id', v_prev_owner),
    jsonb_build_object('owner_id', p_new_owner_id)
  );

  RETURN to_jsonb(v_new_biz);
END;
$$;

-- و) إدارة مسؤولي الصفحة المفوضين
CREATE OR REPLACE FUNCTION public.admin_manage_page_admin(
  p_business_id uuid,
  p_user_id uuid,
  p_operation text,
  p_role text DEFAULT 'admin',
  p_reason text DEFAULT 'تحديث إدارة الصفحة'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_biz_name text;
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  SELECT name INTO v_biz_name FROM public.businesses WHERE id = p_business_id;

  IF p_operation = 'remove' THEN
    DELETE FROM public.page_admins WHERE business_id = p_business_id AND user_id = p_user_id;
  ELSE
    INSERT INTO public.page_admins (business_id, user_id, role, assigned_by, is_active)
    VALUES (p_business_id, p_user_id, p_role, v_actor.actor_uid, true)
    ON CONFLICT (business_id, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      is_active = true,
      assigned_by = v_actor.actor_uid,
      updated_at = now();
  END IF;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'page', p_business_id::text, v_biz_name,
    CASE WHEN p_operation = 'remove' THEN 'remove_page_admin' ELSE 'assign_page_admin' END,
    COALESCE(NULLIF(trim(p_reason), ''), 'تعديل مسؤول مفوض'),
    jsonb_build_object('user_id', p_user_id, 'role', p_role)
  );
END;
$$;

-- ز) إخفاء / استعادة تقييم مخالف مع التوثيق دون تعديل نصه أو نجومه
CREATE OR REPLACE FUNCTION public.admin_moderate_review(
  p_review_id uuid,
  p_hide boolean,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_rev public.reviews%ROWTYPE;
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب كتابة سبب إخفاء أو استعادة التقييم';
  END IF;

  SELECT * INTO v_rev FROM public.reviews WHERE id = p_review_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'التقييم غير موجود'; END IF;

  UPDATE public.reviews SET
    is_hidden = p_hide,
    moderation_reason = trim(p_reason),
    moderated_by = v_actor.actor_uid,
    moderated_at = now()
  WHERE id = p_review_id;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, old_value, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'review', p_review_id::text, COALESCE(v_rev.user_name, 'مراجعة'),
    CASE WHEN p_hide THEN 'hide_review' ELSE 'restore_review' END,
    trim(p_reason),
    jsonb_build_object('is_hidden', v_rev.is_hidden),
    jsonb_build_object('is_hidden', p_hide)
  );
END;
$$;

-- ح) إدارة الاشتراك (تفعيل / إيقاف / إلغاء) مع تسجيل التدقيق
CREATE OR REPLACE FUNCTION public.admin_manage_subscription(
  p_action text, -- 'activate', 'cancel', 'expire'
  p_reason text,
  p_subscription_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL,
  p_business_id uuid DEFAULT NULL,
  p_plan_id uuid DEFAULT NULL,
  p_duration_days integer DEFAULT 30
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_sub_id uuid := p_subscription_id;
  v_end timestamptz := now() + make_interval(days => GREATEST(1, COALESCE(p_duration_days, 30)));
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب كتابة سبب إجراء الاشتراك';
  END IF;

  IF p_action = 'activate' THEN
    IF v_sub_id IS NOT NULL THEN
      UPDATE public.subscriptions SET
        status = 'ACTIVE',
        start_date = COALESCE(start_date, now()),
        end_date = v_end,
        granted_by = v_actor.actor_uid,
        notes = trim(p_reason),
        updated_at = now()
      WHERE id = v_sub_id;
    ELSE
      INSERT INTO public.subscriptions (
        user_id, business_id, plan_id, status, start_date, end_date, source, granted_by, amount_paid, notes, billing_cycle
      ) VALUES (
        p_user_id, p_business_id, p_plan_id, 'ACTIVE', now(), v_end, 'admin_grant', v_actor.actor_uid, 0, trim(p_reason),
        CASE WHEN COALESCE(p_duration_days, 30) >= 300 THEN 'yearly' ELSE 'monthly' END
      ) RETURNING id INTO v_sub_id;
    END IF;
  ELSIF p_action IN ('cancel', 'expire') THEN
    UPDATE public.subscriptions SET
      status = CASE WHEN p_action = 'cancel' THEN 'CANCELLED' ELSE 'EXPIRED' END,
      notes = trim(p_reason),
      updated_at = now()
    WHERE id = v_sub_id;
  ELSE
    RAISE EXCEPTION 'إجراء اشتراك غير معروف: %', p_action;
  END IF;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'subscription', COALESCE(v_sub_id::text, COALESCE(p_user_id::text, p_business_id::text)), 'اشتراك',
    'subscription_' || p_action, trim(p_reason),
    jsonb_build_object('user_id', p_user_id, 'business_id', p_business_id, 'plan_id', p_plan_id, 'duration_days', p_duration_days)
  );

  RETURN v_sub_id;
END;
$$;

-- ط) إخفاء / استعادة منشور مخالف مع تسجيل السبب
CREATE OR REPLACE FUNCTION public.admin_moderate_post(
  p_post_id uuid,
  p_hide boolean,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
  v_post public.posts%ROWTYPE;
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب كتابة سبب إخفاء أو استعادة المنشور';
  END IF;

  SELECT * INTO v_post FROM public.posts WHERE id = p_post_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'المنشور غير موجود'; END IF;

  UPDATE public.posts SET
    is_hidden = p_hide,
    status = CASE WHEN p_hide THEN 'hidden' ELSE 'active' END,
    updated_at = now()
  WHERE id = p_post_id;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, old_value, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'post', p_post_id::text, left(COALESCE(v_post.content, 'منشور'), 60),
    CASE WHEN p_hide THEN 'hide_post' ELSE 'restore_post' END,
    trim(p_reason),
    jsonb_build_object('is_hidden', v_post.is_hidden),
    jsonb_build_object('is_hidden', p_hide)
  );
END;
$$;

-- ي) إيقاف أو تفعيل إعلان (من ads أو published_ads)
CREATE OR REPLACE FUNCTION public.admin_moderate_ad(
  p_source_table text, -- 'ads' | 'published_ads'
  p_ad_id text,
  p_action text, -- 'pause' | 'activate'
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor record;
BEGIN
  SELECT * INTO v_actor FROM public._assert_admin_actor();
  IF COALESCE(trim(p_reason), '') = '' THEN
    RAISE EXCEPTION 'يجب كتابة سبب إجراء الإعلان';
  END IF;

  IF p_source_table = 'ads' THEN
    UPDATE public.ads SET
      status = CASE WHEN p_action = 'pause' THEN 'paused' ELSE 'published' END,
      updated_at = now()
    WHERE id = p_ad_id::uuid;
  ELSIF p_source_table = 'published_ads' THEN
    UPDATE public.published_ads SET
      status = CASE WHEN p_action = 'pause' THEN 'paused' ELSE 'active' END,
      updated_at = now()
    WHERE id = p_ad_id;
  ELSE
    RAISE EXCEPTION 'جدول إعلانات غير معروف';
  END IF;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'ad', p_ad_id, p_source_table,
    'ad_' || p_action, trim(p_reason)
  );
END;
$$;
