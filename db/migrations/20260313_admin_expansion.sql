-- EveryGiving admin expansion schema (MVP)
-- Apply in Supabase SQL editor.

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  role text not null,
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_state jsonb,
  after_state jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid,
  fundraiser_user_id uuid,
  amount numeric(12,2) not null,
  status text not null default 'requested',
  destination jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  approved_by uuid,
  approved_at timestamptz,
  sent_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  notes text
);

create table if not exists public.payout_events (
  id uuid primary key default gen_random_uuid(),
  payout_request_id uuid,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null unique,
  event_type text not null,
  status text,
  amount numeric(12,2),
  currency text,
  donation_id uuid,
  payload jsonb not null,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_checked int not null default 0,
  mismatches int not null default 0,
  summary jsonb
);

create table if not exists public.verification_reviews (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid,
  reviewer_id uuid,
  status text not null default 'pending',
  risk_score int,
  reason_codes text[],
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid,
  email text,
  type text not null,
  subject text not null,
  message text not null,
  priority text not null default 'normal',
  status text not null default 'open',
  assigned_to uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donation_disputes (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid,
  ticket_id uuid,
  reason text not null,
  status text not null default 'open',
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);
create index if not exists idx_payout_requests_status on public.payout_requests(status);
create index if not exists idx_payment_events_processed on public.payment_events(processed, created_at desc);
create index if not exists idx_support_tickets_status on public.support_tickets(status, created_at desc);
create index if not exists idx_donation_disputes_status on public.donation_disputes(status, created_at desc);
create index if not exists idx_verification_reviews_status on public.verification_reviews(status, created_at desc);
