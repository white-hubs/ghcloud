export const schema = {
  name: 'EngineCards',
  title: '开河智能中枢',
  description: '平台标题+五引擎卡片展示，支持hover动效',
  interactive: false,
  props: {
    platformTitle: { type: 'string' as const, required: false, label: '平台标题', defaultValue: '' },
    title: { type: 'string' as const, required: false, label: '主标题', defaultValue: '' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '' },
    description: { type: 'string' as const, required: false, label: '描述文本', defaultValue: '', editor: 'textarea' as const },
    learnMoreLink: { type: 'string' as const, required: false, label: '了解更多链接', defaultValue: '' },
    learnMoreText: { type: 'string' as const, required: false, label: '了解更多文案', defaultValue: '了解更多' },
    items: {
      type: 'array' as const,
      required: true,
      label: '引擎卡片数组',
      itemType: {
        icon: { type: 'string' as const, required: true, label: '图标', editor: 'image' as const },
        name: { type: 'string' as const, required: true, label: '引擎名称' },
        description: { type: 'string' as const, required: true, label: '引擎描述' },
        href: { type: 'string' as const, required: false, label: '跳转链接' },
      },
      defaultValue: [
        { icon: 'https://placehold.co/120x120/0ea5e9/ffffff?text=E1', name: '引擎一', description: '示例引擎描述文案一。', href: '#' },
        { icon: 'https://placehold.co/120x120/6366f1/ffffff?text=E2', name: '引擎二', description: '示例引擎描述文案二。', href: '#' },
        { icon: 'https://placehold.co/120x120/22c55e/ffffff?text=E3', name: '引擎三', description: '示例引擎描述文案三。', href: '#' },
      ],
    },
    stats: {
      type: 'array' as const,
      required: false,
      label: '统计数据',
      itemType: {
        value: { type: 'string' as const, required: true, label: '数值' },
        label: { type: 'string' as const, required: true, label: '说明' },
      },
      defaultValue: [
        { value: '100+', label: '服务客户' },
        { value: '50+', label: '行业场景' },
      ],
    },
  },
} as const
