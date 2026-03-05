// Add this to your campaigns/[id]/page.tsx donation handler
// After a successful donation, call trackDonorSignup if they provided an email

// Example usage in your donation submit handler:
//
// import { trackDonorSignup } from '@/lib/crm'
//
// const handleDonation = async () => {
//   // ... process payment ...
//
//   // After successful payment:
//   if (donorEmail && donorName) {
//     trackDonorSignup({
//       email: donorEmail,
//       firstName: donorName.split(' ')[0],
//       lastName: donorName.split(' ').slice(1).join(' '),
//     })
//   }
// }

// ─── WHAT HAPPENS WHEN SOMEONE SIGNS UP ──────────────────────────────────────
//
// FUNDRAISER signup (/auth/signup):
//   1. Supabase account created
//   2. Profile row created in DB
//   3. Added to Brevo "Fundraisers" list (list ID 2) + "All Users" list (list ID 1)
//   4. Tagged as "Fundraiser" in Brevo CRM
//   5. Welcome email sent with 3-step getting started guide
//
// DONOR (after donation):
//   1. Added to Brevo "Donors" list (list ID 3) + "All Users" list (list ID 1)
//   2. Tagged as "Donor" in Brevo CRM
//   3. Thank you email sent with trust signal about verified campaigns
//
// ─── BREVO DASHBOARD SETUP ───────────────────────────────────────────────────
//
// After signing up at brevo.com:
//
// 1. Go to Contacts → Lists → Create 3 lists:
//    - "All Users"    → note the ID (usually 1 or 2)
//    - "Fundraisers"  → note the ID
//    - "Donors"       → note the ID
//
// 2. Update LIST_IDS in /app/api/crm/route.ts with your actual IDs
//
// 3. Go to Settings → API Keys → Generate key
//    Add to Vercel env vars: BREVO_API_KEY=your_key_here
//
// 4. Verify your sender email in Brevo:
//    Settings → Senders & IPs → Add sender
//    Use: hello@everygivinggh.com (or your domain)
//
// ─── TESTING ─────────────────────────────────────────────────────────────────
//
// Test the API directly:
// POST https://everygivinggh.vercel.app/api/crm
// Body: { "type": "fundraiser_signup", "user": { "email": "test@example.com", "firstName": "Ama" } }

export {}
