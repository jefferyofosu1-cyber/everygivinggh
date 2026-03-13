# EveryGiving Admin Expansion Handover

Last updated: 2026-03-13
Branch context: dev1-fix

## 1) Purpose
This document captures the major admin platform additions implemented in the current expansion so any developer can:
- understand what was added,
- run it locally or in staging/production,
- troubleshoot quickly,
- extend safely without breaking access control or data integrity.

## 2) What Was Added
The admin area was expanded from basic campaign/user moderation into an operations console covering:
- role-based access control (RBAC),
- audit logs,
- payouts workflow,
- payments reconciliation,
- verification queue,
- support tickets and disputes,
- reporting dashboards,
- platform settings,
- CMS-driven page content management,
- media library management,
- payment webhook ingestion (Hubtel).

## 3) Core Architecture Changes

### 3.1 Permission-aware admin auth
File: lib/api-security.ts

Added:
- ADMIN_PERMISSION_MAP with roles:
  - super_admin
  - moderator
  - finance
  - content_editor
  - support
- requirePermission(permission?) for route-level enforcement.
- requireAdmin() now delegates to requirePermission().
- logAdminAudit(...) for immutable admin action logs.

Auth behavior:
- Root admin can be granted through NEXT_PUBLIC_ADMIN_EMAIL.
- Otherwise, user is validated by profiles.is_admin and/or admin_roles role assignment.
- If a permission is required and role lacks it, API returns 403.

### 3.2 Service-role Supabase client
File: lib/supabase-admin.ts

Added createAdminClient() that uses:
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

This bypasses RLS and is only intended for protected admin API routes.

### 3.3 Admin nav and dashboard expansion
Files:
- app/admin/layout.tsx
- app/admin/page.tsx
- app/api/admin/stats/route.ts

Added nav modules and dashboard cards for:
- pending payouts,
- open disputes,
- payment mismatches.

### 3.4 Sanity-backed content and media utilities
Files:
- lib/sanity.ts
- lib/content.ts

Added:
- Sanity read/write clients,
- image URL builder,
- usePageContent(slug) and cms(...) helper for CMS override + fallback content.

## 4) Database Schema Additions
Migration file:
- db/migrations/20260313_admin_expansion.sql

New tables:
- admin_roles
- admin_audit_logs
- payout_requests
- payout_events
- payment_events
- payment_reconciliation_runs
- verification_reviews
- support_tickets
- donation_disputes
- platform_settings
- metric_snapshots

Indexes added for operational queries:
- audit logs by created_at
- payout status
- payment processed + created_at
- support ticket status + created_at
- dispute status + created_at
- verification status + created_at

## 5) New Admin Pages
Under app/admin:
- /admin/roles
- /admin/audit-logs
- /admin/verification
- /admin/payouts
- /admin/payouts/[id]
- /admin/payments
- /admin/support
- /admin/disputes
- /admin/reports
- /admin/settings
- /admin/content
- /admin/media

## 6) New/Expanded Admin APIs
Under app/api/admin:

CRUD status notes:
- Roles: full CRUD (GET/POST/PATCH/DELETE)
- Settings: full CRUD (GET/POST/PATCH/DELETE)
- Support tickets: full CRUD (GET/POST/PATCH/DELETE via [id])
- Disputes: full CRUD (GET/POST/PATCH/DELETE via [id])
- Verification reviews: full CRUD (GET/POST/PATCH/DELETE via [id], plus approve/reject actions)
- Payout requests: full CRUD (GET/POST/DELETE) plus workflow transitions (approve/reject/mark-sent/mark-failed)

### 6.1 Roles & audit
- GET/PATCH /api/admin/roles
- GET /api/admin/audit-logs

### 6.2 Campaigns, users, donations
- GET/PATCH/DELETE /api/admin/campaigns
- GET/PATCH/DELETE /api/admin/users
- GET/PATCH/DELETE /api/admin/donations

### 6.3 Verification
- GET /api/admin/verification
- PATCH /api/admin/verification/[id]
- POST /api/admin/verification/[id]/approve
- POST /api/admin/verification/[id]/reject

### 6.4 Payouts
- GET /api/admin/payouts
- POST /api/admin/payouts/approve
- POST /api/admin/payouts/reject
- POST /api/admin/payouts/mark-sent
- POST /api/admin/payouts/mark-failed

### 6.5 Payments
- GET /api/admin/payments/events
- GET /api/admin/payments/mismatches
- POST /api/admin/payments/reconcile
- POST /api/admin/payments/retry

### 6.6 Support & disputes
- GET /api/admin/support/tickets
- PATCH /api/admin/support/tickets/[id]
- GET /api/admin/support/disputes
- PATCH /api/admin/support/disputes/[id]

### 6.7 Reports & settings
- GET /api/admin/reports/overview
- GET /api/admin/reports/funnel
- GET /api/admin/reports/categories
- GET/PATCH /api/admin/settings

### 6.8 Content + media
- GET/POST/DELETE /api/admin/content
- GET/POST /api/admin/media
- PATCH/DELETE /api/admin/media/[id]

### 6.9 Stats
- GET /api/admin/stats

## 7) Webhook Added
- POST /api/webhooks/hubtel

Purpose:
- stores Hubtel callback data in payment_events table,
- upserts by external_event_id,
- marks events as processed=false for reconciliation workflow.

## 8) Environment Variables
Review and set the following for full functionality:

Required for admin APIs and auth:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_ADMIN_EMAIL

Required for email flows:
- BREVO_API_KEY

Required for media/content (Sanity):
- NEXT_PUBLIC_SANITY_PROJECT_ID
- NEXT_PUBLIC_SANITY_DATASET
- SANITY_API_TOKEN

Also check existing KYC integration vars:
- SMILE_PARTNER_ID
- SMILE_API_KEY
- SMILE_BASE_URL

Reference template:
- .env.example

## 9) Deployment / Rollout Checklist

1. Apply migration:
   - db/migrations/20260313_admin_expansion.sql

2. Ensure env vars exist in hosting platform and local .env.

3. Build verification:
   - npm run build -- --no-lint

4. Manual smoke checks:
   - login to /admin
   - open each new module page
   - confirm role-restricted routes return 403 for unauthorized roles
   - create at least one role assignment, setting, and audit log producing action
   - verify /api/webhooks/hubtel accepts a sample payload

5. Optional role bootstrap SQL:

```sql
insert into public.admin_roles (user_id, role, permissions)
values ('<auth-user-uuid>', 'super_admin', '[]'::jsonb)
on conflict (user_id)
do update set role = excluded.role, updated_at = now();
```

## 10) Permissions Matrix (Current)
Defined in lib/api-security.ts.

- super_admin: *
- moderator:
  - campaigns.review
  - verification.review
  - reports.read
- finance:
  - donations.read
  - payments.manage
  - payouts.manage
  - reports.read
- content_editor:
  - content.manage
  - media.manage
  - reports.read
- support:
  - support.manage
  - disputes.manage
  - users.read

## 11) Notes and Caveats
- Service-role APIs bypass RLS. Keep strict use of requirePermission on every admin endpoint.
- Audit logging is intentionally non-blocking; operation success is prioritized if logging fails.
- Lint debt exists across legacy files in the repo; build and type checks are currently the reliable gate.
- Some existing pages now support CMS fallbacks via usePageContent/cms; hardcoded defaults remain as fallback behavior.

## 12) Suggested Next Improvements
- Add pagination/search/filter parameters to high-volume admin endpoints (audit logs, payments, support).
- Add stricter input schemas (zod or similar) for all admin mutations.
- Move permission strings to shared constants to avoid typos.
- Add integration tests for key admin workflows:
  - payout lifecycle,
  - verification approval/rejection,
  - disputes resolution,
  - payment reconciliation run creation.

## 13) Quick File Index
Security/auth:
- lib/api-security.ts
- lib/supabase-admin.ts

DB:
- db/migrations/20260313_admin_expansion.sql

Admin shell/stats:
- app/admin/layout.tsx
- app/admin/page.tsx
- app/api/admin/stats/route.ts

Content/media:
- lib/sanity.ts
- lib/content.ts
- app/admin/content/page.tsx
- app/admin/media/page.tsx
- app/api/admin/content/route.ts
- app/api/admin/media/route.ts
- app/api/admin/media/[id]/route.ts

Webhook:
- app/api/webhooks/hubtel/route.ts

---
If you add or remove any admin module/API/table, update this handover file in the same PR.