export const schema = {
  name: 'ProductDetailHero',
  title: '产品详情头部',
  description: '产品详情页顶部信息区，包含图片、名称、型号、描述和按钮',
  interactive: false,
  props: {
    productImage: {
      type: 'string' as const,
      required: true,
      label: '产品图片',
      editor: 'image' as const,
      defaultValue: 'https://placehold.co/640x480/0ea5e9/ffffff?text=Product',
    },
    productName: { type: 'string' as const, required: true, label: '产品名称', defaultValue: '示例产品名称' },
    productModel: { type: 'string' as const, required: false, label: '产品型号', defaultValue: 'Model-001' },
    productDescription: {
      type: 'string' as const,
      required: true,
      label: '产品描述',
      defaultValue: '这是示例产品描述文案，用于设计器预览产品详情头部排版与视觉效果。',
    },
    tags: {
      type: 'array' as const,
      required: false,
      label: '标签列表',
      itemType: 'string',
      defaultValue: ['标签A', '标签B', '标签C'],
    },
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
        { name: '产品中心', href: '/products.html' },
        { name: '产品详情' },
      ],
    },
    contactHref: { type: 'string' as const, required: false, label: '咨询链接', defaultValue: '/consultation.html' },
    backHref: { type: 'string' as const, required: false, label: '返回链接', defaultValue: '/products.html' },
  },
} as const
