export const schema = {
  name: 'Pagination',
  title: '分页器',
  description: '页码分页组件，支持事件或链接模式',
  interactive: true,
  props: {
    currentPage: { type: 'number' as const, required: true, label: '当前页码', defaultValue: 1 },
    totalPages: { type: 'number' as const, required: true, label: '总页数', defaultValue: 5 },
    mode: { type: 'string' as const, required: false, label: '模式', defaultValue: 'event', editor: 'select' as const, options: [{ label: '事件模式', value: 'event' }, { label: '链接模式', value: 'link' }] },
    pageUrlTemplate: { type: 'string' as const, required: false, label: '分页URL模板', defaultValue: '/news/page/{page}.html' },
    anchor: { type: 'string' as const, required: false, label: '页内锚点', defaultValue: '' },
  },
} as const
