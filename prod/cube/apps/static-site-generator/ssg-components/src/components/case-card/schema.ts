export const schema = {
  name: 'CaseCard',
  title: '案例卡片',
  description: '单个案例卡片组件',
  interactive: false,
  props: {
    image: { type: 'string' as const, required: true, label: '案例图片', editor: 'image' as const, defaultValue: 'https://placehold.co/640x400/0ea5e9/ffffff?text=Case' },
    title: { type: 'string' as const, required: true, label: '案例标题', defaultValue: '示例案例' },
    subtitle: { type: 'string' as const, required: false, label: '案例副标题', defaultValue: '' },
    href: { type: 'string' as const, required: false, label: '链接地址', defaultValue: '#' },
    tags: { type: 'array' as const, required: false, label: '标签数组', itemType: 'string', defaultValue: [] },
  },
} as const
