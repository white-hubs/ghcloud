export const schema = {
  name: 'AppDetailHero',
  title: '应用详情头部',
  description: '应用详情页顶部信息区，包含图标、名称、描述和咨询/返回按钮',
  interactive: false,
  props: {
    productImage: {
      type: 'string' as const,
      required: true,
      label: '应用图标',
      editor: 'image' as const,
      defaultValue: 'https://placehold.co/200x200/0ea5e9/ffffff?text=App',
    },
    productName: { type: 'string' as const, required: true, label: '应用名称', defaultValue: '示例应用' },
    productDescription: {
      type: 'string' as const,
      required: true,
      label: '应用描述',
      defaultValue: '这是示例应用描述文案，用于设计器预览应用详情头部排版。',
    },
    contactHref: { type: 'string' as const, required: false, label: '咨询链接', defaultValue: '/consultation.html' },
    backHref: { type: 'string' as const, required: false, label: '返回链接', defaultValue: '/apps.html' },
    breadcrumbs: {
      type: 'array' as const,
      required: false,
      label: '面包屑',
      itemType: {
        name: { type: 'string' as const, required: true, label: '名称' },
        href: { type: 'string' as const, required: false, label: '链接' },
      },
      defaultValue: [
        { name: '首页', href: '/' },
        { name: '应用中心', href: '/apps.html' },
        { name: '应用详情' },
      ],
    },
  },
} as const
