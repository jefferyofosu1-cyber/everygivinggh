export default {
  name: 'fundraisingTip', title: 'Fundraising Tip', type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Tip title' },
    { name: 'tag', type: 'string', title: 'Tag' },
    { name: 'icon', type: 'string', title: 'Emoji icon' },
    { name: 'body', type: 'text', title: 'Tip body', rows: 4 },
    { name: 'stat', type: 'string', title: 'Key stat' },
    { name: 'statLabel', type: 'string', title: 'Stat label' },
    { name: 'order', type: 'number', title: 'Display order' },
  ],
}
