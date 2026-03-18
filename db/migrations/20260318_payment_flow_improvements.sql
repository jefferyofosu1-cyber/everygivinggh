-- EveryGiving payment flow improvements
-- Add missing columns and indexes for proper Paystack integration

-- 1. Add payment tracking columns to donations table
alter table if exists public.donations
  add column if not exists paystack_reference text,
  add column if not exists rejection_reason text;

-- 2. Ensure campaigns table has funding tracking columns
alter table if exists public.campaigns
  add column if not exists raised_amount numeric(12,2) not null default 0,
  add column if not exists donor_count int not null default 0;

-- 3. Add indexes for payment queries
create index if not exists idx_donations_status on public.donations(status);
create index if not exists idx_donations_campaign_id on public.donations(campaign_id);
create index if not exists idx_donations_paystack_reference on public.donations(paystack_reference);
create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaigns_raised_amount on public.campaigns(raised_amount desc);

-- 4. Update donation status constraint to include new statuses
-- (Comment out if using text without constraint)
-- alter table public.donations
--   drop constraint if exists donations_status_check,
--   add constraint donations_status_check check (status in ('pending', 'confirmed', 'failed'));

-- 5. Create RPC function to update campaign totals atomically
create or replace function public.confirm_donation(
  p_campaign_id uuid,
  p_amount numeric
)
returns void
language sql
security definer
set search_path = public
as $$
  update campaigns
  set
    raised_amount = raised_amount + p_amount,
    donor_count = donor_count + 1,
    updated_at = now()
  where id = p_campaign_id;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.confirm_donation(uuid, numeric) to authenticated;
grant execute on function public.confirm_donation(uuid, numeric) to service_role;

-- 6. Create view for payment status dashboard (optional)
drop view if exists public.payment_status_summary cascade;
create view public.payment_status_summary as
select
  'donations' as entity_type,
  status,
  count(*) as count,
  coalesce(sum(amount), 0) as total_amount
from donations
group by status
union all
select
  'campaigns',
  status,
  count(*),
  coalesce(sum(raised_amount), 0)
from campaigns
group by status;

grant select on public.payment_status_summary to authenticated;
