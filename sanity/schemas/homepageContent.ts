export default {
  name: 'homepageContent', title: 'Homepage Content', type: 'document',
  fields: [
    { name: 'heroTitle', type: 'string', title: 'Hero title' },
    { name: 'heroSubtitle', type: 'text', title: 'Hero subtitle', rows: 2 },
    { name: 'statsRaised', type: 'string', title: 'Total raised (e.g. ₵2.4M+)' },
    { name: 'statsCampaigns', type: 'string', title: 'Campaigns stat' },
    { name: 'statsDonors', type: 'string', title: 'Donors stat' },
  ],
}
