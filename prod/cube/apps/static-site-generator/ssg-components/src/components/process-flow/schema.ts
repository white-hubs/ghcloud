export const schema = {
  name: 'ProcessFlow',
  title: '流程步骤',
  description: '流程步骤展示，图标和标签',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: true, label: '板块标题', defaultValue: '流程步骤' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '' },
    background: { type: 'string' as const, required: false, label: '背景色', defaultValue: '', placeholder: '留空=浅蓝，white=白色，或输入#色值如#F1F6FF' },
    steps: {
      type: 'array' as const,
      required: true,
      label: '步骤列表',
      itemType: {
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        label: { type: 'string' as const, required: true, label: '步骤标签' },
      },
      defaultValue: [
        { icon: 'https://placehold.co/56x56/0ea5e9/ffffff?text=1', label: '步骤一' },
        { icon: 'https://placehold.co/56x56/6366f1/ffffff?text=2', label: '步骤二' },
        { icon: 'https://placehold.co/56x56/22c55e/ffffff?text=3', label: '步骤三' },
      ],
    },
  },
} as const
