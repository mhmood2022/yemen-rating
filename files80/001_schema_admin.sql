-- ═══════════════════════════════════════════════════════════
-- YEMEN RATING — Schema (المرحلة 1: ما تحتاجه لوحة الإدارة)
-- نفّذ هذا الملف كاملاً في: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- تفعيل امتداد توليد UUID
create extension if not exists "pgcrypto";

-- ───────────────────────────────────────────────────────────
-- 1) profiles — ملف كل مستخدم مسجّل، مرتبط بحساب Supabase Auth
-- ───────────────────────────────────────────────────────────
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text,
    role text not null default 'user'
        check (role in ('user','company_owner','bank_owner','admin','super_admin')),
    created_at timestamptz not null default now()
);

-- عند إنشاء أي حساب جديد في Auth، ننشئ له تلقائيًا صفًا في profiles
create or replace function handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();

-- ───────────────────────────────────────────────────────────
-- 2) التصنيفات والمدن (مشتركة بين الشركات والبنوك في هذه المرحلة)
-- ───────────────────────────────────────────────────────────
create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    icon text default 'fa-tag',
    created_at timestamptz not null default now()
);

create table if not exists cities (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique,
    created_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────
-- 3) الشركات
-- ───────────────────────────────────────────────────────────
create table if not exists companies (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references profiles(id) on delete set null,
    name text not null,
    category_id uuid references categories(id) on delete set null,
    city_id uuid references cities(id) on delete set null,
    description text,
    phone text,
    email text,
    website text,
    logo_url text,
    status text not null default 'PENDING'
        check (status in ('PENDING','ACTIVE','HIDDEN','SUSPENDED','BLOCKED','REJECTED')),
    is_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────
-- 4) البنوك والمؤسسات
-- ───────────────────────────────────────────────────────────
create table if not exists banks (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references profiles(id) on delete set null,
    name text not null,
    category_id uuid references categories(id) on delete set null,
    city_id uuid references cities(id) on delete set null,
    description text,
    phone text,
    working_hours text,
    logo_url text,
    status text not null default 'PENDING'
        check (status in ('PENDING','ACTIVE','HIDDEN','SUSPENDED','BLOCKED','REJECTED')),
    is_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────
-- 5) الوظائف (مرتبطة بشركة فقط في هذه المرحلة)
-- ───────────────────────────────────────────────────────────
create table if not exists jobs (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references companies(id) on delete cascade,
    title text not null,
    city_id uuid references cities(id) on delete set null,
    salary text,
    job_type text,
    experience text,
    description text,
    status text not null default 'PENDING'
        check (status in ('DRAFT','PENDING','APPROVED','PUBLISHED','REJECTED','CLOSED')),
    created_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────
-- 6) التقييمات (على شركة أو بنك، عبر entity_type/entity_id)
-- ───────────────────────────────────────────────────────────
create table if not exists reviews (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references profiles(id) on delete set null,
    entity_type text not null check (entity_type in ('company','bank')),
    entity_id uuid not null,
    rating int not null check (rating between 1 and 5),
    comment text,
    status text not null default 'PENDING'
        check (status in ('PENDING','APPROVED','REJECTED','HIDDEN')),
    created_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────
-- 7) طلبات التوثيق
-- ───────────────────────────────────────────────────────────
create table if not exists verification_requests (
    id uuid primary key default gen_random_uuid(),
    entity_type text not null check (entity_type in ('company','bank')),
    entity_id uuid not null,
    status text not null default 'PENDING'
        check (status in ('PENDING','APPROVED','REJECTED')),
    created_at timestamptz not null default now(),
    reviewed_at timestamptz
);

-- ───────────────────────────────────────────────────────────
-- 8) الأسعار (صرف وذهب)
-- ───────────────────────────────────────────────────────────
create table if not exists exchange_rates (
    id uuid primary key default gen_random_uuid(),
    currency text not null,
    buy_price numeric not null,
    sell_price numeric not null,
    city text not null,
    source text default 'manual',
    updated_at timestamptz not null default now()
);

create table if not exists gold_prices (
    id uuid primary key default gen_random_uuid(),
    karat text not null,
    price numeric not null,
    city text not null,
    source text default 'manual',
    updated_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────
-- 9) سجل نشاط الإدارة (audit_logs) — نسجّل فيه كل إجراء حساس
-- ───────────────────────────────────────────────────────────
create table if not exists audit_logs (
    id uuid primary key default gen_random_uuid(),
    admin_id uuid references profiles(id) on delete set null,
    action text not null,
    target_table text,
    target_id text,
    reason text,
    created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════
-- الصلاحيات (RLS) — القاعدة: الإدارة فقط تعدّل/تحذف، الجميع يقرأ العام
-- ═══════════════════════════════════════════════════════════

-- دالة مساعدة: هل المستخدم الحالي admin أو super_admin؟
create or replace function is_admin()
returns boolean as $$
    select exists (
        select 1 from profiles
        where id = auth.uid() and role in ('admin','super_admin')
    );
$$ language sql security definer stable;

alter table profiles enable row level security;
alter table categories enable row level security;
alter table cities enable row level security;
alter table companies enable row level security;
alter table banks enable row level security;
alter table jobs enable row level security;
alter table reviews enable row level security;
alter table verification_requests enable row level security;
alter table exchange_rates enable row level security;
alter table gold_prices enable row level security;
alter table audit_logs enable row level security;

-- profiles: كل مستخدم يقرأ صفّه، الإدارة تقرأ الكل
create policy "profiles_select_own_or_admin" on profiles for select
    using (auth.uid() = id or is_admin());
create policy "profiles_update_admin" on profiles for update
    using (is_admin());

-- categories / cities: قراءة عامة للجميع، تعديل للإدارة فقط
create policy "categories_select_all" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (is_admin()) with check (is_admin());

create policy "cities_select_all" on cities for select using (true);
create policy "cities_admin_write" on cities for all using (is_admin()) with check (is_admin());

-- companies: الجميع يرى ACTIVE فقط، الإدارة ترى وتعدّل كل شيء
create policy "companies_select_public" on companies for select
    using (status = 'ACTIVE' or is_admin());
create policy "companies_admin_write" on companies for all
    using (is_admin()) with check (is_admin());

-- banks: نفس منطق الشركات
create policy "banks_select_public" on banks for select
    using (status = 'ACTIVE' or is_admin());
create policy "banks_admin_write" on banks for all
    using (is_admin()) with check (is_admin());

-- jobs: الجميع يرى المنشورة، الإدارة ترى وتعدّل كل شيء
create policy "jobs_select_public" on jobs for select
    using (status = 'PUBLISHED' or is_admin());
create policy "jobs_admin_write" on jobs for all
    using (is_admin()) with check (is_admin());

-- reviews: الجميع يرى المعتمدة، الإدارة ترى وتعدّل كل شيء
create policy "reviews_select_public" on reviews for select
    using (status = 'APPROVED' or is_admin());
create policy "reviews_admin_write" on reviews for all
    using (is_admin()) with check (is_admin());

-- verification_requests / exchange_rates / gold_prices / audit_logs: للإدارة فقط
create policy "verification_admin_only" on verification_requests for all
    using (is_admin()) with check (is_admin());
create policy "exchange_select_all" on exchange_rates for select using (true);
create policy "exchange_admin_write" on exchange_rates for all using (is_admin()) with check (is_admin());
create policy "gold_select_all" on gold_prices for select using (true);
create policy "gold_admin_write" on gold_prices for all using (is_admin()) with check (is_admin());
create policy "audit_admin_only" on audit_logs for all
    using (is_admin()) with check (is_admin());

-- ═══════════════════════════════════════════════════════════
-- الخطوة الأخيرة (يدوية): بعد تنفيذ هذا الملف، وبعد ما تنشئ
-- حساب admin من Authentication → Users، نفّذ هذا السطر مع
-- استبدال البريد ببريد حسابك الفعلي:
--
-- update profiles set role = 'admin' where email = 'ضع بريدك هنا';
-- ═══════════════════════════════════════════════════════════
