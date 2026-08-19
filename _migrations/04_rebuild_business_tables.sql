-- ============================================================
-- 04 REBUILD BUSINESS TABLES (FIXED v2)
-- ============================================================

-- حذف كل الجداول المستهدفة (بما فيها entities إن وجدت)
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS banks CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- جدول entities (موحد لكل الكيانات)
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    city TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    description TEXT,
    services TEXT[],
    branches TEXT[],
    logo_url TEXT,
    cover_url TEXT,
    owner_id UUID,
    status TEXT DEFAULT 'PENDING',
    badge TEXT,
    rating NUMERIC DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'full',
    city TEXT,
    salary TEXT,
    deadline DATE,
    description TEXT,
    requirements TEXT[],
    status TEXT DEFAULT 'PENDING',
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    type TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول reviews (موسّع)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    user_id UUID,
    user_name TEXT NOT NULL,
    stars INT CHECK (stars >= 1 AND stars <= 5),
    text TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول verification_requests (موسّع)
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    owner_id UUID,
    status TEXT DEFAULT 'PENDING',
    reviewer_id UUID,
    notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول cities (نظيف)
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    governorate TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- إصلاح profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
DROP POLICY IF EXISTS "auth_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "auth_update_own_profile" ON profiles;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Seed: المدن اليمنية
INSERT INTO cities (name, governorate) VALUES
    ('صنعاء', 'صنعاء'),
    ('عدن', 'عدن'),
    ('تعز', 'تعز'),
    ('الحديدة', 'الحديدة'),
    ('إب', 'إب'),
    ('المكلا', 'حضرموت'),
    ('ذمار', 'ذمار'),
    ('عمران', 'عمران'),
    ('صعدة', 'صعدة'),
    ('سيئون', 'حضرموت')
ON CONFLICT (name) DO NOTHING;

-- Seed: التصنيفات
INSERT INTO categories (name, slug, icon, type, sort_order) VALUES
    ('شركات', 'companies', 'fa-building', 'entity', 1),
    ('بنوك', 'banks', 'fa-landmark', 'entity', 2),
    ('محلات', 'shops', 'fa-store', 'entity', 3),
    ('فنادق', 'hotels', 'fa-hotel', 'entity', 4),
    ('مطاعم', 'restaurants', 'fa-utensils', 'entity', 5),
    ('صرافة', 'exchanges', 'fa-money-bill-transfer', 'entity', 6),
    ('شركات نقل', 'transport', 'fa-truck-moving', 'entity', 7),
    ('محافظ إلكترونية', 'wallets', 'fa-wallet', 'entity', 8),
    ('وظائف', 'jobs', 'fa-briefcase', 'job', 9)
ON CONFLICT (slug) DO NOTHING;

-- RLS + Policies
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_entities" ON entities FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "auth_insert_entities" ON entities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_own_entities" ON entities FOR UPDATE USING (auth.uid()::text = owner_id::text);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_jobs" ON jobs FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "auth_insert_jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_own_jobs" ON jobs FOR UPDATE USING (auth.uid()::text = owner_id::text);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "auth_insert_reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_insert_verification" ON verification_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_read_own_verification" ON verification_requests FOR SELECT USING (auth.uid()::text = owner_id::text);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_cities" ON cities FOR SELECT USING (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "auth_insert_profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_own_profile" ON profiles FOR UPDATE USING (auth.uid()::text = id::text);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);
CREATE INDEX IF NOT EXISTS idx_entities_city ON entities(city);
CREATE INDEX IF NOT EXISTS idx_jobs_entity_id ON jobs(entity_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_id ON reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
