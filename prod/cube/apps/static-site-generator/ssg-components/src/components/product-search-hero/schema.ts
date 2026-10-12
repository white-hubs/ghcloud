export const schema = {
  name: 'ProductSearchHero',
  title: '产品搜索头图',
  description: '带搜索框的产品列表页顶部Banner',
  interactive: true,
  props: {
    title: { type: 'string' as const, required: false, label: '标题', defaultValue: '产品搜索' },
    subtitle: { type: 'string' as const, required: false, label: '副标题', defaultValue: '搜索您需要的产品' },
    placeholder: { type: 'string' as const, required: false, label: '搜索框占位符', defaultValue: '请输入关键词搜索' },
    backgroundImage: { type: 'string' as const, required: false, label: '背景图片', editor: 'image' as const, defaultValue: '' },
    searchAllHref: { type: 'string' as const, required: false, label: '搜索全部跳转链接', defaultValue: '#' },
  },
} as const
