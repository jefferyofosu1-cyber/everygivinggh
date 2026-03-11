# EveryGiving — Deep Codebase Analysis

> **Date:** March 11, 2026
> **Scope:** Full audit of the EveryGiving Next.js/Supabase crowdfunding platform
> **Goal:** Identify drawbacks, security issues, and improvements to make the app world-class

---

## Table of Contents

1. [Critical Security Issues](#1-critical-security-issues)
2. [Architecture & Design Issues](#2-architecture--design-issues)
3. [Performance Issues](#3-performance-issues)
4. [Code Quality Issues](#4-code-quality-issues)
5. [UX & Product Issues](#5-ux--product-issues)
6. [Deployment & Ops Issues](#6-deployment--ops-issues)
7. [Prioritized Recommendations](#7-prioritized-recommendations)

---

## 1. Critical Security Issues

### 1.1 — Vulnerable Next.js version (CRITICAL)

`next@14.2.5` has a **known critical vulnerability** (flagged by npm itself during install). This must be upgraded to the latest patched 14.x release immediately.

- **File:** `package.json`
- **Fix:** `npm install next@latest` (within 14.x range) or upgrade to 15.x

### 1.2 — `'unsafe-eval'` in Content Security Policy (HIGH)

Both `next.config.js` and `middleware.ts` include `'unsafe-eval'` in the CSP `script-src`. This defeats much of the XSS protection that CSP provides. Next.js does not require `unsafe-eval` in production.

- **Files:** `next.config.js` (line 25), `middleware.ts` (line 155)
- **Fix:** Remove `'unsafe-eval'` and use nonces for inline scripts if needed.

### 1.3 — Admin operations use client-side Supabase (HIGH)

In `app/admin/campaigns/page.tsx`, campaign approval/rejection is done directly from the browser using the **anon key**:

```ts
const supabase = createClient() // browser client, anon key
await supabase.from('campaigns').update({ status, verified: ... }).eq('id', campaign.id)
```

This means any user who intercepts the anon key (it's public) could approve/reject campaigns **if Row-Level Security (RLS) is misconfigured on the `campaigns` table**.

- **File:** `app/admin/campaigns/page.tsx`
- **Fix:** All admin mutations should go through a server-side API route that uses `requireAdmin()` from `lib/api-security.ts`.

### 1.4 — Campaigns page fetches ALL campaigns regardless of status (HIGH)

`app/campaigns/page.tsx` fetches `supabase.from('campaigns').select('*')` with **no status filter**. This exposes `pending` and `rejected` campaigns to all visitors. The donate page correctly filters by `eq('status', 'approved')`, but the main campaigns browse page does not.

- **File:** `app/campaigns/page.tsx`
- **Fix:** Add `.eq('status', 'approved')` to the query.

### 1.5 — `/api/send-status-email` has no authentication (HIGH)

The `send-status-email` route accepts a POST with `to`, `name`, `title`, `status`, and `note` — and sends an email to whatever address is provided. There is **no auth check**. Anyone can send arbitrary emails impersonating EveryGiving.

- **File:** `app/api/send-status-email/route.ts`
- **Fix:** Add `requireAdmin()` at the top of the handler.

### 1.6 — `/api/crm` has no authentication (HIGH)

The CRM route lets anyone POST arbitrary user data into Brevo contact lists and trigger welcome emails.

- **File:** `app/api/crm/route.ts`
- **Fix:** Add at minimum origin checking or authentication.

### 1.7 — `/api/verify` has no authentication (MEDIUM)

The Smile Identity verification route accepts raw base64 images and ID data. Anyone with access to the endpoint can trigger document verification calls against the paid Smile Identity API.

- **File:** `app/api/verify/route.ts`
- **Fix:** Add `requireAuth()` at the top.

### 1.8 — Smile Identity API key sent in request body (MEDIUM)

In `app/api/verify/route.ts`, `SMILE_API_KEY` is included in the request body to Smile Identity. Verify this is the expected usage from their SDK docs; typically, API keys go in headers.

- **File:** `app/api/verify/route.ts`

### 1.9 — Campaign submit doesn't use `api-security.ts` sanitization helpers (MEDIUM)

The `campaign-submit` route has good sanitization utilities available in `lib/api-security.ts`, but **doesn't use them**. Title, story, and other user inputs are only `.trim()`'d.

- **File:** `app/api/campaign-submit/route.ts`
- **Fix:** Use `sanitiseString()`, `sanitiseNumber()`, and `sanitiseEmail()` from `lib/api-security.ts`.

### 1.10 — Duplicate CSP definitions (LOW)

Security headers are defined in **three places** — `next.config.js`, the middleware catch-all, and individual CSP policies. These drift out of sync (the middleware CSP includes `https://api.hubtel.com` in `connect-src` while `next.config.js` does not).

- **Files:** `next.config.js`, `middleware.ts`
- **Fix:** Consolidate to one authoritative location (middleware is best for dynamic CSP).

---

## 2. Architecture & Design Issues

### 2.1 — Everything is `'use client'` (MAJOR)

**Every single page** in the app is a client component. This is the single biggest architectural issue:

- **SEO:** Google sees an empty `<div>` until JS executes. For a crowdfunding platform that depends on search traffic, this is business-critical.
- **Performance:** Users download the full React bundle before seeing any content. First Contentful Paint (FCP) will be slow on Ghanaian mobile networks.
- **Social sharing:** OpenGraph crawlers (WhatsApp, Facebook, Twitter) run no JavaScript. Shared campaign links show generic metadata, not the campaign title/image.

**Fix:** Convert listing and detail pages to Server Components. Use `'use client'` only for interactive widgets (forms, dropdowns, etc.).

### 2.2 — No per-page metadata

Campaign detail pages (`/campaigns/[id]`) have no `generateMetadata`. When someone shares a campaign link on WhatsApp, the preview shows "EveryGiving — Ghana's Trusted Crowdfunding Platform" instead of the campaign title and image. This is devastating for a platform that depends on social sharing.

- **Fix:** Add `generateMetadata()` to `app/campaigns/[id]/page.tsx` that fetches the campaign title, story excerpt, and image.

### 2.3 — `CampaignCard` duplicated 4 times

There are separate `CampaignCard` implementations in:

1. `components/ui/CampaignCard.tsx` (shared component — unused in practice)
2. `app/page.tsx` (inline)
3. `app/campaigns/page.tsx` (inline)
4. `app/donate/page.tsx` (inline)

Each has slightly different markup and behavior.

- **Fix:** Use the single shared `components/ui/CampaignCard.tsx` everywhere.

### 2.4 — No global error boundary or loading states

There's no `error.tsx`, `not-found.tsx`, or `loading.tsx` anywhere. If a database query fails or a route doesn't exist, the user gets a raw Next.js error or a white screen.

- **Fix:** Add these files at the `app/` level at minimum.

### 2.5 — `vercel.json` SPA rewrite conflicts with Next.js

`vercel.json` has a catch-all rewrite `/(.*) → /index.html`. This is for SPA frameworks (CRA, Vite), **not** Next.js. It can break API routes, SSR, and middleware in production.

- **File:** `vercel.json`
- **Fix:** Remove the file entirely or replace with valid Next.js configuration.

### 2.6 — No database types (Supabase codegen)

The codebase uses `any` extensively for Supabase query results. This causes silent runtime bugs when the database schema changes.

- **Fix:** Run `npx supabase gen types typescript` to generate a typed `Database` interface and pass it to `createClient<Database>()`.

### 2.7 — In-memory rate limiting in middleware

The rate limiter in `middleware.ts` uses a `Map()` in RAM. On Vercel, each serverless invocation is isolated, so the rate limit **resets on every cold start** and **doesn't share state across instances**.

- **File:** `middleware.ts`
- **Fix:** Use Vercel KV, Upstash Redis, or `@vercel/firewall` for production rate limiting.

---

## 3. Performance Issues

### 3.1 — Unsplash images loaded without Next.js `<Image>`

The homepage loads 12+ full-resolution Unsplash images using raw `<img>` tags. These are not lazy-loaded, not responsive, and not optimized. On Ghanaian 3G/4G networks, this alone could add 3–5 seconds to homepage load.

- **File:** `app/page.tsx`
- **Fix:** Replace `<img>` with `next/image` for automatic WebP conversion, responsive sizing, and lazy loading.

### 3.2 — Google Fonts loaded via `<link>` without stylesheet

Fonts are loaded via `<link rel="preconnect">` in the `<head>`, but the actual font stylesheet URL is never included in the `<link>` tags — meaning fonts load only via Tailwind/CSS.

- **File:** `app/layout.tsx`
- **Fix:** Use `next/font/google` for zero-layout-shift font loading.

### 3.3 — Client-side data fetching with no caching

Every page fetches data client-side in `useEffect`. This means:

- No caching between navigations
- Waterfall loading: HTML → JS → React render → Supabase fetch → re-render
- No ISR/SSG capability

**Fix:** Convert listing pages to server components with `fetch()` + `revalidate` for instant loads.

### 3.4 — No pagination

The campaigns page loads **all campaigns** at once. As the platform grows, this will be a major performance and UX problem.

- **Fix:** Implement cursor-based pagination with Supabase `.range()`.

---

## 4. Code Quality Issues

### 4.1 — Pervasive `any` typing

Almost every Supabase query result and component prop is typed as `any`. This defeats TypeScript's purpose and guarantees runtime bugs as the schema evolves.

- **Fix:** Generate Supabase types, define component prop interfaces, and eliminate all `any` usage.

### 4.2 — Emoji/category dictionaries duplicated across 5+ files

`EMOJI`, `CATEGORY_COLORS`, and category mappings are defined separately in the homepage, campaigns page, donate page, campaign detail page, and `CampaignCard`.

- **Fix:** Create a single `lib/constants.ts` with all shared constants.

### 4.3 — Massive inline HTML email templates

`app/api/crm/route.ts`, `app/api/campaign-submit/route.ts`, and `app/api/send-status-email/route.ts` each contain hundreds of lines of inline HTML strings.

- **Fix:** Extract into a shared `lib/email-templates/` directory, or use a library like `react-email`.

### 4.4 — Supabase client created inside render functions

In `components/layout/Navbar.tsx`, `createClient()` is called directly inside the component body (not inside `useEffect` or `useMemo`). This creates a new client instance on every render.

- **File:** `components/layout/Navbar.tsx`
- **Fix:** Hoist client creation outside of the component or memoize.

### 4.5 — No environment variable validation

All env vars use the pattern `process.env.X || ''` or `process.env.X!`. If `NEXT_PUBLIC_SUPABASE_URL` is missing, the app silently fails with cryptic errors.

- **Fix:** Add a startup validation step (e.g., using `zod` or a simple runtime check in `lib/env.ts`).

---

## 5. UX & Product Issues

### 5.1 — No forgot-password / password reset flow

The login page has no "Forgot password?" link. This is a basic auth requirement.

- **File:** `app/auth/login/page.tsx`
- **Fix:** Add forgot-password page that calls `supabase.auth.resetPasswordForEmail()`.

### 5.2 — No campaign image upload on creation

The create form only uploads ID documents. There's no way to upload a campaign cover photo, which is critical for donor trust and social sharing.

- **File:** `app/create/page.tsx`
- **Fix:** Add a campaign photo upload step.

### 5.3 — No donation payment integration

The donate flow inserts a row with `status: 'pending'` and returns success — but there's no actual payment integration. The comment in `app/api/donate/route.ts` says:

> "Hubtel MoMo prompt will be triggered here once integrated"

Until payment is working, the donation flow gives users false confirmation.

- **File:** `app/api/donate/route.ts`
- **Fix:** Integrate Hubtel, Paystack, or another MoMo payment provider.

### 5.4 — No email confirmation UX handling

After signup, users must confirm their email. But there's no handling for the case where a user tries to log in before confirming — they'll just get a generic "Invalid login credentials" error.

- **Fix:** Detect unconfirmed users and show a specific "Please confirm your email" message.

### 5.5 — Dashboard withdrawal flow is a no-op

The withdraw modal in the dashboard has a confirm button that just shows a "sent" state — but doesn't trigger any actual payout logic.

- **File:** `app/dashboard/page.tsx`

### 5.6 — Search is client-side only

The search on the campaigns page filters locally from already-fetched data. As campaigns grow, this won't scale.

- **Fix:** Use Supabase full-text search or `ilike` queries server-side.

---

## 6. Deployment & Ops Issues

### 6.1 — No `.env.example` or environment documentation

There are at least 8 required environment variables:

| Variable | Used In |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Supabase clients |
| `BREVO_API_KEY` | CRM, campaign-submit, send-status-email |
| `ADMIN_EMAIL` | campaign-submit |
| `NEXT_PUBLIC_APP_URL` | Email templates |
| `SMILE_PARTNER_ID` | Verify route |
| `SMILE_API_KEY` | Verify route |
| Smile base URL toggle | Verify route (test vs production) |

None are documented.

- **Fix:** Create `.env.example` with all required variables and placeholder values.

### 6.2 — Smile Identity is pointed at test API

`app/api/verify/route.ts` uses `testapi.smileidentity.com`. This will need a production toggle.

- **Fix:** Use an environment variable to switch between test and production URLs.

### 6.3 — No logging infrastructure

All errors go to `console.error`. For a financial platform in production, this is insufficient.

- **Fix:** Integrate structured logging (Axiom, Logtail, or Vercel's built-in logs).

### 6.4 — No tests of any kind

There are zero unit tests, integration tests, or E2E tests. For a financial platform handling real money, test coverage is essential on:

- Donation amount validation
- Auth flows
- Campaign status transitions
- API route authorization

- **Fix:** Add Vitest for unit/integration tests, Playwright for E2E.

---

## 7. Prioritized Recommendations

### P0 — Do Immediately (security / breaking)

| # | Item | Impact |
|---|------|--------|
| 1 | Upgrade `next` to latest patched 14.x | Fixes critical CVE |
| 2 | Remove `vercel.json` SPA rewrite | Prevents production breakage |
| 3 | Add auth to `/api/send-status-email`, `/api/crm`, `/api/verify` | Prevents abuse |
| 4 | Fix campaigns page to filter by `status: approved` | Prevents data leak |
| 5 | Move admin DB mutations to server-side API routes | Prevents unauthorized state changes |

### P1 — High Priority (business-critical)

| # | Item | Impact |
|---|------|--------|
| 6 | Convert key pages to Server Components with `generateMetadata` | SEO + social sharing |
| 7 | Add per-campaign OG metadata for WhatsApp/social previews | Growth critical |
| 8 | Replace raw `<img>` with `next/image` | Performance on mobile networks |
| 9 | Remove `'unsafe-eval'` from CSP | Security hardening |
| 10 | Integrate actual MoMo payment (Hubtel/Paystack) | Core product functionality |

### P2 — Important (quality / scalability)

| # | Item | Impact |
|---|------|--------|
| 11 | Add `error.tsx`, `not-found.tsx`, `loading.tsx` | User experience |
| 12 | Consolidate `CampaignCard` + constants into shared modules | Maintainability |
| 13 | Generate Supabase database types, eliminate `any` | Developer velocity + safety |
| 14 | Add server-side pagination | Scalability |
| 15 | Add forgot-password flow | Basic auth UX |
| 16 | Add campaign image upload | Donor trust |
| 17 | Use `next/font/google` for font loading | Performance |

### P3 — Nice to Have (ops / polish)

| # | Item | Impact |
|---|------|--------|
| 18 | Add `.env.example` + env validation | DevOps |
| 19 | Move rate limiting to Upstash Redis or Vercel KV | Production reliability |
| 20 | Extract email templates to `react-email` or shared files | Maintainability |
| 21 | Add E2E tests (Playwright) + unit tests for API routes | Quality assurance |
| 22 | Add structured logging (Axiom/Logtail) | Incident response |

---

## Summary

This is a well-structured early-stage codebase with good security instincts (CSP headers, rate limiting, input sanitization utilities, RLS awareness). The biggest leaps toward "world-class" are:

1. **Fix the security gaps** — unauthenticated API routes, exposed pending campaigns, admin mutations via client-side Supabase
2. **Convert to Server Components** — essential for SEO, social sharing on WhatsApp, and performance on Ghanaian mobile networks
3. **Complete the payment integration** — the donation and withdrawal flows are currently non-functional
4. **Add testing** — a financial platform requires confidence that money flows and auth work correctly

Addressing the P0 items will make the platform **safe to run in production**. Completing P1 will make it **competitive and shareable**. P2 and P3 will make it **maintainable and scalable** as the user base grows.
