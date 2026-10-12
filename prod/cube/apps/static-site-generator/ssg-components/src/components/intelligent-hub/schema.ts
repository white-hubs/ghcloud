export const schema = {
  name: 'IntelligentHub',
  title: '开河智能中枢',
  description: '平台核心能力统计卡片+主图展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '开河智能中枢' },
    subtitle: { type: 'string' as const, required: false, label: '副标题' },
    description: { type: 'string' as const, required: false, label: '图片上方描述' },
    image: {
      type: 'string' as const,
      required: false,
      label: '主图',
      defaultValue: 'https://placehold.co/1312x622/e2e8f0/0f172a?text=Intelligent+Hub',
    },
    stats: {
      type: 'array' as const,
      required: true,
      label: '统计卡片',
      defaultValue: [
        { icon: 'https://placehold.co/120x120/1578FF/ffffff?text=1', label: '数据接入' },
        { icon: 'https://placehold.co/120x120/1578FF/ffffff?text=2', label: '智能分析' },
        { icon: 'https://placehold.co/120x120/1578FF/ffffff?text=3', label: '决策辅助' },
      ],
      itemType: {
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        label: { type: 'string' as const, required: true, label: '标签' },
      }
    },
  },
} as const
