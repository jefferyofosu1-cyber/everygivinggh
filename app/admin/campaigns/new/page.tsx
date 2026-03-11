import { AdminHeader } from '@/components/admin/AdminHeader'
import { CampaignForm } from '@/components/admin/CampaignForm'

export default function AdminNewCampaignPage() {
  return (
    <div>
      <AdminHeader
        title="Create campaign"
        subtitle="Create a new Sanity-backed campaign."
      />
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
        <CampaignForm />
      </div>
    </div>
  )
}

