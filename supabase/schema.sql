create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('shop-assets', 'shop-assets', true)
on conflict (id) do nothing;

do $$
begin
  create type app_role as enum ('customer', 'shop_owner', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type shop_status as enum ('draft', 'published', 'suspended');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type shop_plan as enum ('free', 'starter', 'pro');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type pickup_status as enum ('pending', 'accepted', 'rejected', 'ready', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type analytics_event_type as enum ('shop_view', 'google_maps_click', 'waze_click');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  role app_role not null default 'shop_owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  phone text,
  website text,
  facebook_url text,
  instagram_url text,
  cover_image_url text,
  stripe_customer_id text,
  stripe_subscription_id text,
  billing_status text not null default 'inactive',
  foodpanda_store_url text,
  foodpanda_qr_url text,
  grab_store_url text,
  grab_qr_url text,
  status shop_status not null default 'published',
  plan shop_plan not null default 'free',
  opening_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shops add column if not exists facebook_url text;
alter table public.shops add column if not exists instagram_url text;

create table if not exists public.shop_locations (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  label text not null default 'Main location',
  address_line text not null,
  city text not null,
  region text,
  country text not null default 'Philippines',
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'PHP',
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_item_tags (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  tag text not null
);

create table if not exists public.shop_labels (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  group_name text not null,
  label text not null,
  created_at timestamptz not null default now(),
  unique (shop_id, label)
);

create table if not exists public.shop_photos (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  title text not null,
  description text not null default '',
  code text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  visit_tags text[] not null default '{}',
  photo_url text,
  is_verified_visit boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reviews add column if not exists reviewer_id uuid references public.profiles(id) on delete set null;
alter table public.reviews add column if not exists visit_tags text[] not null default '{}';
alter table public.reviews add column if not exists photo_url text;
alter table public.reviews add column if not exists is_verified_visit boolean not null default false;

create table if not exists public.favorite_shops (
  user_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, shop_id)
);

create table if not exists public.saved_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  emoji text not null default '☕',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.saved_collection_items (
  collection_id uuid not null references public.saved_collections(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, shop_id)
);

create table if not exists public.pickup_requests (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  customer_name text not null,
  customer_contact text not null,
  notes text,
  pickup_time timestamptz,
  status pickup_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pickup_request_items (
  id uuid primary key default gen_random_uuid(),
  pickup_request_id uuid not null references public.pickup_requests(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  item_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  event_type analytics_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  topic text not null default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feed_reactions (
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love', 'helpful')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists shops_owner_idx on public.shops(owner_id);
create index if not exists shops_status_idx on public.shops(status);
create index if not exists shops_plan_idx on public.shops(plan);
create index if not exists shops_stripe_customer_idx on public.shops(stripe_customer_id);
create index if not exists shops_stripe_subscription_idx on public.shops(stripe_subscription_id);
create index if not exists locations_lat_lon_idx on public.shop_locations(latitude, longitude);
create index if not exists menu_items_search_idx on public.menu_items using gin (to_tsvector('english', name || ' ' || description));
create index if not exists shops_search_idx on public.shops using gin (to_tsvector('english', name || ' ' || description));
create index if not exists shop_labels_shop_idx on public.shop_labels(shop_id);
create index if not exists shop_labels_label_idx on public.shop_labels(label);
create index if not exists shop_photos_shop_sort_idx on public.shop_photos(shop_id, sort_order, created_at);
create index if not exists pickup_requests_shop_status_idx on public.pickup_requests(shop_id, status);
create index if not exists promos_shop_active_idx on public.promos(shop_id, is_active, ends_at);
create index if not exists reviews_shop_created_idx on public.reviews(shop_id, created_at desc);
create unique index if not exists reviews_shop_reviewer_idx on public.reviews(shop_id, reviewer_id) where reviewer_id is not null;
create index if not exists favorite_shops_user_idx on public.favorite_shops(user_id, created_at desc);
create index if not exists analytics_events_shop_created_idx on public.analytics_events(shop_id, created_at desc);
create index if not exists analytics_events_shop_type_idx on public.analytics_events(shop_id, event_type);
create index if not exists feed_posts_created_idx on public.feed_posts(created_at desc);
create index if not exists feed_comments_post_created_idx on public.feed_comments(post_id, created_at asc);
create index if not exists feed_reactions_post_idx on public.feed_reactions(post_id);

create or replace function public.distance_km(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
returns double precision
language sql
immutable
as $$
  select 6371 * acos(
    least(1, greatest(-1,
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    ))
  );
$$;

create or replace function public.search_public_shops(
  search_text text default '',
  user_lat double precision default null,
  user_lon double precision default null,
  radius_km double precision default 10,
  max_price_cents integer default null,
  only_available boolean default true
)
returns table (
  shop_id uuid,
  shop_name text,
  description text,
  cover_image_url text,
  address_line text,
  city text,
  latitude double precision,
  longitude double precision,
  distance_km double precision,
  matching_drink_count bigint
)
language sql
stable
as $$
  select
    s.id,
    s.name,
    s.description,
    s.cover_image_url,
    l.address_line,
    l.city,
    l.latitude,
    l.longitude,
    case when user_lat is null or user_lon is null then null else public.distance_km(user_lat, user_lon, l.latitude, l.longitude) end,
    count(distinct mi.id)
  from public.shops s
  join public.shop_locations l on l.shop_id = s.id
  left join public.menu_items mi on mi.shop_id = s.id
  left join public.menu_item_tags mit on mit.menu_item_id = mi.id
  left join public.shop_labels sl on sl.shop_id = s.id
  where s.status = 'published'
    and (only_available = false or mi.id is null or mi.is_available = true)
    and (max_price_cents is null or mi.id is null or mi.price_cents <= max_price_cents)
    and (
      coalesce(search_text, '') = ''
      or s.name ilike '%' || search_text || '%'
      or s.description ilike '%' || search_text || '%'
      or mi.name ilike '%' || search_text || '%'
      or mi.description ilike '%' || search_text || '%'
      or mit.tag ilike '%' || search_text || '%'
      or sl.label ilike '%' || search_text || '%'
      or sl.group_name ilike '%' || search_text || '%'
    )
    and (
      user_lat is null
      or user_lon is null
      or public.distance_km(user_lat, user_lon, l.latitude, l.longitude) <= radius_km
    )
  group by s.id, l.id
  order by distance_km asc nulls last, s.name asc;
$$;

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.shop_locations enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_item_tags enable row level security;
alter table public.shop_labels enable row level security;
alter table public.shop_photos enable row level security;
alter table public.promos enable row level security;
alter table public.reviews enable row level security;
alter table public.favorite_shops enable row level security;
alter table public.saved_collections enable row level security;
alter table public.saved_collection_items enable row level security;
alter table public.pickup_requests enable row level security;
alter table public.pickup_request_items enable row level security;
alter table public.analytics_events enable row level security;
alter table public.feed_posts enable row level security;
alter table public.feed_comments enable row level security;
alter table public.feed_reactions enable row level security;
drop policy if exists "profiles are self readable" on public.profiles;
drop policy if exists "profiles are self editable" on public.profiles;
drop policy if exists "profiles are self insertable" on public.profiles;
create policy "profiles are self readable" on public.profiles for select using (auth.uid() = id);
create policy "profiles are self editable" on public.profiles for update using (auth.uid() = id);
create policy "profiles are self insertable" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "published shops public read" on public.shops;
drop policy if exists "owners create shops" on public.shops;
drop policy if exists "owners update shops" on public.shops;
create policy "published shops public read" on public.shops for select using (status = 'published' or owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "owners create shops" on public.shops for insert with check (owner_id = auth.uid());
create policy "owners update shops" on public.shops for update using (owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "locations public for published shops" on public.shop_locations;
drop policy if exists "owners manage locations" on public.shop_locations;
create policy "locations public for published shops" on public.shop_locations for select using (exists (select 1 from public.shops s where s.id = shop_id and (s.status = 'published' or s.owner_id = auth.uid())));
create policy "owners manage locations" on public.shop_locations for all using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "categories public for published shops" on public.menu_categories;
drop policy if exists "owners manage categories" on public.menu_categories;
create policy "categories public for published shops" on public.menu_categories for select using (exists (select 1 from public.shops s where s.id = shop_id and (s.status = 'published' or s.owner_id = auth.uid())));
create policy "owners manage categories" on public.menu_categories for all using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "menu public for published shops" on public.menu_items;
drop policy if exists "owners manage menu" on public.menu_items;
create policy "menu public for published shops" on public.menu_items for select using (exists (select 1 from public.shops s where s.id = shop_id and (s.status = 'published' or s.owner_id = auth.uid())));
create policy "owners manage menu" on public.menu_items for all using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "tags public through item" on public.menu_item_tags;
drop policy if exists "owners manage tags" on public.menu_item_tags;
create policy "tags public through item" on public.menu_item_tags for select using (exists (select 1 from public.menu_items mi join public.shops s on s.id = mi.shop_id where mi.id = menu_item_id and (s.status = 'published' or s.owner_id = auth.uid())));
create policy "owners manage tags" on public.menu_item_tags for all using (exists (select 1 from public.menu_items mi join public.shops s on s.id = mi.shop_id where mi.id = menu_item_id and s.owner_id = auth.uid()));

drop policy if exists "labels public for published shops" on public.shop_labels;
drop policy if exists "owners manage labels" on public.shop_labels;
create policy "labels public for published shops" on public.shop_labels for select using (exists (select 1 from public.shops s where s.id = shop_id and (s.status = 'published' or s.owner_id = auth.uid())));
create policy "owners manage labels" on public.shop_labels for all using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid())) with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "photos public for published shops" on public.shop_photos;
drop policy if exists "owners manage photos" on public.shop_photos;
create policy "photos public for published shops" on public.shop_photos for select using (exists (select 1 from public.shops s where s.id = shop_id and (s.status = 'published' or s.owner_id = auth.uid())));
create policy "owners manage photos" on public.shop_photos for all using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid())) with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "promos public for published shops" on public.promos;
drop policy if exists "owners manage promos" on public.promos;
create policy "promos public for published shops" on public.promos for select using (exists (select 1 from public.shops s where s.id = shop_id and (s.status = 'published' or s.owner_id = auth.uid())));
create policy "owners manage promos" on public.promos for all using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "published reviews are public" on public.reviews;
drop policy if exists "anyone can create reviews" on public.reviews;
drop policy if exists "signed-in users create own reviews" on public.reviews;
drop policy if exists "reviewers update own reviews" on public.reviews;
drop policy if exists "owners read shop reviews" on public.reviews;
create policy "published reviews are public" on public.reviews for select using (is_published = true);
create policy "signed-in users create own reviews" on public.reviews for insert to authenticated with check (
  reviewer_id = auth.uid()
  and not is_verified_visit
);
create policy "reviewers update own reviews" on public.reviews for update to authenticated using (reviewer_id = auth.uid()) with check (
  reviewer_id = auth.uid()
  and not is_verified_visit
);
create policy "owners read shop reviews" on public.reviews for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "users manage own favorite shops" on public.favorite_shops;
create policy "users manage own favorite shops" on public.favorite_shops for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users manage own saved collections" on public.saved_collections;
create policy "users manage own saved collections" on public.saved_collections for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users manage own saved collection items" on public.saved_collection_items;
create policy "users manage own saved collection items" on public.saved_collection_items for all
using (exists (select 1 from public.saved_collections c where c.id = collection_id and c.user_id = auth.uid()))
with check (exists (select 1 from public.saved_collections c where c.id = collection_id and c.user_id = auth.uid()));

drop policy if exists "anyone can create pickup requests" on public.pickup_requests;
drop policy if exists "owners read pickup requests" on public.pickup_requests;
drop policy if exists "customers read matching pickups" on public.pickup_requests;
drop policy if exists "owners update pickup requests" on public.pickup_requests;

drop policy if exists "anyone can create pickup request items" on public.pickup_request_items;
drop policy if exists "owners read pickup request items" on public.pickup_request_items;
-- Legacy pickup tables remain behind RLS without client policies so existing records are preserved but ordering stays disabled.

drop policy if exists "anyone can create analytics events" on public.analytics_events;
drop policy if exists "owners read analytics events" on public.analytics_events;
create policy "anyone can create analytics events" on public.analytics_events for insert with check (true);
create policy "owners read analytics events" on public.analytics_events for select using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "feed posts are public" on public.feed_posts;
drop policy if exists "authenticated users create feed posts" on public.feed_posts;
drop policy if exists "authors update feed posts" on public.feed_posts;
create policy "feed posts are public" on public.feed_posts for select using (true);
create policy "authenticated users create feed posts" on public.feed_posts for insert with check (author_id = auth.uid());
create policy "authors update feed posts" on public.feed_posts for update using (author_id = auth.uid());

drop policy if exists "feed comments are public" on public.feed_comments;
drop policy if exists "authenticated users create feed comments" on public.feed_comments;
create policy "feed comments are public" on public.feed_comments for select using (true);
create policy "authenticated users create feed comments" on public.feed_comments for insert with check (author_id = auth.uid());

drop policy if exists "feed reactions are public" on public.feed_reactions;
drop policy if exists "users manage own feed reactions" on public.feed_reactions;
create policy "feed reactions are public" on public.feed_reactions for select using (true);
create policy "users manage own feed reactions" on public.feed_reactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "public shop assets are readable" on storage.objects;
create policy "public shop assets are readable"
on storage.objects for select
using (bucket_id = 'shop-assets');

drop policy if exists "authenticated users upload shop assets" on storage.objects;
create policy "authenticated users upload shop assets"
on storage.objects for insert
with check (bucket_id = 'shop-assets' and auth.role() = 'authenticated');

drop policy if exists "authenticated users update own shop assets" on storage.objects;
create policy "authenticated users update own shop assets"
on storage.objects for update
using (bucket_id = 'shop-assets' and auth.role() = 'authenticated');
