-- TrendingDailyFinds Supabase database
-- Run this in Supabase Dashboard -> SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price text,
  rating numeric(2,1) default 5,
  reviews integer default 0,
  badge text,
  image_url text,
  affiliate_url text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Anyone can read active products for the public website.
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products for select
using (is_active = true);

-- Signed-in admin users can manage products.
drop policy if exists "Authenticated users can manage products" on public.products;
create policy "Authenticated users can manage products"
on public.products for all
to authenticated
using (true)
with check (true);

-- IMPORTANT:
-- Create your admin account in Supabase Dashboard -> Authentication -> Users.
-- Do NOT put the service_role key in HTML or JavaScript.
