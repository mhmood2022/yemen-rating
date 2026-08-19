-- ============================================================
-- 01 SECURITY - RLS for existing 8 tables
-- No data deletion - No column changes - Protection only
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "public_read_companies" ON companies FOR SELECT USING (true);
CREATE POLICY "public_read_banks" ON banks FOR SELECT USING (true);
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_cities" ON cities FOR SELECT USING (true);
CREATE POLICY "public_read_jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "public_read_verification_requests" ON verification_requests FOR SELECT USING (true);

CREATE POLICY "auth_insert_profiles" ON profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_own_profile" ON profiles FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "auth_insert_reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_verification_requests" ON verification_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
