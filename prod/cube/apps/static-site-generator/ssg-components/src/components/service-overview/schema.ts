export const schema = {
  name: 'ServiceOverview',
  title: '服务概览',
  description: '服务概览卡片，带图标、标题、副标题和描述',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '板块标题', defaultValue: '服务概览' },
    items: {
      type: 'array' as const,
      required: true,
      label: '服务列表',
      itemType: {
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '服务标题' },
        subtitle: { type: 'string' as const, required: true, label: '副标题' },
        description: { type: 'string' as const, required: true, label: '描述' },
      },
      defaultValue: [
        { icon: 'https://placehold.co/100x100/0ea5e9/ffffff?text=S', title: '服务一', subtitle: '副标题一', description: '服务描述文案一' },
        { icon: 'https://placehold.co/100x100/6366f1/ffffff?text=S', title: '服务二', subtitle: '副标题二', description: '服务描述文案二' },
      ],
    },
  },
} as const
