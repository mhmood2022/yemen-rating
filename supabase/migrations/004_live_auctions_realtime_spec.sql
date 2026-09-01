-- ============================================================
-- YEMEN RATING - 004_LIVE_AUCTIONS_REALTIME_SPEC.SQL
-- نظام المزادات الحي الشامل، الصفقات، النزاعات، والعمولات
-- ============================================================

-- 1. توسيع حالات المزاد المعتمدة
DO $$ BEGIN
    ALTER TYPE yr_listing_status ADD VALUE IF NOT EXISTS 'winner_pending';
    ALTER TYPE yr_listing_status ADD VALUE IF NOT EXISTS 'payment_pending';
    ALTER TYPE yr_listing_status ADD VALUE IF NOT EXISTS 'payment_proof_submitted';
    ALTER TYPE yr_listing_status ADD VALUE IF NOT EXISTS 'payment_under_review';
    ALTER TYPE yr_listing_status ADD VALUE IF NOT EXISTS 'payment_confirmed';
    ALTER TYPE yr_listing_status ADD VALUE IF NOT EXISTS 'completed';
    ALTER TYPE yr_listing_status ADD VALUE IF NOT EXISTS 'disputed';
    ALTER TYPE yr_listing_status ADD VALUE IF NOT EXISTS 'failed';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. جدول الأحداث والخط الزمني للصفقة (Timeline Events)
CREATE TABLE IF NOT EXISTS public.auction_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    event_stage VARCHAR(100) NOT NULL, -- draft, published, auction_started, bid_placed, auction_ended, winner_declared, payment_requested, receipt_uploaded, receipt_approved, commission_paid, deal_completed, dispute_opened, dispute_resolved
    title VARCHAR(200) NOT NULL,
    description TEXT,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name VARCHAR(150),
    actor_role VARCHAR(50), -- admin, seller, buyer, system
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول تنبيهات الإدارة اللحظية
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- new_bid, auction_ended, winner_declared, payment_proof, dispute_alert, commission_due, deal_completed
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. إعداد الـ Real-time Publications
DO $$ BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions';
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_bids';
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications';
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;
