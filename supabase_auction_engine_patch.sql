-- =========================================================================
-- Yemen Rating: Safe Auction Engine & Manual Payment Infrastructure Patch
-- Backward-compatible, Non-destructive, Zero-loss Migration
-- =========================================================================

-- 1. ترقية جدول المزادات الحالي بأعمدة المزايدة الآمنة والتأمين والعمولة
ALTER TABLE public.auctions 
  ADD COLUMN IF NOT EXISTS min_increment NUMERIC DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS max_increment NUMERIC,
  ADD COLUMN IF NOT EXISTS auto_extend_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS commission_rate_snapshot NUMERIC,
  ADD COLUMN IF NOT EXISTS commission_amount_snapshot NUMERIC,
  ADD COLUMN IF NOT EXISTS tax_rate_snapshot NUMERIC,
  ADD COLUMN IF NOT EXISTS tax_amount_snapshot NUMERIC;

-- 2. جدول طرق الدفع اليدوية العامة (جيب، أم فلوس، الحسابات البنكية)
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wallet', 'bank')),
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  currency TEXT DEFAULT 'YER',
  instructions TEXT,
  qr_image_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول طلبات وإثباتات الدفع اليدوية (Universal Payment Requests)
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  purpose TEXT NOT NULL CHECK (purpose IN ('auction_deposit', 'auction_purchase', 'subscription', 'advertisement', 'commission', 'service')),
  purpose_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'YER',
  payment_method_id UUID REFERENCES public.payment_methods(id),
  status TEXT DEFAULT 'pending_verification' CHECK (status IN ('pending_payment', 'pending_verification', 'verified', 'rejected', 'expired')),
  transfer_amount NUMERIC,
  sender_name TEXT,
  transaction_reference TEXT,
  transfer_time TIMESTAMPTZ,
  receipt_url TEXT,
  notes TEXT,
  admin_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- منع تكرار رقم الحوالة لنفس الجهة
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_req_unique_ref 
  ON public.payment_requests (payment_method_id, transaction_reference) 
  WHERE transaction_reference IS NOT NULL AND status = 'verified';

-- 4. جدول تأمين المشاركة بالمزاد (Auction Participation Deposits)
CREATE TABLE IF NOT EXISTS public.auction_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'verified', 'refundable', 'refunded', 'held_for_settlement', 'forfeited', 'cancelled')),
  payment_request_id UUID REFERENCES public.payment_requests(id),
  verified_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reference TEXT,
  forfeit_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_auction_deposit UNIQUE (auction_id, user_id)
);

-- 5. جدول سجل المزايدات غير القابل للتعديل (Immutable Bids Log)
CREATE TABLE IF NOT EXISTS public.auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id),
  bid_amount NUMERIC NOT NULL,
  bid_order INTEGER DEFAULT 1,
  bidder_code TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'retracted', 'disqualified')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول تدقيق العمليات الإدارية (Audit Logs)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. دالة المزايدة الذرية الآمنة خادمياً (Atomic Safe Bidding RPC)
CREATE OR REPLACE FUNCTION public.place_auction_bid(
  p_auction_id UUID,
  p_bid_amount NUMERIC,
  p_client_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction RECORD;
  v_user_id UUID;
  v_deposit_verified BOOLEAN;
  v_new_end_date TIMESTAMPTZ;
  v_bidder_code TEXT;
  v_new_order INTEGER;
BEGIN
  -- التحقق من هوية المستخدم الحالية من الجلسة
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'يجب تسجيل الدخول أولاً لتتمكن من المزايدة');
  END IF;

  -- قفل سجل المزاد ومنع التضارب اللحظي (Row-level Lock)
  SELECT * INTO v_auction
  FROM public.auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'المزاد غير موجود');
  END IF;

  -- التحقق من نوع المزاد
  IF v_auction.sale_type <> 'auction' THEN
    RETURN jsonb_build_object('success', false, 'error', 'هذا المعروض مخصص للبيع المباشر وليس للمزايدة');
  END IF;

  -- التحقق من حالة المزاد
  IF v_auction.status <> 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'المزاد غير نشط حالياً للمزايدة');
  END IF;

  -- التحقق من اعتماد المزاد
  IF COALESCE(v_auction.approval_status, 'approved') <> 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'المزاد قيد المراجعة الإدارية');
  END IF;

  -- فحص التوقيت الخادمي الموثوق
  IF v_auction.end_date IS NOT NULL AND NOW() > v_auction.end_date THEN
    RETURN jsonb_build_object('success', false, 'error', 'انتهت فترة المزايدة رسمياً');
  END IF;

  -- منع البائع من المزايدة على سلعته
  IF v_auction.seller_id IS NOT NULL AND v_auction.seller_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'لا يمكن لصاحب المعروض المزايدة على عرضه');
  END IF;

  -- التحقق من شرط تأمين المشاركة
  IF COALESCE(v_auction.deposit_required, false) = true THEN
    SELECT EXISTS(
      SELECT 1 FROM public.auction_deposits
      WHERE auction_id = p_auction_id AND user_id = v_user_id AND status = 'verified'
    ) INTO v_deposit_verified;

    IF NOT v_deposit_verified THEN
      RETURN jsonb_build_object('success', false, 'error', 'المزايدة تتطلب سداد وتوثيق تأمين المشاركة أولاً');
    END IF;
  END IF;

  -- التحقق من الحد الأدنى للزيادة
  IF p_bid_amount < (COALESCE(v_auction.current_bid, v_auction.starting_price, 0) + COALESCE(v_auction.min_increment, 1000)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'قيمة المزايدة يجب أن تتجاوز السعر الحالي بمقدار الحد الأدنى للزيادة');
  END IF;

  -- التحقق من الحد الأقصى للزيادة إن كان مفعلاً
  IF v_auction.max_increment IS NOT NULL AND p_bid_amount > (COALESCE(v_auction.current_bid, v_auction.starting_price, 0) + v_auction.max_increment) THEN
    RETURN jsonb_build_object('success', false, 'error', 'قيمة المزايدة تجاوزت الحد الأقصى المسموح به للقفزة الواحدة');
  END IF;

  -- تمديد وقت المزاد في اللحظات الأخيرة إن كان مفعلاً
  v_new_end_date := v_auction.end_date;
  IF COALESCE(v_auction.auto_extend_minutes, 0) > 0 AND v_auction.end_date IS NOT NULL THEN
    IF NOW() >= (v_auction.end_date - (v_auction.auto_extend_minutes * INTERVAL '1 minute')) THEN
      v_new_end_date := v_auction.end_date + (v_auction.auto_extend_minutes * INTERVAL '1 minute');
    END IF;
  END IF;

  -- توليد كود مزايد مشفر للخصوصية
  v_bidder_code := 'مزايد #' || UPPER(SUBSTRING(MD5(v_user_id::text) FROM 1 FOR 4));

  SELECT COALESCE(MAX(bid_order), 0) + 1 INTO v_new_order
  FROM public.auction_bids
  WHERE auction_id = p_auction_id;

  -- إدراج المزايدة في السجل المحمي
  INSERT INTO public.auction_bids (
    auction_id, bidder_id, bid_amount, bid_order, bidder_code, ip_address, status
  ) VALUES (
    p_auction_id, v_user_id, p_bid_amount, v_new_order, v_bidder_code, p_client_ip, 'valid'
  );

  -- تحديث سعر المزاد وتوقيته والفائز الحالي ذرياً
  UPDATE public.auctions
  SET 
    current_bid = p_bid_amount,
    winner_id = v_user_id,
    end_date = v_new_end_date
  WHERE id = p_auction_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_bid', p_bid_amount,
    'bidder_code', v_bidder_code,
    'new_end_date', v_new_end_date
  );
END;
$$;

-- 8. دالة اعتماد الدفع اليدوي من الإدارة وربطه التلقائي بتأمين المزاد
CREATE OR REPLACE FUNCTION public.admin_verify_payment_request(
  p_request_id UUID,
  p_action TEXT, -- 'verify' or 'reject'
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_req RECORD;
BEGIN
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'صلاحية غير مصرح بها');
  END IF;

  SELECT * INTO v_req FROM public.payment_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'طلب الدفع غير موجود');
  END IF;

  IF p_action = 'verify' THEN
    UPDATE public.payment_requests
    SET status = 'verified', verified_by = v_admin_id, verified_at = NOW(), admin_notes = p_admin_notes
    WHERE id = p_request_id;

    -- إذا كان الغرض تأمين مزاد يتم ترقية التأمين لمؤهل فوراً
    IF v_req.purpose = 'auction_deposit' AND v_req.purpose_id IS NOT NULL THEN
      INSERT INTO public.auction_deposits (
        auction_id, user_id, amount, currency, status, payment_request_id, verified_at
      ) VALUES (
        v_req.purpose_id::uuid, v_req.user_id, v_req.amount, v_req.currency, 'verified', p_request_id, NOW()
      )
      ON CONFLICT (auction_id, user_id) 
      DO UPDATE SET status = 'verified', verified_at = NOW(), payment_request_id = p_request_id;
    END IF;

    -- توثيق العملية في سجل التدقيق
    INSERT INTO public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, new_value)
    VALUES (v_admin_id, 'VERIFY_PAYMENT', 'payment_requests', p_request_id::text, jsonb_build_object('status', 'verified'));

    RETURN jsonb_build_object('success', true, 'status', 'verified');
  ELSIF p_action = 'reject' THEN
    UPDATE public.payment_requests
    SET status = 'rejected', rejected_by = v_admin_id, rejected_at = NOW(), rejection_reason = p_admin_notes
    WHERE id = p_request_id;

    RETURN jsonb_build_object('success', true, 'status', 'rejected');
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'إجراء غير معروف');
END;
$$;
