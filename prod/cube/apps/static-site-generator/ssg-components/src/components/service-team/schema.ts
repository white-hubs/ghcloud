export const schema = {
  name: 'ServiceTeam',
  title: '服务团队',
  description: '服务团队展示，图片和文字卡片',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '板块标题', defaultValue: '服务团队' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '' },
    items: {
      type: 'array' as const,
      required: true,
      label: '成员列表',
      itemType: {
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '标题' },
        description: { type: 'string' as const, required: true, label: '描述' },
      },
      defaultValue: [
        { image: 'https://placehold.co/420x280/0ea5e9/ffffff?text=Team+1', title: '团队一', description: '描述文案一' },
        { image: 'https://placehold.co/420x280/6366f1/ffffff?text=Team+2', title: '团队二', description: '描述文案二' },
      ],
    },
  },
} as const
