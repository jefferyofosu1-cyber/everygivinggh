import { createServerSupabaseClient } from '@/lib/supabase-server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_BASE_URL = 'https://api.brevo.com/v3'

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
    fromEmail = 'noreply@everygiving.org',
    fromName = 'EveryGiving',
  }: EmailParams) {
    try {
      const response = await fetch(`${BREVO_BASE_URL}/smtp/email`, {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY!,
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
    amount: number,
    transactionId: string
  ) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', sans-serif; color: #1A2B3C; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #02A95C 0%, #017A42 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
          .content { padding: 30px; background: #FDFAF5; border-radius: 12px; margin-top: 20px; }
          .amount { font-size: 32px; font-weight: bold; color: #02A95C; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #8A8A82; font-size: 12px; }
          .button { display: inline-block; background: #02A95C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank you for your donation! 🎉</h1>
          </div>
          
          <div class="content">
            <p>Hi ${donorName},</p>
            
            <p>Your donation has been received and confirmed. You've made a real difference today.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span>Campaign:</span>
                <strong>${campaignTitle}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span>Amount:</span>
                <strong>₵${(amount / 100).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-top: 1px solid #E8E4DC; padding-top: 15px;">
                <span>Transaction ID:</span>
                <strong>${transactionId}</strong>
              </div>
            </div>
            
            <p>Your donation is helping someone in need. The fundraiser will receive your contribution and will be able to update you on how it's making an impact.</p>
            
            <a href="https://everygiving.org/campaign/${campaignTitle.toLowerCase().replace(/\\s+/g, '-')}" class="button">View Campaign</a>
            
            <p style="margin-top: 30px; color: #8A8A82;">
              Questions? We're here to help. Reply to this email or visit our Help Centre.
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 EveryGiving. All rights reserved.</p>
            <p>Building trust through transparency in Ghana's crowdfunding ecosystem.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `Your ₵${(amount / 100).toFixed(2)} donation confirmed for ${campaignTitle}`,
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
    customMessage: string
  ) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', sans-serif; color: #1A2B3C; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #02A95C 0%, #017A42 100%); color: white; padding: 30px; border-radius: 12px; }
          .content { padding: 30px; background: #FDFAF5; border-radius: 12px; margin-top: 20px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #02A95C; border-radius: 8px; margin: 20px 0; font-style: italic; }
          .footer { text-align: center; margin-top: 30px; color: #8A8A82; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>A message from ${fundraiserName}</h1>
          </div>
          
          <div class="content">
            <p>Hi ${donorName},</p>
            
            <p>You recently donated to <strong>"${campaignTitle}"</strong>, and the fundraiser wants to thank you personally:</p>
            
            <div class="message-box">${customMessage}</div>
            
            <p>Your support means the world. Thank you for making a difference! 💚</p>
            
            <p style="margin-top: 30px; color: #8A8A82;">
              Want to see how your donation is helping? Check the campaign updates regularly.
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 EveryGiving. Connecting givers with causes that matter.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `A personal message from ${fundraiserName} ❤️`,
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
    currentAmount: number,
    goalAmount: number
  ) {
    const milestoneLabel =
      milestone === 25
        ? 'One Quarter There!'
        : milestone === 50
          ? 'Halfway There!'
          : 'Goal Reached! 🎉'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', sans-serif; color: #1A2B3C; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #02A95C 0%, #017A42 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
          .content { padding: 30px; background: #FDFAF5; border-radius: 12px; margin-top: 20px; }
          .progress-bar { background: #E8E4DC; height: 12px; border-radius: 99px; overflow: hidden; margin: 20px 0; }
          .progress-fill { background: linear-gradient(90deg, #02A95C, #017A42); height: 100%; width: ${milestone}%; transition: width 0.3s; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: white; padding: 15px; border-radius: 8px; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #8A8A82; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${milestoneLabel}</h1>
            <p>Campaign progress update</p>
          </div>
          
          <div class="content">
            <p>Hi ${donorName},</p>
            
            <p>Exciting news! The campaign you supported has reached a major milestone:</p>
            
            <h2 style="color: #02A95C; text-align: center; margin: 20px 0;">"${campaignTitle}"</h2>
            
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            
            <div class="stats">
              <div class="stat-box">
                <div style="font-size: 24px; color: #02A95C; font-weight: bold;">₵${(currentAmount / 100).toFixed(2)}</div>
                <div style="color: #8A8A82; font-size: 12px;">Raised</div>
              </div>
              <div class="stat-box">
                <div style="font-size: 24px; color: #02A95C; font-weight: bold;">₵${(goalAmount / 100).toFixed(2)}</div>
                <div style="color: #8A8A82; font-size: 12px;">Goal</div>
              </div>
            </div>
            
            <p>Thanks to generous donors like you, this campaign is getting closer to its goal. Keep an eye on updates to see the real impact of your contribution!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 EveryGiving. Empowering change in Ghana.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `${milestoneLabel} - "${campaignTitle}" campaign update`,
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
    campaignId: string
  ) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', sans-serif; color: #1A2B3C; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #02A95C 0%, #017A42 100%); color: white; padding: 30px; border-radius: 12px; }
          .content { padding: 30px; background: #FDFAF5; border-radius: 12px; margin-top: 20px; }
          .update-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #02A95C; }
          .button { display: inline-block; background: #02A95C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #8A8A82; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Campaign Update: ${campaignTitle}</h1>
          </div>
          
          <div class="content">
            <p>Hi ${donorName},</p>
            
            <p>There's an update for the campaign you supported:</p>
            
            <div class="update-box">
              <h3 style="margin-top: 0; color: #02A95C;">${updateTitle}</h3>
              <p>${updateContent}</p>
            </div>
            
            <p>We wanted to keep you informed about how your donation is making a difference.</p>
            
            <a href="https://everygiving.org/campaign/${campaignId}" class="button">Read Full Update</a>
            
            <p style="margin-top: 30px; color: #8A8A82;">
              You'll receive updates as the fundraiser shares their progress. This is part of our commitment to transparency.
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 EveryGiving. Building trust through transparency.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `Update: ${campaignTitle}`,
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
    amount: number,
    retryUrl: string
  ) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'DM Sans', sans-serif; color: #1A2B3C; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 30px; border-radius: 12px; }
          .content { padding: 30px; background: #FDFAF5; border-radius: 12px; margin-top: 20px; }
          .alert-box { background: #FEE2E2; border-left: 4px solid #DC2626; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #02A95C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #8A8A82; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Could Not Be Processed ⚠️</h1>
          </div>
          
          <div class="content">
            <p>Hi ${donorName},</p>
            
            <div class="alert-box">
              <p style="margin: 0; color: #991B1B;">
                Unfortunately, we couldn't process your donation of <strong>₵${(amount / 100).toFixed(2)}</strong> for <strong>"${campaignTitle}"</strong>.
              </p>
            </div>
            
            <p>This could happen for several reasons:</p>
            <ul>
              <li>Insufficient funds in your account</li>
              <li>Card declined for security reasons</li>
              <li>Network or temporary service issues</li>
              <li>Incorrect payment details</li>
            </ul>
            
            <p>Don't worry—your donation hasn't been charged. Please try again:</p>
            
            <a href="${retryUrl}" class="button">Retry Payment</a>
            
            <p style="margin-top: 30px; color: #8A8A82;">
              Having trouble? <a href="https://everygiving.org/help" style="color: #02A95C; text-decoration: none;">Contact our support team</a>—we're here to help!
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 EveryGiving. Making giving easy and secure.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: donorEmail,
      subject: `Payment failed for your ₵${(amount / 100).toFixed(2)} donation`,
      htmlContent,
    })
  }

  /**
   * Check campaign milestone and send alerts
   */
  static async checkAndSendMilestoneAlerts(campaignId: string) {
    try {
      const supabase = await createServerSupabaseClient()

      // Get campaign with donation totals
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*, donations(amount)')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      const totalRaised = campaign.donations.reduce(
        (sum: number, d: any) => sum + (d.amount || 0),
        0
      )
      const goalAmount = campaign.goal_amount
      const currentPercentage = Math.round((totalRaised / goalAmount) * 100)

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
            // Get all donors for this campaign
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
