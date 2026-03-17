/**
 * EveryGiving — Admin Analytics Suite
 * Route: /admin (shell), tabs for each section
 *
 * Sections:
 *   /admin              → Analytics dashboard (charts, KPIs, live feed)
 *   /admin/verification → Identity verification queue
 *   /admin/campaigns    → Campaign management + status
 *   /admin/payouts      → Milestone payout queue
 *   /admin/donors       → Donor insights + acquisition
 *   /admin/fees         → Revenue & processing fee analytics
 *   /admin/flags        → Flagged content
 *   /admin/settings     → Platform settings
 *
 * Charts: Chart.js 4.x
 * All metrics wired to real API endpoints in production:
 *   GET /api/admin/analytics?period=7d|30d|90d|1y
 *   GET /api/admin/campaigns?status=&category=
 *   GET /api/admin/verifications?status=pending
 *   GET /api/admin/payouts?status=pending
 *
 * Fee display: Full fee transparency in admin (2.5% + ₵0.50)
 * Admin sees all fees; this data never surfaces to donors
 */

// See widget above for full implementation.
// This file is the React/Next.js wrapper for the admin shell.

export { default } from './AdminWidget';
