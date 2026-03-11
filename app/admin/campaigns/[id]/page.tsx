import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CampaignForm } from '@/components/admin/CampaignForm'
import { getCampaignById } from '@/lib/sanityClient'

type Params = {
  id: string
}

export default async function AdminEditCampaignPage({
  params,
}: {
  params: Params
}) {
  const campaign = await getCampaignById(params.id)

  if (!campaign) {
    notFound()
  }

  return (
    <div>
      <AdminHeader
        title="Edit campaign"
        subtitle={campaign.title}
      />
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
        <CampaignForm initial={campaign} />
      </div>
    </div>
  )
}

