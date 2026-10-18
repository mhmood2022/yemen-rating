-- 1. جدول الحسابات/الملفات الشخصية
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text default 'مستخدم جديد',
  username text unique,
  avatar_url text,
  cover_url text,
  bio text check (char_length(bio) <= 160),
  location text default 'اليمن',
  phone text,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. جدول التغريدات والمنشورات
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  likes_count integer default 0 check (likes_count >= 0),
  comments_count integer default 0 check (comments_count >= 0),
  reposts_count integer default 0 check (reposts_count >= 0),
  views_count integer default 1 check (views_count >= 0),
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint post_content_length check (
    char_length(trim(content)) > 0 and char_length(content) <= 280
  )
);

-- فهارس للأداء العالي وعرض الأحدث أولاً
create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_posts_user_id on public.posts (user_id);

-- 3. جدول التعليقات والردود
create table if not exists public.post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.post_comments(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint comment_content_length check (
    char_length(trim(content)) > 0 and char_length(content) <= 280
  )
);

create index if not exists idx_post_comments_post_id on public.post_comments (post_id, created_at asc);

-- 4. جدول الإعجابات
create table if not exists public.post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_post_like unique (post_id, user_id)
);

create index if not exists idx_post_likes_post_id on public.post_likes (post_id);

-- 5. جدول إعادة النشر (Reposts)
create table if not exists public.post_reposts (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_post_repost unique (post_id, user_id)
);

-- 6. دوال وتريجرز التحديث التلقائي للعدادات
create or replace function update_post_counters() returns trigger as $$
begin
  if (TG_TABLE_NAME = 'post_likes') then
    if (TG_OP = 'INSERT') then
      update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
    elsif (TG_OP = 'DELETE') then
      update public.posts set likes_count = greatest(0, likes_count - 1) where id = OLD.post_id;
    end if;
  elsif (TG_TABLE_NAME = 'post_comments') then
    if (TG_OP = 'INSERT') then
      update public.posts set comments_count = comments_count + 1 where id = NEW.post_id;
    elsif (TG_OP = 'DELETE') then
      update public.posts set comments_count = greatest(0, comments_count - 1) where id = OLD.post_id;
    end if;
  elsif (TG_TABLE_NAME = 'post_reposts') then
    if (TG_OP = 'INSERT') then
      update public.posts set reposts_count = reposts_count + 1 where id = NEW.post_id;
    elsif (TG_OP = 'DELETE') then
      update public.posts set reposts_count = greatest(0, reposts_count - 1) where id = OLD.post_id;
    end if;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_post_likes on public.post_likes;
create trigger tr_post_likes after insert or delete on public.post_likes for each row execute function update_post_counters();

drop trigger if exists tr_post_comments on public.post_comments;
create trigger tr_post_comments after insert or delete on public.post_comments for each row execute function update_post_counters();

drop trigger if exists tr_post_reposts on public.post_reposts;
create trigger tr_post_reposts after insert or delete on public.post_reposts for each row execute function update_post_counters();

-- 7. إنشاء تلقائي للملف الشخصي عند تسجيل مستخدم جديد
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    username = coalesce(excluded.username, profiles.username);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 8. سياسات RLS والأمان
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_reposts enable row level security;

-- profiles
create policy "قراءة الملفات للجميع" on public.profiles for select using (true);
create policy "تعديل الملف لصاحبه" on public.profiles for update using (auth.uid() = id);
create policy "إضافة الملف لصاحبه" on public.profiles for insert with check (auth.uid() = id);

-- posts
create policy "قراءة التغريدات للجميع" on public.posts for select using (true);
create policy "نشر التغريدة لصاحب الحساب" on public.posts for insert with check (auth.uid() = user_id);
create policy "حذف التغريدة لصاحبها" on public.posts for delete using (auth.uid() = user_id);

-- post_comments
create policy "قراءة التعليقات للجميع" on public.post_comments for select using (true);
create policy "إضافة التعليق لصاحبه" on public.post_comments for insert with check (auth.uid() = user_id);
create policy "حذف التعليق لصاحبه" on public.post_comments for delete using (auth.uid() = user_id);

-- post_likes
create policy "قراءة الإعجابات للجميع" on public.post_likes for select using (true);
create policy "إضافة إعجاب للمسجلين" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "إلغاء الإعجاب لصاحبه" on public.post_likes for delete using (auth.uid() = user_id);

-- post_reposts
create policy "قراءة إعادات النشر للجميع" on public.post_reposts for select using (true);
create policy "إعادة نشر للمسجلين" on public.post_reposts for insert with check (auth.uid() = user_id);
create policy "إلغاء إعادة النشر لصاحبه" on public.post_reposts for delete using (auth.uid() = user_id);

-- 9. إنشاء مجلد التخزين social-media إن لم يكن موجوداً
insert into storage.buckets (id, name, public)
values ('social-media', 'social-media', true)
on conflict (id) do nothing;

create policy "الجميع يمكنهم مشاهدة صور المنشورات" on storage.objects for select using (bucket_id = 'social-media');
create policy "المستخدمون يرفعون صورهم فقط" on storage.objects for insert with check (bucket_id = 'social-media' and auth.role() = 'authenticated');

-- 7. جدول المتابعات (Follows)
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

create index if not exists idx_follows_follower on public.follows (follower_id);
create index if not exists idx_follows_following on public.follows (following_id);

-- 8. جدول التنبيهات (Notifications)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('like', 'comment', 'repost', 'follow')),
  post_id uuid references public.posts(id) on delete cascade,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user_id on public.notifications (user_id, created_at desc);

-- 9. جدول البلاغات (Reports) للربط المستقبلي بالإدارة العامة
create table if not exists public.post_reports (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_post_reports_status on public.post_reports (status);

-- 10. جدول الحظر (User Blocks)
create table if not exists public.user_blocks (
  blocker_id uuid references public.profiles(id) on delete cascade not null,
  blocked_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (blocker_id, blocked_id)
);

create index if not exists idx_blocks_blocker on public.user_blocks (blocker_id);
create index if not exists idx_blocks_blocked on public.user_blocks (blocked_id);

-- 11. جدول الرسائل الخاصة (Direct Messages)
create table if not exists public.direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_dm_conversation on public.direct_messages (sender_id, receiver_id, created_at desc);
