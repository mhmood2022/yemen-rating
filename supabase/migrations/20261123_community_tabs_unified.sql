-- ============================================================================
-- Yemen Rating: Unified Community Tabs, Content, Forms, Ads & Audit Migration
-- Safe & Idempotent (Zero data loss, Zero breaking changes)
-- ============================================================================

-- 1. توسيع جدول posts لربطه بالتبويبات والتمييز بين المجاني والمدفوع المتخصص
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS section_id text,
  ADD COLUMN IF NOT EXISTS post_kind text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_post_kind_chk') THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_post_kind_chk CHECK (post_kind IN ('free', 'specialized'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_section_id ON public.posts(section_id, created_at DESC);

-- 2. أعمدة الرقابة الموحدة لجداول التبويبات المتخصصة الموجودة في القاعدة
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_reason text;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_reason text;

ALTER TABLE public.auctions
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_reason text;

-- 3. جدول حقول نماذج الإدخال المستقلة لكل تبويب
CREATE TABLE IF NOT EXISTS public.community_tab_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text'
    CHECK (field_type IN ('text', 'number', 'select', 'textarea', 'boolean', 'date', 'tel', 'url')),
  placeholder text,
  is_required boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  card_display boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 1,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section_id, field_key)
);

CREATE INDEX IF NOT EXISTS idx_tab_fields_section ON public.community_tab_fields(section_id, sort_order);

-- 4. جدول خيارات القوائم المنسدلة (مستقل لكل حقل وتبويب)
CREATE TABLE IF NOT EXISTS public.community_tab_field_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES public.community_tab_fields(id) ON DELETE CASCADE,
  section_id text NOT NULL,
  option_value text NOT NULL,
  option_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (field_id, option_value)
);

CREATE INDEX IF NOT EXISTS idx_tab_field_options_field ON public.community_tab_field_options(field_id, sort_order);

-- 5. جدول الإعلانات المتخصصة المدفوعة للتبويبات (يدعم التبويبات الحالية والمستقبلية مع حفظ لقطة النموذج)
CREATE TABLE IF NOT EXISTS public.community_tab_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  price numeric,
  currency text DEFAULT 'YER',
  city text,
  phone text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  field_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  form_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden', 'pending', 'expired', 'rejected')),
  is_pinned boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  moderation_reason text,
  views_count integer NOT NULL DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tab_listings_section ON public.community_tab_listings(section_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tab_listings_user ON public.community_tab_listings(user_id);

-- 6. جدول سجل العمليات الإدارية لتبويبات المجتمع
CREATE TABLE IF NOT EXISTS public.community_tabs_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text NOT NULL DEFAULT 'مشرف النظام',
  actor_email text,
  module text NOT NULL CHECK (module IN ('tabs', 'content', 'forms', 'ads', 'permissions')),
  action text NOT NULL,
  section_id text,
  target_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tabs_audit_created ON public.community_tabs_audit_logs(created_at DESC);

-- 7. تفعيل RLS وسياسات الأمان
ALTER TABLE public.community_tab_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_tab_field_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_tab_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_tabs_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tab_fields_public_read" ON public.community_tab_fields;
CREATE POLICY "tab_fields_public_read" ON public.community_tab_fields
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "tab_fields_admin_all" ON public.community_tab_fields;
CREATE POLICY "tab_fields_admin_all" ON public.community_tab_fields
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "tab_options_public_read" ON public.community_tab_field_options;
CREATE POLICY "tab_options_public_read" ON public.community_tab_field_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "tab_options_admin_all" ON public.community_tab_field_options;
CREATE POLICY "tab_options_admin_all" ON public.community_tab_field_options
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "tab_listings_public_read" ON public.community_tab_listings;
CREATE POLICY "tab_listings_public_read" ON public.community_tab_listings
  FOR SELECT USING ((NOT is_hidden AND status = 'active') OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "tab_listings_owner_insert" ON public.community_tab_listings;
CREATE POLICY "tab_listings_owner_insert" ON public.community_tab_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tab_listings_owner_update" ON public.community_tab_listings;
CREATE POLICY "tab_listings_owner_update" ON public.community_tab_listings
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "tab_listings_owner_delete" ON public.community_tab_listings;
CREATE POLICY "tab_listings_owner_delete" ON public.community_tab_listings
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "tabs_audit_admin_select" ON public.community_tabs_audit_logs;
CREATE POLICY "tabs_audit_admin_select" ON public.community_tabs_audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "tabs_audit_admin_insert" ON public.community_tabs_audit_logs;
CREATE POLICY "tabs_audit_admin_insert" ON public.community_tabs_audit_logs
  FOR INSERT WITH CHECK (public.is_admin());

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read platform_settings" ON public.platform_settings;
CREATE POLICY "Public read platform_settings" ON public.platform_settings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage platform_settings" ON public.platform_settings;
CREATE POLICY "Admins manage platform_settings" ON public.platform_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. تحديث دالتي جلب الإعلانات المؤهلة لدعم التبويبات المستقبلية وتوافق properties/realestate
CREATE OR REPLACE FUNCTION public.get_eligible_ad_for_slot(
  p_section text,
  p_slot text DEFAULT 'all'::text,
  p_ad_kind text DEFAULT 'banner'::text,
  p_exclude_ids text[] DEFAULT '{}'::text[]
)
RETURNS SETOF public.published_ads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_chosen_id TEXT;
BEGIN
  SELECT pa.id INTO v_chosen_id
  FROM public.published_ads pa
  WHERE pa.status = 'active'
    AND pa.ad_kind = p_ad_kind
    AND COALESCE(pa.data->>'mediaUrl', '') NOT LIKE 'blob:%'
    AND (array_length(p_exclude_ids, 1) IS NULL OR NOT (pa.id = ANY(p_exclude_ids)))
    AND (pa.start_date IS NULL OR pa.start_date <= CURRENT_DATE)
    AND (pa.end_date IS NULL OR pa.end_date >= CURRENT_DATE)
    AND (
      NOT ((pa.data->>'startDate') ~ '^\d{4}-\d{2}-\d{2}$')
      OR (pa.data->>'startDate')::date <= CURRENT_DATE
    )
    AND (
      NOT ((pa.data->>'endDate') ~ '^\d{4}-\d{2}-\d{2}$')
      OR (pa.data->>'endDate')::date >= CURRENT_DATE
    )
    AND (
      NOT ((pa.data->>'contractExpiry') ~ '^\d{4}-\d{2}-\d{2}$')
      OR (pa.data->>'contractExpiry')::date >= CURRENT_DATE
    )
    AND (
      'all' = ANY(pa.target_sections)
      OR p_section = ANY(pa.target_sections)
      OR (p_section IN ('realestate', 'properties') AND ('realestate' = ANY(pa.target_sections) OR 'properties' = ANY(pa.target_sections) OR pa.placement_id = '5'))
      OR (p_section = 'auctions' AND pa.placement_id = '6')
      OR (p_section = 'jobs' AND pa.placement_id = '7')
      OR (p_section = 'phones' AND pa.placement_id = '9')
      OR (p_section = 'community' AND pa.placement_id IN ('1', '2'))
    )
    AND (
      p_slot = 'all'
      OR pa.slot_key = 'all'
      OR pa.slot_key = p_slot
    )
  ORDER BY
    (-ln(GREATEST(random(), 0.0001)) / GREATEST(COALESCE(pa.priority, 1), 1)) ASC
  LIMIT 1;

  IF v_chosen_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  UPDATE public.published_ads
  SET
    views = COALESCE(views, 0) + 1,
    last_served_at = NOW()
  WHERE id = v_chosen_id
  RETURNING *;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_eligible_ads_for_slot(
  p_section text,
  p_slot text DEFAULT 'all'::text,
  p_ad_kind text DEFAULT 'sponsor'::text,
  p_limit integer DEFAULT 4
)
RETURNS SETOF public.published_ads
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT pa.*
  FROM public.published_ads pa
  WHERE pa.status = 'active'
    AND pa.ad_kind = p_ad_kind
    AND (pa.start_date IS NULL OR pa.start_date <= CURRENT_DATE)
    AND (pa.end_date IS NULL OR pa.end_date >= CURRENT_DATE)
    AND (
      NOT ((pa.data->>'startDate') ~ '^\d{4}-\d{2}-\d{2}$')
      OR (pa.data->>'startDate')::date <= CURRENT_DATE
    )
    AND (
      NOT ((pa.data->>'endDate') ~ '^\d{4}-\d{2}-\d{2}$')
      OR (pa.data->>'endDate')::date >= CURRENT_DATE
    )
    AND (
      NOT ((pa.data->>'contractExpiry') ~ '^\d{4}-\d{2}-\d{2}$')
      OR (pa.data->>'contractExpiry')::date >= CURRENT_DATE
    )
    AND (
      'all' = ANY(pa.target_sections)
      OR p_section = ANY(pa.target_sections)
      OR (p_section IN ('realestate', 'properties') AND ('realestate' = ANY(pa.target_sections) OR 'properties' = ANY(pa.target_sections) OR pa.placement_id = '5'))
      OR (p_section = 'auctions' AND pa.placement_id = '6')
      OR (p_section = 'jobs' AND pa.placement_id = '7')
      OR (p_section = 'phones' AND pa.placement_id = '9')
      OR (p_section = 'community' AND pa.placement_id IN ('1', '2'))
    )
    AND (
      p_slot = 'all'
      OR pa.slot_key = 'all'
      OR pa.slot_key = p_slot
    )
  ORDER BY
    (-ln(GREATEST(random(), 0.0001)) / GREATEST(COALESCE(pa.priority, 1), 1)) ASC
  LIMIT GREATEST(COALESCE(p_limit, 4), 1);
$function$;

-- 9. تهيئة الحقول والقوائم المنسدلة الافتراضية للتبويبات الـ 4 الأساسية (آمن بدون تكرار)
INSERT INTO public.community_tab_fields (section_id, field_key, label, field_type, placeholder, is_required, is_visible, is_active, card_display, sort_order, is_system)
VALUES
  ('phones', 'brand', 'الشركة المصنعة', 'select', 'اختر الشركة المصنعة', true, true, true, true, 1, true),
  ('phones', 'model', 'الموديل', 'text', 'مثال: iPhone 15 Pro Max', true, true, true, true, 2, true),
  ('phones', 'storage', 'سعة التخزين', 'select', 'اختر السعة', true, true, true, true, 3, true),
  ('phones', 'ram', 'الذاكرة العشوائية (RAM)', 'select', 'اختر الذاكرة', false, true, true, true, 4, true),
  ('phones', 'condition', 'حالة الجهاز', 'select', 'اختر الحالة', true, true, true, true, 5, true),
  ('phones', 'battery_health', 'نسبة البطارية %', 'number', 'مثال: 95', false, true, true, true, 6, true),
  ('phones', 'description', 'المواصفات والتفاصيل', 'textarea', 'اذكر حالة الجهاز والملحقات...', false, true, true, false, 7, true),

  ('properties', 'property_type', 'نوع العقار', 'select', 'اختر نوع العقار', true, true, true, true, 1, true),
  ('properties', 'listing_type', 'نوع العرض', 'select', 'بيع / إيجار', true, true, true, true, 2, true),
  ('properties', 'city', 'المحافظة / المدينة', 'text', 'مثال: صنعاء', true, true, true, true, 3, true),
  ('properties', 'district', 'الحي / المنطقة', 'text', 'مثال: حدة', false, true, true, true, 4, true),
  ('properties', 'area_sqm', 'المساحة (م²)', 'number', 'مثال: 250', false, true, true, true, 5, true),
  ('properties', 'bedrooms', 'عدد الغرف', 'number', 'مثال: 4', false, true, true, true, 6, true),
  ('properties', 'finishing', 'التشطيب', 'select', 'اختر حالة التشطيب', false, true, true, true, 7, true),

  ('jobs', 'category', 'المجال الوظيفي', 'select', 'اختر المجال', false, true, true, true, 1, true),
  ('jobs', 'title', 'المسمى الوظيفي', 'text', 'مثال: محاسب مالي', true, true, true, true, 2, true),
  ('jobs', 'job_type', 'نوع الدوام', 'select', 'اختر نوع الدوام', true, true, true, true, 3, true),
  ('jobs', 'experience', 'الخبرة المطلوبة', 'select', 'اختر مستوى الخبرة', true, true, true, true, 4, true),
  ('jobs', 'qualification', 'المؤهل العلمي', 'select', 'اختر المؤهل', false, true, true, true, 5, true),
  ('jobs', 'city', 'مكان العمل', 'text', 'مثال: عدن', true, true, true, true, 6, true),

  ('auctions', 'category', 'التصنيف', 'select', 'اختر التصنيف', true, true, true, true, 1, true),
  ('auctions', 'sale_type', 'نوع المزاد / البيع', 'select', 'اختر نوع المزاد', true, true, true, true, 2, true),
  ('auctions', 'condition', 'الحالة', 'select', 'جديد / مستعمل', false, true, true, true, 3, true),
  ('auctions', 'duration_days', 'مدة المزاد (أيام)', 'number', 'مثال: 7', true, true, true, true, 4, true),
  ('auctions', 'terms', 'شروط المشاركة', 'textarea', 'اذكر شروط المزايدة والعربون...', false, true, true, false, 5, true),
  ('auctions', 'description', 'تفاصيل المزاد', 'textarea', 'وصف السلعة وحالتها...', true, true, true, false, 6, true)
ON CONFLICT (section_id, field_key) DO NOTHING;

INSERT INTO public.community_tab_field_options (field_id, section_id, option_value, option_label, sort_order)
SELECT f.id, f.section_id, v.val, v.lbl, v.ord
FROM public.community_tab_fields f
JOIN (VALUES
  ('phones','brand','iPhone (آبل)','iPhone (آبل)',1),
  ('phones','brand','Samsung (سامسونج)','Samsung (سامسونج)',2),
  ('phones','brand','Xiaomi (شاومي)','Xiaomi (شاومي)',3),
  ('phones','brand','Redmi (ريدمي)','Redmi (ريدمي)',4),
  ('phones','brand','Huawei (هواوي)','Huawei (هواوي)',5),
  ('phones','brand','Honor (هونر)','Honor (هونر)',6),
  ('phones','brand','Oppo (أوبو)','Oppo (أوبو)',7),
  ('phones','brand','Realme (ريلمي)','Realme (ريلمي)',8),
  ('phones','brand','Google Pixel','Google Pixel',9),
  ('phones','brand','OnePlus','OnePlus',10),
  ('phones','brand','أخرى','أخرى',11),
  ('phones','storage','64GB','64GB',1),
  ('phones','storage','128GB','128GB',2),
  ('phones','storage','256GB','256GB',3),
  ('phones','storage','512GB','512GB',4),
  ('phones','storage','1TB','1TB',5),
  ('phones','ram','4GB','4GB',1),
  ('phones','ram','6GB','6GB',2),
  ('phones','ram','8GB','8GB',3),
  ('phones','ram','12GB','12GB',4),
  ('phones','ram','16GB','16GB',5),
  ('phones','condition','new','جديد (مختوم)',1),
  ('phones','condition','like_new','كسر زيرو / شبه جديد',2),
  ('phones','condition','used','مستعمل نظيف',3),
  ('phones','condition','refurbished','مجدد',4),
  ('properties','property_type','apartment','شقة سكنية',1),
  ('properties','property_type','villa','فيلا',2),
  ('properties','property_type','house','بيت / عمارة',3),
  ('properties','property_type','land','أرض',4),
  ('properties','property_type','commercial','محل / مكتب تجاري',5),
  ('properties','listing_type','sale','للبيع',1),
  ('properties','listing_type','rent','للإيجار',2),
  ('properties','listing_type','investment','للاستثمار',3),
  ('properties','finishing','سوبر لوكس','سوبر لوكس',1),
  ('properties','finishing','تشطيب كامل','تشطيب كامل',2),
  ('properties','finishing','عظم / نصف تشطيب','عظم / نصف تشطيب',3),
  ('jobs','category','محاسبة ومالية','محاسبة ومالية',1),
  ('jobs','category','برمجة وتقنية','برمجة وتقنية',2),
  ('jobs','category','مبيعات وتسويق','مبيعات وتسويق',3),
  ('jobs','category','هندسة ومقاولات','هندسة ومقاولات',4),
  ('jobs','category','طب وصيدلة','طب وصيدلة',5),
  ('jobs','category','إدارة وأعمال','إدارة وأعمال',6),
  ('jobs','job_type','دوام كامل','دوام كامل',1),
  ('jobs','job_type','دوام جزئي','دوام جزئي',2),
  ('jobs','job_type','عمل عن بُعد','عمل عن بُعد',3),
  ('jobs','job_type','عقد مؤقت','عقد مؤقت',4),
  ('jobs','job_type','تدريب','تدريب',5),
  ('jobs','experience','بدون خبرة','بدون خبرة',1),
  ('jobs','experience','1-2 سنوات','1-2 سنوات',2),
  ('jobs','experience','3-5 سنوات','3-5 سنوات',3),
  ('jobs','experience','5+ سنوات','5+ سنوات',4),
  ('jobs','qualification','ثانوية عامة','ثانوية عامة',1),
  ('jobs','qualification','دبلوم','دبلوم',2),
  ('jobs','qualification','بكالوريوس','بكالوريوس',3),
  ('jobs','qualification','ماجستير / دكتوراه','ماجستير / دكتوراه',4),
  ('auctions','category','سيارات ومركبات','سيارات ومركبات',1),
  ('auctions','category','عقارات وأراضي','عقارات وأراضي',2),
  ('auctions','category','هواتف وإلكترونيات','هواتف وإلكترونيات',3),
  ('auctions','category','أرقام مميزة','أرقام مميزة',4),
  ('auctions','category','معدات ومقتنيات','معدات ومقتنيات',5),
  ('auctions','sale_type','auction','مزاد علني',1),
  ('auctions','sale_type','direct','صفقة فورية',2),
  ('auctions','condition','جديد','جديد',1),
  ('auctions','condition','مستعمل','مستعمل',2)
) AS v(sec, fkey, val, lbl, ord)
ON f.section_id = v.sec AND f.field_key = v.fkey
ON CONFLICT (field_id, option_value) DO NOTHING;
