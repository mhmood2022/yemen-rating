-- ====================================================================
-- YEMEN RATING (يمن ريتغ) — MASTER DATABASE SCHEMA & RBAC ARCHITECTURE
-- ====================================================================

-- 1. جدول الأدوار والصلاحيات (RBAC Roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'super_admin',
        'admin',
        'content_manager',
        'verification_manager',
        'jobs_manager',
        'ads_manager',
        'support',
        'owner',
        'user'
    )),
    business_id UUID, -- مرتبط بنشاط محدد إذا كان الدور 'owner'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role, business_id)
);

-- 2. جدول التصنيفات الرئيسية والفرعية (Categories Managed by Admin)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL DEFAULT 'Building2',
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    banner_ad_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الأنشطة والمنشآت (Businesses Master Entity)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    commercial_name VARCHAR(255),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    business_type VARCHAR(50) NOT NULL CHECK (business_type IN (
        'BANK', 'WALLET', 'COMPANY', 'SHOP', 'RESTAURANT',
        'REAL_ESTATE', 'CAR_DEALER', 'HEALTHCARE', 'HOTEL',
        'EDUCATION', 'TRANSPORT', 'TELECOM', 'PROFESSIONAL'
    )),
    city VARCHAR(50) NOT NULL,
    address TEXT,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(100),
    website TEXT,
    working_hours TEXT,
    map_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- مستويات الظهور والإدارة
    tier VARCHAR(50) DEFAULT 'STANDARD' CHECK (tier IN ('PREMIUM_VERIFIED', 'VERIFIED', 'STANDARD')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- حالة الملكية
    ownership_status VARCHAR(50) DEFAULT 'UNCLAIMED' CHECK (ownership_status IN (
        'UNCLAIMED', 'CLAIM_PENDING', 'CLAIMED', 'VERIFIED', 'SUSPENDED'
    )),
    claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- شارات التوثيق ومؤشر الثقة
    is_verified BOOLEAN DEFAULT FALSE,
    verified_badge_type VARCHAR(20) DEFAULT 'gold' CHECK (verified_badge_type IN ('gold', 'blue', 'gray')),
    verified_badge_title VARCHAR(100) DEFAULT 'موثّق',
    verified_at TIMESTAMPTZ,
    verified_reason TEXT,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    yr_score INT DEFAULT 75 CHECK (yr_score BETWEEN 0 AND 100),
    rating NUMERIC(3,2) DEFAULT 4.5,
    review_count INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول إثبات الملكية (Ownership Claims)
CREATE TABLE IF NOT EXISTS public.business_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    claimant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    claimant_name VARCHAR(150) NOT NULL,
    claimant_phone VARCHAR(50) NOT NULL,
    id_card_url TEXT,
    commercial_register_url TEXT,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول التقييمات والمراجعات (Reviews & Moderation)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    is_verified_reviewer BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    is_hidden BOOLEAN DEFAULT FALSE,
    owner_reply TEXT,
    owner_replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول الوظائف المجهولة الهوية والوساطة (Anonymous Jobs & Mediation)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    -- يتم حجب معلومات الشركة عن الباحث للوساطة
    title VARCHAR(200) NOT NULL,
    city VARCHAR(50) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    work_type VARCHAR(50) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    salary_range VARCHAR(100),
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    
    -- عمولة يمن ريتغ المقفلة غير القابلة للتغيير بأثر رجعي
    commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    commission_currency VARCHAR(10) DEFAULT 'YER',
    
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'FILLED', 'EXPIRED')),
    applicants_count INT DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول طلبات التوظيف والمطابقة الذكية (Job Applications & AI Match)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    applicant_name VARCHAR(150) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    applicant_city VARCHAR(50) NOT NULL,
    qualifications TEXT NOT NULL,
    experience_years INT DEFAULT 0,
    cv_file_url TEXT,
    
    -- نتائج المطابقة الذكية
    ai_match_score INT DEFAULT 85 CHECK (ai_match_score BETWEEN 0 AND 100),
    ai_match_reasons JSONB DEFAULT '[]'::jsonb,
    
    status VARCHAR(40) DEFAULT 'SUBMITTED' CHECK (status IN (
        'SUBMITTED', 'MATCHED', 'INTERVIEW_SCHEDULED', 'OFFER_ACCEPTED', 'COMMISSION_LOCKED', 'REJECTED'
    )),
    
    -- تثبيت عمولة العملية وقت القبول (Snapshot Protection)
    locked_commission_amount NUMERIC(12,2),
    locked_commission_currency VARCHAR(10),
    commission_paid BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول عروض العقارات المجهولة الهوية والوساطة (Anonymous Real Estate)
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('شقة', 'فيلا', 'أرض', 'محل تجاري', 'عمارة', 'مستودع')),
    deal_type VARCHAR(20) NOT NULL CHECK (deal_type IN ('بيع', 'إيجار')),
    city VARCHAR(50) NOT NULL,
    location_details TEXT NOT NULL,
    price NUMERIC(14,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'YER',
    area_m2 NUMERIC(10,2) NOT NULL,
    rooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    floor_num VARCHAR(20),
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. جدول طلبات واستفسارات العقارات (Property Inquiries via YR Mediation)
CREATE TABLE IF NOT EXISTS public.property_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_name VARCHAR(150) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'VIEWING_ARRANGED', 'CLOSED_DEAL', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. جدول مركز التحكم بالإعلانات (YR Ads Control Center)
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    advertiser_name VARCHAR(200) NOT NULL,
    advertiser_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    ad_type VARCHAR(50) NOT NULL CHECK (ad_type IN ('video', 'banner', 'mobile_banner', 'desktop_leaderboard', 'in_feed')),
    placements JSONB NOT NULL DEFAULT '["home_top"]'::jsonb,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    target_url TEXT NOT NULL,
    budget VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'paused', 'expired', 'rejected')),
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. جدول أسعار الصرف الموثقة وسجل التاريخ (Exchange Rates & History)
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market VARCHAR(20) NOT NULL CHECK (market IN ('sanaa', 'aden')),
    currency_code VARCHAR(10) NOT NULL, -- USD, SAR, AED, EUR
    currency_name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    buy_price NUMERIC(10,2) NOT NULL,
    sell_price NUMERIC(10,2) NOT NULL,
    change_status VARCHAR(20) DEFAULT 'stable' CHECK (change_status IN ('up', 'down', 'stable')),
    source_name VARCHAR(150) NOT NULL DEFAULT 'جمعية الصرافين',
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(market, currency_code)
);

CREATE TABLE IF NOT EXISTS public.exchange_rate_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market VARCHAR(20) NOT NULL,
    currency_code VARCHAR(10) NOT NULL,
    buy_price NUMERIC(10,2) NOT NULL,
    sell_price NUMERIC(10,2) NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. جدول سجل العمليات الإدارية الصارم (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_name VARCHAR(150) NOT NULL,
    admin_email VARCHAR(150) NOT NULL,
    action_type VARCHAR(80) NOT NULL,
    target_type VARCHAR(80) NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. جدول إعدادات المنصة العامة (Platform Settings - No Hardcoding)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إدخال الإعدادات الافتراضية
INSERT INTO public.platform_settings (key, value, description) VALUES
('general_whatsapp', '+967777000000', 'رقم الواتساب العام للمنصة'),
('google_play_url', 'https://play.google.com/store/apps', 'رابط تطبيق يمن ريتغ على جوجل بلاي'),
('free_subscription_msg', 'أرغب في الاشتراك المجاني كجهة في منصة يمن ريتغ', 'نص رسالة الاشتراك التلقائي'),
('commission_default_job', '50000', 'عمولة التوظيف الافتراضية بالريال اليمني')
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. قراءة البيانات العامة متاحة للجميع (الأنشطة النشطة، الوظائف، العقارات، الأسعار)
CREATE POLICY "Public can view active businesses" ON public.businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active jobs" ON public.jobs FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Public can view active properties" ON public.properties FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Public can view published ads" ON public.ads FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view rates" ON public.exchange_rates FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true AND is_hidden = false);

-- 2. المالك يدير نشاطه فقط (Owner Policy)
CREATE POLICY "Owners can update own business" ON public.businesses FOR UPDATE USING (
    claimed_by = auth.uid() AND ownership_status = 'CLAIMED'
);

-- 3. المشرفون يديرون كل شيء (Admin Override)
CREATE POLICY "Admins have full access to businesses" ON public.businesses USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
);
