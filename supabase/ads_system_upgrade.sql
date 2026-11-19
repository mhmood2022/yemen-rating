-- ترقية منظومة الإعلانات والرعاة على جدول published_ads الحالي دون حذف أي بيانات

ALTER TABLE public.published_ads ADD COLUMN IF NOT EXISTS ad_kind TEXT NOT NULL DEFAULT 'banner';
ALTER TABLE public.published_ads ADD COLUMN IF NOT EXISTS target_sections TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.published_ads ADD COLUMN IF NOT EXISTS slot_key TEXT NOT NULL DEFAULT 'all';
ALTER TABLE public.published_ads ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.published_ads ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.published_ads ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.published_ads ADD COLUMN IF NOT EXISTS last_served_at TIMESTAMPTZ NOT NULL DEFAULT '1970-01-01T00:00:00Z';

-- ترحيل آمن للحملات الموجودة مسبقاً لتتوافق مع الهيكل الجديد
UPDATE public.published_ads
SET
  ad_kind = CASE
    WHEN placement_id = 'home_sponsor'
      OR COALESCE((data->>'isSponsor')::boolean, false) = true
      OR COALESCE(data->>'sponsorTag', '') <> ''
    THEN 'sponsor'
    ELSE COALESCE(NULLIF(ad_kind, ''), 'banner')
  END,
  slot_key = CASE
    WHEN placement_id = 'home_sponsor' THEN 'header_sponsor'
    ELSE COALESCE(NULLIF(slot_key, ''), 'all')
  END,
  target_sections = CASE
    WHEN array_length(target_sections, 1) IS NOT NULL THEN target_sections
    WHEN placement_id = '5' THEN ARRAY['realestate']
    WHEN placement_id = '6' THEN ARRAY['auctions']
    WHEN placement_id = '7' THEN ARRAY['jobs']
    WHEN placement_id = '9' THEN ARRAY['phones']
    WHEN placement_id IN ('1', '2') THEN ARRAY['community']
    WHEN placement_id IN ('10', 'home_sponsor') THEN ARRAY['all']
    ELSE ARRAY['all']
  END,
  start_date = COALESCE(
    start_date,
    CASE WHEN (data->>'startDate') ~ '^\d{4}-\d{2}-\d{2}$' THEN (data->>'startDate')::date ELSE NULL END
  ),
  end_date = COALESCE(
    end_date,
    CASE
      WHEN (data->>'endDate') ~ '^\d{4}-\d{2}-\d{2}$' THEN (data->>'endDate')::date
      WHEN (data->>'contractExpiry') ~ '^\d{4}-\d{2}-\d{2}$' THEN (data->>'contractExpiry')::date
      ELSE NULL
    END
  );

CREATE INDEX IF NOT EXISTS idx_published_ads_status_kind
  ON public.published_ads (status, ad_kind);
CREATE INDEX IF NOT EXISTS idx_published_ads_sections_gin
  ON public.published_ads USING GIN (target_sections);

-- دالة الخادم لاختيار إعلان واحد بالتناوب العادل وتحديث المشاهدة ذرياً
CREATE OR REPLACE FUNCTION public.get_eligible_ad_for_slot(
  p_section TEXT,
  p_slot TEXT DEFAULT 'all',
  p_ad_kind TEXT DEFAULT 'banner',
  p_exclude_ids TEXT[] DEFAULT '{}'
)
RETURNS SETOF public.published_ads
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chosen_id TEXT;
BEGIN
  SELECT pa.id INTO v_chosen_id
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
      OR (p_section = 'realestate' AND pa.placement_id = '5')
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
    CASE
      WHEN array_length(p_exclude_ids, 1) IS NOT NULL AND pa.id = ANY(p_exclude_ids) THEN 1
      ELSE 0
    END ASC,
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
$$;

-- دالة الخادم لجلب حتى 4 حملات مؤهلة (للرعاة المتعددين في رأس القسم)
CREATE OR REPLACE FUNCTION public.get_eligible_ads_for_slot(
  p_section TEXT,
  p_slot TEXT DEFAULT 'all',
  p_ad_kind TEXT DEFAULT 'sponsor',
  p_limit INTEGER DEFAULT 4
)
RETURNS SETOF public.published_ads
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
      OR (p_section = 'realestate' AND pa.placement_id = '5')
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
$$;

CREATE OR REPLACE FUNCTION public.record_ad_impression(p_ad_id TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.published_ads
  SET
    views = COALESCE(views, 0) + 1,
    last_served_at = NOW()
  WHERE id = p_ad_id;
$$;

CREATE OR REPLACE FUNCTION public.record_ad_click(p_ad_id TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.published_ads
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = p_ad_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_eligible_ad_for_slot(TEXT, TEXT, TEXT, TEXT[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_eligible_ads_for_slot(TEXT, TEXT, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_ad_impression(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_ad_click(TEXT) TO anon, authenticated;
