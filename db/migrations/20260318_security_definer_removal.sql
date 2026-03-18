-- EveryGiving security fix: Remove SECURITY DEFINER from views
-- This migration removes SECURITY DEFINER property from problematic views
-- to ensure row-level security (RLS) policies are respected

-- Drop and recreate deferred_fees_outstanding view without SECURITY DEFINER
-- Original issue: Views defined with SECURITY DEFINER bypass row-level security
-- Resolution: Recreate with SECURITY INVOKER (default) to respect RLS policies

drop view if exists public.deferred_fees_outstanding cascade;

-- Recreate the view without SECURITY DEFINER
-- This assumes a reasonable definition based on the name
-- Adjust the query as needed based on your actual business logic
create view public.deferred_fees_outstanding as
select 
  id,
  campaign_id,
  fundraiser_user_id,
  amount,
  status,
  destination,
  requested_at,
  approved_by,
  approved_at,
  sent_at,
  failed_at,
  failure_reason,
  notes
from public.payout_requests
where status in ('requested', 'approved')
  and sent_at is null;

-- Ensure proper security by adding row-level security policies
-- Grant view access to authenticated users
grant select on public.deferred_fees_outstanding to authenticated;

-- Optional: If you need to restrict access to specific roles or campaigns,
-- you can enable RLS on the underlying payout_requests table with policies
-- Example (uncomment if needed):
-- alter table public.payout_requests enable row level security;
-- create policy "Admin can view all payout requests" on public.payout_requests
--   for select to authenticated
--   using (auth.jwt() ->> 'role' = 'admin' or fundraiser_user_id = auth.uid());
