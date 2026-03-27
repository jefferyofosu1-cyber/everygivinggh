import { createClient } from './supabase'
import { NotificationService } from './notifications'

/**
 * Fundraiser Nudge Service
 * Handles the logic for identifying and sending time-sensitive nudges.
 */
export class NudgeService {
  /**
   * Scan for candidates and send nudges
   */
  static async processNudges() {
    const supabase = createClient()
    const now = new Date()

    // 1. Fetch campaigns that are approved/live and within the 48-hour window
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*, profiles(phone)')
      .eq('status', 'approved')
      .is('nudge_48h_sent', false) // If 48h is sent, the sequence is over
      .not('activated_at', 'is', null)

    if (error || !campaigns) {
      console.error('[NudgeService] Error fetching candidates:', error)
      return
    }

    for (const campaign of campaigns) {
      const activatedAt = new Date(campaign.activated_at)
      const diffHours = (now.getTime() - activatedAt.getTime()) / (1000 * 3600)
      const phone = campaign.profiles?.phone

      if (!phone) continue

      // ─── NUDGE 1: HOUR 6 (No donations yet) ─────────────────────────────────
      if (
        diffHours >= 6 && 
        diffHours < 24 && 
        !campaign.nudge_6h_sent && 
        (campaign.raised_amount || 0) === 0
      ) {
        try {
          const slug = campaign.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          await NotificationService.sendNudge6h(phone, slug)
          await supabase.from('campaigns').update({ nudge_6h_sent: true }).eq('id', campaign.id)
          console.log(`[NudgeService] Sent 6h nudge to ${campaign.id}`)
        } catch (err) {
          console.error(`[NudgeService] Failed 6h nudge for ${campaign.id}:`, err)
        }
      }

      // ─── NUDGE 2: HOUR 24 (No update posted) ───────────────────────────────
      if (
        diffHours >= 24 && 
        diffHours < 48 && 
        !campaign.nudge_24h_sent && 
        (!campaign.last_update_at || new Date(campaign.last_update_at).getTime() <= activatedAt.getTime())
      ) {
        try {
          await NotificationService.sendNudge24h(phone)
          await supabase.from('campaigns').update({ nudge_24h_sent: true }).eq('id', campaign.id)
          console.log(`[NudgeService] Sent 24h nudge to ${campaign.id}`)
        } catch (err) {
          console.error(`[NudgeService] Failed 24h nudge for ${campaign.id}:`, err)
        }
      }

      // ─── NUDGE 3: HOUR 48 (Milestone check) ───────────────────────────────
      if (diffHours >= 48 && !campaign.nudge_48h_sent) {
        try {
          await NotificationService.sendNudge48h(
            phone,
            campaign.raised_amount || 0,
            campaign.goal_amount || 0,
            campaign.donor_count || 0,
            campaign.views_count || 0
          )
          await supabase.from('campaigns').update({ nudge_48h_sent: true }).eq('id', campaign.id)
          console.log(`[NudgeService] Sent 48h nudge to ${campaign.id}`)
        } catch (err) {
          console.error(`[NudgeService] Failed 48h nudge for ${campaign.id}:`, err)
        }
      }

      // ─── PHASE 2: INACTIVITY NUDGES (3d & 7d) ─────────────────────────────
      const lastUpdate = campaign.last_update_at ? new Date(campaign.last_update_at) : activatedAt
      const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24)

      if (daysSinceUpdate >= 7 && !campaign.nudge_7d_sent) {
        try {
          await NotificationService.sendNudge7d(phone)
          await supabase.from('campaigns').update({ nudge_7d_sent: true }).eq('id', campaign.id)
        } catch (_) {}
      } else if (daysSinceUpdate >= 3 && !campaign.nudge_3d_sent) {
        try {
          await NotificationService.sendNudge3d(phone)
          await supabase.from('campaigns').update({ nudge_3d_sent: true }).eq('id', campaign.id)
        } catch (_) {}
      }

      // ─── PHASE 3: SILENCE + LOW FUNDING (Day 3 check) ─────────────────────
      const percentage = campaign.goal_amount > 0 ? ((campaign.raised_amount || 0) / campaign.goal_amount) * 100 : 0
      const hasRecentUpdate = campaign.last_update_at && new Date(campaign.last_update_at).getTime() > activatedAt.getTime()

      if (
        diffHours >= 72 && 
        percentage < 10 && 
        !hasRecentUpdate && 
        !campaign.nudge_silence_low_funding_sent
      ) {
        try {
          // Send internal notification/email to admin team for a supportive call
          await NotificationService.sendEmail({
            to: 'team@everygiving.org',
            subject: `Action Required: Silence + Low Funding (3 days) - ${campaign.title}`,
            htmlContent: `
              <p>The following campaign has been live for 3 days with low funding (< 10%) and no updates. Please schedule a supportive call with the organizer.</p>
              <ul>
                <li><strong>Campaign:</strong> ${campaign.title}</li>
                <li><strong>Organizer:</strong> ${campaign.profiles?.full_name || 'N/A'}</li>
                <li><strong>Phone:</strong> ${phone}</li>
                <li><strong>Raised:</strong> ₵${campaign.raised_amount?.toLocaleString()} / ₵${campaign.goal_amount?.toLocaleString()} (${Math.round(percentage)}%)</li>
              </ul>
            `
          })
          await supabase.from('campaigns').update({ nudge_silence_low_funding_sent: true }).eq('id', campaign.id)
        } catch (_) {}
      }

      // ─── PHASE 2: DEADLINE NUDGE (5 days before) ──────────────────────────
      if (campaign.deadline) {
        const deadline = new Date(campaign.deadline)
        const daysToDeadline = (deadline.getTime() - now.getTime()) / (1000 * 3600 * 24)

        if (daysToDeadline <= 5 && daysToDeadline > 0 && !campaign.nudge_deadline_5d_sent) {
          try {
            await NotificationService.sendNudgeDeadline(phone)
            await supabase.from('campaigns').update({ nudge_deadline_5d_sent: true }).eq('id', campaign.id)
          } catch (_) {}
        }

        // ─── PHASE 2: UNFUNDED END (Personal call trigger) ──────────────────
        if (now > deadline && (campaign.raised_amount || 0) < (campaign.goal_amount || 0) && !campaign.nudge_unfunded_sent) {
          try {
            // Send internal notification/email to admin team
            await NotificationService.sendEmail({
              to: 'team@everygiving.org',
              subject: `Action Required: Campaign Ended Unfunded - ${campaign.title}`,
              htmlContent: `
                <p>The following campaign has ended without reaching its goal. Please schedule a personal call with the organizer.</p>
                <ul>
                  <li><strong>Campaign:</strong> ${campaign.title}</li>
                  <li><strong>Organizer:</strong> ${campaign.profiles?.full_name || 'N/A'}</li>
                  <li><strong>Phone:</strong> ${phone}</li>
                  <li><strong>Raised:</strong> ₵${campaign.raised_amount?.toLocaleString()} / ₵${campaign.goal_amount?.toLocaleString()}</li>
                </ul>
              `
            })
            await supabase.from('campaigns').update({ nudge_unfunded_sent: true }).eq('id', campaign.id)
          } catch (_) {}
        }
      }
    }
  }
}
