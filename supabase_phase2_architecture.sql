-- ========================================================
-- YEMEN RATING - PHASE 2 ARCHITECTURE & RBAC SCHEMA
-- ========================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM (
  'super_admin', 'admin', 'content_manager', 
  'verification_manager', 'jobs_manager', 'ads_manager', 
  'support', 'owner', 'user'
);

CREATE TYPE claim_status AS ENUM (
  'unclaimed', 'claim_pending', 'claimed', 'verified', 'suspended'
);

CREATE TYPE ad_status AS ENUM (
  'draft', 'pending', 'approved', 'active', 'paused', 'expired', 'rejected'
);

-- 2. USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon_class VARCHAR(100) DEFAULT 'fa-solid fa-folder',
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BUSINESS PROFILES (MASTER ENTITY)
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id),
    name_ar VARCHAR(255) NOT NULL,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    claim_status claim_status DEFAULT 'unclaimed',
    tier_level INT DEFAULT 3, -- 1: Featured & Verified, 2: Verified, 3: Standard
    yr_score DECIMAL(3, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. JOBS TABLE (ANONYMOUS TO VISITORS)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- Full-time, Part-time, Remote
    salary_range VARCHAR(100),
    requirements TEXT,
    commission_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Locked per job agreement
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- Business Profiles: Everyone can read
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.business_profiles FOR SELECT USING (true);

-- Business Profiles: Owners can update their own profile
CREATE POLICY "Owners can update own business profile" 
ON public.business_profiles FOR UPDATE 
USING (auth.uid() = owner_id);

-- Jobs: Public can view jobs (excluding sensitive business_id details in UI layer)
CREATE POLICY "Public jobs are viewable by everyone" 
ON public.jobs FOR SELECT USING (is_active = true);

