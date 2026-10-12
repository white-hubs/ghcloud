export const schema = {
  name: 'CooperationWays',
  title: '合作方式',
  description: '合作方式板块，图片和卡片展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '板块标题', defaultValue: '合作方式' },
    images: {
      type: 'array' as const,
      required: true,
      label: '图片列表',
      itemType: { type: 'string' as const, required: true, label: '图片URL', editor: 'image' as const },
      defaultValue: [
        'https://placehold.co/306x192/0ea5e9/ffffff?text=1',
        'https://placehold.co/306x192/6366f1/ffffff?text=2',
        'https://placehold.co/306x192/22c55e/ffffff?text=3',
        'https://placehold.co/306x192/f59e0b/ffffff?text=4',
      ],
    },
    items: {
      type: 'array' as const,
      required: true,
      label: '卡片列表',
      itemType: {
        title: { type: 'string' as const, required: true, label: '卡片标题' },
        description: { type: 'string' as const, required: true, label: '卡片描述' },
      },
      defaultValue: [
        { title: '卡片一', description: '描述文案一' },
        { title: '卡片二', description: '描述文案二' },
        { title: '卡片三', description: '描述文案三' },
        { title: '卡片四', description: '描述文案四' },
      ],
    },
  },
} as const
