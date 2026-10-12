export const schema = {
  name: 'ServiceAdvantages',
  title: '服务优势',
  description: '服务优势卡片网格，带图标和描述',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '板块标题', defaultValue: '服务优势' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '' },
    items: {
      type: 'array' as const,
      required: true,
      label: '优势列表',
      itemType: {
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        title: { type: 'string' as const, required: true, label: '优势标题' },
        description: { type: 'string' as const, required: true, label: '优势描述' },
      },
      defaultValue: [
        { icon: 'https://placehold.co/72x72/0ea5e9/ffffff?text=A', title: '优势一', description: '优势描述文案一' },
        { icon: 'https://placehold.co/72x72/6366f1/ffffff?text=A', title: '优势二', description: '优势描述文案二' },
      ],
    },
  },
} as const
