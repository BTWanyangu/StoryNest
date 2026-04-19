-- StoryNest production schema
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stories_generated int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  age int not null check (age between 3 and 12),
  interests text,
  avatar text,
  consent_given_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  child_name text not null,
  child_avatar text,
  title text not null,
  body text not null,
  theme text,
  moral text,
  created_at timestamptz not null default now()
);

create table if not exists public.renewals (
  id uuid primary key default gen_random_uuid(),
  stripe_customer_id text not null,
  stripe_invoice_id text not null unique,
  amount_pence int not null,
  renewed_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.children enable row level security;
alter table public.stories enable row level security;
alter table public.renewals enable row level security;

drop policy if exists users_own on public.users;
create policy users_own on public.users
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists children_own on public.children;
create policy children_own on public.children
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists stories_own on public.stories;
create policy stories_own on public.stories
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists renewals_service_only on public.renewals;
create policy renewals_service_only on public.renewals
  for all using (false) with check (false);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
