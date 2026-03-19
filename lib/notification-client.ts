/**
 * Client-side helper for notification API endpoints
 * Use this in your components to trigger notifications
 */

export class NotificationClient {
  /**
   * Send thank you message from fundraiser to donor
   */
  static async sendThankYouMessage(
    donationId: string,
    message: string
  ) {
    const response = await fetch('/api/notifications/thank-you', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donation_id: donationId, message }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send thank you message')
    }

    return response.json()
  }

  /**
   * Send campaign update to all donors
   */
  static async sendCampaignUpdate(
    campaignId: string,
    title: string,
    content: string
  ) {
    const response = await fetch('/api/notifications/campaign-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId, title, content }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send campaign update')
    }

    return response.json()
  }

  /**
   * Trigger payment failure alert for a donation
   */
  static async sendPaymentFailureAlert(donationId: string) {
    const response = await fetch('/api/notifications/payment-failed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donation_id: donationId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send payment failure alert')
    }

    return response.json()
  }

  /**
   * Manually check and send milestone alerts for a campaign
   */
  static async checkMilestones(campaignId: string) {
    const response = await fetch('/api/admin/notifications/check-milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to check milestones')
    }

    return response.json()
  }
}
