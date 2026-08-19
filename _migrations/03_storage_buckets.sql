-- ============================================================
-- 03 STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES
    ('logos', 'logos', true),
    ('covers', 'covers', true),
    ('documents', 'documents', false),
    ('ads', 'ads', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "public_read_covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "public_read_ads" ON storage.objects FOR SELECT USING (bucket_id = 'ads');
CREATE POLICY "public_read_avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "public_upload_logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');
CREATE POLICY "public_upload_covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers');
CREATE POLICY "public_upload_ads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ads');
CREATE POLICY "public_upload_avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
