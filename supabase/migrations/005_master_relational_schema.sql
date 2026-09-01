-- ============================================================
-- YEMEN RATING - 005_MASTER_RELATIONAL_SCHEMA.SQL
-- المخطط العلائقي الشامل لكافة قطاعات المنصة
-- ============================================================

-- 1. المدن والمناطق
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. التصنيفات الهرمية الموحدة
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name_ar VARCHAR(150) NOT NULL,
    name_en VARCHAR(150),
    slug VARCHAR(150) NOT NULL UNIQUE,
    entity_type VARCHAR(50) NOT NULL, -- business, bank, job, property, auction
    status VARCHAR(20) DEFAULT 'active',
    sort_order INT DEFAULT 0,
    icon_name VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. المستخدمون والصلاحيات (11 Roles)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(45) NOT NULL,
    avatar_url TEXT,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول الوسائط والمعرض الموحد
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type VARCHAR(50) NOT NULL, -- bank, business, property, auction, user
    owner_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL DEFAULT 'image', -- image, video, document
    alt_text VARCHAR(200),
    sort_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_owner ON public.media(owner_type, owner_id);

-- 5. جدول التقييمات والمراجعات الحقيقي (1..5 Stars)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name VARCHAR(150) NOT NULL,
    user_avatar TEXT,
    entity_type VARCHAR(50) NOT NULL, -- business, bank, property, job
    entity_id UUID NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(150),
    comment TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'approved', -- approved, pending, rejected, hidden
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_entity ON public.reviews(entity_type, entity_id, status);

-- 6. البنوك والمصارف والخدمات
CREATE TABLE IF NOT EXISTS public.banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    short_description VARCHAR(300),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    phone VARCHAR(45),
    whatsapp VARCHAR(45),
    email VARCHAR(150),
    website_url TEXT,
    address TEXT,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT true,
    badge_type VARCHAR(20) DEFAULT 'gold' CHECK (badge_type IN ('gold', 'blue', 'gray', 'none')),
    status VARCHAR(20) DEFAULT 'active',
    is_demo BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bank_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    service_name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.bank_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    phone VARCHAR(45),
    opening_hours VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active'
);

-- 7. الشركات والمنشآت
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    phone VARCHAR(45),
    whatsapp VARCHAR(45),
    email VARCHAR(150),
    website_url TEXT,
    address TEXT,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT false,
    badge_type VARCHAR(20) DEFAULT 'gray' CHECK (badge_type IN ('gold', 'blue', 'gray', 'none')),
    boost_score INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(15,2),
    currency VARCHAR(10) DEFAULT 'YER',
    status VARCHAR(20) DEFAULT 'active'
);

-- 8. الوظائف والمطابقة الذكية والعمولات
CREATE TABLE IF NOT EXISTS public.job_commission_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(15,2) NOT NULL DEFAULT 20000.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'YER',
    is_active BOOLEAN DEFAULT true,
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(250) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    company_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    company_name VARCHAR(150) NOT NULL,
    employer_phone VARCHAR(45) NOT NULL, -- سري ومحمي
    employer_email VARCHAR(150), -- سري ومحمي
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    city_name VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL, -- دوام كامل، دوام جزئي، عن بعد، عقد
    experience_level VARCHAR(50) NOT NULL,
    education_level VARCHAR(100) NOT NULL,
    gender VARCHAR(20) DEFAULT 'لا يشترط',
    skills TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    salary_min NUMERIC(15,2),
    salary_max NUMERIC(15,2),
    salary_currency VARCHAR(10) DEFAULT 'YER',
    status VARCHAR(20) DEFAULT 'active',
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    applicant_name VARCHAR(150) NOT NULL,
    applicant_phone VARCHAR(45) NOT NULL,
    applicant_email VARCHAR(150),
    resume_url TEXT,
    cover_letter TEXT,
    status VARCHAR(30) DEFAULT 'new', -- new, under_review, interview_scheduled, hired, rejected
    match_score INT DEFAULT 0,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL,
    title_match_score INT NOT NULL,
    skills_match_score INT NOT NULL,
    experience_match_score INT NOT NULL,
    education_match_score INT NOT NULL,
    location_match_score INT NOT NULL,
    overall_match_score INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. العقارات والعمولات
CREATE TABLE IF NOT EXISTS public.property_commission_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commission_type VARCHAR(20) DEFAULT 'percentage', -- percentage, fixed
    commission_value NUMERIC(10,2) DEFAULT 2.50,
    currency VARCHAR(10) DEFAULT 'YER',
    is_active BOOLEAN DEFAULT true,
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(250) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- شقة، فيلا، أرض، عمارة، محل، مزرعة
    listing_type VARCHAR(20) NOT NULL, -- sale, rent
    price NUMERIC(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'YER',
    area NUMERIC(10,2) NOT NULL,
    bedrooms INT,
    bathrooms INT,
    floor INT,
    year_built INT,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    city_name VARCHAR(100) NOT NULL,
    district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
    address TEXT,
    features TEXT[] DEFAULT '{}',
    is_contact_masked BOOLEAN DEFAULT true,
    publisher_name VARCHAR(150) NOT NULL,
    publisher_phone VARCHAR(45) NOT NULL, -- سري حتى تحقق الشروط
    status VARCHAR(20) DEFAULT 'active',
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. المزادات والبيع المباشر والعمولة السرية (5%)
CREATE TABLE IF NOT EXISTS public.auction_commission_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commission_type VARCHAR(20) DEFAULT 'percentage',
    commission_value NUMERIC(5,2) DEFAULT 5.00, -- 5% سرية
    currency VARCHAR(10) DEFAULT 'YER',
    is_active BOOLEAN DEFAULT true,
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    seller_name VARCHAR(150) NOT NULL,
    seller_phone VARCHAR(45) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    title VARCHAR(250) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    city_name VARCHAR(100) NOT NULL,
    item_condition VARCHAR(20) DEFAULT 'مستعمل',
    sale_type VARCHAR(20) NOT NULL DEFAULT 'auction', -- fixed_price, auction
    fixed_price NUMERIC(15,2),
    starting_price NUMERIC(15,2),
    minimum_bid_increment NUMERIC(15,2),
    current_bid NUMERIC(15,2),
    bids_count INT DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'YER',
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    winner_name VARCHAR(150),
    final_price NUMERIC(15,2),
    status VARCHAR(30) DEFAULT 'active',
    commission_amount NUMERIC(15,2),
    commission_status VARCHAR(30) DEFAULT 'not_due',
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    bidder_code VARCHAR(50) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    bid_order INT NOT NULL,
    status VARCHAR(20) DEFAULT 'valid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. المعاملات والمدفوعات
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'YER',
    status VARCHAR(30) DEFAULT 'pending',
    payment_reference VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. الإعلانات YR Ads
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(250) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    description TEXT,
    placement_id VARCHAR(10) NOT NULL,
    media_url TEXT NOT NULL,
    target_url TEXT,
    price NUMERIC(15,2),
    currency VARCHAR(10) DEFAULT 'YER',
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    contact_phone VARCHAR(45),
    status VARCHAR(20) DEFAULT 'active',
    views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    is_demo BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. المفضلة والإبلاغات وسجل التدقيق
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    reason VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    action VARCHAR(150) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
