export const schema = {
  name: 'DerivativeProductGrid',
  title: '衍生产品网格',
  description: '衍生产品卡片网格展示',
  interactive: false,
  props: {
    title: { type: 'string' as const, required: false, label: '区块标题', defaultValue: '衍生产品' },
    products: {
      type: 'array' as const,
      required: true,
      label: '产品列表',
      defaultValue: [
        {
          image: 'https://placehold.co/772x330/0f172a/ffffff?text=Product+1',
          name: '衍生产品一',
          description: '默认产品描述，用于页面设计器预览衍生产品卡片效果。',
          href: '#',
        },
        {
          image: 'https://placehold.co/772x330/334155/ffffff?text=Product+2',
          name: '衍生产品二',
          description: '默认产品描述，用于页面设计器预览衍生产品卡片效果。',
          href: '#',
        },
        {
          image: 'https://placehold.co/772x330/475569/ffffff?text=Product+3',
          name: '衍生产品三',
          description: '默认产品描述，用于页面设计器预览衍生产品卡片效果。',
          href: '#',
        },
      ],
      itemType: {
        image: { type: 'string' as const, required: true, label: '图片', editor: 'image' as const },
        name: { type: 'string' as const, required: true, label: '名称' },
        description: { type: 'string' as const, required: true, label: '描述' },
        href: { type: 'string' as const, required: false, label: '链接' },
      },
    },
  },
} as const
