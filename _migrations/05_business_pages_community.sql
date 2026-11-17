-- ============================================================================
-- ربط صفحات المنشآت بالمجتمع والتقييمات (آمن بالكامل ولا يحذف أي بيانات قديمة)
-- ============================================================================

-- 1) ضمان الأعمدة المطلوبة في جدول businesses
ALTER TABLE IF EXISTS public.businesses
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slug VARCHAR(200),
  ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'SHOP',
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS badge_type VARCHAR(20) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses (owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses (slug);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_businesses" ON public.businesses;
CREATE POLICY "public_read_businesses" ON public.businesses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "owner_insert_business" ON public.businesses;
CREATE POLICY "owner_insert_business" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

DROP POLICY IF EXISTS "owner_update_business" ON public.businesses;
CREATE POLICY "owner_update_business" ON public.businesses
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- 2) ربط جدول posts اختيارياً بالمنشأة (المنشورات القديمة تبقى business_id = NULL)
ALTER TABLE IF EXISTS public.posts
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_posts_business_id ON public.posts (business_id);

DROP POLICY IF EXISTS "نشر التغريدة لصاحب الحساب" ON public.posts;
CREATE POLICY "نشر التغريدة لصاحب الحساب" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      business_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.businesses b
        WHERE b.id = business_id AND b.owner_id = auth.uid()
      )
    )
  );

-- 3) جدول متابعة المنشآت (منفصل عن follows للأشخاص)
CREATE TABLE IF NOT EXISTS public.business_follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, business_id)
);

CREATE INDEX IF NOT EXISTS idx_business_follows_biz ON public.business_follows (business_id);
ALTER TABLE public.business_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_business_follows" ON public.business_follows;
CREATE POLICY "public_read_business_follows" ON public.business_follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_insert_business_follow" ON public.business_follows;
CREATE POLICY "auth_insert_business_follow" ON public.business_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "auth_delete_business_follow" ON public.business_follows;
CREATE POLICY "auth_delete_business_follow" ON public.business_follows
  FOR DELETE USING (auth.uid() = follower_id);

CREATE OR REPLACE FUNCTION public.sync_business_followers_count()
RETURNS TRIGGER AS $$
DECLARE
  target_biz UUID;
BEGIN
  target_biz := COALESCE(NEW.business_id, OLD.business_id);
  IF target_biz IS NULL THEN RETURN NULL; END IF;
  UPDATE public.businesses
  SET followers_count = (
    SELECT COUNT(*) FROM public.business_follows WHERE business_id = target_biz
  )
  WHERE id = target_biz;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_business_followers ON public.business_follows;
CREATE TRIGGER tr_sync_business_followers
  AFTER INSERT OR DELETE ON public.business_follows
  FOR EACH ROW EXECUTE FUNCTION public.sync_business_followers_count();

-- 4) ضمان توافق جدول reviews مع التقييمات وتحديث متوسط التقييم تلقائياً
ALTER TABLE IF EXISTS public.reviews
  ADD COLUMN IF NOT EXISTS entity_id UUID,
  ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50) DEFAULT 'business',
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS user_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS user_avatar TEXT,
  ADD COLUMN IF NOT EXISTS user_username VARCHAR(100),
  ADD COLUMN IF NOT EXISTS stars SMALLINT,
  ADD COLUMN IF NOT EXISTS comment TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'rating'
  ) THEN
    EXECUTE 'ALTER TABLE public.reviews ALTER COLUMN rating DROP NOT NULL';
  END IF;
END $$;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
CREATE POLICY "public_read_reviews" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_insert_reviews" ON public.reviews;
CREATE POLICY "auth_insert_reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (user_id IS NULL OR user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.sync_business_rating_from_reviews()
RETURNS TRIGGER AS $$
DECLARE
  target_biz UUID;
  avg_val NUMERIC(3,2);
  cnt_val INT;
BEGIN
  target_biz := COALESCE(NEW.entity_id, OLD.entity_id);
  IF target_biz IS NULL THEN RETURN NULL; END IF;

  SELECT
    COALESCE(ROUND(AVG(stars)::numeric, 1), 0),
    COUNT(*)
  INTO avg_val, cnt_val
  FROM public.reviews
  WHERE entity_id = target_biz AND stars BETWEEN 1 AND 5;

  UPDATE public.businesses
  SET rating = avg_val,
      review_count = cnt_val,
      updated_at = NOW()
  WHERE id = target_biz;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_business_rating ON public.reviews;
CREATE TRIGGER tr_sync_business_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_business_rating_from_reviews();
