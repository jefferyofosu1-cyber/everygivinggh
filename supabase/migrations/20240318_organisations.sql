-- EveryGiving: organisations table migration
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

create table if not exists organisations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  slug text unique,
  type text not null, -- ngo, charity, church, school, hospital, community, corporate
  location text,
  contact_name text,
  email text,
  phone text,
  website text,
  description text,
  mission text,
  logo_url text,
  cover_url text,
  reg_number text,
  reg_cert_url text,
  tax_id text,
  momo_number text,
  bank_name text,
  bank_account text,
  social_links jsonb default '{}'::jsonb,
  past_projects text,
  references_text text,
  verification_tier text default 'none' check (verification_tier in ('none','basic','standard','premium')),
  status text default 'pending' check (status in ('pending','approved','rejected','more_info')),
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table organisations enable row level security;

-- Allow the owning user to read/write their own org
create policy "Org owners can read their org"
  on organisations for select
  using (auth.uid() = user_id);

create policy "Org owners can insert their org"
  on organisations for insert
  with check (auth.uid() = user_id);

create policy "Org owners can update their org"
  on organisations for update
  using (auth.uid() = user_id);

-- Allow public to view approved orgs (for the public profile page)
create policy "Anyone can view approved orgs"
  on organisations for select
  using (status = 'approved');

-- Admin bypass (set is_admin = true in profiles table for admin users)
-- Uncomment if you have an admin role:
-- create policy "Admins can do everything"
--   on organisations for all
--   using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Auto-update updated_at
create or replace function update_organisations_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organisations_updated_at
  before update on organisations
  for each row execute procedure update_organisations_updated_at();

-- Storage bucket for org files (run separately or create via Dashboard → Storage)
-- insert into storage.buckets (id, name, public) values ('org-files', 'org-files', true);

-- Allow authenticated users to upload to org-files
-- create policy "Auth users can upload org files"
--   on storage.objects for insert
--   to authenticated
--   with check (bucket_id = 'org-files');

-- Allow public to read org files
-- create policy "Public can read org files"
--   on storage.objects for select
--   using (bucket_id = 'org-files');
