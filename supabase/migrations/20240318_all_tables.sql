-- EveryGiving: Combined migration — fully idempotent (safe to re-run)
-- Supabase SQL Editor → New query → Run
-- Date: 2026-03-18

-- ─── HELPER: drop policies before recreating (avoids 42710 errors) ───────────
-- We drop each policy explicitly so the script is safe on reruns.

-- ════════════════════════════════════════════════════════════════════════════
-- 1. SUPPORT TICKETS
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists support_tickets (
  id            uuid primary key default gen_random_uuid(),
  type          text default 'general'
                  check (type in ('general','billing','verification','technical','abuse','other')),
  subject       text not null,
  message       text not null,
  priority      text default 'normal'
                  check (priority in ('urgent','high','normal','low')),
  status        text default 'open'
                  check (status in ('open','in_progress','resolved','closed')),
  contact_email text,
  campaign_id   uuid references campaigns(id) on delete set null,
  user_id       uuid references auth.users on delete set null,
  resolved_at   timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table support_tickets enable row level security;
drop policy if exists "Admins can manage support tickets" on support_tickets;
create policy "Admins can manage support tickets" on support_tickets
  for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
drop policy if exists "Users can create support tickets" on support_tickets;
create policy "Users can create support tickets" on support_tickets
  for insert with check (true);

-- ════════════════════════════════════════════════════════════════════════════
-- 2. ADMIN AUDIT LOGS
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists admin_audit_logs (
  id            uuid primary key default gen_random_uuid(),
  action        text not null,
  entity_type   text,
  entity_id     text,
  actor_user_id uuid references auth.users on delete set null,
  before_state  jsonb,
  after_state   jsonb,
  ip_address    text,
  created_at    timestamptz default now()
);

alter table admin_audit_logs enable row level security;
drop policy if exists "Admins can read audit logs" on admin_audit_logs;
create policy "Admins can read audit logs" on admin_audit_logs
  for select using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
drop policy if exists "Service role inserts audit logs" on admin_audit_logs;
create policy "Service role inserts audit logs" on admin_audit_logs
  for insert with check (true);

-- ════════════════════════════════════════════════════════════════════════════
-- 3. ADMIN ROLES
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists admin_roles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid unique references auth.users on delete cascade not null,
  role         text not null
                 check (role in ('super_admin','admin','moderator','support','finance','content')),
  permissions  text[] default '{}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table admin_roles enable row level security;
drop policy if exists "Admins can manage roles" on admin_roles;
create policy "Admins can manage roles" on admin_roles
  for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ════════════════════════════════════════════════════════════════════════════
-- 4. PLATFORM SETTINGS
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists platform_settings (
  key        text primary key,
  value      jsonb,
  updated_by uuid references auth.users on delete set null,
  updated_at timestamptz default now()
);

alter table platform_settings enable row level security;
drop policy if exists "Admins can manage platform settings" on platform_settings;
create policy "Admins can manage platform settings" on platform_settings
  for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

insert into platform_settings (key, value) values
  ('platform.maintenance_mode',      'false'),
  ('platform.allow_new_signups',     'true'),
  ('platform.allow_new_campaigns',   'true'),
  ('platform.min_campaign_goal',     '500'),
  ('platform.max_campaign_goal',     '500000'),
  ('platform.platform_fee_pct',      '5'),
  ('platform.min_withdrawal_amount', '100'),
  ('email.from_name',                '"EveryGiving"'),
  ('email.from_address',             '"noreply@everygiving.com"'),
  ('verification.auto_approve_basic','false'),
  ('notifications.donor_receipt',    'true')
on conflict (key) do nothing;

-- ════════════════════════════════════════════════════════════════════════════
-- 5. BLOG POSTS
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  category     text,
  title        text not null,
  excerpt      text,
  body         text,
  cover_url    text,
  cover_emoji  text,
  read_time    text,
  author_name  text default 'EveryGiving Team',
  featured     boolean default false,
  published    boolean default false,
  published_at timestamptz default now(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table blog_posts enable row level security;
drop policy if exists "Anyone can read published blog posts" on blog_posts;
create policy "Anyone can read published blog posts" on blog_posts
  for select using (published = true);
drop policy if exists "Admins can manage blog posts" on blog_posts;
create policy "Admins can manage blog posts" on blog_posts
  for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ════════════════════════════════════════════════════════════════════════════
-- 6. DISPUTES
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists disputes (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete set null,
  user_id     uuid references auth.users on delete set null,
  reason      text not null,
  resolution  text,
  status      text default 'open' check (status in ('open','investigating','resolved','closed')),
  resolved_at timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table disputes enable row level security;
drop policy if exists "Admins can manage disputes" on disputes;
create policy "Admins can manage disputes" on disputes
  for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ════════════════════════════════════════════════════════════════════════════
-- 7. MILESTONES  (must exist before milestone_payouts)
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists milestones (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid references campaigns(id) on delete cascade not null,
  title         text not null,
  description   text,
  target_amount numeric(10,2),
  due_date      date,
  completed     boolean default false,
  completed_at  timestamptz,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table milestones enable row level security;
drop policy if exists "Anyone can read milestones" on milestones;
create policy "Anyone can read milestones" on milestones
  for select using (true);
drop policy if exists "Campaign owners can manage milestones" on milestones;
create policy "Campaign owners can manage milestones" on milestones
  for all using (
    exists (
      select 1 from campaigns
      where campaigns.id = milestones.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- 8. MILESTONE PAYOUTS
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists milestone_payouts (
  id                     uuid primary key default gen_random_uuid(),
  milestone_id           uuid references milestones(id) on delete set null,
  campaign_id            uuid references campaigns(id) on delete cascade,
  user_id                uuid references auth.users,
  amount                 numeric(10,2) not null,
  momo_network           text,
  momo_number            text,
  bank_name              text,
  bank_account           text,
  proof_url              text,
  note                   text,
  reject_note            text,
  paystack_transfer_code text,
  status                 text default 'pending'
                           check (status in ('pending','approved','paid','rejected','failed')),
  approved_at            timestamptz,
  paid_at                timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

alter table milestone_payouts enable row level security;
drop policy if exists "Campaigners can view their own payouts" on milestone_payouts;
create policy "Campaigners can view their own payouts" on milestone_payouts
  for select using (auth.uid() = user_id);
drop policy if exists "Campaigners can create payout requests" on milestone_payouts;
create policy "Campaigners can create payout requests" on milestone_payouts
  for insert with check (auth.uid() = user_id);
drop policy if exists "Admins can manage all payouts" on milestone_payouts;
create policy "Admins can manage all payouts" on milestone_payouts
  for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ════════════════════════════════════════════════════════════════════════════
-- 9. PAYMENT EVENTS  (Paystack webhook log)
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists payment_events (
  id                uuid primary key default gen_random_uuid(),
  external_event_id text,
  event_type        text,
  status            text,
  amount            numeric(10,2),
  payload           jsonb,
  processed         boolean default false,
  created_at        timestamptz default now()
);

alter table payment_events enable row level security;
drop policy if exists "Admins can read payment events" on payment_events;
create policy "Admins can read payment events" on payment_events
  for select using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ════════════════════════════════════════════════════════════════════════════
-- 10. AUTO-UPDATE TRIGGERS
-- ════════════════════════════════════════════════════════════════════════════

create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists support_tickets_updated_at   on support_tickets;
drop trigger if exists admin_roles_updated_at        on admin_roles;
drop trigger if exists blog_posts_updated_at         on blog_posts;
drop trigger if exists disputes_updated_at           on disputes;
drop trigger if exists milestones_updated_at         on milestones;
drop trigger if exists milestone_payouts_updated_at  on milestone_payouts;

create trigger support_tickets_updated_at   before update on support_tickets   for each row execute procedure update_updated_at_column();
create trigger admin_roles_updated_at       before update on admin_roles        for each row execute procedure update_updated_at_column();
create trigger blog_posts_updated_at        before update on blog_posts         for each row execute procedure update_updated_at_column();
create trigger disputes_updated_at          before update on disputes           for each row execute procedure update_updated_at_column();
create trigger milestones_updated_at        before update on milestones         for each row execute procedure update_updated_at_column();
create trigger milestone_payouts_updated_at before update on milestone_payouts  for each row execute procedure update_updated_at_column();

-- ════════════════════════════════════════════════════════════════════════════
-- 11. CONFIRM DONATION RPC  (called by Paystack webhook)
-- ════════════════════════════════════════════════════════════════════════════

create or replace function confirm_donation(p_campaign_id uuid, p_amount numeric)
returns void language plpgsql security definer as $$
begin
  update campaigns
  set
    raised_amount = coalesce(raised_amount, 0) + p_amount,
    donor_count   = coalesce(donor_count, 0) + 1
  where id = p_campaign_id;
end; $$;

-- ════════════════════════════════════════════════════════════════════════════
-- 12. SEED BLOG POSTS  (safe to re-run — on conflict do nothing)
-- ════════════════════════════════════════════════════════════════════════════

insert into blog_posts (slug, category, title, excerpt, read_time, cover_emoji, featured, published, published_at) values
  ('how-to-write-a-fundraising-story','Tips',        'How to write a fundraising story that moves people to give',         'Your story is your most powerful fundraising asset.',               '5 min read','✍️',true, true,'2026-03-01'),
  ('why-verification-matters',        'Verification','Why verification makes your campaign raise more',                    'Donors are cautious — and rightfully so.',                          '4 min read','✓', false,true,'2026-02-20'),
  ('whatsapp-fundraising-guide',      'Sharing',     'The complete guide to fundraising on WhatsApp',                      'WhatsApp is Ghana''s most powerful fundraising channel.',           '6 min read','📲',false,true,'2026-02-10'),
  ('medical-fundraising-ghana',       'Medical',     'How to raise money for medical bills in Ghana',                      'Medical campaigns are the most common — and the most urgent.',      '5 min read','🏥',false,true,'2026-01-28'),
  ('church-fundraising-guide',        'Faith',       'Church fundraising in Ghana: building projects, missions, ministry', 'Faith-based campaigns are among the most successful.',              '4 min read','⛪',false,true,'2026-01-15'),
  ('education-fundraising',           'Education',   'Raising school fees: a guide for students and their families',       'University fees, school books, WASSCE levies.',                     '4 min read','🎓',false,true,'2026-01-05'),
  ('first-48-hours',                  'Strategy',    'What to do in the first 48 hours of your campaign',                  'The first two days are the most critical.',                         '5 min read','⚡',false,true,'2025-12-20'),
  ('team-fundraising-tips',           'Team',        '7 ways to get your team to actually share — not just like',          'Creating a team campaign is straightforward.',                      '3 min read','🤝',false,true,'2025-12-10')
on conflict (slug) do nothing;