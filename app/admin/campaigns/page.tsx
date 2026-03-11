import Link from 'next/link'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CampaignTable } from '@/components/admin/CampaignTable'

export default function AdminCampaignsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <AdminHeader
          title="Campaigns"
          subtitle="Manage all Sanity-backed campaigns."
        />
        <Link
          href="/admin/campaigns/new"
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-nunito font-black text-sm transition-all"
        >
          New campaign
        </Link>
      </div>
      <CampaignTable />
    </div>
  )
}

