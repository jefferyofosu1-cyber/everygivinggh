import { createServerSupabaseClient } from '@/lib/supabase-server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_BASE_URL = 'https://api.brevo.com/v3'
const BMS_API_KEY = process.env.BMS_API_KEY
const BMS_BASE_URL = process.env.BMS_BASE_URL || 'https://bms.codeslaw.dev/api/v1'
const BMS_SENDER_ID = process.env.BMS_SENDER_ID

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
  private static normalizeGhanaPhone(phoneNumber: string) {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '').trim()

    if (cleaned.startsWith('+233') && cleaned.length === 13) {
      return cleaned.slice(1)
    }

    if (cleaned.startsWith('233') && cleaned.length === 12) {
      return cleaned
    }

    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `233${cleaned.slice(1)}`
    }

    return cleaned
  }

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
   * Send SMS via CodeslawBMS (with Brevo fallback)
   */
  static async sendSMS({ phoneNumber, content }: SMSParams) {
    const recipient = this.normalizeGhanaPhone(phoneNumber)

    if (!BMS_API_KEY && !BREVO_API_KEY) {
      throw new Error('No SMS provider configured. Set BMS_API_KEY or BREVO_API_KEY.')
    }

    if (BMS_API_KEY) {
      try {
        const response = await fetch(`${BMS_BASE_URL}/sms/send`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${BMS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: [recipient],
            message: content,
            ...(BMS_SENDER_ID ? { senderId: BMS_SENDER_ID } : {}),
          }),
        })

        const payload = await response.json()

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.error || payload?.message || `HTTP ${response.status}`)
        }

        return { success: true, messageId: payload?.data?.messageId || null }
      } catch (error) {
        console.error('CodeslawBMS SMS send failed:', error)

        if (!BREVO_API_KEY) {
          throw error
        }

        console.warn('Falling back to Brevo SMS provider')
      }
    }

    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured for SMS fallback.')
    }

    try {
      const response = await fetch(`${BREVO_BASE_URL}/transactionalSMS/sms`, {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: 'EveryGiving',
          recipient,
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
    campaignId: string,
    campaignTitle: string,
    amount: number | string | bigint,
    transactionId: string,
    donorPhone?: string
  ) {
    const amountNum = Number(amount)
    const formattedAmount = `GHS ${(amountNum / 100).toFixed(2)}`
    const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
    const campaignLink = `${baseUrl}/campaigns/${campaignId}`

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
            <p><a href="${campaignLink}" class="cta">View Campaign</a></p>

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

    const emailResult = await this.sendEmail({
      to: donorEmail,
      subject: `Your donation was successful — thank you for your support`,
      htmlContent,
    })

    if (donorPhone) {
      try {
        await this.sendSMS({
          phoneNumber: donorPhone,
          content: `EveryGiving: Hi ${donorName}, your donation of ${formattedAmount} to "${campaignTitle}" was successful. Ref: ${transactionId}. Thank you.`,
        })
      } catch (smsError) {
        console.error('Donation confirmation SMS failed:', smsError)
      }
    }

    return emailResult
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
    const campaignLink = `${baseUrl}/campaigns/${campaignTitle.toLowerCase().replace(/\s+/g, '-')}` // Still using slug but fixed prefix

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
              <h1>${isFulFilled ? 'Goal reached — thank you for making it happen' : `${campaignTitle} has reached ${milestone}%`}</h1>
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

            ${!isFulFilled ? `<p><a href="${campaignLink}" class="cta">View Campaign</a></p>` : ''}

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
    const campaignLink = `${baseUrl}/campaigns/${campaignId}`
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
            <p><a href="${campaignLink}" class="cta">View Campaign</a></p>

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
    retryUrl: string,
    donorPhone?: string
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
            <p><a href="${retryUrl}" class="cta">Retry Payment</a></p>

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

    const emailResult = await this.sendEmail({
      to: donorEmail,
      subject: `Your donation could not be completed`,
      htmlContent,
    })

    if (donorPhone) {
      try {
        await this.sendSMS({
          phoneNumber: donorPhone,
          content: `EveryGiving: Hi ${donorName}, your donation attempt of ${formattedAmount} to "${campaignTitle}" could not be completed. Retry here: ${retryUrl}`,
        })
      } catch (smsError) {
        console.error('Payment failure SMS failed:', smsError)
      }
    }

    return emailResult
  }

  /**
   * Send payout setup prompt to fundraiser
   */
  static async sendPayoutSetupPrompt(
    fundraiserEmail: string,
    fundraiserName: string,
    campaignTitle: string,
    currentAmount: number,
    fundraiserPhone?: string
  ) {
    const formattedAmount = `GHS ${(currentAmount / 100).toFixed(2)}`
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
    const payoutLink = `${baseUrl}/dashboard/payout-setup`

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
          .milestone-box { background: #E6F7EF; border-left: 4px solid #02A95C; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .cta { display: inline-block; background: #02A95C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 500; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; border-top: 1px solid #E8E4DC; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>You've reached a milestone!</h1>
            </div>
            <p>Hi ${fundraiserName},</p>
            <div class="milestone-box">
              <p>Congratulations! Your campaign "<strong>${campaignTitle}</strong>" has raised <strong>${formattedAmount}</strong>.</p>
            </div>
            <p>To receive these funds, you now need to set up your payout method (Bank Account or Mobile Money).</p>
            <p><a href="${payoutLink}" class="cta">Set Up Payout Method</a></p>
            <p>Once set up, you can withdraw your funds securely. Well done on your progress!</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>The EveryGiving Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. Ghana's trusted crowdfunding platform.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailResult = await this.sendEmail({
      to: fundraiserEmail,
      subject: `Milestone Reached: Set up your payout for ${campaignTitle}`,
      htmlContent,
    })

    if (fundraiserPhone) {
      try {
        await this.sendSMS({
          phoneNumber: fundraiserPhone,
          content: `EveryGiving: Hi ${fundraiserName}, your campaign "${campaignTitle}" has reached ${formattedAmount}. Set up payout here: ${payoutLink}`,
        })
      } catch (smsError) {
        console.error('Payout setup SMS failed:', smsError)
      }
    }

    return emailResult
  }

  /**
   * Check campaign milestone and send alerts
   */
  static async checkAndSendMilestoneAlerts(campaignId: string) {
    try {
      const supabase = await createServerSupabaseClient()

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          title, 
          raised_amount, 
          goal_amount, 
          milestone_reached,
          payout_method_set,
          milestone_percentage,
          available_payout_balance,
          profiles:user_id (full_name, email, phone)
        `)
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      const totalRaised = Number(campaign.raised_amount || 0)
      const goalAmount = Number(campaign.goal_amount)
      const currentPercentage = Math.floor((totalRaised / goalAmount) * 100)
      const fundraiser = (campaign.profiles as any)
      
      const milestonePct = Number(campaign.milestone_percentage || 100)
      const unlockedPercentage = Math.min(100, Math.floor(currentPercentage / milestonePct) * milestonePct)
      
      let newAvailableBalance = 0;
      if (unlockedPercentage >= 100) {
        newAvailableBalance = totalRaised;
      } else {
        newAvailableBalance = (goalAmount * unlockedPercentage) / 100;
      }
      
      // Ensure we don't artificially inflate the balance above what's raised
      newAvailableBalance = Math.min(newAvailableBalance, totalRaised);

      // Check if unlocked balance increased
      if (newAvailableBalance > Number(campaign.available_payout_balance || 0)) {
        await supabase
          .from('campaigns')
          .update({ 
            available_payout_balance: newAvailableBalance,
            milestone_reached: true 
          })
          .eq('id', campaignId)

        // Send prompt to fundraiser if payout not set bono.
        if (!campaign.payout_method_set && fundraiser?.email) {
          await this.sendPayoutSetupPrompt(
            fundraiser.email,
            fundraiser.full_name || 'Fundraiser',
            campaign.title,
            newAvailableBalance,
            fundraiser.phone || undefined
          )
        }
      }

      // 2. Existing Donor Percentage Milestones bono.
      const milestonesToCheck = [25, 50, 100]

      for (const milestone of milestonesToCheck) {
        if (currentPercentage >= milestone) {
          const { data: existingAlert } = await supabase
            .from('milestone_alerts_sent')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('milestone', milestone)
            .single()

          if (!existingAlert) {
            const { data: donations } = await supabase
              .from('donations')
              .select('donor_email, donor_name')
              .eq('campaign_id', campaignId)
              .eq('status', 'success') // Updated to 'success' match payout system bono.

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
    }
  }

  /**
   * Send campaign submission confirmation
   */
  static async sendCampaignSubmissionConfirmation(phoneNumber: string) {
    const content = `Your campaign has been submitted for review. We'll notify you within 24 hours when it's approved. Questions? WhatsApp us: 0596566831`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Send campaign more info request SMS
   */
  static async sendCampaignMoreInfoSMS(phoneNumber: string, reason: string) {
    const content = `We've reviewed your campaign and need one thing before we can approve it: ${reason}. Resubmit here: everygiving.org/verify-id`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Send campaign live/activation SMS
   */
  static async sendCampaignLiveSMS(phoneNumber: string, title: string, slug: string) {
    const content = `EveryGiving: Your campaign is LIVE. "${title}" is now verified and accepting donations. Your link: everygiving.org/campaigns/${slug} Share it NOW — the first 48 hours matter most.`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Send premium campaign submission email
   */
  static async sendCampaignSubmissionEmail(
    email: string,
    name: string,
    title: string,
    slug: string
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
    const campaignLink = `everygiving.org/campaigns/${slug}`
    const whatsappNumber = '0596566831'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B3C; line-height: 1.6; background: #F5F5F0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; }
          .header { border-bottom: 1px solid #E8E4DC; padding-bottom: 20px; margin-bottom: 30px; }
          .header h2 { color: #02A95C; margin: 0; font-size: 24px; }
          .section { margin-bottom: 30px; }
          .section-title { font-weight: 800; color: #1A2B3C; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; margin-bottom: 15px; }
          .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
          .step-icon { color: #02A95C; margin-right: 12px; font-weight: bold; }
          .checklist-item { background: #F9F9F7; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #02A95C; }
          .link-box { background: #1A2B3C; color: white; border-radius: 8px; padding: 15px; margin-top: 10px; text-align: center; font-family: monospace; }
          .cta { display: inline-block; background: #02A95C; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 500; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; border-top: 1px solid #E8E4DC; padding-top: 20px; }
          p { margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h2>Your campaign is under review — here's what happens next</h2>
            </div>

            <p>Hi ${name},</p>
            <p>Your campaign "<strong>${title}</strong>" has been submitted and is now being reviewed by our team.</p>

            <div class="section">
              <div class="section-title">WHAT HAPPENS DURING REVIEW</div>
              <p>A real person on our team will check:</p>
              <div class="step"><span class="step-icon">·</span> <span>Your identity document (Ghana Card)</span></div>
              <div class="step"><span class="step-icon">·</span> <span>That your campaign details are complete</span></div>
              <div class="step"><span class="step-icon">·</span> <span>That your MoMo payout details are correct</span></div>
              <p>This takes us up to 24 hours — usually much faster. We'll send you an SMS the moment your campaign is approved.</p>
            </div>

            <div class="section">
              <div class="section-title">WHAT TO DO RIGHT NOW</div>
              <p>Don't wait for approval to start preparing. The campaigns that raise the most money are shared in the first 48 hours of going live. Use that time now:</p>
              
              <div class="checklist-item">
                <strong>1. Draft your WhatsApp message</strong><br>
                <span style="font-size: 13px; color: #666; font-style: italic;">"I've just launched a campaign to help my mother Ama get kidney surgery. It goes live tomorrow — I'll send the link as soon as it does. Please watch out for it."</span>
              </div>

              <div class="checklist-item">
                <strong>2. Tell 10 people personally</strong><br>
                <span style="font-size: 13px; color: #666;">Not a broadcast — send individual messages to the 10 people most likely to donate first. Early donations create momentum that attracts strangers.</span>
              </div>

              <div class="checklist-item">
                <strong>3. Prepare a photo for your first update</strong><br>
                <span style="font-size: 13px; color: #666;">The moment your campaign goes live, post an update. It can be short: "We're live. Thank you for being here." with a new photo.</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">YOUR CAMPAIGN LINK</div>
              <p>Your link will be active once approved:</p>
              <div class="link-box">${campaignLink}</div>
              <p style="font-size: 13px; color: #8A8A82; margin-top: 10px;">Save it now. Share it the moment you hear from us.</p>
            </div>

            <p>If you have any questions before then, reply to this email or WhatsApp us at <strong>${whatsappNumber}</strong>. A real person will respond.</p>

            <p style="margin-top: 30px;">Best regards,<br><strong>The EveryGiving Team</strong></p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. Connecting givers with causes that matter.</p>
            <p>everygiving.org</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `Your campaign is under review — here's what happens next`,
      htmlContent,
    })
  }

  /**
   * Send high-urgency "Campaign Live" email
   */
  static async sendCampaignLiveEmail(
    email: string,
    name: string,
    title: string,
    slug: string
  ) {
    const campaignUrl = `everygiving.org/campaigns/${slug}`
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'}/dashboard`
    const whatsappMsg = `My campaign to help Ama get kidney surgery is now live on EveryGiving. Every donation, no matter the size, moves us closer. Please give if you can, and share if you can't: ${campaignUrl}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B3C; line-height: 1.6; background: #F5F5F0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; }
          .header { border-bottom: 2px solid #E8F5EF; padding-bottom: 20px; margin-bottom: 30px; }
          .header h2 { color: #02A95C; margin: 0; font-size: 26px; }
          .urgency-box { background: #FFF9F0; border: 1px solid #FFE4BC; border-radius: 10px; padding: 20px; margin: 25px 0; }
          .urgency-title { font-weight: 800; color: #B45309; text-transform: uppercase; font-size: 13px; letter-spacing: 0.05em; margin-bottom: 12px; }
          .whatsapp-card { background: #F0FAF5; border: 1.5px dashed #02A95C; border-radius: 10px; padding: 20px; margin: 15px 0; font-family: 'DM Sans', sans-serif; position: relative; }
          .whatsapp-card::before { content: "WhatsApp Message"; position: absolute; top: -10px; left: 15px; background: #02A95C; color: white; padding: 2px 10px; font-size: 10px; font-weight: 800; border-radius: 4px; text-transform: uppercase; }
          .update-section { background: #F9FAFB; border-radius: 10px; padding: 20px; margin-top: 30px; }
          .cta { display: block; background: #02A95C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; text-align: center; font-weight: 700; margin-top: 25px; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h2>Your campaign is live — share it in the next 10 minutes</h2>
            </div>
            <p>Hi ${name},</p>
            <p>"<strong>${title}</strong>" is now live on EveryGiving.</p>
            <p style="font-weight: 700; font-size: 18px; color: #02A95C;">${campaignUrl}</p>

            <div class="urgency-box">
              <div class="urgency-title">🚀 SHARE IN THE NEXT 10 MINUTES</div>
              <p>Campaigns that are shared within the first hour of going live raise significantly more than those that wait. Here is your message — copy it now:</p>
              <div class="whatsapp-card">
                "${whatsappMsg}"
              </div>
              <p style="font-size: 13px; color: #4A4A44; margin-top: 15px;">
                Send that to your <strong>family group</strong> first.<br>
                Then your <strong>friends group</strong>.<br>
                Then your <strong>church group</strong>.<br>
                Then individually to the 5 people most likely to give.
              </p>
            </div>

            <div class="update-section">
              <div class="urgency-title" style="color: #4A4A44;">📸 YOUR FIRST UPDATE</div>
              <p>Post an update to your campaign within 24 hours. Campaigns that post updates raise 3x more.</p>
              <p style="font-style: italic; color: #666; font-size: 13px;">"We're live. Thank you to everyone who has already given. Ama is at home and she knows people care."</p>
            </div>

            <a href="${dashboardUrl}" class="cta">Go to your campaign dashboard →</a>
            
            <p style="margin-top: 35px; border-top: 1px solid #EEE; padding-top: 20px;">We are proud to have your campaign on EveryGiving. We'll be watching and will reach out if we can help.</p>
            <p>Best regards,<br><strong>The EveryGiving Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. Connecting givers with causes that matter.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `Your campaign is live — share it in the next 10 minutes`,
      htmlContent,
    })
  }

  /**
   * Send supportive "Action Required" email (Avoids "rejection" language)
   */
  static async sendCampaignActionRequiredEmail(
    email: string,
    name: string,
    title: string,
    reason: string
  ) {
    const fixUrl = `everygiving.org/verify-id`
    const whatsappNumber = '0596566831'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A2B3C; line-height: 1.6; background: #FFF9F9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .content { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; border: 1px solid #FCEBEB; }
          .header { border-bottom: 2px solid #FEF2F2; padding-bottom: 20px; margin-bottom: 30px; }
          .header h2 { color: #1A2B3C; margin: 0; font-size: 24px; }
          .reason-box { background: #FEF2F2; border-left: 4px solid #F87171; border-radius: 8px; padding: 20px; margin: 25px 0; }
          .section-title { font-weight: 800; color: #991B1B; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; margin-bottom: 10px; }
          .cta { display: block; background: #02A95C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; text-align: center; font-weight: 700; margin-top: 25px; }
          .support-note { background: #F0FAF5; border-radius: 8px; padding: 15px; margin-top: 30px; font-size: 13px; color: #065F46; }
          .footer { text-align: center; color: #8A8A82; font-size: 12px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h2>One thing to fix before your campaign goes live</h2>
            </div>
            <p>Hi ${name},</p>
            <p>Thank you for submitting your campaign "<strong>${title}</strong>". We've reviewed it carefully and there is one thing we need you to update before we can approve it.</p>

            <div class="reason-box">
              <div class="section-title">WHAT NEEDS CHANGING</div>
              <p style="font-weight: 600; color: #1A1A18;">${reason}</p>
            </div>

            <div style="margin: 25px 0;">
              <div class="section-title" style="color: #4A4A44;">HOW TO FIX IT</div>
              <p>Click the button below to resubmit. It takes about 5 minutes. Once resubmitted, we'll review it within 4 hours.</p>
              <a href="${fixUrl}" class="cta">Update and resubmit →</a>
            </div>

            <div class="support-note">
              <strong>THIS IS NORMAL</strong><br>
              Most campaigns require one small correction before going live. This is not a rejection — it is one step away from approval.
            </div>

            <p style="margin-top: 30px;">If you need help, WhatsApp us at <strong>${whatsappNumber}</strong> and a real person will help you fix it right now.</p>
            <p>The EveryGiving Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EveryGiving. We're here to help you succeed.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: email,
      subject: `One thing to fix before your campaign goes live`,
      htmlContent,
    })
  }

  /**
   * Hour 6 Nudge: Reminder to share on WhatsApp if no donations yet
   */
  static async sendNudge6h(phoneNumber: string, slug: string) {
    const content = `EveryGiving: Your campaign has been live for 6 hours. Have you shared it in your WhatsApp groups yet? Campaigns shared in the first 24 hours raise 4x more than those that aren't. Your link: everygiving.org/campaigns/${slug}`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Hour 24 Nudge: Reminder to post first campaign update
   */
  static async sendNudge24h(phoneNumber: string) {
    const content = `EveryGiving: Post your first campaign update today. A photo and one sentence. That's all. Donors who see an update give again. Donors who see nothing give nothing. Post now: everygiving.org/dashboard`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Hour 48 Nudge: Personalized milestone check
   */
  static async sendNudge48h(
    phoneNumber: string, 
    raised: number, 
    goal: number, 
    donors: number, 
    views: number
  ) {
    const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0
    const content = `EveryGiving: 48 hours in. Here's where you stand: Raised: ₵${raised.toLocaleString()} (${pct}% of goal), Donors: ${donors}, Views: ${views}. You're making progress. The next step is your first update — have you posted one yet?`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Day 3 Inactivity Nudge: Reminder to post an update after 3 days
   */
  static async sendNudge3d(phoneNumber: string) {
    const content = `EveryGiving: 3 days since your last update — donors are watching. Post now: everygiving.org/dashboard`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Day 7 Inactivity Nudge: Reminder to post an update after 7 days
   */
  static async sendNudge7d(phoneNumber: string) {
    const content = `EveryGiving: Your campaign goes quiet, donors go quiet. Post an update today: everygiving.org/dashboard`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Milestone Nudge: 25%, 50%, 75%
   */
  static async sendNudgeMilestone(phoneNumber: string, milestone: number) {
    let msg = ''
    if (milestone === 25) msg = "You're 25% funded. Post an update — donors who see progress give more."
    else if (milestone === 50) msg = "Halfway there. This is the moment to share again — 50% is momentum."
    else if (milestone === 75) msg = "75% funded. You're close. Share now and tell donors exactly what's left."
    
    if (!msg) return
    const content = `EveryGiving: ${msg}`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Diaspora Nudge: When the first international donation is received
   */
  static async sendNudgeDiaspora(phoneNumber: string) {
    const content = `EveryGiving: Someone gave from abroad. Your campaign reached across the world.`
    return this.sendSMS({ phoneNumber, content })
  }

  /**
   * Deadline Nudge: 5 days before campaign ends
   */
  static async sendNudgeDeadline(phoneNumber: string) {
    const content = `EveryGiving: 5 days left. One final share to your WhatsApp groups today.`
    return this.sendSMS({ phoneNumber, content })
  }
}
