-- ============================================================
-- 02 CORE SCHEMA - 11 new tables + seeds + RLS
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID,
    user_id UUID,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT,
    applicant_email TEXT,
    experience TEXT,
    message TEXT,
    cv_url TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity TEXT,
    entity_id TEXT,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ad_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    placement TEXT NOT NULL,
    page TEXT,
    width INT,
    height INT,
    status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES advertisers(id),
    slot_id UUID REFERENCES ad_slots(id),
    title TEXT NOT NULL,
    image_url TEXT,
    link_url TEXT,
    status TEXT DEFAULT 'PENDING',
    clicks INT DEFAULT 0,
    impressions INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    bank_id UUID,
    address TEXT,
    phone TEXT,
    city TEXT
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID,
    file_url TEXT NOT NULL,
    doc_type TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    bank_id UUID,
    status TEXT DEFAULT 'PENDING',
    reviewer_id UUID,
    notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed: Default Roles
INSERT INTO roles (name, description) VALUES
    ('super_admin', 'Full permissions'),
    ('admin', 'Platform manager'),
    ('moderator', 'Content moderator'),
    ('company_owner', 'Entity owner'),
    ('user', 'Regular user')
ON CONFLICT (name) DO NOTHING;

-- Seed: Standard Ad Slots
INSERT INTO ad_slots (name, placement, page, width, height) VALUES
    ('HOME_TOP', 'homepage_top', 'index', 728, 90),
    ('HOME_MIDDLE', 'homepage_middle', 'index', 300, 250),
    ('HOME_BOTTOM', 'homepage_bottom', 'index', 728, 90),
    ('COMPANY_TOP', 'company_top', 'company', 728, 90),
    ('COMPANY_MIDDLE', 'company_middle', 'company', 300, 250),
    ('COMPANY_BOTTOM', 'company_bottom', 'company', 728, 90),
    ('JOBS_TOP', 'jobs_top', 'jobs', 728, 90),
    ('JOBS_MIDDLE', 'jobs_middle', 'jobs', 300, 250),
    ('JOBS_BOTTOM', 'jobs_bottom', 'jobs', 728, 90),
    ('BANKS_TOP', 'banks_top', 'banks', 728, 90),
    ('ENTITIES_TOP', 'entities_top', 'entities', 728, 90),
    ('ENTITY_TOP', 'entity_top', 'entity', 728, 90)
ON CONFLICT (name) DO NOTHING;

-- RLS for new tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_roles" ON roles FOR SELECT USING (true);
CREATE POLICY "public_read_permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "public_read_ad_slots" ON ad_slots FOR SELECT USING (true);
CREATE POLICY "public_read_advertisements" ON advertisements FOR SELECT USING (status='PUBLISHED');
CREATE POLICY "public_read_branches" ON branches FOR SELECT USING (true);
