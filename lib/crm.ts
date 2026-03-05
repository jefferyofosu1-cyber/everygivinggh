// Call this after signup or donation to add user to Brevo and send welcome email

type CRMUser = {
  email: string
  firstName: string
  lastName?: string
  phone?: string
}

export async function trackFundraiserSignup(user: CRMUser) {
  try {
    await fetch('/api/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'fundraiser_signup', user }),
    })
  } catch (err) {
    // Non-blocking — don't let CRM errors affect signup flow
    console.error('CRM tracking error:', err)
  }
}

export async function trackDonorSignup(user: CRMUser) {
  try {
    await fetch('/api/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'donor_signup', user }),
    })
  } catch (err) {
    console.error('CRM tracking error:', err)
  }
}
