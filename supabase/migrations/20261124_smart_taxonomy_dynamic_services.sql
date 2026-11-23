-- ============================================================================
-- Yemen Rating: Smart Taxonomy, Dynamic Category Services & Cards System
-- Safe, Additive & Idempotent (Zero data loss, Zero breaking changes)
-- ============================================================================

-- 1. توسيع جدول categories لدعم التصنيف الهرمي (رئيسي / فرعي) والتفعيل والوصف
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category_level text NOT NULL DEFAULT 'main',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS default_live_badge text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_level_chk') THEN
    ALTER TABLE public.categories
      ADD CONSTRAINT categories_level_chk CHECK (category_level IN ('main', 'sub'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active, category_level, sort_order);

-- 2. إنشاء التصنيفات الرئيسية (Main Sectors) بدون المساس بالمعرفات أو الروابط الحالية
INSERT INTO public.categories (name, slug, icon, type, sort_order, category_level, is_active, description)
VALUES
  ('المال والأعمال والبنوك', 'finance-banking', 'Landmark', 'entity', 1, 'main', true, 'البنوك وشبكات الصرافة والمحافظ الإلكترونية'),
  ('النقل والشحن والمركبات', 'transport-logistics', 'Truck', 'entity', 2, 'main', true, 'شركات النقل والشحن ومعارض وتأجير السيارات والدراجات'),
  ('الرعاية الصحية والطب', 'healthcare-medical', 'Stethoscope', 'entity', 3, 'main', true, 'المستشفيات والعيادات والمختبرات والصيدليات والبصريات'),
  ('المطاعم والمقاهي والأغذية', 'food-dining', 'Utensils', 'entity', 4, 'main', true, 'المطاعم والكافيهات والبوفيهات والمأكولات الشعبية'),
  ('الفنادق والسياحة والترفيه', 'hospitality-tourism', 'Hotel', 'entity', 5, 'main', true, 'الفنادق والشاليهات والحدائق وصالات الأفراح والنوادي'),
  ('العقارات والإنشاءات', 'real-estate-sector', 'Building2', 'entity', 6, 'main', true, 'مكاتب وشركات العقارات والبيع والإيجار والمقاولات'),
  ('التجارة والتسوق', 'retail-shopping', 'ShoppingBag', 'entity', 7, 'main', true, 'المولات ومراكز التسوق والسوبرماركت والمتاجر المتنوعة'),
  ('التعليم والتدريب', 'education-training', 'GraduationCap', 'entity', 8, 'main', true, 'الجامعات الخاصة والمدارس والمعاهد'),
  ('التقنية والمنصات الرقمية', 'tech-platforms', 'Globe', 'entity', 9, 'main', true, 'المواقع الإلكترونية والمنصات الرقمية والتطبيقات'),
  ('الخدمات المهنية والشركات والصناعة', 'corporate-services', 'Briefcase', 'entity', 10, 'main', true, 'الشركات والمؤسسات والمصانع وشركات التنظيف والخدمات المهنية')
ON CONFLICT (slug) DO UPDATE SET
  category_level = 'main',
  is_active = true,
  description = COALESCE(EXCLUDED.description, public.categories.description),
  updated_at = now();

-- 3. ربط التصنيفات الحالية كتفرعات دقيقة تحت التصنيفات الرئيسية مع الحفاظ على جميع الـ IDs والـ Slugs
DO $$
DECLARE
  v_finance uuid; v_transport uuid; v_health uuid; v_food uuid;
  v_hosp uuid; v_re uuid; v_retail uuid; v_edu uuid; v_tech uuid; v_corp uuid;
BEGIN
  SELECT id INTO v_finance   FROM public.categories WHERE slug = 'finance-banking';
  SELECT id INTO v_transport FROM public.categories WHERE slug = 'transport-logistics';
  SELECT id INTO v_health    FROM public.categories WHERE slug = 'healthcare-medical';
  SELECT id INTO v_food      FROM public.categories WHERE slug = 'food-dining';
  SELECT id INTO v_hosp      FROM public.categories WHERE slug = 'hospitality-tourism';
  SELECT id INTO v_re        FROM public.categories WHERE slug = 'real-estate-sector';
  SELECT id INTO v_retail    FROM public.categories WHERE slug = 'retail-shopping';
  SELECT id INTO v_edu       FROM public.categories WHERE slug = 'education-training';
  SELECT id INTO v_tech      FROM public.categories WHERE slug = 'tech-platforms';
  SELECT id INTO v_corp      FROM public.categories WHERE slug = 'corporate-services';

  -- المال والأعمال
  UPDATE public.categories SET parent_id = v_finance, category_level = 'sub', default_live_badge = 'الخدمات المصرفية متاحة'
  WHERE slug IN ('banks', 'exchanges', 'wallets');

  -- النقل والمركبات
  UPDATE public.categories SET parent_id = v_transport, category_level = 'sub',
    default_live_badge = CASE WHEN slug = 'transport' THEN 'تستقبل طلبات الشحن الآن' ELSE 'متاح لاستقبال العملاء' END
  WHERE slug IN ('transport', 'car-rental', 'car-dealerships', 'car-market', 'car-auction', 'motorcycle-dealerships');

  -- الرعاية الصحية
  UPDATE public.categories SET parent_id = v_health, category_level = 'sub',
    default_live_badge = CASE WHEN slug = 'hospitals' THEN 'الطوارئ متاحة 24 ساعة' WHEN slug = 'pharmacies' THEN 'مفتوح لخدمتكم' ELSE 'يستقبل المراجعين الآن' END
  WHERE slug IN ('hospitals', 'clinics', 'laboratories', 'pharmacies', 'optics-hearing');

  -- المطاعم والأغذية (تعديل تسمية "فلافل" إلى اسم أوضح مع إبقاء الـ ID والـ slug)
  UPDATE public.categories SET name = 'فلافل ومأكولات شعبية' WHERE id = '2222e3f7-10d5-4989-bb03-02a304253e2c';
  UPDATE public.categories SET parent_id = v_food, category_level = 'sub', default_live_badge = 'مفتوح لاستقبال الطلبات الآن'
  WHERE slug IN ('restaurants', 'cafes', 'buffets', 'cat-muh7ox9y');

  -- الفنادق والسياحة
  UPDATE public.categories SET parent_id = v_hosp, category_level = 'sub', default_live_badge = 'متاح للحجز الآن'
  WHERE slug IN ('hotels', 'chalets', 'parks', 'wedding-halls', 'steam-baths', 'gyms');

  -- العقارات
  UPDATE public.categories SET parent_id = v_re, category_level = 'sub', default_live_badge = 'عروض عقارية متاحة الآن'
  WHERE slug IN ('real-estate');

  -- التجارة والتسوق
  UPDATE public.categories SET parent_id = v_retail, category_level = 'sub', default_live_badge = 'مفتوح الآن'
  WHERE slug IN ('malls', 'shopping-centers', 'supermarkets', 'clothing-shoes', 'jewelry-gold', 'phones', 'Printing-Shops', 'shops');

  -- التعليم
  UPDATE public.categories SET parent_id = v_edu, category_level = 'sub', default_live_badge = 'التسجيل والاستعلام متاح'
  WHERE slug IN ('universities', 'schools');

  -- التقنية والمنصات الرقمية
  UPDATE public.categories SET name = 'مواقع ومنصات إلكترونية' WHERE id = '904b0efa-7f01-46fc-b60a-140c4652c902';
  UPDATE public.categories SET parent_id = v_tech, category_level = 'sub', default_live_badge = 'المنصة متاحة الآن'
  WHERE slug IN ('cat-muh92xq7');

  -- الخدمات المهنية والشركات
  UPDATE public.categories SET parent_id = v_corp, category_level = 'sub', default_live_badge = 'يستقبل الطلبات الآن'
  WHERE slug IN ('cleaning-companies', 'poultry-farms', 'beauty-salons', 'barbershops', 'companies', 'establishments', 'offices', 'factories');

  -- أرشفة تصنيف "مساحة اعلانية" (إيقاف عرضه كتصنيف منشآت دون حذفه)
  UPDATE public.categories SET is_active = false, category_level = 'sub', parent_id = v_corp
  WHERE id = 'b5d1f11d-5ab3-4d64-856a-6f26d6af8c60';
END $$;

-- 4. تصحيح تصنيف المنشآت التي كانت بدون تصنيف أو في تصنيف خاطئ بناءً على نشاطها الفعلي
-- أ) نقل "يور باي" من تصنيف فلافل إلى المحافظ الإلكترونية
UPDATE public.businesses
SET category_id = 'd29f6143-62ad-4dbf-be01-cf22de07e0ae',
    business_type = 'WALLET',
    updated_at = now()
WHERE id = 'f2f19a25-395e-42d8-8389-4b66018cae34';

-- ب) نقل "شبكة النجم للصرافة" من بنوك إلى صرافة
UPDATE public.businesses
SET category_id = 'eaebbd43-9b4e-4d39-8e80-bed105f43e5d',
    updated_at = now()
WHERE id = 'bb5431e6-cd87-493c-975d-da5b333c8b2a';

-- ج) ربط المنشآت التي كانت category_id = NULL بتصنيفاتها الحقيقية
UPDATE public.businesses
SET category_id = 'be60b454-70ee-4018-beb3-a9277efe1dc0', business_type = 'HEALTHCARE', updated_at = now()
WHERE id = 'b2c1c6da-ad5b-485c-8ea3-6317029254d1' AND category_id IS NULL; -- عيادة الدكتور محمد

UPDATE public.businesses
SET category_id = '2222e3f7-10d5-4989-bb03-02a304253e2c', business_type = 'RESTAURANT', updated_at = now()
WHERE id = '8e7998ef-3b3d-456a-acb7-d4fc6b9b528d' AND category_id IS NULL; -- فلافل فلسطين

UPDATE public.businesses
SET category_id = '3d1d9c82-c396-4f90-9f20-7736116d507e', business_type = 'BANK', updated_at = now()
WHERE id = '4f77e1dd-5007-4c76-b385-1552f2415f02' AND category_id IS NULL; -- بنك اليمن والبحرين

UPDATE public.businesses
SET category_id = 'b17b2564-14d2-42b7-8a60-3c7ff6ee1479', business_type = 'TRANSPORT', updated_at = now()
WHERE id = 'dd506b05-13e9-4273-b97f-e82df1ae72b8' AND category_id IS NULL; -- الجوال لخدمات النقل الداخلي

UPDATE public.businesses
SET category_id = '465d7e8c-1f78-4023-8a06-bf797f717ee9', updated_at = now()
WHERE id = 'db58019e-7823-4039-afb8-3ec0eeaa3c3b' AND category_id IS NULL; -- مزارع جودم للدواجن

UPDATE public.businesses
SET category_id = '904b0efa-7f01-46fc-b60a-140c4652c902', updated_at = now()
WHERE id IN ('23936d65-213c-4a3d-a2df-9e9dc119a88e', 'cfb023f0-81eb-428d-a87a-7ddefb482637') AND category_id IS NULL; -- يمن ريتنج

-- 5. جدول قوالب الخدمات الديناميكية لكل تصنيف (تُدار بالكامل من لوحة الإدارة دون إعادة برمجة)
CREATE TABLE IF NOT EXISTS public.category_service_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  service_key text NOT NULL,
  name_ar text NOT NULL,
  description text,
  icon_name text NOT NULL DEFAULT 'Sparkles',
  field_schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, service_key)
);

CREATE INDEX IF NOT EXISTS idx_cat_svc_templates_cat ON public.category_service_templates(category_id, sort_order);

-- 6. جدول البطاقات التجارية الأفقية لكل تصنيف (تظهر أسفل أزرار المتابعة والتقييم والتواصل)
CREATE TABLE IF NOT EXISTS public.category_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  card_key text NOT NULL,
  title_ar text NOT NULL,
  subtitle_ar text,
  icon_name text NOT NULL DEFAULT 'Layers',
  target_type text NOT NULL DEFAULT 'drawer' CHECK (target_type IN ('drawer', 'tab', 'services_filter')),
  target_tab text,
  linked_service_key text,
  hide_when_empty boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, card_key)
);

CREATE INDEX IF NOT EXISTS idx_cat_cards_cat ON public.category_cards(category_id, sort_order);

-- 7. جدول الخدمات الفعلية لكل منشأة (لا يُفترض أن كل منشأة تقدم جميع خدمات تصنيفها)
CREATE TABLE IF NOT EXISTS public.business_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.category_service_templates(id) ON DELETE SET NULL,
  service_key text NOT NULL,
  name_ar text NOT NULL,
  description text,
  price numeric(15,2),
  currency text NOT NULL DEFAULT 'YER',
  price_label text,
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, service_key)
);

CREATE INDEX IF NOT EXISTS idx_biz_services_biz ON public.business_services(business_id, is_enabled, sort_order);

-- 8. تفعيل RLS وسياسات الأمان
ALTER TABLE public.category_service_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;

-- قوالب الخدمات: القراءة للجميع للمفعل أو المشرف، والإدارة للمشرف فقط
DROP POLICY IF EXISTS "cat_svc_templates_public_read" ON public.category_service_templates;
CREATE POLICY "cat_svc_templates_public_read" ON public.category_service_templates
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "cat_svc_templates_admin_all" ON public.category_service_templates;
CREATE POLICY "cat_svc_templates_admin_all" ON public.category_service_templates
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- البطاقات التجارية: القراءة للجميع للمفعل أو المشرف، والإدارة للمشرف فقط
DROP POLICY IF EXISTS "cat_cards_public_read" ON public.category_cards;
CREATE POLICY "cat_cards_public_read" ON public.category_cards
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "cat_cards_admin_all" ON public.category_cards;
CREATE POLICY "cat_cards_admin_all" ON public.category_cards
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- خدمات المنشآت: الزائر يرى الخدمات المفعلة فقط؛ المالك والمشرف المفوض والمشرف العام يرون ويديرون خدمات المنشأة
DROP POLICY IF EXISTS "biz_services_select" ON public.business_services;
CREATE POLICY "biz_services_select" ON public.business_services
  FOR SELECT USING (
    is_enabled = true
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND (b.owner_id = auth.uid() OR b.claimed_by_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.page_admins pa
      WHERE pa.business_id = business_services.business_id
        AND pa.user_id = auth.uid()
        AND pa.is_active = true
    )
  );

DROP POLICY IF EXISTS "biz_services_manage" ON public.business_services;
CREATE POLICY "biz_services_manage" ON public.business_services
  FOR ALL USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND (b.owner_id = auth.uid() OR b.claimed_by_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.page_admins pa
      WHERE pa.business_id = business_services.business_id
        AND pa.user_id = auth.uid()
        AND pa.is_active = true
        AND COALESCE((pa.permissions->>'can_edit_info')::boolean, false) = true
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND (b.owner_id = auth.uid() OR b.claimed_by_user_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.page_admins pa
      WHERE pa.business_id = business_services.business_id
        AND pa.user_id = auth.uid()
        AND pa.is_active = true
        AND COALESCE((pa.permissions->>'can_edit_info')::boolean, false) = true
    )
  );

-- 9. دالة آمنة لنقل منشأة بين التصنيفات مع الحفاظ على بياناتها وخدماتها وتسجيل العملية
CREATE OR REPLACE FUNCTION public.admin_move_business_category(
  p_business_id uuid,
  p_new_category_id uuid,
  p_sub_category text DEFAULT NULL,
  p_reason text DEFAULT 'نقل تصنيف المنشأة من لوحة الإدارة'
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
  SELECT * INTO v_old FROM public.businesses WHERE id = p_business_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'المنشأة غير موجودة';
  END IF;

  IF p_new_category_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.categories WHERE id = p_new_category_id) THEN
    RAISE EXCEPTION 'التصنيف المستهدف غير موجود';
  END IF;

  UPDATE public.businesses
  SET category_id = p_new_category_id,
      sub_category = COALESCE(p_sub_category, sub_category),
      updated_at = now()
  WHERE id = p_business_id;

  SELECT * INTO v_new FROM public.businesses WHERE id = p_business_id;

  INSERT INTO public.admin_moderation_logs (
    actor_id, actor_name, actor_email, target_type, target_id, target_name,
    action_type, reason, old_value, new_value
  ) VALUES (
    v_actor.actor_uid, v_actor.actor_name, v_actor.actor_email,
    'page', p_business_id::text, v_new.name,
    'move_category', COALESCE(NULLIF(trim(p_reason), ''), 'تغيير التصنيف'),
    jsonb_build_object('category_id', v_old.category_id, 'sub_category', v_old.sub_category),
    jsonb_build_object('category_id', v_new.category_id, 'sub_category', v_new.sub_category)
  );

  RETURN to_jsonb(v_new);
END;
$$;

-- 10. تهيئة قوالب الخدمات والبطاقات لجميع القطاعات والأنشطة في المنصة
DO $$
DECLARE
  c_id uuid;
BEGIN
  -- دالة مساعدة داخل الكتلة لإدراج قوالب وبطاقات بأمان
  -- 1) قطاع النقل والشحن
  SELECT id INTO c_id FROM public.categories WHERE slug = 'transport';
  IF c_id IS NOT NULL THEN
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'cargo_shipping', 'نقل البضائع والشحن الداخلي', 'شحن البضائع والطرود بين المحافظات اليمنية', 'Package', '[{"key":"routes","label":"خطوط النقل والوجهات","type":"text"},{"key":"coverage_areas","label":"مناطق التغطية","type":"text"}]'::jsonb, 1),
      (c_id, 'transport_routes', 'خطوط النقل والوجهات', 'المحافظات والمدن التي تغطيها رحلات النقل', 'MapPin', '[{"key":"from_cities","label":"نقاط الانطلاق","type":"text"},{"key":"to_cities","label":"الوجهات المغطاة","type":"text"},{"key":"schedule","label":"مواعيد الرحلات","type":"text"}]'::jsonb, 2),
      (c_id, 'fleet_vehicles', 'أسطول المركبات وأنواعها', 'الشاحنات والناقلات والحافلات المتوفرة', 'Truck', '[{"key":"vehicle_types","label":"أنواع المركبات","type":"text"},{"key":"capacity","label":"الحمولة والسعة","type":"text"}]'::jsonb, 3),
      (c_id, 'furniture_parcels', 'نقل الأثاث والطرود الخاصة', 'تغليف ونقل الأثاث والطرود السريعة', 'Box', '[{"key":"packaging","label":"التغليف والحماية","type":"text"}]'::jsonb, 4),
      (c_id, 'cold_chain', 'شحن مبرد وبضائع حساسة', 'نقل المواد الغذائية والأدوية بدرجات حرارة مضبوطة', 'Snowflake', '[{"key":"temp_range","label":"درجة التبريد","type":"text"}]'::jsonb, 5),
      (c_id, 'passenger_vip', 'نقل الركاب وحجز التذاكر', 'رحلات ركاب VIP وحجز إلكتروني', 'Bus', '[{"key":"booking_method","label":"طريقة الحجز","type":"text"}]'::jsonb, 6)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'services', 'الخدمات', 'أنواع الشحن', 'Package', 'tab', 'services', NULL, true, 1),
      (c_id, 'destinations', 'الوجهات', 'خطوط النقل', 'MapPin', 'drawer', NULL, 'transport_routes', true, 2),
      (c_id, 'fleet', 'أسطول المركبات', 'الشاحنات المتوفرة', 'Truck', 'drawer', NULL, 'fleet_vehicles', true, 3),
      (c_id, 'gallery', 'معرض الصور', 'شاحناتنا وأعمالنا', 'Image', 'tab', 'media', NULL, true, 4),
      (c_id, 'about', 'معلومات المنشأة', 'نبذة وتفاصيل أكثر', 'Info', 'tab', 'about', NULL, false, 5)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END IF;

  -- 2) قطاع المطاعم والكافيهات والبوفيهات والفلافل
  FOR c_id IN SELECT id FROM public.categories WHERE slug IN ('restaurants', 'cafes', 'buffets', 'cat-muh7ox9y') LOOP
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'food_menu', 'قائمة الطعام والوجبات', 'الأطباق والوجبات والمشروبات المقدمة', 'UtensilsCrossed', '[{"key":"menu_highlights","label":"أبرز الوجبات","type":"text"},{"key":"price_range","label":"نطاق الأسعار","type":"text"}]'::jsonb, 1),
      (c_id, 'delivery_service', 'خدمة التوصيل', 'توصيل الطلبات للمنازل والمكاتب', 'Bike', '[{"key":"delivery_areas","label":"مناطق التوصيل","type":"text"},{"key":"delivery_fee","label":"رسوم/زمن التوصيل","type":"text"}]'::jsonb, 2),
      (c_id, 'family_dining', 'صالات العائلات والحجوزات', 'جلسات خاصة للعائلات وحجز الطاولات', 'Users', '[{"key":"seating_capacity","label":"سعة الجلسات","type":"text"}]'::jsonb, 3),
      (c_id, 'catering_events', 'تجهيز الولائم والمناسبات', 'بوفيهات وتجهيز ولائم وحفلات', 'Sparkles', '[{"key":"min_guests","label":"الحد الأدنى للطلبات","type":"text"}]'::jsonb, 4)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'menu', 'قائمة الطعام', 'الوجبات والأسعار', 'UtensilsCrossed', 'drawer', NULL, 'food_menu', true, 1),
      (c_id, 'offers', 'العروض', 'عروض وخصومات', 'Tag', 'drawer', NULL, NULL, true, 2),
      (c_id, 'delivery', 'التوصيل والحجز', 'أوقات العمل والطلبات', 'Bike', 'drawer', NULL, 'delivery_service', true, 3),
      (c_id, 'gallery', 'معرض الصور', 'الأطباق والجلسات', 'Image', 'tab', 'media', NULL, true, 4),
      (c_id, 'about', 'معلومات المنشأة', 'الموقع وساعات العمل', 'Info', 'tab', 'about', NULL, false, 5)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END LOOP;

  -- 3) قطاع المستشفيات والعيادات والمختبرات والصيدليات والبصريات
  SELECT id INTO c_id FROM public.categories WHERE slug = 'hospitals';
  IF c_id IS NOT NULL THEN
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'medical_specialties', 'التخصصات الطبية', 'العيادات والتخصصات الاستشارية المتوفرة', 'Stethoscope', '[{"key":"specialties_list","label":"التخصصات المتاحة","type":"text"}]'::jsonb, 1),
      (c_id, 'hospital_departments', 'الأقسام والطوارئ والعناية', 'الطوارئ 24/7 والعناية المركزة والعمليات', 'HeartPulse', '[{"key":"departments","label":"الأقسام العاملة","type":"text"}]'::jsonb, 2),
      (c_id, 'doctors_staff', 'الأطباء والاستشاريون', 'الكادر الطبي وأوقات دوامهم', 'UserCheck', '[{"key":"doctors","label":"قائمة الأطباء","type":"text"}]'::jsonb, 3),
      (c_id, 'appointments_booking', 'حجز المواعيد والفروع', 'آلية حجز المواعيد وفروع المستشفى', 'CalendarCheck', '[{"key":"booking_phone","label":"رقم الحجز","type":"text"}]'::jsonb, 4),
      (c_id, 'diagnostics_lab', 'المختبر والأشعة والصيدلية', 'التحاليل والأشعة المقطعية والرنين والصيدلية الداخلية', 'FlaskConical', '[{"key":"lab_hours","label":"ساعات العمل","type":"text"}]'::jsonb, 5)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'specialties', 'التخصصات', 'التخصصات الطبية', 'Stethoscope', 'drawer', NULL, 'medical_specialties', true, 1),
      (c_id, 'departments', 'الأقسام', 'الطوارئ والعناية', 'HeartPulse', 'drawer', NULL, 'hospital_departments', true, 2),
      (c_id, 'doctors', 'الأطباء', 'الكادر الاستشاري', 'UserCheck', 'drawer', NULL, 'doctors_staff', true, 3),
      (c_id, 'appointments', 'المواعيد والفروع', 'الحجز وساعات العمل', 'CalendarCheck', 'tab', 'about', 'appointments_booking', false, 4)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END IF;

  FOR c_id IN SELECT id FROM public.categories WHERE slug IN ('clinics', 'laboratories', 'pharmacies', 'optics-hearing') LOOP
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'primary_medical_service', 'الخدمات الطبية والتشخيصية', 'الخدمات والتخصصات والفحوصات المقدمة', 'Stethoscope', '[{"key":"scope","label":"نطاق الخدمة","type":"text"}]'::jsonb, 1),
      (c_id, 'home_service_delivery', 'الخدمة المنزلية / التوصيل', 'توصيل الأدوية أو سحب العينات المنزلي', 'Home', '[{"key":"coverage","label":"المناطق المغطاة","type":"text"}]'::jsonb, 2),
      (c_id, 'appointments_hours', 'المواعيد والمناوبة', 'أوقات الدوام والحجز المسبق', 'Clock', '[{"key":"hours","label":"فترة العمل","type":"text"}]'::jsonb, 3)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'services', 'الخدمات الطبية', 'التخصصات والفحوصات', 'Stethoscope', 'tab', 'services', NULL, true, 1),
      (c_id, 'appointments', 'المواعيد', 'ساعات الدوام والحجز', 'Clock', 'tab', 'about', 'appointments_hours', false, 2),
      (c_id, 'gallery', 'معرض الصور', 'التجهيزات والمركز', 'Image', 'tab', 'media', NULL, true, 3)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END LOOP;

  -- 4) قطاع العقارات
  SELECT id INTO c_id FROM public.categories WHERE slug = 'real-estate';
  IF c_id IS NOT NULL THEN
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'properties_sale', 'عقارات للبيع', 'أراضي وفلل وشقق وعمائر للبيع', 'Building2', '[{"key":"property_types","label":"أنواع العقارات","type":"text"},{"key":"locations","label":"المواقع","type":"text"},{"key":"price_range","label":"نطاق الأسعار","type":"text"}]'::jsonb, 1),
      (c_id, 'properties_rent', 'عقارات للإيجار', 'شقق ومحلات ومكاتب وفلل للإيجار', 'KeyRound', '[{"key":"locations","label":"الأحياء المغطاة","type":"text"},{"key":"price_range","label":"الإيجار الشهري","type":"text"}]'::jsonb, 2),
      (c_id, 'real_estate_eval', 'التقييم والاستثمار العقاري', 'تسويق وإدارة أملاك وتثمين عقاري', 'FileText', '[{"key":"commission","label":"نطاق التغطية","type":"text"}]'::jsonb, 3)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'properties', 'العقارات المعروضة', 'البيع والإيجار', 'Building2', 'tab', 'services', NULL, true, 1),
      (c_id, 'locations', 'المواقع', 'المناطق والأسعار', 'MapPin', 'drawer', NULL, 'properties_sale', true, 2),
      (c_id, 'gallery', 'معرض الصور', 'صور العقارات', 'Image', 'tab', 'media', NULL, true, 3),
      (c_id, 'about', 'معلومات المكتب', 'التواصل والفروع', 'Info', 'tab', 'about', NULL, false, 4)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END IF;

  -- 5) قطاع الفنادق والشاليهات والحدائق وصالات الأفراح والحمامات والنوادي
  FOR c_id IN SELECT id FROM public.categories WHERE slug IN ('hotels', 'chalets', 'parks', 'wedding-halls', 'steam-baths', 'gyms') LOOP
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'rooms_spaces', 'الغرف والأجنحة والقاعات', 'أنواع الغرف أو الشاليهات أو القاعات والسعات', 'BedDouble', '[{"key":"types","label":"الأنواع والسعات","type":"text"},{"key":"rates","label":"الأسعار التقريبية","type":"text"}]'::jsonb, 1),
      (c_id, 'amenities_facilities', 'المرافق والخدمات', 'المسابح، المطعم، المواقف، الإنترنت، الصالات', 'Sparkles', '[{"key":"amenities","label":"المرافق المتاحة","type":"text"}]'::jsonb, 2),
      (c_id, 'reservations', 'الحجوزات والمواعيد', 'نظام الحجز المباشر ومواعيد الدخول', 'CalendarCheck', '[{"key":"checkin_policy","label":"سياسة الحجز","type":"text"}]'::jsonb, 3)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'rooms', 'الغرف والمرافق', 'الأنواع والأسعار', 'BedDouble', 'drawer', NULL, 'rooms_spaces', true, 1),
      (c_id, 'facilities', 'الخدمات والمزايا', 'مرافق الضيافة', 'Sparkles', 'tab', 'services', NULL, true, 2),
      (c_id, 'gallery', 'معرض الصور', 'جولة مصورة', 'Image', 'tab', 'media', NULL, true, 3),
      (c_id, 'about', 'الحجز والموقع', 'التواصل وأوقات العمل', 'Info', 'tab', 'about', NULL, false, 4)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END LOOP;

  -- 6) قطاع البنوك والصرافة والمحافظ الإلكترونية
  FOR c_id IN SELECT id FROM public.categories WHERE slug IN ('banks', 'exchanges', 'wallets') LOOP
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'transfers_payments', 'الحوالات والمدفوعات', 'التحويلات المالية وسداد الفواتير والمشتريات', 'ArrowLeftRight', '[{"key":"channels","label":"القنوات المتاحة","type":"text"}]'::jsonb, 1),
      (c_id, 'accounts_cards', 'الحسابات والبطاقات والتمويل', 'فتح الحسابات، البطاقات المصرفية، والتمويل', 'CreditCard', '[{"key":"products","label":"المنتجات المصرفية","type":"text"}]'::jsonb, 2),
      (c_id, 'digital_app_atm', 'التطبيق الرقمي وشبكة الفروع والصرافات', 'الخدمات عبر التطبيق ومواقع الفروع ونقاط الخدمة', 'Smartphone', '[{"key":"coverage","label":"الفروع ونقاط الخدمة","type":"text"}]'::jsonb, 3)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'services', 'الخدمات المالية', 'الحوالات والحسابات', 'Landmark', 'tab', 'services', NULL, true, 1),
      (c_id, 'branches', 'الفروع ونقاط الخدمة', 'المواقع والتغطية', 'MapPin', 'tab', 'about', NULL, false, 2),
      (c_id, 'offers', 'العروض والباقات', 'مزايا العملاء', 'Tag', 'drawer', NULL, NULL, true, 3)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END LOOP;

  -- 7) قطاع السيارات والدراجات وتأجيرها
  FOR c_id IN SELECT id FROM public.categories WHERE slug IN ('car-dealerships', 'car-market', 'car-auction', 'car-rental', 'motorcycle-dealerships') LOOP
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'vehicles_catalog', 'المركبات والأنواع المتوفرة', 'جديد ومستعمل، موديلات وماركات متوفرة', 'Car', '[{"key":"brands","label":"الماركات والفئات","type":"text"},{"key":"price_range","label":"نطاق الأسعار","type":"text"}]'::jsonb, 1),
      (c_id, 'inspection_warranty', 'الفحص والترسيم والضمان', 'فحص فني ونقل ملكية وتسهيلات', 'ShieldCheck', '[{"key":"warranty","label":"شروط الضمان/التأجير","type":"text"}]'::jsonb, 2)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'vehicles', 'المركبات المتوفرة', 'الموديلات والأسعار', 'Car', 'drawer', NULL, 'vehicles_catalog', true, 1),
      (c_id, 'services', 'الخدمات والضمان', 'الفحص والتمويل', 'ShieldCheck', 'tab', 'services', NULL, true, 2),
      (c_id, 'gallery', 'معرض الصور', 'صور المعرض', 'Image', 'tab', 'media', NULL, true, 3),
      (c_id, 'about', 'معلومات المعرض', 'الموقع والتواصل', 'Info', 'tab', 'about', NULL, false, 4)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END LOOP;

  -- 8) قطاع التعليم (الجامعات والمدارس)
  FOR c_id IN SELECT id FROM public.categories WHERE slug IN ('universities', 'schools') LOOP
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'academic_programs', 'الكليات والمراحل والبرامج', 'التخصصات أو المراحل الدراسية والمناهج', 'GraduationCap', '[{"key":"programs","label":"البرامج والمناهج","type":"text"}]'::jsonb, 1),
      (c_id, 'campus_facilities', 'المعامل والنقل والمرافق', 'المختبرات، الباصات، الأنشطة، والرسوم/المنح', 'BookOpen', '[{"key":"facilities","label":"المرافق المتاحة","type":"text"}]'::jsonb, 2)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'programs', 'البرامج والتخصصات', 'المناهج المعتمدة', 'GraduationCap', 'drawer', NULL, 'academic_programs', true, 1),
      (c_id, 'services', 'الخدمات والمرافق', 'النقل والمختبرات', 'BookOpen', 'tab', 'services', NULL, true, 2),
      (c_id, 'gallery', 'معرض الصور', 'الحرم والمرافق', 'Image', 'tab', 'media', NULL, true, 3),
      (c_id, 'about', 'التواصل والفروع', 'العنوان وساعات الدوام', 'Info', 'tab', 'about', NULL, false, 4)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END LOOP;

  -- 9) بقية التصنيفات التجارية والمهنية والتقنية (قوالب مخصصة لكل منها)
  FOR c_id IN SELECT id FROM public.categories WHERE slug IN (
    'malls', 'shopping-centers', 'supermarkets', 'clothing-shoes', 'jewelry-gold',
    'phones', 'Printing-Shops', 'shops', 'cleaning-companies', 'poultry-farms',
    'beauty-salons', 'barbershops', 'cat-muh92xq7', 'companies', 'establishments', 'offices', 'factories'
  ) LOOP
    INSERT INTO public.category_service_templates (category_id, service_key, name_ar, description, icon_name, field_schema, sort_order) VALUES
      (c_id, 'core_offerings', 'الخدمات والمنتجات الأساسية', 'المنتجات أو الخدمات التي تقدمها المنشأة', 'ShoppingBag', '[{"key":"items","label":"التفاصيل والأقسام","type":"text"},{"key":"price_info","label":"معلومات الأسعار","type":"text"}]'::jsonb, 1),
      (c_id, 'delivery_orders', 'التوصيل والطلبات الخاصة', 'التوصيل أو التجهيز حسب الطلب', 'Truck', '[{"key":"coverage","label":"مناطق الخدمة","type":"text"}]'::jsonb, 2)
    ON CONFLICT (category_id, service_key) DO NOTHING;

    INSERT INTO public.category_cards (category_id, card_key, title_ar, subtitle_ar, icon_name, target_type, target_tab, linked_service_key, hide_when_empty, sort_order) VALUES
      (c_id, 'services', 'الخدمات والمنتجات', 'ما تقدمه المنشأة', 'ShoppingBag', 'tab', 'services', NULL, true, 1),
      (c_id, 'offers', 'العروض', 'عروض وخصومات حالية', 'Tag', 'drawer', NULL, NULL, true, 2),
      (c_id, 'gallery', 'معرض الصور', 'الأعمال والمنتجات', 'Image', 'tab', 'media', NULL, true, 3),
      (c_id, 'about', 'معلومات المنشأة', 'الموقع وأوقات العمل', 'Info', 'tab', 'about', NULL, false, 4)
    ON CONFLICT (category_id, card_key) DO NOTHING;
  END LOOP;
END $$;

-- 11. ترحيل آمن للخدمات المفعلة فعلياً فقط (enabled = true) من sections_config->features->sector_features إلى business_services
-- ملاحظة: لا يتم تفعيل أي خدمة كانت enabled = false مطلقاً
INSERT INTO public.business_services (business_id, service_key, name_ar, description, is_enabled, sort_order)
SELECT
  b.id,
  'legacy_' || COALESCE(NULLIF(elem->>'id', ''), md5(elem->>'label')),
  elem->>'label',
  NULLIF(trim(COALESCE(elem->>'details', '')), ''),
  true,
  (ord - 1)::int
FROM public.businesses b
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN jsonb_typeof(b.sections_config->'features'->'sector_features') = 'array'
    THEN b.sections_config->'features'->'sector_features'
    ELSE '[]'::jsonb
  END
) WITH ORDINALITY AS t(elem, ord)
WHERE COALESCE((elem->>'enabled')::boolean, false) = true
  AND COALESCE(trim(elem->>'label'), '') <> ''
ON CONFLICT (business_id, service_key) DO NOTHING;
