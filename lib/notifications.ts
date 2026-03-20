import { createServerSupabaseClient } from '@/lib/supabase-server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_BASE_URL = 'https://api.brevo.com/v3'

if (!BREVO_API_KEY) {
  console.warn('BREVO_API_KEY is not set. Email notifications will not be sent.')
}

interface EmailParams {
  to: string
  subject: string
  htmlContent: string
  fromEmail?: string
  fromName?: string
}

interface SMSParams {
  phoneNumber: string
  content: string
}

export class NotificationService {
  /**
   * Send email via Brevo
   */
  static async sendEmail({
    to,
    subject,
    htmlContent,
    fromEmail = 'business@everygiving.org', // Use verified sender
    fromName = 'EveryGiving',
  }: EmailParams) {
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured. Email notifications cannot be sent.')
    }

    try {
      const response = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: fromEmail, name: fromName },
          to: [{ email: to }],
          subject,
          htmlContent,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Brevo API error: ${error.message}`)
      }

      return { success: true, messageId: (await response.json()).messageId }
    } catch (error) {
      console.error('Email send failed:', error)
      throw error
    }
  }

  /**
   * Send SMS via Brevo
   */
  static async sendSMS({ phoneNumber, content }: SMSParams) {
    try {
      const response = await fetch(`${BREVO_BASE_URL}/transactionalSMS/sms`, {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'EveryGiving',
          recipient: phoneNumber,
          content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Brevo SMS error: ${error.message}`)
      }

      return { success: true, messageId: (await response.json()).reference }
    } catch (error) {
      console.error('SMS send failed:', error)
      throw error
    }
  }

  /**
   * Send donation confirmation
   */
  static async sendDonationConfirmation(
    donorEmail: string,
    donorName: string,
    campaignTitle: string,
    amount: number | string | bigint,
    transactionId: string
  ) {
    const amountNum = Number(amount)
    const formattedAmount = `GHS ${(amountNum / 100).toFixed(2)}`
    const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    const campaignSlug = campaignTitle.toLowerCase().replace(/\s+/g, '-')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
    const campaignLink = `${baseUrl}/campaign/${campaignSlug}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B3C; line-height: 1.6; background: #F5F5F0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; }
          .header { color: #02A95C; margin-bottom: 20px; }
          .header h1 { margin: 0 0 10px 0; font-size: 24px; }
          .summary { background: #F9F9F7; border-left: 4px solid #02A95C; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .summary-row strong { color: #02A95C; }
          .cta { display: inline-block; background: #02A95C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 500; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; border-top: 1px solid #E8E4DC; padding-top: 20px; }
          p { margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>Your donation was successful — thank you for your support</h1>
            </div>

            <p>Hi ${donorName},</p>

            <p>Thank you for your generous donation of <strong>${formattedAmount}</strong> to &quot;<strong>${campaignTitle}</strong>.&quot;</p>

            <p>Your support is already making a real difference. Because of you, this campaign is one step closer to its goal.</p>

            <div class="summary">
              <div style="font-weight: 600; margin-bottom: 15px; color: #1A2B3C;">Transaction Summary:</div>
              <div class="summary-row">
                <span>Campaign:</span>
                <strong>${campaignTitle}</strong>
              </div>
              <div class="summary-row">
                <span>Amount:</span>
                <strong>${formattedAmount}</strong>
              </div>
              <div class="summary-row">
                <span>Date:</span>
                <strong>${today}</strong>
              </div>
            </div>

            <p>You can view the campaign and follow progress here:</p>
            <p><a href="${campaignLink}" class="cta">👉 View Campaign</a></p>

            <p>If you'd like to do even more, consider sharing this campaign with your network.</p>

            <p>Thank you again for your kindness and support.</p>

            <p style="margin-top: 30px;">Warm regards,<br><strong>The EveryGiving Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. All rights reserved.</p>
            <p>Building trust through transparency in Ghana's crowdfunding ecosystem.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `Your donation was successful — thank you for your support`,
      htmlContent,
    })
  }

  /**
   * Send thank you message from fundraiser
   */
  static async sendThankYouMessage(
    donorEmail: string,
    donorName: string,
    fundraiserName: string,
    campaignTitle: string,
    customMessage: string,
    amount?: number | string | bigint
  ) {
    const amountNum = amount ? Number(amount) : null
    const amountText = amountNum ? ` of GHS ${(amountNum / 100).toFixed(2)}` : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B3C; line-height: 1.6; background: #F5F5F0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; }
          .header { color: #02A95C; margin-bottom: 20px; }
          .header h1 { margin: 0 0 10px 0; font-size: 24px; }
          .message-box { background: #F9F9F7; padding: 20px; border-left: 4px solid #02A95C; border-radius: 8px; margin: 20px 0; font-style: italic; color: #333; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; border-top: 1px solid #E8E4DC; padding-top: 20px; }
          p { margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>A personal thank you from ${fundraiserName}</h1>
            </div>

            <p>Hi ${donorName},</p>

            <p>I just wanted to personally thank you for your donation${amountText} to my campaign, &quot;<strong>${campaignTitle}</strong>.&quot;</p>

            <p>Your support means more than words can express. It brings us closer to achieving our goal and making this possible.</p>

            <div class="message-box">${customMessage}</div>

            <p>I truly appreciate your kindness and willingness to help.</p>

            <p>Thank you once again for standing with us.</p>

            <p style="margin-top: 30px;">With gratitude,<br><strong>${fundraiserName}</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. Connecting givers with causes that matter.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `A personal thank you from ${fundraiserName}`,
      htmlContent,
    })
  }

  /**
   * Send campaign milestone alert
   */
  static async sendMilestoneAlert(
    donorEmail: string,
    donorName: string,
    campaignTitle: string,
    milestone: number, // 25, 50, 100
    currentAmount: number | string | bigint,
    goalAmount: number | string | bigint
  ) {
    const currentNum = Number(currentAmount)
    const goalNum = Number(goalAmount)
    const formattedCurrent = `GHS ${(currentNum / 100).toFixed(2)}`
    const formattedGoal = `GHS ${(goalNum / 100).toFixed(2)}`
    const isFulFilled = milestone === 100
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
    const campaignLink = `${baseUrl}/campaign/${campaignTitle.toLowerCase().replace(/\s+/g, '-')}`

    let subject: string
    let content: string

    if (isFulFilled) {
      subject = `Goal reached — thank you for making it happen`
      content = `
        <p>Great news! &quot;<strong>${campaignTitle}</strong>&quot; has reached 100% of its goal.</p>
        <p>This would not have been possible without your support.</p>
        <p>Because of you and other donors, this campaign has successfully raised <strong>${formattedCurrent}</strong>.</p>
        <p>Thank you for being part of something meaningful.</p>
      `
    } else {
      subject = `${campaignTitle} has reached ${milestone}%`
      content = `
        <p>Great news — &quot;<strong>${campaignTitle}</strong>&quot; has reached <strong>${milestone}%</strong> of its goal.</p>
        <p>This progress is only possible because of supporters like you.</p>
        <p>The campaign has now raised <strong>${formattedCurrent}</strong>, and momentum is building.</p>
        <p>You can help push it further by sharing:</p>
      `
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B3C; line-height: 1.6; background: #F5F5F0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; }
          .header { color: #02A95C; margin-bottom: 20px; }
          .header h1 { margin: 0 0 10px 0; font-size: 24px; }
          .progress-section { margin: 30px 0; }
          .progress-bar { background: #E8E4DC; height: 16px; border-radius: 99px; overflow: hidden; margin: 15px 0; }
          .progress-fill { background: linear-gradient(90deg, #02A95C, #017A42); height: 100%; width: ${milestone}%; transition: width 0.3s; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: #F9F9F7; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-box .amount { font-size: 28px; color: #02A95C; font-weight: bold; margin: 10px 0; }
          .stat-box .label { color: #8A8A82; font-size: 12px; text-transform: uppercase; }
          .cta { display: inline-block; background: #02A95C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 500; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; border-top: 1px solid #E8E4DC; padding-top: 20px; }
          p { margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>${isFulFilled ? '🎉 Goal reached — thank you for making it happen' : `${campaignTitle} has reached ${milestone}%`}</h1>
            </div>

            <p>Hi ${donorName},</p>

            ${content}

            <div class="progress-section">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
              <div class="stats">
                <div class="stat-box">
                  <div class="label">Raised</div>
                  <div class="amount">${formattedCurrent}</div>
                </div>
                <div class="stat-box">
                  <div class="label">Goal</div>
                  <div class="amount">${formattedGoal}</div>
                </div>
              </div>
            </div>

            ${!isFulFilled ? `<p><a href="${campaignLink}" class="cta">👉 View Campaign</a></p>` : ''}

            <p style="margin-top: 30px;">Warm regards,<br><strong>The EveryGiving Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. Empowering change in Ghana.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject,
      htmlContent,
    })
  }

  /**
   * Send campaign update to all donors
   */
  static async sendCampaignUpdate(
    donorEmail: string,
    donorName: string,
    campaignTitle: string,
    updateTitle: string,
    updateContent: string,
    campaignId: string,
    totalRaised?: number | string | bigint
  ) {
    const totalRaisedNum = totalRaised ? Number(totalRaised) : null
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
    const campaignLink = `${baseUrl}/campaign/${campaignId}`
    const totalRaisedText = totalRaisedNum ? `<p>Thanks to your contribution, the campaign has now raised <strong>GHS ${(totalRaisedNum / 100).toFixed(2)}</strong> so far.</p>` : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B3C; line-height: 1.6; background: #F5F5F0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; }
          .header { color: #02A95C; margin-bottom: 20px; }
          .header h1 { margin: 0 0 10px 0; font-size: 24px; }
          .update-box { background: #F9F9F7; padding: 20px; border-left: 4px solid #02A95C; border-radius: 8px; margin: 20px 0; }
          .update-box h3 { margin: 0 0 10px 0; color: #02A95C; }
          .cta { display: inline-block; background: #02A95C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 500; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; border-top: 1px solid #E8E4DC; padding-top: 20px; }
          p { margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>Update on &quot;${campaignTitle}&quot;</h1>
            </div>

            <p>Hi ${donorName},</p>

            <p>There's an update on the campaign you supported: &quot;<strong>${campaignTitle}</strong>.&quot;</p>

            <div class="update-box">
              <h3>${updateTitle}</h3>
              <p>${updateContent}</p>
            </div>

            ${totalRaisedText}

            <p>You can view the latest progress here:</p>
            <p><a href="${campaignLink}" class="cta">👉 View Campaign</a></p>

            <p>Your support continues to make a difference. Thank you for being part of this journey.</p>

            <p style="margin-top: 30px;">Warm regards,<br><strong>The EveryGiving Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. Building trust through transparency.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `Update on "${campaignTitle}"`,
      htmlContent,
    })
  }

  /**
   * Send payment failure alert
   */
  static async sendPaymentFailureAlert(
    donorEmail: string,
    donorName: string,
    campaignTitle: string,
    amount: number | string | bigint,
    retryUrl: string
  ) {
    const amountNum = Number(amount)
    const formattedAmount = `GHS ${(amountNum / 100).toFixed(2)}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B3C; line-height: 1.6; background: #F5F5F0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; }
          .header { color: #DC2626; margin-bottom: 20px; }
          .header h1 { margin: 0 0 10px 0; font-size: 24px; }
          .alert-box { background: #FEE2E2; border-left: 4px solid #DC2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .alert-box p { margin: 0; color: #991B1B; }
          .cta { display: inline-block; background: #02A95C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 500; }
          .support-link { color: #02A95C; text-decoration: none; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; border-top: 1px solid #E8E4DC; padding-top: 20px; }
          p { margin: 15px 0; }
          ul { margin: 15px 0; padding-left: 20px; }
          li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>Your donation could not be completed</h1>
            </div>

            <p>Hi ${donorName},</p>

            <div class="alert-box">
              <p>We were unable to process your recent donation to &quot;<strong>${campaignTitle}</strong>.&quot;</p>
            </div>

            <p>This may be due to a temporary issue with your payment method.</p>

            <p>If you'd still like to support this campaign, you can try again here:</p>
            <p><a href="${retryUrl}" class="cta">👉 Retry Payment</a></p>

            <p>If the issue persists, please check your payment details or try a different method.</p>

            <p>We appreciate your willingness to support and hope you'll try again.</p>

            <p style="margin-top: 30px;">Kind regards,<br><strong>The EveryGiving Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. Making giving easy and secure.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `Your donation could not be completed`,
      htmlContent,
    })
  }

  /**
   * Check campaign milestone and send alerts
   */
  static async checkAndSendMilestoneAlerts(campaignId: string) {
    try {
      const supabase = await createServerSupabaseClient()

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('title, total_raised, goal_amount')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      const totalRaised = Number(campaign.total_raised || 0)
      const goalAmount = Number(campaign.goal_amount)
      const currentPercentage = Math.floor((totalRaised / goalAmount) * 100)

      // Determine which milestones have been reached
      const milestonesToCheck = [25, 50, 100]

      for (const milestone of milestonesToCheck) {
        if (currentPercentage >= milestone) {
          // Check if alert already sent
          const { data: existingAlert } = await supabase
            .from('milestone_alerts_sent')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('milestone', milestone)
            .single()

          if (!existingAlert) {
            // Get all unique donors for this campaign
            const { data: donations } = await supabase
              .from('donations')
              .select('donor_email, donor_name')
              .eq('campaign_id', campaignId)
              .eq('status', 'completed')

            // Send alerts to all donors
            if (donations) {
              for (const donation of donations) {
                await this.sendMilestoneAlert(
                  donation.donor_email,
                  donation.donor_name,
                  campaign.title,
                  milestone,
                  totalRaised,
                  goalAmount
                )
              }
            }

            // Record that alert was sent
            await supabase.from('milestone_alerts_sent').insert({
              campaign_id: campaignId,
              milestone,
              sent_at: new Date().toISOString(),
            })
          }
        }
      }
    } catch (error) {
      console.error('Milestone check failed:', error)
      throw error
    }
  }
}
