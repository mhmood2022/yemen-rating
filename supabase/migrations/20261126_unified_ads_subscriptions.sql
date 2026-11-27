-- ============================================================================
-- نظام الاشتراكات الإعلانية الموحد والتسعير المركزي والحجوزات - يمن ريتنج
-- آمن: لا يحذف ولا يغيّر أي بيانات قائمة في published_ads أو subscription_plans
-- ============================================================================

-- 1) باقات الإعلانات للأنواع الثلاثة (سوق الهاتف، الراعي، البانر)
CREATE TABLE IF NOT EXISTS public.ad_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('phone_feed', 'sponsor', 'banner')),
  tier_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_days INTEGER NOT NULL DEFAULT 30 CHECK (duration_days > 0),
  post_quota INTEGER NOT NULL DEFAULT 0 CHECK (post_quota >= 0),
  highlight_quota INTEGER NOT NULL DEFAULT 0 CHECK (highlight_quota >= 0),
  default_price_yer NUMERIC NOT NULL DEFAULT 0 CHECK (default_price_yer >= 0),
  default_price_usd NUMERIC NOT NULL DEFAULT 0 CHECK (default_price_usd >= 0),
  previous_price_yer NUMERIC,
  previous_price_usd NUMERIC,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  discount_percent NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount_yer NUMERIC NOT NULL DEFAULT 0 CHECK (discount_amount_yer >= 0),
  promo_starts_at TIMESTAMPTZ,
  promo_ends_at TIMESTAMPTZ,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  visual_tier TEXT NOT NULL DEFAULT 'basic',
  is_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
  allow_rotation BOOLEAN NOT NULL DEFAULT TRUE,
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) تسعير مخصص حسب القسم والمساحة الإعلانية
CREATE TABLE IF NOT EXISTS public.ad_section_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.ad_packages(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('phone_feed', 'sponsor', 'banner')),
  section_id TEXT NOT NULL,
  slot_key TEXT NOT NULL DEFAULT 'all',
  price_yer NUMERIC NOT NULL DEFAULT 0 CHECK (price_yer >= 0),
  price_usd NUMERIC NOT NULL DEFAULT 0 CHECK (price_usd >= 0),
  previous_price_yer NUMERIC,
  previous_price_usd NUMERIC,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  discount_percent NUMERIC NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount_yer NUMERIC NOT NULL DEFAULT 0 CHECK (discount_amount_yer >= 0),
  promo_starts_at TIMESTAMPTZ,
  promo_ends_at TIMESTAMPTZ,
  allow_rotation BOOLEAN,
  is_exclusive BOOLEAN,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (package_id, section_id, slot_key)
);

-- 3) طلبات الاشتراكات الإعلانية الموحدة والحجوزات ولقطات الأسعار
CREATE TABLE IF NOT EXISTS public.ad_subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('phone_feed', 'sponsor', 'banner')),
  package_id UUID NOT NULL REFERENCES public.ad_packages(id),
  section_id TEXT NOT NULL DEFAULT 'phones',
  slot_key TEXT NOT NULL DEFAULT 'all',
  package_name_snapshot TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  post_quota INTEGER NOT NULL DEFAULT 0,
  highlight_quota INTEGER NOT NULL DEFAULT 0,
  remaining_posts INTEGER NOT NULL DEFAULT 0,
  remaining_highlights INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'YER' CHECK (currency IN ('YER', 'USD')),
  base_price NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  final_price NUMERIC NOT NULL DEFAULT 0,
  is_free_order BOOLEAN NOT NULL DEFAULT FALSE,
  pricing_source TEXT NOT NULL DEFAULT 'package_default',
  ad_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
    status IN (
      'draft',
      'pending_payment',
      'pending_review',
      'approved',
      'rejected',
      'active',
      'expired',
      'cancelled'
    )
  ),
  payment_method_id UUID REFERENCES public.payment_methods(id),
  payment_method_name TEXT,
  payment_reference TEXT,
  payment_proof_url TEXT,
  payment_proof_hash TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  published_ad_id TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4) إعلانات سوق الهاتف المميزة المنشورة سحابياً والمربوطة بالاشتراك
CREATE TABLE IF NOT EXISTS public.phone_ad_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ad_subscription_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID,
  ad_tier TEXT NOT NULL DEFAULT 'basic' CHECK (ad_tier IN ('basic', 'pro', 'vip')),
  is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  item_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'expired', 'rejected')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5) سجل تغييرات الأسعار والباقات
CREATE TABLE IF NOT EXISTS public.ad_pricing_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  admin_name TEXT,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_packages_type_active ON public.ad_packages (ad_type, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_ad_section_pricing_lookup ON public.ad_section_pricing (package_id, section_id, slot_key);
CREATE INDEX IF NOT EXISTS idx_ad_orders_user_status ON public.ad_subscription_orders (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_orders_slot_dates ON public.ad_subscription_orders (ad_type, section_id, slot_key, status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_phone_ad_posts_active ON public.phone_ad_posts (status, ends_at DESC, created_at DESC);

-- ============================================================================
-- بيانات الباقات الابتدائية (قابلة للتعديل الكامل من لوحة الإدارة)
-- ============================================================================
INSERT INTO public.ad_packages (
  code, ad_type, tier_key, name, description,
  duration_days, post_quota, highlight_quota,
  default_price_yer, default_price_usd, features,
  visual_tier, is_exclusive, allow_rotation, sort_order
)
VALUES
  -- 1. سوق الهاتف
  ('phone_starter', 'phone_feed', 'starter', 'باقة البداية', 'مثالية للتجربة ونشر عروض الهواتف المميزة', 7, 5, 0, 3000, 5, '["5 منشورات مميزة في سوق الهاتف", "صلاحية لمدة 7 أيام", "ظهور ببطاقة إعلانية واضحة", "بيانات تواصل مباشرة"]'::jsonb, 'basic', FALSE, TRUE, 1),
  ('phone_trader', 'phone_feed', 'trader', 'باقة التاجر', 'مخصصة لتجار الهواتف والمحلات النشطة', 30, 15, 3, 10000, 18, '["15 منشوراً مميزاً في سوق الهاتف", "3 مرات إبراز متقدم للمنشورات", "صلاحية لمدة 30 يوماً", "إشارة إعلانية احترافية"]'::jsonb, 'basic', FALSE, TRUE, 2),
  ('phone_pro', 'phone_feed', 'pro', 'باقة المحترف', 'إطار ذهبي وظهور مضاعف وسط المجتمع', 30, 30, 10, 20000, 35, '["30 منشوراً مميزاً في سوق الهاتف", "10 مرات إبراز بإطار ذهبي احترافي", "صلاحية لمدة 30 يوماً", "أولوية ظهور في البحث والمنشورات"]'::jsonb, 'pro', FALSE, TRUE, 3),
  ('phone_vip', 'phone_feed', 'vip', 'باقة VIP', 'أعلى باقة لتغطية كاملة وظهور في رأس السوق', 30, 60, 25, 35000, 60, '["60 منشوراً مميزاً في سوق الهاتف", "25 مرة إبراز VIP في رأس السوق", "صلاحية لمدة 30 يوماً", "تمييز بصري كامل وتفاصيل متقدمة"]'::jsonb, 'vip', FALSE, TRUE, 4),

  -- 2. إعلانات الراعي
  ('sponsor_weekly', 'sponsor', 'weekly', 'راعي أسبوعي', 'رعاية القسم لمدة 7 أيام بشعارك واسم منشأتك', 7, 0, 0, 15000, 25, '["ظهور شعار واسم الراعي في رأس القسم", "عبارة هذا القسم برعاية", "رابط مباشر لصفحة المنشأة", "مدة 7 أيام"]'::jsonb, 'weekly', FALSE, TRUE, 1),
  ('sponsor_monthly', 'sponsor', 'monthly', 'راعي شهري', 'حضور مستمر في القسم لمدة شهر كامل', 30, 0, 0, 45000, 75, '["ظهور طوال 30 يوماً في رأس القسم", "ربط مباشر بصفحة المنشأة", "إحصائيات مشاهدات ونقرات", "أولوية متوازنة"]'::jsonb, 'monthly', FALSE, TRUE, 2),
  ('sponsor_featured', 'sponsor', 'featured', 'راعي مميز', 'أولوية ظهور مضاعفة وتمييز بصري للراعي', 30, 0, 0, 70000, 115, '["أولوية ظهور مرتفعة (3x)", "شارة الراعي الذهبي", "تصميم مميز مع زر إجراء مباشر", "مدة 30 يوماً"]'::jsonb, 'featured', FALSE, TRUE, 3),
  ('sponsor_exclusive', 'sponsor', 'exclusive', 'راعي حصري', 'راعٍ رئيسي حصري للقسم طوال مدة الاشتراك', 30, 0, 0, 120000, 200, '["رعاية حصرية 100% للقسم بدون منافس", "منع الحجوزات المتعارضة طوال الفترة", "أولوية قصوى وشعار رسمي", "مدة 30 يوماً"]'::jsonb, 'exclusive', TRUE, FALSE, 4),

  -- 3. إعلانات البانر
  ('banner_weekly', 'banner', 'weekly', 'بانر أسبوعي', 'حجز مساحة بانر مصورة لمدة 7 أيام', 7, 0, 0, 12000, 20, '["ظهور بانر مصور في المساحة المحددة", "معاينة قبل الإرسال", "تتبع المشاهدات والنقرات", "مدة 7 أيام"]'::jsonb, 'standard', FALSE, TRUE, 1),
  ('banner_monthly', 'banner', 'monthly', 'بانر شهري', 'حجز مساحة بانر مصورة لمدة 30 يوماً', 30, 0, 0, 35000, 60, '["ظهور مستمر لمدة 30 يوماً", "اختيار المساحة الأولى أو الثانية", "إحصائيات مشاهدات ونقرات دقيقة", "متوافق مع الجوال"]'::jsonb, 'standard', FALSE, TRUE, 2),
  ('banner_featured', 'banner', 'featured', 'بانر مميز (حجز ثابت)', 'حجز مخصص للمساحة بأولوية عالية لمدة 30 يوماً', 30, 0, 0, 55000, 90, '["أولوية عرض مرتفعة في المساحة", "حجز مخصص يمنع التعارض إذا توقف التدوير", "رابط مباشر للمنشأة أو العرض", "مدة 30 يوماً"]'::jsonb, 'featured', TRUE, FALSE, 3),
  ('banner_quarterly', 'banner', 'quarterly', 'بانر ربع سنوي', 'تغطية إعلانية ممتدة لمدة 90 يوماً بأفضل سعر', 90, 0, 0, 90000, 150, '["ظهور لمدة 90 يوماً متواصلة", "توفير كبير مقارنة بالشهري", "تقارير أداء مستمرة", "دعم فني مخصص"]'::jsonb, 'featured', FALSE, TRUE, 4)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE public.ad_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_section_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_ad_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_pricing_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_packages_read_active_or_admin" ON public.ad_packages;
CREATE POLICY "ad_packages_read_active_or_admin" ON public.ad_packages
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "ad_packages_admin_all" ON public.ad_packages;
CREATE POLICY "ad_packages_admin_all" ON public.ad_packages
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ad_section_pricing_read_active_or_admin" ON public.ad_section_pricing;
CREATE POLICY "ad_section_pricing_read_active_or_admin" ON public.ad_section_pricing
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "ad_section_pricing_admin_all" ON public.ad_section_pricing;
CREATE POLICY "ad_section_pricing_admin_all" ON public.ad_section_pricing
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ad_orders_read_own_or_admin" ON public.ad_subscription_orders;
CREATE POLICY "ad_orders_read_own_or_admin" ON public.ad_subscription_orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "ad_orders_admin_all" ON public.ad_subscription_orders;
CREATE POLICY "ad_orders_admin_all" ON public.ad_subscription_orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "phone_ad_posts_public_read" ON public.phone_ad_posts;
CREATE POLICY "phone_ad_posts_public_read" ON public.phone_ad_posts
  FOR SELECT USING (
    (status = 'active' AND ends_at >= NOW())
    OR auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "phone_ad_posts_admin_all" ON public.phone_ad_posts;
CREATE POLICY "phone_ad_posts_admin_all" ON public.phone_ad_posts
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "ad_pricing_audit_logs_admin_only" ON public.ad_pricing_audit_logs;
CREATE POLICY "ad_pricing_audit_logs_admin_only" ON public.ad_pricing_audit_logs
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- دالة 1: حساب التسعير الحقيقي من قاعدة البيانات (حماية كاملة ضد التلاعب)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_ad_order_quote(
  p_package_id UUID,
  p_section_id TEXT DEFAULT 'phones',
  p_slot_key TEXT DEFAULT 'all',
  p_currency TEXT DEFAULT 'YER'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pkg public.ad_packages%ROWTYPE;
  v_custom public.ad_section_pricing%ROWTYPE;
  v_has_custom BOOLEAN := FALSE;
  v_currency TEXT := CASE WHEN UPPER(COALESCE(p_currency, 'YER')) = 'USD' THEN 'USD' ELSE 'YER' END;
  v_base_price NUMERIC := 0;
  v_is_free BOOLEAN := FALSE;
  v_disc_pct NUMERIC := 0;
  v_disc_amt NUMERIC := 0;
  v_promo_start TIMESTAMPTZ;
  v_promo_end TIMESTAMPTZ;
  v_promo_active BOOLEAN := TRUE;
  v_total_discount NUMERIC := 0;
  v_final_price NUMERIC := 0;
  v_is_exclusive BOOLEAN := FALSE;
  v_allow_rotation BOOLEAN := TRUE;
  v_norm_section TEXT := CASE WHEN p_section_id = 'properties' THEN 'realestate' ELSE COALESCE(NULLIF(p_section_id, ''), 'phones') END;
  v_norm_slot TEXT := COALESCE(NULLIF(p_slot_key, ''), 'all');
BEGIN
  SELECT * INTO v_pkg FROM public.ad_packages WHERE id = p_package_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الباقة غير موجودة أو غير مفعلة';
  END IF;

  -- البحث عن سعر مخصص: أولاً (قسم + مساحة محددة)، ثم (قسم + all)
  SELECT * INTO v_custom
  FROM public.ad_section_pricing sp
  WHERE sp.package_id = p_package_id
    AND sp.section_id IN (v_norm_section, p_section_id)
    AND sp.slot_key IN (v_norm_slot, 'all')
    AND sp.is_active = TRUE
  ORDER BY
    CASE WHEN sp.slot_key = v_norm_slot THEN 0 ELSE 1 END,
    CASE WHEN sp.section_id = v_norm_section THEN 0 ELSE 1 END
  LIMIT 1;

  v_has_custom := FOUND;

  IF v_has_custom THEN
    v_base_price := CASE WHEN v_currency = 'USD' THEN COALESCE(v_custom.price_usd, 0) ELSE COALESCE(v_custom.price_yer, 0) END;
    v_is_free := COALESCE(v_custom.is_free, FALSE) OR v_base_price = 0;
    v_disc_pct := COALESCE(v_custom.discount_percent, 0);
    v_disc_amt := CASE WHEN v_currency = 'USD' THEN 0 ELSE COALESCE(v_custom.discount_amount_yer, 0) END;
    v_promo_start := v_custom.promo_starts_at;
    v_promo_end := v_custom.promo_ends_at;
    v_is_exclusive := COALESCE(v_custom.is_exclusive, v_pkg.is_exclusive);
    v_allow_rotation := COALESCE(v_custom.allow_rotation, v_pkg.allow_rotation);
  ELSE
    v_base_price := CASE WHEN v_currency = 'USD' THEN COALESCE(v_pkg.default_price_usd, 0) ELSE COALESCE(v_pkg.default_price_yer, 0) END;
    v_is_free := COALESCE(v_pkg.is_free, FALSE) OR v_base_price = 0;
    v_disc_pct := COALESCE(v_pkg.discount_percent, 0);
    v_disc_amt := CASE WHEN v_currency = 'USD' THEN 0 ELSE COALESCE(v_pkg.discount_amount_yer, 0) END;
    v_promo_start := v_pkg.promo_starts_at;
    v_promo_end := v_pkg.promo_ends_at;
    v_is_exclusive := v_pkg.is_exclusive;
    v_allow_rotation := v_pkg.allow_rotation;
  END IF;

  IF (v_promo_start IS NOT NULL AND NOW() < v_promo_start) OR (v_promo_end IS NOT NULL AND NOW() > v_promo_end) THEN
    v_promo_active := FALSE;
  END IF;

  IF v_is_free THEN
    v_base_price := 0;
    v_total_discount := 0;
    v_final_price := 0;
  ELSE
    IF v_promo_active THEN
      v_total_discount := ROUND((v_base_price * (v_disc_pct / 100.0)) + v_disc_amt, 2);
      v_total_discount := LEAST(v_base_price, GREATEST(0, v_total_discount));
    ELSE
      v_total_discount := 0;
    END IF;
    v_final_price := GREATEST(0, ROUND(v_base_price - v_total_discount, 2));
    IF v_final_price = 0 THEN
      v_is_free := TRUE;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'package_id', v_pkg.id,
    'package_name', v_pkg.name,
    'ad_type', v_pkg.ad_type,
    'tier_key', v_pkg.tier_key,
    'visual_tier', v_pkg.visual_tier,
    'duration_days', v_pkg.duration_days,
    'post_quota', v_pkg.post_quota,
    'highlight_quota', v_pkg.highlight_quota,
    'section_id', v_norm_section,
    'slot_key', v_norm_slot,
    'currency', v_currency,
    'base_price', v_base_price,
    'discount_amount', v_total_discount,
    'final_price', v_final_price,
    'is_free', v_is_free,
    'promo_active', v_promo_active,
    'promo_ends_at', v_promo_end,
    'pricing_source', CASE WHEN v_has_custom THEN 'section_slot_custom' ELSE 'package_default' END,
    'is_exclusive', v_is_exclusive,
    'allow_rotation', v_allow_rotation,
    'requires_approval', v_pkg.requires_approval,
    'features', v_pkg.features
  );
END;
$$;

-- ============================================================================
-- دالة 2: فحص توفر المساحة ومنع تعارض الحجوزات
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_ad_slot_availability(
  p_ad_type TEXT,
  p_package_id UUID,
  p_section_id TEXT DEFAULT 'phones',
  p_slot_key TEXT DEFAULT 'all',
  p_start_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote JSONB;
  v_duration INTEGER;
  v_is_exclusive BOOLEAN;
  v_allow_rotation BOOLEAN;
  v_end_date TIMESTAMPTZ;
  v_norm_section TEXT := CASE WHEN p_section_id = 'properties' THEN 'realestate' ELSE COALESCE(NULLIF(p_section_id, ''), 'phones') END;
  v_norm_slot TEXT := COALESCE(NULLIF(p_slot_key, ''), 'all');
  v_conflict_count INTEGER := 0;
  v_conflict_until TIMESTAMPTZ;
BEGIN
  IF p_ad_type = 'phone_feed' THEN
    RETURN jsonb_build_object('available', TRUE, 'conflict_count', 0);
  END IF;

  v_quote := public.calculate_ad_order_quote(p_package_id, v_norm_section, v_norm_slot, 'YER');
  v_duration := COALESCE((v_quote->>'duration_days')::INTEGER, 30);
  v_is_exclusive := COALESCE((v_quote->>'is_exclusive')::BOOLEAN, FALSE);
  v_allow_rotation := COALESCE((v_quote->>'allow_rotation')::BOOLEAN, TRUE);
  v_end_date := COALESCE(p_start_date, NOW()) + make_interval(days => v_duration);

  IF v_is_exclusive OR NOT v_allow_rotation THEN
    SELECT COUNT(*), MAX(o.ends_at)
    INTO v_conflict_count, v_conflict_until
    FROM public.ad_subscription_orders o
    WHERE o.ad_type = p_ad_type
      AND o.section_id IN (v_norm_section, 'all')
      AND (
        p_ad_type = 'sponsor'
        OR o.slot_key = v_norm_slot
        OR o.slot_key = 'all'
        OR v_norm_slot = 'all'
      )
      AND o.status IN ('active', 'approved', 'pending_review')
      AND COALESCE(o.starts_at, o.created_at) < v_end_date
      AND COALESCE(o.ends_at, o.created_at + make_interval(days => o.duration_days)) > COALESCE(p_start_date, NOW());
  END IF;

  RETURN jsonb_build_object(
    'available', (v_conflict_count = 0),
    'conflict_count', v_conflict_count,
    'conflict_until', v_conflict_until,
    'is_exclusive', v_is_exclusive,
    'allow_rotation', v_allow_rotation
  );
END;
$$;

-- ============================================================================
-- دالة 3: تقديم طلب اشتراك إعلاني موحد (يُحسب السعر في الخادم حصراً)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.submit_ad_subscription_order(
  p_package_id UUID,
  p_section_id TEXT DEFAULT 'phones',
  p_slot_key TEXT DEFAULT 'all',
  p_currency TEXT DEFAULT 'YER',
  p_business_id UUID DEFAULT NULL,
  p_ad_payload JSONB DEFAULT '{}'::jsonb,
  p_payment_method_id UUID DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL,
  p_payment_proof_url TEXT DEFAULT NULL,
  p_payment_proof_hash TEXT DEFAULT NULL
)
RETURNS public.ad_subscription_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_quote JSONB;
  v_avail JSONB;
  v_ad_type TEXT;
  v_is_free BOOLEAN;
  v_final_price NUMERIC;
  v_status TEXT;
  v_method_name TEXT;
  v_order public.ad_subscription_orders%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول أولاً';
  END IF;

  v_quote := public.calculate_ad_order_quote(p_package_id, p_section_id, p_slot_key, p_currency);
  v_ad_type := v_quote->>'ad_type';
  v_is_free := COALESCE((v_quote->>'is_free')::BOOLEAN, FALSE);
  v_final_price := COALESCE((v_quote->>'final_price')::NUMERIC, 0);

  v_avail := public.check_ad_slot_availability(v_ad_type, p_package_id, p_section_id, p_slot_key, NOW());
  IF NOT COALESCE((v_avail->>'available')::BOOLEAN, TRUE) THEN
    RAISE EXCEPTION 'هذه المساحة أو الرعاية محجوزة حالياً في نفس الفترة حتى %', COALESCE(to_char((v_avail->>'conflict_until')::timestamptz, 'YYYY-MM-DD'), 'نهاية الحملة الحالية');
  END IF;

  IF v_is_free OR v_final_price = 0 THEN
    -- المجانية تتجاوز الدفع وتدخل مسار المراجعة الإدارية مباشرة
    v_status := 'pending_review';
  ELSE
    IF p_payment_method_id IS NOT NULL AND COALESCE(NULLIF(TRIM(p_payment_reference), ''), '') <> '' THEN
      v_status := 'pending_review';
    ELSE
      v_status := 'pending_payment';
    END IF;
  END IF;

  IF p_payment_method_id IS NOT NULL THEN
    SELECT COALESCE(NULLIF(to_jsonb(pm)->>'name', ''), to_jsonb(pm)->>'provider_name', 'دفع يدوي')
    INTO v_method_name
    FROM public.payment_methods pm
    WHERE pm.id = p_payment_method_id;
  END IF;

  INSERT INTO public.ad_subscription_orders (
    user_id,
    business_id,
    ad_type,
    package_id,
    section_id,
    slot_key,
    package_name_snapshot,
    duration_days,
    post_quota,
    highlight_quota,
    remaining_posts,
    remaining_highlights,
    currency,
    base_price,
    discount_amount,
    final_price,
    is_free_order,
    pricing_source,
    ad_payload,
    status,
    payment_method_id,
    payment_method_name,
    payment_reference,
    payment_proof_url,
    payment_proof_hash
  )
  VALUES (
    v_uid,
    p_business_id,
    v_ad_type,
    p_package_id,
    v_quote->>'section_id',
    v_quote->>'slot_key',
    v_quote->>'package_name',
    (v_quote->>'duration_days')::INTEGER,
    (v_quote->>'post_quota')::INTEGER,
    (v_quote->>'highlight_quota')::INTEGER,
    (v_quote->>'post_quota')::INTEGER,
    (v_quote->>'highlight_quota')::INTEGER,
    v_quote->>'currency',
    (v_quote->>'base_price')::NUMERIC,
    (v_quote->>'discount_amount')::NUMERIC,
    v_final_price,
    v_is_free,
    v_quote->>'pricing_source',
    COALESCE(p_ad_payload, '{}'::jsonb),
    v_status,
    CASE WHEN v_is_free THEN NULL ELSE p_payment_method_id END,
    CASE WHEN v_is_free THEN 'مجاني' ELSE v_method_name END,
    CASE WHEN v_is_free THEN NULL ELSE NULLIF(TRIM(p_payment_reference), '') END,
    CASE WHEN v_is_free THEN NULL ELSE NULLIF(TRIM(p_payment_proof_url), '') END,
    CASE WHEN v_is_free THEN NULL ELSE NULLIF(TRIM(p_payment_proof_hash), '') END
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

-- ============================================================================
-- دالة 4: إرفاق إثبات الدفع لطلب بانتظار الدفع
-- ============================================================================
CREATE OR REPLACE FUNCTION public.attach_ad_order_payment_proof(
  p_order_id UUID,
  p_payment_method_id UUID,
  p_payment_reference TEXT,
  p_proof_url TEXT DEFAULT NULL,
  p_proof_hash TEXT DEFAULT NULL
)
RETURNS public.ad_subscription_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_order public.ad_subscription_orders%ROWTYPE;
  v_method_name TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'غير مصرح';
  END IF;

  SELECT * INTO v_order FROM public.ad_subscription_orders WHERE id = p_order_id AND user_id = v_uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;

  IF v_order.status NOT IN ('draft', 'pending_payment') THEN
    RAISE EXCEPTION 'لا يمكن تعديل إثبات الدفع في هذه الحالة (%)', v_order.status;
  END IF;

  SELECT COALESCE(NULLIF(to_jsonb(pm)->>'name', ''), to_jsonb(pm)->>'provider_name', 'دفع يدوي')
  INTO v_method_name
  FROM public.payment_methods pm
  WHERE pm.id = p_payment_method_id;

  UPDATE public.ad_subscription_orders
  SET
    payment_method_id = p_payment_method_id,
    payment_method_name = v_method_name,
    payment_reference = NULLIF(TRIM(p_payment_reference), ''),
    payment_proof_url = COALESCE(NULLIF(TRIM(p_proof_url), ''), payment_proof_url),
    payment_proof_hash = COALESCE(NULLIF(TRIM(p_proof_hash), ''), payment_proof_hash),
    status = 'pending_review',
    updated_at = NOW()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

-- ============================================================================
-- دالة 5: إدارة الباقات والأسعار والخصومات والمجانية + سجل التدقيق (للإدارة فقط)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.admin_upsert_ad_package(
  p_id UUID DEFAULT NULL,
  p_code TEXT DEFAULT NULL,
  p_ad_type TEXT DEFAULT 'phone_feed',
  p_tier_key TEXT DEFAULT 'basic',
  p_name TEXT DEFAULT '',
  p_description TEXT DEFAULT '',
  p_duration_days INTEGER DEFAULT 30,
  p_post_quota INTEGER DEFAULT 0,
  p_highlight_quota INTEGER DEFAULT 0,
  p_default_price_yer NUMERIC DEFAULT 0,
  p_default_price_usd NUMERIC DEFAULT 0,
  p_is_free BOOLEAN DEFAULT FALSE,
  p_discount_percent NUMERIC DEFAULT 0,
  p_discount_amount_yer NUMERIC DEFAULT 0,
  p_promo_starts_at TIMESTAMPTZ DEFAULT NULL,
  p_promo_ends_at TIMESTAMPTZ DEFAULT NULL,
  p_features JSONB DEFAULT '[]'::jsonb,
  p_visual_tier TEXT DEFAULT 'basic',
  p_is_exclusive BOOLEAN DEFAULT FALSE,
  p_allow_rotation BOOLEAN DEFAULT TRUE,
  p_requires_approval BOOLEAN DEFAULT TRUE,
  p_is_active BOOLEAN DEFAULT TRUE,
  p_sort_order INTEGER DEFAULT 0
)
RETURNS public.ad_packages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_admin_name TEXT;
  v_old public.ad_packages%ROWTYPE;
  v_res public.ad_packages%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'صلاحية الإدارة مطلوبة';
  END IF;

  SELECT full_name INTO v_admin_name FROM public.profiles WHERE id = v_uid;

  IF p_id IS NOT NULL THEN
    SELECT * INTO v_old FROM public.ad_packages WHERE id = p_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'الباقة غير موجودة';
    END IF;

    UPDATE public.ad_packages
    SET
      name = COALESCE(NULLIF(TRIM(p_name), ''), name),
      description = COALESCE(p_description, description),
      duration_days = GREATEST(1, COALESCE(p_duration_days, duration_days)),
      post_quota = GREATEST(0, COALESCE(p_post_quota, post_quota)),
      highlight_quota = GREATEST(0, COALESCE(p_highlight_quota, highlight_quota)),
      previous_price_yer = CASE WHEN default_price_yer IS DISTINCT FROM p_default_price_yer AND default_price_yer > 0 THEN default_price_yer ELSE previous_price_yer END,
      previous_price_usd = CASE WHEN default_price_usd IS DISTINCT FROM p_default_price_usd AND default_price_usd > 0 THEN default_price_usd ELSE previous_price_usd END,
      default_price_yer = GREATEST(0, COALESCE(p_default_price_yer, default_price_yer)),
      default_price_usd = GREATEST(0, COALESCE(p_default_price_usd, default_price_usd)),
      is_free = COALESCE(p_is_free, is_free),
      discount_percent = LEAST(100, GREATEST(0, COALESCE(p_discount_percent, 0))),
      discount_amount_yer = GREATEST(0, COALESCE(p_discount_amount_yer, 0)),
      promo_starts_at = p_promo_starts_at,
      promo_ends_at = p_promo_ends_at,
      features = COALESCE(p_features, features),
      visual_tier = COALESCE(p_visual_tier, visual_tier),
      is_exclusive = COALESCE(p_is_exclusive, is_exclusive),
      allow_rotation = COALESCE(p_allow_rotation, allow_rotation),
      requires_approval = COALESCE(p_requires_approval, requires_approval),
      is_active = COALESCE(p_is_active, is_active),
      sort_order = COALESCE(p_sort_order, sort_order),
      updated_at = NOW()
    WHERE id = p_id
    RETURNING * INTO v_res;

    INSERT INTO public.ad_pricing_audit_logs (admin_id, admin_name, target_table, target_id, action, old_values, new_values)
    VALUES (v_uid, COALESCE(v_admin_name, 'مسؤول'), 'ad_packages', p_id::text, 'update_package', to_jsonb(v_old), to_jsonb(v_res));
  ELSE
    INSERT INTO public.ad_packages (
      code, ad_type, tier_key, name, description,
      duration_days, post_quota, highlight_quota,
      default_price_yer, default_price_usd, is_free,
      discount_percent, discount_amount_yer, promo_starts_at, promo_ends_at,
      features, visual_tier, is_exclusive, allow_rotation, requires_approval, is_active, sort_order
    )
    VALUES (
      COALESCE(NULLIF(TRIM(p_code), ''), p_ad_type || '_' || EXTRACT(EPOCH FROM NOW())::bigint),
      p_ad_type,
      p_tier_key,
      p_name,
      COALESCE(p_description, ''),
      GREATEST(1, p_duration_days),
      GREATEST(0, p_post_quota),
      GREATEST(0, p_highlight_quota),
      GREATEST(0, p_default_price_yer),
      GREATEST(0, p_default_price_usd),
      p_is_free,
      LEAST(100, GREATEST(0, p_discount_percent)),
      GREATEST(0, p_discount_amount_yer),
      p_promo_starts_at,
      p_promo_ends_at,
      COALESCE(p_features, '[]'::jsonb),
      p_visual_tier,
      p_is_exclusive,
      p_allow_rotation,
      p_requires_approval,
      p_is_active,
      p_sort_order
    )
    RETURNING * INTO v_res;

    INSERT INTO public.ad_pricing_audit_logs (admin_id, admin_name, target_table, target_id, action, old_values, new_values)
    VALUES (v_uid, COALESCE(v_admin_name, 'مسؤول'), 'ad_packages', v_res.id::text, 'create_package', NULL, to_jsonb(v_res));
  END IF;

  RETURN v_res;
END;
$$;

-- تفعيل المجانية أو استعادة السعر السابق
CREATE OR REPLACE FUNCTION public.admin_toggle_package_free(
  p_package_id UUID,
  p_make_free BOOLEAN
)
RETURNS public.ad_packages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_admin_name TEXT;
  v_old public.ad_packages%ROWTYPE;
  v_res public.ad_packages%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'صلاحية الإدارة مطلوبة';
  END IF;
  SELECT full_name INTO v_admin_name FROM public.profiles WHERE id = v_uid;
  SELECT * INTO v_old FROM public.ad_packages WHERE id = p_package_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الباقة غير موجودة'; END IF;

  IF p_make_free THEN
    UPDATE public.ad_packages
    SET
      previous_price_yer = CASE WHEN default_price_yer > 0 THEN default_price_yer ELSE previous_price_yer END,
      previous_price_usd = CASE WHEN default_price_usd > 0 THEN default_price_usd ELSE previous_price_usd END,
      default_price_yer = 0,
      default_price_usd = 0,
      is_free = TRUE,
      updated_at = NOW()
    WHERE id = p_package_id
    RETURNING * INTO v_res;
  ELSE
    UPDATE public.ad_packages
    SET
      default_price_yer = COALESCE(NULLIF(previous_price_yer, 0), default_price_yer),
      default_price_usd = COALESCE(NULLIF(previous_price_usd, 0), default_price_usd),
      is_free = FALSE,
      updated_at = NOW()
    WHERE id = p_package_id
    RETURNING * INTO v_res;
  END IF;

  INSERT INTO public.ad_pricing_audit_logs (admin_id, admin_name, target_table, target_id, action, old_values, new_values)
  VALUES (v_uid, COALESCE(v_admin_name, 'مسؤول'), 'ad_packages', p_package_id::text, CASE WHEN p_make_free THEN 'make_free' ELSE 'restore_from_free' END, to_jsonb(v_old), to_jsonb(v_res));

  RETURN v_res;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_restore_package_previous_price(p_package_id UUID)
RETURNS public.ad_packages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_admin_name TEXT;
  v_old public.ad_packages%ROWTYPE;
  v_res public.ad_packages%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'صلاحية الإدارة مطلوبة';
  END IF;
  SELECT full_name INTO v_admin_name FROM public.profiles WHERE id = v_uid;
  SELECT * INTO v_old FROM public.ad_packages WHERE id = p_package_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الباقة غير موجودة'; END IF;
  IF v_old.previous_price_yer IS NULL THEN
    RAISE EXCEPTION 'لا يوجد سعر سابق محفوظ لهذه الباقة';
  END IF;

  UPDATE public.ad_packages
  SET
    default_price_yer = v_old.previous_price_yer,
    default_price_usd = COALESCE(v_old.previous_price_usd, default_price_usd),
    previous_price_yer = v_old.default_price_yer,
    previous_price_usd = v_old.default_price_usd,
    is_free = (v_old.previous_price_yer = 0),
    updated_at = NOW()
  WHERE id = p_package_id
  RETURNING * INTO v_res;

  INSERT INTO public.ad_pricing_audit_logs (admin_id, admin_name, target_table, target_id, action, old_values, new_values)
  VALUES (v_uid, COALESCE(v_admin_name, 'مسؤول'), 'ad_packages', p_package_id::text, 'restore_previous_price', to_jsonb(v_old), to_jsonb(v_res));

  RETURN v_res;
END;
$$;

-- تسعير مخصص لقسم ومساحة محددة
CREATE OR REPLACE FUNCTION public.admin_upsert_ad_section_pricing(
  p_package_id UUID,
  p_section_id TEXT,
  p_slot_key TEXT DEFAULT 'all',
  p_price_yer NUMERIC DEFAULT 0,
  p_price_usd NUMERIC DEFAULT 0,
  p_is_free BOOLEAN DEFAULT FALSE,
  p_discount_percent NUMERIC DEFAULT 0,
  p_discount_amount_yer NUMERIC DEFAULT 0,
  p_promo_starts_at TIMESTAMPTZ DEFAULT NULL,
  p_promo_ends_at TIMESTAMPTZ DEFAULT NULL,
  p_allow_rotation BOOLEAN DEFAULT NULL,
  p_is_exclusive BOOLEAN DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS public.ad_section_pricing
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_admin_name TEXT;
  v_pkg public.ad_packages%ROWTYPE;
  v_old public.ad_section_pricing%ROWTYPE;
  v_res public.ad_section_pricing%ROWTYPE;
  v_norm_section TEXT := CASE WHEN p_section_id = 'properties' THEN 'realestate' ELSE p_section_id END;
  v_norm_slot TEXT := COALESCE(NULLIF(p_slot_key, ''), 'all');
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'صلاحية الإدارة مطلوبة';
  END IF;

  SELECT * INTO v_pkg FROM public.ad_packages WHERE id = p_package_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الباقة غير موجودة'; END IF;
  SELECT full_name INTO v_admin_name FROM public.profiles WHERE id = v_uid;

  SELECT * INTO v_old
  FROM public.ad_section_pricing
  WHERE package_id = p_package_id AND section_id = v_norm_section AND slot_key = v_norm_slot;

  INSERT INTO public.ad_section_pricing (
    package_id, ad_type, section_id, slot_key,
    price_yer, price_usd, previous_price_yer, previous_price_usd,
    is_free, discount_percent, discount_amount_yer,
    promo_starts_at, promo_ends_at, allow_rotation, is_exclusive, is_active
  )
  VALUES (
    p_package_id, v_pkg.ad_type, v_norm_section, v_norm_slot,
    CASE WHEN p_is_free THEN 0 ELSE GREATEST(0, p_price_yer) END,
    CASE WHEN p_is_free THEN 0 ELSE GREATEST(0, p_price_usd) END,
    CASE WHEN FOUND AND v_old.price_yer > 0 THEN v_old.price_yer ELSE NULL END,
    CASE WHEN FOUND AND v_old.price_usd > 0 THEN v_old.price_usd ELSE NULL END,
    p_is_free,
    LEAST(100, GREATEST(0, p_discount_percent)),
    GREATEST(0, p_discount_amount_yer),
    p_promo_starts_at,
    p_promo_ends_at,
    p_allow_rotation,
    p_is_exclusive,
    p_is_active
  )
  ON CONFLICT (package_id, section_id, slot_key) DO UPDATE SET
    previous_price_yer = CASE WHEN ad_section_pricing.price_yer IS DISTINCT FROM EXCLUDED.price_yer AND ad_section_pricing.price_yer > 0 THEN ad_section_pricing.price_yer ELSE ad_section_pricing.previous_price_yer END,
    previous_price_usd = CASE WHEN ad_section_pricing.price_usd IS DISTINCT FROM EXCLUDED.price_usd AND ad_section_pricing.price_usd > 0 THEN ad_section_pricing.price_usd ELSE ad_section_pricing.previous_price_usd END,
    price_yer = EXCLUDED.price_yer,
    price_usd = EXCLUDED.price_usd,
    is_free = EXCLUDED.is_free,
    discount_percent = EXCLUDED.discount_percent,
    discount_amount_yer = EXCLUDED.discount_amount_yer,
    promo_starts_at = EXCLUDED.promo_starts_at,
    promo_ends_at = EXCLUDED.promo_ends_at,
    allow_rotation = EXCLUDED.allow_rotation,
    is_exclusive = EXCLUDED.is_exclusive,
    is_active = EXCLUDED.is_active,
    updated_at = NOW()
  RETURNING * INTO v_res;

  INSERT INTO public.ad_pricing_audit_logs (admin_id, admin_name, target_table, target_id, action, old_values, new_values)
  VALUES (v_uid, COALESCE(v_admin_name, 'مسؤول'), 'ad_section_pricing', v_res.id::text, 'upsert_section_pricing', to_jsonb(v_old), to_jsonb(v_res));

  RETURN v_res;
END;
$$;

-- ============================================================================
-- دالة 6: مراجعة الإدارة للطلب وتفعيله/إيقافه/تمديده + النشر التلقائي في published_ads
-- ============================================================================
CREATE OR REPLACE FUNCTION public.admin_review_ad_order(
  p_order_id UUID,
  p_action TEXT, -- 'approve_activate' | 'approve_only' | 'reject' | 'pause' | 'cancel' | 'extend'
  p_admin_notes TEXT DEFAULT NULL,
  p_custom_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS public.ad_subscription_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_order public.ad_subscription_orders%ROWTYPE;
  v_pkg public.ad_packages%ROWTYPE;
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_pub_id TEXT;
  v_placement_id TEXT;
  v_ad_kind TEXT;
  v_payload JSONB;
  v_ad_data JSONB;
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'صلاحية الإدارة مطلوبة';
  END IF;

  SELECT * INTO v_order FROM public.ad_subscription_orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'طلب الاشتراك غير موجود';
  END IF;
  SELECT * INTO v_pkg FROM public.ad_packages WHERE id = v_order.package_id;

  IF p_action IN ('approve_activate', 'approve_only') THEN
    v_start := COALESCE(v_order.starts_at, NOW());
    v_end := COALESCE(p_custom_end_date, v_start + make_interval(days => v_order.duration_days));

    IF p_action = 'approve_only' THEN
      UPDATE public.ad_subscription_orders
      SET
        status = 'approved',
        starts_at = v_start,
        ends_at = v_end,
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        reviewed_by = v_uid,
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = p_order_id
      RETURNING * INTO v_order;
      RETURN v_order;
    END IF;

    -- تفعيل فعلي: للراعي والبانر ينشئ أو يفعّل صفاً في published_ads
    v_pub_id := v_order.published_ad_id;
    IF v_order.ad_type IN ('sponsor', 'banner') THEN
      v_ad_kind := v_order.ad_type;
      v_pub_id := COALESCE(v_pub_id, 'ad_sub_' || REPLACE(v_order.id::text, '-', ''));
      v_placement_id := CASE v_order.section_id
        WHEN 'phones' THEN '9'
        WHEN 'jobs' THEN '7'
        WHEN 'realestate' THEN '5'
        WHEN 'auctions' THEN '6'
        WHEN 'community' THEN CASE WHEN v_order.slot_key = 'slot_1' THEN '1' ELSE '2' END
        ELSE '10'
      END;
      IF v_ad_kind = 'sponsor' THEN
        v_placement_id := 'home_sponsor';
      END IF;

      v_payload := COALESCE(v_order.ad_payload, '{}'::jsonb);
      v_ad_data := jsonb_build_object(
        'id', v_pub_id,
        'placementId', v_placement_id,
        'status', 'active',
        'adKind', v_ad_kind,
        'targetSections', ARRAY[v_order.section_id],
        'slotKey', CASE WHEN v_ad_kind = 'sponsor' THEN 'header_sponsor' ELSE v_order.slot_key END,
        'priority', CASE WHEN v_pkg.visual_tier IN ('exclusive', 'featured') THEN 3 ELSE 1 END,
        'startDate', to_char(v_start, 'YYYY-MM-DD'),
        'endDate', to_char(v_end, 'YYYY-MM-DD'),
        'contractExpiry', to_char(v_end, 'YYYY-MM-DD'),
        'advertiserName', COALESCE(v_payload->>'advertiserName', v_payload->>'title', 'معلن'),
        'sponsorTag', COALESCE(v_payload->>'sponsorTag', CASE WHEN v_pkg.is_exclusive THEN 'الراعي الحصري' ELSE 'الراعي الرسمي' END),
        'title', COALESCE(v_payload->>'title', v_payload->>'advertiserName', ''),
        'description', COALESCE(v_payload->>'description', ''),
        'mediaUrl', COALESCE(v_payload->>'mediaUrl', v_payload->>'logoUrl', ''),
        'mediaType', COALESCE(v_payload->>'mediaType', 'image'),
        'linkUrl', COALESCE(v_payload->>'linkUrl', CASE WHEN v_order.business_id IS NOT NULL THEN '/business-page/' || v_order.business_id::text ELSE '' END),
        'ctaText', COALESCE(v_payload->>'ctaText', 'زيارة الصفحة'),
        'bgColor', COALESCE(v_payload->>'bgColor', '#090E1A'),
        'accentColor', COALESCE(v_payload->>'accentColor', '#FFC500'),
        'textColor', COALESCE(v_payload->>'textColor', '#FFFFFF'),
        'isSponsor', (v_ad_kind = 'sponsor'),
        'orderId', v_order.id
      );

      INSERT INTO public.published_ads (
        id, placement_id, status, data, views, clicks,
        ad_kind, target_sections, slot_key, priority, start_date, end_date, updated_at
      )
      VALUES (
        v_pub_id,
        v_placement_id,
        'active',
        v_ad_data,
        0,
        0,
        v_ad_kind,
        ARRAY[v_order.section_id],
        CASE WHEN v_ad_kind = 'sponsor' THEN 'header_sponsor' ELSE v_order.slot_key END,
        CASE WHEN v_pkg.visual_tier IN ('exclusive', 'featured') THEN 3 ELSE 1 END,
        v_start::date,
        v_end::date,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        status = 'active',
        data = EXCLUDED.data,
        ad_kind = EXCLUDED.ad_kind,
        target_sections = EXCLUDED.target_sections,
        slot_key = EXCLUDED.slot_key,
        priority = EXCLUDED.priority,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        updated_at = NOW();
    END IF;

    UPDATE public.ad_subscription_orders
    SET
      status = 'active',
      starts_at = v_start,
      ends_at = v_end,
      published_ad_id = v_pub_id,
      admin_notes = COALESCE(p_admin_notes, admin_notes),
      reviewed_by = v_uid,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

  ELSIF p_action = 'reject' THEN
    UPDATE public.ad_subscription_orders
    SET
      status = 'rejected',
      admin_notes = COALESCE(p_admin_notes, admin_notes),
      reviewed_by = v_uid,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

  ELSIF p_action IN ('pause', 'cancel') THEN
    IF v_order.published_ad_id IS NOT NULL THEN
      UPDATE public.published_ads SET status = 'paused', updated_at = NOW() WHERE id = v_order.published_ad_id;
    END IF;
    UPDATE public.phone_ad_posts SET status = 'paused' WHERE order_id = p_order_id AND status = 'active';

    UPDATE public.ad_subscription_orders
    SET
      status = CASE WHEN p_action = 'cancel' THEN 'cancelled' ELSE 'approved' END,
      admin_notes = COALESCE(p_admin_notes, admin_notes),
      reviewed_by = v_uid,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_order_id
    RETURNING * INTO v_order;

  ELSIF p_action = 'extend' THEN
    IF p_custom_end_date IS NULL THEN
      RAISE EXCEPTION 'يجب تحديد تاريخ الانتهاء الجديد';
    END IF;
    IF v_order.published_ad_id IS NOT NULL THEN
      UPDATE public.published_ads
      SET
        end_date = p_custom_end_date::date,
        data = jsonb_set(jsonb_set(data, '{endDate}', to_jsonb(to_char(p_custom_end_date, 'YYYY-MM-DD'))), '{contractExpiry}', to_jsonb(to_char(p_custom_end_date, 'YYYY-MM-DD'))),
        updated_at = NOW()
      WHERE id = v_order.published_ad_id;
    END IF;
    UPDATE public.phone_ad_posts SET ends_at = p_custom_end_date WHERE order_id = p_order_id AND status = 'active';

    UPDATE public.ad_subscription_orders
    SET
      ends_at = p_custom_end_date,
      admin_notes = COALESCE(p_admin_notes, admin_notes),
      reviewed_by = v_uid,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_order_id
    RETURNING * INTO v_order;
  ELSE
    RAISE EXCEPTION 'إجراء غير معروف: %', p_action;
  END IF;

  RETURN v_order;
END;
$$;

-- ============================================================================
-- دالة 7: نشر تغريدة هاتف مميزة (تتحقق من الاشتراك والرصيد وتخصم ذرياً)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.publish_phone_featured_ad(
  p_order_id UUID,
  p_ad_tier TEXT DEFAULT 'basic',
  p_highlight BOOLEAN DEFAULT FALSE,
  p_item_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS public.phone_ad_posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_order public.ad_subscription_orders%ROWTYPE;
  v_post public.phone_ad_posts%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول أولاً';
  END IF;

  SELECT * INTO v_order
  FROM public.ad_subscription_orders
  WHERE id = p_order_id
    AND user_id = v_uid
    AND ad_type = 'phone_feed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'اشتراك سوق الهاتف غير موجود';
  END IF;

  IF v_order.status <> 'active' OR (v_order.ends_at IS NOT NULL AND v_order.ends_at < NOW()) THEN
    RAISE EXCEPTION 'اشتراك سوق الهاتف غير نشط أو انتهت صلاحيته';
  END IF;

  IF v_order.remaining_posts <= 0 THEN
    RAISE EXCEPTION 'انتهى رصيد المنشورات المتاح في باقتك الحالية';
  END IF;

  IF p_highlight AND v_order.remaining_highlights <= 0 THEN
    RAISE EXCEPTION 'انتهى رصيد مرات إبراز المنشور في باقتك الحالية';
  END IF;

  UPDATE public.ad_subscription_orders
  SET
    remaining_posts = remaining_posts - 1,
    remaining_highlights = CASE WHEN p_highlight THEN remaining_highlights - 1 ELSE remaining_highlights END,
    updated_at = NOW()
  WHERE id = v_order.id;

  INSERT INTO public.phone_ad_posts (
    order_id, user_id, business_id, ad_tier, is_highlighted, item_payload, status, starts_at, ends_at
  )
  VALUES (
    v_order.id,
    v_uid,
    v_order.business_id,
    CASE WHEN p_ad_tier IN ('basic', 'pro', 'vip') THEN p_ad_tier ELSE 'basic' END,
    COALESCE(p_highlight, FALSE),
    COALESCE(p_item_payload, '{}'::jsonb),
    'active',
    NOW(),
    COALESCE(v_order.ends_at, NOW() + make_interval(days => v_order.duration_days))
  )
  RETURNING * INTO v_post;

  RETURN v_post;
END;
$$;

-- ============================================================================
-- دالة 8: إنهاء الاشتراكات المنتهية وإيقاف إعلاناتها تلقائياً
-- ============================================================================
CREATE OR REPLACE FUNCTION public.expire_elapsed_ad_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  WITH expired_rows AS (
    UPDATE public.ad_subscription_orders
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
      AND ends_at IS NOT NULL
      AND ends_at < NOW()
    RETURNING id, published_ad_id
  )
  SELECT COUNT(*) INTO v_count FROM expired_rows;

  UPDATE public.published_ads pa
  SET status = 'paused', updated_at = NOW()
  FROM public.ad_subscription_orders o
  WHERE o.published_ad_id = pa.id
    AND o.status = 'expired'
    AND pa.status = 'active';

  UPDATE public.phone_ad_posts p
  SET status = 'expired'
  WHERE p.status = 'active'
    AND p.ends_at < NOW();

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_ad_order_quote(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_ad_slot_availability(TEXT, UUID, TEXT, TEXT, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_ad_subscription_order(UUID, TEXT, TEXT, TEXT, UUID, JSONB, UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.attach_ad_order_payment_proof(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_ad_package(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, NUMERIC, NUMERIC, BOOLEAN, NUMERIC, NUMERIC, TIMESTAMPTZ, TIMESTAMPTZ, JSONB, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_package_free(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_restore_package_previous_price(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_ad_section_pricing(UUID, TEXT, TEXT, NUMERIC, NUMERIC, BOOLEAN, NUMERIC, NUMERIC, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_ad_order(UUID, TEXT, TEXT, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_phone_featured_ad(UUID, TEXT, BOOLEAN, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_elapsed_ad_subscriptions() TO authenticated;
