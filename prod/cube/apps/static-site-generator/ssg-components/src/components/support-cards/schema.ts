export const schema = {
  name: 'SupportCards',
  title: '支持卡片',
  description: '支持服务卡片列表，带头图和内容',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '板块标题', defaultValue: '支持服务' },
    background: {
      type: 'string' as const,
      required: false,
      label: '背景色',
      defaultValue: 'gray',
      editor: 'select' as const,
      options: [
        { label: '灰色', value: 'gray' },
        { label: '白色', value: 'white' },
      ],
    },
    items: {
      type: 'array' as const,
      required: true,
      label: '卡片列表',
      itemType: {
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '卡片标题' },
        description: { type: 'string' as const, required: true, label: '卡片描述' },
        decoration: { type: 'string' as const, required: false, label: '装饰图', editor: 'image' as const },
      },
      defaultValue: [
        { icon: 'https://placehold.co/60x60/0ea5e9/ffffff?text=I', title: '卡片一', description: '描述文案一' },
        { icon: 'https://placehold.co/60x60/6366f1/ffffff?text=I', title: '卡片二', description: '描述文案二' },
      ],
    },
  },
} as const
